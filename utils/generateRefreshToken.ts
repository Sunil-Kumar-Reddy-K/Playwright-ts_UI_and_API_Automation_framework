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

generateRefreshToken().then(() => {
  console.log('Done!');
}).catch((error) => {
  console.error('Error:', error);
});