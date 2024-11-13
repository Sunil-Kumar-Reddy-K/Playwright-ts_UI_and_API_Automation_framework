import test from '../../features/steps/basepage';
import { expect } from '@playwright/test';

/**
 * There are different types of mocking, like we can mock (API rsponse afcource)
 * either in text or json or few other stuff and then we can use it in our tests
 *
 * And the structure of coding may very accordingly
 *
 * INSPIRATION from = https://www.youtube.com/watch?v=kvGszYAYQ6M
 */

test('Mock movie score for The Godfather', { tag: '@UI' }, async ({ page }) => {
    // Intercept the request for the specific movie
    await page.route(
        'https://wpmovies.dev/movies/the-godfather/',
        async (route) => {
            // Get the original response
            const response = await route.fetch();
            const originalBody = await response.text();

            // Modify the response body to change the score
            const modifiedBody = originalBody.replace('87%', '100%');

            // Fulfill the request with the modified response
            await route.fulfill({
                status: response.status(),
                headers: response.headers(),
                contentType: 'text/html; charset=UTF-8',
                body: modifiedBody,
            });
        },
    );

    // Navigate to the movie page
    await page.goto('https://wpmovies.dev/movies/the-godfather/');

    // Validate that the score is now 100%
    const scoreElement = page.locator('.wpmovies-score-inside-circle span');
    expect(await scoreElement.innerText()).toBe('100%');
});
