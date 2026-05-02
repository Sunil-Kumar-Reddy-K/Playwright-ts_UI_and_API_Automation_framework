import { test as base, expect, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { AccessibilityHelper } from "../06_pom_integration/accessibility-helper";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";
const ORANGEHRM_URL = "https://opensource-demo.orangehrmlive.com/";

/**
 * ============================================================================
 * MODULE 08: ADVANCED PATTERNS — Real-World Accessibility Testing
 * ============================================================================
 *
 * WHAT: Real websites aren't static pages. They have modals, dropdowns,
 *       dynamic content, keyboard interactions, and responsive layouts.
 *       This module teaches you to test accessibility in these scenarios.
 *
 * WHY:  Most accessibility bugs hide in DYNAMIC behavior:
 *       - A modal opens but focus isn't trapped inside it
 *       - A dropdown expands but screen reader can't reach options
 *       - A toast notification appears but isn't announced
 *       - Tab order breaks after content loads dynamically
 *       - Mobile layout loses accessibility features
 *
 * TOPICS COVERED:
 *   1. Dynamic content — scan after modals/dropdowns/toasts appear
 *   2. Keyboard navigation — Tab order, focus visibility, traps
 *   3. ARIA attributes — validate role, label, describedby, expanded
 *   4. Color contrast — focused scanning for design review
 *   5. Mobile viewport — responsive a11y testing
 *   6. Focus management — verify focus moves correctly after actions
 *
 * ANALOGY: Modules 01-07 taught you to inspect a parked car.
 *          Module 08 teaches you to inspect it WHILE IT'S MOVING.
 *
 * ============================================================================
 */

// Extend test with a11y fixture
const test = base.extend<{ a11y: AccessibilityHelper }>({
    a11y: async ({ page }, use) => {
        await use(new AccessibilityHelper(page));
    },
});

test.describe(
    "Module 08: Advanced Patterns",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Scan After Dynamic Content — Modal/Dialog
         * --------------------------------------------------
         * Goal: Open a modal/dialog, then scan it specifically.
         *
         * Modals are a11y hotspot because:
         * - Focus must move INTO the modal when it opens
         * - Focus must be TRAPPED inside (can't Tab out)
         * - Focus must return to trigger when modal closes
         * - Modal content must be accessible
         * - Background content should be aria-hidden
         */
        test("Test 1: Scan after modal/dialog opens (OrangeHRM)", async ({
            page,
        }) => {
            // Navigate to OrangeHRM and login
            await page.goto(ORANGEHRM_URL);
            await page.fill('input[name="username"]', "Admin");
            await page.fill('input[name="password"]', "admin123");
            await page.click('button[type="submit"]');
            await page.waitForURL("**/dashboard/**");

            // Scan the dashboard BEFORE any modal interaction
            const beforeResults = await new AxeBuilder({ page }).analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  DYNAMIC CONTENT: Dashboard Scan");
            console.log("=".repeat(60));
            console.log(
                `\n  Dashboard violations: ${beforeResults.violations.length}`,
            );
            beforeResults.violations.forEach((v) => {
                console.log(
                    `    [${v.impact}] ${v.id}: ${v.help}`,
                );
            });

            // Navigate to a page with interactive elements (PIM module)
            await page.getByRole("link", { name: "PIM" }).click();
            await page.waitForLoadState("networkidle");

            // Scan after navigation
            const afterNavResults = await new AxeBuilder({ page }).analyze();
            console.log(
                `\n  PIM page violations: ${afterNavResults.violations.length}`,
            );

            console.log("\n  💡 MODAL TESTING PATTERN:");
            console.log(
                "     1. Scan BEFORE modal opens (baseline)",
            );
            console.log(
                "     2. Trigger the modal",
            );
            console.log(
                '     3. Scan the modal: .include("[role=dialog]")',
            );
            console.log(
                "     4. Check focus is inside modal",
            );
            console.log(
                "     5. Close modal, check focus returns\n",
            );

            expect(beforeResults.violations).toBeDefined();
        });

        /**
         * TEST 2: Scan After Dropdown Interaction
         * ----------------------------------------
         * Goal: Open a dropdown menu, scan the expanded content.
         *
         * GreenKart has a product selection flow where items can
         * be added to cart — test the cart sidebar after adding items.
         */
        test("Test 2: Scan after user interaction — add to cart flow", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_URL);

            // Scan BEFORE interaction
            const beforeResults = await a11y.scanFullPage();

            // Add items to cart
            const addButtons = page.locator(".product-action button");
            const buttonCount = await addButtons.count();
            if (buttonCount > 0) {
                await addButtons.first().click();
                // Wait for cart to update
                await page.waitForTimeout(500);
            }

            // Scan AFTER interaction
            const afterResults = await a11y.scanFullPage();

            console.log("\n" + "=".repeat(60));
            console.log("  DYNAMIC CONTENT: After Cart Interaction");
            console.log("=".repeat(60));
            console.log(
                `\n  Before adding to cart: ${beforeResults.violations.length} violations`,
            );
            console.log(
                `  After adding to cart:  ${afterResults.violations.length} violations`,
            );

            // Check for new violations
            const beforeIds = new Set(
                beforeResults.violations.map((v) => v.id),
            );
            const newViolations = afterResults.violations.filter(
                (v) => !beforeIds.has(v.id),
            );

            if (newViolations.length > 0) {
                console.log(
                    `\n  ⚠️  ${newViolations.length} NEW violation(s) after interaction:`,
                );
                newViolations.forEach((v) => {
                    console.log(
                        `    🆕 ${v.id}: ${v.help}`,
                    );
                });
            } else {
                console.log(
                    "\n  ✅ No new violations introduced by interaction!",
                );
            }

            console.log(
                "\n  💡 Always compare before/after to catch interaction-induced bugs.\n",
            );

            expect(afterResults.violations).toBeDefined();
        });

        /**
         * TEST 3: Keyboard Navigation Audit
         * ----------------------------------
         * Goal: Tab through the page and verify:
         *   - Focus is visible (no invisible focus)
         *   - Tab order is logical
         *   - Interactive elements are reachable by keyboard
         *   - No keyboard traps (can always Tab away)
         *
         * WCAG 2.1.1 (Keyboard): All functionality must be operable
         * via keyboard interface.
         */
        test("Test 3: Keyboard navigation audit — TodoMVC", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            // Add some items to create interactive content
            const input = page.getByPlaceholder("What needs to be done?");
            await input.fill("Task one");
            await input.press("Enter");
            await input.fill("Task two");
            await input.press("Enter");

            console.log("\n" + "=".repeat(60));
            console.log("  KEYBOARD NAVIGATION AUDIT");
            console.log("=".repeat(60));

            // Run keyboard-specific axe rules
            const keyboardResults = await new AxeBuilder({ page })
                .withTags(["cat.keyboard"])
                .analyze();

            console.log(
                `\n  Keyboard rule violations: ${keyboardResults.violations.length}`,
            );
            keyboardResults.violations.forEach((v) => {
                console.log(
                    `    ❌ ${v.id}: ${v.help}`,
                );
            });
            if (keyboardResults.violations.length === 0) {
                console.log(
                    "    ✅ All keyboard rules passed!",
                );
            }

            // Tab through elements and track focus
            console.log("\n  Tab order trace:");
            const focusedElements: string[] = [];

            for (let i = 0; i < 8; i++) {
                await page.keyboard.press("Tab");

                // Get info about the currently focused element
                const focusInfo = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el || el === document.body) return "body (no focus)";
                    const tag = el.tagName.toLowerCase();
                    const role = el.getAttribute("role") || "";
                    const label =
                        el.getAttribute("aria-label") ||
                        el.textContent?.trim().substring(0, 30) ||
                        "";
                    const classList = el.className
                        ? `.${el.className.split(" ").slice(0, 2).join(".")}`
                        : "";
                    return `<${tag}${classList}${role ? ` role="${role}"` : ""}> "${label}"`;
                });

                focusedElements.push(focusInfo);
                console.log(`    Tab ${i + 1}: ${focusInfo}`);
            }

            // Check: Can we reach the todo input and checkboxes?
            console.log(
                "\n  💡 KEYBOARD NAVIGATION CHECKLIST:",
            );
            console.log(
                "     ☐ All interactive elements reachable by Tab",
            );
            console.log(
                "     ☐ Focus indicator is visible on every element",
            );
            console.log(
                "     ☐ Tab order follows visual/logical order",
            );
            console.log(
                "     ☐ No keyboard traps (can always Tab away)",
            );
            console.log(
                "     ☐ Enter/Space activate buttons and links",
            );
            console.log(
                "     ☐ Escape closes modals/popups\n",
            );

            expect(focusedElements.length).toBeGreaterThan(0);
        });

        /**
         * TEST 4: ARIA Attribute Validation
         * ----------------------------------
         * Goal: Directly validate ARIA attributes using Playwright locators.
         *       This COMPLEMENTS axe (axe checks ARIA syntax, but not
         *       whether the values make semantic sense).
         *
         * KEY ARIA ATTRIBUTES:
         *   role         → What the element IS (button, dialog, nav)
         *   aria-label   → Accessible name for screen readers
         *   aria-labelledby → Points to another element's ID for naming
         *   aria-describedby → Points to a description element
         *   aria-expanded → Whether a collapsible is open/closed
         *   aria-hidden  → Hidden from screen readers
         *   aria-live    → Announces dynamic content changes
         */
        test("Test 4: ARIA attribute validation — direct checks", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            // Add items and complete one
            const input = page.getByPlaceholder("What needs to be done?");
            await input.fill("Learn ARIA");
            await input.press("Enter");
            await input.fill("Master a11y");
            await input.press("Enter");

            // Check the first todo
            await page
                .getByTestId("todo-item")
                .first()
                .getByRole("checkbox")
                .check();

            console.log("\n" + "=".repeat(60));
            console.log("  ARIA ATTRIBUTE VALIDATION");
            console.log("=".repeat(60));

            // Check input has appropriate attributes
            const todoInput = page.getByPlaceholder("What needs to be done?");
            const inputTag = await todoInput.evaluate((el) => el.tagName);
            console.log(
                `\n  Todo input: <${inputTag.toLowerCase()}>`,
            );

            // Check checkbox roles
            const checkboxes = page.getByRole("checkbox");
            const checkboxCount = await checkboxes.count();
            console.log(`  Checkboxes found: ${checkboxCount}`);

            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = checkboxes.nth(i);
                const isChecked = await checkbox.isChecked();
                console.log(
                    `    Checkbox ${i + 1}: checked=${isChecked}`,
                );
            }

            // Check list role
            const todoList = page.getByRole("list");
            const listCount = await todoList.count();
            console.log(`\n  Lists with role: ${listCount}`);

            // Check links/navigation
            const links = page.getByRole("link");
            const linkCount = await links.count();
            console.log(`  Links found: ${linkCount}`);

            for (let i = 0; i < Math.min(linkCount, 5); i++) {
                const link = links.nth(i);
                const text = await link.textContent();
                const href = await link.getAttribute("href");
                console.log(
                    `    Link ${i + 1}: "${text?.trim()}" → ${href}`,
                );
            }

            // Run ARIA-specific axe rules
            const ariaResults = await new AxeBuilder({ page })
                .withTags(["cat.aria"])
                .analyze();

            console.log(
                `\n  ARIA axe rules: ${ariaResults.violations.length} violations, ${ariaResults.passes.length} passes`,
            );
            if (ariaResults.violations.length > 0) {
                ariaResults.violations.forEach((v) => {
                    console.log(
                        `    ❌ ${v.id}: ${v.help}`,
                    );
                });
            }

            console.log("\n  💡 ARIA BEST PRACTICES:");
            console.log(
                '     1. First rule of ARIA: don\'t use ARIA (use semantic HTML)',
            );
            console.log(
                "     2. Use aria-label when visible text isn't enough",
            );
            console.log(
                "     3. Use aria-live for dynamic content updates",
            );
            console.log(
                "     4. Test with a screen reader to verify ARIA works\n",
            );

            expect(ariaResults.violations).toBeDefined();
        });

        /**
         * TEST 5: Color Contrast Focused Audit
         * -------------------------------------
         * Goal: Deep-dive into color contrast issues with detailed
         *       reporting of actual vs required contrast ratios.
         */
        test("Test 5: Color contrast focused audit", async ({ page }) => {
            await page.goto(GREENKART_URL);

            const contrastResults = await new AxeBuilder({ page })
                .withRules(["color-contrast"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  COLOR CONTRAST AUDIT");
            console.log("=".repeat(60));

            if (contrastResults.violations.length === 0) {
                console.log(
                    "\n  ✅ All text meets WCAG 2 AA contrast requirements!",
                );
            } else {
                const violation = contrastResults.violations[0];
                console.log(
                    `\n  ${violation.nodes.length} element(s) with contrast issues:\n`,
                );

                violation.nodes.forEach((node, i) => {
                    console.log(`  Element ${i + 1}:`);
                    console.log(
                        `    HTML: ${node.html.substring(0, 100)}`,
                    );

                    // Extract contrast info from failureSummary
                    if (node.failureSummary) {
                        const lines = node.failureSummary.split("\n");
                        lines.forEach((line) => {
                            const trimmed = line.trim();
                            if (
                                trimmed.includes("contrast") ||
                                trimmed.includes("color") ||
                                trimmed.includes("Expected")
                            ) {
                                console.log(`    ${trimmed}`);
                            }
                        });
                    }
                    console.log("");
                });
            }

            console.log("  📏 CONTRAST RATIO CHEAT SHEET:");
            console.log(
                "     Normal text:  4.5:1 (AA) | 7:1 (AAA)",
            );
            console.log(
                "     Large text:   3:1 (AA)   | 4.5:1 (AAA)",
            );
            console.log(
                "     Large = ≥18pt or ≥14pt bold",
            );
            console.log(
                "\n  🔧 TOOLS: WebAIM Contrast Checker, Chrome DevTools\n",
            );

            expect(contrastResults.violations).toBeDefined();
        });

        /**
         * TEST 6: Mobile Viewport Accessibility
         * --------------------------------------
         * Goal: Test accessibility at mobile viewport sizes.
         *       Mobile layouts can break a11y by:
         *       - Hiding navigation behind hamburger menus
         *       - Shrinking touch targets below 44x44px
         *       - Removing labels to save space
         *       - Breaking reflow (horizontal scroll)
         */
        test("Test 6: Mobile viewport accessibility", async ({
            browser,
        }) => {
            // Create a mobile context using Playwright's devices
            const iPhone = devices["iPhone 13"];
            const mobileContext = await browser.newContext({
                ...iPhone,
            });
            const mobilePage = await mobileContext.newPage();

            // Also create a desktop context for comparison
            const desktopContext = await browser.newContext({
                viewport: { width: 1280, height: 720 },
            });
            const desktopPage = await desktopContext.newPage();

            // Scan both
            await mobilePage.goto(GREENKART_URL);
            await desktopPage.goto(GREENKART_URL);

            const mobileResults = await new AxeBuilder({
                page: mobilePage,
            }).analyze();
            const desktopResults = await new AxeBuilder({
                page: desktopPage,
            }).analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  MOBILE vs DESKTOP ACCESSIBILITY");
            console.log("=".repeat(60));

            console.log(
                `\n  📱 Mobile (${iPhone.viewport.width}x${iPhone.viewport.height}):`,
            );
            console.log(
                `     Violations: ${mobileResults.violations.length}`,
            );
            mobileResults.violations.forEach((v) => {
                console.log(
                    `       [${v.impact}] ${v.id}: ${v.help}`,
                );
            });

            console.log(
                "\n  🖥️  Desktop (1280x720):",
            );
            console.log(
                `     Violations: ${desktopResults.violations.length}`,
            );
            desktopResults.violations.forEach((v) => {
                console.log(
                    `       [${v.impact}] ${v.id}: ${v.help}`,
                );
            });

            // Find mobile-only issues
            const desktopIds = new Set(
                desktopResults.violations.map((v) => v.id),
            );
            const mobileOnly = mobileResults.violations.filter(
                (v) => !desktopIds.has(v.id),
            );

            if (mobileOnly.length > 0) {
                console.log(
                    "\n  📱 Mobile-ONLY violations (not on desktop):",
                );
                mobileOnly.forEach((v) => {
                    console.log(`    🆕 ${v.id}: ${v.help}`);
                });
            } else {
                console.log(
                    "\n  ✅ No mobile-specific accessibility issues!",
                );
            }

            console.log(
                "\n  💡 MOBILE A11Y CHECKLIST:",
            );
            console.log(
                "     ☐ Touch targets ≥ 44x44px (WCAG 2.5.5)",
            );
            console.log(
                "     ☐ Content reflows at 320px (no horizontal scroll)",
            );
            console.log(
                "     ☐ Orientation not locked (WCAG 1.3.4)",
            );
            console.log(
                "     ☐ Labels visible on mobile (not hidden for space)\n",
            );

            await mobileContext.close();
            await desktopContext.close();
        });

        /**
         * TEST 7: Focus Management After Actions
         * ----------------------------------------
         * Goal: Verify that focus is managed correctly after user actions.
         *
         * GOOD focus management:
         *   - After adding a todo → focus stays on input
         *   - After deleting a todo → focus moves to next item
         *   - After closing a modal → focus returns to trigger
         */
        test("Test 7: Focus management after actions — TodoMVC", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  FOCUS MANAGEMENT AUDIT");
            console.log("=".repeat(60));

            // Check 1: After adding a todo, focus stays on input
            const todoInput = page.getByPlaceholder(
                "What needs to be done?",
            );
            await todoInput.fill("Focus test item");
            await todoInput.press("Enter");

            const focusAfterAdd = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    tag: el?.tagName.toLowerCase(),
                    placeholder:
                        el?.getAttribute("placeholder") || "none",
                    className: el?.className || "",
                };
            });

            console.log(
                `\n  After adding todo:`,
            );
            console.log(
                `    Focused element: <${focusAfterAdd.tag}> placeholder="${focusAfterAdd.placeholder}"`,
            );
            const inputRetainsFocus =
                focusAfterAdd.tag === "input" &&
                focusAfterAdd.placeholder.includes("done");
            console.log(
                `    Focus on input: ${inputRetainsFocus ? "✅ YES" : "❌ NO"}`,
            );

            // Check 2: After checking a todo, focus management
            await todoInput.fill("Second item");
            await todoInput.press("Enter");

            const checkbox = page
                .getByTestId("todo-item")
                .first()
                .getByRole("checkbox");
            await checkbox.check();

            const focusAfterCheck = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    tag: el?.tagName.toLowerCase(),
                    role: el?.getAttribute("role") || "none",
                    type: el?.getAttribute("type") || "none",
                };
            });

            console.log(
                `\n  After checking checkbox:`,
            );
            console.log(
                `    Focused element: <${focusAfterCheck.tag}> role="${focusAfterCheck.role}" type="${focusAfterCheck.type}"`,
            );

            // Check 3: Escape key on editing should return focus
            const todoItem = page.getByTestId("todo-item").last();
            await todoItem.getByRole("checkbox").focus();
            await page.keyboard.press("Escape");

            const focusAfterEscape = await page.evaluate(() => {
                const el = document.activeElement;
                return el?.tagName.toLowerCase() || "none";
            });

            console.log(
                `\n  After Escape key:`,
            );
            console.log(
                `    Focused element: <${focusAfterEscape}>`,
            );

            console.log(
                "\n  💡 FOCUS MANAGEMENT RULES:",
            );
            console.log(
                "     1. After add → focus stays on input (ready for next)",
            );
            console.log(
                "     2. After delete → focus moves to nearest item",
            );
            console.log(
                "     3. After modal close → focus returns to trigger",
            );
            console.log(
                "     4. After error → focus moves to error message",
            );
            console.log(
                "     5. Never lose focus (no focus on <body>)\n",
            );

            expect(focusAfterAdd.tag).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. DYNAMIC CONTENT: Always scan AFTER state changes
 *    Compare before/after to catch interaction-induced bugs
 *
 * 2. KEYBOARD: Tab through everything, verify:
 *    - Focus visible, logical order, no traps, Enter/Space work
 *
 * 3. ARIA: First rule — don't use ARIA (prefer semantic HTML)
 *    When needed: aria-label, aria-live, role, aria-expanded
 *
 * 4. COLOR CONTRAST: 4.5:1 normal, 3:1 large (AA)
 *    Use WebAIM Contrast Checker tool
 *
 * 5. MOBILE: Test with real device viewports
 *    Touch targets ≥ 44px, no horizontal scroll, labels visible
 *
 * 6. FOCUS MANAGEMENT: Track where focus goes after every action
 *    Focus should never be lost or move unexpectedly
 *
 * NEXT: Module 09 covers CI/CD integration — thresholds,
 *       GitHub Actions, and automated a11y gates.
 * ============================================================================
 */
