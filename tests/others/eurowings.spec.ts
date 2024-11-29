import { test } from '@playwright/test';

test('test', async ({ browser }) => {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
      locale: 'en-GB',
      extraHTTPHeaders: {
        "sec-ch-ua": '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"'},
    javaScriptEnabled: true,
    bypassCSP: true, // Bypasses Content Security Policy
  });
  const page = await context.newPage();
  await page.goto('https://www.eurowings.com/en/information/at-the-airport/flight-status.html');
  await page.getByRole('button', { name: 'I understand' }).click();
  await page.getByRole('button', { name: 'Departure airport' }).click();
  await page.getByText('Birmingham • BHX').click();
  await page.getByRole('button', { name: 'Destination airport' }).click();
  await page.getByText('Agadir • AGA').click();
  await page.getByLabel('Departure date').click();
  await page.getByLabel('28. November').check();
  await page.getByRole('button', { name: 'Show flight status' }).click();
});