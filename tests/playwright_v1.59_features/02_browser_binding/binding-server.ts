/**
 * ============================================================================
 * SCRIPT A — THE SERVER (Run this FIRST in Terminal 1)
 * ============================================================================
 *
 * What this does:
 *   1. Launches a browser
 *   2. Opens the TODO app
 *   3. Adds some TODO items (simulating "setup" or "login")
 *   4. Binds the browser — makes it available for others to connect
 *   5. WAITS... for 60 seconds (giving you time to run Script B)
 *   6. After 60 seconds, unbinds and closes
 *
 * HOW TO RUN:
 *   npx tsx tests/playwright_v1.59_features/02_browser_binding/binding-server.ts
 *
 * After running, the endpoint is saved to a shared file (test-results/bind-endpoint.txt)
 * so Script B can read it automatically — no copy-pasting needed.
 * ============================================================================
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";
// Shared file where the server writes the endpoint for the client to read
const ENDPOINT_FILE = path.join("test-results", "bind-endpoint.txt");

async function startServer() {
    console.log("═══════════════════════════════════════════════");
    console.log("  SCRIPT A — BROWSER SERVER");
    console.log("═══════════════════════════════════════════════\n");

    // Step 1: Launch a VISIBLE browser
    console.log("Step 1: Launching browser...");
    const browser = await chromium.launch({ headless: false });

    // Step 2: Open the TODO app and set up some state
    console.log("Step 2: Opening TODO app and adding items...\n");
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(TODO_URL);

    const input = page.getByPlaceholder("What needs to be done?");
    await input.fill("Item created by Server script");
    await input.press("Enter");
    await input.fill("Another server item");
    await input.press("Enter");
    await input.fill("Third item from server");
    await input.press("Enter");

    console.log("   ✅ Added 3 TODO items to the list");
    console.log("   → Look at the browser — you should see 3 items\n");

    // Step 3: BIND the browser — this is the key moment
    console.log("Step 3: Binding the browser...\n");
    const { endpoint } = await browser.bind("todo-demo-session");

    // Save the endpoint to a shared file so Script B can read it automatically
    if (!fs.existsSync("test-results")) {
        fs.mkdirSync("test-results", { recursive: true });
    }
    fs.writeFileSync(ENDPOINT_FILE, endpoint);

    console.log("   ╔═══════════════════════════════════════════════════╗");
    console.log("   ║  BROWSER IS NOW BOUND AND WAITING FOR CLIENTS!   ║");
    console.log("   ╠═══════════════════════════════════════════════════╣");
    console.log(`   ║  Endpoint: ${endpoint}`);
    console.log(`   ║  Saved to: ${ENDPOINT_FILE}`);
    console.log("   ║                                                   ║");
    console.log("   ║  NOW open a SECOND terminal and run:              ║");
    console.log("   ║                                                   ║");
    console.log("   ║  npx tsx tests/playwright_v1.59_features/02_browser_binding/binding-client.ts");
    console.log("   ║                                                   ║");
    console.log("   ║  Watch THIS browser — the client will control it! ║");
    console.log("   ╚═══════════════════════════════════════════════════╝\n");

    // Step 4: Wait for 120 seconds — keeping the browser alive for Script B to connect
    console.log("   ⏳ Waiting 120 seconds for clients to connect...\n");

    // While waiting, let's watch for new pages that clients open
    context.on("page", (newPage) => {
        console.log(`   👀 Server noticed: A client opened a new page! URL: ${newPage.url()}`);
    });

    await new Promise((resolve) => setTimeout(resolve, 120_000));

    // Step 5: Cleanup
    console.log("\n⏰ Time's up! Cleaning up...");
    console.log("   Final state of server's page:");
    const items = await page.getByTestId("todo-title").allTextContents();
    items.forEach((item, i) => console.log(`   ${i + 1}. ${item}`));

    await browser.unbind();
    console.log("\n   🔒 Browser unbound");
    await browser.close();
    console.log("   ❌ Browser closed");
    console.log("\n═══════════════════════════════════════════════");
    console.log("  SERVER SCRIPT COMPLETE");
    console.log("═══════════════════════════════════════════════");
}

startServer().catch(console.error);
