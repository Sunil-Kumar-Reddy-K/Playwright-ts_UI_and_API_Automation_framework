import { test, expect } from '@playwright/test';
import { GmailService } from '../../utils/gmailService';
import { EmailHelpers } from '../../utils/emailHelpers';

test.describe('Email Automation Tests', () => {
  let gmailService: GmailService;

  test.beforeAll(async () => {
    gmailService = new GmailService();
  });

  test(
    "User Registration with Email Verification - Complete Flow",
    { tag: "@emailSend" },
    async ({ page }) => {
      console.log('🚀 Starting password reset flow...');

      // Step 1: Trigger password reset
      await page.goto("https://stage.riversidescore.com/forgot");

      await page
        .locator("input[placeholder='Please enter your username or email address']")
        .fill("emailAutomationTest");

      await page.locator("button[aria-label='Send Email']").click();

      // Wait for success message
      await page
        .locator("//span[@role='alert'][text()='Email Sent!']")
        .isVisible();

      console.log('✅ Password reset email triggered successfully');

      // Step 2: Wait for and retrieve the password reset email
      console.log('🔍 Waiting for password reset email...');
      
      const resetEmail = await gmailService.waitForPasswordResetEmail(
        "riversidescore@clinical.riverside-insights.com",
        // "ksunil.selenium+emailAutomationTest@gmail.com",
        90000 // Wait up to 90 seconds
      );

      // Step 3: Verify email was received
      expect(resetEmail).toBeTruthy();
      expect(resetEmail?.subject).toBe("Riverside Score - Password Reset");
      // expect(resetEmail?.to).toContain("riversidescore@clinical.riverside-insights.com");

      console.log('✅ Password reset email received!');
      console.log('📧 Email Details:');
      console.log(`   Subject: ${resetEmail?.subject}`);
      console.log(`   From: ${resetEmail?.from}`);
      console.log(`   Date: ${resetEmail?.date}`);
      console.log(`   To: ${resetEmail?.to}`);

      // Step 4: Extract reset link from email
      if (resetEmail) {
        console.log('📝 Email Body (first 200 chars):');
        console.log(resetEmail.body.substring(0, 200) + '...');

        // Extract password reset link
        const resetLink = EmailHelpers.extractPasswordResetLink(resetEmail.body);
        console.log('🔗 Password Reset Link:', resetLink);

        // Extract any verification codes
        const verificationCode = EmailHelpers.extractVerificationCode(resetEmail.body);
        // if (verificationCode) {
        //   console.log('🔢 Verification Code:', verificationCode);
        // }

        // Extract all links for reference
        const allLinks = EmailHelpers.extractAllLinks(resetEmail.body);
        console.log('🔗 All Links Found:', allLinks);

        // Step 5: Use the reset link (optional)
        if (resetLink) {
          console.log('🌐 Navigating to reset link...');
          await page.goto(resetLink);
          
          // Add your password reset form automation here
          // await page.fill('input[type="password"]', 'newPassword123');
          // await page.click('button[type="submit"]');
        }

        // Step 6: Mark email as read (cleanup)
        await gmailService.markAsRead(resetEmail.id);
        console.log('✅ Email marked as read');

        await gmailService.deleteEmail(resetEmail.id);
        console.log('✅ Email deleted');
      }
    }
  );

  test('Debug: List recent emails', async () => {
    console.log('📧 Listing recent emails for debugging...');
    
    const emails = await gmailService.searchEmails({
      to: "riversidescore@clinical.riverside-insights.com",
      maxResults: 5
    });

    console.log(`Found ${emails.length} emails:`);
    emails.forEach((email, index) => {
      console.log(`${index + 1}. Subject: ${email.subject}`);
      console.log(`   From: ${email.from}`);
      console.log(`   Date: ${email.date}`);
      console.log(`   Read: ${email.isRead}`);
      console.log('---');
    });
  });
});