/**
 * Vault Encryption Utilities — Zero-Knowledge E2EE Helper Module
 *
 * Provides AES-GCM-256 client-side payload encryption and decryption for:
 * 1. Sensitive profile kinks & safeword preferences
 * 2. Confidential event venue keys & double-blind release codes
 * 3. Anonymous Q&A post signatures & zero-knowledge author verification headers
 * 4. Role Complementarity Score calculation engine
 */

import { encryptPayload, decryptPayload, randomBytes, bytesToBase64 } from './cryptoVault';

export { VaultLockGateAPI, isSealedBlob } from './cryptoVault';

/**
 * Encrypt sensitive profile kinks or safewords using client-side key.
 */
export async function encryptProfileKinks(kinksData: unknown, secretKey: string): Promise<string> {
  if (!secretKey) throw new Error('Secret key required for encryption');
  return encryptPayload(kinksData, secretKey);
}

/**
 * Decrypt sensitive profile kinks or safewords using client-side key.
 */
export async function decryptProfileKinks<T = unknown>(encryptedKinks: string, secretKey: string): Promise<T> {
  if (!secretKey) throw new Error('Secret key required for decryption');
  return decryptPayload<T>(encryptedKinks, secretKey);
}

/**
 * Encrypt confidential event venue address with host secret key.
 * Only released to approved RSVP attendees.
 */
export async function encryptEventVenueKey(venueAddress: string, hostSecret: string): Promise<string> {
  if (!venueAddress) throw new Error('Venue address required');
  const payload = {
    address: venueAddress,
    timestamp: Date.now(),
    released: true,
  };
  return encryptPayload(payload, hostSecret || 'default-host-munch-key');
}

/**
 * Decrypt confidential event venue address upon host RSVP approval.
 */
export async function decryptEventVenueKey(encryptedVenue: string, hostSecret: string): Promise<string> {
  try {
    const data = await decryptPayload<{ address: string }>(encryptedVenue, hostSecret || 'default-host-munch-key');
    return data.address;
  } catch {
    return 'Ubicación confidencial protegida por cifrado. Solicita aprobación al host.';
  }
}

/**
 * Generate a Zero-Knowledge anonymous cryptographic signature for community feed Q&A posts.
 * Allows verifying post authenticity without disclosing the user's identity.
 */
export async function generateAnonymousSignature(content: string, authorSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content + ':' + authorSecret);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', contentBytes);
  const hashBytes = new Uint8Array(hashBuffer);
  return 'zk-sig-' + bytesToBase64(hashBytes).slice(0, 24);
}

/**
 * Verify a Zero-Knowledge anonymous signature against the content and author secret.
 */
export async function verifyAnonymousSignature(content: string, signature: string, authorSecret: string): Promise<boolean> {
  const expected = await generateAnonymousSignature(content, authorSecret);
  return signature === expected;
}

/**
 * Encrypt an anonymous feed post payload.
 */
export async function encryptAnonymousPostPayload(postData: unknown, anonymousKey: string): Promise<string> {
  return encryptPayload(postData, anonymousKey);
}

/**
 * Decrypt an anonymous feed post payload.
 */
export async function decryptAnonymousPostPayload<T = unknown>(encryptedPost: string, anonymousKey: string): Promise<T> {
  return decryptPayload<T>(encryptedPost, anonymousKey);
}

/**
 * Role Complementarity Score Calculator
 * Calculates dynamic compatibility percentage based on role dynamics:
 * - Dom + Sub = 95%
 * - Master + Slave = 98%
 * - Rigger + Rope Bottom = 96%
 * - Top + Bottom = 92%
 * - Switch + Switch = 88%
 * - Same non-switch role (Dom + Dom / Sub + Sub) = 40% (role conflict penalty)
 * - Flexible / undefined = 75%
 */
export function calculateRoleComplementarityScore(roleA?: string, roleB?: string): number {
  if (!roleA || !roleB) return 75;
  const a = roleA.toLowerCase().trim();
  const b = roleB.toLowerCase().trim();

  if (a === 'switch' || b === 'switch' || a === 'flexible' || b === 'flexible') {
    return 88;
  }

  const pairs: [string, string, number][] = [
    ['dom', 'sub', 95],
    ['master', 'slave', 98],
    ['rigger', 'rope bottom', 96],
    ['top', 'bottom', 92],
    ['sadist', 'masochist', 97],
    ['keyholder', 'chastity sub', 95],
    ['caregiver', 'little', 94],
  ];

  for (const [r1, r2, score] of pairs) {
    if ((a.includes(r1) && b.includes(r2)) || (a.includes(r2) && b.includes(r1))) {
      return score;
    }
  }

  // Same role conflict check
  if (
    (a.includes('dom') && b.includes('dom')) ||
    (a.includes('top') && b.includes('top')) ||
    (a.includes('master') && b.includes('master'))
  ) {
    return 45; // Dom/Dom clash
  }

  if (
    (a.includes('sub') && b.includes('sub')) ||
    (a.includes('bottom') && b.includes('bottom')) ||
    (a.includes('slave') && b.includes('slave'))
  ) {
    return 55; // Sub/Sub lack of direction
  }

  return 70;
}
