import { test, expect } from "@playwright/test";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * TOPIC: CLI Trace Analysis for Agents (npx playwright trace)
 * ============================================================================
 *
 * WHAT YOU'LL LEARN:
 * - How Playwright traces work and when they're recorded
 * - How to analyze traces from the TERMINAL (new in v1.59) instead of the GUI
 * - All trace CLI subcommands: open, actions, action, snapshot, requests, errors
 * - How AI agents use this to debug failing tests without a GUI
 *
 * OFFICIAL DOCS: https://playwright.dev/docs/trace-viewer
 * RELEASE NOTES: https://playwright.dev/docs/release-notes#version-159
 *
 * ============================================================================
 * BACKGROUND: What is a Trace?
 * ============================================================================
 *
 * A trace is a ZIP file that records EVERYTHING that happened during a test:
 *   - Every action (click, fill, goto, etc.) with timing
 *   - DOM snapshots BEFORE and AFTER each action
 *   - Screenshots at each step
 *   - Network requests and responses
 *   - Console messages and errors
 *
 * Think of it as a "flight recorder" — after a crash (failed test), you
 * open the black box (trace file) to understand what went wrong.
 *
 * BEFORE v1.59: You could only analyze traces in the GUI (Trace Viewer).
 *   → npx playwright show-trace trace.zip  → opens a browser GUI
 *
 * NEW in v1.59: You can analyze traces from the TERMINAL.
 *   → npx playwright trace open trace.zip  → loads trace in memory
 *   → npx playwright trace actions          → lists all actions as text
 *   → npx playwright trace snapshot 5       → shows DOM at action #5
 *   This is HUGE for AI agents — they can read text, not click GUIs.
 *
 * ============================================================================
 * HOW TO USE THIS SPEC FILE:
 * ============================================================================
 *
 * STEP 1: Run these tests WITH tracing enabled to generate trace files:
 *
 *   npx playwright test tests/playwright_v1.59_features/05_cli_trace_analysis/cli-trace-analysis.spec.ts --trace on --project=chromium
 *
 * STEP 2: Find the trace files in test-results/:
 *
 *   ls test-results/
 *   (look for folders like: cli-trace-analysis-Passing-TO-chromium/trace.zip)
 *
 * STEP 3: Analyze using the CLI commands listed in each test's comments.
 *
 * ============================================================================
 * FULL COMMAND REFERENCE:
 * ============================================================================
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ COMMAND                              │ WHAT IT DOES                     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ npx playwright trace open <zip>      │ Load a trace file for analysis   │
 * │ npx playwright trace actions         │ List ALL actions with timing     │
 * │ npx playwright trace actions --grep  │ Filter actions by name/pattern   │
 * │ npx playwright trace actions --errors-only │ Show only failed actions   │
 * │ npx playwright trace action <id>     │ Details of a specific action     │
 * │ npx playwright trace snapshot <id>   │ DOM snapshot at action (text)    │
 * │ npx playwright trace snapshot <id> --name before │ DOM BEFORE action    │
 * │ npx playwright trace snapshot <id> --name after  │ DOM AFTER action     │
 * │ npx playwright trace screenshot <id> │ Save screenshot at that action   │
 * │ npx playwright trace requests        │ List all network requests        │
 * │ npx playwright trace requests --failed │ Show only failed requests      │
 * │ npx playwright trace request <id>    │ Details of a specific request    │
 * │ npx playwright trace console         │ Show console messages            │
 * │ npx playwright trace errors          │ Show errors with stack traces    │
 * │ npx playwright trace attachments     │ List trace attachments           │
 * │ npx playwright trace close           │ Remove extracted trace data      │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ============================================================================
 */

test.describe("Playwright v1.59 - CLI Trace Analysis", { tag: ["@UI", "@v1.59", "@learn"] }, () => {

    /**
     * TEST 1: Passing TODO Workflow
     * ─────────────────────────────
     * LEARN: A clean passing test. Generate its trace to practice CLI analysis.
     *
     * WHY: Start with a passing trace to learn the commands without error noise.
     *
     * After running with --trace on, try:
     *   npx playwright trace open test-results/cli-trace-analysis-Passing-TO-chromium/trace.zip
     *   npx playwright trace actions
     *   npx playwright trace action 1
     *   npx playwright trace snapshot 1 --name after
     *   npx playwright trace close
     */
    test("Passing TODO workflow — analyze a clean trace", async ({ page }) => {
        // Action 1: Navigate
        await page.goto(TODO_URL);

        // Action 2-7: Add 3 items (fill + press each)
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Buy groceries");
        await input.press("Enter");
        await input.fill("Read documentation");
        await input.press("Enter");
        await input.fill("Write tests");
        await input.press("Enter");

        // Action 8: Assertion
        await expect(page.getByTestId("todo-title")).toHaveCount(3);

        // Action 9-10: Check items
        await page.locator("li").filter({ hasText: "Buy groceries" }).getByRole("checkbox").check();

        // Action 11: Filter
        await page.getByRole("link", { name: "Active" }).click();

        // Action 12: Assertion
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // Action 13: Back to All
        await page.getByRole("link", { name: "All" }).click();

        // Action 14: Assertion
        await expect(page.getByTestId("todo-title")).toHaveCount(3);
    });

    /**
     * TEST 2: Trace with Network Requests
     * ─────────────────────────────────────
     * LEARN: This test navigates to a real site that makes API calls.
     *        The trace captures ALL network requests — useful for debugging
     *        API failures or slow-loading resources.
     *
     * After running with --trace on, try:
     *   npx playwright trace open test-results/<folder>/trace.zip
     *   npx playwright trace requests
     *   npx playwright trace requests --grep "api"
     *   npx playwright trace requests --failed
     *   npx playwright trace close
     */
    test("Trace with network requests — inspect API calls", async ({ page }) => {
        // Navigate to a site that makes network requests
        await page.goto("https://playwright.dev/");

        // LEARN: The trace captures every network request made by the browser:
        //   - HTML documents, JS/CSS files, images
        //   - API calls (fetch, XHR)
        //   - Failed requests (404, 500, etc.)
        // Use "npx playwright trace requests" to list them all

        await expect(page).toHaveTitle(/Playwright/);

        // Navigate to docs — triggers more network requests
        await page.getByRole("link", { name: "Docs" }).click();
        await expect(page).toHaveURL(/.*docs.*/);
    });

    /**
     * TEST 3: Trace with Console Messages
     * ─────────────────────────────────────
     * LEARN: The trace captures console.log, console.warn, console.error
     *        from the browser. Useful for debugging JavaScript errors on the page.
     *
     * After running with --trace on, try:
     *   npx playwright trace open test-results/<folder>/trace.zip
     *   npx playwright trace console
     *   npx playwright trace errors
     *   npx playwright trace close
     */
    test("Trace with console output — debug browser JS errors", async ({ page }) => {
        await page.goto(TODO_URL);

        // Inject a console message that the trace will capture
        await page.evaluate(() => {
            console.log("Test log message: TODO app loaded");
            console.warn("Test warning: This is a demo warning");
        });

        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Check console in trace");
        await input.press("Enter");

        // Inject an error
        await page.evaluate(() => {
            console.error("Test error: Simulated error for trace analysis");
        });

        await expect(page.getByTestId("todo-title")).toHaveCount(1);

        // LEARN: After running, use these trace commands:
        //   "npx playwright trace console" → shows all 3 messages (log, warn, error)
        //   "npx playwright trace errors"  → shows only the error with stack trace
        //
        // In real debugging, "errors" is your go-to command when a test fails
        // due to a JavaScript error on the page (not a Playwright assertion error)
    });

    /**
     * TEST 4: Snapshots — Before vs After
     * ─────────────────────────────────────
     * LEARN: The most powerful trace feature — DOM snapshots.
     *        Each action has a BEFORE and AFTER snapshot.
     *        This lets you see the exact page state at any point in the test.
     *
     * WHY: When a test fails on an assertion, you need to see what the page
     *      actually looked like. Snapshots give you the DOM as text —
     *      perfect for AI agents who can't look at screenshots.
     *
     * After running with --trace on, try:
     *   npx playwright trace open test-results/<folder>/trace.zip
     *   npx playwright trace actions
     *   (find the action number for "check" — let's say it's #8)
     *   npx playwright trace snapshot 8 --name before
     *   npx playwright trace snapshot 8 --name after
     *   (compare: BEFORE = unchecked item, AFTER = checked item)
     *   npx playwright trace close
     *
     * TIP: --name before shows DOM just before the action executed
     *      --name after shows DOM just after the action completed
     *      This is like "git diff" but for the DOM!
     */
    test("Snapshots — compare DOM before and after actions", async ({ page }) => {
        await page.goto(TODO_URL);

        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Item to check");
        await input.press("Enter");
        await input.fill("Item to leave active");
        await input.press("Enter");
        await input.fill("Item to delete");
        await input.press("Enter");

        // SNAPSHOT POINT: Before checking, all 3 items are unchecked
        // After checking, "Item to check" has class="completed"
        // Compare with: snapshot <id> --name before vs --name after
        await page.locator("li").filter({ hasText: "Item to check" }).getByRole("checkbox").check();

        // SNAPSHOT POINT: Before delete, 3 items visible
        // After delete, only 2 items remain
        const itemToDelete = page.locator("li").filter({ hasText: "Item to delete" });
        await itemToDelete.hover();
        await itemToDelete.getByRole("button", { name: "Delete" }).click();

        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // SNAPSHOT POINT: Before filter, all items visible
        // After filter, only active items visible
        await page.getByRole("link", { name: "Active" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(1);
        await expect(page.getByTestId("todo-title")).toHaveText(["Item to leave active"]);
    });

    /**
     * TEST 5: The --grep and --errors-only Filters
     * ──────────────────────────────────────────────
     * LEARN: Real traces can have 50+ actions. You don't want to scroll
     *        through all of them. Use --grep and --errors-only to filter.
     *
     * After running with --trace on, try:
     *   npx playwright trace open test-results/<folder>/trace.zip
     *
     *   # Show only assertions:
     *   npx playwright trace actions --grep "expect"
     *
     *   # Show only click actions:
     *   npx playwright trace actions --grep "click"
     *
     *   # Show only fill actions:
     *   npx playwright trace actions --grep "fill"
     *
     *   # Show only failed actions (if any):
     *   npx playwright trace actions --errors-only
     *
     *   npx playwright trace close
     *
     * TIP: In real debugging, the workflow is:
     *   1. "actions --errors-only" → find the failing action
     *   2. "action <id>" → see error details
     *   3. "snapshot <id> --name before" → see page state when it failed
     *   4. Fix the test → re-run
     */
    test("Filtering actions — grep and errors-only", async ({ page }) => {
        await page.goto(TODO_URL);

        // Multiple fill + press actions
        const input = page.getByPlaceholder("What needs to be done?");
        const items = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
        for (const item of items) {
            await input.fill(item);
            await input.press("Enter");
        }

        // Multiple check actions
        await page.locator("li").filter({ hasText: "Alpha" }).getByRole("checkbox").check();
        await page.locator("li").filter({ hasText: "Gamma" }).getByRole("checkbox").check();

        // Multiple click actions (filters)
        await page.getByRole("link", { name: "Active" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(3);

        await page.getByRole("link", { name: "Completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        await page.getByRole("link", { name: "All" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(5);

        // Edit action
        const itemToEdit = page.getByTestId("todo-title").filter({ hasText: "Beta" });
        await itemToEdit.dblclick();
        const editInput = page.getByTestId("todo-item")
            .filter({ hasText: "Beta" })
            .getByRole("textbox");
        await editInput.fill("Beta — Updated");
        await editInput.press("Enter");

        // Delete action
        const itemToDelete = page.locator("li").filter({ hasText: "Epsilon" });
        await itemToDelete.hover();
        await itemToDelete.getByRole("button", { name: "Delete" }).click();

        // Clear completed
        await page.getByRole("button", { name: "Clear completed" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // LEARN: This test has ~25+ actions in the trace.
        // Without --grep, the action list is overwhelming.
        // With --grep "expect", you see only the 4 assertions.
        // With --grep "click", you see only click actions.
        // This is how AI agents quickly narrow down to the failing part.
    });
});

// PERSONAL NOTES:
// ─────────────────────────────────────────────────────────────────
//
// COMPARISON: GUI Trace Viewer vs CLI Trace Analysis
// ┌───────────────────────┬───────────────────────────────────────┐
// │ GUI (show-trace)       │ CLI (npx playwright trace)           │
// ├───────────────────────┼───────────────────────────────────────┤
// │ Opens browser window   │ Text output in terminal              │
// │ Visual screenshots     │ DOM snapshots as accessibility text  │
// │ Click to navigate      │ Type commands to navigate            │
// │ For HUMANS             │ For AI AGENTS (and CLI lovers)       │
// │ Existing (pre-v1.59)   │ NEW in v1.59                         │
// └───────────────────────┴───────────────────────────────────────┘
//
// TRACE MODES in playwright.config.ts:
//   "off"                          → No traces recorded
//   "on"                           → Always record (heavy — don't use in CI)
//   "retain-on-failure"            → Record always, keep only on failure ← current config
//   "on-first-retry"               → Record only on retry
//   "on-all-retries"               → Record on every retry
//   "retain-on-failure-and-retries"→ NEW in v1.59 — keeps traces from ALL retries on failure
//
// QUICK DEBUG WORKFLOW:
//   1. Test fails in CI → download trace.zip artifact
//   2. npx playwright trace open trace.zip
//   3. npx playwright trace actions --errors-only   → find failing action
//   4. npx playwright trace action <id>             → see error message
//   5. npx playwright trace snapshot <id> --name before → see page state
//   6. Fix the code
//   7. npx playwright trace close
//
// FOR AI AGENTS:
//   This is the primary way AI agents analyze test failures.
//   They can't open a GUI, but they CAN read text output from trace commands.
//   The workflow is: open → actions --errors-only → snapshot → fix → close
//
// BONUS: install-skill command
//   "npx playwright trace install-skill" installs a SKILL.md file
//   that teaches AI agents how to use the trace CLI. This is Playwright
//   explicitly building for the AI agent ecosystem.
