import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * MODULE 03: TARGETED SCANNING — Scan Specific Page Sections
 * ============================================================================
 *
 * WHAT: Instead of scanning the ENTIRE page, you can tell axe to scan
 *       only specific sections using include() and exclude().
 *
 * WHY:  Real-world reasons to use targeted scanning:
 *       1. Large pages — scanning everything is slow and noisy
 *       2. Third-party widgets — you can't fix ads/chat widgets, so exclude them
 *       3. Incremental fixes — focus on one section at a time
 *       4. New feature testing — scan only the component you just built
 *       5. Known issues — exclude sections with accepted violations
 *
 * HOW:
 *   new AxeBuilder({ page })
 *     .include('#main-content')     // Only scan this section
 *     .exclude('#third-party-ad')   // Skip this section
 *     .analyze();
 *
 * ANALOGY: It's like a building inspector —
 *   Full scan = inspect the entire building
 *   include() = "just inspect the kitchen"
 *   exclude() = "inspect everything EXCEPT the garage"
 *   Both = "inspect the kitchen but skip the pantry"
 *
 * SELECTOR TYPES YOU CAN USE:
 *   - CSS selector:  '.product-list', '#header', 'nav'
 *   - Multiple:      chain .include().include() for multiple areas
 *   - Nested:        .include('.main').exclude('.main .sidebar')
 *
 * OFFICIAL DOCS:
 *   - https://playwright.dev/docs/accessibility-testing#scanning-a-specific-part-of-a-page
 *   - https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright#axebuilderincludeselector-string
 *
 * ============================================================================
 */

test.describe(
    "Module 03: Targeted Scanning",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Full Page Scan vs Targeted Scan — See the Difference
         * -------------------------------------------------------------
         * Goal: Run a full scan, then scan only the product list area.
         *       Compare the violation counts to see how targeting reduces noise.
         */
        test("Test 1: Full page vs targeted scan — compare violation counts", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Full page scan
            const fullResults = await new AxeBuilder({ page }).analyze();

            // Targeted scan — only the product list area
            // GreenKart has products inside a container with class "products-wrapper"
            const targetedResults = await new AxeBuilder({ page })
                .include(".products-wrapper")
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  FULL PAGE vs TARGETED SCAN");
            console.log("=".repeat(60));
            console.log(
                `\n  Full page violations:     ${fullResults.violations.length}`,
            );
            console.log(
                `  Targeted violations:      ${targetedResults.violations.length}`,
            );
            console.log(
                `  Reduction:                ${fullResults.violations.length - targetedResults.violations.length} fewer rules triggered`,
            );

            console.log("\n  Full page rules:");
            fullResults.violations.forEach((v) => {
                console.log(
                    `    • ${v.id} (${v.nodes.length} elements)`,
                );
            });

            console.log("\n  Targeted scan rules (products-wrapper only):");
            if (targetedResults.violations.length === 0) {
                console.log("    ✅ No violations in this section!");
            } else {
                targetedResults.violations.forEach((v) => {
                    console.log(
                        `    • ${v.id} (${v.nodes.length} elements)`,
                    );
                });
            }

            console.log(
                "\n  💡 Targeted scanning focuses your effort on one section at a time.\n",
            );

            expect(fullResults.violations).toBeDefined();
            expect(targetedResults.violations).toBeDefined();
        });

        /**
         * TEST 2: Include — Scan Only the Header/Navigation
         * --------------------------------------------------
         * Goal: Scan just the top navigation bar.
         *
         * WHY: Navigation is critical for a11y — it's the first thing
         *      screen reader users interact with. If nav links don't
         *      have accessible names, users can't navigate the site.
         */
        test("Test 2: Include — scan only the header area", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Scan only the header/navigation area
            const headerResults = await new AxeBuilder({ page })
                .include(".brand")
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  TARGETED: Header/Brand Area Only");
            console.log("=".repeat(60));
            console.log(
                `\n  Violations in header: ${headerResults.violations.length}`,
            );
            console.log(
                `  Passes in header:    ${headerResults.passes.length}`,
            );

            if (headerResults.violations.length > 0) {
                headerResults.violations.forEach((v) => {
                    console.log(
                        `\n  ❌ ${v.id}: ${v.description}`,
                    );
                    v.nodes.forEach((node) => {
                        console.log(
                            `     Element: ${node.html.substring(0, 80)}`,
                        );
                    });
                });
            } else {
                console.log("  ✅ Header area is fully accessible!");
            }

            console.log(
                '\n  💡 Use include() to audit one section at a time — "divide and conquer".\n',
            );
            expect(headerResults.violations).toBeDefined();
        });

        /**
         * TEST 3: Exclude — Skip Known Problematic Areas
         * -----------------------------------------------
         * Goal: Scan the full page but EXCLUDE a section that has
         *       known/accepted violations.
         *
         * REAL-WORLD USE CASE:
         *   - Third-party chat widgets you can't modify
         *   - Legacy sections being redesigned
         *   - Advertisements injected by ad networks
         */
        test("Test 3: Exclude — skip specific sections", async ({ page }) => {
            await page.goto(GREENKART_URL);

            // Full scan for comparison
            const fullResults = await new AxeBuilder({ page }).analyze();

            // Scan everything EXCEPT the product area (forms have many label issues)
            const excludeResults = await new AxeBuilder({ page })
                .exclude(".products-wrapper")
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  EXCLUDE: Scanning Without Product Area");
            console.log("=".repeat(60));

            // Count total affected elements
            const fullElementCount = fullResults.violations.reduce(
                (sum, v) => sum + v.nodes.length,
                0,
            );
            const excludeElementCount = excludeResults.violations.reduce(
                (sum, v) => sum + v.nodes.length,
                0,
            );

            console.log(
                `\n  Full scan:     ${fullResults.violations.length} rules, ${fullElementCount} elements`,
            );
            console.log(
                `  With exclude:  ${excludeResults.violations.length} rules, ${excludeElementCount} elements`,
            );
            console.log(
                `  Excluded:      ${fullElementCount - excludeElementCount} elements removed from results`,
            );

            console.log(
                "\n  💡 WHEN TO USE exclude():",
            );
            console.log(
                "     • Third-party widgets you can't control",
            );
            console.log(
                "     • Legacy sections scheduled for redesign",
            );
            console.log(
                "     • Accepted violations documented in your a11y policy\n",
            );

            expect(excludeResults.violations).toBeDefined();
        });

        /**
         * TEST 4: Combining Include and Exclude
         * --------------------------------------
         * Goal: Scan a section but skip a sub-section within it.
         *
         * Example: Scan the product list but skip the search form
         *          (because you already fixed it separately).
         */
        test("Test 4: Combining include and exclude for surgical precision", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Include the entire wrapper, but exclude the search area
            const surgicalResults = await new AxeBuilder({ page })
                .include("body")
                .exclude(".search-wrappper") // Note: GreenKart has a typo in their class name
                .analyze();

            // For comparison — include with no exclude
            const includeOnly = await new AxeBuilder({ page })
                .include("body")
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  SURGICAL SCAN: Include + Exclude Combined");
            console.log("=".repeat(60));

            const surgicalElements = surgicalResults.violations.reduce(
                (sum, v) => sum + v.nodes.length,
                0,
            );
            const includeElements = includeOnly.violations.reduce(
                (sum, v) => sum + v.nodes.length,
                0,
            );

            console.log(
                `\n  Body only:                ${includeOnly.violations.length} rules, ${includeElements} elements`,
            );
            console.log(
                `  Body minus search area:   ${surgicalResults.violations.length} rules, ${surgicalElements} elements`,
            );

            console.log("\n  🔬 PATTERN: Surgical scanning");
            console.log(
                "     new AxeBuilder({ page })",
            );
            console.log(
                '       .include("#main-content")   // scan this',
            );
            console.log(
                '       .exclude("#search-form")    // but not this',
            );
            console.log(
                '       .exclude("#third-party")    // or this',
            );
            console.log("       .analyze();\n");

            expect(surgicalResults.violations).toBeDefined();
        });

        /**
         * TEST 5: Scan After Adding Todo Items (TodoMVC)
         * -----------------------------------------------
         * Goal: Add items to TodoMVC, then scan the todo list specifically.
         *
         * This shows how targeted scanning works with DYNAMIC content —
         * the todo list only has items AFTER you add them.
         */
        test("Test 5: Scan specific dynamic content — TodoMVC todo list", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            // Add some todo items to create content
            const todoInput = page.getByPlaceholder("What needs to be done?");
            await todoInput.fill("Learn axe-core basics");
            await todoInput.press("Enter");
            await todoInput.fill("Master targeted scanning");
            await todoInput.press("Enter");
            await todoInput.fill("Become accessibility expert");
            await todoInput.press("Enter");

            // Now scan ONLY the todo list section
            const todoListResults = await new AxeBuilder({ page })
                .include(".todo-list")
                .analyze();

            // Also scan the footer (filter buttons)
            const footerResults = await new AxeBuilder({ page })
                .include(".footer")
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  TARGETED SCAN: TodoMVC Dynamic Content");
            console.log("=".repeat(60));

            console.log("\n  📝 Todo List Section:");
            console.log(
                `     Violations: ${todoListResults.violations.length}`,
            );
            console.log(`     Passes: ${todoListResults.passes.length}`);
            if (todoListResults.violations.length > 0) {
                todoListResults.violations.forEach((v) => {
                    console.log(
                        `     ❌ ${v.id}: ${v.description}`,
                    );
                });
            } else {
                console.log("     ✅ Todo list is fully accessible!");
            }

            console.log("\n  📊 Footer Section (filters):");
            console.log(
                `     Violations: ${footerResults.violations.length}`,
            );
            console.log(`     Passes: ${footerResults.passes.length}`);
            if (footerResults.violations.length > 0) {
                footerResults.violations.forEach((v) => {
                    console.log(
                        `     ❌ ${v.id}: ${v.description}`,
                    );
                });
            } else {
                console.log("     ✅ Footer is fully accessible!");
            }

            console.log(
                "\n  💡 Targeted scans are perfect for testing individual components",
            );
            console.log(
                "     after user interactions create dynamic content.\n",
            );

            expect(todoListResults.violations).toBeDefined();
            expect(footerResults.violations).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. include(selector) — scan ONLY this section
 *    exclude(selector) — scan everything EXCEPT this section
 *    Combine both for surgical precision
 *
 * 2. Real-world uses for targeted scanning:
 *    - Large pages: scan one section at a time
 *    - Third-party content: exclude what you can't control
 *    - New features: scan only the component you just built
 *    - Dynamic content: scan after user interactions
 *
 * 3. Targeted scanning reduces noise — focus on what matters
 *
 * 4. You can chain multiple .include() and .exclude() calls
 *
 * 5. Selectors are standard CSS selectors — same as querySelector()
 *
 * NEXT: Module 04 teaches you to control WHICH RULES axe runs
 *       (filter by WCAG standard, enable/disable specific rules).
 * ============================================================================
 */
