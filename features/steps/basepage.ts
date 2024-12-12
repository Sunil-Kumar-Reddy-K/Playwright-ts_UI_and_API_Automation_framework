/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * @BDD_Documentation - https://vitalets.github.io/playwright-bdd/#/writing-steps/playwright-style
 */
// import { Page } from '@playwright/test';
import { Homepage } from "../../pages/homepage";
import { Cart } from "../../pages/cart";
import { RIVERSIDE_LoginPage } from "../../pages/riverside_page";
import { test as base, createBdd } from "playwright-bdd";
import { aiFixture, type AiFixture } from "@zerostep/playwright";
import { Hrmpage } from "../../pages/orangehrm.page";

const test = base.extend<
    {
        homepage: Homepage;
        cart: Cart;
        riverside: RIVERSIDE_LoginPage;
        hrmPage: Hrmpage;
    } & AiFixture
>({
    homepage: async ({ page }, use) => {
        await use(new Homepage(page));
    },
    cart: async ({ page }, use) => {
        await use(new Cart(page));
    },
    riverside: async ({ page, context }, use) => {
        await use(new RIVERSIDE_LoginPage(page, context));
    },
    hrmPage: async ({ page }, use) => {
        await page.goto("https://opensource-demo.orangehrmlive.com/");
        await page.fill('input[name="username"]', "Admin");
        await page.fill('input[name="password"]', "admin123");
        await page.click('button[type="submit"]');
        await page.waitForURL("**/dashboard/**");
        await use(new Hrmpage(page));
    },
    ...aiFixture(base), // Extend with AI fixture
});

export function step(stepName?: string) {
    return function decorator(
        target: Function,
        context: ClassMethodDecoratorContext,
    ) {
        return function replacementMethod(this: any, ...args: any) {
            const name =
                stepName ||
                `${this.constructor.name}.${context.name as string}`;
            return test.step(name, async () => {
                return await target.call(this, ...args);
            });
        };
    };
}

// Integrate BDD functionality
export const { Given, When, Then, Step, Before, After, BeforeAll, AfterAll } =
    createBdd(test);
export default test;
