import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";

/**
 * ============================================================================
 * ACCESSIBILITY HELPER — Reusable A11Y Utility Class (POM Pattern)
 * ============================================================================
 *
 * This class follows the project's Page Object Model convention:
 *   - Constructor accepts Page (like Homepage, Cart, Hrmpage)
 *   - Private properties for internal configuration
 *   - Public async methods for all interactions
 *
 * NOTE: The @step() decorator from features/steps/basepage.ts uses
 *       playwright-bdd's test.step(). Since this helper is used in
 *       standard @playwright/test specs (not BDD), we use a simpler
 *       approach with descriptive method names that show up clearly
 *       in the Playwright trace viewer.
 *
 * USAGE:
 *   const a11y = new AccessibilityHelper(page);
 *   await a11y.assertNoCriticalViolations();
 *   await a11y.assertWcag21AA();
 *   const results = await a11y.scanFullPage();
 *
 * ============================================================================
 */

export type SeverityLevel = "critical" | "serious" | "moderate" | "minor";

export interface A11yHelperOptions {
    /** Default WCAG tags to use for scans (default: WCAG 2.1 AA) */
    tags?: string[];
    /** CSS selectors to always exclude from scans */
    excludeSelectors?: string[];
    /** Rules to always disable */
    disabledRules?: string[];
}

export class AccessibilityHelper {
    readonly page: Page;
    private readonly defaultTags: string[];
    private readonly excludeSelectors: string[];
    private readonly disabledRules: string[];

    constructor(page: Page, options?: A11yHelperOptions) {
        this.page = page;
        this.defaultTags = options?.tags ?? [
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
        ];
        this.excludeSelectors = options?.excludeSelectors ?? [];
        this.disabledRules = options?.disabledRules ?? [];
    }

    /**
     * Run a full accessibility scan on the current page.
     * Applies default excludes and disabled rules.
     */
    async scanFullPage(): Promise<AxeResults> {
        let builder = new AxeBuilder({ page: this.page });

        for (const selector of this.excludeSelectors) {
            builder = builder.exclude(selector);
        }

        if (this.disabledRules.length > 0) {
            builder = builder.disableRules(this.disabledRules);
        }

        return await builder.analyze();
    }

    /**
     * Scan a specific element/section of the page.
     */
    async scanElement(selector: string): Promise<AxeResults> {
        let builder = new AxeBuilder({ page: this.page }).include(selector);

        if (this.disabledRules.length > 0) {
            builder = builder.disableRules(this.disabledRules);
        }

        return await builder.analyze();
    }

    /**
     * Scan using the configured WCAG tags (default: WCAG 2.1 AA).
     */
    async scanWithTags(tags?: string[]): Promise<AxeResults> {
        const tagsToUse = tags ?? this.defaultTags;
        let builder = new AxeBuilder({ page: this.page }).withTags(tagsToUse);

        for (const selector of this.excludeSelectors) {
            builder = builder.exclude(selector);
        }

        if (this.disabledRules.length > 0) {
            builder = builder.disableRules(this.disabledRules);
        }

        return await builder.analyze();
    }

    /**
     * Assert that there are ZERO violations of any severity.
     * This is the strictest gate — use for new features.
     */
    async assertNoViolations(): Promise<void> {
        const { violations } = await this.scanFullPage();
        if (violations.length > 0) {
            this.logViolations(violations);
        }
        expect(
            violations,
            `Expected zero a11y violations but found ${violations.length}`,
        ).toHaveLength(0);
    }

    /**
     * Assert that there are no CRITICAL violations.
     * Allows serious/moderate/minor — useful as a minimum gate.
     */
    async assertNoCriticalViolations(): Promise<void> {
        const { violations } = await this.scanFullPage();
        const critical = violations.filter((v) => v.impact === "critical");
        if (critical.length > 0) {
            console.log("\n  🔴 CRITICAL VIOLATIONS FOUND:");
            this.logViolations(critical);
        }
        expect(
            critical,
            `Expected zero critical a11y violations but found ${critical.length}`,
        ).toHaveLength(0);
    }

    /**
     * Assert no violations at or above the specified severity level.
     * E.g., assertNoViolationsAtLevel("serious") fails on critical + serious.
     */
    async assertNoViolationsAtLevel(
        maxAllowedLevel: SeverityLevel,
    ): Promise<void> {
        const severityOrder: SeverityLevel[] = [
            "critical",
            "serious",
            "moderate",
            "minor",
        ];
        const threshold = severityOrder.indexOf(maxAllowedLevel);

        const { violations } = await this.scanFullPage();
        const failingViolations = violations.filter((v) => {
            const level = (v.impact ?? "minor") as SeverityLevel;
            return severityOrder.indexOf(level) <= threshold;
        });

        if (failingViolations.length > 0) {
            console.log(
                `\n  Violations at ${maxAllowedLevel} level or above:`,
            );
            this.logViolations(failingViolations);
        }

        expect(
            failingViolations,
            `Expected zero ${maxAllowedLevel}+ violations but found ${failingViolations.length}`,
        ).toHaveLength(0);
    }

    /**
     * Assert WCAG 2.1 AA compliance — the industry standard.
     */
    async assertWcag21AA(): Promise<void> {
        const { violations } = await this.scanWithTags([
            "wcag2a",
            "wcag2aa",
            "wcag21a",
            "wcag21aa",
        ]);
        if (violations.length > 0) {
            console.log("\n  WCAG 2.1 AA VIOLATIONS:");
            this.logViolations(violations);
        }
        expect(
            violations,
            `Expected WCAG 2.1 AA compliance but found ${violations.length} violations`,
        ).toHaveLength(0);
    }

    /**
     * Format and log violations to console in a readable format.
     * Reusable utility — call after any scan.
     */
    logViolations(violations: Result[]): void {
        if (violations.length === 0) {
            console.log("\n  ✅ No violations found!\n");
            return;
        }

        console.log(`\n  Found ${violations.length} violation(s):\n`);

        violations.forEach((v, i) => {
            const icon =
                v.impact === "critical"
                    ? "🔴"
                    : v.impact === "serious"
                      ? "🟠"
                      : v.impact === "moderate"
                        ? "🟡"
                        : "🔵";

            console.log(`  ${icon} ${i + 1}. ${v.id} [${v.impact}]`);
            console.log(`     ${v.help}`);
            console.log(`     Elements: ${v.nodes.length}`);
            console.log(`     Help: ${v.helpUrl}`);

            // Show first 3 elements max
            v.nodes.slice(0, 3).forEach((node) => {
                console.log(
                    `     → ${node.html.substring(0, 80)}`,
                );
            });
            if (v.nodes.length > 3) {
                console.log(
                    `     → ... and ${v.nodes.length - 3} more`,
                );
            }
        });
        console.log("");
    }

    /**
     * Get a summary object of violations grouped by severity.
     * Useful for reporting and threshold checks.
     */
    async getViolationSummary(): Promise<{
        total: number;
        critical: number;
        serious: number;
        moderate: number;
        minor: number;
        violations: Result[];
    }> {
        const { violations } = await this.scanFullPage();

        return {
            total: violations.length,
            critical: violations.filter((v) => v.impact === "critical").length,
            serious: violations.filter((v) => v.impact === "serious").length,
            moderate: violations.filter((v) => v.impact === "moderate").length,
            minor: violations.filter((v) => v.impact === "minor").length,
            violations,
        };
    }
}
