import { Homepage } from "../../pages/homepage";
import { Cart } from "../../pages/cart";
import { test as base, createBdd } from 'playwright-bdd';
import { aiFixture, type AiFixture } from '@zerostep/playwright';

const test = base.extend<{
  homepage: Homepage;
  cart: Cart;
} & AiFixture>({
  homepage: async ({ page }, use) => {
    await use(new Homepage(page));
  },
  cart: async ({ page }, use) => {
    await use(new Cart(page));
  },
  ...aiFixture(base), // Extend with AI fixture
});

// Integrate BDD functionality
export const { Given, When, Then } = createBdd(test);
export default test;
export const expect = test.expect;
