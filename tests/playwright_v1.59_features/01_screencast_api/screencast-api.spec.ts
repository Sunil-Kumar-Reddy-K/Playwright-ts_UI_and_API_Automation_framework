import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const TODO_URL = "https://demo.playwright.dev/todomvc/#/";

test.describe("Playwright v1.59 - Screencast API", { tag: ["@UI", "@v1.59"] }, () => {

    test("Record a screencast video with action annotations", async ({ page }) => {
        await page.goto(TODO_URL);

        // Start screencast recording to a video file
        await page.screencast.start({ path: "test-results/screencast-demo.webm" });

        // Enable action annotations — highlights interacted elements with titles
        await page.screencast.showActions({ position: "top-right", fontSize: 20, duration: 800 });

        // Show a chapter overlay to introduce the section
        await page.screencast.showChapter("Adding TODO Items", {
            description: "Demonstrating how to add multiple items to the list",
            duration: 2000,
        });

        // Add TODO items
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Buy groceries");
        await input.press("Enter");

        await input.fill("Read Playwright v1.59 release notes");
        await input.press("Enter");

        await input.fill("Write automation tests");
        await input.press("Enter");

        // Verify items were added
        const todoItems = page.getByTestId("todo-title");
        await expect(todoItems).toHaveCount(3);

        // Show chapter for the next section
        await page.screencast.showChapter("Completing TODOs", {
            description: "Mark items as done using checkboxes",
            duration: 2000,
        });

        // Complete a TODO item
        const firstToggle = page.locator("li").filter({ hasText: "Buy groceries" }).getByRole("checkbox");
        await firstToggle.check();

        // Verify the item is completed
        await expect(firstToggle).toBeChecked();

        // Show chapter for filtering
        await page.screencast.showChapter("Filtering TODOs", {
            description: "Use built-in filters to view active/completed items",
            duration: 2000,
        });

        // Click on "Active" filter
        await page.getByRole("link", { name: "Active" }).click();
        await expect(todoItems).toHaveCount(2);

        // Click on "Completed" filter
        await page.getByRole("link", { name: "Completed" }).click();
        await expect(todoItems).toHaveCount(1);

        // Click on "All" filter
        await page.getByRole("link", { name: "All" }).click();
        await expect(todoItems).toHaveCount(3);

        // Hide action annotations
        await page.screencast.hideActions();

        // Stop recording
        await page.screencast.stop();
    });

    test("Custom HTML overlay on screencast", async ({ page }) => {
        await page.goto(TODO_URL);

        await page.screencast.start({ path: "test-results/screencast-overlay-demo.webm" });

        // Add a custom HTML overlay — like a watermark or recording indicator
        const overlay = await page.screencast.showOverlay(
            `<div style="background: rgba(255,0,0,0.7); color: white; padding: 6px 14px;
                          border-radius: 8px; font-family: sans-serif; font-size: 14px;">
                🔴 RECORDING
            </div>`,
        );

        await page.screencast.showActions({ position: "top-left" });

        // Perform some actions with the overlay visible
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Task with overlay recording");
        await input.press("Enter");
        await input.fill("Another visible task");
        await input.press("Enter");

        // Temporarily hide overlays
        await page.screencast.hideOverlays();

        await input.fill("Task added while overlay hidden");
        await input.press("Enter");

        // Show overlays again
        await page.screencast.showOverlays();

        // Verify all items exist
        await expect(page.getByTestId("todo-title")).toHaveCount(3);

        // Dispose the overlay explicitly
        await overlay.dispose();

        await page.screencast.stop();
    });

    test("Real-time frame capture — save frames to disk and assert", async ({ page }) => {
        await page.goto(TODO_URL);

        // Create a directory to save captured frames
        const framesDir = path.join("test-results", "captured-frames");
        if (!fs.existsSync(framesDir)) {
            fs.mkdirSync(framesDir, { recursive: true });
        }

        const capturedFrames: Buffer[] = [];

        // Start screencast with onFrame callback — frames stream into our array
        await page.screencast.start({
            onFrame: ({ data }) => {
                capturedFrames.push(data);
            },
            size: { width: 800, height: 600 },
        });

        // ---- Phase 1: Empty state (frames captured here show empty TODO list) ----
        await page.waitForTimeout(500);
        const emptyStateFrameIndex = capturedFrames.length - 1;

        // ---- Phase 2: Add items (frames captured here show items appearing) ----
        const input = page.getByPlaceholder("What needs to be done?");
        await input.fill("Buy groceries");
        await input.press("Enter");
        await input.fill("Learn Playwright v1.59");
        await input.press("Enter");
        await page.waitForTimeout(500);
        const afterAddFrameIndex = capturedFrames.length - 1;

        // ---- Phase 3: Check an item (frames captured here show the checkbox toggling) ----
        await page.locator("li").filter({ hasText: "Buy groceries" }).getByRole("checkbox").check();
        await page.waitForTimeout(500);
        const afterCheckFrameIndex = capturedFrames.length - 1;

        await page.screencast.stop();

        // ========== ASSERTIONS ==========

        // 1. We captured multiple frames across all phases
        console.log(`Total frames captured: ${capturedFrames.length}`);
        expect(capturedFrames.length).toBeGreaterThan(5);

        // 2. Each frame is a valid JPEG buffer (JPEG files start with bytes FF D8)
        for (const frame of capturedFrames) {
            expect(frame.length).toBeGreaterThan(0);
            expect(frame[0]).toBe(0xff);
            expect(frame[1]).toBe(0xd8);
        }

        // 3. Frames from different phases should have different sizes
        //    (empty page vs page with items = different visual content = different JPEG sizes)
        const emptyFrame = capturedFrames[emptyStateFrameIndex];
        const afterAddFrame = capturedFrames[afterAddFrameIndex];
        const afterCheckFrame = capturedFrames[afterCheckFrameIndex];

        console.log(`Empty state frame size: ${emptyFrame.length} bytes`);
        console.log(`After adding items frame size: ${afterAddFrame.length} bytes`);
        console.log(`After checking item frame size: ${afterCheckFrame.length} bytes`);

        // Frame with TODO items should be larger than empty frame (more visual content)
        expect(afterAddFrame.length).not.toBe(emptyFrame.length);

        // 4. Save key frames to disk so you can visually inspect them
        fs.writeFileSync(path.join(framesDir, "frame-empty-state.jpg"), emptyFrame);
        fs.writeFileSync(path.join(framesDir, "frame-after-add.jpg"), afterAddFrame);
        fs.writeFileSync(path.join(framesDir, "frame-after-check.jpg"), afterCheckFrame);

        // 5. Compare with a traditional screenshot to see the difference
        const screenshot = await page.screenshot({ type: "jpeg" });
        fs.writeFileSync(path.join(framesDir, "traditional-screenshot.jpg"), screenshot);

        console.log(`\nFrames saved to: ${framesDir}/`);
        console.log("  - frame-empty-state.jpg    ← TODO list with no items");
        console.log("  - frame-after-add.jpg      ← after adding 2 items");
        console.log("  - frame-after-check.jpg    ← after checking off an item");
        console.log("  - traditional-screenshot.jpg ← page.screenshot() for comparison");

        // ========== AI VALIDATION PATTERN (conceptual) ==========
        // In a real agentic workflow, you'd send key frames to a vision model:
        //
        // const response = await sendToVisionAI(afterAddFrame, {
        //     prompt: "Does this page show a TODO list with 2 items: 'Buy groceries' and 'Learn Playwright v1.59'?"
        // });
        // expect(response.answer).toBe("yes");
        //
        // This is exactly how AI agents "see" the page — they get JPEG frames
        // and use vision models to understand what's on screen.
    });

    test("Screencast with chapters as a visual test walkthrough", async ({ page }) => {
        await page.goto(TODO_URL);

        await page.screencast.start({ path: "test-results/screencast-chapters-demo.webm" });
        await page.screencast.showActions({ position: "bottom-right", fontSize: 18 });

        // Chapter 1: Setup
        await page.screencast.showChapter("Step 1: Setup", {
            description: "Navigate to TodoMVC and verify empty state",
            duration: 1500,
        });
        await expect(page.getByPlaceholder("What needs to be done?")).toBeVisible();

        // Chapter 2: Create items
        await page.screencast.showChapter("Step 2: Create Items", {
            description: "Add three TODO items to the list",
            duration: 1500,
        });
        const input = page.getByPlaceholder("What needs to be done?");
        for (const item of ["Learn Screencast API", "Learn Browser Binding", "Learn Async Disposables"]) {
            await input.fill(item);
            await input.press("Enter");
        }
        await expect(page.getByTestId("todo-title")).toHaveCount(3);

        // Chapter 3: Edit an item
        await page.screencast.showChapter("Step 3: Edit Item", {
            description: "Double-click to edit a TODO item",
            duration: 1500,
        });
        const itemToEdit = page.getByTestId("todo-title").filter({ hasText: "Learn Browser Binding" });
        await itemToEdit.dblclick();
        const editInput = page.getByTestId("todo-item").filter({ hasText: "Learn Browser Binding" }).getByRole("textbox");
        await editInput.fill("Learn Browser Binding API");
        await editInput.press("Enter");

        // Chapter 4: Delete an item
        await page.screencast.showChapter("Step 4: Delete Item", {
            description: "Hover and click delete to remove an item",
            duration: 1500,
        });
        const itemToDelete = page.locator("li").filter({ hasText: "Learn Async Disposables" });
        await itemToDelete.hover();
        await itemToDelete.getByRole("button", { name: "Delete" }).click();
        await expect(page.getByTestId("todo-title")).toHaveCount(2);

        // Chapter 5: Complete
        await page.screencast.showChapter("Step 5: Complete", {
            description: "Mark remaining items as done",
            duration: 1500,
        });
        await page.getByLabel("Mark all as complete").check();
        const checkboxes = page.getByRole("checkbox", { name: "Toggle Todo" });
        for (const cb of await checkboxes.all()) {
            await expect(cb).toBeChecked();
        }

        // Final chapter
        await page.screencast.showChapter("Test Complete ✓", {
            description: "All Screencast API features demonstrated successfully",
            duration: 2000,
        });

        await page.screencast.stop();
    });
});

//PERSONAL NOTES BASED ON THIS RELEASE PRACTICE:
// - This is basically a functionalities that are developed in favour of AI agents, basically either they can test what they 
//  developed abd verify and also for presentation 