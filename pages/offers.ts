import { Locator, Page } from "@playwright/test";

export class Cart {
    readonly page: Page;
    private readonly promoCode: Locator;
    private readonly apply: Locator;
    private readonly placeOrder: Locator;

    constructor(page: Page) {
        this.page = page;
        this.promoCode = page.getByPlaceholder("Enter promo code");
        this.apply = page.getByRole("button", { name: "Apply" });
        this.placeOrder = page.getByRole("button", { name: "Place Order" });
    }
}
