import { decrypt } from "../../lib/cryptoUtils";
import { Given, When, Then } from "./basepage";
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

const decryptedUsername = decrypt(process.env.ENCRYPTED_USERNAME+"");
const decryptedPassword = decrypt(process.env.ENCRYPTED_PASSWORD+"");

Given('I go to riverside protal', async ({ riverside }) => { 
  await riverside.navigateToRiverside();
});   

When('I will be logging in with username and password in enscripted format', async ({ riverside }) => {
  await riverside.inputUsername(decryptedUsername);
  await riverside.inputPassword(decryptedPassword);
  await riverside.clickSignInButton();
  await riverside.selectWJVTile();
});

Then('I should see the dashboard page', async ({ riverside }) => {
 await riverside.validateTestAssignmentsHeading();
})