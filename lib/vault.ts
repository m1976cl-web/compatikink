/**
 * @deprecated — Este archivo era un wrapper de compatibilidad.
 * Todos los consumidores fueron migrados a importar desde '@/lib/vaultUnified'.
 * Mantenido temporalmente para referencia; se puede eliminar de forma segura.
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
