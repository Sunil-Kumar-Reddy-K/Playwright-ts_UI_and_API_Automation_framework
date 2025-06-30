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