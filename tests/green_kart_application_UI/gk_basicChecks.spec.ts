import { expect } from '@playwright/test'
import test from '../../features/steps/basepage'

test.beforeEach(async ({ page }) => {
    await page.goto('/seleniumPractise/#')
})

test('has title', { tag: '@UI' }, async ({ page }) => {
    await expect(page).toHaveTitle(/GreenKart - veg and fruits kart/)
})

test('Search product', { tag: '@UI' }, async ({ homepage }) => {
    await homepage.searchVegetable('Brocolli')
})

test('New Page Handling', { tag: '@UI' }, async ({ page, homepage }) => {
    const [newPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', { name: 'Top Deals' }).click(),
    ])
    await newPage.waitForLoadState()
    await homepage.page.bringToFront()
    await homepage.searchVegetable('Brocolli')
    await homepage.searchIcon.click()
    await newPage.bringToFront()
})
