/* eslint-disable @typescript-eslint/no-explicit-any */
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
  private auth!: OAuth2Client;

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
          from: recipientEmail,
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