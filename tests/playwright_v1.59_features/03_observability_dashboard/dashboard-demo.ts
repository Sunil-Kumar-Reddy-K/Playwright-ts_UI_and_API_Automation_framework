/**
 * ============================================================================
 * OBSERVABILITY DASHBOARD DEMO
 * ============================================================================
 *
 * This is NOT a test — it's a standalone demo script that binds browsers
 * so you can control them from another terminal using playwright-cli.
 *
 * PREREQUISITE:
 *   npm install -D @playwright/cli
 *   (playwright-cli is a SEPARATE package from @playwright/test)
 *
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  HOW TO USE (2 terminals):                                         │
 * │                                                                    │
 * │  Terminal 1 — Start this script:                                   │
 * │    npx tsx tests/playwright_v1.59_features/03_observability_dashboard/dashboard-demo.ts
 * │                                                                    │
 * │  Terminal 2 — Run playwright-cli commands (while Terminal 1 runs): │
 * │    npx playwright-cli attach todo-session                          │
 * │    npx playwright-cli -s todo-session snapshot                     │
 * │    npx playwright-cli -s todo-session click "Active"               │
 * │    npx playwright-cli -s todo-session screenshot                   │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * WHAT ACTUALLY WORKS (tested on v1.59.1 + @playwright/cli v0.1.7):
 * ──────────────────────────────────────────────────────────────────
 *   ✅ attach <session>         → Connects to a bound browser by session name
 *   ✅ -s <session> snapshot    → Captures accessibility tree (how AI "sees" the page)
 *   ✅ -s <session> click       → Clicks elements in the bound browser remotely
 *   ✅ -s <session> fill        → Fills input fields remotely
 *   ✅ -s <session> screenshot  → Takes a screenshot remotely
 *   ✅ -s <session> show        → Opens DevTools for the session
 *   ❌ list                     → Does NOT discover externally bound browsers
 *   ❌ show (without -s)        → The web dashboard UI described in release notes
 *                                  is not available in @playwright/cli v0.1.7
 *
 * WHO IS THIS FOR?
 *   1. AI agents (MCP/Claude) that need to control a pre-setup browser
 *   2. Developers debugging a running test from another terminal
 *   3. Teams where one person sets up the browser state, another tests it
 * ============================================================================
 */

import { chromium, Browser, Page } from "@playwright/test";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

async function startDashboardDemo() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  OBSERVABILITY DEMO — playwright-cli + browser.bind()");
    console.log("═══════════════════════════════════════════════════════\n");

    // ========== SESSION 1: A TODO app session ==========
    console.log("📡 Creating Session 1: 'todo-session'...");
    const browser1: Browser = await chromium.launch({ headless: false });
    const ctx1 = await browser1.newContext();
    const page1: Page = await ctx1.newPage();
    await page1.goto(TODO_URL);

    // Add some items so there's visible state for the CLI to interact with
    const input1 = page1.getByPlaceholder("What needs to be done?");
    await input1.fill("Dashboard demo item 1");
    await input1.press("Enter");
    await input1.fill("Dashboard demo item 2");
    await input1.press("Enter");
    await input1.fill("Dashboard demo item 3");
    await input1.press("Enter");

    // Bind with metadata — the session name "todo-session" is what CLI uses to connect
    await browser1.bind("todo-session", {
        workspaceDir: process.cwd(),
        metadata: {
            purpose: "TODO app testing",
            createdBy: "dashboard-demo.ts",
        },
    });
    console.log("   ✅ Session 1 bound: 'todo-session' (TODO app with 3 items)\n");

    // ========== SESSION 2: A second browser doing something else ==========
    console.log("📡 Creating Session 2: 'playwright-docs'...");
    const browser2: Browser = await chromium.launch({ headless: false });
    const ctx2 = await browser2.newContext();
    const page2: Page = await ctx2.newPage();
    await page2.goto("https://playwright.dev/");

    await browser2.bind("playwright-docs", {
        workspaceDir: process.cwd(),
        metadata: {
            purpose: "Documentation browsing",
            createdBy: "dashboard-demo.ts",
        },
    });
    console.log("   ✅ Session 2 bound: 'playwright-docs' (Playwright website)\n");

    // ========== INSTRUCTIONS ==========
    console.log("═══════════════════════════════════════════════════════");
    console.log("  TWO SESSIONS ARE NOW RUNNING AND BOUND!");
    console.log("  You have ~2 minutes to try the commands below.");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log("  Open a SECOND terminal and run these commands:\n");
    console.log("  ┌──────────────────────────────────────────────────────────────────┐");
    console.log("  │                                                                  │");
    console.log("  │  Step 1: Attach to the TODO session                              │");
    console.log("  │    npx playwright-cli attach todo-session                        │");
    console.log("  │                                                                  │");
    console.log("  │  Step 2: Take a snapshot (see the page as text)                  │");
    console.log("  │    npx playwright-cli -s todo-session snapshot                   │");
    console.log("  │                                                                  │");
    console.log("  │  Step 3: Click the 'Active' filter remotely                      │");
    console.log('  │    npx playwright-cli -s todo-session click "Active"             │');
    console.log("  │                                                                  │");
    console.log("  │  Step 4: Take a screenshot                                       │");
    console.log("  │    npx playwright-cli -s todo-session screenshot                 │");
    console.log("  │                                                                  │");
    console.log("  │  Step 5: Fill a new TODO item remotely                           │");
    console.log('  │    npx playwright-cli -s todo-session fill "What needs to be done?" "Added from CLI!"  │');
    console.log("  │                                                                  │");
    console.log("  │  Step 6: Press Enter to submit it                                │");
    console.log("  │    npx playwright-cli -s todo-session press Enter                │");
    console.log("  │                                                                  │");
    console.log("  │  Step 7: Attach to the docs session                              │");
    console.log("  │    npx playwright-cli attach playwright-docs                     │");
    console.log("  │    npx playwright-cli -s playwright-docs snapshot                │");
    console.log("  │                                                                  │");
    console.log("  └──────────────────────────────────────────────────────────────────┘\n");
    console.log("  What each command does:");
    console.log("  ─────────────────────────────────────────────────────");
    console.log("  'attach'     → Connects CLI to a bound browser session by name.");
    console.log("                  Returns page URL, title, and an accessibility snapshot.");
    console.log("");
    console.log("  'snapshot'   → Prints an accessibility tree of the current page.");
    console.log("                  This is how AI agents 'read' the page as structured text.");
    console.log("");
    console.log("  'click/fill' → Remotely interact with the browser from another terminal.");
    console.log("                  Watch the browser window — you'll SEE it happen live!");
    console.log("");
    console.log("  'screenshot' → Saves a screenshot of the page from the CLI.");
    console.log("  ─────────────────────────────────────────────────────\n");

    // ========== SIMULATE ACTIVITY ==========
    console.log("  🔄 Simulating activity on the TODO app every 15 seconds...");
    console.log("     (Watch the browser — activity happens automatically)\n");

    let counter = 0;
    const activities = [
        async () => {
            await page1.locator("li").filter({ hasText: "Dashboard demo item 1" }).getByRole("checkbox").check();
            console.log("  [Activity] ✓ Checked off 'Dashboard demo item 1'");
        },
        async () => {
            await page1.getByRole("link", { name: "Active" }).click();
            console.log("  [Activity] 📋 Switched to 'Active' filter");
        },
        async () => {
            await page1.getByRole("link", { name: "All" }).click();
            console.log("  [Activity] 📋 Switched back to 'All' filter");
        },
        async () => {
            const input = page1.getByPlaceholder("What needs to be done?");
            await input.fill("Dynamically added item");
            await input.press("Enter");
            console.log("  [Activity] ➕ Added 'Dynamically added item'");
        },
        async () => {
            await page2.getByRole("link", { name: "Docs" }).first().click();
            console.log("  [Activity] 📖 Session 2: Navigated to Docs page");
        },
    ];

    for (const activity of activities) {
        await new Promise((resolve) => setTimeout(resolve, 15_000));
        try {
            await activity();
        } catch {
            console.log("  [Activity] ⚠️ Activity skipped (element not found)");
        }
        counter++;
        console.log(`  [${counter}/${activities.length}] Next activity in 15 seconds...\n`);
    }

    // Keep alive for a bit more after activities
    console.log("  ⏳ Activities complete. Keeping sessions alive for 30 more seconds...");
    console.log("     You can still run playwright-cli commands!\n");
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    // ========== CLEANUP ==========
    console.log("  🔒 Unbinding and closing sessions...");
    await browser1.unbind();
    await browser1.close();
    console.log("  ❌ Session 1 (todo-session) closed");

    await browser2.unbind();
    await browser2.close();
    console.log("  ❌ Session 2 (playwright-docs) closed");

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  DEMO COMPLETE");
    console.log("═══════════════════════════════════════════════════════");
}

startDashboardDemo().catch(console.error);
