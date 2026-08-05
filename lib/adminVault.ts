/**
 * adminVault.ts — Capa de compatibilidad.
 *
 * Toda la lógica fue consolidada en lib/vaultUnified.ts.
 * Este archivo re-exporta todo para mantener compatibilidad
 * con los imports existentes en app/admin-dashboard.tsx
 * y app/security-audit.tsx.
 */
export type { AdminRegisteredProfile, AdminMetrics } from './vaultUnified';
export {
  hasAdminPasscodeConfigured,
  setAdminPasscode,
  verifyAdminPasscode,
  isAdminAuthenticated,
  logoutAdmin,
  getAllRegisteredProfiles,
  toggleProfileVerification,
  toggleProfileStatus,
  getAdminMetrics,
  exportSystemAuditReport,
} from './vaultUnified';
