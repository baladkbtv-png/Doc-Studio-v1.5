/**
 * Web Crypto API Encryption Utility using AES-GCM and PBKDF2
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = typeof window !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getKey(password: string, saltBuffer: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  version: 'v1.5';
  salt: string; // Base64
  iv: string;   // Base64
  cipherText: string; // Base64
}

/**
 * Encrypts a string (text or base64) with a password using PBKDF2 + AES-GCM 256
 */
export async function encryptData(plainText: string, password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password is required for encryption');
  }

  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));
  const saltBuffer = saltBytes.buffer as ArrayBuffer;
  const ivBuffer = ivBytes.buffer as ArrayBuffer;

  const key = await getKey(password, saltBuffer);

  const enc = new TextEncoder();
  const encodedPlainText = enc.encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    encodedPlainText
  );

  const payload: EncryptedPayload = {
    version: 'v1.5',
    salt: arrayBufferToBase64(saltBuffer),
    iv: arrayBufferToBase64(ivBuffer),
    cipherText: arrayBufferToBase64(cipherBuffer),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypts an encrypted payload JSON string using the password
 */
export async function decryptData(encryptedJson: string, password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password is required for decryption');
  }

  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(encryptedJson);
    if (!payload.salt || !payload.iv || !payload.cipherText) {
      throw new Error('Invalid encrypted payload format');
    }
  } catch {
    throw new Error('Corrupted or invalid encrypted payload structure');
  }

  const saltBuffer = base64ToArrayBuffer(payload.salt);
  const ivBuffer = base64ToArrayBuffer(payload.iv);
  const cipherBuffer = base64ToArrayBuffer(payload.cipherText);

  const key = await getKey(password, saltBuffer);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Incorrect password or corrupted encrypted data');
  }
}
