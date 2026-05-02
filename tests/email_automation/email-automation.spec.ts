// tests/email-automation.spec.ts - UPDATED with delete functionality
import { test, expect } from '@playwright/test';
import { GmailService } from '../../utils/gmailService';
import { EmailHelpers } from '../../utils/emailHelpers';

test.describe('Email Automation Tests', () => {
  let gmailService: GmailService;

  test.beforeAll(async () => {
    gmailService = new GmailService();
  });

  test(
    "User Registration with Email Verification + Delete - Complete Flow",
    { tag: "@emailSend" },
    async ({ page }) => {
      console.log('🚀 Starting password reset flow with email cleanup...');

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
      console.log(`   ID: ${resetEmail?.id}`);
      console.log(`   Subject: ${resetEmail?.subject}`);
      console.log(`   From: ${resetEmail?.from}`);
      console.log(`   Date: ${resetEmail?.date}`);

      // Step 4: Extract and use reset link
      if (resetEmail) {
        const resetLink = EmailHelpers.extractPasswordResetLink(resetEmail.body);
        console.log('🔗 Password Reset Link:', resetLink);

        if (resetLink) {
          console.log('🌐 Navigating to reset link...');
          await page.goto(resetLink);
          
          // Your password reset form automation here
          // await page.fill('input[type="password"]', 'newPassword123');
          // await page.click('button[type="submit"]');
        }

        // Step 5: Mark as read first
        console.log('📖 Marking email as read...');
        const markedAsRead = await gmailService.markAsRead(resetEmail.id);
        expect(markedAsRead).toBeTruthy();
        console.log('✅ Email marked as read');

        // Step 6: DELETE the email (NEW FUNCTIONALITY)
        console.log('🗑️  Attempting to delete the email...');
        const deleteResult = await gmailService.deleteEmail(resetEmail.id);
        
        // Verify deletion was successful
        expect(deleteResult).toBeTruthy();
        console.log('✅ Email successfully deleted!');

        // Step 7: Verify email is actually deleted
        console.log('🔍 Verifying email deletion...');
        try {
          await gmailService.getEmailById(resetEmail.id);
          console.log('❌ ERROR: Email still exists after deletion');
          expect(false).toBeTruthy(); // Force test failure
        } catch (error: any) {
          if (error.code === 404) {
            console.log('✅ Confirmed: Email no longer exists');
          } else {
            console.log('⚠️  Unexpected error verifying deletion:', error.message);
          }
        }
      }
    }
  );

  test('Test Delete Functionality - Cleanup Old Test Emails', async () => {
    console.log('🧹 Cleaning up old test emails...');

    // Search for old password reset emails
    const oldEmails = await gmailService.searchEmails({
      to: "riversidescore@clinical.riverside-insights.com",
      subject: "Riverside Score - Password Reset",
      maxResults: 10
    });

    console.log(`📧 Found ${oldEmails.length} password reset emails`);

    if (oldEmails.length === 0) {
      console.log('✅ No old emails to clean up');
      return;
    }

    // Delete each email individually with verification
    for (let i = 0; i < oldEmails.length; i++) {
      const email = oldEmails[i];
      console.log(`🗑️  Deleting email ${i + 1}/${oldEmails.length}: ${email.subject}`);
      
      const deleteResult = await gmailService.deleteEmail(email.id);
      expect(deleteResult).toBeTruthy();
      
      console.log(`   ✅ Deleted email ID: ${email.id}`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('✅ All old test emails cleaned up successfully!');
  });

  test('Test Bulk Delete Functionality', async () => {
    console.log('🔄 Testing bulk delete functionality...');

    // First, let's see what emails we have
    const allEmails = await gmailService.searchEmails({
      to: "riversidescore@clinical.riverside-insights.com",
      maxResults: 20
    });

    console.log(`📧 Total emails found: ${allEmails.length}`);

    if (allEmails.length > 5) {
      console.log('🗑️  Performing bulk delete on old emails...');
      
      const bulkResult = await gmailService.bulkDeleteEmails({
        to: "riversidescore@clinical.riverside-insights.com",
        olderThanDays: 1, // Delete emails older than 1 day
        maxToDelete: 5
      });

      console.log(`📊 Bulk delete results:`);
      console.log(`   ✅ Successfully deleted: ${bulkResult.deleted}`);
      console.log(`   ❌ Failed to delete: ${bulkResult.failed}`);

      expect(bulkResult.deleted).toBeGreaterThan(0);
    } else {
      console.log('ℹ️  Not enough emails for bulk delete test');
    }
  });

  test('Test Move to Trash vs Permanent Delete', async () => {
    console.log('🗑️  Testing trash vs permanent delete...');

    // Get a test email
    const emails = await gmailService.searchEmails({
      to: "riversidescore@clinical.riverside-insights.com",
      maxResults: 1
    });

    if (emails.length === 0) {
      console.log('ℹ️  No emails available for trash test');
      return;
    }

    const testEmail = emails[0];
    console.log(`📧 Testing with email: ${testEmail.subject}`);

    // Option 1: Move to trash (reversible)
    console.log('🗑️  Moving email to trash...');
    const trashResult = await gmailService.moveToTrash(testEmail.id);
    expect(trashResult).toBeTruthy();
    console.log('✅ Email moved to trash');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Option 2: Restore from trash
    console.log('♻️  Restoring email from trash...');
    const restoreResult = await gmailService.restoreFromTrash(testEmail.id);
    expect(restoreResult).toBeTruthy();
    console.log('✅ Email restored from trash');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Option 3: Permanent delete
    console.log('🗑️  Permanently deleting email...');
    const deleteResult = await gmailService.deleteEmail(testEmail.id);
    expect(deleteResult).toBeTruthy();
    console.log('✅ Email permanently deleted');
  });

  test('Debug: Test Gmail Connection and Permissions', async () => {
    console.log('🔧 Testing Gmail connection and permissions...');

    try {
      // Test 1: Basic read access
      console.log('📖 Testing read access...');
      const emails = await gmailService.getEmails('', 1);
      console.log(`✅ Read access working - found ${emails.length} emails`);

      if (emails.length > 0) {
        const testEmail = emails[0];
        console.log(`📧 Test email: ${testEmail.subject}`);

        // Test 2: Modify access (mark as read/unread)
        console.log('✏️  Testing modify access...');
        const markResult = await gmailService.markAsRead(testEmail.id);
        console.log(`✅ Modify access: ${markResult ? 'Working' : 'Failed'}`);

        // Test 3: Delete access
        console.log('🗑️  Testing delete permissions...');
        console.log('⚠️  NOTE: This will attempt to delete the email permanently');
        
        // Uncomment the next line only if you want to test actual deletion
        // const deleteResult = await gmailService.deleteEmail(testEmail.id);
        // console.log(`Delete access: ${deleteResult ? 'Working' : 'Failed'}`);
        
        console.log('ℹ️  Delete test skipped to preserve emails');
      }

    } catch (error: any) {
      console.error('❌ Connection/Permission test failed:', error.message);
      
      if (error.code === 403) {
        console.error('🔒 SOLUTION: Regenerate your OAuth token with updated scopes');
      } else if (error.code === 401) {
        console.error('🔑 SOLUTION: Your authentication token may be expired');
      }
    }
  });
});