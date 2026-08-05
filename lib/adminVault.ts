import { readJsonStorage, writeJsonStorage } from './cryptoVault';
import { UserProfile } from '@/types';
import { getPartnerLinks, getSessionEntries } from './partnerJournal';

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
    id: 'usr-admin-master',
    alias: 'Nox_Master',
    kinkRole: 'Switch',
    experienceLevel: 'Maestro/a',
    bio: 'Administrador principal del sistema Compatikink. Guardián de la Bóveda Zero-Knowledge.',
    location: 'Santiago, Chile',
    isVerified: true,
    status: 'Activo',
    joinedDate: '2026-01-15',
    lastActive: 'Hace instantes',
    hardLimits: ['No consent no play', 'Sanguíneo no controlado', 'Escatología'],
    softLimits: ['Spanking de alta intensidad', 'Cera de altas temperaturas'],
    badgesCount: 14,
    partnerLinksCount: 2,
    sessionCount: 28,
    fetishTags: ['Látex', 'Shibari', 'Dominación Femenina', 'Pegging'],
    safetyProtocol: 'RACK',
    bluePageCreator: true,
  },
  {
    id: 'usr-valeria-latex',
    alias: 'Valeria_Latex',
    kinkRole: 'Dominante',
    experienceLevel: 'Avanzado',
    bio: 'Domme apasionada del látex negro brillante, Shibari geométrico y la disciplina elegante.',
    location: 'Valparaíso, Chile',
    isVerified: true,
    status: 'Activo',
    joinedDate: '2026-02-10',
    lastActive: 'Hace 2 horas',
    hardLimits: ['Breathplay extremo', 'Humillación pública no acordada'],
    softLimits: ['Pared de agujas', 'Vendas prolongadas'],
    badgesCount: 18,
    partnerLinksCount: 1,
    sessionCount: 42,
    fetishTags: ['Látex', 'FLR', 'Shibari', 'Impacto'],
    safetyProtocol: 'SSC',
    bluePageCreator: true,
  },
  {
    id: 'usr-lucas-rope',
    alias: 'Lucas_Rope',
    kinkRole: 'Top',
    experienceLevel: 'Intermedio',
    bio: 'Rigger enfocado en ataduras sensoriales de yute y suspensión de suelo segura.',
    location: 'Concepción, Chile',
    isVerified: true,
    status: 'Activo',
    joinedDate: '2026-03-05',
    lastActive: 'Hace 1 día',
    hardLimits: ['Marcas permanentes', 'Corte sin consentimiento'],
    softLimits: ['Cera caliente', 'Clips de presión'],
    badgesCount: 9,
    partnerLinksCount: 1,
    sessionCount: 19,
    fetishTags: ['Shibari', 'Sensorial', 'Vendas'],
    safetyProtocol: 'SSC',
    bluePageCreator: false,
  },
  {
    id: 'usr-camila-sub',
    alias: 'Cami_Pet',
    kinkRole: 'Sumiso/a',
    experienceLevel: 'Principiante',
    bio: 'Explorando la sumisión consciente, Kittenplay y el espacio de subspace profundo.',
    location: 'Viña del Mar, Chile',
    isVerified: false,
    status: 'Activo',
    joinedDate: '2026-04-12',
    lastActive: 'Hace 3 horas',
    hardLimits: ['Humillación verbal severa', 'Asfixia'],
    softLimits: ['Spanking de cuero', 'Jaulas de castidad'],
    badgesCount: 5,
    partnerLinksCount: 1,
    sessionCount: 8,
    fetishTags: ['Petplay', 'Subspace', 'Sensorial'],
    safetyProtocol: 'PRICK',
    bluePageCreator: false,
  },
];

let currentAdminToken: string | null = null;

export async function hasAdminPasscodeConfigured(): Promise<boolean> {
  const hash = await readJsonStorage<string | null>(ADMIN_PASSCODE_KEY, null);
  return !!hash;
}

export async function setAdminPasscode(passcode: string): Promise<boolean> {
  if (!passcode || passcode.length < 4) return false;
  // Store hashed passcode
  const encoder = new TextEncoder();
  const data = encoder.encode(`compatikink_admin_salt_${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  await writeJsonStorage(ADMIN_PASSCODE_KEY, hashHex);
  currentAdminToken = hashHex;
  return true;
}

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const storedHash = await readJsonStorage<string | null>(ADMIN_PASSCODE_KEY, null);
  if (!storedHash) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(`compatikink_admin_salt_${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  if (hashHex === storedHash) {
    currentAdminToken = hashHex;
    return true;
  }
  return false;
}

export function isAdminAuthenticated(): boolean {
  return !!currentAdminToken;
}

export function logoutAdmin(): void {
  currentAdminToken = null;
}

export async function getAllRegisteredProfiles(): Promise<AdminRegisteredProfile[]> {
  let catalog = await readJsonStorage<AdminRegisteredProfile[]>(ADMIN_PROFILES_KEY, MOCK_COMMUNITY_PROFILES);
  return catalog;
}

export async function toggleProfileVerification(profileId: string): Promise<AdminRegisteredProfile[]> {
  let catalog = await getAllRegisteredProfiles();
  const target = catalog.find((p) => p.id === profileId);
  if (target) {
    target.isVerified = !target.isVerified;
    await writeJsonStorage(ADMIN_PROFILES_KEY, catalog);
  }
  return catalog;
}

export async function toggleProfileStatus(profileId: string): Promise<AdminRegisteredProfile[]> {
  let catalog = await getAllRegisteredProfiles();
  const target = catalog.find((p) => p.id === profileId);
  if (target) {
    target.status = target.status === 'Activo' ? 'Suspendido' : 'Activo';
    await writeJsonStorage(ADMIN_PROFILES_KEY, catalog);
  }
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
      id: p.id,
      alias: p.alias,
      role: p.kinkRole,
      level: p.experienceLevel,
      isVerified: p.isVerified,
      status: p.status,
      hardLimitsCount: p.hardLimits.length,
      softLimitsCount: p.softLimits.length,
      fetishTags: p.fetishTags,
      safetyProtocol: p.safetyProtocol,
    })),
  };

  return JSON.stringify(report, null, 2);
}
