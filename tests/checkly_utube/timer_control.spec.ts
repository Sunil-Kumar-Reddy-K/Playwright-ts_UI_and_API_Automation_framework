import { test, Locator } from '@playwright/test';
import Tesseract from 'tesseract.js';

test('fast forward the timer', async ({ page }) => {
    await page.clock.install()
    await page.goto('https://www.online-stopwatch.com/online-digital-clock/')
    await page.waitForLoadState()
    const timerLocator = page
        .frameLocator('iframe[name="fullframe"]')
        .locator('#canvas')

    console.log('before timer', await getTextFromScreenShot(timerLocator)) //this wont log bcoz its not text

    await page.clock.fastForward(2 * 60 * 60 * 1000) // this works "AWESOME"

    await page.waitForLoadState('domcontentloaded')

    console.log('after timer', await getTextFromScreenShot(timerLocator))

    await page.pause()
})

async function getTextFromScreenShot(locator: Locator) {
    await locator.scrollIntoViewIfNeeded()
    await locator.waitFor({ state: 'visible', timeout: 60000 })
    const logoScreenshot = await locator.screenshot()

    if (logoScreenshot) {
        const {
            data: { text },
        } = await Tesseract.recognize(
            logoScreenshot,
            'eng',
            // {
            //   logger: info => console.log(info) // Optional: log progress
            // }
        )

        // console.log("Extracted Text:", text);
        return text
    } else {
        // console.log("Logo not found.");
        return 'Logo not found.'
    }
}
