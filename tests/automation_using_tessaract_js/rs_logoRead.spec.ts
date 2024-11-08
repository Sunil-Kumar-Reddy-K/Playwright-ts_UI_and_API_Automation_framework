import { expect } from '@playwright/test';
import test from '../../features/steps/basepage';
import Tesseract from 'tesseract.js';

test(
    `Capture logo text from Riverside insights website`,
    { tag: '@UI' },
    async ({ page }) => {
        await page.goto('https://riversidescore.com/')
        const rsMainLogo = page.locator('//div[@class="login-riverside-logo"]')
        await rsMainLogo.waitFor({ state: 'visible', timeout: 60000 })

        const logoScreenshot = await rsMainLogo.screenshot()

        // let imgText = await Tesseract.recognize(logoScreenshot);
        // console.log(imgText.data.text);

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

            console.log('Extracted Text:', text)
            expect(text).toContain('Riverside Score')
        } else {
            console.log('Logo not found.')
        }
    },
)
