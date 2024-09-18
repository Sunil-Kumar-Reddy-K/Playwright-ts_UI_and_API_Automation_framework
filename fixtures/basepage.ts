import { Homepage } from "../pages/homepage";
import { Cart } from "../pages/cart";

import { test as baseTest } from "@playwright/test";
const test = baseTest.extend<{
  homepage: Homepage;
  cart: Cart;
}>({
  homepage: async ({ page }, use) => {
    await use(new Homepage(page));
  },
  cart: async ({ page }, use) => {
    await use(new Cart(page));
  },
});
export default test;
export const expect = test.expect;
