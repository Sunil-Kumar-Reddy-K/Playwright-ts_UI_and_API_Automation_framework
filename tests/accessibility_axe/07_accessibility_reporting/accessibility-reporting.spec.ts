import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import * as fs from "fs";
import * as path from "path";
import { AccessibilityHelper } from "../06_pom_integration/accessibility-helper";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";

/**
 * ============================================================================
 * MODULE 07: ACCESSIBILITY REPORTING — Generate Actionable Reports
 * ============================================================================
 *
 * WHAT: Running scans is only half the job. You need to REPORT the
 *       results in a way that developers, designers, and managers
 *       can understand and act on.
 *
 * WHY:  Different audiences need different report formats:
 *       - Developers → detailed JSON with selectors and fix instructions
 *       - Managers → summary with counts and trends
 *       - CI/CD → pass/fail with concise output
 *       - Playwright HTML report → embedded results for test review
 *
 * REPORTING APPROACHES COVERED:
 *
 *   1. testInfo.attach() — Embed results in Playwright's built-in HTML report
 *      This is the SIMPLEST and most integrated approach.
 *
 *   2. JSON report — Save structured data to disk for processing
 *      Good for CI/CD pipelines, dashboards, and trend analysis.
 *
 *   3. HTML report — Generate a standalone a11y report
 *      Good for sharing with non-technical stakeholders.
 *
 *   4. Console summary — CI-friendly formatted output
 *      Good for quick feedback in terminal/CI logs.
 *
 * OFFICIAL DOCS:
 *   - testInfo.attach: https://playwright.dev/docs/api/class-testinfo#test-info-attach
 *   - Custom reporters: https://playwright.dev/docs/test-reporters#custom-reporters
 *
 * ============================================================================
 */

// Extend test with a11y fixture
const test = base.extend<{ a11y: AccessibilityHelper }>({
    a11y: async ({ page }, use) => {
        await use(new AccessibilityHelper(page));
    },
});

/**
 * Generate an HTML accessibility report string from axe results.
 */
function generateHtmlReport(
    results: AxeResults,
    pageUrl: string,
): string {
    const timestamp = new Date().toISOString();
    const violationRows = results.violations
        .map(
            (v) => `
        <tr>
            <td><span class="severity ${v.impact}">${v.impact}</span></td>
            <td><strong>${v.id}</strong></td>
            <td>${v.help}</td>
            <td>${v.nodes.length}</td>
            <td>${v.tags.filter((t) => t.startsWith("wcag")).join(", ")}</td>
            <td><a href="${v.helpUrl}" target="_blank">Fix</a></td>
        </tr>`,
        )
        .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Accessibility Report — ${pageUrl}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 2rem; color: #333; }
        h1 { color: #1a1a2e; }
        .summary { display: flex; gap: 1rem; margin: 1rem 0; }
        .summary .card { padding: 1rem 2rem; border-radius: 8px; color: white; text-align: center; }
        .card.violations { background: #e74c3c; }
        .card.passes { background: #27ae60; }
        .card.incomplete { background: #f39c12; }
        .card.inapplicable { background: #95a5a6; }
        .card h2 { margin: 0; font-size: 2rem; }
        .card p { margin: 0.5rem 0 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: 600; }
        .severity { padding: 2px 8px; border-radius: 4px; color: white; font-size: 0.85rem; }
        .severity.critical { background: #e74c3c; }
        .severity.serious { background: #e67e22; }
        .severity.moderate { background: #f1c40f; color: #333; }
        .severity.minor { background: #3498db; }
        .meta { color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <h1>Accessibility Report</h1>
    <p class="meta">URL: ${pageUrl} | Date: ${timestamp}</p>

    <div class="summary">
        <div class="card violations"><h2>${results.violations.length}</h2><p>Violations</p></div>
        <div class="card passes"><h2>${results.passes.length}</h2><p>Passes</p></div>
        <div class="card incomplete"><h2>${results.incomplete.length}</h2><p>Incomplete</p></div>
        <div class="card inapplicable"><h2>${results.inapplicable.length}</h2><p>Inapplicable</p></div>
    </div>

    ${
        results.violations.length > 0
            ? `
    <h2>Violations</h2>
    <table>
        <thead>
            <tr><th>Severity</th><th>Rule</th><th>Description</th><th>Elements</th><th>WCAG</th><th>Help</th></tr>
        </thead>
        <tbody>${violationRows}</tbody>
    </table>`
            : "<h2>✅ No Violations Found!</h2>"
    }
</body>
</html>`;
}

test.describe(
    "Module 07: Accessibility Reporting",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Attach Axe Results to Playwright HTML Report
         * -----------------------------------------------------
         * Goal: Use testInfo.attach() to embed axe results directly
         *       in Playwright's built-in HTML report.
         *
         * WHY: This is the EASIEST approach — no extra reporter needed.
         *      Open the Playwright HTML report and the a11y data is
         *      right there alongside your test steps and screenshots.
         *
         * HOW: testInfo.attach('name', { body, contentType })
         */
        test("Test 1: Attach axe results to Playwright HTML report", async ({
            page,
        }, testInfo) => {
            await page.goto(GREENKART_URL);

            const axeResults = await new AxeBuilder({ page }).analyze();

            // Attach the full results as JSON
            await testInfo.attach("accessibility-scan-results", {
                body: JSON.stringify(axeResults, null, 2),
                contentType: "application/json",
            });

            // Attach a human-readable summary
            const summary = [
                `Accessibility Scan Summary — ${GREENKART_URL}`,
                `${"=".repeat(50)}`,
                `Violations:   ${axeResults.violations.length}`,
                `Passes:       ${axeResults.passes.length}`,
                `Incomplete:   ${axeResults.incomplete.length}`,
                `Inapplicable: ${axeResults.inapplicable.length}`,
                "",
                "Violations:",
                ...axeResults.violations.map(
                    (v) =>
                        `  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elements)`,
                ),
            ].join("\n");

            await testInfo.attach("accessibility-summary", {
                body: summary,
                contentType: "text/plain",
            });

            console.log("\n" + "=".repeat(60));
            console.log("  ATTACH: Results Embedded in Playwright Report");
            console.log("=".repeat(60));
            console.log(
                "\n  ✅ Attached 2 items to the test report:",
            );
            console.log(
                '    1. "accessibility-scan-results" (JSON — full axe output)',
            );
            console.log(
                '    2. "accessibility-summary" (text — human-readable)',
            );
            console.log(
                "\n  💡 View these in the Playwright HTML report:",
            );
            console.log(
                "     npx playwright show-report\n",
            );

            expect(axeResults.violations).toBeDefined();
        });

        /**
         * TEST 2: Generate Standalone JSON Report
         * ----------------------------------------
         * Goal: Save axe results as a JSON file to disk.
         *       Perfect for CI/CD artifact collection and trend analysis.
         */
        test("Test 2: Generate standalone JSON report to disk", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const axeResults = await new AxeBuilder({ page }).analyze();

            // Create report directory
            const reportDir = path.resolve(
                "playwright-report/a11y-reports",
            );
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }

            // Build a structured report
            const report = {
                url: GREENKART_URL,
                timestamp: new Date().toISOString(),
                summary: {
                    violations: axeResults.violations.length,
                    passes: axeResults.passes.length,
                    incomplete: axeResults.incomplete.length,
                    inapplicable: axeResults.inapplicable.length,
                },
                severityCounts: {
                    critical: axeResults.violations.filter(
                        (v) => v.impact === "critical",
                    ).length,
                    serious: axeResults.violations.filter(
                        (v) => v.impact === "serious",
                    ).length,
                    moderate: axeResults.violations.filter(
                        (v) => v.impact === "moderate",
                    ).length,
                    minor: axeResults.violations.filter(
                        (v) => v.impact === "minor",
                    ).length,
                },
                violations: axeResults.violations.map((v) => ({
                    id: v.id,
                    impact: v.impact,
                    description: v.description,
                    help: v.help,
                    helpUrl: v.helpUrl,
                    wcagTags: v.tags.filter((t) => t.startsWith("wcag")),
                    elementCount: v.nodes.length,
                    elements: v.nodes.slice(0, 5).map((n) => ({
                        html: n.html.substring(0, 200),
                        target: n.target,
                        failureSummary: n.failureSummary,
                    })),
                })),
            };

            // Save to disk
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-");
            const reportPath = path.join(
                reportDir,
                `a11y-report_${timestamp}.json`,
            );
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

            console.log("\n" + "=".repeat(60));
            console.log("  JSON REPORT: Saved to Disk");
            console.log("=".repeat(60));
            console.log(`\n  📄 Report saved to: ${reportPath}`);
            console.log(
                `  📊 Violations: ${report.summary.violations}`,
            );
            console.log(
                `  ✅ Passes: ${report.summary.passes}`,
            );
            console.log(
                "\n  💡 Upload this as a CI artifact for trend tracking.\n",
            );

            expect(fs.existsSync(reportPath)).toBeTruthy();
        });

        /**
         * TEST 3: Generate HTML Accessibility Report
         * -------------------------------------------
         * Goal: Create a beautiful, standalone HTML report that can
         *       be shared with non-technical stakeholders.
         */
        test("Test 3: Generate standalone HTML report", async ({ page }) => {
            await page.goto(GREENKART_URL);

            const axeResults = await new AxeBuilder({ page }).analyze();

            // Generate HTML report
            const htmlContent = generateHtmlReport(
                axeResults,
                GREENKART_URL,
            );

            // Save to disk
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
                `a11y-report_${timestamp}.html`,
            );
            fs.writeFileSync(reportPath, htmlContent);

            console.log("\n" + "=".repeat(60));
            console.log("  HTML REPORT: Standalone A11Y Report");
            console.log("=".repeat(60));
            console.log(`\n  📄 HTML report saved to: ${reportPath}`);
            console.log("     Open in a browser to view the formatted report.");
            console.log(
                `\n  Summary: ${axeResults.violations.length} violations, ${axeResults.passes.length} passes`,
            );
            console.log(
                "\n  💡 Share this HTML report with designers and managers.\n",
            );

            expect(fs.existsSync(reportPath)).toBeTruthy();
        });

        /**
         * TEST 4: CI-Friendly Console Summary
         * ------------------------------------
         * Goal: Format results as a concise table suitable for
         *       CI/CD log output. Quick to scan, easy to grep.
         */
        test("Test 4: CI-friendly console summary", async ({
            page,
            a11y,
        }) => {
            await page.goto(GREENKART_URL);

            const summary = await a11y.getViolationSummary();

            console.log("\n" + "=".repeat(60));
            console.log("  CI-FRIENDLY SUMMARY");
            console.log("=".repeat(60));

            // Table format for CI logs
            console.log("\n  ┌────────────┬────────────┬────────────┐");
            console.log("  │  Severity  │   Count    │   Status   │");
            console.log("  ├────────────┼────────────┼────────────┤");
            console.log(
                `  │  Critical  │ ${String(summary.critical).padStart(10)} │ ${summary.critical > 0 ? "   FAIL ❌ " : "   PASS ✅ "} │`,
            );
            console.log(
                `  │  Serious   │ ${String(summary.serious).padStart(10)} │ ${summary.serious > 0 ? "   FAIL ❌ " : "   PASS ✅ "} │`,
            );
            console.log(
                `  │  Moderate  │ ${String(summary.moderate).padStart(10)} │ ${summary.moderate > 0 ? "   WARN ⚠️ " : "   PASS ✅ "} │`,
            );
            console.log(
                `  │  Minor     │ ${String(summary.minor).padStart(10)} │ ${summary.minor > 0 ? "   WARN ⚠️ " : "   PASS ✅ "} │`,
            );
            console.log("  ├────────────┼────────────┼────────────┤");
            console.log(
                `  │  TOTAL     │ ${String(summary.total).padStart(10)} │ ${summary.critical + summary.serious > 0 ? "   FAIL ❌ " : "   PASS ✅ "} │`,
            );
            console.log("  └────────────┴────────────┴────────────┘");

            // One-liner for grep
            const status =
                summary.critical + summary.serious > 0 ? "FAIL" : "PASS";
            console.log(
                `\n  A11Y_RESULT: ${status} | violations=${summary.total} critical=${summary.critical} serious=${summary.serious}`,
            );

            console.log(
                "\n  💡 Grep for 'A11Y_RESULT' in CI logs for quick pass/fail check.\n",
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
 * 1. EASIEST approach: testInfo.attach() — embeds results in Playwright report
 *    await testInfo.attach('a11y', { body: JSON.stringify(results), contentType: 'application/json' });
 *
 * 2. JSON reports → good for CI artifacts, dashboards, trend analysis
 *    Save to playwright-report/a11y-reports/ directory
 *
 * 3. HTML reports → good for sharing with non-technical stakeholders
 *    Standalone file, open in any browser
 *
 * 4. CI summary → one-liner format: A11Y_RESULT: PASS | violations=0
 *    Easy to grep in CI logs
 *
 * 5. Different reports for different audiences:
 *    Dev team → JSON + Playwright HTML report
 *    Management → standalone HTML report
 *    CI/CD → console summary with pass/fail
 *
 * NEXT: Module 08 covers advanced patterns — dynamic content,
 *       keyboard navigation, ARIA, and mobile accessibility.
 * ============================================================================
 */
