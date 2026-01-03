// import { expect, test } from "@playwright/test";
// import { mailHelper } from "./mailHelper";

// test(
//     "User Registration with Email Verification",
//     { tag: "@emailSend" },
//     async ({ page }) => {
//         await page.goto("https://stage.riversidescore.com/forgot");

//         await page
//             .locator(
//                 "input[placeholder='Please enter your username or email address']",
//             )
//             .fill("emailAutomationTest");

//         await page.locator("button[aria-label='Send Email']").click();

//         await page
//             .locator("//span[@role='alert'][text()='Email Sent!']")
//             .isVisible();
//     },
// );

// test('Enter the verification code received in the email',{ tag: "@emailCheck" }, async ({page}) => {

//   // Fetch the email and extract the verification code
//   const emailHTML = await mailHelper.readEmail(page, 
//      "riversidescore@clinical.riverside-insights.com",
//      "ksunil.selenium+emailAutomationTest@gmail.com",
//      "Riverside Score - Password Reset"
//   );

//   const someBody = await mailHelper.getBodyText(emailHTML);

//   // Enter code and submit while waiting for the backend response
//  console.log(someBody);
// });
