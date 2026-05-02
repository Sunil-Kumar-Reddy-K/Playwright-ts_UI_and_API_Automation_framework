import { test as base, expect } from "@playwright/test";
import { AccessibilityHelper } from "./accessibility-helper";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * MODULE 06: POM INTEGRATION — AccessibilityHelper + Custom Fixtures
 * ============================================================================
 *
 * WHAT: Integrate axe scanning into your test framework using the Page
 *       Object Model pattern. Instead of writing raw AxeBuilder code in
 *       every test, use a reusable AccessibilityHelper class.
 *
 * WHY:  Benefits of the POM approach:
 *       1. DRY — scan logic is written once, used everywhere
 *       2. Configurable — default tags, excludes, disabled rules
 *       3. Assertion helpers — assertNoCriticalViolations(), assertWcag21AA()
 *       4. Custom fixture — inject `a11y` helper into any test automatically
 *       5. Consistent — every team member uses the same scan configuration
 *
 * HOW:  Two approaches demonstrated:
 *
 *       Approach 1: Manual instantiation
 *         const a11y = new AccessibilityHelper(page);
 *         await a11y.assertNoCriticalViolations();
 *
 *       Approach 2: Custom fixture (preferred)
 *         test("my test", async ({ a11y }) => {
 *           await a11y.assertNoCriticalViolations();
 *         });
 *
 * ANALOGY: It's like the difference between:
 *   - Mixing concrete by hand every time (raw AxeBuilder)
 *   - Having a concrete mixer on site (AccessibilityHelper)
 *   - Having concrete delivered pre-mixed (custom fixture)
 *
 * PATTERN: Follows the exact same pattern as your existing fixtures in
 *          features/steps/basepage.ts where Homepage, Cart, and Hrmpage
 *          are injected as fixtures.
 *
 * ============================================================================
 */

// ============================================================================
// CUSTOM FIXTURE: Extend Playwright's test with an `a11y` fixture
// ============================================================================
// This follows the exact pattern from features/steps/basepage.ts:
//   homepage: async ({ page }, use) => { await use(new Homepage(page)); }
//
// Now you can use `a11y` in any test just like `page` or `request`.

const test = base.extend<{ a11y: AccessibilityHelper }>({
    a11y: async ({ page }, use) => {
        const helper = new AccessibilityHelper(page, {
            // Default configuration for all tests using this fixture
            tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            excludeSelectors: [], // Add global excludes here
            disabledRules: [], // Add global disabled rules here
        });
        await use(helper);
    },
});

test.describe(
    "Module 06: POM Integration",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Using AccessibilityHelper — Manual Instantiation
         * ---------------------------------------------------------
         * Goal: Create an AccessibilityHelper instance manually and
         *       use its methods. This is the simplest approach.
         */
        test("Test 1: AccessibilityHelper — manual instantiation", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            // Create helper with custom options
            const a11y = new AccessibilityHelper(page, {
                tags: ["wcag2a", "wcag2aa"],
                disabledRules: ["color-contrast"], // Skip contrast for this test
            });

            console.log("\n" + "=".repeat(60));
            console.log("  MANUAL INSTANTIATION");
            console.log("=".repeat(60));

            // Get a summary
            const summary = await a11y.getViolationSummary();
            console.log(
                `\n  Total violations: ${summary.total}`,
            );
            console.log(`  Critical: ${summary.critical}`);
            console.log(`  Serious:  ${summary.serious}`);
            console.log(`  Moderate: ${summary.moderate}`);
            console.log(`  Minor:    ${summary.minor}`);

            // Log any violations found
            a11y.logViolations(summary.violations);

            console.log(
                "  💡 Manual instantiation gives you full control over options.\n",
            );

            expect(summary.total).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 2: Custom Fixture — Automatic Injection
         * ----------------------------------------------
         * Goal: Use the `a11y` fixture for cleaner test code.
         *       The fixture is injected automatically — no manual
         *       instantiation needed.
         *
         * Notice: We use `a11y` from the destructured test args,
         *         just like `page` or `request`.
         */
        test("Test 2: Custom fixture — a11y injected automatically", async ({
            page,
            a11y,
        }) => {
            await page.goto(TODOMVC_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  CUSTOM FIXTURE: a11y");
            console.log("=".repeat(60));

            // Use the fixture directly — no setup needed!
            const results = await a11y.scanFullPage();
            console.log(
                `\n  Full page scan: ${results.violations.length} violations`,
            );

            // Targeted scan
            const headerResults = await a11y.scanElement("header");
            console.log(
                `  Header scan:    ${headerResults.violations.length} violations`,
            );

            // WCAG scan using configured defaults
            const wcagResults = await a11y.scanWithTags();
            console.log(
                `  WCAG 2.1 AA:    ${wcagResults.violations.length} violations`,
            );

            console.log(
                "\n  💡 The fixture pattern is the cleanest — use it!\n",
            );

            expect(results.violations).toBeDefined();
        });

        /**
         * TEST 3: Combining POM Actions with A11Y Checks
         * -----------------------------------------------
         * Goal: Perform user actions using page interactions, then
         *       run an accessibility scan. This is how you test that
         *       your UI remains accessible after state changes.
         */
        test("Test 3: A11Y check after user interactions", async ({
            page,
            a11y,
        }) => {
            await page.goto(TODOMVC_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  A11Y AFTER USER INTERACTIONS");
            console.log("=".repeat(60));

            // Scan BEFORE any interaction
            const beforeResults = await a11y.scanFullPage();
            console.log(
                `\n  Before interaction: ${beforeResults.violations.length} violations`,
            );

            // Perform user actions — add todo items
            const todoInput = page.getByPlaceholder(
                "What needs to be done?",
            );
            await todoInput.fill("Learn accessibility testing");
            await todoInput.press("Enter");
            await todoInput.fill("Master axe-core");
            await todoInput.press("Enter");

            // Complete the first item
            const firstTodo = page.getByTestId("todo-item").first();
            await firstTodo.getByRole("checkbox").check();

            // Scan AFTER interaction
            const afterResults = await a11y.scanFullPage();
            console.log(
                `  After interaction:  ${afterResults.violations.length} violations`,
            );

            // Compare
            const newViolationIds = afterResults.violations
                .map((v) => v.id)
                .filter(
                    (id) =>
                        !beforeResults.violations.some((v) => v.id === id),
                );

            if (newViolationIds.length > 0) {
                console.log(
                    `\n  ⚠️  NEW violations introduced by user actions:`,
                );
                newViolationIds.forEach((id) => {
                    console.log(`    • ${id}`);
                });
            } else {
                console.log(
                    "\n  ✅ No new violations introduced by user actions!",
                );
            }

            console.log(
                "\n  💡 Always scan AFTER state changes — interactions can break a11y.\n",
            );

            expect(afterResults.violations).toBeDefined();
        });

        /**
         * TEST 4: Assertion Helpers — Gate Patterns
         * ------------------------------------------
         * Goal: Demonstrate the different assertion methods:
         *   - assertNoViolations() — strictest (zero tolerance)
         *   - assertNoCriticalViolations() — minimum gate
         *   - assertNoViolationsAtLevel("serious") — configurable
         *   - assertWcag21AA() — standard compliance gate
         */
        test("Test 4: Assertion helpers — different gate levels", async ({
            page,
            a11y,
        }) => {
            await page.goto(TODOMVC_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  ASSERTION HELPERS — Gate Patterns");
            console.log("=".repeat(60));

            // Get summary first to understand what we're working with
            const summary = await a11y.getViolationSummary();
            console.log(`\n  Current state: ${summary.total} total violations`);
            console.log(`    Critical: ${summary.critical} | Serious: ${summary.serious} | Moderate: ${summary.moderate} | Minor: ${summary.minor}`);

            // Gate 1: No critical violations (minimum)
            console.log(
                "\n  Gate 1: assertNoCriticalViolations()",
            );
            try {
                await a11y.assertNoCriticalViolations();
                console.log("    ✅ PASSED — no critical violations");
            } catch {
                console.log("    ❌ FAILED — critical violations found");
            }

            // Gate 2: No critical or serious (recommended)
            console.log(
                "\n  Gate 2: assertNoViolationsAtLevel('serious')",
            );
            try {
                await a11y.assertNoViolationsAtLevel("serious");
                console.log(
                    "    ✅ PASSED — no critical/serious violations",
                );
            } catch {
                console.log(
                    "    ❌ FAILED — critical or serious violations found",
                );
            }

            // Gate 3: Zero violations (strictest)
            console.log(
                "\n  Gate 3: assertNoViolations() — strictest",
            );
            try {
                await a11y.assertNoViolations();
                console.log("    ✅ PASSED — zero violations!");
            } catch {
                console.log(
                    "    ❌ FAILED — violations found (too strict for this page)",
                );
            }

            console.log("\n  💡 RECOMMENDED GATES:");
            console.log(
                "     CI pipeline:     assertNoCriticalViolations()",
            );
            console.log(
                "     PR review:       assertNoViolationsAtLevel('serious')",
            );
            console.log(
                "     New features:    assertNoViolations()",
            );
            console.log(
                "     Compliance:      assertWcag21AA()\n",
            );

            expect(summary.total).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 5: Configurable Helper — Different Options Per Page
         * ---------------------------------------------------------
         * Goal: Show that you can create different AccessibilityHelper
         *       instances with different configurations for different pages.
         */
        test("Test 5: Different configurations for different pages", async ({
            page,
        }) => {
            console.log("\n" + "=".repeat(60));
            console.log("  CONFIGURABLE: Different Options Per Page");
            console.log("=".repeat(60));

            // Strict config for new features
            const strictA11y = new AccessibilityHelper(page, {
                tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            });

            // Lenient config for legacy pages
            const lenientA11y = new AccessibilityHelper(page, {
                tags: ["wcag2a", "wcag2aa"],
                disabledRules: ["color-contrast", "region"],
            });

            // Scan TodoMVC with both configs
            await page.goto(TODOMVC_URL);

            const strictResults = await strictA11y.scanFullPage();
            const lenientResults = await lenientA11y.scanFullPage();

            console.log(
                `\n  Strict config:  ${strictResults.violations.length} violations`,
            );
            console.log(
                `  Lenient config: ${lenientResults.violations.length} violations`,
            );

            console.log("\n  💡 USE CASE: Migration strategy");
            console.log(
                "     New pages → strict config (zero violations)",
            );
            console.log(
                "     Legacy pages → lenient config (critical only)",
            );
            console.log(
                "     Gradually tighten legacy config as you fix issues\n",
            );

            expect(strictResults.violations).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. AccessibilityHelper is your reusable a11y utility:
 *    - scanFullPage(), scanElement(), scanWithTags()
 *    - assertNoViolations(), assertNoCriticalViolations()
 *    - assertNoViolationsAtLevel(), assertWcag21AA()
 *    - logViolations(), getViolationSummary()
 *
 * 2. Custom fixture pattern (PREFERRED):
 *    const test = base.extend<{ a11y: AccessibilityHelper }>({
 *      a11y: async ({ page }, use) => {
 *        await use(new AccessibilityHelper(page));
 *      },
 *    });
 *
 * 3. Always scan AFTER user interactions — state changes can break a11y
 *
 * 4. Use different gate levels for different contexts:
 *    CI → assertNoCriticalViolations()
 *    PR → assertNoViolationsAtLevel("serious")
 *    New features → assertNoViolations()
 *
 * 5. Different configs for different pages (strict for new, lenient for legacy)
 *
 * NEXT: Module 07 teaches you to generate accessibility reports
 *       (HTML, JSON, custom reporter).
 * ============================================================================
 */
