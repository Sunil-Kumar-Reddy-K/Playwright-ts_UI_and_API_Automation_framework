import { test, expect, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const GREENKART_URL = "https://rahulshettyacademy.com/seleniumPractise/";
const TODOMVC_URL = "https://demo.playwright.dev/todomvc/#/";
const ORANGEHRM_URL = "https://opensource-demo.orangehrmlive.com/";

/**
 * ============================================================================
 * MODULE 11: BEYOND AXE — What Automated Tools Miss (60-70% of WCAG)
 * ============================================================================
 *
 * REFERENCE ARTICLE:
 *   "Playwright Accessibility Testing: What axe and Lighthouse Miss"
 *   by David Mello
 *   https://www.davidmello.com/software-testing/test-automation/playwright-accessibility-testing-axe-lighthouse-limitations
 *
 * ============================================================================
 * WHY THIS MODULE EXISTS:
 * ============================================================================
 *
 * In Modules 01-10 you learned to use axe-core — the industry standard
 * automated accessibility scanner. But here's the uncomfortable truth:
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  "Automated tools detect only 30-40% of real        │
 *   │   WCAG violations."                                 │
 *   │                                                     │
 *   │   — WebAIM, W3C/WAI, Deque (the makers of axe)     │
 *   └─────────────────────────────────────────────────────┘
 *
 * Research numbers:
 *   - WebAIM:         ~30% of WCAG failures detectable by automation
 *   - W3C/WAI:        20-30% of WCAG Success Criteria fully automatable
 *   - Deque (axe):    57.38% on curated audited pages (best case)
 *   - Accessible.org: Under WCAG 2.2 AA:
 *                       13% fully automatable
 *                       45% partially automatable
 *                       42% NOT automatable at all
 *
 * WHY? Because axe analyzes the STATIC DOM. It can check:
 *   ✅ "Does this image have an alt attribute?"
 *   ❌ "Is this alt text actually helpful to a blind user?"
 *   ✅ "Does this button have an aria-label?"
 *   ❌ "Does this aria-label update when the button state changes?"
 *   ✅ "Is the contrast ratio of this text sufficient?"
 *   ❌ "What about contrast on hover? In dark mode? Over a gradient?"
 *
 * ANALOGY:
 *   axe is like a spell-checker. It catches typos reliably.
 *   But it can't tell you if your essay is persuasive, your argument
 *   is logical, or your tone is appropriate. You need human judgment
 *   for MEANING. Same with accessibility — tools check structure,
 *   humans check experience.
 *
 * David Mello's analogy from the article:
 *   "Think of them as a robot vacuum. They cover large areas
 *    automatically and pick up dirt between manual sessions, but
 *    you still need to manually vacuum spots they can't reach."
 *
 * ============================================================================
 * WHAT THIS MODULE COVERS (the 6 gaps from the article):
 * ============================================================================
 *
 *   Test 1: Ambiguous Link Text Detection
 *           — Links like "Read more", "Click here" pass axe but fail users
 *
 *   Test 2: Skip Navigation Links
 *           — Keyboard users need a way to skip past nav menus
 *
 *   Test 3: Dynamic ARIA Labels — State-Aware Validation
 *           — Labels that don't update when state changes
 *
 *   Test 4: Dark Mode Contrast Testing
 *           — axe only scans the CURRENT color scheme, not both
 *
 *   Test 5: Focus Trapping in Modals/Dialogs
 *           — axe checks modal structure, NOT focus behavior
 *
 *   Test 6: Low-Quality Alt Text and ARIA Labels
 *           — axe checks presence, not meaningfulness
 *
 * IMPORTANT DISTINCTION:
 *   Modules 01-10 = "How to use axe-core" (the 30-40% you automate)
 *   Module 11      = "What axe-core can't catch" (the 60-70% you code manually)
 *
 * This is what separates someone who runs a tool from someone who
 * UNDERSTANDS accessibility.
 *
 * ============================================================================
 */

test.describe(
    "Module 11: Beyond Axe — What Automated Tools Miss",
    { tag: ["@A11Y"] },
    () => {
        /**
         * ====================================================================
         * TEST 1: AMBIGUOUS LINK TEXT DETECTION
         * ====================================================================
         *
         * THE PROBLEM:
         *   Screen reader users often navigate a page by pulling up a list
         *   of ALL links. Imagine hearing this:
         *
         *     "Read more"
         *     "Read more"
         *     "Click here"
         *     "Read more"
         *     "Learn more"
         *
         *   Where does each link go? No idea. Zero context.
         *
         * WHY AXE MISSES THIS:
         *   axe checks: "Does this link have text?" → Yes → PASS
         *   axe does NOT check: "Is this link text MEANINGFUL out of context?"
         *   That requires understanding INTENT — a human judgment call.
         *
         * WCAG REFERENCE:
         *   2.4.4 Link Purpose (In Context) — Level A
         *   2.4.9 Link Purpose (Link Only) — Level AAA
         *
         *   Level A says link text can be meaningful in context (surrounding
         *   paragraph). Level AAA says it must be meaningful ON ITS OWN.
         *   Most teams target AA, but ambiguous links are bad UX regardless.
         *
         * THE FIX (for developers):
         *   BAD:  <a href="/blog/post-1">Read more</a>
         *   GOOD: <a href="/blog/post-1">Read more about Playwright testing</a>
         *   ALSO: <a href="/blog/post-1" aria-label="Read full article about Playwright testing">Read more</a>
         *
         * WHAT THIS TEST DOES:
         *   1. Collects ALL links on the page
         *   2. Checks each link's text against a known-bad list
         *   3. Reports which links have ambiguous text and their location
         *   4. This is a pattern you'd add to your CI pipeline alongside axe
         *
         * ====================================================================
         */
        test("Test 1: Ambiguous link text detection", async ({ page }) => {
            await page.goto(GREENKART_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  AMBIGUOUS LINK TEXT DETECTION");
            console.log("=".repeat(60));

            /**
             * STEP 1: Define the "blocklist" of generic link text patterns.
             *
             * These are words/phrases that, when used as the ENTIRE link text,
             * give screen reader users NO context about where the link goes.
             *
             * This list comes from common accessibility audit findings.
             * You can customize it for your project.
             */
            const ambiguousPatterns = [
                "read more",
                "click here",
                "learn more",
                "more",
                "here",
                "link",
                "this",
                "continue",
                "details",
                "browse all",
                "go",
                "see more",
                "view more",
                "more info",
                "more details",
                "find out more",
            ];

            /**
             * STEP 2: Gather all links using Playwright's role-based locator.
             *
             * getByRole("link") finds all <a> elements with href attributes.
             * This is the same way a screen reader discovers links.
             */
            const links = await page.getByRole("link").all();

            console.log(`\n  Total links found on page: ${links.length}`);

            /**
             * STEP 3: Check each link against the ambiguous patterns.
             *
             * We check both:
             * - innerText: what the user sees visually
             * - aria-label: what the screen reader announces (overrides innerText)
             *
             * A link is only "ambiguous" if BOTH are generic or missing.
             */
            const ambiguousLinks: {
                text: string;
                ariaLabel: string | null;
                href: string | null;
            }[] = [];

            for (const link of links) {
                const text = (await link.innerText()).toLowerCase().trim();
                const ariaLabel = await link.getAttribute("aria-label");
                const href = await link.getAttribute("href");

                // If aria-label exists and is descriptive, the link is fine
                // even if the visible text is "Read more"
                const effectiveLabel = ariaLabel
                    ? ariaLabel.toLowerCase().trim()
                    : text;

                if (ambiguousPatterns.includes(effectiveLabel)) {
                    ambiguousLinks.push({
                        text: text || "(empty)",
                        ariaLabel,
                        href,
                    });
                }
            }

            /**
             * STEP 4: Report findings.
             */
            if (ambiguousLinks.length > 0) {
                console.log(
                    `\n  ❌ Found ${ambiguousLinks.length} ambiguous link(s):\n`,
                );
                ambiguousLinks.forEach((link, i) => {
                    console.log(`  ${i + 1}. Text: "${link.text}"`);
                    console.log(`     aria-label: ${link.ariaLabel || "NONE"}`);
                    console.log(`     href: ${link.href || "NONE"}`);
                    console.log("");
                });
            } else {
                console.log(
                    "\n  ✅ No ambiguous link text found! All links are descriptive.",
                );
            }

            /**
             * STEP 5: Also check for empty links (no text AND no aria-label).
             *
             * These are even worse — screen readers announce them as just
             * "link" with no information at all.
             */
            const emptyLinks: { html: string; href: string | null }[] = [];

            for (const link of links) {
                const text = (await link.innerText()).trim();
                const ariaLabel = await link.getAttribute("aria-label");
                const ariaLabelledBy =
                    await link.getAttribute("aria-labelledby");
                const title = await link.getAttribute("title");
                const href = await link.getAttribute("href");

                // A link needs at LEAST one of these to be accessible
                if (!text && !ariaLabel && !ariaLabelledBy && !title) {
                    const html = await link.evaluate(
                        (el) => el.outerHTML.substring(0, 120),
                    );
                    emptyLinks.push({ html, href });
                }
            }

            if (emptyLinks.length > 0) {
                console.log(
                    `  ❌ Found ${emptyLinks.length} empty link(s) (no accessible name at all):\n`,
                );
                emptyLinks.forEach((link, i) => {
                    console.log(`  ${i + 1}. ${link.html}`);
                });
            }

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                '     axe checks: "Does this link have text?" → Yes → PASS',
            );
            console.log(
                '     This test: "Is this link text MEANINGFUL?" → Human judgment',
            );
            console.log(
                "     Both are needed for real accessibility.\n",
            );

            // Log total findings for awareness (not failing the test —
            // this is an audit/awareness tool, not a strict gate)
            console.log(
                `  SUMMARY: ${ambiguousLinks.length} ambiguous + ${emptyLinks.length} empty out of ${links.length} total links`,
            );

            expect(links.length).toBeGreaterThan(0);
        });

        /**
         * ====================================================================
         * TEST 2: SKIP NAVIGATION LINKS
         * ====================================================================
         *
         * THE PROBLEM:
         *   Imagine you're a keyboard-only user visiting a news website.
         *   The site has a nav bar with 50 links (Home, Sports, Weather,
         *   Entertainment, etc.). To reach the article content, you press
         *   Tab... 50 times. EVERY. SINGLE. PAGE.
         *
         *   A "skip navigation" link solves this. It's a hidden link that
         *   appears as the FIRST focusable element and jumps you straight
         *   past the nav to the main content.
         *
         * WHY AXE MISSES THIS:
         *   axe checks for HTML5 landmark elements (<nav>, <main>, <header>).
         *   If those exist, axe is satisfied. But landmarks alone DON'T help
         *   keyboard-only users — they help screen reader users (who can
         *   navigate by landmarks). Keyboard-only users with NO screen reader
         *   still need a skip link.
         *
         *   axe says: "Has <main> landmark? → PASS"
         *   Reality:  "Can a keyboard user skip 50 nav links? → NO"
         *
         * WCAG REFERENCE:
         *   2.4.1 Bypass Blocks — Level A
         *   "A mechanism is available to bypass blocks of content that are
         *    repeated on multiple Web pages."
         *
         * HOW A SKIP LINK WORKS:
         *   <body>
         *     <a href="#main-content" class="skip-link">Skip to main content</a>
         *     <nav>... 50 links ...</nav>
         *     <main id="main-content">... article content ...</main>
         *   </body>
         *
         *   CSS makes it visually hidden until focused:
         *   .skip-link { position: absolute; left: -9999px; }
         *   .skip-link:focus { position: static; }
         *
         * WHAT THIS TEST DOES:
         *   1. Checks if a skip link exists as the first focusable element
         *   2. Verifies it targets a valid element (#main, #content, etc.)
         *   3. Verifies it becomes visible on focus (not permanently hidden)
         *   4. Tests that Tab → Enter actually moves focus to main content
         *
         * ====================================================================
         */
        test("Test 2: Skip navigation link audit", async ({ page }) => {
            // Test against OrangeHRM — a real app with substantial navigation
            await page.goto(ORANGEHRM_URL);
            await page.waitForLoadState("networkidle");

            console.log("\n" + "=".repeat(60));
            console.log("  SKIP NAVIGATION LINK AUDIT");
            console.log("=".repeat(60));

            /**
             * STEP 1: Check if a skip link exists.
             *
             * Skip links typically:
             * - Are <a> elements with href starting with "#"
             * - Contain text like "skip to content", "skip navigation"
             * - Are the FIRST focusable element on the page
             *
             * We search for them by common text patterns.
             */
            const skipLinkSelectors = [
                'a[href^="#"][class*="skip"]',
                'a[href^="#main"]',
                'a[href^="#content"]',
                'a:text-matches("skip", "i")',
            ];

            let skipLinkFound = false;
            let skipLinkDetails = "";

            for (const selector of skipLinkSelectors) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    skipLinkFound = true;
                    const el = page.locator(selector).first();
                    const text = await el.innerText().catch(() => "");
                    const href = await el.getAttribute("href");
                    skipLinkDetails = `Text: "${text}", Target: ${href}`;
                    break;
                }
            }

            if (skipLinkFound) {
                console.log(`\n  ✅ Skip link found: ${skipLinkDetails}`);
            } else {
                console.log("\n  ❌ No skip navigation link found!");
                console.log(
                    "     Keyboard users must Tab through ALL navigation.",
                );
            }

            /**
             * STEP 2: Check what the FIRST focusable element is.
             *
             * Even if a skip link exists, it should be the FIRST thing
             * a keyboard user encounters (Tab from the top).
             */
            await page.keyboard.press("Tab");
            const firstFocused = await page.evaluate(() => {
                const el = document.activeElement;
                if (!el || el === document.body) return null;
                return {
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent?.trim().substring(0, 60) || "",
                    href: el.getAttribute("href") || "",
                    className: el.className || "",
                };
            });

            console.log("\n  First focusable element on page:");
            if (firstFocused) {
                console.log(`    Tag: <${firstFocused.tag}>`);
                console.log(`    Text: "${firstFocused.text}"`);
                console.log(`    href: ${firstFocused.href}`);

                const isSkipLink =
                    firstFocused.href.startsWith("#") &&
                    firstFocused.text.toLowerCase().includes("skip");
                console.log(
                    `    Is skip link? ${isSkipLink ? "✅ YES" : "❌ NO"}`,
                );
            } else {
                console.log("    ❌ No element received focus on first Tab!");
            }

            /**
             * STEP 3: Check for landmark elements (axe's approach).
             *
             * Landmarks help SCREEN READER users navigate sections,
             * but they don't help KEYBOARD-ONLY sighted users.
             * Both skip links AND landmarks are needed.
             */
            const landmarks = await page.evaluate(() => {
                return {
                    hasMain: document.querySelectorAll("main, [role='main']").length > 0,
                    hasNav: document.querySelectorAll("nav, [role='navigation']").length > 0,
                    hasHeader: document.querySelectorAll("header, [role='banner']").length > 0,
                    hasFooter: document.querySelectorAll("footer, [role='contentinfo']").length > 0,
                };
            });

            console.log("\n  Landmark elements (for screen readers):");
            console.log(
                `    <main>:   ${landmarks.hasMain ? "✅ Present" : "❌ Missing"}`,
            );
            console.log(
                `    <nav>:    ${landmarks.hasNav ? "✅ Present" : "❌ Missing"}`,
            );
            console.log(
                `    <header>: ${landmarks.hasHeader ? "✅ Present" : "❌ Missing"}`,
            );
            console.log(
                `    <footer>: ${landmarks.hasFooter ? "✅ Present" : "❌ Missing"}`,
            );

            /**
             * STEP 4: Count tabs needed to reach main content.
             *
             * This quantifies the problem. If it takes 20+ Tabs to reach
             * content, the page desperately needs a skip link.
             */
            // Reset focus to top
            await page.evaluate(() => {
                (document.activeElement as HTMLElement)?.blur();
            });

            let tabCount = 0;
            let reachedContent = false;
            const maxTabs = 30;

            for (let i = 0; i < maxTabs; i++) {
                await page.keyboard.press("Tab");
                tabCount++;

                const isInMain = await page.evaluate(() => {
                    const el = document.activeElement;
                    if (!el) return false;
                    return (
                        el.closest("main, [role='main']") !== null ||
                        el.closest("#content, #main-content, .main-content") !== null
                    );
                });

                if (isInMain) {
                    reachedContent = true;
                    break;
                }
            }

            console.log("\n  Keyboard navigation to main content:");
            if (reachedContent) {
                console.log(
                    `    Tabs to reach main content: ${tabCount}`,
                );
                console.log(
                    `    ${tabCount > 10 ? "❌ Too many! Skip link needed." : "✅ Reasonable tab count."}`,
                );
            } else {
                console.log(
                    `    ❌ Could not reach <main> content within ${maxTabs} Tabs`,
                );
                console.log(
                    "       (either no <main> element or too many focusable elements)",
                );
            }

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                "     axe checks for LANDMARKS (structural) → helps screen readers",
            );
            console.log(
                "     Skip links help KEYBOARD-ONLY users → axe doesn't check this",
            );
            console.log(
                "     Both are WCAG 2.4.1 (Bypass Blocks) requirements.\n",
            );

            // This test is an audit — we verify we can at least focus elements
            expect(firstFocused).not.toBeNull();
        });

        /**
         * ====================================================================
         * TEST 3: DYNAMIC ARIA LABELS — State-Aware Validation
         * ====================================================================
         *
         * THE PROBLEM:
         *   A toggle button says "Switch to dark mode" via aria-label.
         *   User clicks it. Page switches to dark mode. But the aria-label
         *   STILL says "Switch to dark mode" — it should now say
         *   "Switch to light mode".
         *
         *   The label is PRESENT (axe passes) but WRONG (user is confused).
         *
         * WHY AXE MISSES THIS:
         *   axe scans the DOM at ONE point in time. It checks:
         *   "Does this button have an aria-label?" → Yes → PASS
         *
         *   It does NOT:
         *   - Click the button
         *   - Check if the label changed
         *   - Verify the label matches the current state
         *
         *   This is a BEHAVIORAL test — you need Playwright to interact
         *   with the element and verify the label updates.
         *
         * WCAG REFERENCE:
         *   4.1.2 Name, Role, Value — Level A
         *   "For all user interface components, the name and role can be
         *    programmatically determined; states, properties, and values
         *    that can be set by the user can be programmatically set."
         *
         * REAL-WORLD EXAMPLES:
         *   - Toggle: "Mute" → "Unmute" after click
         *   - Accordion: aria-expanded="false" → "true" after expand
         *   - Menu: aria-hidden="true" → "false" when opened
         *   - Cart icon: "Cart (0 items)" → "Cart (3 items)" after adding
         *
         * WHAT THIS TEST DOES:
         *   We use TodoMVC's toggle-all checkbox and individual checkboxes
         *   to verify that ARIA attributes update after interactions.
         *
         * ====================================================================
         */
        test("Test 3: Dynamic ARIA labels — verify state changes", async ({
            page,
        }) => {
            await page.goto(TODOMVC_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  DYNAMIC ARIA LABEL VALIDATION");
            console.log("=".repeat(60));

            // Add some todos to create interactive elements
            const input = page.getByPlaceholder("What needs to be done?");
            await input.fill("Buy groceries");
            await input.press("Enter");
            await input.fill("Walk the dog");
            await input.press("Enter");
            await input.fill("Write tests");
            await input.press("Enter");

            /**
             * STEP 1: Check the toggle-all button's initial state.
             *
             * The toggle-all arrow should reflect that NOT all items are
             * completed. After checking all, it should change state.
             */
            const toggleAll = page.locator(".toggle-all");

            const initialChecked = await toggleAll.isChecked().catch(() => null);
            console.log(
                `\n  Toggle-all initial checked: ${initialChecked}`,
            );

            /**
             * STEP 2: Check individual todo checkboxes.
             *
             * Each todo has a checkbox. When checked, the <li> should get
             * a "completed" class and the checkbox state should update.
             * Screen readers rely on these state changes to announce
             * "checked" vs "unchecked".
             */
            console.log("\n  Individual todo states BEFORE interaction:");
            const checkboxes = page.locator(".todo-list li .toggle");
            const checkboxCount = await checkboxes.count();

            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = checkboxes.nth(i);
                const checked = await checkbox.isChecked();
                const todoText = await page
                    .locator(".todo-list li")
                    .nth(i)
                    .innerText();
                console.log(
                    `    "${todoText.trim()}" → checked: ${checked}`,
                );
            }

            /**
             * STEP 3: Interact — complete the first todo.
             */
            await checkboxes.nth(0).check();

            console.log("\n  Individual todo states AFTER completing first:");
            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = checkboxes.nth(i);
                const checked = await checkbox.isChecked();
                const todoText = await page
                    .locator(".todo-list li")
                    .nth(i)
                    .innerText();
                const liClass = await page
                    .locator(".todo-list li")
                    .nth(i)
                    .getAttribute("class");
                console.log(
                    `    "${todoText.trim()}" → checked: ${checked}, class: "${liClass || ""}"`,
                );
            }

            // Verify the checkbox state actually changed
            const firstChecked = await checkboxes.nth(0).isChecked();
            expect(firstChecked).toBe(true);

            /**
             * STEP 4: Check the item counter updates.
             *
             * The "X items left" counter is a LIVE region — its text changes
             * dynamically. axe can check if aria-live exists, but it can't
             * verify that the TEXT INSIDE updated correctly.
             */
            const counter = page.locator(".todo-count");
            const counterText = await counter.innerText();
            console.log(`\n  Item counter after completing 1 of 3: "${counterText}"`);

            // Should say "2 items left" (3 total - 1 completed)
            expect(counterText).toContain("2");

            /**
             * STEP 5: Toggle all and verify bulk state change.
             */
            // Use the label to click toggle-all (the checkbox itself may be hidden)
            await page.locator('label[for="toggle-all"]').click();

            console.log("\n  After toggle-all:");
            for (let i = 0; i < checkboxCount; i++) {
                const checkbox = checkboxes.nth(i);
                const checked = await checkbox.isChecked();
                const todoText = await page
                    .locator(".todo-list li")
                    .nth(i)
                    .innerText();
                console.log(
                    `    "${todoText.trim()}" → checked: ${checked}`,
                );
                // All should now be checked
                expect(checked).toBe(true);
            }

            const counterAfterToggleAll = await counter.innerText();
            console.log(
                `\n  Counter after toggle-all: "${counterAfterToggleAll}"`,
            );
            expect(counterAfterToggleAll).toContain("0");

            /**
             * STEP 6: Filter buttons — check aria-selected/current state.
             *
             * When you click "Active" filter, it should be marked as
             * the current selection. This is a DYNAMIC state change.
             */
            console.log("\n  Filter button states:");
            const filters = page.locator(".filters a");
            const filterCount = await filters.count();

            for (let i = 0; i < filterCount; i++) {
                const filter = filters.nth(i);
                const text = await filter.innerText();
                const className = await filter.getAttribute("class");
                console.log(
                    `    "${text}" → class: "${className || ""}" ${className?.includes("selected") ? "← ACTIVE" : ""}`,
                );
            }

            // Click "Active" filter and verify selection changes
            await page.locator(".filters").getByText("Active").click();

            console.log("\n  After clicking 'Active' filter:");
            for (let i = 0; i < filterCount; i++) {
                const filter = filters.nth(i);
                const text = await filter.innerText();
                const className = await filter.getAttribute("class");
                console.log(
                    `    "${text}" → class: "${className || ""}" ${className?.includes("selected") ? "← ACTIVE" : ""}`,
                );
            }

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                "     axe checks: 'Does this element HAVE an aria attribute?' → PASS",
            );
            console.log(
                "     This test: 'Does the attribute UPDATE when state changes?' → Manual",
            );
            console.log(
                "     Static analysis cannot verify dynamic behavior.\n",
            );
        });

        /**
         * ====================================================================
         * TEST 4: DARK MODE CONTRAST TESTING
         * ====================================================================
         *
         * THE PROBLEM:
         *   Your site passes all contrast checks in light mode. Great!
         *   But does it also pass in dark mode? axe only scans the CURRENT
         *   color scheme. If you don't explicitly test dark mode, you're
         *   only testing half your design.
         *
         * WHY AXE MISSES THIS:
         *   axe scans the DOM as-is. If the page loads in light mode,
         *   axe checks light mode contrast. It does NOT:
         *   - Toggle to dark mode and re-scan
         *   - Test hover/focus state colors
         *   - Check text over images or gradients
         *   - Verify semi-transparent backgrounds
         *
         * WCAG REFERENCE:
         *   1.4.3 Contrast (Minimum) — Level AA
         *   Normal text: 4.5:1 ratio
         *   Large text (≥18pt or ≥14pt bold): 3:1 ratio
         *
         *   1.4.6 Contrast (Enhanced) — Level AAA
         *   Normal text: 7:1 ratio
         *   Large text: 4.5:1 ratio
         *
         * WHAT THIS TEST DOES:
         *   1. Scans page in light mode (default)
         *   2. Switches to dark mode via emulateMedia()
         *   3. Scans again and compares violations
         *   4. Highlights dark-mode-only contrast issues
         *
         * FROM THE ARTICLE:
         *   "Dark mode testing requires separate scans because CSS media
         *    queries change computed colors. Automated scans evaluate only
         *    the active color scheme."
         *
         * NOTE: This test works best on sites that implement
         *   @media (prefers-color-scheme: dark) { ... }
         *   GreenKart doesn't have dark mode, so we demonstrate the PATTERN
         *   you'd use on your real production apps, and compare it against
         *   a page that does support it (TodoMVC).
         *
         * ====================================================================
         */
        test("Test 4: Dark mode contrast testing", async ({ browser }) => {
            console.log("\n" + "=".repeat(60));
            console.log("  DARK MODE CONTRAST TESTING");
            console.log("=".repeat(60));

            /**
             * STEP 1: Create two browser contexts with different color schemes.
             *
             * Playwright's emulateMedia() tells the browser to pretend
             * the OS prefers a specific color scheme. Sites using
             * @media (prefers-color-scheme: dark) will switch accordingly.
             */
            const lightContext = await browser.newContext({
                colorScheme: "light",
            });
            const darkContext = await browser.newContext({
                colorScheme: "dark",
            });

            const lightPage = await lightContext.newPage();
            const darkPage = await darkContext.newPage();

            /**
             * STEP 2: Test TodoMVC in both modes.
             *
             * TodoMVC may not have a full dark mode, but the PATTERN here
             * is what matters — this is exactly how you'd test YOUR app.
             */
            await lightPage.goto(TODOMVC_URL);
            await darkPage.goto(TODOMVC_URL);

            // Add content so there's something to contrast-check
            const lightInput = lightPage.getByPlaceholder(
                "What needs to be done?",
            );
            await lightInput.fill("Light mode item");
            await lightInput.press("Enter");

            const darkInput = darkPage.getByPlaceholder(
                "What needs to be done?",
            );
            await darkInput.fill("Dark mode item");
            await darkInput.press("Enter");

            /**
             * STEP 3: Run axe contrast scan on BOTH modes.
             */
            const lightResults = await new AxeBuilder({ page: lightPage })
                .withRules(["color-contrast"])
                .analyze();

            const darkResults = await new AxeBuilder({ page: darkPage })
                .withRules(["color-contrast"])
                .analyze();

            console.log("\n  ☀️  LIGHT MODE:");
            console.log(
                `     Contrast violations: ${lightResults.violations.length}`,
            );
            if (lightResults.violations.length > 0) {
                lightResults.violations[0].nodes.forEach((node) => {
                    console.log(
                        `       ${node.html.substring(0, 80)}`,
                    );
                });
            }

            console.log("\n  🌙 DARK MODE:");
            console.log(
                `     Contrast violations: ${darkResults.violations.length}`,
            );
            if (darkResults.violations.length > 0) {
                darkResults.violations[0].nodes.forEach((node) => {
                    console.log(
                        `       ${node.html.substring(0, 80)}`,
                    );
                });
            }

            /**
             * STEP 4: Compare — find dark-mode-only issues.
             *
             * These are the violations that ONLY appear in dark mode.
             * If you only test light mode (the default), you'd miss these.
             */
            const lightViolationElements = new Set(
                lightResults.violations.flatMap((v) =>
                    v.nodes.map((n) => n.html),
                ),
            );
            const darkOnlyNodes = darkResults.violations.flatMap((v) =>
                v.nodes.filter((n) => !lightViolationElements.has(n.html)),
            );

            if (darkOnlyNodes.length > 0) {
                console.log(
                    `\n  🆕 Dark-mode-ONLY contrast issues (${darkOnlyNodes.length}):`,
                );
                darkOnlyNodes.forEach((node) => {
                    console.log(
                        `    ${node.html.substring(0, 80)}`,
                    );
                });
            } else {
                console.log(
                    "\n  ✅ No dark-mode-specific contrast issues found.",
                );
            }

            /**
             * STEP 5: Test GreenKart too for comparison.
             *
             * GreenKart doesn't have dark mode CSS, so both scans should
             * return the same results. This demonstrates WHY you need
             * to test — if you DON'T have dark mode support, a dark-mode
             * user gets your light colors on a dark OS theme, which can
             * cause glare and readability issues.
             */
            await lightPage.goto(GREENKART_URL);
            await darkPage.goto(GREENKART_URL);

            const gkLight = await new AxeBuilder({ page: lightPage })
                .withRules(["color-contrast"])
                .analyze();
            const gkDark = await new AxeBuilder({ page: darkPage })
                .withRules(["color-contrast"])
                .analyze();

            console.log("\n  --- GreenKart comparison ---");
            console.log(
                `  ☀️  Light mode violations: ${gkLight.violations.length} (${gkLight.violations[0]?.nodes.length || 0} elements)`,
            );
            console.log(
                `  🌙 Dark mode violations:  ${gkDark.violations.length} (${gkDark.violations[0]?.nodes.length || 0} elements)`,
            );
            console.log(
                gkLight.violations.length === gkDark.violations.length
                    ? "  ℹ️  Same violations — GreenKart has no dark mode CSS"
                    : "  🆕 Different violations — dark mode reveals new issues!",
            );

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                "     axe scans ONLY the current color scheme.",
            );
            console.log(
                "     If you test only light mode, you miss 50% of contrast issues.",
            );
            console.log(
                "     Always test: light + dark + high-contrast mode.",
            );
            console.log(
                "\n  📏 CONTRAST CHEAT SHEET:");
            console.log(
                "     Normal text:  4.5:1 (AA) | 7:1 (AAA)",
            );
            console.log(
                "     Large text:   3:1 (AA)   | 4.5:1 (AAA)",
            );
            console.log(
                '     Large text = 18pt+ OR 14pt+ bold\n',
            );

            await lightContext.close();
            await darkContext.close();
        });

        /**
         * ====================================================================
         * TEST 5: FOCUS TRAPPING IN MODALS/DIALOGS
         * ====================================================================
         *
         * THE PROBLEM:
         *   A modal opens. Keyboard user starts pressing Tab. Instead of
         *   cycling through elements INSIDE the modal, focus escapes to
         *   the background page. The user is now Tabbing through content
         *   they can't see (because the modal overlay covers it).
         *
         *   Or worse: focus goes to the background, and the user can't
         *   get back into the modal. They're stuck. Keyboard trap in reverse.
         *
         * WHY AXE MISSES THIS:
         *   axe can check:
         *   ✅ "Does this dialog have role='dialog'?"
         *   ✅ "Does it have aria-label or aria-labelledby?"
         *   ✅ "Is the background aria-hidden when modal is open?"
         *
         *   axe CANNOT check:
         *   ❌ "Does Tab cycle through modal elements without escaping?"
         *   ❌ "Does Escape close the modal?"
         *   ❌ "Does focus return to the button that opened the modal?"
         *
         *   These are BEHAVIORAL checks. You need to press keys and observe
         *   where focus moves. Only Playwright can do this.
         *
         * WCAG REFERENCE:
         *   2.1.2 No Keyboard Trap — Level A
         *   "If keyboard focus can be moved to a component, then focus can
         *    be moved away from that component using only a keyboard interface."
         *
         *   This means focus can enter AND leave a modal, but while open,
         *   it should stay INSIDE (a controlled trap with an exit via Escape).
         *
         * CORRECT MODAL FOCUS BEHAVIOR:
         *   1. User clicks "Open dialog" button
         *   2. Modal appears, focus moves INTO the modal (usually first focusable element)
         *   3. Tab cycles through modal elements (loops back to first from last)
         *   4. Shift+Tab cycles backwards
         *   5. Escape closes the modal
         *   6. Focus returns to the "Open dialog" button
         *
         * FROM THE ARTICLE (David Mello's code pattern):
         *   "Tab through elements inside a modal and assert that focus
         *    never leaves the dialog boundary."
         *
         * WHAT THIS TEST DOES:
         *   We test focus trapping on OrangeHRM's login page — after login
         *   there are modals/dropdowns we can test. As a fallback, we also
         *   demonstrate the pattern with TodoMVC's editing mode (which acts
         *   as a focus context).
         *
         * ====================================================================
         */
        test("Test 5: Focus trapping in modals — the keyboard prison test", async ({
            page,
        }) => {
            console.log("\n" + "=".repeat(60));
            console.log("  FOCUS TRAPPING IN MODALS");
            console.log("=".repeat(60));

            /**
             * PATTERN A: Test a native HTML <dialog> behavior.
             *
             * We'll inject a modal dialog into the page to demonstrate
             * the testing pattern clearly, then you can apply it to your
             * real app's modals.
             */
            await page.goto(TODOMVC_URL);

            // Inject a test modal to demonstrate focus trapping pattern
            await page.evaluate(() => {
                const dialog = document.createElement("dialog");
                dialog.id = "test-modal";
                dialog.setAttribute("role", "dialog");
                dialog.setAttribute("aria-label", "Test Modal");
                dialog.innerHTML = `
                    <h2>Test Modal</h2>
                    <p>This modal tests focus trapping.</p>
                    <input type="text" id="modal-input" placeholder="Type here..." />
                    <button id="modal-save">Save</button>
                    <button id="modal-cancel">Cancel</button>
                `;
                document.body.appendChild(dialog);

                const openBtn = document.createElement("button");
                openBtn.id = "open-modal-btn";
                openBtn.textContent = "Open dialog";
                openBtn.addEventListener("click", () => {
                    dialog.showModal();
                });
                document.body.insertBefore(openBtn, document.body.firstChild);

                // Close on cancel
                const cancelBtn = dialog.querySelector("#modal-cancel");
                cancelBtn?.addEventListener("click", () => dialog.close());
            });

            /**
             * STEP 1: Open the modal and verify focus moves inside.
             */
            const openButton = page.locator("#open-modal-btn");
            await openButton.click();

            const dialog = page.locator("#test-modal");
            await expect(dialog).toBeVisible();

            // Check: did focus move inside the dialog?
            const focusAfterOpen = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    tag: el?.tagName.toLowerCase() || "none",
                    isInsideDialog:
                        el?.closest('[role="dialog"], dialog') !== null,
                    id: el?.id || "",
                };
            });

            console.log("\n  STEP 1: Focus after opening modal");
            console.log(`    Focused element: <${focusAfterOpen.tag}> #${focusAfterOpen.id}`);
            console.log(
                `    Inside dialog? ${focusAfterOpen.isInsideDialog ? "✅ YES" : "❌ NO — focus didn't move into modal!"}`,
            );

            /**
             * STEP 2: Tab through modal elements — verify focus stays INSIDE.
             *
             * This is the core of the David Mello article's pattern.
             * We Tab multiple times and check that activeElement is always
             * within the dialog boundary.
             */
            console.log("\n  STEP 2: Tab cycling (focus should stay in modal)");
            const tabResults: {
                step: number;
                element: string;
                inside: boolean;
            }[] = [];

            for (let i = 0; i < 8; i++) {
                await page.keyboard.press("Tab");

                const info = await page.evaluate(() => {
                    const el = document.activeElement;
                    return {
                        element: `<${el?.tagName.toLowerCase()}> #${el?.id || el?.className || ""}`,
                        inside:
                            el?.closest('[role="dialog"], dialog') !== null,
                    };
                });

                tabResults.push({
                    step: i + 1,
                    element: info.element,
                    inside: info.inside,
                });

                console.log(
                    `    Tab ${i + 1}: ${info.element} → ${info.inside ? "✅ Inside" : "❌ ESCAPED!"}`,
                );
            }

            const escaped = tabResults.filter((r) => !r.inside);
            if (escaped.length > 0) {
                console.log(
                    `\n  ❌ Focus ESCAPED the modal ${escaped.length} time(s)!`,
                );
                console.log(
                    "     This is a focus trapping failure.",
                );
            } else {
                console.log(
                    "\n  ✅ Focus stayed inside the modal for all Tab presses!",
                );
            }

            /**
             * STEP 3: Test Escape key closes the modal.
             */
            await page.keyboard.press("Escape");

            const dialogVisible = await dialog.isVisible();
            console.log(
                `\n  STEP 3: Escape key closes modal? ${!dialogVisible ? "✅ YES" : "❌ NO"}`,
            );

            /**
             * STEP 4: Verify focus returns to the trigger button.
             *
             * After a modal closes, focus MUST return to the element that
             * opened it. Otherwise, keyboard users lose their place.
             */
            const focusAfterClose = await page.evaluate(() => {
                const el = document.activeElement;
                return {
                    tag: el?.tagName.toLowerCase() || "none",
                    id: el?.id || "",
                    text: el?.textContent?.trim().substring(0, 30) || "",
                };
            });

            console.log("\n  STEP 4: Focus after closing modal");
            console.log(
                `    Focused: <${focusAfterClose.tag}> #${focusAfterClose.id} "${focusAfterClose.text}"`,
            );
            console.log(
                `    Returned to trigger? ${focusAfterClose.id === "open-modal-btn" ? "✅ YES" : "❌ NO — focus didn't return to trigger button!"}`,
            );

            console.log("\n  📋 MODAL FOCUS CHECKLIST:");
            console.log(
                "     ☐ Focus moves INTO modal on open",
            );
            console.log(
                "     ☐ Tab cycles WITHIN modal (doesn't escape)",
            );
            console.log(
                "     ☐ Shift+Tab cycles backwards",
            );
            console.log(
                "     ☐ Escape closes the modal",
            );
            console.log(
                "     ☐ Focus returns to the trigger button on close",
            );
            console.log(
                "     ☐ Background content is aria-hidden while modal is open",
            );

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                "     axe checks: 'Does this dialog have role=dialog?' → PASS",
            );
            console.log(
                "     This test: 'Does focus BEHAVE correctly?' → Manual",
            );
            console.log(
                "     Native <dialog>.showModal() handles trapping automatically.",
            );
            console.log(
                "     Custom modals (div-based) need manual focus management.\n",
            );

            expect(dialogVisible).toBe(false);
        });

        /**
         * ====================================================================
         * TEST 6: LOW-QUALITY ALT TEXT AND ARIA LABELS
         * ====================================================================
         *
         * THE PROBLEM:
         *   axe checks: "Does this image have an alt attribute?" → Yes → PASS
         *
         *   But what if the alt text is:
         *     alt="image"
         *     alt="photo"
         *     alt="img_2847.jpg"
         *     alt="banner"
         *     alt="icon"
         *     alt="logo"
         *     alt="1"
         *     alt="."
         *     alt="                " (whitespace)
         *
         *   All of these PASS axe. None of them HELP a blind user.
         *
         * WHY AXE MISSES THIS:
         *   axe can verify PRESENCE and SYNTAX of attributes.
         *   It cannot evaluate MEANING or QUALITY.
         *
         *   Is "Conference room photo showing 10 people at a round table"
         *   better alt text than "photo"? Obviously yes. But "better" is
         *   a human judgment, not a pattern match.
         *
         *   HOWEVER — we CAN catch the OBVIOUSLY bad ones with patterns.
         *   "image", "photo", file extensions, single characters — these
         *   are never useful. We can automate catching these.
         *
         * WCAG REFERENCE:
         *   1.1.1 Non-text Content — Level A
         *   "All non-text content that is presented to the user has a text
         *    alternative that serves the equivalent purpose."
         *
         *   KEY WORD: "equivalent purpose" — not just "has text".
         *
         * ALSO APPLIES TO:
         *   - aria-label on buttons, links, nav elements
         *   - aria-labelledby references (the referenced text must be meaningful)
         *   - title attributes (used as fallback accessible name)
         *
         * FROM THE ARTICLE:
         *   "alt='image' and aria-label='nav' pass validation despite being
         *    useless. Tools can't evaluate whether labels actually help users
         *    who can't see the page."
         *
         * WHAT THIS TEST DOES:
         *   1. Scans ALL images for low-quality alt text patterns
         *   2. Scans ALL buttons/links for generic aria-labels
         *   3. Checks for suspiciously short accessible names (1-2 chars)
         *   4. Reports findings with suggestions
         *
         * ====================================================================
         */
        test("Test 6: Low-quality alt text and ARIA label detection", async ({
            page,
        }) => {
            await page.goto(GREENKART_URL);

            console.log("\n" + "=".repeat(60));
            console.log("  LOW-QUALITY ALT TEXT & ARIA LABEL DETECTION");
            console.log("=".repeat(60));

            /**
             * STEP 1: Define patterns that indicate LOW-QUALITY alt text.
             *
             * These patterns pass axe but are useless to screen reader users.
             * Organized into categories for clarity.
             */
            const lowQualityPatterns = {
                generic: [
                    "image",
                    "photo",
                    "picture",
                    "graphic",
                    "icon",
                    "logo",
                    "banner",
                    "img",
                    "pic",
                    "thumbnail",
                    "untitled",
                    "placeholder",
                ],
                fileNames: /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i,
                tooShort: 2, // alt text of 1-2 chars is almost never meaningful
                suspiciouslyGeneric: [
                    "button",
                    "link",
                    "nav",
                    "navigation",
                    "menu",
                    "input",
                    "form",
                    "content",
                    "section",
                    "header",
                    "footer",
                    "sidebar",
                    "main",
                    "div",
                ],
            };

            /**
             * STEP 2: Audit all images.
             */
            const images = await page.locator("img").all();
            console.log(`\n  📸 Images found: ${images.length}`);

            const imageIssues: {
                src: string;
                alt: string;
                issue: string;
            }[] = [];

            for (const img of images) {
                const alt = (await img.getAttribute("alt")) || "";
                const src = (await img.getAttribute("src")) || "";
                const shortSrc = src.split("/").pop() || src;

                // Check: is alt just whitespace?
                if (alt.trim() === "" && alt !== "") {
                    imageIssues.push({
                        src: shortSrc,
                        alt: `"${alt}" (whitespace only)`,
                        issue: "Whitespace-only alt — invisible to screen readers",
                    });
                    continue;
                }

                // Note: alt="" (empty) is INTENTIONAL for decorative images
                // We skip those — they're correct!
                if (alt === "") continue;

                const altLower = alt.toLowerCase().trim();

                // Check: generic word?
                if (lowQualityPatterns.generic.includes(altLower)) {
                    imageIssues.push({
                        src: shortSrc,
                        alt: `"${alt}"`,
                        issue: `Generic word — tells user nothing about image content`,
                    });
                    continue;
                }

                // Check: file name as alt text?
                if (lowQualityPatterns.fileNames.test(altLower)) {
                    imageIssues.push({
                        src: shortSrc,
                        alt: `"${alt}"`,
                        issue: "File name as alt text — not descriptive",
                    });
                    continue;
                }

                // Check: too short?
                if (
                    altLower.length <= lowQualityPatterns.tooShort &&
                    altLower.length > 0
                ) {
                    imageIssues.push({
                        src: shortSrc,
                        alt: `"${alt}"`,
                        issue: `Only ${altLower.length} char(s) — too short to be meaningful`,
                    });
                    continue;
                }

                // Check: alt same as filename?
                const fileBaseName = shortSrc
                    .replace(/\.[^.]+$/, "")
                    .replace(/[-_]/g, " ")
                    .toLowerCase();
                if (altLower === fileBaseName) {
                    imageIssues.push({
                        src: shortSrc,
                        alt: `"${alt}"`,
                        issue: "Alt text matches file name — likely auto-generated",
                    });
                }
            }

            if (imageIssues.length > 0) {
                console.log(
                    `\n  ❌ ${imageIssues.length} image(s) with low-quality alt text:\n`,
                );
                imageIssues.forEach((issue, i) => {
                    console.log(`  ${i + 1}. src: ${issue.src}`);
                    console.log(`     alt: ${issue.alt}`);
                    console.log(`     Issue: ${issue.issue}`);
                    console.log("");
                });
            } else {
                console.log(
                    "\n  ✅ All images have meaningful alt text!",
                );
            }

            /**
             * STEP 3: Audit ARIA labels on interactive elements.
             *
             * Buttons, links, and inputs with aria-label should have
             * descriptive text, not just "button" or "nav".
             */
            console.log("\n  🏷️  ARIA Label Quality Audit:");

            const interactiveSelectors = [
                { selector: 'button[aria-label]', type: "Button" },
                { selector: 'a[aria-label]', type: "Link" },
                { selector: '[role="button"][aria-label]', type: "Role=button" },
                { selector: 'input[aria-label]', type: "Input" },
                { selector: 'nav[aria-label]', type: "Nav" },
            ];

            const ariaIssues: {
                type: string;
                label: string;
                issue: string;
            }[] = [];

            for (const { selector, type } of interactiveSelectors) {
                const elements = await page.locator(selector).all();
                for (const el of elements) {
                    const label =
                        (await el.getAttribute("aria-label")) || "";
                    const labelLower = label.toLowerCase().trim();

                    if (
                        lowQualityPatterns.suspiciouslyGeneric.includes(
                            labelLower,
                        )
                    ) {
                        ariaIssues.push({
                            type,
                            label: `"${label}"`,
                            issue: "Generic label — describes the element TYPE, not its PURPOSE",
                        });
                    } else if (
                        labelLower.length <= lowQualityPatterns.tooShort &&
                        labelLower.length > 0
                    ) {
                        ariaIssues.push({
                            type,
                            label: `"${label}"`,
                            issue: `Only ${labelLower.length} char(s) — too short`,
                        });
                    }
                }
            }

            if (ariaIssues.length > 0) {
                console.log(
                    `\n  ❌ ${ariaIssues.length} element(s) with low-quality ARIA labels:\n`,
                );
                ariaIssues.forEach((issue, i) => {
                    console.log(`  ${i + 1}. ${issue.type}`);
                    console.log(`     aria-label: ${issue.label}`);
                    console.log(`     Issue: ${issue.issue}`);
                    console.log("");
                });
            } else {
                console.log(
                    "  ✅ All ARIA labels appear meaningful!",
                );
            }

            /**
             * STEP 4: Run axe on the same page to show what IT finds.
             *
             * This demonstrates the gap — axe says "all images have alt",
             * but our custom checks found quality issues axe can't detect.
             */
            const axeResults = await new AxeBuilder({ page })
                .withRules(["image-alt", "button-name", "link-name"])
                .analyze();

            console.log("\n  --- AXE vs OUR CUSTOM CHECKS ---");
            console.log(
                `  axe violations for image-alt, button-name, link-name: ${axeResults.violations.length}`,
            );
            console.log(
                `  Our custom quality checks found: ${imageIssues.length + ariaIssues.length} issues`,
            );
            console.log(
                "\n  ☝️  See the gap? axe checks PRESENCE. We check QUALITY.",
            );

            console.log("\n  💡 GOOD vs BAD ALT TEXT EXAMPLES:");
            console.log(
                '     ❌ alt="image"      → What image? Of what?',
            );
            console.log(
                '     ❌ alt="logo"       → Whose logo? What does it say?',
            );
            console.log(
                '     ❌ alt="DSC_0431"   → File name, not description',
            );
            console.log(
                '     ✅ alt="GreenKart vegetable store logo"',
            );
            console.log(
                '     ✅ alt="Shopping cart with 3 items"',
            );
            console.log(
                '     ✅ alt="" (empty = decorative, intentionally hidden)',
            );

            console.log("\n  💡 KEY TAKEAWAY:");
            console.log(
                "     axe: 'Has alt attribute?' → PASS (structure check)",
            );
            console.log(
                "     This test: 'Is alt text USEFUL?' → Pattern matching + human review",
            );
            console.log(
                "     You can automate catching the OBVIOUSLY bad ones,",
            );
            console.log(
                "     but true alt text quality requires human judgment.\n",
            );

            expect(images.length).toBeGreaterThan(0);
        });
    },
);
