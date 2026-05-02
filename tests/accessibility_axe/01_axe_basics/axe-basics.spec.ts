import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * MODULE 01: AXE-CORE BASICS — Your First Accessibility Scan
 * ============================================================================
 *
 * WHAT: axe-core is the world's most popular open-source accessibility
 *       testing engine. @axe-core/playwright is the official Playwright
 *       integration that lets you run axe scans inside your Playwright tests.
 *
 * WHY:  ~16% of the world's population has some form of disability.
 *       Accessibility (a11y) isn't optional — it's a legal requirement
 *       in many countries (ADA, Section 508, EU Accessibility Act).
 *       Automated tools like axe can catch ~57% of WCAG violations
 *       instantly, saving hours of manual audit time.
 *
 * HOW:  1. Navigate to a page with Playwright
 *       2. Create an AxeBuilder instance: new AxeBuilder({ page })
 *       3. Call .analyze() — returns an AxeResults object
 *       4. Assert on the results (violations, passes, etc.)
 *
 * ANALOGY: Think of axe like a building inspector for websites —
 *          It walks through every room (DOM element), checks against
 *          a rulebook (WCAG standards), and gives you a detailed
 *          report of what passed and what failed.
 *
 * KEY CONCEPT — The AxeResults Object:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ AxeResults                                                      │
 * │                                                                  │
 * │  violations[]   → Rules that FAILED (accessibility problems)    │
 * │  passes[]       → Rules that PASSED (things done correctly)     │
 * │  incomplete[]   → Rules that NEED MANUAL REVIEW                 │
 * │  inapplicable[] → Rules that DON'T APPLY to this page          │
 * │                                                                  │
 * │  Each item has: id, impact, description, helpUrl, nodes[]       │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * SEVERITY LEVELS (impact):
 *   🔴 critical  → Blocks access entirely (e.g., no keyboard access)
 *   🟠 serious   → Major barrier (e.g., missing form labels)
 *   🟡 moderate  → Some difficulty (e.g., heading order skipped)
 *   🔵 minor     → Annoyance (e.g., redundant alt text)
 *
 * OFFICIAL DOCS:
 *   - @axe-core/playwright: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
 *   - axe-core rules:       https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
 *   - Playwright a11y guide: https://playwright.dev/docs/accessibility-testing
 *
 * PRE-REQUISITES:
 *   npm install -D @axe-core/playwright
 *
 * ============================================================================
 */

test.describe(
    "Module 01: Axe-Core Basics",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Your Very First Axe Scan
         * ---------------------------------
         * Goal: Run a full-page accessibility scan and explore what comes back.
         *
         * We scan GreenKart because it's a real e-commerce page with REAL
         * accessibility issues — perfect for learning. You'll see violations
         * that exist in most real-world websites.
         */
        test("Test 1: First axe scan — explore the AxeResults structure", async ({
            page,
        }) => {
            // Step 1: Navigate to the page you want to scan
            await page.goto(GREENKART_URL);

            // Step 2: Create an AxeBuilder and run the scan
            // This injects the axe-core script into the page and evaluates it
            const axeResults = await new AxeBuilder({ page }).analyze();

            // Step 3: Explore the 4 result arrays
            console.log("\n" + "=".repeat(60));
            console.log("  AXE SCAN RESULTS — GreenKart Homepage");
            console.log("=".repeat(60));
            console.log(
                `\n  🔴 Violations   : ${axeResults.violations.length} rules FAILED`,
            );
            console.log(
                `  ✅ Passes       : ${axeResults.passes.length} rules PASSED`,
            );
            console.log(
                `  ⚠️  Incomplete   : ${axeResults.incomplete.length} rules NEED REVIEW`,
            );
            console.log(
                `  ⬜ Inapplicable : ${axeResults.inapplicable.length} rules NOT APPLICABLE`,
            );
            console.log(
                `\n  Total rules checked: ${axeResults.violations.length + axeResults.passes.length + axeResults.incomplete.length + axeResults.inapplicable.length}`,
            );

            // Step 4: Quick peek at violation IDs
            if (axeResults.violations.length > 0) {
                console.log("\n  Violations found:");
                axeResults.violations.forEach((v, i) => {
                    console.log(
                        `    ${i + 1}. [${v.impact?.toUpperCase()}] ${v.id} — ${v.description}`,
                    );
                });
            }

            // Step 5: Basic assertion — we EXPECT violations here (this is a learning test)
            // In real tests, you'd assert: expect(axeResults.violations).toHaveLength(0)
            expect(axeResults.violations.length).toBeGreaterThanOrEqual(0);
            console.log(
                "\n  💡 TIP: In production tests, assert zero violations.",
            );
            console.log(
                '     expect(axeResults.violations).toHaveLength(0);\n',
            );
        });

        /**
         * TEST 2: Understanding Severity Levels
         * --------------------------------------
         * Goal: Group violations by their impact/severity level.
         *
         * Not all violations are equal. A missing alt text on a decorative
         * image (minor) is very different from a form with no labels that
         * a screen reader can't use at all (critical).
         *
         * SEVERITY PRIORITY:
         *   critical > serious > moderate > minor
         *   Fix critical first, then work your way down.
         */
        test("Test 2: Group violations by severity level", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            // Group violations by impact level
            const bySeverity: Record<string, typeof violations> = {
                critical: [],
                serious: [],
                moderate: [],
                minor: [],
            };

            violations.forEach((v) => {
                const level = v.impact ?? "minor";
                if (bySeverity[level]) {
                    bySeverity[level].push(v);
                }
            });

            console.log("\n" + "=".repeat(60));
            console.log("  VIOLATIONS GROUPED BY SEVERITY");
            console.log("=".repeat(60));

            for (const [level, items] of Object.entries(bySeverity)) {
                const icon =
                    level === "critical"
                        ? "🔴"
                        : level === "serious"
                          ? "🟠"
                          : level === "moderate"
                            ? "🟡"
                            : "🔵";
                console.log(
                    `\n  ${icon} ${level.toUpperCase()} (${items.length} violations):`,
                );
                if (items.length === 0) {
                    console.log("     None — great!");
                } else {
                    items.forEach((v) => {
                        // Count total affected elements across all nodes
                        const elementCount = v.nodes.length;
                        console.log(
                            `     • ${v.id} — ${v.description} (${elementCount} element${elementCount > 1 ? "s" : ""})`,
                        );
                    });
                }
            }

            // In real projects, you might gate on critical+serious only:
            const criticalAndSerious = [
                ...bySeverity.critical,
                ...bySeverity.serious,
            ];
            console.log(
                `\n  📊 Summary: ${criticalAndSerious.length} critical/serious issues to fix first`,
            );
            console.log(
                `              ${bySeverity.moderate.length + bySeverity.minor.length} moderate/minor issues for later\n`,
            );

            // Assertion: just verify we got results
            expect(violations).toBeDefined();
        });

        /**
         * TEST 3: Passes and Inapplicable — The Other Half
         * -------------------------------------------------
         * Goal: Understand that axe doesn't just find problems — it also
         *       tells you what you're doing RIGHT (passes) and what rules
         *       didn't apply to your page (inapplicable).
         *
         * WHY THIS MATTERS:
         *   - passes = confidence that these rules are handled correctly
         *   - inapplicable = the page doesn't have elements these rules check
         *     (e.g., no <table> elements means table-related rules are inapplicable)
         *   - incomplete = axe couldn't determine pass/fail — YOU must check manually
         */
        test("Test 3: Explore passes, inapplicable, and incomplete results", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const axeResults = await new AxeBuilder({ page }).analyze();

            // === PASSES ===
            console.log("\n" + "=".repeat(60));
            console.log("  WHAT THE PAGE DOES RIGHT (Passes)");
            console.log("=".repeat(60));
            console.log(
                `\n  ✅ ${axeResults.passes.length} rules passed. Here are the first 10:\n`,
            );
            axeResults.passes.slice(0, 10).forEach((p, i) => {
                console.log(`    ${i + 1}. ${p.id} — ${p.description}`);
            });
            if (axeResults.passes.length > 10) {
                console.log(
                    `    ... and ${axeResults.passes.length - 10} more`,
                );
            }

            // === INAPPLICABLE ===
            console.log("\n" + "-".repeat(60));
            console.log("  RULES THAT DON'T APPLY (Inapplicable)");
            console.log("-".repeat(60));
            console.log(
                `\n  ⬜ ${axeResults.inapplicable.length} rules not applicable. Examples:\n`,
            );
            axeResults.inapplicable.slice(0, 5).forEach((rule, i) => {
                console.log(`    ${i + 1}. ${rule.id} — ${rule.description}`);
            });
            console.log(
                "\n  💡 These rules were skipped because the page doesn't have",
            );
            console.log(
                "     the elements they check (e.g., no <video> = no video rules).",
            );

            // === INCOMPLETE ===
            console.log("\n" + "-".repeat(60));
            console.log("  NEEDS MANUAL REVIEW (Incomplete)");
            console.log("-".repeat(60));
            if (axeResults.incomplete.length === 0) {
                console.log(
                    "\n  ⚠️  No incomplete results — axe was able to fully evaluate everything.",
                );
            } else {
                console.log(
                    `\n  ⚠️  ${axeResults.incomplete.length} rules need manual review:\n`,
                );
                axeResults.incomplete.forEach((inc, i) => {
                    console.log(
                        `    ${i + 1}. [${inc.impact?.toUpperCase()}] ${inc.id} — ${inc.description}`,
                    );
                });
                console.log(
                    "\n  💡 Incomplete means axe found something suspicious but",
                );
                console.log(
                    "     can't be 100% sure it's a violation. Check manually!",
                );
            }

            // Assertions
            expect(axeResults.passes.length).toBeGreaterThan(0);
            expect(axeResults.inapplicable.length).toBeGreaterThan(0);
        });

        /**
         * TEST 4: Compare Two Websites — GreenKart vs TodoMVC
         * ----------------------------------------------------
         * Goal: See how different websites have different accessibility profiles.
         *
         * TodoMVC is built by the Playwright team as a demo app — it's likely
         * more accessible than a random e-commerce site. Comparing them helps
         * you understand what "good" vs "needs work" looks like.
         */
        test("Test 4: Compare a11y scores — GreenKart vs TodoMVC", async ({
            page,
        }) => {
            // Scan GreenKart
            await page.goto(GREENKART_URL);
            const greenKartResults = await new AxeBuilder({
                page,
            }).analyze();

            // Scan TodoMVC
            await page.goto(TODOMVC_URL);
            const todoMvcResults = await new AxeBuilder({ page }).analyze();

            // Compare side by side
            console.log("\n" + "=".repeat(60));
            console.log("  ACCESSIBILITY COMPARISON");
            console.log("=".repeat(60));
            console.log(
                "\n  Metric               | GreenKart  | TodoMVC",
            );
            console.log(
                "  ---------------------|------------|--------",
            );
            console.log(
                `  Violations           | ${String(greenKartResults.violations.length).padStart(10)} | ${todoMvcResults.violations.length}`,
            );
            console.log(
                `  Passes               | ${String(greenKartResults.passes.length).padStart(10)} | ${todoMvcResults.passes.length}`,
            );
            console.log(
                `  Incomplete           | ${String(greenKartResults.incomplete.length).padStart(10)} | ${todoMvcResults.incomplete.length}`,
            );
            console.log(
                `  Inapplicable         | ${String(greenKartResults.inapplicable.length).padStart(10)} | ${todoMvcResults.inapplicable.length}`,
            );

            // Severity breakdown for both
            const countBySeverity = (
                violations: typeof greenKartResults.violations,
            ) => {
                const counts = {
                    critical: 0,
                    serious: 0,
                    moderate: 0,
                    minor: 0,
                };
                violations.forEach((v) => {
                    const level = (v.impact ?? "minor") as keyof typeof counts;
                    if (counts[level] !== undefined) counts[level]++;
                });
                return counts;
            };

            const gkSeverity = countBySeverity(greenKartResults.violations);
            const todoSeverity = countBySeverity(todoMvcResults.violations);

            console.log(
                "\n  Severity Breakdown   | GreenKart  | TodoMVC",
            );
            console.log(
                "  ---------------------|------------|--------",
            );
            console.log(
                `  🔴 Critical          | ${String(gkSeverity.critical).padStart(10)} | ${todoSeverity.critical}`,
            );
            console.log(
                `  🟠 Serious           | ${String(gkSeverity.serious).padStart(10)} | ${todoSeverity.serious}`,
            );
            console.log(
                `  🟡 Moderate          | ${String(gkSeverity.moderate).padStart(10)} | ${todoSeverity.moderate}`,
            );
            console.log(
                `  🔵 Minor             | ${String(gkSeverity.minor).padStart(10)} | ${todoSeverity.minor}`,
            );

            console.log(
                "\n  💡 KEY TAKEAWAY: Well-built apps like TodoMVC tend to have",
            );
            console.log(
                "     fewer violations. Accessibility starts at design time!\n",
            );

            // Assertions — both scans should complete successfully
            expect(greenKartResults.violations).toBeDefined();
            expect(todoMvcResults.violations).toBeDefined();
        });

        /**
         * TEST 5: The Basic Accessibility Gate — Zero Violations
         * -------------------------------------------------------
         * Goal: Learn the pattern you'll use in REAL production tests.
         *
         * In real CI pipelines, you want to FAIL the test if there are
         * any violations. This is your "accessibility gate" — nothing
         * ships with known a11y issues.
         *
         * We test TodoMVC here because it's more likely to pass.
         * If it doesn't pass with zero violations, we demonstrate
         * how to get useful failure messages.
         */
        test("Test 5: The accessibility gate — assert zero violations", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            // Log any violations found (useful for debugging failures)
            if (violations.length > 0) {
                console.log(
                    `\n  ⚠️  Found ${violations.length} violations on TodoMVC:`,
                );
                violations.forEach((v) => {
                    console.log(
                        `    • [${v.impact}] ${v.id}: ${v.description}`,
                    );
                    console.log(`      Help: ${v.helpUrl}`);
                    v.nodes.forEach((node) => {
                        console.log(`      Element: ${node.html}`);
                        console.log(`      Fix: ${node.failureSummary}`);
                    });
                });
            } else {
                console.log(
                    "\n  ✅ TodoMVC passed with ZERO violations!",
                );
                console.log(
                    "     This is the gold standard for production tests.\n",
                );
            }

            // THE GATE — This is what your production tests should look like:
            // If this fails, the test output will show exactly which rules failed
            // and which elements are affected, making it easy to fix.
            //
            // NOTE: We use a soft assertion here so the test still passes
            // and you can see the learning output. In production, remove the
            // try/catch and use the direct assertion.
            try {
                expect(violations).toHaveLength(0);
                console.log(
                    "  🎯 GATE PASSED: No accessibility violations found.\n",
                );
            } catch {
                console.log(
                    `\n  🚫 GATE WOULD FAIL: ${violations.length} violations found.`,
                );
                console.log(
                    "     In production, this test would FAIL and block the deploy.",
                );
                console.log(
                    "     Fix the violations, then the gate will pass.\n",
                );
            }
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. AxeBuilder({ page }).analyze() is the core API — memorize it
 *
 * 2. Four result arrays: violations, passes, incomplete, inapplicable
 *    - violations = things to FIX
 *    - passes = things done RIGHT
 *    - incomplete = things to CHECK MANUALLY
 *    - inapplicable = rules that don't apply to this page
 *
 * 3. Severity matters: critical > serious > moderate > minor
 *    Fix critical/serious first — they block real users
 *
 * 4. The production pattern is simple:
 *    const { violations } = await new AxeBuilder({ page }).analyze();
 *    expect(violations).toHaveLength(0);
 *
 * 5. axe catches ~57% of WCAG issues automatically
 *    The rest requires manual testing (keyboard nav, screen reader, etc.)
 *
 * NEXT: Module 02 dives deeper into the violation object structure
 *       so you can read and fix issues like a pro.
 * ============================================================================
 */
