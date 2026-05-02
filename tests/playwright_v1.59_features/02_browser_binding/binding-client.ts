/**
 * ============================================================================
 * SCRIPT B — THE CLIENT (Run this SECOND in Terminal 2)
 * ============================================================================
 *
 * What this does:
 *   1. Connects to the ALREADY RUNNING browser from Script A
 *   2. Opens a NEW tab in that SAME browser
 *   3. Adds its own TODO items
 *   4. Also accesses Script A's tab and modifies its items!
 *   5. Disconnects — browser stays alive (Script A still controls it)
 *
 * IMPORTANT: Script A (binding-server.ts) MUST be running first!
 *
 * HOW TO RUN:
 *   npx tsx tests/playwright_v1.59_features/02_browser_binding/binding-client.ts
 *
 * Watch Script A's browser window — you'll see this script controlling it
 * from a COMPLETELY DIFFERENT terminal/process!
 * ============================================================================
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";
// Same file that the server writes the endpoint to
const ENDPOINT_FILE = path.join("test-results", "bind-endpoint.txt");

async function connectAsClient() {
    console.log("═══════════════════════════════════════════════");
    console.log("  SCRIPT B — CLIENT CONNECTING TO SERVER'S BROWSER");
    console.log("═══════════════════════════════════════════════\n");

    // Step 1: Read the endpoint from the shared file and connect
    console.log("Step 1: Reading endpoint from shared file...");

    if (!fs.existsSync(ENDPOINT_FILE)) {
        console.error("\n   ❌ Endpoint file not found! Make sure Script A (binding-server.ts) is running first.");
        console.error(`   Expected file: ${ENDPOINT_FILE}`);
        console.error("   Run in another terminal: npx tsx tests/playwright_v1.59_features/binding-server.ts\n");
        process.exit(1);
    }

    const endpoint = fs.readFileSync(ENDPOINT_FILE, "utf-8").trim();
    console.log(`   Read endpoint: ${endpoint}`);
    console.log("   Connecting...");

    let browser;
    try {
        browser = await chromium.connect(endpoint);
    } catch (error) {
        console.error("\n   ❌ Could not connect! Make sure Script A (binding-server.ts) is still running.");
        console.error("   The server may have timed out. Restart it and try again.\n");
        process.exit(1);
    }

    console.log("   ✅ Connected to the server's browser!\n");

    // Step 2: See what the server already set up
    console.log("Step 2: Exploring server's existing state...");
    const existingContexts = browser.contexts();
    console.log(`   Found ${existingContexts.length} existing context(s)`);

    const existingPages = existingContexts[0].pages();
    console.log(`   Found ${existingPages.length} existing page(s)`);

    // Read the TODO items that Script A created
    const serverPage = existingPages[0];
    const existingItems = await serverPage.getByTestId("todo-title").allTextContents();
    console.log(`   Server's TODO items:`);
    existingItems.forEach((item, i) => console.log(`     ${i + 1}. ${item}`));

    // Step 3: Modify the SERVER's page from THIS client!
    // This is the mind-blowing part — watch Script A's browser
    console.log("\nStep 3: Modifying server's page from the client...");
    console.log("   👀 WATCH THE BROWSER — the client is typing on the server's page!\n");

    const serverInput = serverPage.getByPlaceholder("What needs to be done?");

    await delay(2000); // Pause so you can watch

    await serverInput.fill("🤖 Added by CLIENT (different process!)");
    await delay(1000);
    await serverInput.press("Enter");

    await delay(1000);
    await serverInput.fill("🤖 Client can control server's page!");
    await delay(1000);
    await serverInput.press("Enter");

    console.log("   ✅ Added 2 items to the SERVER's page from the CLIENT");

    // Verify total count on server's page
    const totalItems = await serverPage.getByTestId("todo-title").count();
    console.log(`   Server's page now has ${totalItems} items (3 original + 2 from client)\n`);

    // Step 4: Check off one of the server's original items
    console.log("Step 4: Checking off server's first item from the client...");
    console.log("   👀 WATCH — the checkbox will toggle on the server's page!\n");
    await delay(2000);

    await serverPage.locator("li").filter({ hasText: "Item created by Server script" }).getByRole("checkbox").check();
    console.log("   ✅ Checked off 'Item created by Server script'\n");
    await delay(2000);

    // Step 5: Open a NEW tab in the same browser
    console.log("Step 5: Opening a new tab in the server's browser...");
    console.log("   👀 WATCH — a new tab will appear in the SAME browser window!\n");
    await delay(2000);

    const clientPage = await existingContexts[0].newPage();
    await clientPage.goto(TODO_URL);
    await delay(1000);

    const clientInput = clientPage.getByPlaceholder("What needs to be done?");
    await clientInput.fill("This is the client's own tab");
    await delay(1000);
    await clientInput.press("Enter");

    await clientInput.fill("Server cannot see these items (different tab)");
    await delay(1000);
    await clientInput.press("Enter");

    console.log("   ✅ Client opened its own tab and added 2 items\n");
    await delay(2000);

    // Step 6: Disconnect
    console.log("Step 6: Client disconnecting...");
    console.log("   The browser will STAY OPEN — Script A still controls it!\n");
    await delay(2000);

    await browser.close(); // This disconnects the client, does NOT close the browser
    console.log("   ✅ Client disconnected\n");

    console.log("═══════════════════════════════════════════════");
    console.log("  CLIENT SCRIPT COMPLETE");
    console.log("═══════════════════════════════════════════════");
    console.log("\n  Now go look at Script A's terminal —");
    console.log("  it detected your connection and will show the final state.");
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

connectAsClient().catch(console.error);
