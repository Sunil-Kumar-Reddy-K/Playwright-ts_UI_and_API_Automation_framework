import { expect } from "@playwright/test";
import { decrypt } from "../../lib/cryptoUtils";
import { Given, When, Then } from "./basepage";
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

const decryptedUsername = decrypt(process.env.ENCRYPTED_USERNAME + "");
const decryptedPassword = decrypt(process.env.ENCRYPTED_PASSWORD + "");

Given("I go to riverside protal", async ({ riverside }) => {
    await riverside.navigateToRiverside();
});

When(
    "I will be logging in with username and password in enscripted format",
    async ({ riverside }) => {
        await riverside.inputUsername(decryptedUsername);
        await riverside.inputPassword(decryptedPassword);
        await riverside.clickSignInButton();
        await riverside.selectWJVTile();
    },
);

Then("I should see the dashboard page", async ({ page, riverside }) => {
    await riverside.validateTestAssignmentsHeading();
    await expect(page).toHaveTitle("Dashboard");
});

When("I will be clicking on Examinees header", async ({ riverside }) => {
    await riverside.clickOnExamineesHeader();
});

Then("I will be at the Examinee management page", async ({ riverside }) => {
    await riverside.expectPageToBeExamineeManagement();
});

When('I will be manupulating the dashboard welcome text as {string}', async ({riverside}, welcomeText: string) => {
    await riverside.changeTheHeaderTextTo(welcomeText);
});

Then('I will be asserting the updated {string}', async ({riverside}, text: string) => {
    await riverside.assertTheText(text);
});

Then('I will validate the Notification Center border style', async ({riverside}) => {
    await riverside.verifyNotificationCenterBorderStyle();
  });

Then('I will navigate to {string}', async ({riverside}, url: string) => {
    await riverside.navigateTo(url);
  });
