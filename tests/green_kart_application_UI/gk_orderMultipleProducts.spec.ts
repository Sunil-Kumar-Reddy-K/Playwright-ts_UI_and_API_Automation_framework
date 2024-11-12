import test from '../../features/steps/basepage'

test.beforeEach(async ({ page }) => {
    await page.goto('/seleniumPractise/#')
})

test(
    `Add multiple products to the cart and place order`,
    { tag: '@UI' },
    async ({ cart, homepage }) => {
        const products = ['Beetroot', 'Carrot', 'Tomato', 'Beans']
        for (const product of products) {
            await homepage.searchVegetable(product)
            await homepage.clickAddToCartButton()
        }
        await cart.clickOnCartIcon()
        await cart.clickOnProceedTOCheckOutButton()
        await cart.clickOnPlaceOrderButton()
        await cart.selectCountryFomDropDownAndProceed('India')
        await cart.assertForSuccessfulOrder()
    },
)
