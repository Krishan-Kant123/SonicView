import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

// The key used for encryption should be exactly 32 bytes (256 bits)
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }
  
  if (secret.length === 32) {
    return Buffer.from(secret, 'utf8');
  }
  
  // Hash it to exactly 32 bytes if it's not
  return crypto.scryptSync(secret, 'salt', 32);
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Deriving key to ensure exactly 32 bytes and add uniqueness
  const key = crypto.pbkdf2Sync(getEncryptionKey(), salt, 100000, 32, 'sha512');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Pack everything together to store in DB: iv:salt:authTag:encryptedText
  return `${iv.toString('hex')}:${salt.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(cyphertext: string): string {
  const parts = cyphertext.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid cyphertext format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const salt = Buffer.from(parts[1], 'hex');
  const authTag = Buffer.from(parts[2], 'hex');
  const encryptedText = parts[3];
  
  const key = crypto.pbkdf2Sync(getEncryptionKey(), salt, 100000, 32, 'sha512');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
