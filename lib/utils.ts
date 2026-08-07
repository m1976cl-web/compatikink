/**
 * Shared pure helpers (no React Native imports).
 * Session tokens / invite codes use CSPRNG when available.
 */

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    throw new Error(
      'WebCrypto getRandomValues no disponible: no se pueden generar tokens seguros.'
    );
  }
  c.getRandomValues(out);
  return out;
}

/** 6-char invite code (UX only — real security is inviteSecret / DEK wrap). */
export function generateInviteCode(): string {
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_ALPHABET[bytes[i]! % INVITE_CODE_ALPHABET.length];
  }
  return code;
}

/**
 * High-entropy initiator / session token (CSPRNG).
 * Format: hex(16 bytes) without predictable Date.now prefix.
 */
export function generateToken(): string {
  const bytes = randomBytes(24);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
