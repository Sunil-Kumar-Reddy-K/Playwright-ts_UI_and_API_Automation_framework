# Playwright Accessibility Testing with axe-core

A hands-on learning guide for mastering accessibility (A11Y) testing using **Playwright** and **@axe-core/playwright**. Built as executable spec files — each test is a lesson with detailed inline comments explaining the *what*, *why*, and *how*.

---

## Table of Contents

- [What is A11Y?](#what-is-a11y)
- [What is axe-core?](#what-is-axe-core)
- [Prerequisites](#prerequisites)
- [Module Overview](#module-overview)
  - [Module 01: Axe-Core Basics](#module-01-axe-core-basics)
  - [Module 02: Analyzing Violations](#module-02-analyzing-violations)
  - [Module 03: Targeted Scanning](#module-03-targeted-scanning)
  - [Module 04: Rule Configuration](#module-04-rule-configuration)
  - [Module 05: WCAG Standards Deep Dive](#module-05-wcag-standards-deep-dive)
  - [Module 06: POM Integration](#module-06-pom-integration)
  - [Module 07: Accessibility Reporting](#module-07-accessibility-reporting)
  - [Module 08: Advanced Patterns](#module-08-advanced-patterns)
  - [Module 09: CI/CD Integration](#module-09-cicd-integration)
  - [Module 10: Full Audit (Capstone)](#module-10-full-audit-capstone)
  - [Module 11: Beyond Axe](#module-11-beyond-axe--what-automated-tools-miss)
- [How to Run](#how-to-run)
- [Test Applications Used](#test-applications-used)
- [Key Files](#key-files)
- [Q&A / Clarifications](#qa--clarifications)
- [References & Resources](#references--resources)
- [What's Next](#whats-next)

---

## What is A11Y?

**A11Y** is a numeronym (number-based abbreviation) for **"Accessibility"**:

```
A   c c e s s i b i l i t   Y
|   <--  11 letters  -->     |
A          11                Y
```

Same pattern as **i18n** (internationalization) and **l10n** (localization).

~16% of the world's population has some form of disability. Accessibility isn't optional — it's a legal requirement in many countries (ADA, Section 508, EU Accessibility Act).

---

## What is axe-core?

[axe-core](https://github.com/dequelabs/axe-core) is the world's most popular open-source accessibility testing engine, built by **Deque Systems**. `@axe-core/playwright` is the official Playwright integration.

**How it works:**
1. Navigate to a page with Playwright
2. Create an `AxeBuilder` instance: `new AxeBuilder({ page })`
3. Call `.analyze()` — returns an `AxeResults` object
4. Assert on the results (violations, passes, etc.)

**What axe returns (the 4 result buckets):**

| Bucket | Meaning |
|---|---|
| `violations[]` | Rules that FAILED (accessibility problems) |
| `passes[]` | Rules that PASSED (things done correctly) |
| `incomplete[]` | Rules that NEED MANUAL REVIEW |
| `inapplicable[]` | Rules that DON'T APPLY to this page |

**Severity levels (impact):**

| Level | Icon | Meaning |
|---|---|---|
| critical | RED | Blocks access entirely (e.g., no keyboard access) |
| serious | ORANGE | Major barrier (e.g., missing form labels) |
| moderate | YELLOW | Some difficulty (e.g., heading order skipped) |
| minor | BLUE | Annoyance (e.g., redundant alt text) |

---

## Prerequisites

```bash
npm install -D @axe-core/playwright
```

Already included in the project's `package.json`.

---

## Module Overview

**Total: 11 modules, 59 tests**

The learning path follows a deliberate progression:

```
Scan (01) --> Understand results (02) --> Target scans (03) --> Configure rules (04)
    --> Learn WCAG (05) --> Build reusable helpers (06) --> Generate reports (07)
        --> Test real-world scenarios (08) --> CI/CD gates (09)
            --> Full audit capstone (10) --> Beyond automation (11)
```

---

### Module 01: Axe-Core Basics
**File:** `01_axe_basics/axe-basics.spec.ts` | **Tests:** 5

Your first accessibility scan. Run axe, explore the `AxeResults` object, understand the 4 result buckets, and learn severity levels.

| Test | What You Learn |
|---|---|
| Test 1: First axe scan | Run a full-page scan, explore the AxeResults structure |
| Test 2: Group violations by severity | Categorize violations into critical/serious/moderate/minor |
| Test 3: Explore passes, inapplicable, incomplete | What the page does RIGHT, not just wrong |
| Test 4: Compare GreenKart vs TodoMVC | Side-by-side comparison — "needs work" vs "good" |
| Test 5: The accessibility gate | The production pattern: `expect(violations).toHaveLength(0)` |

**Flow:** scan --> understand results --> prioritize --> compare --> gate

---

### Module 02: Analyzing Violations
**File:** `02_analyzing_violations/analyzing-violations.spec.ts` | **Tests:** 6

Dissect the violation object. Understand EXACTLY what's wrong, WHERE it is, and HOW to fix it.

| Test | What You Learn |
|---|---|
| Test 1: Anatomy of a violation | Every field: id, impact, description, helpUrl, nodes[] |
| Test 2: Drilling into nodes | Find every offending DOM element via `target[]` and `html` |
| Test 3: Missing form labels | Deep dive into the `label` rule — most common violation |
| Test 4: Color contrast | The `color-contrast` rule — contrast ratios explained |
| Test 5: html-has-lang | Why the `<html lang="en">` attribute matters |
| Test 6: Pretty-print utility | Reusable violation formatter for console output |

**Key concept — The 10 Most Common Violations:**
1. `color-contrast` — Text contrast with background
2. `image-alt` — Missing alt on `<img>`
3. `label` — Form input missing `<label>`
4. `button-name` — Button has no accessible name
5. `link-name` — Empty link
6. `html-has-lang` — Missing lang attribute
7. `heading-order` — Heading levels skip (h1 to h3)
8. `region` — Content outside landmark region
9. `landmark-one-main` — Missing `<main>` landmark
10. `document-title` — Missing `<title>`

---

### Module 03: Targeted Scanning
**File:** `03_targeted_scanning/targeted-scanning.spec.ts` | **Tests:** 5

Scan specific page sections instead of the entire page using `include()` and `exclude()`.

| Test | What You Learn |
|---|---|
| Test 1: Full page vs targeted | Compare violation counts — see how targeting reduces noise |
| Test 2: Include header only | Scan just the header area |
| Test 3: Exclude sections | Skip third-party widgets or known issues |
| Test 4: Include + Exclude combined | Surgical precision scanning |
| Test 5: Dynamic content | Scan TodoMVC todo list after adding items |

**Analogy:** Building inspector —
- Full scan = inspect the entire building
- `include()` = "just inspect the kitchen"
- `exclude()` = "inspect everything EXCEPT the garage"

---

### Module 04: Rule Configuration
**File:** `04_rule_configuration/rule-configuration.spec.ts` | **Tests:** 6

Control which rules axe runs. Like `--grep` for accessibility rules.

| Test | What You Learn |
|---|---|
| Test 1: withTags — WCAG 2.0 Level A | Bare minimum compliance |
| Test 2: withTags — WCAG 2.1 Level AA | The industry standard target |
| Test 3: Best practices vs WCAG | Non-WCAG recommendations from Deque |
| Test 4: withRules — focused remediation | Run ONLY specific rules (fix one thing at a time) |
| Test 5: disableRules — suppress known issues | Accept certain violations temporarily |
| Test 6: Category tags | Scan by domain (forms, color, keyboard, ARIA, etc.) |

**Important:** `withTags()` and `withRules()` are MUTUALLY EXCLUSIVE. `disableRules()` can combine with either.

**Tag reference table:**

| Tag | Description |
|---|---|
| `wcag2a` | WCAG 2.0 Level A (minimum) |
| `wcag2aa` | WCAG 2.0 Level AA (standard target) |
| `wcag2aaa` | WCAG 2.0 Level AAA (gold standard) |
| `wcag21a` | WCAG 2.1 Level A additions |
| `wcag21aa` | WCAG 2.1 Level AA additions |
| `wcag22aa` | WCAG 2.2 Level AA additions |
| `best-practice` | Industry recommendations (not WCAG) |
| `section508` | US federal government (maps to WCAG 2.0 AA) |
| `cat.forms` | Form-related rules |
| `cat.color` | Color-related rules |
| `cat.keyboard` | Keyboard navigation rules |
| `cat.aria` | ARIA usage rules |

---

### Module 05: WCAG Standards Deep Dive
**File:** `05_wcag_standards/wcag-standards.spec.ts` | **Tests:** 5

Understand the rulebook. WCAG versions, conformance levels, the 4 principles (POUR), and how axe maps to specific success criteria.

| Test | What You Learn |
|---|---|
| Test 1: WCAG 2.0 Level A | Bare minimum — keyboard access, text alternatives, seizure safety |
| Test 2: WCAG 2.0 Level AA | The standard — contrast 4.5:1, resize text, captions |
| Test 3: WCAG 2.1 additions | Mobile and cognitive: touch targets, text spacing, reflow |
| Test 4: Section 508 scan | US federal compliance (maps to WCAG 2.0 AA) |
| Test 5: Map to WCAG criteria | Link each violation to its specific WCAG success criterion |

**The 4 Principles (POUR):**
- **P**erceivable — Users can perceive content (alt text, captions)
- **O**perable — Users can navigate and interact (keyboard, timing)
- **U**nderstandable — Content is readable and predictable
- **R**obust — Works with current and future technologies

**Analogy — WCAG levels are like fire safety:**
- Level A = smoke detectors (bare minimum)
- Level AA = smoke detectors + sprinklers + exits (standard building code)
- Level AAA = full fire suppression system (hospital grade)

---

### Module 06: POM Integration
**File:** `06_pom_integration/pom-integration.spec.ts` + `accessibility-helper.ts` | **Tests:** 5

Build a reusable `AccessibilityHelper` class following the Page Object Model. Integrate it as a custom Playwright fixture.

| Test | What You Learn |
|---|---|
| Test 1: Manual instantiation | Create AccessibilityHelper directly in a test |
| Test 2: Custom fixture | `a11y` injected automatically — `async ({ a11y }) => {}` |
| Test 3: A11Y after interactions | Scan after user actions (search, add to cart) |
| Test 4: Assertion helpers | `assertNoCriticalViolations()`, `assertWcag21AA()` |
| Test 5: Different configurations | Different scan settings for different pages |

**`AccessibilityHelper` methods:**
- `scanFullPage()` — Full page scan with configured rules
- `scanSection(selector)` — Targeted scan
- `assertNoViolations()` — Strict zero-tolerance gate
- `assertNoCriticalViolations()` — Only block on critical
- `assertWcag21AA()` — WCAG 2.1 AA compliance check
- `getViolationsByImpact()` — Group by severity
- `prettyPrintResults()` — Formatted console output

---

### Module 07: Accessibility Reporting
**File:** `07_accessibility_reporting/accessibility-reporting.spec.ts` | **Tests:** 4

Generate actionable reports for different audiences.

| Test | What You Learn |
|---|---|
| Test 1: Attach to Playwright report | `testInfo.attach()` — embed results in HTML report |
| Test 2: JSON report to disk | Structured data for CI/CD, dashboards, trend analysis |
| Test 3: Standalone HTML report | Shareable report for non-technical stakeholders |
| Test 4: CI-friendly console | Formatted terminal output for CI logs |

---

### Module 08: Advanced Patterns
**File:** `08_advanced_patterns/advanced-patterns.spec.ts` | **Tests:** 7

Test accessibility in real-world dynamic scenarios — modals, dropdowns, keyboard nav, mobile viewports.

| Test | What You Learn |
|---|---|
| Test 1: Modal/dialog scan | Scan OrangeHRM modal after login |
| Test 2: After user interaction | Scan during add-to-cart flow |
| Test 3: Keyboard navigation | Tab order, focus visibility audit |
| Test 4: ARIA attribute validation | Direct checks: role, label, describedby, expanded |
| Test 5: Color contrast audit | Focused contrast ratio analysis with cheat sheet |
| Test 6: Mobile viewport | iPhone 13 vs Desktop — responsive a11y comparison |
| Test 7: Focus management | Verify focus moves correctly after adding/deleting todos |

**Analogy:** Modules 01-07 taught you to inspect a parked car. Module 08 teaches you to inspect it WHILE IT'S MOVING.

---

### Module 09: CI/CD Integration
**File:** `09_ci_integration/ci-integration.spec.ts` | **Tests:** 4

Production-ready accessibility gates for your pipeline.

| Test | What You Learn |
|---|---|
| Test 1: Zero critical gate | Block deploys if ANY critical violation exists |
| Test 2: Configurable threshold | `A11Y_THRESHOLD` env var for flexible gating |
| Test 3: Regression detection | Compare against baseline — no NEW violations |
| Test 4: Machine-parseable output | JSON output for automated processing |

**CI/CD Strategy:**

| Stage | Gate Level | What Happens |
|---|---|---|
| Local dev | Full scan | See all violations |
| PR (pre-merge) | No critical/serious | Block merge if found |
| CI (post-merge) | Threshold-based | Track trend, alert |
| Release gate | WCAG 2.1 AA | Block release if fail |

---

### Module 10: Full Audit (Capstone)
**File:** `10_full_audit/full-audit.spec.ts` | **Tests:** 6

Conduct a complete accessibility audit of GreenKart across multiple pages — combines everything from Modules 01-09.

| Test | What You Learn |
|---|---|
| Test 1: Homepage audit | Product listing page scan |
| Test 2: Offers page audit | Sortable table scan |
| Test 3: Cart flow audit | Add items, review cart, scan |
| Test 4: Cross-page aggregation | Deduplicate violations across all pages |
| Test 5: Comprehensive report | Generate full audit report to disk |
| Test 6: Manual check checklist | Document what axe CANNOT catch |

**Analogy:** Modules 01-09 taught you individual medical tests. Module 10 is the COMPLETE PHYSICAL.

---

### Module 11: Beyond Axe — What Automated Tools Miss
**File:** `11_beyond_axe/beyond-axe.spec.ts` | **Tests:** 6

The uncomfortable truth: **automated tools detect only 30-40% of real WCAG violations**. This module covers the other 60-70% that require manual Playwright tests.

| Test | What You Learn |
|---|---|
| Test 1: Ambiguous link text | "Read more", "Click here" pass axe but fail users |
| Test 2: Skip navigation audit | Keyboard users need skip links — axe only checks landmarks |
| Test 3: Dynamic ARIA labels | Labels that don't update when state changes |
| Test 4: Dark mode contrast | axe only scans the current color scheme, not both |
| Test 5: Focus trapping in modals | Tab cycling, Escape, focus return — behavioral checks |
| Test 6: Low-quality alt text | `alt="image"` passes axe but is useless |

**Research numbers (why this module matters):**

| Source | Finding |
|---|---|
| WebAIM | ~30% of WCAG failures detectable by automation |
| W3C/WAI | 20-30% of WCAG Success Criteria fully automatable |
| Deque (axe makers) | 57.38% on curated pages (best case) |
| Accessible.org (WCAG 2.2 AA) | 13% fully automatable, 45% partially, 42% not at all |

**Analogy (from the reference article):**
> "Think of automated tools as a robot vacuum. They cover large areas automatically and pick up dirt between manual sessions, but you still need to manually vacuum spots they can't reach."

**Real findings from Module 11 on our test apps:**
- GreenKart: 1 empty link (cart icon with no accessible name), no landmarks at all
- OrangeHRM: No skip navigation, no `<main>`, `<nav>`, `<header>`, or `<footer>` landmarks
- Focus trapping test: Focus escaped the injected modal 2 times during Tab cycling
- Alt text quality: axe found 1 violation, our custom check found 2 additional issues (`alt="back"`, `alt="Capsicum"` matching filenames)

---

## How to Run

```bash
# Run ALL accessibility tests (all 11 modules)
npx playwright test --grep @A11Y --project=chromium

# Run a specific module
npx playwright test tests/accessibility_axe/01_axe_basics/ --project=chromium

# Run a specific test by name
npx playwright test --grep "Test 1: First axe scan" --project=chromium

# Run with headed browser (watch the tests)
npx playwright test --grep @A11Y --project=chromium --headed

# Run with debug mode (step through)
npx playwright test --grep @A11Y --project=chromium --debug
```

All tests use the tag `@A11Y`.

---

## Test Applications Used

| Application | URL | Why |
|---|---|---|
| **GreenKart** | https://rahulshettyacademy.com/seleniumPractise/ | E-commerce app with REAL accessibility issues — perfect for finding violations |
| **TodoMVC** | https://demo.playwright.dev/todomvc/#/ | Well-built React app — good baseline for comparison and dynamic content testing |
| **OrangeHRM** | https://opensource-demo.orangehrmlive.com/ | Enterprise HR app — login flows, modals, complex forms |

---

## Key Files

```
tests/accessibility_axe/
    01_axe_basics/
        axe-basics.spec.ts                  # First scans, result structure, severity
    02_analyzing_violations/
        analyzing-violations.spec.ts        # Violation anatomy, common issues, formatting
    03_targeted_scanning/
        targeted-scanning.spec.ts           # include(), exclude(), surgical scans
    04_rule_configuration/
        rule-configuration.spec.ts          # withTags, withRules, disableRules
    05_wcag_standards/
        wcag-standards.spec.ts              # WCAG versions, POUR principles, Section 508
    06_pom_integration/
        accessibility-helper.ts             # Reusable AccessibilityHelper class (POM)
        pom-integration.spec.ts             # Custom fixture, assertion helpers
    07_accessibility_reporting/
        accessibility-reporting.spec.ts     # JSON, HTML, console reports, testInfo.attach()
    08_advanced_patterns/
        advanced-patterns.spec.ts           # Modals, keyboard nav, ARIA, mobile, focus
    09_ci_integration/
        ci-integration.spec.ts              # CI gates, thresholds, regression detection
    10_full_audit/
        full-audit.spec.ts                  # Multi-page audit, aggregation, final report
    11_beyond_axe/
        beyond-axe.spec.ts                  # What axe misses: links, skip nav, ARIA, dark mode, focus, alt text
```

---

## Q&A / Clarifications

Questions and concepts clarified during the learning process:

### Q: What does "A11Y" mean?
**A:** It's a numeronym for "Accessibility" — **A** + **11 letters** + **Y**. Same pattern as i18n (internationalization) and l10n (localization). Used as the test tag `@A11Y` to run all accessibility tests with `--grep @A11Y`.

### Q: What does the `...` (spread operator) do in the test code?
**A:** The JavaScript spread operator unpacks arrays into a new combined array:
```typescript
const criticalAndSerious = [...bySeverity.critical, ...bySeverity.serious];
// Same as: bySeverity.critical.concat(bySeverity.serious)
```

### Q: In Module 01, Test 1 is about getting violations, and Test 2 is about criticality — is that right?
**A:** Yes, at a high level:
- **Test 1** — "What's wrong with this page?" — runs your first scan, shows the 4 result buckets
- **Test 2** — "How bad is each violation?" — groups by severity (critical > serious > moderate > minor), teaches prioritization
- **Test 3** — Flips the perspective: what did the page do RIGHT
- **Test 4** — Compares GreenKart vs TodoMVC side by side
- **Test 5** — The production CI gate pattern: `expect(violations).toHaveLength(0)`

### Q: Do we agree with the article that says axe only catches 30-40%?
**A:** Mostly yes, with nuance:
- The stat is accurate and well-documented by WebAIM, W3C, and Deque themselves
- The 10 gaps listed (ambiguous links, skip nav, dynamic ARIA, focus trapping, etc.) are all real
- But it's **working as designed** — axe is a static DOM analyzer. Asking it to judge meaning is like asking a spell-checker to evaluate persuasiveness
- The real value of axe isn't catching everything — it's **preventing regressions at scale in CI**. Fix once manually, axe ensures it stays fixed
- The article's "robot vacuum" analogy is spot on

### Q: Does our framework have gaps compared to the article?
**A:** Module 11 was created specifically to address the 6 major gaps from the article:

| Article Gap | Our Coverage |
|---|---|
| Ambiguous link text | Test 1 — pattern matching against known-bad link text |
| Skip navigation links | Test 2 — checks first focusable element, counts tabs to content |
| Dynamic ARIA labels | Test 3 — verifies state changes after interactions |
| Dark mode contrast | Test 4 — light vs dark emulation with side-by-side scan |
| Focus trapping in modals | Test 5 — Tab cycling, Escape, focus return verification |
| Low-quality alt text | Test 6 — pattern detection for generic/filename alt text |

4 gaps from the article are partially covered by Module 08 (keyboard nav, mobile viewport, ARIA validation, focus management).

Remaining gaps that truly need **human judgment** (no code can fully solve):
- Whether alt text is actually *descriptive enough*
- Whether error messages are *clear enough*
- Whether a page makes sense with a real screen reader (NVDA, JAWS, VoiceOver)

---

## References & Resources

### Article Reference
- [Playwright Accessibility Testing: What axe and Lighthouse Miss](https://www.davidmello.com/software-testing/test-automation/playwright-accessibility-testing-axe-lighthouse-limitations) — David Mello. Covers the 10 major gaps in automated a11y testing with Playwright code examples. Module 11 was built based on this article.

### Official Documentation
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — Official Playwright integration
- [axe-core rule descriptions](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) — All 90+ rules
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) — Playwright's official guide
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — The standard
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — Filterable success criteria

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — Manual contrast ratio verification
- [axe DevTools](https://www.deque.com/axe/devtools/) — Browser extension for manual scans
- Chrome DevTools Accessibility panel — Built-in browser tools

---

## What's Next

This axe-core learning path is planned to move into a **standalone Accessibility Testing repository** alongside **Playwright Lighthouse** testing:

```
playwright-accessibility-testing/    (future repo)
    tests/
        axe/           <-- these 11 modules
        lighthouse/    <-- Lighthouse performance + a11y audits (coming soon)
    utils/
    playwright.config.ts
    package.json
```

Lighthouse complements axe by providing:
- Overall accessibility **score** (0-100)
- **Performance** audits alongside accessibility
- **SEO** and best practices checks
- A different perspective on the same WCAG rules
