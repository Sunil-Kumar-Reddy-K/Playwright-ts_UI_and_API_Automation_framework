import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Result, NodeResult } from "axe-core";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const ORANGEHRM_URL = "https://opensource-demo.orangehrmlive.com/";

/**
 * ============================================================================
 * MODULE 02: ANALYZING & FIXING VIOLATIONS — Reading Axe Output Like a Pro
 * ============================================================================
 *
 * WHAT: In Module 01 you ran your first scan and saw violations. Now we
 *       dissect the violation object to understand EXACTLY what's wrong,
 *       WHERE it is, and HOW to fix it.
 *
 * WHY:  A violation count alone is useless. You need to know:
 *       - Which rule failed? (id + description)
 *       - How bad is it? (impact)
 *       - Which DOM element? (nodes[].html + nodes[].target)
 *       - What specifically to fix? (nodes[].failureSummary)
 *       - Where to learn more? (helpUrl)
 *
 * HOW:  Each violation object has this structure:
 *
 * ANATOMY OF A VIOLATION:
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │ Violation (Result)                                                    │
 * │                                                                       │
 * │  id          → Rule identifier (e.g., "color-contrast")             │
 * │  impact      → "critical" | "serious" | "moderate" | "minor"        │
 * │  description → Human-readable rule description                       │
 * │  help        → Short fix suggestion                                  │
 * │  helpUrl     → Link to detailed fix documentation                    │
 * │  tags[]      → WCAG criteria this maps to (e.g., "wcag2aa")         │
 * │                                                                       │
 * │  nodes[] → Array of DOM elements that violated this rule:            │
 * │    ┌─────────────────────────────────────────────────────────────┐    │
 * │    │ NodeResult                                                   │    │
 * │    │  html           → The offending HTML snippet                │    │
 * │    │  target[]       → CSS selector path to the element          │    │
 * │    │  failureSummary → What to fix and how                       │    │
 * │    │  impact         → Severity for this specific node           │    │
 * │    │  any[]          → Checks where ANY must pass                │    │
 * │    │  all[]          → Checks where ALL must pass                │    │
 * │    │  none[]         → Checks where NONE should pass             │    │
 * │    └─────────────────────────────────────────────────────────────┘    │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * THE 10 MOST COMMON VIOLATIONS (you'll see these everywhere):
 *   1. color-contrast    — Text doesn't have enough contrast with background
 *   2. image-alt         — <img> missing alt attribute
 *   3. label             — Form input missing associated <label>
 *   4. button-name       — <button> has no accessible name
 *   5. link-name         — <a> has no accessible name (empty link)
 *   6. html-has-lang     — <html> missing lang attribute
 *   7. heading-order     — Heading levels skip (h1 → h3, missing h2)
 *   8. region            — Content not inside a landmark region
 *   9. landmark-one-main — Page missing <main> landmark
 *  10. document-title    — Page missing <title> element
 *
 * OFFICIAL DOCS:
 *   - axe-core Result types: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
 *   - Rule descriptions:     https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
 *
 * ============================================================================
 */

/**
 * UTILITY: Pretty-print violations in a readable format.
 * This function is reusable in later modules — copy it to your helpers!
 */
function prettyPrintViolations(violations: Result[]): void {
    if (violations.length === 0) {
        console.log("\n  ✅ No violations found!\n");
        return;
    }

    console.log(`\n  Found ${violations.length} violation(s):\n`);

    violations.forEach((violation, index) => {
        const impactIcon =
            violation.impact === "critical"
                ? "🔴"
                : violation.impact === "serious"
                  ? "🟠"
                  : violation.impact === "moderate"
                    ? "🟡"
                    : "🔵";

        console.log(
            `  ${impactIcon} ${index + 1}. ${violation.id} [${violation.impact}]`,
        );
        console.log(`     Description: ${violation.description}`);
        console.log(`     Help: ${violation.help}`);
        console.log(`     Help URL: ${violation.helpUrl}`);
        console.log(
            `     WCAG Tags: ${violation.tags.filter((t) => t.startsWith("wcag") || t.startsWith("best")).join(", ")}`,
        );
        console.log(`     Affected elements: ${violation.nodes.length}`);

        violation.nodes.forEach((node: NodeResult, nodeIdx: number) => {
            console.log(`\n       Element ${nodeIdx + 1}:`);
            console.log(`         HTML: ${node.html.substring(0, 120)}${node.html.length > 120 ? "..." : ""}`);
            console.log(`         Selector: ${node.target.join(" > ")}`);
            if (node.failureSummary) {
                console.log(`         Fix: ${node.failureSummary.replace(/\n/g, "\n              ")}`);
            }
        });
        console.log("");
    });
}

test.describe(
    "Module 02: Analyzing & Fixing Violations",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: Anatomy of a Violation Object
         * --------------------------------------
         * Goal: Pick the FIRST violation from a GreenKart scan and
         *       examine every single field, understanding what each one means.
         */
        test("Test 1: Anatomy of a violation object — every field explained", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();
            expect(violations.length).toBeGreaterThan(0);

            // Pick the first violation to dissect
            const violation = violations[0];

            console.log("\n" + "=".repeat(70));
            console.log("  DISSECTING A SINGLE VIOLATION");
            console.log("=".repeat(70));

            // === TOP-LEVEL FIELDS ===
            console.log("\n  📋 TOP-LEVEL FIELDS:");
            console.log(`    id          : "${violation.id}"`);
            console.log(`                  → The rule's unique identifier.`);
            console.log(
                `                  → Use this to disable or target specific rules.`,
            );

            console.log(`\n    impact      : "${violation.impact}"`);
            console.log(
                `                  → How severe: critical > serious > moderate > minor`,
            );

            console.log(`\n    description : "${violation.description}"`);
            console.log(
                `                  → What the rule checks for (human-readable)`,
            );

            console.log(`\n    help        : "${violation.help}"`);
            console.log(`                  → Short suggestion for how to fix`);

            console.log(`\n    helpUrl     : "${violation.helpUrl}"`);
            console.log(
                `                  → Deque University page with detailed fix instructions`,
            );
            console.log(
                `                  → ALWAYS check this URL — it has code examples!`,
            );

            console.log(`\n    tags        : [${violation.tags.map((t) => `"${t}"`).join(", ")}]`);
            console.log(
                `                  → WCAG success criteria this rule maps to`,
            );
            console.log(
                `                  → Also includes categories like "cat.forms", "best-practice"`,
            );

            // === NODE-LEVEL FIELDS ===
            console.log(
                `\n  📍 NODES (${violation.nodes.length} element(s) failed this rule):`,
            );

            const node = violation.nodes[0];
            console.log(`\n    Node 1 of ${violation.nodes.length}:`);

            console.log(`\n      html          : "${node.html.substring(0, 100)}${node.html.length > 100 ? "..." : ""}"`);
            console.log(
                `                      → The actual HTML of the offending element`,
            );

            console.log(
                `\n      target        : ${JSON.stringify(node.target)}`,
            );
            console.log(
                `                      → CSS selector path to find this element`,
            );
            console.log(
                `                      → Use this in DevTools: document.querySelector("${node.target[0]}")`,
            );

            if (node.failureSummary) {
                console.log(
                    `\n      failureSummary: "${node.failureSummary.substring(0, 150)}"`,
                );
                console.log(
                    `                      → Step-by-step instructions for fixing`,
                );
            }

            console.log(
                `\n      impact        : "${node.impact}"`,
            );
            console.log(
                `                      → Severity for this specific element`,
            );

            // === CHECK ARRAYS ===
            console.log("\n  🔍 CHECK ARRAYS (advanced):");
            console.log(
                `      any[]  : ${node.any.length} checks — at least ONE must pass`,
            );
            console.log(
                `      all[]  : ${node.all.length} checks — ALL must pass`,
            );
            console.log(
                `      none[] : ${node.none.length} checks — NONE should pass (inverse checks)`,
            );

            if (node.any.length > 0) {
                console.log(
                    `\n      any[] details (need at least one to pass):`,
                );
                node.any.forEach((check) => {
                    const icon = check.result ? "✅" : "❌";
                    console.log(
                        `        ${icon} ${check.id}: ${check.message}`,
                    );
                });
            }
        });

        /**
         * TEST 2: Drilling Into Nodes — Finding the Exact Offending Element
         * ------------------------------------------------------------------
         * Goal: Iterate through ALL nodes of a violation and print
         *       actionable information for each one.
         *
         * WHY: A single rule (e.g., "label") can fail on MANY elements.
         *      The "label" rule on GreenKart fails on 30+ input fields.
         *      You need to see EACH one to fix them all.
         */
        test("Test 2: Drilling into nodes — find every offending element", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            // Find a violation with multiple nodes (likely "label" or "region")
            const multiNodeViolation = violations.find(
                (v) => v.nodes.length > 1,
            );

            if (!multiNodeViolation) {
                console.log(
                    "  No multi-node violations found. Skipping drill-down.",
                );
                return;
            }

            console.log("\n" + "=".repeat(70));
            console.log(
                `  DRILLING INTO: "${multiNodeViolation.id}" — ${multiNodeViolation.nodes.length} elements affected`,
            );
            console.log("=".repeat(70));
            console.log(`  Rule: ${multiNodeViolation.description}`);
            console.log(`  Impact: ${multiNodeViolation.impact}`);

            // Show first 5 nodes (could be many)
            const nodesToShow = multiNodeViolation.nodes.slice(0, 5);
            nodesToShow.forEach((node, i) => {
                console.log(`\n  Element ${i + 1} of ${multiNodeViolation.nodes.length}:`);
                console.log(`    HTML:     ${node.html.substring(0, 100)}`);
                console.log(`    Selector: ${node.target.join(" > ")}`);
                if (node.failureSummary) {
                    // Just the first line of the fix suggestion
                    const firstLine = node.failureSummary.split("\n")[0];
                    console.log(`    Fix:      ${firstLine}`);
                }
            });

            if (multiNodeViolation.nodes.length > 5) {
                console.log(
                    `\n  ... and ${multiNodeViolation.nodes.length - 5} more elements`,
                );
            }

            console.log(
                "\n  💡 TIP: Use the CSS selector in DevTools to find each element:",
            );
            console.log(
                `     document.querySelector("${multiNodeViolation.nodes[0].target[0]}")\n`,
            );

            expect(multiNodeViolation.nodes.length).toBeGreaterThan(1);
        });

        /**
         * TEST 3: Common Violation — Missing Form Labels
         * -----------------------------------------------
         * Goal: Understand the "label" violation — one of the most
         *       frequent a11y issues on the web.
         *
         * WHY IT MATTERS:
         *   Screen readers read the <label> to tell blind users
         *   what an input field is for. Without it, they hear
         *   "edit text" instead of "Search for vegetables".
         *
         * THE FIX:
         *   Option A: <label for="search">Search</label> <input id="search">
         *   Option B: <input aria-label="Search for vegetables">
         *   Option C: <input aria-labelledby="search-heading">
         */
        test("Test 3: Common violation — missing form labels (label rule)", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page })
                .withRules(["label"])
                .analyze();

            console.log("\n" + "=".repeat(70));
            console.log('  COMMON VIOLATION: "label" — Missing Form Labels');
            console.log("=".repeat(70));

            if (violations.length === 0) {
                console.log(
                    "\n  ✅ No label violations found — forms are properly labeled!",
                );
            } else {
                const labelViolation = violations[0];
                console.log(
                    `\n  Found ${labelViolation.nodes.length} input(s) WITHOUT labels:\n`,
                );

                labelViolation.nodes.slice(0, 5).forEach((node, i) => {
                    console.log(`    ${i + 1}. ${node.html.substring(0, 80)}`);
                    console.log(`       Selector: ${node.target.join(" > ")}`);
                    console.log(
                        `       Problem: Screen reader can't identify this field`,
                    );
                });

                console.log("\n  🔧 HOW TO FIX:");
                console.log(
                    '    Option A: <label for="fieldId">Field Name</label>',
                );
                console.log(
                    '              <input id="fieldId">',
                );
                console.log(
                    '    Option B: <input aria-label="Field Name">',
                );
                console.log(
                    '    Option C: <input aria-labelledby="heading-id">\n',
                );
            }

            // We expect GreenKart to have label issues
            expect(violations.length).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 4: Common Violation — Color Contrast
         * ------------------------------------------
         * Goal: Understand the "color-contrast" violation — the #1
         *       most common a11y issue worldwide.
         *
         * WCAG CONTRAST RATIOS:
         *   Normal text (<18pt): min 4.5:1 contrast ratio (AA)
         *   Large text (≥18pt or ≥14pt bold): min 3:1 contrast ratio (AA)
         *   Enhanced (AAA): 7:1 normal, 4.5:1 large
         *
         * WHAT axe REPORTS:
         *   "Element has insufficient color contrast of 2.15
         *    (foreground: #999999, background: #ffffff)"
         */
        test("Test 4: Common violation — color contrast", async ({ page }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page })
                .withRules(["color-contrast"])
                .analyze();

            console.log("\n" + "=".repeat(70));
            console.log(
                '  COMMON VIOLATION: "color-contrast" — Insufficient Contrast',
            );
            console.log("=".repeat(70));

            if (violations.length === 0) {
                console.log(
                    "\n  ✅ All text meets WCAG 2 AA contrast requirements!",
                );
            } else {
                const contrastViolation = violations[0];
                console.log(
                    `\n  ${contrastViolation.nodes.length} element(s) have insufficient contrast:\n`,
                );

                contrastViolation.nodes.slice(0, 3).forEach((node, i) => {
                    console.log(`    ${i + 1}. HTML: ${node.html.substring(0, 100)}`);
                    console.log(`       Selector: ${node.target.join(" > ")}`);
                    // The failureSummary contains the actual contrast ratio
                    if (node.failureSummary) {
                        const lines = node.failureSummary.split("\n");
                        lines.forEach((line) => {
                            if (
                                line.includes("contrast") ||
                                line.includes("color")
                            ) {
                                console.log(`       Detail: ${line.trim()}`);
                            }
                        });
                    }
                });

                console.log("\n  📏 WCAG 2 AA CONTRAST REQUIREMENTS:");
                console.log(
                    "     Normal text (<18pt):         minimum 4.5:1 ratio",
                );
                console.log(
                    "     Large text (≥18pt / ≥14pt bold): minimum 3:1 ratio",
                );
                console.log(
                    "\n  🔧 HOW TO FIX: Darken the text or lighten the background",
                );
                console.log(
                    "     Tool: https://webaim.org/resources/contrastchecker/\n",
                );
            }

            expect(violations.length).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 5: Common Violation — html-has-lang
         * -----------------------------------------
         * Goal: Understand why the <html> element needs a lang attribute.
         *
         * WHY: Screen readers use the lang attribute to select the correct
         *      pronunciation. Without it, a French page might be read
         *      with English pronunciation — incomprehensible.
         *
         * FIX: <html lang="en"> or <html lang="fr">
         */
        test("Test 5: Common violation — html-has-lang", async ({ page }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page })
                .withRules(["html-has-lang"])
                .analyze();

            console.log("\n" + "=".repeat(70));
            console.log(
                '  COMMON VIOLATION: "html-has-lang" — Missing Language',
            );
            console.log("=".repeat(70));

            if (violations.length === 0) {
                console.log(
                    '\n  ✅ <html> has a lang attribute — screen readers know the language!',
                );
            } else {
                console.log(
                    "\n  ❌ The <html> tag is missing the lang attribute.",
                );
                console.log(
                    "     Screen readers don't know what language this page is in.",
                );
                console.log("\n  🔧 FIX: Add lang to the <html> tag:");
                console.log('     <html lang="en">   ← English');
                console.log('     <html lang="fr">   ← French');
                console.log('     <html lang="es">   ← Spanish');
                console.log('     <html lang="hi">   ← Hindi');
            }

            console.log(
                '\n  💡 This is the EASIEST a11y fix — one attribute on one element!\n',
            );

            expect(violations.length).toBeGreaterThanOrEqual(0);
        });

        /**
         * TEST 6: Pretty-Print Utility — Reusable Violation Formatter
         * ------------------------------------------------------------
         * Goal: Use the prettyPrintViolations() function defined at the
         *       top of this file. This is your go-to utility for all
         *       future accessibility tests.
         *
         * We scan OrangeHRM to see a different set of violations.
         */
        test("Test 6: Pretty-print utility — reusable violation formatter", async ({
            page,
        }) => {
            await page.goto(ORANGEHRM_URL);
            // Wait for the login page to fully load
            await page.waitForLoadState("networkidle");

            const { violations } = await new AxeBuilder({ page }).analyze();

            console.log("\n" + "=".repeat(70));
            console.log(
                "  PRETTY-PRINT UTILITY — OrangeHRM Login Page Scan",
            );
            console.log("=".repeat(70));

            // Use the reusable pretty-print utility
            prettyPrintViolations(violations);

            console.log("  💡 TIP: Copy the prettyPrintViolations() function");
            console.log(
                "     to your utils/ folder for use in all future tests.\n",
            );

            // OrangeHRM likely has some violations
            expect(violations).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. Every violation has: id, impact, description, helpUrl, nodes[]
 *    - helpUrl is your BEST FRIEND — always check it for fix instructions
 *
 * 2. nodes[] contains the actual DOM elements that failed:
 *    - html = the raw HTML snippet
 *    - target = CSS selector to find it in DevTools
 *    - failureSummary = step-by-step fix instructions
 *
 * 3. Top 5 violations you'll see everywhere:
 *    color-contrast, label, image-alt, button-name, html-has-lang
 *
 * 4. The prettyPrintViolations() utility is reusable — save it!
 *
 * 5. Not all violations are equal — fix critical/serious first
 *
 * NEXT: Module 03 teaches you to scan SPECIFIC parts of a page
 *       instead of the whole thing (targeted scanning).
 * ============================================================================
 */
