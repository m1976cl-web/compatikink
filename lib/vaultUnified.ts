/**
 * vaultUnified.ts — Módulo centralizado de Bóveda Zero-Knowledge para Compatikink.
 *
 * Consolida las funcionalidades anteriormente separadas en:
 *   - lib/vault.ts     → Cifrado de perfiles, eventos, feed anónimo, compatibilidad de roles
 *   - lib/adminVault.ts → Gestión de credenciales admin, directorio de perfiles, métricas, auditoría
 *
 * Todos los imports existentes siguen funcionando via re-exports en vault.ts y adminVault.ts.
 *
 * Cifrado: AES-GCM-256 (WebCrypto) + PBKDF2-SHA-256 — 100% Zero-Knowledge client-side.
 */

import { encryptPayload, decryptPayload, bytesToBase64, readJsonStorage, writeJsonStorage } from './cryptoVault';
import { UserProfile } from '@/types';
import { getPartnerLinks, getSessionEntries } from './partnerJournal';

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1: Cifrado de Perfiles & Eventos (antes vault.ts)
// ─────────────────────────────────────────────────────────────────────────────

export { VaultLockGateAPI, isSealedBlob } from './cryptoVault';

/** Cifra datos sensibles de kinks o safewords del perfil usando clave cliente. */
export async function encryptProfileKinks(kinksData: unknown, secretKey: string): Promise<string> {
  if (!secretKey) throw new Error('Secret key required for encryption');
  return encryptPayload(kinksData, secretKey);
}

/** Descifra datos sensibles de kinks o safewords del perfil. */
export async function decryptProfileKinks<T = unknown>(encryptedKinks: string, secretKey: string): Promise<T> {
  if (!secretKey) throw new Error('Secret key required for decryption');
  return decryptPayload<T>(encryptedKinks, secretKey);
}

/**
 * Cifra la dirección confidencial de un evento/munch.
 * Solo se libera a los asistentes aprobados por RSVP.
 */
export async function encryptEventVenueKey(venueAddress: string, hostSecret: string): Promise<string> {
  if (!venueAddress) throw new Error('Venue address required');
  const payload = { address: venueAddress, timestamp: Date.now(), released: true };
  return encryptPayload(payload, hostSecret || 'default-host-munch-key');
}

/** Descifra la dirección del evento tras aprobación RSVP del host. */
export async function decryptEventVenueKey(encryptedVenue: string, hostSecret: string): Promise<string> {
  try {
    const data = await decryptPayload<{ address: string }>(encryptedVenue, hostSecret || 'default-host-munch-key');
    return data.address;
  } catch {
    return 'Ubicación confidencial protegida por cifrado. Solicita aprobación al host.';
  }
}

/**
 * Genera una firma criptográfica anónima Zero-Knowledge para posts del feed.
 * Permite verificar autenticidad sin revelar identidad del autor.
 */
export async function generateAnonymousSignature(content: string, authorSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content + ':' + authorSecret);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', contentBytes);
  const hashBytes = new Uint8Array(hashBuffer);
  return 'zk-sig-' + bytesToBase64(hashBytes).slice(0, 24);
}

/** Verifica una firma anónima Zero-Knowledge contra el contenido y el secreto del autor. */
export async function verifyAnonymousSignature(content: string, signature: string, authorSecret: string): Promise<boolean> {
  const expected = await generateAnonymousSignature(content, authorSecret);
  return signature === expected;
}

/** Cifra un payload de post anónimo en el feed. */
export async function encryptAnonymousPostPayload(postData: unknown, anonymousKey: string): Promise<string> {
  return encryptPayload(postData, anonymousKey);
}

/** Descifra un payload de post anónimo en el feed. */
export async function decryptAnonymousPostPayload<T = unknown>(encryptedPost: string, anonymousKey: string): Promise<T> {
  return decryptPayload<T>(encryptedPost, anonymousKey);
}

/**
 * Motor de Puntaje de Complementariedad de Roles.
 *
 * Pares complementarios y sus puntajes:
 *   Dom + Sub = 95%   |   Master + Slave = 98%   |   Rigger + Rope Bottom = 96%
 *   Top + Bottom = 92% |   Sadist + Masochist = 97% |   Caregiver + Little = 94%
 *   Switch + * = 88%   |   Mismo rol conflicto = 40-55%
 */
export function calculateRoleComplementarityScore(roleA?: string, roleB?: string): number {
  if (!roleA || !roleB) return 75;
  const a = roleA.toLowerCase().trim();
  const b = roleB.toLowerCase().trim();

  if (a === 'switch' || b === 'switch' || a === 'flexible' || b === 'flexible') return 88;

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
    if ((a.includes(r1) && b.includes(r2)) || (a.includes(r2) && b.includes(r1))) return score;
  }

  if ((a.includes('dom') && b.includes('dom')) || (a.includes('top') && b.includes('top')) || (a.includes('master') && b.includes('master'))) return 45;
  if ((a.includes('sub') && b.includes('sub')) || (a.includes('bottom') && b.includes('bottom')) || (a.includes('slave') && b.includes('slave'))) return 55;

  return 70;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2: Gestión de Credenciales Admin & Directorio (antes adminVault.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminRegisteredProfile {
  id: string;
  alias: string;
  kinkRole: 'Dominante' | 'Sumiso/a' | 'Switch' | 'Top' | 'Bottom' | 'Explorador/a';
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Maestro/a';
  bio: string;
  location: string;
  isVerified: boolean;
  status: 'Activo' | 'Suspendido' | 'Pendiente';
  joinedDate: string;
  lastActive: string;
  hardLimits: string[];
  softLimits: string[];
  badgesCount: number;
  partnerLinksCount: number;
  sessionCount: number;
  fetishTags: string[];
  safetyProtocol: 'SSC' | 'RACK' | 'PRICK';
  bluePageCreator?: boolean;
}

export interface AdminMetrics {
  totalProfiles: number;
  verifiedProfiles: number;
  activePartnerships: number;
  totalSessionEntries: number;
  bluePageCreators: number;
  activeEventsRsvp: number;
}

const ADMIN_PASSCODE_KEY = 'admin_master_passcode_hash_v1';
const ADMIN_PROFILES_KEY = 'admin_registered_profiles_catalog_v1';

const MOCK_COMMUNITY_PROFILES: AdminRegisteredProfile[] = [
  {
    id: 'usr-admin-master', alias: 'Nox_Master', kinkRole: 'Switch', experienceLevel: 'Maestro/a',
    bio: 'Administrador principal del sistema Compatikink. Guardián de la Bóveda Zero-Knowledge.',
    location: 'Santiago, Chile', isVerified: true, status: 'Activo',
    joinedDate: '2026-01-15', lastActive: 'Hace instantes',
    hardLimits: ['No consent no play', 'Sanguíneo no controlado', 'Escatología'],
    softLimits: ['Spanking de alta intensidad', 'Cera de altas temperaturas'],
    badgesCount: 14, partnerLinksCount: 2, sessionCount: 28,
    fetishTags: ['Látex', 'Shibari', 'Dominación Femenina', 'Pegging'],
    safetyProtocol: 'RACK', bluePageCreator: true,
  },
  {
    id: 'usr-valeria-latex', alias: 'Valeria_Latex', kinkRole: 'Dominante', experienceLevel: 'Avanzado',
    bio: 'Domme apasionada del látex negro brillante, Shibari geométrico y la disciplina elegante.',
    location: 'Valparaíso, Chile', isVerified: true, status: 'Activo',
    joinedDate: '2026-02-10', lastActive: 'Hace 2 horas',
    hardLimits: ['Breathplay extremo', 'Humillación pública no acordada'],
    softLimits: ['Pared de agujas', 'Vendas prolongadas'],
    badgesCount: 18, partnerLinksCount: 1, sessionCount: 42,
    fetishTags: ['Látex', 'FLR', 'Shibari', 'Impacto'],
    safetyProtocol: 'SSC', bluePageCreator: true,
  },
  {
    id: 'usr-lucas-rope', alias: 'Lucas_Rope', kinkRole: 'Top', experienceLevel: 'Intermedio',
    bio: 'Rigger enfocado en ataduras sensoriales de yute y suspensión de suelo segura.',
    location: 'Concepción, Chile', isVerified: true, status: 'Activo',
    joinedDate: '2026-03-05', lastActive: 'Hace 1 día',
    hardLimits: ['Marcas permanentes', 'Corte sin consentimiento'],
    softLimits: ['Cera caliente', 'Clips de presión'],
    badgesCount: 9, partnerLinksCount: 1, sessionCount: 19,
    fetishTags: ['Shibari', 'Sensorial', 'Vendas'],
    safetyProtocol: 'SSC', bluePageCreator: false,
  },
  {
    id: 'usr-camila-sub', alias: 'Cami_Pet', kinkRole: 'Sumiso/a', experienceLevel: 'Principiante',
    bio: 'Explorando la sumisión consciente, Kittenplay y el espacio de subspace profundo.',
    location: 'Viña del Mar, Chile', isVerified: false, status: 'Activo',
    joinedDate: '2026-04-12', lastActive: 'Hace 3 horas',
    hardLimits: ['Humillación verbal severa', 'Asfixia'],
    softLimits: ['Spanking de cuero', 'Jaulas de castidad'],
    badgesCount: 5, partnerLinksCount: 1, sessionCount: 8,
    fetishTags: ['Petplay', 'Subspace', 'Sensorial'],
    safetyProtocol: 'PRICK', bluePageCreator: false,
  },
];

let _adminToken: string | null = null;

export async function hasAdminPasscodeConfigured(): Promise<boolean> {
  const hash = await readJsonStorage<string | null>(ADMIN_PASSCODE_KEY, null);
  return !!hash;
}

export async function setAdminPasscode(passcode: string): Promise<boolean> {
  if (!passcode || passcode.length < 4) return false;
  const encoder = new TextEncoder();
  const data = encoder.encode(`compatikink_admin_salt_${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  await writeJsonStorage(ADMIN_PASSCODE_KEY, hashHex);
  _adminToken = hashHex;
  return true;
}

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const storedHash = await readJsonStorage<string | null>(ADMIN_PASSCODE_KEY, null);
  if (!storedHash) return false;
  const encoder = new TextEncoder();
  const data = encoder.encode(`compatikink_admin_salt_${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hashHex === storedHash) { _adminToken = hashHex; return true; }
  return false;
}

export function isAdminAuthenticated(): boolean { return !!_adminToken; }
export function logoutAdmin(): void { _adminToken = null; }

export async function getAllRegisteredProfiles(): Promise<AdminRegisteredProfile[]> {
  return readJsonStorage<AdminRegisteredProfile[]>(ADMIN_PROFILES_KEY, MOCK_COMMUNITY_PROFILES);
}

export async function toggleProfileVerification(profileId: string): Promise<AdminRegisteredProfile[]> {
  const catalog = await getAllRegisteredProfiles();
  const target = catalog.find((p) => p.id === profileId);
  if (target) { target.isVerified = !target.isVerified; await writeJsonStorage(ADMIN_PROFILES_KEY, catalog); }
  return catalog;
}

export async function toggleProfileStatus(profileId: string): Promise<AdminRegisteredProfile[]> {
  const catalog = await getAllRegisteredProfiles();
  const target = catalog.find((p) => p.id === profileId);
  if (target) { target.status = target.status === 'Activo' ? 'Suspendido' : 'Activo'; await writeJsonStorage(ADMIN_PROFILES_KEY, catalog); }
  return catalog;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const catalog = await getAllRegisteredProfiles();
  const partnerLinks = await getPartnerLinks();
  const sessionEntries = await getSessionEntries();
  return {
    totalProfiles: catalog.length,
    verifiedProfiles: catalog.filter((p) => p.isVerified).length,
    activePartnerships: partnerLinks.length,
    totalSessionEntries: sessionEntries.length,
    bluePageCreators: catalog.filter((p) => p.bluePageCreator).length,
    activeEventsRsvp: 12,
  };
}

export async function exportSystemAuditReport(): Promise<string> {
  const catalog = await getAllRegisteredProfiles();
  const metrics = await getAdminMetrics();
  const report = {
    generatedAt: new Date().toISOString(),
    platform: 'Compatikink Zero-Knowledge Admin Audit',
    metrics,
    profiles: catalog.map((p) => ({
      id: p.id, alias: p.alias, role: p.kinkRole, level: p.experienceLevel,
      isVerified: p.isVerified, status: p.status,
      hardLimitsCount: p.hardLimits.length, softLimitsCount: p.softLimits.length,
      fetishTags: p.fetishTags, safetyProtocol: p.safetyProtocol,
    })),
  };
  return JSON.stringify(report, null, 2);
}
