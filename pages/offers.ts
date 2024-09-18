import { Locator, Page } from "@playwright/test";

export class Cart {
  readonly page: Page;
  readonly promoCode: Locator;
  readonly apply: Locator;
  readonly placeOrder: Locator;

  constructor(page: Page) {
    this.page = page;
    this.promoCode = page.getByPlaceholder("Enter promo code");
    this.apply = page.getByRole("button", { name: "Apply" });
    this.placeOrder = page.getByRole("button", { name: "Place Order" });
  }
}