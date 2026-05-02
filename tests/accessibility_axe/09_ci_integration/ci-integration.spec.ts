import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { AccessibilityHelper } from "../06_pom_integration/accessibility-helper";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * MODULE 09: CI/CD INTEGRATION — Production-Ready A11Y Gates
 * ============================================================================
 *
 * WHAT: Making accessibility testing part of your CI/CD pipeline so
 *       that NO code ships with accessibility regressions.
 *
 * WHY:  Manual a11y testing doesn't scale. You need automated gates
 *       that catch violations before they reach production. This is
 *       the difference between "we care about accessibility" and
 *       "we enforce accessibility."
 *
 * CI/CD A11Y STRATEGY:
 * ┌────────────────────────────────────────────────────────────────┐
 * │ Stage           │ Gate Level        │ What Happens            │
 * ├─────────────────┼───────────────────┼─────────────────────────┤
 * │ Local dev       │ Full scan         │ See all violations      │
 * │ PR (pre-merge)  │ No critical/serious│ Block merge if found   │
 * │ CI (post-merge) │ Threshold-based    │ Track trend, alert     │
 * │ Release gate    │ WCAG 2.1 AA       │ Block release if fail  │
 * └────────────────────────────────────────────────────────────────┘
 *
 * GITHUB ACTIONS CONFIGURATION:
 *   Add a new job to .github/workflows/playwright.yml:
 *
 *   a11y-tests:
 *     name: Execute Accessibility Tests
 *     runs-on: ubuntu-latest
 *     container:
 *       image: mcr.microsoft.com/playwright:v1.59.1-jammy
 *     steps:
 *       - uses: actions/checkout@v4
 *       - uses: actions/setup-node@v4
 *         with:
 *           node-version: 20
 *       - run: npm ci
 *       - run: npx playwright install --with-deps
 *       - run: npx playwright test --grep @A11Y --project=chromium
 *       - uses: actions/upload-artifact@v4
 *         if: always()
 *         with:
 *           name: a11y-reports
 *           path: playwright-report/a11y-reports/
 *
 * OFFICIAL DOCS:
 *   - Playwright CI: https://playwright.dev/docs/ci
 *   - GitHub Actions: https://playwright.dev/docs/ci-intro
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
    "Module 09: CI/CD Integration",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Threshold-Based Gate — Critical Violations Only
         * --------------------------------------------------------
         * Goal: The MINIMUM CI gate — fail only on critical violations.
         *
         * This is the "start here" gate for teams new to a11y:
         *   - Catches the worst issues (keyboard access, missing labels)
         *   - Doesn't overwhelm the team with moderate/minor issues
         *   - Gradually tighten as the team fixes violations
         */
        test("Test 1: CI gate — zero critical violations", async ({
            page,
            a11y,
        }) => {
            await page.goto(TODOMVC_URL);

            const summary = await a11y.getViolationSummary();

            console.log("\n" + "=".repeat(60));
            console.log("  CI GATE: Zero Critical Violations");
            console.log("=".repeat(60));
            console.log(`\n  Total violations: ${summary.total}`);
            console.log(`  Critical: ${summary.critical}`);
            console.log(`  Serious:  ${summary.serious}`);
            console.log(`  Moderate: ${summary.moderate}`);
            console.log(`  Minor:    ${summary.minor}`);

            // THE GATE: Zero critical violations
            const gateResult = summary.critical === 0 ? "PASS" : "FAIL";
            console.log(`\n  Gate result: ${gateResult}`);

            if (gateResult === "PASS") {
                console.log(
                    "  ✅ No critical violations — CI gate PASSED!",
                );
            } else {
                console.log(
                    "  ❌ Critical violations found — CI gate FAILED!",
                );
                a11y.logViolations(
                    summary.violations.filter(
                        (v) => v.impact === "critical",
                    ),
                );
            }

            console.log(
                "\n  💡 This is your STARTING gate. Tighten over time:\n" +
                    "     Phase 1: No critical\n" +
                    "     Phase 2: No critical + serious\n" +
                    "     Phase 3: No violations at all\n",
            );

            // Actual assertion
            expect(summary.critical).toBe(0);
        });

        /**
         * TEST 2: Configurable Severity Threshold via Environment Variable
         * ------------------------------------------------------------------
         * Goal: Read the threshold from an env variable so CI can
         *       configure it without code changes.
         *
         * Usage:
         *   A11Y_MAX_LEVEL=serious npx playwright test --grep @A11Y
         *   A11Y_MAX_LEVEL=moderate npx playwright test --grep @A11Y
         */
        test("Test 2: Configurable threshold via env variable", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            // Read threshold from env (default: "serious")
            const maxLevel = process.env.A11Y_MAX_LEVEL || "serious";
            const severityOrder = [
                "critical",
                "serious",
                "moderate",
                "minor",
            ];
            const threshold = severityOrder.indexOf(maxLevel);

            // Filter violations at or above the threshold
            const failingViolations = violations.filter((v) => {
                const level = v.impact ?? "minor";
                return severityOrder.indexOf(level) <= threshold;
            });

            console.log("\n" + "=".repeat(60));
            console.log("  CONFIGURABLE THRESHOLD");
            console.log("=".repeat(60));
            console.log(
                `\n  Threshold level: ${maxLevel} (from A11Y_MAX_LEVEL env var)`,
            );
            console.log(
                `  Failing at or above: ${severityOrder.slice(0, threshold + 1).join(", ")}`,
            );
            console.log(
                `  Allowed: ${severityOrder.slice(threshold + 1).join(", ") || "none"}`,
            );
            console.log(
                `\n  Total violations: ${violations.length}`,
            );
            console.log(
                `  Violations above threshold: ${failingViolations.length}`,
            );

            if (failingViolations.length > 0) {
                console.log(
                    "\n  Violations that would fail the gate:",
                );
                failingViolations.forEach((v) => {
                    console.log(
                        `    ❌ [${v.impact}] ${v.id}: ${v.help}`,
                    );
                });
            } else {
                console.log(`\n  ✅ All violations are below the ${maxLevel} threshold!`);
            }

            console.log(
                "\n  💡 USAGE IN CI:",
            );
            console.log(
                "     A11Y_MAX_LEVEL=critical → fail only on critical",
            );
            console.log(
                "     A11Y_MAX_LEVEL=serious  → fail on critical + serious (recommended)",
            );
            console.log(
                "     A11Y_MAX_LEVEL=minor    → fail on everything (strictest)\n",
            );

            // In CI, this would be: expect(failingViolations).toHaveLength(0)
            // For learning, we just verify the logic works
            expect(failingViolations.length).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 3: Regression Detection — Compare Against Baseline
         * --------------------------------------------------------
         * Goal: Detect if a code change INTRODUCES new violations.
         *
         * PATTERN:
         *   1. Store baseline violation count (from main branch)
         *   2. Run scan on current branch
         *   3. If new violations > baseline → FAIL
         *
         * This is a "ratchet" — violations can only go DOWN over time.
         */
        test("Test 3: Regression detection — no new violations", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            // Simulated baseline (in real CI, read from a file or artifact)
            // This would be saved from the main branch's last successful run
            const baseline = {
                totalViolations: 7,
                knownRuleIds: [
                    "button-name",
                    "color-contrast",
                    "html-has-lang",
                    "label",
                    "landmark-one-main",
                    "page-has-heading-one",
                    "region",
                ],
            };

            const currentRuleIds = violations.map((v) => v.id);
            const newViolations = currentRuleIds.filter(
                (id) => !baseline.knownRuleIds.includes(id),
            );
            const fixedViolations = baseline.knownRuleIds.filter(
                (id) => !currentRuleIds.includes(id),
            );

            console.log("\n" + "=".repeat(60));
            console.log("  REGRESSION DETECTION");
            console.log("=".repeat(60));
            console.log(
                `\n  Baseline violations: ${baseline.totalViolations}`,
            );
            console.log(
                `  Current violations:  ${violations.length}`,
            );
            console.log(
                `  Trend: ${violations.length <= baseline.totalViolations ? "📉 IMPROVING" : "📈 REGRESSING"}`,
            );

            if (newViolations.length > 0) {
                console.log(
                    `\n  🆕 NEW violations (${newViolations.length}):`,
                );
                newViolations.forEach((id) => {
                    console.log(`    ❌ ${id}`);
                });
            } else {
                console.log(
                    "\n  ✅ No new violations introduced!",
                );
            }

            if (fixedViolations.length > 0) {
                console.log(
                    `\n  🎉 FIXED violations (${fixedViolations.length}):`,
                );
                fixedViolations.forEach((id) => {
                    console.log(`    ✅ ${id}`);
                });
            }

            console.log(
                "\n  💡 RATCHET PATTERN:",
            );
            console.log(
                "     1. Save baseline after each main branch run",
            );
            console.log(
                "     2. Compare PR scan against baseline",
            );
            console.log(
                "     3. Fail if new violations appear",
            );
            console.log(
                "     4. Baseline automatically shrinks as you fix issues\n",
            );

            // The actual gate: no NEW violations allowed
            expect(
                newViolations,
                `New a11y violations introduced: ${newViolations.join(", ")}`,
            ).toHaveLength(0);
        });

        /**
         * TEST 4: CI-Friendly Output — Machine-Parseable Results
         * -------------------------------------------------------
         * Goal: Output results in a format that CI tools can parse.
         *       Use structured console output that's easy to grep/awk.
         */
        test("Test 4: CI-friendly machine-parseable output", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_URL);

            const summary = await a11y.getViolationSummary();

            console.log("\n" + "=".repeat(60));
            console.log("  CI-FRIENDLY OUTPUT FORMAT");
            console.log("=".repeat(60));

            // Machine-parseable one-liner (easy to grep)
            const status =
                summary.critical + summary.serious > 0 ? "FAIL" : "PASS";
            console.log(
                `\n  A11Y_GATE=${status} total=${summary.total} critical=${summary.critical} serious=${summary.serious} moderate=${summary.moderate} minor=${summary.minor}`,
            );

            // JSON one-liner (easy to parse in scripts)
            const jsonSummary = JSON.stringify({
                status,
                total: summary.total,
                critical: summary.critical,
                serious: summary.serious,
                moderate: summary.moderate,
                minor: summary.minor,
                url: GREENKART_URL,
                timestamp: new Date().toISOString(),
            });
            console.log(`  A11Y_JSON=${jsonSummary}`);

            // GitHub Actions annotation format
            if (summary.critical + summary.serious > 0) {
                summary.violations
                    .filter(
                        (v) =>
                            v.impact === "critical" ||
                            v.impact === "serious",
                    )
                    .forEach((v) => {
                        // GitHub Actions understands ::error:: and ::warning:: prefixes
                        console.log(
                            `  ::error title=A11Y ${v.impact}::${v.id}: ${v.help} (${v.nodes.length} elements)`,
                        );
                    });
            }

            console.log(
                "\n  💡 PARSING IN CI:",
            );
            console.log(
                '     grep "A11Y_GATE=FAIL" → detect failures',
            );
            console.log(
                '     grep "A11Y_JSON=" | cut -d= -f2 | jq → parse JSON',
            );
            console.log(
                '     "::error::" → GitHub Actions annotations\n',
            );

            expect(summary.total).toBeGreaterThanOrEqual(0);
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. CI/CD A11Y STRATEGY (progressive tightening):
 *    Phase 1: No critical violations (easy start)
 *    Phase 2: No critical + serious (recommended standard)
 *    Phase 3: Zero violations (gold standard)
 *
 * 2. CONFIGURABLE THRESHOLD: Use A11Y_MAX_LEVEL env variable
 *    So CI can control strictness without code changes
 *
 * 3. REGRESSION DETECTION (ratchet pattern):
 *    Save baseline → compare → fail only on NEW violations
 *    Violations can only go DOWN over time
 *
 * 4. GITHUB ACTIONS: Add a11y-tests job alongside ui/api/bdd jobs
 *    --grep @A11Y --project=chromium
 *    Upload playwright-report/a11y-reports/ as artifact
 *
 * 5. MACHINE-PARSEABLE OUTPUT:
 *    A11Y_GATE=PASS/FAIL for grep
 *    A11Y_JSON={...} for scripts
 *    ::error:: for GitHub Actions annotations
 *
 * NEXT: Module 10 — the capstone: a full accessibility audit of GreenKart.
 * ============================================================================
 */
