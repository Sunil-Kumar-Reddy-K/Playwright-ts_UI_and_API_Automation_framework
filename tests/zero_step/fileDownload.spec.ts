import test from '../../features/steps/basepage';

test('Upload sample.txt file', async ({ page, ai }) => {
    // Step 1: Navigate to the given URL
    await page.goto(
        'https://www.tutorialspoint.com/selenium/practice/upload-download.php',
    );

    // Step 2: Use AI function to interact with the "Choose File" button and upload the file
    await ai('click on the Download button');

    await ai('Save the downloaded file in the root directory');

    // Step 3: Optionally, wait for a confirmation that the file is displayed beside the "Choose File" button
    //   await ai('Wait for the file name "sample.txt" to be displayed beside the button');

    // Optional: Add a timeout to observe the result
    await page.waitForTimeout(30000); // Wait for 30 seconds (optional)
});
