import { expect, Locator, Page } from "@playwright/test";

export class Cart {
  readonly page: Page;
  readonly promoCode: Locator;
  readonly apply: Locator;
  readonly placeOrder: Locator;
  readonly cartIcon: Locator;
  readonly proceedToCheckout: Locator;
  readonly termsAndCondition: Locator;
  readonly chooseCountryDropDown: Locator;
  readonly proceedButton: Locator;
  readonly orderSuccessfulTxt: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.promoCode = page.getByPlaceholder('Enter promo code');
    this.apply = page.getByRole('button', { name: 'Apply' });
    this.placeOrder = page.getByRole('button', { name: 'Place Order' });
    this.cartIcon = page.getByRole('link', { name: 'Cart' });
    this.proceedToCheckout = page.getByRole('button', { name: 'PROCEED TO CHECKOUT' });
    this.termsAndCondition = page.getByRole('checkbox');
    this.chooseCountryDropDown = page.getByRole('combobox');
    this.proceedButton = page.getByRole('button', { name: 'Proceed' });
    this.orderSuccessfulTxt = page.locator('//span[text()="Thank you, your order has been placed successfully "]');
  }

  async clickOnCartIcon(){
    await this.cartIcon.click();
  }

  async clickOnProceedTOCheckOutButton(){
    await this.proceedToCheckout.click();
  }

  async clickOnPlaceOrderButton(){
    await this.placeOrder.click();
  }

  async selectCountryFomDropDownAndProceed(countryName: string){
    await this.chooseCountryDropDown.selectOption(countryName);
    await this.termsAndCondition.check();
    await this.proceedButton.click();
  }

  async assertForSuccessfulOrder(){
    await expect(this.orderSuccessfulTxt).toBeVisible();
  }
  
}
