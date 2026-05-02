import { test, expect } from "@playwright/test";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * PLAYWRIGHT v1.59 — OBSERVABILITY (playwright-cli + browser.bind)
 * ============================================================================
 *
 * WHAT IS IT?
 *   playwright-cli (@playwright/cli) is a SEPARATE npm package that gives you
 *   a terminal-based interface to control and inspect bound Playwright browsers.
 *
 *   Install it:  npm install -D @playwright/cli
 *
 * WHAT ACTUALLY WORKS (tested on v1.59.1 + @playwright/cli v0.1.7):
 * ──────────────────────────────────────────────────────────────────
 *   ✅ npx playwright-cli attach <session>       → Connect to a bound browser
 *   ✅ npx playwright-cli -s <session> snapshot   → Accessibility tree (AI reads this)
 *   ✅ npx playwright-cli -s <session> click      → Remote click
 *   ✅ npx playwright-cli -s <session> fill       → Remote fill
 *   ✅ npx playwright-cli -s <session> press      → Remote keypress
 *   ✅ npx playwright-cli -s <session> screenshot → Remote screenshot
 *   ✅ npx playwright-cli -s <session> show       → Opens DevTools
 *   ❌ npx playwright-cli list                    → Does NOT discover externally bound browsers
 *   ❌ npx playwright-cli show (no -s flag)       → Web dashboard UI NOT available in v0.1.7
 *   ❌ PLAYWRIGHT_DASHBOARD=1                     → No visible effect with current CLI version
 *
 * KEY LEARNING:
 *   The release notes describe a web dashboard (`playwright-cli show`) that lists
 *   all bound browsers. As of @playwright/cli v0.1.7, this specific feature is
 *   NOT yet available. What DOES work is attaching to sessions by name and
 *   controlling them remotely via CLI commands — which is the actual useful part.
 *
 * THIS IS NOT A FEATURE YOU CODE — it's a TOOL you use for debugging/monitoring.
 * These spec tests are just normal tests to practice the TODO app interactions.
 * The observability part comes from HOW you run them (see dashboard-demo.ts).
 *
 * COMPARISON WITH OTHER DEBUGGING TOOLS:
 * ──────────────────────────────────────────────────────────────────
 *   | Tool                           | When to use                         |
 *   |--------------------------------|-------------------------------------|
 *   | --headed                       | Quick look at what the test does    |
 *   | --debug (Playwright Inspector) | Step through test line by line      |
 *   | Trace Viewer                   | Post-mortem — analyze AFTER test    |
 *   | playwright-cli attach + snapshot| Remote inspection WHILE test runs  |
 *   | dashboard-demo.ts              | Hands-on demo of CLI + bind()      |
 *
 * ============================================================================
 */

test.describe("Playwright v1.59 - Observability Dashboard", { tag: ["@UI", "@v1.59"] }, () => {

    /**
     * A standard TODO app test — add items, complete them, filter, edit, clear.
     * Nothing special in the code itself.
     *
     * To make this test "observable" via playwright-cli, you would need to
     * add browser.bind() inside the test (see browser-binding spec for how).
     * Or use the standalone dashboard-demo.ts which handles that for you.
     */
    test("TODO app workflow — add, complete, filter, edit, clear", async ({ page }) => {
        await page.goto(TODO_URL);

        // Step 1: Add multiple items
        const input = page.getByPlaceholder("What needs to be done?");
        const items = [
            "Watch this in the dashboard",
            "Open DevTools from the dashboard",
            "Click into the session to see live updates",
            "Try taking a snapshot from playwright-cli",
        ];

        for (const item of items) {
            await input.fill(item);
            await input.press("Enter");
        }
        await expect(page.getByTestId("todo-title")).toHaveCount(4);

        // Step 2: Complete some items
        await page.locator("li").filter({ hasText: "Watch this in the dashboard" }).getByRole("checkbox").check();
        await page.locator("li").filter({ hasText: "Open DevTools from the dashboard" }).getByRole("checkbox").check();

        // Step 3: Use filters
        await page.getByRole("link", { name: "Active" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        await page.getByRole("link", { name: "Completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        await page.getByRole("link", { name: "All" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(4);

        // Step 4: Edit an item
        const itemToEdit = page.getByTestId("todo-title").filter({ hasText: "Try taking a snapshot from playwright-cli" });
        await itemToEdit.dblclick();
        const editInput = page.getByTestId("todo-item")
            .filter({ hasText: "Try taking a snapshot from playwright-cli" })
            .getByRole("textbox");
        await editInput.fill("Snapshot taken successfully!");
        await editInput.press("Enter");

        // Step 5: Clear completed
        await page.getByRole("button", { name: "Clear completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);
    });

    /**
     * A second test — add items and delete them.
     * Demonstrates hover + delete interaction pattern.
     */
    test("Add and delete items", async ({ page }) => {
        await page.goto(TODO_URL);

        const input = page.getByPlaceholder("What needs to be done?");

        // Add 5 items
        for (let i = 1; i <= 5; i++) {
            await input.fill(`Observable item ${i}`);
            await input.press("Enter");
        }
        await expect(page.getByTestId("todo-title")).toHaveCount(5);

        // Delete items one by one (hover + click delete)
        for (let i = 0; i < 3; i++) {
            const firstItem = page.locator("li").first();
            await firstItem.hover();
            await firstItem.getByRole("button", { name: "Delete" }).click();
        }
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // Mark all remaining as complete
        await page.getByLabel("Mark all as complete").check();
        const checkboxes = page.getByRole("checkbox", { name: "Toggle Todo" });
        for (const cb of await checkboxes.all()) {
            await expect(cb).toBeChecked();
        }
    });
});

// PERSONAL NOTES:
// ─────────────────────────────────────────────────────────────────
// - The "Observability Dashboard" web UI from the release notes is NOT yet
//   available in @playwright/cli v0.1.7. The `list` and `show` commands
//   don't work as described in the release notes.
//
// - What DOES work is `attach`, `snapshot`, `click`, `fill`, `press`,
//   `screenshot` — all controlled remotely from another terminal.
//
// - This feature is built for the AI/agent ecosystem. An AI agent can
//   use playwright-cli to "see" (snapshot) and "interact" (click/fill)
//   with a browser that was set up by a different script.
//
// - For traditional QA, the most practical use is debugging:
//   → Run a test, bind the browser, attach from another terminal,
//     take snapshots and inspect while the test is running.
//
// - The `snapshot` command returns an accessibility tree — this is the
//   TEXT representation of the page that AI agents use to understand
//   what's on screen (instead of looking at pixels like humans do).
