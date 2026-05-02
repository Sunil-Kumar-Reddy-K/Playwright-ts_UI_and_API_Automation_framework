import { test, expect } from "@playwright/test";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * TOPIC: CLI Debugger for Agents (--debug=cli)
 * ============================================================================
 *
 * WHAT YOU'LL LEARN:
 * - The difference between --debug (Inspector GUI) and --debug=cli (terminal-based)
 * - How to step through tests from the terminal using playwright-cli
 * - How AI agents use this to debug and fix failing tests automatically
 * - All the CLI debugger commands: step-over, snapshot, resume, etc.
 *
 * OFFICIAL DOCS: https://playwright.dev/docs/debug
 * RELEASE NOTES: https://playwright.dev/docs/release-notes#version-159
 *
 * PRE-REQUISITES:
 * - npm install -D @playwright/cli
 *
 * ============================================================================
 * HOW --debug=cli DIFFERS FROM --debug (Inspector):
 * ============================================================================
 *
 * --debug (or --debug=inspector):
 *   → Opens the Playwright Inspector GUI window
 *   → You click "Step Over", "Resume" buttons visually
 *   → Good for HUMANS — visual, point-and-click
 *   → You've probably used this before
 *
 * --debug=cli:
 *   → NO GUI opens — everything happens in the TERMINAL
 *   → The test PAUSES and prints a session ID
 *   → You (or an AI agent) attach via: npx playwright-cli attach <session-id>
 *   → Then step through using terminal commands: step-over, resume, snapshot
 *   → Good for AI AGENTS — text-based, scriptable, no GUI needed
 *
 * WHY THIS EXISTS:
 *   AI coding agents (Claude, Cursor, Copilot) can't click GUI buttons.
 *   They need a TEXT interface to debug tests. --debug=cli gives them that.
 *   The agent can:
 *     1. Run a failing test with --debug=cli
 *     2. Attach to the session
 *     3. Step through each action
 *     4. Take snapshots to "see" the page state
 *     5. Identify what went wrong
 *     6. Fix the test code
 *     7. Resume to verify the fix works
 *
 * ============================================================================
 * HOW TO USE THESE TESTS WITH --debug=cli:
 * ============================================================================
 *
 * Terminal 1 — Start a test in CLI debug mode:
 *   npx playwright test tests/playwright_v1.59_features/04_cli_debugger/cli-debugger.spec.ts -g "Basic TODO" --debug=cli --project=chromium
 *
 * You'll see output like:
 *   ### Debugging Instructions
 *   - Run "playwright-cli attach tw-a1b2c3" to attach to this test
 *
 * Terminal 2 — Attach and debug:
 *   npx playwright-cli attach tw-a1b2c3
 *
 * Then use these commands:
 * ┌────────────────────────────────────────────────────────────────┐
 * │  COMMAND                                      │ WHAT IT DOES  │
 * ├────────────────────────────────────────────────┤───────────────│
 * │  npx playwright-cli -s <id> step-over         │ Execute next  │
 * │                                                │ test action   │
 * │  npx playwright-cli -s <id> resume            │ Run until     │
 * │                                                │ next pause    │
 * │  npx playwright-cli -s <id> snapshot          │ See page as   │
 * │                                                │ text (a11y)   │
 * │  npx playwright-cli -s <id> screenshot        │ Save a        │
 * │                                                │ screenshot    │
 * │  npx playwright-cli -s <id> pause-at <loc>    │ Run to a      │
 * │                                                │ specific line │
 * └────────────────────────────────────────────────┴───────────────┘
 *
 * ============================================================================
 */

test.describe("Playwright v1.59 - CLI Debugger for Agents", { tag: ["@UI", "@v1.59", "@learn"] }, () => {

    /**
     * TEST 1: Basic TODO Workflow
     * ---------------------------
     * LEARN: Start with a simple test to practice CLI debugging.
     *
     * Run this test with:
     *   npx playwright test tests/playwright_v1.59_features/04_cli_debugger/cli-debugger.spec.ts -g "Basic TODO" --debug=cli --project=chromium
     *
     * WHY: This is your "hello world" for CLI debugging.
     *      Each action (goto, fill, press, check) becomes a step you can
     *      step-over in the terminal. After each step-over, the CLI shows
     *      the current page URL, title, and what action is coming next.
     */
    test("Basic TODO workflow — step through each action", async ({ page }) => {
        // Step 1: Navigate to TODO app
        // In CLI debugger: this will be the first paused action
        // After step-over, you'll see: Page URL: https://demo.playwright.dev/todomvc/#/
        await page.goto(TODO_URL);

        // Step 2: Add a TODO item
        // In CLI debugger: step-over will execute the fill, then pause before press
        // Use "snapshot" here to see the input field with text in it
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Learn CLI debugger");
        await input.press("Enter");

        // Step 3: Add another item
        await input.fill("Practice step-over command");
        await input.press("Enter");

        // Step 4: Verify items were added
        // In CLI debugger: step-over on an expect shows assertion result
        // Output will show: Expect "toHaveCount" at cli-debugger.spec.ts:<line>
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // Step 5: Complete an item
        // In CLI debugger: you'll see the checkbox interaction
        await page.locator("li").filter({ hasText: "Learn CLI debugger" }).getByRole("checkbox").check();
        await expect(page.locator("li").filter({ hasText: "Learn CLI debugger" })).toHaveClass(/completed/);
    });

    /**
     * TEST 2: Multi-Step Workflow with Filters
     * -----------------------------------------
     * LEARN: A longer test with more actions to practice stepping through.
     *
     * TIP: You don't have to step-over EVERY action. Use these shortcuts:
     *   - "resume"    → Runs to the end (or next page.pause() if any)
     *   - "pause-at cli-debugger.spec.ts:150" → Runs to a specific line and pauses
     *
     * WHY: In real debugging, you don't step through every line.
     *      You jump to the part that's failing.
     */
    test("Multi-step workflow — practice resume and pause-at", async ({ page }) => {
        await page.goto(TODO_URL);

        // Add items
        const input = page.getByPlaceholder("What needs to be done?");
        const items = ["Buy groceries", "Read Playwright docs", "Write tests", "Review PR"];
        for (const item of items) {
            await input.fill(item);
            await input.press("Enter");
        }
        await expect(page.getByTestId("todo-title")).toHaveCount(4);

        // Complete some items
        await page.locator("li").filter({ hasText: "Buy groceries" }).getByRole("checkbox").check();
        await page.locator("li").filter({ hasText: "Write tests" }).getByRole("checkbox").check();

        // TIP: Try running "pause-at" to jump to the filter section below
        //      instead of stepping through every check() above

        // Filter: Active items only
        await page.getByRole("link", { name: "Active" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // TIP: Take a "snapshot" here to see the accessibility tree
        //      You'll see only the 2 active items listed

        // Filter: Completed items only
        await page.getByRole("link", { name: "Completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // Filter: All items
        await page.getByRole("link", { name: "All" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(4);

        // Edit an item (double-click to edit)
        const itemToEdit = page.getByTestId("todo-title").filter({ hasText: "Review PR" });
        await itemToEdit.dblclick();
        const editInput = page.getByTestId("todo-item")
            .filter({ hasText: "Review PR" })
            .getByRole("textbox");
        await editInput.fill("Review PR — DONE");
        await editInput.press("Enter");

        // Clear completed
        await page.getByRole("button", { name: "Clear completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);
    });

    /**
     * TEST 3: Intentionally Failing Test — Debug It!
     * ------------------------------------------------
     * LEARN: This test has an intentional bug. Use --debug=cli to find it.
     *
     * WHY: This is exactly how an AI agent would use CLI debugger:
     *   1. Test fails in CI
     *   2. Agent re-runs with --debug=cli
     *   3. Agent steps through, takes snapshots
     *   4. Agent identifies the failing assertion
     *   5. Agent reads the snapshot to see actual page state
     *   6. Agent fixes the code
     *
     * EXERCISE: Run this test with --debug=cli and step through.
     *           At the failing assertion, use "snapshot" to see what's actually on the page.
     *           Can you identify why the count assertion is wrong?
     *
     * Run:
     *   npx playwright test tests/playwright_v1.59_features/04_cli_debugger/cli-debugger.spec.ts -g "Intentionally Failing" --debug=cli --project=chromium
     */
    test("Intentionally Failing Test — find the bug with CLI debugger", async ({ page }) => {
        await page.goto(TODO_URL);

        const input = page.getByPlaceholder("What needs to be done?");

        // Add 3 items
        await input.fill("Item one");
        await input.press("Enter");
        await input.fill("Item two");
        await input.press("Enter");
        await input.fill("Item three");
        await input.press("Enter");

        // Complete item one
        await page.locator("li").filter({ hasText: "Item one" }).getByRole("checkbox").check();

        // Click "Active" filter — only shows incomplete items
        await page.getByRole("link", { name: "Active" }).click();

        // BUG: We expect 3 items, but we're on "Active" filter!
        // Only 2 incomplete items are visible (Item two, Item three)
        // An AI agent stepping through would:
        //   1. step-over to this assertion
        //   2. See it fail
        //   3. Run "snapshot" to see only 2 items listed
        //   4. Realize the filter is hiding the completed item
        //   5. Fix: change toHaveCount(3) → toHaveCount(2)
        await expect(page.getByTestId("todo-title")).toHaveCount(2);
    });

    /**
     * TEST 4: Using page.pause() as Breakpoints
     * -------------------------------------------
     * LEARN: You can insert page.pause() anywhere in your test code.
     *        In --debug=cli mode, the test runs until it hits page.pause(),
     *        then stops and waits for you to attach and inspect.
     *
     * WHY: Instead of stepping through from the very start, you can
     *      strategically place pause() at the exact point you want to debug.
     *      This is the CLI equivalent of setting a breakpoint in VS Code.
     *
     * NOTE: page.pause() works in BOTH debug modes:
     *   --debug           → Pauses in the Inspector GUI
     *   --debug=cli       → Pauses and waits for CLI commands
     *   Without --debug   → page.pause() is IGNORED (test runs normally)
     *
     * Run:
     *   npx playwright test tests/playwright_v1.59_features/04_cli_debugger/cli-debugger.spec.ts -g "page.pause" --debug=cli --project=chromium
     */
    test("Using page.pause() as CLI breakpoints", async ({ page }) => {
        await page.goto(TODO_URL);

        // Add items — these run without stopping
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("First item");
        await input.press("Enter");
        await input.fill("Second item");
        await input.press("Enter");
        await input.fill("Third item");
        await input.press("Enter");

        // BREAKPOINT: Test pauses here in --debug=cli mode
        // Attach and run "snapshot" to see the 3 items before we modify them
        await page.pause();

        // After you "resume" from the pause, these actions execute
        await page.locator("li").filter({ hasText: "First item" }).getByRole("checkbox").check();
        await page.locator("li").filter({ hasText: "Second item" }).getByRole("checkbox").check();

        // BREAKPOINT: Pause again to inspect after checking items
        // Run "snapshot" here — you'll see checked items have different aria state
        await page.pause();

        // Clear completed items
        await page.getByRole("button", { name: "Clear completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(1);
        await expect(page.getByTestId("todo-title")).toHaveText(["Third item"]);
    });
});

// PERSONAL NOTES:
// ─────────────────────────────────────────────────────────────────
// COMPARISON: --debug vs --debug=cli
// ┌──────────────────────┬──────────────────────────────────────────┐
// │ --debug (Inspector)   │ --debug=cli (Terminal)                   │
// ├──────────────────────┼──────────────────────────────────────────┤
// │ Opens GUI window      │ No GUI — text-only in terminal           │
// │ Click buttons to step │ Type commands to step                    │
// │ Visual locator picker │ Use "snapshot" to see page as text       │
// │ For HUMANS            │ For AI AGENTS (and humans who like CLI)  │
// │ Can't be scripted     │ Fully scriptable — perfect for agents    │
// └──────────────────────┴──────────────────────────────────────────┘
//
// BOTH modes automatically set:
//   --timeout=0         (no timeout — test waits forever for you)
//   --max-failures=1    (stop after first failure)
//   --headed            (browser is visible)
//   --workers=1         (single worker — sequential execution)
//
// KEY COMMANDS for --debug=cli:
//   attach <session-id>     → Connect to the paused test
//   -s <id> step-over       → Execute next action, pause again
//   -s <id> resume          → Run until end or next page.pause()
//   -s <id> snapshot        → Accessibility tree of current page
//   -s <id> screenshot      → Save screenshot
//   -s <id> pause-at <loc>  → Run to a specific file:line and pause
//
// PRACTICAL USE FOR QA:
// - Run a flaky test with --debug=cli to step through and find timing issues
// - Add page.pause() before a failing assertion to inspect page state
// - Take snapshots at key points to compare expected vs actual DOM state
//
// FOR AI AGENTS:
// - This is the primary way AI agents debug Playwright tests
// - Agent runs test → reads error → re-runs with --debug=cli
// - Steps through, takes snapshots, identifies the issue
// - Fixes the code and re-runs without --debug to verify
