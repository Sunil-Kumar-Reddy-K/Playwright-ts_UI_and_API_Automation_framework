import { test, expect, chromium, Browser, Page } from "@playwright/test";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

// Use headless mode to prevent orphaned browser processes from blocking
// the VS Code Test Explorer. The extension tracks all child processes
// and won't stop until every chromium process exits.
const LAUNCH_OPTIONS = { headless: false };

/**
 * ============================================================================
 * PLAYWRIGHT v1.59 — BROWSER BINDING (browser.bind / browser.unbind)
 * ============================================================================
 *
 * WHAT: Makes a launched browser "shareable" — other tools/scripts can connect
 *       to the SAME browser instance and control it.
 *
 * WHY:  Before bind(), every tool launched its OWN browser:
 *         - Your test → launches browser A
 *         - playwright-cli → launches browser B
 *         - MCP agent → launches browser C
 *       Now with bind(), they ALL share ONE browser.
 *
 * HOW:  browser.bind("session-name") → returns an endpoint URL
 *       Other clients use that endpoint to connect.
 *
 * ANALOGY: It's like Google Meet —
 *         bind() = create a meeting room
 *         endpoint = the meeting link
 *         connect() = joining with the link
 *         unbind() = closing the room
 * ============================================================================
 */

test.describe("Playwright v1.59 - Browser Binding", { tag: ["@UI", "@v1.59", "@binding"] }, () => {

    // Shorter timeout for these tests — they should complete quickly.
    // Without this, a leaked browser keeps the test running for hours.
    test.describe.configure({ timeout: 240_000 });

    /**
     * TEST 1: Basic Binding — The Simplest Case
     * -------------------------------------------
     * Goal: Launch a browser, bind it, and verify the endpoint is created.
     *
     * This is like creating a meeting room — we don't have anyone joining yet,
     * just proving the room (endpoint) was created successfully.
     */
    test("Test 1: Basic browser binding returns an endpoint", async () => {
        // Step 1: Launch a browser manually (NOT using the test fixture)
        // We use chromium.launch() directly because bind() is on the Browser object
        const browser: Browser = await chromium.launch(LAUNCH_OPTIONS);

        try {
            // Step 2: Bind the browser with a session title
            // "todo-session" is just a human-readable name — like a meeting room name
            const { endpoint } = await browser.bind("todo-session");

            // Step 3: Verify we got an endpoint back
            // This endpoint is what other clients use to connect
            console.log(`\n✅ Browser bound successfully!`);
            console.log(`   Session title: "todo-session"`);
            console.log(`   Endpoint: ${endpoint}`);
            expect(endpoint).toBeTruthy();

            // Step 4: Unbind — stop accepting new connections
            await browser.unbind();
            console.log(`\n🔒 Browser unbound — no new connections accepted`);
        } finally {
            // Always close the browser, even if the test fails
            await browser.close();
        }
    });

    /**
     * TEST 2: WebSocket Binding — Network Accessible
     * ------------------------------------------------
     * Goal: Bind using host + port to get a ws:// endpoint.
     *
     * Named pipe (default) = local only, like Bluetooth
     * WebSocket (with host/port) = network accessible, like WiFi
     *
     * port: 0 means "OS, pick any free port for me"
     */
    test("Test 2: WebSocket binding with host and port", async () => {
        const browser: Browser = await chromium.launch(LAUNCH_OPTIONS);

        try {
            // Bind with host + port → creates a WebSocket endpoint
            const { endpoint } = await browser.bind("ws-todo-session", {
                host: "localhost",
                port: 0, // OS picks a free port (e.g., 54321)
            });

            // The endpoint is now a ws:// URL instead of a named pipe
            console.log(`\n✅ WebSocket binding created!`);
            console.log(`   Endpoint: ${endpoint}`);
            expect(endpoint).toContain("ws://");

            // This ws:// URL could be shared with:
            // - Another machine on the same network
            // - A CI dashboard showing live browser
            // - An AI agent running on a different process

            await browser.unbind();
        } finally {
            await browser.close();
        }
    });

    /**
     * TEST 3: Two Clients, One Browser — The Real Power
     * ---------------------------------------------------
     * Goal: Launch one browser, bind it, then connect a SECOND client.
     *       Both clients control the SAME browser and see each other's changes.
     *
     * This is the core use case:
     *   Client 1 (original) → adds TODO items
     *   Client 2 (connected) → sees those items and adds more
     *   Both work on the SAME page in the SAME browser
     *
     * Think of it like Google Docs — two people editing the same document.
     */
    test("Test 3: Two clients sharing one browser via bind", async () => {
        // ========== CLIENT 1: Launch and Bind ==========
        const browser1: Browser = await chromium.launch(LAUNCH_OPTIONS);
        let browser2: Browser | undefined;

        try {
            // Using named pipe (no host/port) — works reliably on Windows
            // Named pipe = local-only connection, perfect for same-machine sharing
            const { endpoint } = await browser1.bind("shared-todo");
            console.log(`\n📡 Client 1 bound browser at: ${endpoint}`);

            // Client 1 opens a page and adds some TODOs
            const context1 = await browser1.newContext();
            const page1: Page = await context1.newPage();
            await page1.goto(TODO_URL);

            const input1 = page1.getByPlaceholder("What needs to be done?");
            await input1.fill("Added by Client 1");
            await input1.press("Enter");
            await input1.fill("Also from Client 1");
            await input1.press("Enter");

            console.log("✍️  Client 1 added 2 TODO items");

            // Verify Client 1 sees 2 items
            await expect(page1.getByTestId("todo-title")).toHaveCount(2);

            // ========== CLIENT 2: Connect to the SAME browser ==========
            // This simulates another tool/script/agent connecting
            browser2 = await chromium.connect(endpoint);
            console.log("🔗 Client 2 connected to the same browser!");

            // IMPORTANT CONCEPT: Context sharing vs isolation
            // -----------------------------------------------
            // Option A: contexts[0].newPage() → shares cookies/localStorage with Client 1
            //           (TODO app stores items in localStorage, so Client 2 would SEE Client 1's items!)
            //
            // Option B: browser2.newContext() → fresh isolated context
            //           (clean slate — no shared cookies/localStorage)
            //
            // We use Option B to demonstrate true isolation:
            const contexts = browser2.contexts();
            console.log(`   Client 2 sees ${contexts.length} existing context(s) from Client 1`);

            // Client 2 creates its OWN context — isolated from Client 1
            const context2 = await browser2.newContext();
            const page2: Page = await context2.newPage();
            await page2.goto(TODO_URL);

            const input2 = page2.getByPlaceholder("What needs to be done?");
            await input2.fill("Added by Client 2");
            await input2.press("Enter");

            console.log("✍️  Client 2 added 1 TODO item in its own context");

            // Each context is isolated — like two different browsers, but in ONE process
            // Client 1's page still has 2 items (its own localStorage)
            await expect(page1.getByTestId("todo-title")).toHaveCount(2);
            // Client 2's page has 1 item (separate localStorage)
            await expect(page2.getByTestId("todo-title")).toHaveCount(1);

            console.log("\n📊 Verification:");
            console.log("   Client 1 page: 2 TODO items (context 1) ✓");
            console.log("   Client 2 page: 1 TODO item  (context 2) ✓");
            console.log("   Same browser, isolated contexts ✓");

            // ========== CLEANUP ==========
            // Client 2 disconnects (browser stays alive for Client 1)
            await browser2.close();
            browser2 = undefined;
            console.log("\n👋 Client 2 disconnected");

            // Client 1's page should still work fine
            await input1.fill("Client 1 still works after Client 2 left");
            await input1.press("Enter");
            await expect(page1.getByTestId("todo-title")).toHaveCount(3);
            console.log("✅ Client 1 still operational — added a 3rd item");

            await browser1.unbind();
        } finally {
            // Always clean up both browsers, even on failure
            if (browser2) await browser2.close().catch(() => {});
            await browser1.close();
        }
    });

    /**
     * TEST 4: Binding with Metadata & WorkspaceDir
     * -----------------------------------------------
     * Goal: Show how to attach metadata and workspaceDir to a bound browser.
     *
     * workspaceDir: Tells connected tools "this browser is working on THIS project"
     *               → playwright-cli and MCP use this to understand context
     *
     * metadata: Any extra key-value data you want to associate
     *           → useful for dashboards, logging, identifying sessions
     */
    test("Test 4: Binding with metadata and workspace context", async () => {
        const browser: Browser = await chromium.launch(LAUNCH_OPTIONS);

        try {
            const { endpoint } = await browser.bind("project-todo-session", {
                host: "localhost",
                port: 0,
                // workspaceDir tells connected tools which project this browser is for
                workspaceDir: process.cwd(),
                // metadata is custom key-value pairs for identification
                metadata: {
                    testSuite: "v1.59 features",
                    environment: "local",
                    tester: "Sunil",
                },
            });

            console.log(`\n✅ Browser bound with context:`);
            console.log(`   Endpoint:     ${endpoint}`);
            console.log(`   WorkspaceDir: ${process.cwd()}`);
            console.log(`   Metadata:     testSuite=v1.59, env=local, tester=Sunil`);
            console.log(`\n   When playwright-cli or MCP connects, they know:`);
            console.log(`   → Which project directory this browser belongs to`);
            console.log(`   → What test suite is running`);
            console.log(`   → Who started this session`);

            expect(endpoint).toBeTruthy();

            await browser.unbind();
        } finally {
            await browser.close();
        }
    });

    /**
     * TEST 5: Real Scenario — Login Once, Test Many Times
     * -----------------------------------------------------
     * Goal: Demonstrate a practical workflow:
     *   1. Script A launches browser, logs into an app, binds it
     *   2. Script B connects and runs tests WITHOUT logging in again
     *
     * This saves time in large test suites where login takes 5-10 seconds.
     * Instead of logging in for every test file, you login ONCE and share.
     *
     * Here we simulate with the TODO app since it doesn't have login,
     * but the PATTERN is what matters.
     */
    test("Test 5: Practical - setup once, share with multiple clients", async () => {
        // ========== SETUP SCRIPT: Launch, prepare state, bind ==========
        const browser: Browser = await chromium.launch(LAUNCH_OPTIONS);
        let testBrowserA: Browser | undefined;
        let testBrowserB: Browser | undefined;

        try {
            const setupContext = await browser.newContext();
            const setupPage: Page = await setupContext.newPage();

            // Simulate "login + setup" — navigate and create initial state
            await setupPage.goto(TODO_URL);
            const setupInput = setupPage.getByPlaceholder("What needs to be done?");
            await setupInput.fill("Pre-existing item from setup");
            await setupInput.press("Enter");
            await setupInput.fill("Another setup item");
            await setupInput.press("Enter");
            console.log("🔧 Setup script: Created 2 pre-existing TODO items");

            // Now bind — making this prepared browser available to test scripts
            // Using named pipe for reliable Windows connectivity
            const { endpoint } = await browser.bind("pre-configured-session");
            console.log(`📡 Setup script: Browser bound at ${endpoint}`);

            // ========== TEST SCRIPT A: Connect and verify setup state ==========
            testBrowserA = await chromium.connect(endpoint);
            const testContextA = testBrowserA.contexts()[0];
            const pagesA = testContextA.pages();

            // Test script can see the setup page with pre-existing items
            console.log(`\n🧪 Test Script A connected — sees ${pagesA.length} page(s)`);
            await expect(pagesA[0].getByTestId("todo-title")).toHaveCount(2);
            console.log("   ✓ Verified 2 pre-existing items from setup");

            // Test Script A can add more items to the existing page
            const inputA = pagesA[0].getByPlaceholder("What needs to be done?");
            await inputA.fill("Added by Test Script A");
            await inputA.press("Enter");
            await expect(pagesA[0].getByTestId("todo-title")).toHaveCount(3);
            console.log("   ✓ Added 1 item — total now 3");

            await testBrowserA.close();
            testBrowserA = undefined;

            // ========== TEST SCRIPT B: Connect and continue from where A left off ==========
            testBrowserB = await chromium.connect(endpoint);
            const testContextB = testBrowserB.contexts()[0];
            const pagesB = testContextB.pages();

            console.log(`\n🧪 Test Script B connected — sees ${pagesB.length} page(s)`);
            // Script B sees ALL 3 items (2 from setup + 1 from Script A)
            await expect(pagesB[0].getByTestId("todo-title")).toHaveCount(3);
            console.log("   ✓ Sees all 3 items (2 setup + 1 from Script A)");

            // Script B checks off an item
            await pagesB[0].locator("li").filter({ hasText: "Pre-existing item from setup" }).getByRole("checkbox").check();
            console.log("   ✓ Checked off 'Pre-existing item from setup'");

            await testBrowserB.close();
            testBrowserB = undefined;

            // ========== SETUP SCRIPT: Verify final state and cleanup ==========
            console.log("\n🔧 Setup script: Verifying final state...");
            const finalItems = setupPage.getByTestId("todo-title");
            await expect(finalItems).toHaveCount(3);
            console.log("   ✓ All 3 items still present");
            console.log("   ✓ Changes from Script A and B are visible");

            await browser.unbind();
            console.log("\n✅ Complete — one browser served 3 scripts successfully");
        } finally {
            // Always clean up all browsers, even on failure
            if (testBrowserA) await testBrowserA.close().catch(() => {});
            if (testBrowserB) await testBrowserB.close().catch(() => {});
            await browser.close();
        }
    });
});
