import test from '../../features/steps/basepage'

test(
    'Register account with AI-generated data',
    { tag: '@UI' },
    async ({ page, ai }) => {
        test.slow()

        await page.goto('https://ecommerce-playground.lambdatest.io/')

        await ai('click on "My account"')

        await ai('Wait for "Login" link to appear')

        await ai('Enter the "E-Mail Address" as "tester1234@gmail.com"')

        await ai('Enter the "Password" as "Test@1234"')

        await ai('Click on "Login" button')

        await page.waitForLoadState()

        await ai('Click on "Address Book"')

        await ai('Wait for "Address Book Entries" heading to appear')

        await ai('click on "New Address" button')

        await page.waitForLoadState()

        await ai('Fill out the form with realistic data')

        // await ai('Select "Fife" from the "Region / State" drop down');

        // await ai('Scroll to the bottom of the page');

        // await ai('click on "Continue" Button');

        // await page.waitForLoadState();

        // await ai('Wait for "Your address has been successfully added" message to appear');

        await page.waitForTimeout(60000)
    },
)
