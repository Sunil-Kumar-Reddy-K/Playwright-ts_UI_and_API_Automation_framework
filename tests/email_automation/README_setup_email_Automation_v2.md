# Gmail Email Automation Setup Guide

## Step 1: Install Required Dependencies

```bash
npm install googleapis google-auth-library
npm install --save-dev @types/google-auth-library (Dosent work, throws error)
```

## Step 2: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Go to "APIs & Services" select the 3 bars on the left top → select APIs and services → find "ENable API's and services"
   - Search for "Gmail API" and enable it
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Fill in details and create
   - Download the JSON key file
5. Alternative: OAuth 2.0 for user consent (recommended for testing)
6. READ DOWN below for more detailed explanation

## Step 3: Environment Setup

Create `.env` file in your project root:

```env
# For Service Account
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./path/to/service-account-key.json
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# For OAuth (Alternative)
GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Test Email
TEST_EMAIL=ksunil.selenium@gmail.com
```

## Step 4: Gmail Service Class

```typescript
// utils/gmailService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  date: Date;
  isRead: boolean;
}

export class GmailService {
  private gmail: any;
  private auth: OAuth2Client;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Option 1: Service Account (for automation)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      const serviceAccountKey = JSON.parse(
        fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, 'utf8')
      );
      
      this.auth = new google.auth.JWT(
        serviceAccountKey.client_email,
        undefined,
        serviceAccountKey.private_key,
        ['https://www.googleapis.com/auth/gmail.readonly', 
         'https://www.googleapis.com/auth/gmail.modify']
      );
    } 
    // Option 2: OAuth2 (for user access)
    else {
      this.auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      
      this.auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Get list of emails with optional query
   */
  async getEmails(query: string = '', maxResults: number = 10): Promise<EmailMessage[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      const messages = response.data.messages || [];
      const emailPromises = messages.map((msg: any) => this.getEmailById(msg.id));
      
      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error getting emails:', error);
      throw error;
    }
  }

  /**
   * Get specific email by ID
   */
  async getEmailById(messageId: string): Promise<EmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;
      
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      const body = this.extractEmailBody(message.payload);

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        body: body,
        date: new Date(parseInt(message.internalDate)),
        isRead: !message.labelIds?.includes('UNREAD')
      };
    } catch (error) {
      console.error('Error getting email by ID:', error);
      throw error;
    }
  }

  /**
   * Extract email body from payload
   */
  private extractEmailBody(payload: any): string {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
          // If no plain text, use HTML
          if (!body) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }
    }

    return body;
  }

  /**
   * Search emails by criteria
   */
  async searchEmails(criteria: {
    from?: string;
    to?: string;
    subject?: string;
    after?: string; // YYYY/MM/DD format
    before?: string; // YYYY/MM/DD format
    isUnread?: boolean;
    hasAttachment?: boolean;
  }): Promise<EmailMessage[]> {
    let query = '';
    
    if (criteria.from) query += `from:${criteria.from} `;
    if (criteria.to) query += `to:${criteria.to} `;
    if (criteria.subject) query += `subject:"${criteria.subject}" `;
    if (criteria.after) query += `after:${criteria.after} `;
    if (criteria.before) query += `before:${criteria.before} `;
    if (criteria.isUnread) query += 'is:unread ';
    if (criteria.hasAttachment) query += 'has:attachment ';

    return await this.getEmails(query.trim());
  }

  /**
   * Delete email by ID
   */
  async deleteEmail(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId
      });
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      return false;
    }
  }

  /**
   * Mark email as unread
   */
  async markAsUnread(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as unread:', error);
      return false;
    }
  }

  /**
   * Wait for email with specific criteria (useful for testing)
   */
  async waitForEmail(
    criteria: {
      from?: string;
      to?: string;
      subject?: string;
      bodyContains?: string;
    },
    timeoutMs: number = 30000,
    pollIntervalMs: number = 2000
  ): Promise<EmailMessage | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const emails = await this.searchEmails({
        ...criteria,
        after: new Date(startTime).toISOString().split('T')[0].replace(/-/g, '/')
      });

      for (const email of emails) {
        if (criteria.bodyContains && !email.body.includes(criteria.bodyContains)) {
          continue;
        }
        return email;
      }

      await this.sleep(pollIntervalMs);
    }

    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Step 5: Playwright Test Integration

```typescript
// tests/email-automation.spec.ts
import { test, expect } from '@playwright/test';
import { GmailService } from '../utils/gmailService';

test.describe('Email Automation Tests', () => {
  let gmailService: GmailService;

  test.beforeAll(async () => {
    gmailService = new GmailService();
  });

  test('should read latest emails', async () => {
    const emails = await gmailService.getEmails('', 5);
    
    console.log(`Found ${emails.length} emails`);
    
    for (const email of emails) {
      console.log(`Subject: ${email.subject}`);
      console.log(`From: ${email.from}`);
      console.log(`Date: ${email.date}`);
      console.log('---');
    }

    expect(emails).toBeDefined();
  });

  test('should search for specific emails', async () => {
    const emails = await gmailService.searchEmails({
      to: 'ksunil.selenium@gmail.com',
      isUnread: true
    });

    console.log(`Found ${emails.length} unread emails`);
    expect(emails).toBeDefined();
  });

  test('should wait for verification email after signup', async () => {
    // Simulate user signup process here
    // ... your signup automation code ...

    // Wait for verification email
    const verificationEmail = await gmailService.waitForEmail({
      to: 'ksunil.selenium@gmail.com',
      subject: 'Verify your email',
      bodyContains: 'verification'
    }, 60000); // Wait up to 1 minute

    expect(verificationEmail).toBeTruthy();
    
    if (verificationEmail) {
      console.log('Verification email received:', verificationEmail.subject);
      
      // Extract verification link from email body
      const verificationLinkMatch = verificationEmail.body.match(/https?:\/\/[^\s]+verify[^\s]*/i);
      
      if (verificationLinkMatch) {
        const verificationLink = verificationLinkMatch[0];
        console.log('Verification link:', verificationLink);
        
        // Navigate to verification link
        // await page.goto(verificationLink);
      }

      // Mark email as read
      await gmailService.markAsRead(verificationEmail.id);
    }
  });

  test('should delete test emails', async () => {
    const testEmails = await gmailService.searchEmails({
      subject: 'Test Email - Safe to Delete'
    });

    for (const email of testEmails) {
      const deleted = await gmailService.deleteEmail(email.id);
      expect(deleted).toBeTruthy();
    }
  });
});
```

## Step 6: Helper Functions

```typescript
// utils/emailHelpers.ts
export class EmailHelpers {
  /**
   * Extract verification code from email body
   */
  static extractVerificationCode(emailBody: string): string | null {
    // Common patterns for verification codes
    const patterns = [
      /verification code[:\s]*([A-Z0-9]{4,8})/i,
      /your code[:\s]*([A-Z0-9]{4,8})/i,
      /([0-9]{4,6})/g // Simple numeric codes
    ];

    for (const pattern of patterns) {
      const match = emailBody.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  /**
   * Extract links from email body
   */
  static extractLinks(emailBody: string): string[] {
    const linkPattern = /https?:\/\/[^\s<>"']+/gi;
    return emailBody.match(linkPattern) || [];
  }

  /**
   * Clean HTML from email body
   */
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}
```

## Next Steps:

1. **Install dependencies**: Run the npm install command
2. **Setup Google Cloud**: Follow the Google Cloud Console setup
3. **Configure OAuth**: You'll need to generate refresh token for your Gmail account
4. **Test connection**: Start with a simple email reading test
5. **Integrate with your tests**: Use the email automation in your existing Playwright tests

Would you like me to help you with any specific step, such as OAuth setup or creating specific test scenarios?

===================================================================

# Step-by-Step OAuth2 Setup Guide

## Step 1: Google Cloud Console Setup (Detailed)

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on project dropdown (top left)
3. Click "NEW PROJECT" 
4. Name: "Gmail Automation Project" (or any name)
5. Click "CREATE"

### 1.2 Enable Gmail API
1. In the search bar, type "Gmail API"
2. Click on "Gmail API" from results
3. Click "ENABLE" button
4. Wait for API to be enabled

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have Google Workspace)
3. Click "CREATE"
4. Fill required fields:
   - App name: "Gmail Automation Test"
   - User support email: your email
   - Developer contact: your email
5. Click "SAVE AND CONTINUE"
6. Click "SAVE AND CONTINUE" (no scopes needed for now)
7. Add your email as test user in "Test users" section
8. Click "SAVE AND CONTINUE"

### 1.4 Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Desktop application"
4. Name: "Gmail Automation Client"
5. Click "CREATE"
6. **IMPORTANT**: Copy and save:
   - Client ID
   - Client Secret
7. Click "OK"

## Step 2: Generate Refresh Token

Create a one-time script to generate refresh token:

```typescript
// scripts/generateRefreshToken.ts
import { google } from 'googleapis';
import * as readline from 'readline';

const CLIENT_ID = 'your-client-id-here.googleusercontent.com';
const CLIENT_SECRET = 'your-client-secret-here';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

async function generateRefreshToken() {
  // Generate the auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  console.log('1. Open this URL in your browser:');
  console.log(authUrl);
  console.log('\n2. Complete the authorization');
  console.log('3. Copy the authorization code and paste it below:');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('\n✅ Success! Here are your tokens:');
      console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID);
      console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET);
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('\nAdd these to your .env file');
    } catch (error) {
      console.error('Error getting tokens:', error);
    }
    rl.close();
  });
}

generateRefreshToken();
```

## Step 3: Run the Token Generation Script

```bash
# Add to package.json scripts section:
"generate-token": "npx ts-node scripts/generateRefreshToken.ts"

# Run the script:
npm run generate-token
```

## Step 4: Updated Environment Configuration

```env
# .env file
GOOGLE_CLIENT_ID=your-client-id-here.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=your-refresh-token-here

# Test Email
TEST_EMAIL=ksunil.selenium@gmail.com
```

## Step 5: Updated Gmail Service (Fixed JWT + OAuth2)

```typescript
// utils/gmailService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import { config } from 'dotenv';

config(); // Load environment variables

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  htmlBody?: string;
  date: Date;
  isRead: boolean;
}

export class GmailService {
  private gmail: any;
  private auth: OAuth2Client;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Option 1: Service Account (your fixed version)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      const serviceAccountKey = JSON.parse(
        fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, 'utf8')
      );
      
      this.auth = new google.auth.JWT({
        key: serviceAccountKey.private_key,
        email: serviceAccountKey.client_email,
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly', 
          'https://www.googleapis.com/auth/gmail.modify'
        ]
      });
    } 
    // Option 2: OAuth2 (recommended for testing)
    else {
      this.auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      
      this.auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Extract email body from payload - Enhanced version
   */
  private extractEmailBody(payload: any): { text: string; html: string } {
    let textBody = '';
    let htmlBody = '';

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          textBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          htmlBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          extractFromParts(part.parts);
        }
      }
    };

    if (payload.body?.data) {
      const content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      if (payload.mimeType === 'text/html') {
        htmlBody = content;
      } else {
        textBody = content;
      }
    } else if (payload.parts) {
      extractFromParts(payload.parts);
    }

    return { text: textBody, html: htmlBody };
  }

  /**
   * Get specific email by ID - Enhanced version
   */
  async getEmailById(messageId: string): Promise<EmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;
      
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      const bodyContent = this.extractEmailBody(message.payload);

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        body: bodyContent.text || bodyContent.html,
        htmlBody: bodyContent.html,
        date: new Date(parseInt(message.internalDate)),
        isRead: !message.labelIds?.includes('UNREAD')
      };
    } catch (error) {
      console.error('Error getting email by ID:', error);
      throw error;
    }
  }

  /**
   * Search emails by criteria - Enhanced for your use case
   */
  async searchEmails(criteria: {
    from?: string;
    to?: string;
    subject?: string;
    after?: string;
    before?: string;
    isUnread?: boolean;
    hasAttachment?: boolean;
    maxResults?: number;
  }): Promise<EmailMessage[]> {
    let query = '';
    
    if (criteria.from) query += `from:${criteria.from} `;
    if (criteria.to) query += `to:${criteria.to} `;
    if (criteria.subject) query += `subject:"${criteria.subject}" `;
    if (criteria.after) query += `after:${criteria.after} `;
    if (criteria.before) query += `before:${criteria.before} `;
    if (criteria.isUnread) query += 'is:unread ';
    if (criteria.hasAttachment) query += 'has:attachment ';

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query.trim(),
        maxResults: criteria.maxResults || 10
      });

      const messages = response.data.messages || [];
      const emailPromises = messages.map((msg: any) => this.getEmailById(msg.id));
      
      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  /**
   * Wait for email with specific criteria - Enhanced for your reset email
   */
  async waitForPasswordResetEmail(
    recipientEmail: string,
    timeoutMs: number = 60000,
    pollIntervalMs: number = 3000
  ): Promise<EmailMessage | null> {
    const startTime = Date.now();
    const afterDate = new Date(startTime - 60000).toISOString().split('T')[0].replace(/-/g, '/');

    console.log(`🔍 Waiting for password reset email to: ${recipientEmail}`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const emails = await this.searchEmails({
          to: recipientEmail,
          subject: "Riverside Score - Password Reset",
          after: afterDate,
          maxResults: 5
        });

        if (emails.length > 0) {
          console.log(`✅ Found ${emails.length} password reset email(s)`);
          return emails[0]; // Return the most recent one
        }

        console.log(`⏳ No password reset email found yet, waiting ${pollIntervalMs}ms...`);
        await this.sleep(pollIntervalMs);
      } catch (error) {
        console.error('Error while waiting for email:', error);
        await this.sleep(pollIntervalMs);
      }
    }

    console.log('❌ Timeout: No password reset email received');
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Keep other methods from previous version...
  async getEmails(query: string = '', maxResults: number = 10): Promise<EmailMessage[]> {
    return this.searchEmails({ maxResults });
  }

  async deleteEmail(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId
      });
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      return false;
    }
  }
}
```

## Step 6: Enhanced Email Helpers for Password Reset

```typescript
// utils/emailHelpers.ts
export class EmailHelpers {
  /**
   * Extract password reset link from email
   */
  static extractPasswordResetLink(emailBody: string): string | null {
    // Common patterns for password reset links
    const patterns = [
      /https?:\/\/[^\s<>"']*reset[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*password[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*token[^\s<>"']*/gi,
      /https?:\/\/[^\s<>"']*verify[^\s<>"']*/gi,
    ];

    for (const pattern of patterns) {
      const matches = emailBody.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/['"<>]$/, ''); // Clean trailing characters
      }
    }

    return null;
  }

  /**
   * Extract verification code/token from email
   */
  static extractVerificationCode(emailBody: string): string | null {
    const patterns = [
      /reset code[:\s]*([A-Z0-9]{4,8})/i,
      /verification code[:\s]*([A-Z0-9]{4,8})/i,
      /your code[:\s]*([A-Z0-9]{4,8})/i,
      /token[:\s]*([A-Z0-9]{6,32})/i,
      /([0-9]{4,8})/g
    ];

    for (const pattern of patterns) {
      const match = emailBody.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  /**
   * Clean HTML and extract readable text
   */
  static extractTextFromHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract all links from email
   */
  static extractAllLinks(emailBody: string): string[] {
    const linkPattern = /https?:\/\/[^\s<>"']+/gi;
    const matches = emailBody.match(linkPattern) || [];
    return matches.map(link => link.replace(/['"<>]$/, ''));
  }
}
```

## Step 7: Your Updated Test with Email Verification

```typescript
// tests/email-automation.spec.ts
import { test, expect } from '@playwright/test';
import { GmailService } from '../utils/gmailService';
import { EmailHelpers } from '../utils/emailHelpers';

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
        90000 // Wait up to 90 seconds
      );

      // Step 3: Verify email was received
      expect(resetEmail).toBeTruthy();
      expect(resetEmail?.subject).toBe("Riverside Score - Password Reset");
      expect(resetEmail?.to).toContain("riversidescore@clinical.riverside-insights.com");

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
        if (verificationCode) {
          console.log('🔢 Verification Code:', verificationCode);
        }

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
```

## Step 8: Running Instructions

```bash
# 1. Install dependencies
npm install googleapis google-auth-library

# 2. Generate refresh token
npm run generate-token

# 3. Update your .env file with the tokens

# 4. Run your specific test
npx playwright test --grep "@emailSend"

# 5. Run debug test to see recent emails
npx playwright test --grep "Debug: List recent emails"
```

## Step 9: Troubleshooting Checklist

```typescript
// utils/testGmailConnection.ts
import { GmailService } from './gmailService';

async function testConnection() {
  try {
    console.log('🔧 Testing Gmail connection...');
    const gmail = new GmailService();
    
    const emails = await gmail.getEmails('', 1);
    console.log('✅ Connection successful!');
    console.log(`Latest email: ${emails[0]?.subject}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

## Next Steps:

1. **Generate OAuth2 tokens** using the script above
2. **Test connection** with the test script
3. **Run your email test** and check the console logs
4. **Customize email parsing** based on the actual email format you receive

The key advantage of this setup is that it will automatically wait for the password reset email, extract the reset link, and provide detailed logging throughout the process.

Would you like me to help you with any specific step or modify anything based on your actual email format?

# TIP ! : Replace the Placeholder Values
Open your tests/email_automation/generateRefreshToken.ts file and replace:
typescript// CHANGE FROM:
const CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE.apps.googleusercontent.com';
const CLIENT_SECRET = 'YOUR_ACTUAL_CLIENT_SECRET_HERE';

// CHANGE TO: (with your actual values)
const CLIENT_ID = '123456789-your-actual-client-id.apps.googleusercontent.com';
const CLIENT_SECRET = 'GOCSPX-your-actual-client-secret';

# NOTE! : Important - Update OAuth Settings
You might also need to add your email as a test user:

In Google Cloud Console, go to "APIs & Services" → "OAuth consent screen"
Scroll down to "Test users" section
Click "ADD USERS"
Add your email: ksunil.selenium@gmail.com
Click "SAVE"

========================== REQUEST FOR DELETE ACCESS ====================================================

```typescript

// utils/gmailService.ts - UPDATED with correct delete permissions
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import { config } from 'dotenv';

config(); // Load environment variables

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  htmlBody?: string;
  date: Date;
  isRead: boolean;
}

export class GmailService {
  private gmail: any;
  private auth: OAuth2Client;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Option 1: Service Account (updated scopes)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      const serviceAccountKey = JSON.parse(
        fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, 'utf8')
      );
      
      this.auth = new google.auth.JWT({
        key: serviceAccountKey.private_key,
        email: serviceAccountKey.client_email,
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.compose',
          'https://www.googleapis.com/auth/gmail.send'
        ]
      });
    } 
    // Option 2: OAuth2 (updated for full Gmail access)
    else {
      this.auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
      );
      
      this.auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Get list of emails with optional query
   */
  async getEmails(query: string = '', maxResults: number = 10): Promise<EmailMessage[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      const messages = response.data.messages || [];
      const emailPromises = messages.map((msg: any) => this.getEmailById(msg.id));
      
      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error getting emails:', error);
      throw error;
    }
  }

  /**
   * Get specific email by ID
   */
  async getEmailById(messageId: string): Promise<EmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;
      
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header ? header.value : '';
      };

      const bodyContent = this.extractEmailBody(message.payload);

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        body: bodyContent.text || bodyContent.html,
        htmlBody: bodyContent.html,
        date: new Date(parseInt(message.internalDate)),
        isRead: !message.labelIds?.includes('UNREAD')
      };
    } catch (error) {
      console.error('Error getting email by ID:', error);
      throw error;
    }
  }

  /**
   * Extract email body from payload - Enhanced version
   */
  private extractEmailBody(payload: any): { text: string; html: string } {
    let textBody = '';
    let htmlBody = '';

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          textBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          htmlBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          extractFromParts(part.parts);
        }
      }
    };

    if (payload.body?.data) {
      const content = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      if (payload.mimeType === 'text/html') {
        htmlBody = content;
      } else {
        textBody = content;
      }
    } else if (payload.parts) {
      extractFromParts(payload.parts);
    }

    return { text: textBody, html: htmlBody };
  }

  /**
   * Search emails by criteria
   */
  async searchEmails(criteria: {
    from?: string;
    to?: string;
    subject?: string;
    after?: string;
    before?: string;
    isUnread?: boolean;
    hasAttachment?: boolean;
    maxResults?: number;
  }): Promise<EmailMessage[]> {
    let query = '';
    
    if (criteria.from) query += `from:${criteria.from} `;
    if (criteria.to) query += `to:${criteria.to} `;
    if (criteria.subject) query += `subject:"${criteria.subject}" `;
    if (criteria.after) query += `after:${criteria.after} `;
    if (criteria.before) query += `before:${criteria.before} `;
    if (criteria.isUnread) query += 'is:unread ';
    if (criteria.hasAttachment) query += 'has:attachment ';

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query.trim(),
        maxResults: criteria.maxResults || 10
      });

      const messages = response.data.messages || [];
      const emailPromises = messages.map((msg: any) => this.getEmailById(msg.id));
      
      return await Promise.all(emailPromises);
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  /**
   * DELETE EMAIL - FIXED VERSION with proper error handling
   */
  async deleteEmail(messageId: string): Promise<boolean> {
    try {
      console.log(`🗑️  Attempting to delete email with ID: ${messageId}`);
      
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId
      });
      
      console.log(`✅ Successfully deleted email: ${messageId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error deleting email ${messageId}:`, {
        message: error.message,
        code: error.code,
        status: error.status,
        cause: error.cause
      });
      
      // Specific error handling
      if (error.code === 403) {
        console.error('🔒 PERMISSION DENIED: Your OAuth token lacks delete permissions');
        console.error('🔧 SOLUTION: You need to regenerate your refresh token with updated scopes');
        console.error('📋 Required scopes: gmail.modify, gmail.compose, gmail.send');
      } else if (error.code === 404) {
        console.error('📧 EMAIL NOT FOUND: Message may already be deleted or doesn\'t exist');
      } else if (error.code === 401) {
        console.error('🔑 AUTHENTICATION ERROR: Token may be expired or invalid');
      }
      
      return false;
    }
  }

  /**
   * Alternative: Move to Trash instead of permanent delete
   */
  async moveToTrash(messageId: string): Promise<boolean> {
    try {
      console.log(`🗑️  Moving email to trash: ${messageId}`);
      
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId
      });
      
      console.log(`✅ Successfully moved email to trash: ${messageId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error moving email to trash ${messageId}:`, error);
      return false;
    }
  }

  /**
   * Restore email from trash
   */
  async restoreFromTrash(messageId: string): Promise<boolean> {
    try {
      console.log(`♻️  Restoring email from trash: ${messageId}`);
      
      await this.gmail.users.messages.untrash({
        userId: 'me',
        id: messageId
      });
      
      console.log(`✅ Successfully restored email from trash: ${messageId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error restoring email from trash ${messageId}:`, error);
      return false;
    }
  }

  /**
   * Bulk delete emails matching criteria
   */
  async bulkDeleteEmails(criteria: {
    from?: string;
    to?: string;
    subject?: string;
    olderThanDays?: number;
    maxToDelete?: number;
  }): Promise<{ deleted: number; failed: number }> {
    console.log('🔄 Starting bulk delete operation...');
    
    let query = '';
    if (criteria.from) query += `from:${criteria.from} `;
    if (criteria.to) query += `to:${criteria.to} `;
    if (criteria.subject) query += `subject:"${criteria.subject}" `;
    if (criteria.olderThanDays) {
      const date = new Date();
      date.setDate(date.getDate() - criteria.olderThanDays);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');
      query += `before:${dateStr} `;
    }

    const emails = await this.searchEmails({
      ...criteria,
      maxResults: criteria.maxToDelete || 50
    });

    console.log(`📧 Found ${emails.length} emails to delete`);

    let deleted = 0;
    let failed = 0;

    for (const email of emails) {
      const success = await this.deleteEmail(email.id);
      if (success) {
        deleted++;
      } else {
        failed++;
      }
      
      // Small delay to avoid rate limits
      await this.sleep(100);
    }

    console.log(`✅ Bulk delete completed: ${deleted} deleted, ${failed} failed`);
    return { deleted, failed };
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      return false;
    }
  }

  /**
   * Mark email as unread
   */
  async markAsUnread(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as unread:', error);
      return false;
    }
  }

  /**
   * Wait for password reset email
   */
  async waitForPasswordResetEmail(
    recipientEmail: string,
    timeoutMs: number = 60000,
    pollIntervalMs: number = 3000
  ): Promise<EmailMessage | null> {
    const startTime = Date.now();
    const afterDate = new Date(startTime - 60000).toISOString().split('T')[0].replace(/-/g, '/');

    console.log(`🔍 Waiting for password reset email to: ${recipientEmail}`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const emails = await this.searchEmails({
          to: recipientEmail,
          subject: "Riverside Score - Password Reset",
          after: afterDate,
          maxResults: 5
        });

        if (emails.length > 0) {
          console.log(`✅ Found ${emails.length} password reset email(s)`);
          return emails[0];
        }

        console.log(`⏳ No password reset email found yet, waiting ${pollIntervalMs}ms...`);
        await this.sleep(pollIntervalMs);
      } catch (error) {
        console.error('Error while waiting for email:', error);
        await this.sleep(pollIntervalMs);
      }
    }

    console.log('❌ Timeout: No password reset email received');
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

```typescript

// scripts/generateRefreshToken.ts - UPDATED with delete permissions
import { google } from 'googleapis';
import * as readline from 'readline';

const CLIENT_ID = 'your-client-id-here.googleusercontent.com';
const CLIENT_SECRET = 'your-client-secret-here';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// UPDATED SCOPES - Now includes permissions to delete emails
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send'
];

async function generateRefreshToken() {
  console.log('🔧 Gmail Email Automation - Token Generator');
  console.log('📝 Updated with DELETE email permissions');
  console.log('═'.repeat(50));

  // Generate the auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Forces re-consent to get updated permissions
  });

  console.log('📋 REQUIRED PERMISSIONS:');
  console.log('   ✓ Read emails (gmail.readonly)');
  console.log('   ✓ Modify emails - mark read/unread (gmail.modify)');
  console.log('   ✓ Delete emails (gmail.compose)');
  console.log('   ✓ Full Gmail access (gmail.send)');
  console.log('');
  console.log('🌐 1. Open this URL in your browser:');
  console.log('   ' + authUrl);
  console.log('');
  console.log('⚠️  IMPORTANT: You will see a warning "This app isn\'t verified"');
  console.log('   Click "Advanced" → "Go to Gmail Automation Test (unsafe)"');
  console.log('');
  console.log('✅ 2. Complete the authorization (Grant ALL permissions)');
  console.log('📋 3. Copy the authorization code and paste it below:');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code: ', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('');
      console.log('🎉 SUCCESS! Your updated tokens with DELETE permissions:');
      console.log('═'.repeat(60));
      console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID);
      console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET);
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('═'.repeat(60));
      console.log('');
      console.log('📝 Next Steps:');
      console.log('1. Update your .env file with these new values');
      console.log('2. Delete your old refresh token from .env');
      console.log('3. Test the delete functionality');
      console.log('');
      console.log('⚠️  SECURITY NOTE:');
      console.log('Keep these tokens private - they grant full Gmail access!');
      
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('1. Make sure you copied the COMPLETE authorization code');
      console.log('2. The code should be quite long (100+ characters)');
      console.log('3. Try generating a new code if this one expired');
    }
    rl.close();
  });
}

// Add error handling for missing credentials
if (CLIENT_ID.includes('your-client-id-here') || CLIENT_SECRET.includes('your-client-secret-here')) {
  console.error('❌ ERROR: You need to update CLIENT_ID and CLIENT_SECRET');
  console.error('');
  console.error('🔧 Steps to fix:');
  console.error('1. Go to Google Cloud Console');
  console.error('2. Navigate to APIs & Services → Credentials');
  console.error('3. Copy your OAuth 2.0 Client ID and Secret');
  console.error('4. Update this file with your actual values');
  console.error('');
  process.exit(1);
}

generateRefreshToken();

```

```typescript

// tests/email-automation.spec.ts - UPDATED with delete functionality
import { test, expect } from '@playwright/test';
import { GmailService } from '../utils/gmailService';
import { EmailHelpers } from '../utils/emailHelpers';

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
        90000 // Wait up to 90 seconds
      );

      // Step 3: Verify email was received
      expect(resetEmail).toBeTruthy();
      expect(resetEmail?.subject).toBe("Riverside Score - Password Reset");
      expect(resetEmail?.to).toContain("riversidescore@clinical.riverside-insights.com");

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

```