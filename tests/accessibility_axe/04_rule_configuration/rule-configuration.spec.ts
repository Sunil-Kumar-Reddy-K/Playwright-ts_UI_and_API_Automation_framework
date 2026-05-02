import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";

/**
 * ============================================================================
 * MODULE 04: RULE CONFIGURATION — Control Which Rules Axe Runs
 * ============================================================================
 *
 * WHAT: axe-core has 90+ rules. You don't always want to run ALL of them.
 *       Rule configuration lets you filter by standard, category, or
 *       individual rule — like choosing which tests to run with --grep.
 *
 * WHY:  You need rule configuration for:
 *       1. Targeting a specific WCAG level (e.g., only AA)
 *       2. Focused remediation (fix all color-contrast first)
 *       3. Suppressing known/accepted violations
 *       4. Running only best-practice rules (non-WCAG)
 *       5. Different scan profiles for different environments
 *
 * HOW:  Three methods on AxeBuilder:
 *
 *       .withTags(['wcag2aa'])         → Run only rules tagged with these
 *       .withRules(['color-contrast']) → Run ONLY these specific rules
 *       .disableRules(['region'])      → Run all EXCEPT these rules
 *
 * ⚠️  IMPORTANT: withTags() and withRules() are MUTUALLY EXCLUSIVE
 *     You can use withTags OR withRules, not both in the same scan.
 *     disableRules() can be combined with either.
 *
 * TAG REFERENCE:
 * ┌──────────────────┬─────────────────────────────────────────────────┐
 * │ Tag              │ Description                                      │
 * ├──────────────────┼─────────────────────────────────────────────────┤
 * │ wcag2a           │ WCAG 2.0 Level A (minimum)                      │
 * │ wcag2aa          │ WCAG 2.0 Level AA (standard target)             │
 * │ wcag2aaa         │ WCAG 2.0 Level AAA (gold standard)              │
 * │ wcag21a          │ WCAG 2.1 Level A additions                      │
 * │ wcag21aa         │ WCAG 2.1 Level AA additions                     │
 * │ wcag22aa         │ WCAG 2.2 Level AA additions                     │
 * │ best-practice    │ Not WCAG — industry recommendations             │
 * │ section508       │ US Section 508 (maps to WCAG 2.0 AA)            │
 * ├──────────────────┼─────────────────────────────────────────────────┤
 * │ cat.aria         │ ARIA usage rules                                │
 * │ cat.color        │ Color-related rules                             │
 * │ cat.forms        │ Form-related rules                              │
 * │ cat.keyboard     │ Keyboard navigation rules                       │
 * │ cat.language     │ Language attribute rules                         │
 * │ cat.name-role-value │ Name, role, value rules                      │
 * │ cat.parsing      │ HTML parsing rules                              │
 * │ cat.semantics    │ Semantic HTML rules                              │
 * │ cat.structure    │ Document structure rules                         │
 * │ cat.tables       │ Table accessibility rules                        │
 * │ cat.text-alternatives │ Alt text and text alternatives             │
 * │ cat.time-and-media │ Audio/video related rules                     │
 * └──────────────────┴─────────────────────────────────────────────────┘
 *
 * OFFICIAL DOCS:
 *   - Rule descriptions: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
 *   - Playwright docs:   https://playwright.dev/docs/accessibility-testing#configuring-axe
 *
 * ============================================================================
 */

test.describe(
    "Module 04: Rule Configuration",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: withTags — Scan for WCAG 2.0 Level A Only
         * --------------------------------------------------
         * Goal: Run only WCAG 2.0 Level A rules — the bare minimum
         *       for accessibility compliance.
         *
         * Level A covers: text alternatives, keyboard access, seizure safety,
         *                 basic navigation, info and relationships.
         */
        test("Test 1: withTags — WCAG 2.0 Level A only (bare minimum)", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Full scan for comparison
            const fullResults = await new AxeBuilder({ page }).analyze();

            // Only WCAG 2.0 Level A
            const levelAResults = await new AxeBuilder({ page })
                .withTags(["wcag2a"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  withTags: WCAG 2.0 Level A Only");
            console.log("=".repeat(60));
            console.log(
                `\n  Full scan violations:    ${fullResults.violations.length} rules`,
            );
            console.log(
                `  Level A violations:      ${levelAResults.violations.length} rules`,
            );
            console.log(
                `\n  Level A covers the absolute minimum:`,
            );
            console.log(
                `    • Text alternatives for non-text content`,
            );
            console.log(`    • Keyboard accessibility`);
            console.log(`    • No seizure-inducing content`);
            console.log(`    • Basic navigation`);

            console.log("\n  Level A violations found:");
            levelAResults.violations.forEach((v) => {
                console.log(
                    `    ${v.impact === "critical" ? "🔴" : v.impact === "serious" ? "🟠" : "🟡"} ${v.id}: ${v.help}`,
                );
            });

            console.log(
                '\n  💡 Level A is the FLOOR, not the goal. Aim for AA.\n',
            );

            expect(levelAResults.violations).toBeDefined();
        });

        /**
         * TEST 2: withTags — WCAG 2.1 Level AA (Industry Standard)
         * ----------------------------------------------------------
         * Goal: Run WCAG 2.1 AA rules — this is what most organizations
         *       target for compliance.
         *
         * WCAG 2.1 AA includes everything from 2.0 A + AA, plus
         * mobile and cognitive disability additions.
         */
        test("Test 2: withTags — WCAG 2.1 Level AA (the industry standard)", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // WCAG 2.1 AA = wcag2a + wcag2aa + wcag21a + wcag21aa
            const wcag21aaResults = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  withTags: WCAG 2.1 Level AA (Industry Standard)");
            console.log("=".repeat(60));
            console.log(
                `\n  Total violations: ${wcag21aaResults.violations.length}`,
            );
            console.log(
                `  Total passes:     ${wcag21aaResults.passes.length}`,
            );

            // Group by WCAG version
            const wcag20Violations = wcag21aaResults.violations.filter((v) =>
                v.tags.some((t) => t.startsWith("wcag2") && !t.startsWith("wcag21")),
            );
            const wcag21Violations = wcag21aaResults.violations.filter((v) =>
                v.tags.some((t) => t.startsWith("wcag21")),
            );

            console.log(
                `\n  WCAG 2.0 violations: ${wcag20Violations.length}`,
            );
            console.log(
                `  WCAG 2.1 additions:  ${wcag21Violations.length}`,
            );

            console.log("\n  All WCAG 2.1 AA violations:");
            wcag21aaResults.violations.forEach((v) => {
                const wcagTags = v.tags
                    .filter((t) => t.startsWith("wcag"))
                    .join(", ");
                console.log(
                    `    [${v.impact}] ${v.id} — ${wcagTags}`,
                );
            });

            console.log(
                "\n  💡 WCAG 2.1 AA is the MOST COMMON target standard.",
            );
            console.log(
                "     This is what ADA, Section 508, and EU law reference.\n",
            );

            expect(wcag21aaResults.violations).toBeDefined();
        });

        /**
         * TEST 3: withTags — Best Practices (Non-WCAG Recommendations)
         * --------------------------------------------------------------
         * Goal: Run ONLY best-practice rules — things that aren't
         *       WCAG requirements but improve accessibility.
         *
         * EXAMPLES: heading order, page-has-heading-one, landmark-one-main
         */
        test("Test 3: withTags — best practices vs WCAG requirements", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Only best practices
            const bestPracticeResults = await new AxeBuilder({ page })
                .withTags(["best-practice"])
                .analyze();

            // Only WCAG requirements
            const wcagResults = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  COMPARISON: WCAG Requirements vs Best Practices");
            console.log("=".repeat(60));

            console.log("\n  📜 WCAG Requirements (legal/mandatory):");
            console.log(`     Violations: ${wcagResults.violations.length}`);
            wcagResults.violations.forEach((v) => {
                console.log(`       • ${v.id}: ${v.help}`);
            });

            console.log("\n  💡 Best Practices (recommended/optional):");
            console.log(
                `     Violations: ${bestPracticeResults.violations.length}`,
            );
            bestPracticeResults.violations.forEach((v) => {
                console.log(`       • ${v.id}: ${v.help}`);
            });

            console.log("\n  KEY DIFFERENCE:");
            console.log(
                "    WCAG = legally required in many jurisdictions",
            );
            console.log(
                "    Best practices = not legally required but recommended",
            );
            console.log(
                "    Fix WCAG violations first, then best practices.\n",
            );

            expect(bestPracticeResults.violations).toBeDefined();
            expect(wcagResults.violations).toBeDefined();
        });

        /**
         * TEST 4: withRules — Run Only Specific Rules
         * --------------------------------------------
         * Goal: Sometimes you want to focus on just ONE rule.
         *       Useful for remediation sprints ("this week we fix
         *       all color-contrast issues").
         */
        test("Test 4: withRules — focused remediation on specific rules", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Run only color-contrast and label rules
            const focusedResults = await new AxeBuilder({ page })
                .withRules(["color-contrast", "label", "button-name"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log(
                "  withRules: Focus on color-contrast + label + button-name",
            );
            console.log("=".repeat(60));
            console.log(
                `\n  Only 3 rules checked (out of 90+):`,
            );

            focusedResults.violations.forEach((v) => {
                console.log(
                    `\n  ❌ ${v.id} [${v.impact}] — ${v.nodes.length} element(s)`,
                );
                console.log(`     ${v.help}`);
                v.nodes.slice(0, 2).forEach((node) => {
                    console.log(
                        `     → ${node.html.substring(0, 80)}`,
                    );
                });
                if (v.nodes.length > 2) {
                    console.log(
                        `     → ... and ${v.nodes.length - 2} more`,
                    );
                }
            });

            const passedRules = focusedResults.passes.map((p) => p.id);
            if (passedRules.length > 0) {
                console.log(
                    `\n  ✅ Rules that passed: ${passedRules.join(", ")}`,
                );
            }

            console.log("\n  💡 USE CASE: Remediation sprints");
            console.log(
                '     Week 1: .withRules(["color-contrast"]) — fix all contrast',
            );
            console.log(
                '     Week 2: .withRules(["label"]) — fix all form labels',
            );
            console.log(
                '     Week 3: .withRules(["image-alt"]) — fix all alt text\n',
            );

            expect(focusedResults.violations).toBeDefined();
        });

        /**
         * TEST 5: disableRules — Skip Known/Accepted Issues
         * -------------------------------------------------
         * Goal: Run all rules EXCEPT specific ones you've accepted
         *       or are planning to fix later.
         *
         * REAL-WORLD USE CASE:
         *   "We know we have color-contrast issues — design team is
         *    fixing the color palette next sprint. Don't fail CI for those."
         */
        test("Test 5: disableRules — suppress known accepted violations", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Full scan
            const fullResults = await new AxeBuilder({ page }).analyze();

            // Disable the noisiest rules
            const suppressedResults = await new AxeBuilder({ page })
                .disableRules([
                    "color-contrast",
                    "region",
                    "landmark-one-main",
                ])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  disableRules: Suppress Known Issues");
            console.log("=".repeat(60));

            console.log(
                `\n  Full scan:       ${fullResults.violations.length} violations`,
            );
            console.log(
                `  After suppress:  ${suppressedResults.violations.length} violations`,
            );
            console.log(
                `  Suppressed:      ${fullResults.violations.length - suppressedResults.violations.length} rules hidden`,
            );

            console.log(
                "\n  Disabled rules (accepted/deferred):",
            );
            console.log(
                "    • color-contrast — design team fixing next sprint",
            );
            console.log(
                "    • region — needs major page restructuring",
            );
            console.log(
                "    • landmark-one-main — needs <main> element added",
            );

            console.log(
                "\n  Remaining violations to fix NOW:",
            );
            suppressedResults.violations.forEach((v) => {
                console.log(
                    `    ❌ ${v.id} [${v.impact}]: ${v.help}`,
                );
            });

            console.log(
                "\n  ⚠️  WARNING: Document all disabled rules in your a11y policy!",
            );
            console.log(
                "     Suppression is temporary — track them as tech debt.\n",
            );

            expect(
                suppressedResults.violations.length,
            ).toBeLessThanOrEqual(fullResults.violations.length);
        });

        /**
         * TEST 6: Category Tags — Scan by Accessibility Domain
         * -----------------------------------------------------
         * Goal: Use category tags (cat.*) to focus on specific
         *       accessibility domains like forms, keyboard, or ARIA.
         */
        test("Test 6: Category tags — scan by accessibility domain", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Scan only form-related rules
            const formResults = await new AxeBuilder({ page })
                .withTags(["cat.forms"])
                .analyze();

            // Scan only keyboard-related rules
            const keyboardResults = await new AxeBuilder({ page })
                .withTags(["cat.keyboard"])
                .analyze();

            // Scan only color-related rules
            const colorResults = await new AxeBuilder({ page })
                .withTags(["cat.color"])
                .analyze();

            // Scan only ARIA-related rules
            const ariaResults = await new AxeBuilder({ page })
                .withTags(["cat.aria"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  CATEGORY TAGS: Scan by Domain");
            console.log("=".repeat(60));

            const categories = [
                {
                    name: "Forms (cat.forms)",
                    results: formResults,
                    icon: "📝",
                },
                {
                    name: "Keyboard (cat.keyboard)",
                    results: keyboardResults,
                    icon: "⌨️",
                },
                {
                    name: "Color (cat.color)",
                    results: colorResults,
                    icon: "🎨",
                },
                {
                    name: "ARIA (cat.aria)",
                    results: ariaResults,
                    icon: "🏷️",
                },
            ];

            categories.forEach(({ name, results, icon }) => {
                console.log(
                    `\n  ${icon} ${name}:`,
                );
                console.log(
                    `     Violations: ${results.violations.length}  |  Passes: ${results.passes.length}`,
                );
                results.violations.forEach((v) => {
                    console.log(`       ❌ ${v.id}: ${v.help}`);
                });
                if (results.violations.length === 0) {
                    console.log("       ✅ All rules passed!");
                }
            });

            console.log("\n  💡 Category scanning is great for team assignments:");
            console.log(
                "     Frontend team → cat.forms, cat.color",
            );
            console.log(
                "     UX team → cat.semantics, cat.structure",
            );
            console.log(
                "     Dev team → cat.aria, cat.keyboard\n",
            );

            expect(formResults.violations).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. THREE configuration methods:
 *    .withTags(['wcag2aa'])         → Filter by standard/category
 *    .withRules(['color-contrast']) → Run ONLY specific rules
 *    .disableRules(['region'])      → Skip specific rules
 *
 * 2. withTags and withRules are MUTUALLY EXCLUSIVE — pick one
 *    disableRules can be combined with either
 *
 * 3. Most common tag combination for production:
 *    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
 *    This gives you WCAG 2.1 AA — the industry standard
 *
 * 4. Use category tags (cat.*) for team assignments:
 *    Forms team: cat.forms | Design team: cat.color | Dev team: cat.aria
 *
 * 5. disableRules is for TEMPORARY suppression — always document why!
 *
 * NEXT: Module 05 dives deep into WCAG standards — what each level
 *       means, the history, and how axe maps to success criteria.
 * ============================================================================
 */
