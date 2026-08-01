export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateToken(): string {
  const rand =
    typeof globalThis.crypto?.getRandomValues === 'function'
      ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  return `${Date.now().toString(36)}-${rand}`;
}
