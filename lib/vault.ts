/**
 * vault.ts — Capa de compatibilidad.
 *
 * Toda la lógica fue consolidada en lib/vaultUnified.ts.
 * Este archivo re-exporta todo para mantener compatibilidad
 * con los imports existentes en app/dating.tsx, app/events.tsx,
 * app/kink-feed.tsx y cualquier otro módulo.
 */
export {
  VaultLockGateAPI,
  isSealedBlob,
  encryptProfileKinks,
  decryptProfileKinks,
  encryptEventVenueKey,
  decryptEventVenueKey,
  generateAnonymousSignature,
  verifyAnonymousSignature,
  encryptAnonymousPostPayload,
  decryptAnonymousPostPayload,
  calculateRoleComplementarityScore,
} from './vaultUnified';
