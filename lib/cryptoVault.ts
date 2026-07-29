/**
 * CryptoVault: Zero-Knowledge Client-Side Encryption for Compatikink
 * Uses WebCrypto API AES-GCM 256-bit encryption.
 * Ensures user responses are encrypted BEFORE sending to server.
 */

// Derive a 256-bit AES key from user's secret/password using SHA-256
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt any JS object or string using a secret passphrase
 */
export async function encryptPayload(payload: any, secret: string): Promise<string> {
  try {
    const key = await deriveKey(secret);
    const encoder = new TextEncoder();
    const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const encodedData = encoder.encode(jsonStr);

    // Generate random 12-byte IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Pack IV + Encrypted Data into Base64 string
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('CryptoVault encryption error:', error);
    throw new Error('Error al cifrar los datos de la bóveda.');
  }
}

/**
 * Decrypt a Base64 encrypted payload string back into JSON object/string
 */
export async function decryptPayload<T = any>(cipherTextBase64: string, secret: string): Promise<T> {
  try {
    const key = await deriveKey(secret);
    const combinedStr = atob(cipherTextBase64);
    const combined = new Uint8Array(combinedStr.length);
    for (let i = 0; i < combinedStr.length; i++) {
      combined[i] = combinedStr.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decryptedBuffer);

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      return jsonStr as any as T;
    }
  } catch (error) {
    console.error('CryptoVault decryption error:', error);
    throw new Error('Error al descifrar. Verifica tu contraseña o clave de bóveda.');
  }
}
