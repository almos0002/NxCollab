"use client";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyStr), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", keyData, { name: ALGORITHM }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptData(data: string, keyStr: string): Promise<string> {
  const key = await importKey(keyStr);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encryptedStr: string, keyStr: string): Promise<string> {
  const key = await importKey(keyStr);
  const combined = Uint8Array.from(atob(encryptedStr), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
  return new TextDecoder().decode(decrypted);
}
