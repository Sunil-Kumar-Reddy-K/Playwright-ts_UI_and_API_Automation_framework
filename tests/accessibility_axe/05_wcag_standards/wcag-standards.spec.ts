import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const ORANGEHRM_URL = "https://opensource-demo.orangehrmlive.com/";

/**
 * ============================================================================
 * MODULE 05: WCAG STANDARDS DEEP DIVE — Understanding the Rulebook
 * ============================================================================
 *
 * WHAT: WCAG (Web Content Accessibility Guidelines) is THE international
 *       standard for web accessibility. Published by the W3C (World Wide
 *       Web Consortium). axe-core maps every rule to specific WCAG
 *       "success criteria."
 *
 * WHY:  You can't be an accessibility expert without understanding WCAG.
 *       It's referenced by:
 *       - ADA (Americans with Disabilities Act) — USA
 *       - Section 508 — US federal government websites
 *       - EU Accessibility Act — European Union
 *       - EN 301 549 — European standard
 *       - AODA — Ontario, Canada
 *
 * WCAG VERSIONS:
 * ┌────────────┬──────────┬───────────────────────────────────────────────┐
 * │ Version    │ Year     │ Key Additions                                 │
 * ├────────────┼──────────┼───────────────────────────────────────────────┤
 * │ WCAG 2.0   │ 2008     │ The foundation — 4 principles (POUR)         │
 * │ WCAG 2.1   │ 2018     │ Mobile, cognitive & low-vision additions     │
 * │ WCAG 2.2   │ 2023     │ Focus appearance, dragging, target size      │
 * └────────────┴──────────┴───────────────────────────────────────────────┘
 *
 * CONFORMANCE LEVELS:
 * ┌──────────┬────────────────────────────────────────────────────────────┐
 * │ Level    │ Description                                                │
 * ├──────────┼────────────────────────────────────────────────────────────┤
 * │ A        │ Minimum — basic access. Without this, content is          │
 * │          │ COMPLETELY inaccessible to some users.                     │
 * │          │ Examples: text alternatives, keyboard access, no seizures │
 * ├──────────┼────────────────────────────────────────────────────────────┤
 * │ AA       │ Standard — the TARGET for most organizations.             │
 * │          │ Required by most laws worldwide.                           │
 * │          │ Examples: color contrast 4.5:1, resize text, captions     │
 * ├──────────┼────────────────────────────────────────────────────────────┤
 * │ AAA      │ Gold standard — ideal but often impractical to achieve    │
 * │          │ fully. Not required by law.                                │
 * │          │ Examples: contrast 7:1, sign language, plain language     │
 * └──────────┴────────────────────────────────────────────────────────────┘
 *
 * THE 4 PRINCIPLES (POUR):
 *   P — Perceivable:  Users can perceive the content (alt text, captions)
 *   O — Operable:     Users can navigate and interact (keyboard, timing)
 *   U — Understandable: Content is readable and predictable
 *   R — Robust:       Works with current and future technologies
 *
 * ANALOGY: WCAG levels are like fire safety ratings:
 *   Level A  = smoke detectors (bare minimum)
 *   Level AA = smoke detectors + sprinklers + exits (standard building code)
 *   Level AAA = full fire suppression system (hospital/datacenter grade)
 *
 * OFFICIAL DOCS:
 *   - WCAG 2.2: https://www.w3.org/TR/WCAG22/
 *   - Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
 *   - Understanding WCAG: https://www.w3.org/WAI/WCAG22/Understanding/
 *
 * ============================================================================
 */

test.describe(
    "Module 05: WCAG Standards Deep Dive",
    { tag: ["@A11Y"] },
    () => {
        /**
         * TEST 1: WCAG 2.0 Level A — The Bare Minimum
         * ---------------------------------------------
         * Level A success criteria that axe can check:
         *   1.1.1 — Non-text content (images need alt text)
         *   1.3.1 — Info and relationships (semantic HTML)
         *   2.1.1 — Keyboard accessible
         *   2.4.1 — Bypass blocks (skip navigation)
         *   4.1.2 — Name, role, value (ARIA)
         */
        test("Test 1: WCAG 2.0 Level A — bare minimum compliance", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const levelA = await new AxeBuilder({ page })
                .withTags(["wcag2a"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  WCAG 2.0 LEVEL A — The Bare Minimum");
            console.log("=".repeat(60));
            console.log(
                "\n  Level A is about BASIC access. Without these,",
            );
            console.log(
                "  some users CANNOT use the website AT ALL.\n",
            );

            console.log(
                `  Rules checked: ${levelA.passes.length + levelA.violations.length}`,
            );
            console.log(`  Passed: ${levelA.passes.length}`);
            console.log(`  Failed: ${levelA.violations.length}`);

            if (levelA.violations.length > 0) {
                console.log("\n  Level A failures:");
                levelA.violations.forEach((v) => {
                    // Find the WCAG success criterion in the tags
                    const wcagCriteria = v.tags
                        .filter((t) => /^wcag\d{3,}$/.test(t))
                        .map((t) => {
                            // Convert wcag111 to 1.1.1
                            const nums = t.replace("wcag", "");
                            return nums.split("").join(".");
                        });
                    console.log(
                        `    ❌ ${v.id} [${v.impact}]`,
                    );
                    console.log(`       Rule: ${v.help}`);
                    if (wcagCriteria.length > 0) {
                        console.log(
                            `       WCAG: ${wcagCriteria.join(", ")}`,
                        );
                    }
                });
            }

            console.log(
                "\n  💡 If you fail Level A, you're failing the MINIMUM standard.\n",
            );
            expect(levelA.violations).toBeDefined();
        });

        /**
         * TEST 2: WCAG 2.0 Level AA — The Industry Standard
         * ---------------------------------------------------
         * Level AA adds to Level A:
         *   1.4.3 — Contrast (minimum) — 4.5:1 for normal text
         *   1.4.4 — Resize text — up to 200% without loss
         *   2.4.5 — Multiple ways — more than one way to find pages
         *   2.4.6 — Headings and labels — descriptive
         *   3.1.2 — Language of parts — lang on elements in other languages
         */
        test("Test 2: WCAG 2.0 Level AA — the standard everyone targets", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // Level AA includes Level A + AA
            const levelAA = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa"])
                .analyze();

            // Level A alone
            const levelAOnly = await new AxeBuilder({ page })
                .withTags(["wcag2a"])
                .analyze();

            // What's unique to AA (not in A)
            const aaOnlyViolationIds = new Set(
                levelAA.violations.map((v) => v.id),
            );
            const aOnlyViolationIds = new Set(
                levelAOnly.violations.map((v) => v.id),
            );
            const uniqueToAA = levelAA.violations.filter(
                (v) => !aOnlyViolationIds.has(v.id),
            );

            console.log("\n" + "=".repeat(60));
            console.log("  WCAG 2.0 LEVEL AA — The Industry Standard");
            console.log("=".repeat(60));

            console.log(
                `\n  Level A violations:  ${levelAOnly.violations.length}`,
            );
            console.log(
                `  Level AA violations: ${levelAA.violations.length} (A + AA combined)`,
            );
            console.log(
                `  Unique to AA:        ${uniqueToAA.length} additional rules`,
            );

            if (uniqueToAA.length > 0) {
                console.log(
                    "\n  Rules that ONLY appear at Level AA (not A):",
                );
                uniqueToAA.forEach((v) => {
                    console.log(
                        `    🟠 ${v.id}: ${v.help}`,
                    );
                });
            }

            console.log("\n  WHAT LEVEL AA ADDS:");
            console.log(
                "    • Color contrast 4.5:1 (normal text)",
            );
            console.log(
                "    • Color contrast 3:1 (large text)",
            );
            console.log("    • Text resizable to 200%");
            console.log("    • Multiple ways to navigate");
            console.log("    • Descriptive headings and labels");
            console.log(
                "\n  📜 THIS is what ADA, Section 508, and EU law reference.\n",
            );

            expect(levelAA.violations).toBeDefined();
        });

        /**
         * TEST 3: WCAG 2.1 Additions — Mobile and Cognitive
         * ---------------------------------------------------
         * WCAG 2.1 added 17 new success criteria focusing on:
         *   - Mobile accessibility (orientation, pointer gestures)
         *   - Cognitive/learning disabilities (identify input purpose)
         *   - Low vision (reflow, text spacing, non-text contrast)
         */
        test("Test 3: WCAG 2.1 additions — mobile and cognitive", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            // WCAG 2.0 AA
            const wcag20aa = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa"])
                .analyze();

            // WCAG 2.1 AA (includes 2.0 + 2.1 additions)
            const wcag21aa = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  WCAG 2.1 ADDITIONS — Mobile & Cognitive");
            console.log("=".repeat(60));

            console.log(
                `\n  WCAG 2.0 AA violations: ${wcag20aa.violations.length}`,
            );
            console.log(
                `  WCAG 2.1 AA violations: ${wcag21aa.violations.length}`,
            );

            // Find 2.1-only violations
            const ids20 = new Set(wcag20aa.violations.map((v) => v.id));
            const newIn21 = wcag21aa.violations.filter(
                (v) => !ids20.has(v.id),
            );

            if (newIn21.length > 0) {
                console.log(
                    "\n  NEW violations from WCAG 2.1 rules:",
                );
                newIn21.forEach((v) => {
                    console.log(
                        `    🆕 ${v.id}: ${v.help}`,
                    );
                });
            } else {
                console.log(
                    "\n  No additional violations from WCAG 2.1 rules.",
                );
            }

            console.log("\n  KEY WCAG 2.1 SUCCESS CRITERIA:");
            console.log(
                "    1.3.4 — Orientation: Don't lock to portrait/landscape",
            );
            console.log(
                "    1.3.5 — Identify Input Purpose: autocomplete attributes",
            );
            console.log(
                "    1.4.10 — Reflow: Content reflows at 320px width",
            );
            console.log(
                "    1.4.11 — Non-text Contrast: 3:1 for UI components",
            );
            console.log(
                "    1.4.12 — Text Spacing: Works with custom spacing",
            );
            console.log(
                "    2.5.1 — Pointer Gestures: Alternatives to complex gestures",
            );
            console.log(
                '\n  💡 2.1 is important for MOBILE apps — "mobile-first a11y"\n',
            );

            expect(wcag21aa.violations).toBeDefined();
        });

        /**
         * TEST 4: Section 508 — US Federal Government Standard
         * -----------------------------------------------------
         * Section 508 of the Rehabilitation Act requires US federal
         * agencies to make their ICT accessible. Since 2018, it
         * references WCAG 2.0 AA.
         */
        test("Test 4: Section 508 compliance scan", async ({ page }) => {
            await page.goto(ORANGEHRM_URL);
            await page.waitForLoadState("networkidle");

            const section508 = await new AxeBuilder({ page })
                .withTags(["section508"])
                .analyze();

            // Also run WCAG 2.0 AA for comparison
            const wcag20aa = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa"])
                .analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  SECTION 508 — US Federal Government Standard");
            console.log("=".repeat(60));
            console.log(
                "\n  Section 508 applies to ALL US federal government",
            );
            console.log(
                "  websites and ICT (Information & Communication Technology).",
            );

            console.log(
                `\n  Section 508 violations: ${section508.violations.length}`,
            );
            console.log(
                `  WCAG 2.0 AA violations: ${wcag20aa.violations.length}`,
            );

            if (section508.violations.length > 0) {
                console.log(
                    "\n  Section 508 violations found:",
                );
                section508.violations.forEach((v) => {
                    console.log(
                        `    ❌ ${v.id} [${v.impact}]: ${v.help}`,
                    );
                });
            }

            console.log("\n  RELATIONSHIP:");
            console.log(
                "    Section 508 (2018 refresh) → references WCAG 2.0 AA",
            );
            console.log(
                "    If you meet WCAG 2.0 AA, you largely meet Section 508",
            );
            console.log(
                "    axe maps some rules to the section508 tag directly\n",
            );

            expect(section508.violations).toBeDefined();
        });

        /**
         * TEST 5: Mapping a Violation to Its WCAG Success Criterion
         * ----------------------------------------------------------
         * Goal: Take a real violation and trace it back to the exact
         *       WCAG success criterion it maps to.
         *
         * This is the skill that makes you an EXPERT — understanding
         * not just WHAT failed, but WHY it's a standard requirement.
         */
        test("Test 5: Map violations to WCAG success criteria", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            const { violations } = await new AxeBuilder({ page }).analyze();

            console.log("\n" + "=".repeat(60));
            console.log("  MAPPING VIOLATIONS → WCAG SUCCESS CRITERIA");
            console.log("=".repeat(60));

            // Known WCAG success criteria descriptions
            const wcagDescriptions: Record<string, string> = {
                "wcag111": "1.1.1 Non-text Content",
                "wcag131": "1.3.1 Info and Relationships",
                "wcag141": "1.4.1 Use of Color",
                "wcag143": "1.4.3 Contrast (Minimum)",
                "wcag211": "2.1.1 Keyboard",
                "wcag241": "2.4.1 Bypass Blocks",
                "wcag242": "2.4.2 Page Titled",
                "wcag246": "2.4.6 Headings and Labels",
                "wcag311": "3.1.1 Language of Page",
                "wcag312": "3.1.2 Language of Parts",
                "wcag412": "4.1.2 Name, Role, Value",
            };

            violations.forEach((v, i) => {
                const wcagTags = v.tags.filter((t) =>
                    /^wcag\d{3,}$/.test(t),
                );
                const otherTags = v.tags.filter(
                    (t) =>
                        !t.startsWith("wcag") ||
                        !/^wcag\d{3,}$/.test(t),
                );

                console.log(
                    `\n  ${i + 1}. ${v.id} [${v.impact}]`,
                );
                console.log(`     Rule: ${v.help}`);

                if (wcagTags.length > 0) {
                    console.log("     WCAG Success Criteria:");
                    wcagTags.forEach((tag) => {
                        const desc =
                            wcagDescriptions[tag] ||
                            `${tag.replace("wcag", "").split("").join(".")}`;
                        console.log(`       📜 ${desc}`);
                    });
                }

                console.log(
                    `     Other tags: ${otherTags.join(", ")}`,
                );
                console.log(`     Learn more: ${v.helpUrl}`);
            });

            console.log(
                "\n  💡 EXPERT SKILL: When someone asks 'why is this a violation?',",
            );
            console.log(
                "     you can say: 'It fails WCAG 2.0 Success Criterion 1.4.3",
            );
            console.log(
                "     Contrast (Minimum) — text needs 4.5:1 contrast ratio.'",
            );
            console.log(
                "     That's the difference between a tester and an expert.\n",
            );

            expect(violations).toBeDefined();
        });
    },
);

/**
 * ============================================================================
 * PERSONAL NOTES / KEY TAKEAWAYS:
 * ============================================================================
 *
 * 1. WCAG versions: 2.0 (2008) → 2.1 (2018) → 2.2 (2023)
 *    Each version ADDS criteria, doesn't remove any
 *
 * 2. Levels: A (minimum) → AA (standard) → AAA (gold)
 *    TARGET AA — it's what the law requires
 *
 * 3. The 4 principles (POUR):
 *    Perceivable, Operable, Understandable, Robust
 *
 * 4. axe tags for WCAG: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa
 *    For WCAG 2.1 AA: .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
 *
 * 5. Every violation maps to a WCAG success criterion via tags[]
 *    e.g., color-contrast → wcag143 → WCAG 1.4.3 Contrast (Minimum)
 *
 * 6. Section 508 ≈ WCAG 2.0 AA (since 2018 refresh)
 *
 * 7. EXPERT MOVE: Always cite the WCAG criterion, not just the rule name
 *
 * NEXT: Module 06 integrates axe into your Page Object Model
 *       with an AccessibilityHelper class and custom fixtures.
 * ============================================================================
 */
