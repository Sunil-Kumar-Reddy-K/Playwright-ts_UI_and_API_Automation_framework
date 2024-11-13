import { Homepage } from "../../pages/homepage";
import { Cart } from "../../pages/cart";
import { RIVERSIDE_LoginPage } from "../../pages/riverside_page";
import { test as base, createBdd } from 'playwright-bdd';
import { aiFixture, type AiFixture } from '@zerostep/playwright';

const test = base.extend<{
  homepage: Homepage;
  cart: Cart;
  riverside: RIVERSIDE_LoginPage;
} & AiFixture>({
  homepage: async ({ page }, use) => {
    await use(new Homepage(page));
  },
  cart: async ({ page }, use) => {
    await use(new Cart(page));
  },
  riverside: async({page, context}, use) => {
    await use(new RIVERSIDE_LoginPage(page, context));
  },
  ...aiFixture(base), // Extend with AI fixture
});

// Integrate BDD functionality
export const { Given, When, Then } = createBdd(test);
export default test;
