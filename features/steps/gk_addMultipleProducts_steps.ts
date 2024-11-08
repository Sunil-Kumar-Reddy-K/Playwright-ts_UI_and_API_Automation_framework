import { Given, When } from "./basepage";

Given('I open url {string}', async ({ page }, url: string) => {
  await page.goto(url);
});

When('I will be searching for the {string} and adding to the cart', async ({ homepage }, item: string) => {
  await homepage.searchVegetable(item);
  await homepage.clickAddToCartButton();
});
