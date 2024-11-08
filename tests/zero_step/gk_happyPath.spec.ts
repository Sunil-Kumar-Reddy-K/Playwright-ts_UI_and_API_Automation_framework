import test from '../../features/steps/basepage'

test('Place an order and complete payment', async ({ page, ai }) => {
    await page.goto('https://rahulshettyacademy.com/seleniumPractise/')
    await ai('search for "Brocolli"')
    await ai(
        'click on "ADD TO CART" button once Brocolli shows uo in the search results',
    )
    await ai('click on the cart icon')
    await ai('click on "PROCEED TO CHECKOUT" button')
    await page.waitForURL(/.*\/cart$/)
    await ai('click on "Place Order" button')
    await page.waitForURL(/.*\/country$/)
    await ai('select "India" from "Choose Country" dropdown')
    await ai('check the "Agree to the Terms & Conditions" check box')
    await ai('click on "Proceed" button')
})
