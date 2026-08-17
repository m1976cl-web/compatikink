/**
 * lib/storage.ts — Barrel file para módulos de almacenamiento local ZK.
 *
 * Refactorizado (P2.1): Dividido en submódulos especializados en lib/storage/:
 *   - profileStorage: Perfiles de usuario, roles y autenticación ZK
 *   - sessionStorage: Sesiones de compatibilidad locales y tokens
 *   - debriefStorage: Acuerdos de escena y debriefs
 *   - customStorage: Actividades personalizadas, marcadores, wishlist y mensajes
 *   - backupStorage: Exportación, importación y purga de datos
 *   - dsStorage: Tareas D/s, hábitos, ledger de puntos y emparejamiento
 */

export * from './storage/profileStorage';
export * from './storage/sessionStorage';
export * from './storage/debriefStorage';
export * from './storage/customStorage';
export * from './storage/backupStorage';
export * from './storage/dsStorage';
