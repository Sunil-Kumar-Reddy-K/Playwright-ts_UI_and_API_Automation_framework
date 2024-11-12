import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex');
const iv = crypto.randomBytes(16);

export const encrypt = (data: string): string => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (encryptedData: string): string => {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), ivBuffer);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
  return decrypted.toString();
};

/**
 * Just a one time thing to encrypt the creds
 */

// const username = 'PublicationsOrg01';
// const password = 'Test@100';

// const encryptedUsername = encrypt(username);
// const encryptedPassword = encrypt(password);

// console.log('secretKey:', secretKey);
// console.log('Encrypted Username:', encryptedUsername);
// console.log('Encrypted Password:', encryptedPassword);

