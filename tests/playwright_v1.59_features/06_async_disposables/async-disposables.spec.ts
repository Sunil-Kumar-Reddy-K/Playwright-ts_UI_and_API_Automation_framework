/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "@playwright/test";

/**
 * ============================================================================
 * TOPIC: Async Disposables — await using (v1.59)
 * ============================================================================
 *
 * WHAT YOU'LL LEARN:
 * - What "await using" is and the problem it solves
 * - How automatic cleanup works vs manual .dispose()
 * - Practical examples with routes, init scripts, and exposed functions
 *
 * OFFICIAL DOCS: https://playwright.dev/docs/api/class-disposable
 *
 * BACKGROUND:
 *   Before v1.59: You added a route with page.route() and removed it
 *   with page.unroute(). But init scripts had NO removal API at all.
 *   If you forgot cleanup, mocks leaked into other tests.
 *
 *   After v1.59: These APIs return a "Disposable" object.
 *   Option A: Call .dispose() manually when you want to remove it.
 *   Option B: Use "await using" and JavaScript auto-cleans when the block ends.
 *
 *   "await using" is like Python's "with" or C#'s "using" — guaranteed cleanup.
 *
 * APIS THAT RETURN DISPOSABLE (v1.59):
 *   - page.route()                  → dispose removes the route
 *   - page.addInitScript()          → dispose removes the init script
 *   - page.exposeFunction()         → dispose removes the exposed function
 *   - page.exposeBinding()          → dispose removes the exposed binding
 *   - browserContext.route()         → dispose removes context-level route
 *   - browserContext.addInitScript() → dispose removes context-level script
 *   - screencast.showActions()      → dispose stops action annotations
 *
 * PRE-REQUISITES:
 * - Node.js v22+ (you have v24.11.1)
 * - TypeScript target: ESNext (your tsconfig.json)
 * ============================================================================
 */

test.describe("Playwright v1.59 - Async Disposables (await using)", { tag: ["@UI", "@v1.59", "@learn"] }, () => {

    /**
     * TEST 1: Manual .dispose() — The Foundation
     * ────────────────────────────────────────────
     * LEARN: Before learning "await using", understand what .dispose() does.
     *        page.route() now returns a Disposable — calling .dispose() removes the route.
     *        This replaces page.unroute().
     */
    test("Concept 1: Manual dispose — route setup and teardown", async ({ page }) => {
        // LEARN: page.route() now returns a Disposable object (new in v1.59)
        let interceptCount = 0;

        const routeDisposable = await page.route("https://demo.playwright.dev/**", (route) => {
            interceptCount++;
            void route.continue();
        });

        // Navigate — route IS active
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        expect(interceptCount).toBeGreaterThan(0);
        const countAfterFirstNav = interceptCount;

        // LEARN: Dispose the route — this is the NEW way to remove it
        // Before v1.59 you'd use: await page.unroute("pattern")
        // Now you just: await routeDisposable.dispose()
        await routeDisposable.dispose();

        // Navigate again — route is GONE, interceptCount should NOT increase
        interceptCount = 0;
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        expect(interceptCount).toBe(0);

        // VERIFY: Page still works fine after route removal
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Route was disposed cleanly");
        await input.press("Enter");
        await expect(page.getByTestId("todo-title")).toHaveCount(1);

        console.log(`First nav intercepted ${countAfterFirstNav} requests, second nav intercepted 0`);
    });

    /**
     * TEST 2: "await using" — Automatic Cleanup
     * ───────────────────────────────────────────
     * LEARN: "await using" does the same as .dispose() but AUTOMATICALLY.
     *        When the variable goes out of scope (block ends), dispose is called for you.
     *
     * WHY: You can't forget cleanup. Even if an error is thrown, cleanup happens.
     */
    test("Concept 2: await using — automatic cleanup with block scope", async ({ page }) => {
        let interceptCount = 0;

        // LEARN: The { } block defines the LIFETIME of the route
        {
            // "await using" = create the route AND register auto-cleanup
            await using _route = await page.route("https://demo.playwright.dev/**", (route) => {
                interceptCount++;
                void route.continue();
            });

            // Inside the block: route is ACTIVE
            await page.goto("https://demo.playwright.dev/todomvc/#/");
            expect(interceptCount).toBeGreaterThan(0);
        }
        // ↑ Block ended → _route.dispose() was called AUTOMATICALLY
        //   You didn't write any cleanup code — JavaScript did it for you

        // Outside the block: route is GONE
        interceptCount = 0;
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        expect(interceptCount).toBe(0);
    });

    /**
     * TEST 3: Init Script Disposal — Previously Impossible!
     * ──────────────────────────────────────────────────────
     * LEARN: Before v1.59, once you added an init script, there was NO way
     *        to remove it. Now addInitScript() returns a Disposable.
     *
     * NOTE: Init scripts run on every page navigation. After disposal,
     *       the next navigation will NOT run the script.
     */
    test("Concept 3: Init script disposal — finally possible", async ({ page }) => {
        // LEARN: addInitScript runs this JS BEFORE any page script, on every navigation
        const scriptDisposable = await page.addInitScript(() => {
            (window as Record<string, unknown>).__INJECTED_FLAG = "hello from init script";
        });

        // Navigate — init script runs, sets the flag
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        const flag1 = await page.evaluate(() => (window as Record<string, unknown>).__INJECTED_FLAG);
        expect(flag1).toBe("hello from init script");

        // LEARN: Remove the init script — this was IMPOSSIBLE before v1.59!
        await scriptDisposable.dispose();

        // Navigate again — init script is gone, flag won't be set
        await page.goto("about:blank");
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        const flag2 = await page.evaluate(() => (window as Record<string, unknown>).__INJECTED_FLAG);
        expect(flag2).toBeUndefined();

        console.log("Init script was active, then disposed — previously impossible!");
    });

    /**
     * TEST 4: Multiple "await using" in One Block
     * ─────────────────────────────────────────────
     * LEARN: Stack multiple disposables. ALL get cleaned up when the block ends.
     *        Cleanup order: REVERSE (last declared = first disposed).
     *
     * This is the pattern from the release notes:
     *   {
     *     await using route = await page.route(...)
     *     await using script = await page.addInitScript(...)
     *     // do stuff
     *   }
     *   // both removed here
     */
    test("Concept 4: Stacking multiple await using in one block", async ({ page }) => {
        let routeHits = 0;

        {
            // Disposable 1: Route
            await using _route = await page.route("https://demo.playwright.dev/**", (route) => {
                routeHits++;
                void route.continue();
            });

            // Disposable 2: Init script
            await using _script = await page.addInitScript(() => {
                (window as Record<string, unknown>).__STACKED_FLAG = true;
            });

            // Both active — navigate
            await page.goto("https://demo.playwright.dev/todomvc/#/");

            // Verify both are working
            expect(routeHits).toBeGreaterThan(0);
            const flag = await page.evaluate(() => (window as Record<string, unknown>).__STACKED_FLAG);
            expect(flag).toBe(true);
        }
        // ↑ Block ended → BOTH disposed automatically
        //   Order: _script disposed first, then _route (reverse declaration order)

        // Verify both are gone
        routeHits = 0;
        await page.goto("about:blank");
        await page.goto("https://demo.playwright.dev/todomvc/#/");

        expect(routeHits).toBe(0);
        const flagAfter = await page.evaluate(() => (window as Record<string, unknown>).__STACKED_FLAG);
        expect(flagAfter).toBeUndefined();
    });

    /**
     * TEST 5: Exposed Functions — dispose() removes them
     * ────────────────────────────────────────────────────
     * LEARN: page.exposeFunction() also returns a Disposable now.
     *        This lets you inject a Node.js function into the browser
     *        and REMOVE it later.
     *
     * WHAT IS exposeFunction?
     *   It creates a function in the browser's window object that,
     *   when called, executes your Node.js code. Like a bridge between
     *   browser JS and Node.js.
     */
    test("Concept 5: Exposed function with dispose", async ({ page }) => {
        // Expose a Node.js function to the browser
        const fnDisposable = await page.exposeFunction("myNodeFunction", (a: number, b: number) => {
            return a + b;
        });

        await page.goto("https://demo.playwright.dev/todomvc/#/");

        // Call it from the browser context
        const result = await page.evaluate(async () => {
            return await (window as Record<string, CallableFunction>).myNodeFunction(3, 7);
        });
        expect(result).toBe(10);

        // LEARN: Dispose removes the function from the browser
        await fnDisposable.dispose();

        // After dispose, the function is gone from window
        await page.goto("about:blank");
        await page.goto("https://demo.playwright.dev/todomvc/#/");
        const fnExists = await page.evaluate(() => {
            return typeof (window as Record<string, unknown>).myNodeFunction;
        });
        expect(fnExists).toBe("undefined");
    });
});

// PERSONAL NOTES:
// ─────────────────────────────────────────────────────────────────
//
// TWO WAYS TO USE DISPOSABLES:
//
//   // Way 1: Manual — you control when cleanup happens
//   const d = await page.route("pattern", handler);
//   // ... do stuff ...
//   await d.dispose();  // cleanup NOW
//
//   // Way 2: Automatic — block scope handles cleanup
//   {
//     await using d = await page.route("pattern", handler);
//     // ... do stuff ...
//   }  // cleanup happens HERE automatically
//
// KEY INSIGHT:
//   "await using" is syntactic sugar for try/finally + dispose().
//   It guarantees cleanup even if an exception is thrown.
//   This is the #1 reason to prefer it over manual dispose().
//
// GOTCHA:
//   Init scripts run on page LOAD. To verify an init script was
//   disposed, you need to navigate to a fresh page (about:blank
//   then back) — the old page still has the script's effects in memory.
//
// WHEN TO USE:
//   - Route mocking for one section of a test → await using
//   - Temporary init scripts → await using
//   - Exposed functions for a specific test phase → await using
//   - Need precise timing of cleanup → manual .dispose()