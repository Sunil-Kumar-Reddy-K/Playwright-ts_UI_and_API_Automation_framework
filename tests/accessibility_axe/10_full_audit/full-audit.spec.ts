import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Result } from "axe-core";
import * as fs from "fs";
import * as path from "path";
import { AccessibilityHelper } from "../06_pom_integration/accessibility-helper";

const GREENKART_HOME = "https://rahulshettyacademy.com/seleniumPractise/";
const GREENKART_OFFERS = "https://rahulshettyacademy.com/seleniumPractise/#/offers";

/**
 * ============================================================================
 * MODULE 10: REAL-WORLD FULL AUDIT — The Capstone
 * ============================================================================
 *
 * WHAT: Conduct a complete accessibility audit of the GreenKart application
 *       across multiple pages, aggregate results, prioritize fixes, and
 *       generate a comprehensive audit report.
 *
 * WHY:  This is what a REAL accessibility audit looks like:
 *       1. Scan every page/route of the application
 *       2. Aggregate violations across all pages
 *       3. Deduplicate violations that appear on multiple pages
 *       4. Prioritize by severity and frequency
 *       5. Generate a report with fix recommendations
 *       6. Document what automated tools CAN'T catch
 *
 * THIS MODULE COMBINES EVERYTHING:
 *   - Module 01: Basic scanning
 *   - Module 02: Violation analysis
 *   - Module 03: Targeted scanning
 *   - Module 04: Rule configuration (WCAG 2.1 AA)
 *   - Module 05: WCAG criteria mapping
 *   - Module 06: AccessibilityHelper class
 *   - Module 07: Report generation
 *   - Module 08: Dynamic content testing
 *   - Module 09: CI-friendly output
 *
 * ANALOGY: Modules 01-09 taught you individual medical tests.
 *          Module 10 is the COMPLETE PHYSICAL — check everything,
 *          compile results, give the patient a health report.
 *
 * ============================================================================
 */

// Store violations across tests for aggregation
interface PageAuditResult {
    url: string;
    pageName: string;
    violations: Result[];
    passCount: number;
    scanTimestamp: string;
}

const auditResults: PageAuditResult[] = [];

// Extend test with a11y fixture
const test = base.extend<{ a11y: AccessibilityHelper }>({
    a11y: async ({ page }, use) => {
        await use(
            new AccessibilityHelper(page, {
                tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            }),
        );
    },
});

test.describe(
    "Module 10: Full Accessibility Audit — GreenKart",
    { tag: ["@A11Y"] },
    () => {
        // Run tests sequentially to aggregate results across pages
        test.describe.configure({ mode: "serial" });

        /**
         * TEST 1: GreenKart Homepage Audit
         * ---------------------------------
         * The main shopping page with product list, search, and cart.
         */
        test("Test 1: Homepage audit — product listing page", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_HOME);

            const results = await a11y.scanWithTags();

            console.log("\n" + "=".repeat(60));
            console.log("  AUDIT PAGE 1: GreenKart Homepage");
            console.log("=".repeat(60));
            console.log(
                `\n  URL: ${GREENKART_HOME}`,
            );
            console.log(
                `  Violations: ${results.violations.length}`,
            );
            console.log(`  Passes: ${results.passes.length}`);

            a11y.logViolations(results.violations);

            // Store for aggregation
            auditResults.push({
                url: GREENKART_HOME,
                pageName: "Homepage",
                violations: results.violations,
                passCount: results.passes.length,
                scanTimestamp: new Date().toISOString(),
            });

            expect(results.violations).toBeDefined();
        });

        /**
         * TEST 2: GreenKart Offers Page Audit
         * ------------------------------------
         * The offers/deals page with a sortable table.
         */
        test("Test 2: Offers page audit — sortable table", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_OFFERS);
            await page.waitForLoadState("networkidle");

            const results = await a11y.scanWithTags();

            console.log("\n" + "=".repeat(60));
            console.log("  AUDIT PAGE 2: GreenKart Offers Page");
            console.log("=".repeat(60));
            console.log(
                `\n  URL: ${GREENKART_OFFERS}`,
            );
            console.log(
                `  Violations: ${results.violations.length}`,
            );
            console.log(`  Passes: ${results.passes.length}`);

            a11y.logViolations(results.violations);

            auditResults.push({
                url: GREENKART_OFFERS,
                pageName: "Offers",
                violations: results.violations,
                passCount: results.passes.length,
                scanTimestamp: new Date().toISOString(),
            });

            expect(results.violations).toBeDefined();
        });

        /**
         * TEST 3: GreenKart Cart Flow Audit
         * -----------------------------------
         * Test the cart interaction flow: add items → update cart → review.
         */
        test("Test 3: Cart flow audit — add items and review", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_HOME);

            // Add items to cart
            const addButtons = page.locator(".product-action button");
            const count = await addButtons.count();
            for (let i = 0; i < Math.min(3, count); i++) {
                await addButtons.nth(i).click();
                await page.waitForTimeout(300);
            }

            // Scan after cart updates
            const results = await a11y.scanWithTags();

            console.log("\n" + "=".repeat(60));
            console.log("  AUDIT PAGE 3: Cart Flow (After Adding Items)");
            console.log("=".repeat(60));
            console.log(
                `\n  URL: ${GREENKART_HOME} (with ${Math.min(3, count)} items in cart)`,
            );
            console.log(
                `  Violations: ${results.violations.length}`,
            );
            console.log(`  Passes: ${results.passes.length}`);

            a11y.logViolations(results.violations);

            auditResults.push({
                url: GREENKART_HOME + " (cart-flow)",
                pageName: "Cart Flow",
                violations: results.violations,
                passCount: results.passes.length,
                scanTimestamp: new Date().toISOString(),
            });

            expect(results.violations).toBeDefined();
        });

        /**
         * TEST 4: Cross-Page Violation Aggregation
         * ------------------------------------------
         * Goal: Compile results from all pages, deduplicate, and
         *       identify the most common and severe violations.
         */
        test("Test 4: Cross-page aggregation and deduplication", async () => {
            console.log("\n" + "=".repeat(60));
            console.log("  CROSS-PAGE AGGREGATION");
            console.log("=".repeat(60));

            // Aggregate all violations
            const allViolations = auditResults.flatMap(
                (r) => r.violations,
            );

            // Deduplicate by rule ID and count occurrences
            const violationMap = new Map<
                string,
                {
                    rule: Result;
                    pages: string[];
                    totalElements: number;
                }
            >();

            auditResults.forEach((pageResult) => {
                pageResult.violations.forEach((v) => {
                    if (violationMap.has(v.id)) {
                        const existing = violationMap.get(v.id)!;
                        existing.pages.push(pageResult.pageName);
                        existing.totalElements += v.nodes.length;
                    } else {
                        violationMap.set(v.id, {
                            rule: v,
                            pages: [pageResult.pageName],
                            totalElements: v.nodes.length,
                        });
                    }
                });
            });

            console.log(
                `\n  Pages audited: ${auditResults.length}`,
            );
            console.log(
                `  Total violations (with duplicates): ${allViolations.length}`,
            );
            console.log(
                `  Unique violation rules: ${violationMap.size}`,
            );

            // Sort by severity then frequency
            const severityOrder: Record<string, number> = {
                critical: 0,
                serious: 1,
                moderate: 2,
                minor: 3,
            };

            const sortedViolations = Array.from(violationMap.entries()).sort(
                (a, b) => {
                    const severityA =
                        severityOrder[a[1].rule.impact ?? "minor"] ?? 3;
                    const severityB =
                        severityOrder[b[1].rule.impact ?? "minor"] ?? 3;
                    if (severityA !== severityB) return severityA - severityB;
                    return b[1].pages.length - a[1].pages.length; // More pages = higher priority
                },
            );

            console.log("\n  PRIORITIZED VIOLATION INVENTORY:");
            console.log(
                "  " + "-".repeat(56),
            );

            sortedViolations.forEach(([id, data], i) => {
                const icon =
                    data.rule.impact === "critical"
                        ? "🔴"
                        : data.rule.impact === "serious"
                          ? "🟠"
                          : data.rule.impact === "moderate"
                            ? "🟡"
                            : "🔵";

                console.log(
                    `\n  ${icon} ${i + 1}. ${id} [${data.rule.impact}]`,
                );
                console.log(
                    `     Description: ${data.rule.help}`,
                );
                console.log(
                    `     Pages affected: ${data.pages.join(", ")} (${data.pages.length}/${auditResults.length})`,
                );
                console.log(
                    `     Total elements: ${data.totalElements}`,
                );

                // WCAG mapping
                const wcagTags = data.rule.tags
                    .filter((t) => /^wcag\d{3,}$/.test(t))
                    .map((t) => {
                        const nums = t.replace("wcag", "");
                        return nums.split("").join(".");
                    });
                if (wcagTags.length > 0) {
                    console.log(
                        `     WCAG: ${wcagTags.join(", ")}`,
                    );
                }
            });

            // Per-page summary table
            console.log("\n\n  PER-PAGE SUMMARY:");
            console.log(
                "  " + "-".repeat(56),
            );
            auditResults.forEach((r) => {
                console.log(
                    `  ${r.pageName.padEnd(15)} | ${r.violations.length} violations | ${r.passCount} passes`,
                );
            });

            expect(violationMap.size).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 5: Generate Comprehensive Audit Report
         * ---------------------------------------------
         * Goal: Produce a full JSON audit report suitable for
         *       sharing with the team and tracking over time.
         */
        test("Test 5: Generate comprehensive audit report", async () => {
            // Build comprehensive report
            const violationMap = new Map<
                string,
                {
                    id: string;
                    impact: string;
                    description: string;
                    help: string;
                    helpUrl: string;
                    wcagCriteria: string[];
                    pages: string[];
                    totalElements: number;
                }
            >();

            auditResults.forEach((pageResult) => {
                pageResult.violations.forEach((v) => {
                    if (violationMap.has(v.id)) {
                        const existing = violationMap.get(v.id)!;
                        if (!existing.pages.includes(pageResult.pageName)) {
                            existing.pages.push(pageResult.pageName);
                        }
                        existing.totalElements += v.nodes.length;
                    } else {
                        violationMap.set(v.id, {
                            id: v.id,
                            impact: v.impact ?? "unknown",
                            description: v.description,
                            help: v.help,
                            helpUrl: v.helpUrl,
                            wcagCriteria: v.tags.filter((t) =>
                                /^wcag\d{3,}$/.test(t),
                            ),
                            pages: [pageResult.pageName],
                            totalElements: v.nodes.length,
                        });
                    }
                });
            });

            const auditReport = {
                metadata: {
                    application: "GreenKart",
                    auditDate: new Date().toISOString(),
                    standard: "WCAG 2.1 AA",
                    toolVersion: "axe-core via @axe-core/playwright",
                    pagesAudited: auditResults.length,
                },
                executiveSummary: {
                    totalUniqueViolations: violationMap.size,
                    criticalCount: Array.from(violationMap.values()).filter(
                        (v) => v.impact === "critical",
                    ).length,
                    seriousCount: Array.from(violationMap.values()).filter(
                        (v) => v.impact === "serious",
                    ).length,
                    moderateCount: Array.from(violationMap.values()).filter(
                        (v) => v.impact === "moderate",
                    ).length,
                    minorCount: Array.from(violationMap.values()).filter(
                        (v) => v.impact === "minor",
                    ).length,
                    overallCompliance:
                        violationMap.size === 0
                            ? "COMPLIANT"
                            : "NON-COMPLIANT",
                },
                pageResults: auditResults.map((r) => ({
                    pageName: r.pageName,
                    url: r.url,
                    violationCount: r.violations.length,
                    passCount: r.passCount,
                    scanTimestamp: r.scanTimestamp,
                })),
                violations: Array.from(violationMap.values()).sort(
                    (a, b) => {
                        const order: Record<string, number> = {
                            critical: 0,
                            serious: 1,
                            moderate: 2,
                            minor: 3,
                        };
                        return (
                            (order[a.impact] ?? 3) - (order[b.impact] ?? 3)
                        );
                    },
                ),
                manualChecklistRequired: [
                    "Reading order matches visual order",
                    "Meaningful sequence is preserved",
                    "Color is not the only visual means of conveying information",
                    "Sensory characteristics instructions don't rely solely on shape/size/location",
                    "Timing adjustable for timed content",
                    "Audio descriptions for video content",
                    "Sign language interpretation for multimedia",
                    "Content is understandable to target audience",
                    "Error prevention for legal/financial transactions",
                    "Consistent navigation across pages",
                    "Change of context only on user request",
                ],
            };

            // Save report to disk
            const reportDir = path.resolve(
                "playwright-report/a11y-reports",
            );
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-");
            const reportPath = path.join(
                reportDir,
                `full-audit_${timestamp}.json`,
            );
            fs.writeFileSync(
                reportPath,
                JSON.stringify(auditReport, null, 2),
            );

            console.log("\n" + "=".repeat(60));
            console.log("  COMPREHENSIVE AUDIT REPORT GENERATED");
            console.log("=".repeat(60));
            console.log(`\n  📄 Report saved: ${reportPath}`);
            console.log(
                `\n  Executive Summary:`,
            );
            console.log(
                `    Application: ${auditReport.metadata.application}`,
            );
            console.log(
                `    Standard: ${auditReport.metadata.standard}`,
            );
            console.log(
                `    Pages audited: ${auditReport.metadata.pagesAudited}`,
            );
            console.log(
                `    Unique violations: ${auditReport.executiveSummary.totalUniqueViolations}`,
            );
            console.log(
                `    Compliance: ${auditReport.executiveSummary.overallCompliance}`,
            );

            expect(fs.existsSync(reportPath)).toBeTruthy();
        });

        /**
         * TEST 6: What Axe CAN'T Catch — Manual Checks
         * -----------------------------------------------
         * Goal: Document the ~40% of WCAG criteria that automated
         *       tools CANNOT verify. This is what separates an
         *       expert from someone who just runs a tool.
         *
         * axe catches ~57% of WCAG issues automatically.
         * The rest REQUIRES human judgment.
         */
        test("Test 6: Manual check checklist — what axe cannot catch", async () => {
            console.log("\n" + "=".repeat(60));
            console.log("  WHAT AXE CANNOT CATCH — Manual Checks Required");
            console.log("=".repeat(60));

            const manualChecks = [
                {
                    category: "PERCEIVABLE",
                    checks: [
                        "1.1.1 — Alt text is MEANINGFUL (not just present)",
                        "1.2.1 — Audio/video has text alternatives",
                        "1.2.2 — Captions are accurate and synchronized",
                        "1.2.3 — Audio descriptions for video content",
                        "1.3.2 — Reading order is meaningful (not just DOM order)",
                        "1.3.3 — Instructions don't rely on sensory characteristics only",
                        "1.4.1 — Color alone doesn't convey information",
                        "1.4.5 — Images of text are used minimally",
                    ],
                },
                {
                    category: "OPERABLE",
                    checks: [
                        "2.1.2 — No keyboard traps (tested but complex cases missed)",
                        "2.2.1 — Timing is adjustable (if applicable)",
                        "2.3.1 — No flashing content > 3 times per second",
                        "2.4.3 — Focus order is logical and intuitive",
                        "2.4.5 — Multiple ways to find pages (search, sitemap, nav)",
                        "2.4.7 — Focus indicator is clearly visible",
                    ],
                },
                {
                    category: "UNDERSTANDABLE",
                    checks: [
                        "3.1.1 — Page language is correct (not just present)",
                        "3.2.1 — No unexpected context changes on focus",
                        "3.2.2 — No unexpected context changes on input",
                        "3.2.3 — Navigation is consistent across pages",
                        "3.3.1 — Error messages are clear and specific",
                        "3.3.3 — Error suggestions are helpful",
                        "3.3.4 — Error prevention for legal/financial data",
                    ],
                },
                {
                    category: "ROBUST",
                    checks: [
                        "4.1.3 — Status messages use aria-live or role=status",
                    ],
                },
            ];

            manualChecks.forEach((section) => {
                console.log(`\n  📋 ${section.category}:`);
                section.checks.forEach((check) => {
                    console.log(`     ☐ ${check}`);
                });
            });

            console.log("\n  " + "=".repeat(56));
            console.log("  EXPERT INSIGHT:");
            console.log(
                "  axe-core is powerful but catches only ~57% of WCAG.",
            );
            console.log(
                "  A true accessibility audit ALWAYS includes:",
            );
            console.log(
                "    1. Automated scanning (axe-core) — what you've learned",
            );
            console.log(
                "    2. Manual keyboard testing — Tab through everything",
            );
            console.log(
                "    3. Screen reader testing — NVDA (free), VoiceOver (Mac)",
            );
            console.log(
                "    4. User testing — with actual users who have disabilities",
            );
            console.log(
                "\n  You now have the automated part mastered. The next step",
            );
            console.log(
                "  is to combine it with manual testing for a COMPLETE audit.\n",
            );

            // This test always passes — it's educational
            expect(manualChecks.length).toBeGreaterThan(0);
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS — THE COMPLETE PICTURE:
 * ============================================================================
 *
 * MODULES 01-10 SUMMARY:
 *
 *   01. AxeBuilder({ page }).analyze() → AxeResults
 *   02. violations[].nodes[].html/target/failureSummary
 *   03. .include() / .exclude() for targeted scanning
 *   04. .withTags() / .withRules() / .disableRules()
 *   05. WCAG 2.0/2.1/2.2, Levels A/AA/AAA, POUR principles
 *   06. AccessibilityHelper class + custom fixtures
 *   07. testInfo.attach(), JSON/HTML reports
 *   08. Dynamic content, keyboard, ARIA, mobile, focus management
 *   09. CI gates, thresholds, regression detection
 *   10. Full multi-page audit, aggregation, manual checklist
 *
 * THE EXPERT WORKFLOW:
 *   1. Run automated scans (axe-core) — catches 57%
 *   2. Review violations by severity — fix critical/serious first
 *   3. Map to WCAG criteria — cite the standard, not just the rule
 *   4. Manual keyboard test — Tab through everything
 *   5. Screen reader test — NVDA or VoiceOver
 *   6. Generate reports — for devs, managers, compliance
 *   7. CI/CD gate — prevent regressions
 *   8. Track trends — violations should decrease over time
 *
 * CONGRATULATIONS! You've completed the full accessibility testing
 * learning path. You now have the tools and knowledge to conduct
 * professional accessibility audits using Playwright and axe-core.
 * ============================================================================
 */
