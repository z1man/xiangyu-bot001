import crypto from 'node:crypto';

function getKey(): Buffer {
  const key = process.env.APP_ENC_KEY;
  if (!key) throw new Error('APP_ENC_KEY is required');
  // Support hex (32 bytes => 64 hex chars) or base64
  if (/^[0-9a-fA-F]{64}$/.test(key)) return Buffer.from(key, 'hex');
  return Buffer.from(key, 'base64');
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptSecret(payloadB64: string): string {
  const key = getKey();
  const buf = Buffer.from(payloadB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]);
  return plain.toString('utf8');
}
