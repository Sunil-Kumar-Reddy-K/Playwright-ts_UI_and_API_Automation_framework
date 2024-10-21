import test from '../../fixtures/basepage'

test.beforeEach(async ({ page }) => {
    await page.goto('/seleniumPractise/#')
})

const products = ['Beans', 'Cucumber']

test.describe.parallel('Add products to the cart and place order', () => {
    for (const product of products) {
        test(
            `Add ${product} to the cart and place order`,
            { tag: '@UI' },
            async ({ cart, homepage }) => {
                await homepage.searchVegetable(product)
                await homepage.clickAddToCartButton()
                await cart.clickOnCartIcon()
                await cart.clickOnProceedTOCheckOutButton()
                await cart.clickOnPlaceOrderButton()
                await cart.selectCountryFomDropDownAndProceed('India')
                await cart.assertForSuccessfulOrder()
            }
        )
    }
})
