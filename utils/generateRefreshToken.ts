import { google } from 'googleapis';
import * as readline from 'readline';

const CLIENT_ID = '707079250767-4sp2hnv21niuclrngq839uk8seun0jis.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost';

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

generateRefreshToken().then(() => {
  console.log('Done!');
}).catch((error) => {
  console.error('Error:', error);
});