/**
 * @deprecated — Este archivo era un wrapper de compatibilidad.
 * Todos los consumidores fueron migrados a importar desde '@/lib/vaultUnified'.
 * Mantenido temporalmente para referencia; se puede eliminar de forma segura.
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
