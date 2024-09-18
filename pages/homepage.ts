import { expect, Locator, Page } from "@playwright/test";

export class Homepage {
  readonly page: Page;
  readonly searchInputBox: Locator;
  readonly searchIcon: Locator;
  readonly addToCart: Locator;
  readonly cart: Locator;
  readonly items: Locator;
  readonly price: Locator;
  readonly numberOfItemsOnCart: Locator;
  readonly proceedToCheckout: Locator;
  readonly numberOfProducts: Locator;  

  constructor(page: Page) {
    this.page = page;
    this.searchInputBox = page.getByPlaceholder(
      "Search for Vegetables and Fruits"
    );
    this.searchIcon = page.getByRole("banner").getByRole("button");
    this.addToCart = page.getByRole("button", { name: "ADD TO CART" });
    this.cart = page.getByRole("link", { name: "Cart" });
    this.items = page.getByRole("row", { name: "Items :" }).getByRole("strong");
    this.price = page.getByRole("row", { name: "Price :" }).getByRole("strong");
    this.numberOfItemsOnCart = page.getByRole("listitem").getByText("Nos.");
    this.proceedToCheckout = page.getByRole("button", {
      name: "PROCEED TO CHECKOUT",
    });
  }

  async searchVegetable(name: string) {
    await this.searchInputBox.fill(name);
    await this.searchIcon.click();
    await this.page.waitForLoadState();
    await expect(this.page.locator('.products h4.product-name')).toHaveCount(1);
    await expect(this.page.locator('.products h4.product-name').getByText(name)).toBeVisible();
  }

  async clickAddToCartButton(){
    await this.addToCart.click();
  }
  
}
