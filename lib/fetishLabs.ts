/**
 * Fetish Labs — experimental preview modules (gated, not core).
 *
 * Marketplace Dark / Foot / Tribute / Sissy training.
 * All intimate state stays in the local vault (`fetish_lab_*` → ck1: when unlocked).
 * Never upload plaintext prefs, genital photos, tribute media, or marketplace PII.
 *
 * Adults 18+ only. Consensual roleplay. No illegal goods. No public galleries.
 */

import type { ActivityResponse, Rating, RolePreference } from '@/types';
import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export const FETISH_LAB_ADULTS_ONLY = true;
export const FETISH_LAB_MIN_AGE = 18;

export const FETISH_LAB_KEYS = {
  marketplaceWishlist: 'fetish_lab_marketplace_wishlist_v1',
  footInitiator: 'fetish_lab_foot_initiator_v1',
  footGuest: 'fetish_lab_foot_guest_v1',
  tributeThread: 'fetish_lab_tribute_thread_v1',
  sissyProtocol: 'fetish_lab_sissy_protocol_v1',
} as const;

/** Catalog items that must never appear (criminal / non-consensual). */
export const MARKETPLACE_FORBIDDEN_TAGS = [
  'drugs',
  'weapons',
  'stolen',
  'csam',
  'nonconsensual',
  'darknet',
  'silkroad',
] as const;

export type MarketplaceCategory = 'toys' | 'gear' | 'care' | 'shipping';

export interface MarketplaceCatalogItem {
  id: string;
  name: string;
  category: MarketplaceCategory;
  blurb: string;
  discreetNote: string;
  legal: true;
  /** Reference only — no checkout in this slice. */
  typicalRange: string;
}

export const MARKETPLACE_CATALOG: MarketplaceCatalogItem[] = [
  {
    id: 'mk_silicone_toy',
    name: 'Juguete de silicona médica',
    category: 'toys',
    blurb: 'Cuerpo-safe, hervible. Compara materiales con tu pareja antes de comprar fuera de la app.',
    discreetNote: 'Empaque neutro, sin logos fetish en el sobre.',
    legal: true,
    typicalRange: 'ref. tienda adulta',
  },
  {
    id: 'mk_rope_6mm',
    name: 'Cuerda tratada 6 mm (shibari)',
    category: 'gear',
    blurb: 'Yute o algodón suavizado. Tijeras de rescate siempre a mano.',
    discreetNote: 'Caja genérica de “artes textiles”.',
    legal: true,
    typicalRange: 'ref. artesano',
  },
  {
    id: 'mk_cuffs_leather',
    name: 'Esposas de cuero con cierre de seguridad',
    category: 'gear',
    blurb: 'Hebilla o clip de liberación rápida. Nunca dejar a alguien atado a solas.',
    discreetNote: 'Sobre acolchado opaco.',
    legal: true,
    typicalRange: 'ref. marroquinería',
  },
  {
    id: 'mk_latex_aid',
    name: 'Ayuda para vestir látex (silicona)',
    category: 'care',
    blurb: 'Spray o gel de silicona para colocación. Ver también /latex-guide.',
    discreetNote: 'Etiqueta de “cuidado de prendas”.',
    legal: true,
    typicalRange: 'ref. cuidado',
  },
  {
    id: 'mk_aftercare_kit',
    name: 'Kit de aftercare (manta, agua, snack)',
    category: 'care',
    blurb: 'Hidratación y calor post-escena. No es consejo médico.',
    discreetNote: 'Bolsa de “bienestar en casa”.',
    legal: true,
    typicalRange: 'hogar',
  },
  {
    id: 'mk_foot_oil',
    name: 'Aceite de masaje para pies',
    category: 'care',
    blurb: 'Para servicio de masaje consensuado entre adultos. Parche en antebrazo si hay piel sensible.',
    discreetNote: 'Frasco de cosmética, sin copy fetish.',
    legal: true,
    typicalRange: 'cosmética',
  },
  {
    id: 'mk_stockings',
    name: 'Medias / lencería adulta',
    category: 'gear',
    blurb: 'Talla y tejido acordados en privado. Solo adultos 18+.',
    discreetNote: 'Sobre de “textil”.',
    legal: true,
    typicalRange: 'lencería',
  },
  {
    id: 'mk_mailer',
    name: 'Sobre opaco de envío discreto',
    category: 'shipping',
    blurb: 'Cómo pedir a un vendedor legal: sin remitente fetish, sin firma en portería si es posible.',
    discreetNote: 'Esto es UX de privacidad, no un marketplace clandestino.',
    legal: true,
    typicalRange: 'papelería',
  },
];

export interface FetishLabActivity {
  id: string;
  name: string;
  description: string;
  safetyTip: string;
  adultsOnly: true;
}

export const FOOT_ACTIVITIES: FetishLabActivity[] = [
  {
    id: 'ff_massage',
    name: 'Masaje de pies',
    description: 'Masaje consensuado, presión y duración acordadas.',
    safetyTip: 'Pregunta zonas sensibles. Para si hay dolor o hormigueo.',
    adultsOnly: true,
  },
  {
    id: 'ff_worship',
    name: 'Adoración de pies',
    description: 'Besos, caricias o servicio verbal. Solo entre adultos que consienten.',
    safetyTip: 'Límites de higiene y de qué está permitido (toque vs verbal).',
    adultsOnly: true,
  },
  {
    id: 'ff_stockings',
    name: 'Medias y texturas',
    description: 'Lencería / medias como foco sensorial, no como disfraz de menor.',
    safetyTip: 'Tela y duración. Estilo inequívocamente adulto.',
    adultsOnly: true,
  },
  {
    id: 'ff_tickle',
    name: 'Cosquillas en pies',
    description: 'Puede ser límite duro. Negociar señal de parada.',
    safetyTip: 'Muchas personas lo marcan hard limit. Respeta el no.',
    adultsOnly: true,
  },
  {
    id: 'ff_pedicure',
    name: 'Pedicura como servicio',
    description: 'Cuidado de uñas y cutículas como acto de servicio adulto.',
    safetyTip: 'No es consejo médico ni podológico profesional.',
    adultsOnly: true,
  },
  {
    id: 'ff_scent',
    name: 'Juego de aroma (calcetines / pies)',
    description: 'Solo si ambos lo marcan positivo. Higiene acordada.',
    safetyTip: 'Puede ser hard limit. Sin presión.',
    adultsOnly: true,
  },
  {
    id: 'ff_photos_local',
    name: 'Fotos de pies (solo dispositivo)',
    description: 'Intención de compartir en privado. La app no sube ni aloja media.',
    safetyTip: 'Consentimiento para cada toma. Prohibido redistribuir.',
    adultsOnly: true,
  },
  {
    id: 'ff_trample_light',
    name: 'Pisoteo muy suave (suelo, no peso completo)',
    description: 'Presión ligera sobre zonas acordadas. Riesgo de lesión si se improvisa.',
    safetyTip: 'Nunca sobre pecho/cuello. Palabra de seguridad. Aftercare.',
    adultsOnly: true,
  },
];

export type TributeStatus = 'draft' | 'requested' | 'accepted' | 'declined' | 'completed';

export interface TributeMessage {
  id: string;
  fromRole: 'initiator' | 'guest';
  body: string;
  createdAt: string;
}

export interface TributeThread {
  id: string;
  status: TributeStatus;
  prompt: string;
  consentAdults: boolean;
  consentNoRedistribute: boolean;
  consentRevocable: boolean;
  /** Local reminder only — never a CDN URL. */
  mediaStaysOnDevice: true;
  messages: TributeMessage[];
  updatedAt: string;
}

export const TRIBUTE_DEFAULT_PROMPT =
  'Si ambos consentís, el invitado puede responder en texto cifrado en esta bóveda. Sin galería pública. Sin subida a servidores.';

export interface SissyProtocolTask {
  id: string;
  title: string;
  detail: string;
  durationMin: number;
  aftercareHint: string;
  adultsOnly: true;
}

/** Consensual adult feminization / presentation protocol. No ageplay. */
export const SISSY_PROTOCOL_TASKS: SissyProtocolTask[] = [
  {
    id: 'st_safeword',
    title: 'Ensayo de palabra de seguridad',
    detail: 'Repetid en voz alta la señal de parada y qué pasa al usarla. Adultos 18+.',
    durationMin: 5,
    aftercareHint: 'Agradecer la claridad. Agua.',
    adultsOnly: true,
  },
  {
    id: 'st_posture',
    title: 'Postura acordada (10 min)',
    detail: 'Postura de presentación en casa, ropa adulta acordada de antemano.',
    durationMin: 10,
    aftercareHint: 'Estirar cuello y hombros.',
    adultsOnly: true,
  },
  {
    id: 'st_journal',
    title: 'Nota de diario para la pareja',
    detail: 'Un párrafo cifrado en bóveda: qué se sintió bien, qué no. No es humillación pública.',
    durationMin: 10,
    aftercareHint: 'Leer juntos si ambos quieren.',
    adultsOnly: true,
  },
  {
    id: 'st_outfit',
    title: 'Prenda adulta ya negociada',
    detail: 'Solo prendas de adulto ya negociadas (talla y estilo de persona mayor de edad).',
    durationMin: 15,
    aftercareHint: 'Cambiarse a ropa cómoda al cerrar.',
    adultsOnly: true,
  },
  {
    id: 'st_voice',
    title: 'Ensayo de voz / trato (opcional)',
    detail: 'Pronombres y tono acordados entre dos adultos. Se puede saltar sin culpa.',
    durationMin: 8,
    aftercareHint: 'Volver al registro cotidiano si apetece.',
    adultsOnly: true,
  },
  {
    id: 'st_aftercare',
    title: 'Cierre de aftercare (obligatorio)',
    detail: 'Agua, manta, “¿hablamos o silencio?”. El protocolo no termina en la tarea.',
    durationMin: 15,
    aftercareHint: 'Contacto suave o espacio, según pidan.',
    adultsOnly: true,
  },
];

export type SissyTaskStatus = 'pending' | 'done' | 'skipped';

export interface SissyProtocolState {
  taskStatus: Record<string, SissyTaskStatus>;
  notes: string;
  aftercareDone: boolean;
  updatedAt: string;
}

export type FetishCompareSection =
  | 'mutual_match'
  | 'explore_together'
  | 'hard_limit_conflict'
  | 'role_mismatch'
  | 'initiator_only'
  | 'guest_only';

export interface FetishCompareItem {
  activityId: string;
  name: string;
  section: FetishCompareSection;
}

const POSITIVE: Rating[] = ['curious', 'like', 'love'];

function isPositive(rating: Rating): boolean {
  return POSITIVE.includes(rating);
}

/**
 * Same classification spirit as lib/compatibility.ts, without touching that file
 * or requiring activities in the main catalog (keeps the core questionnaire intact).
 */
export function classifyFetishPair(
  initiator: ActivityResponse,
  guest: ActivityResponse
): FetishCompareSection {
  const iRating = initiator.rating;
  const gRating = guest.rating;

  if (iRating === 'hard_limit' || gRating === 'hard_limit') {
    if (
      (iRating === 'hard_limit' && isPositive(gRating)) ||
      (gRating === 'hard_limit' && isPositive(iRating))
    ) {
      return 'hard_limit_conflict';
    }
  }

  const iPositive = isPositive(iRating);
  const gPositive = isPositive(gRating);

  if ((iRating === 'curious' && gPositive) || (gRating === 'curious' && iPositive)) {
    return 'explore_together';
  }

  if (iPositive && gPositive) {
    const roleClash =
      initiator.role !== 'flexible' &&
      guest.role !== 'flexible' &&
      initiator.role !== guest.role &&
      initiator.role !== 'both' &&
      guest.role !== 'both';
    const intensityGap = Math.abs(initiator.intensity - guest.intensity) >= 2;
    if (roleClash || intensityGap) return 'role_mismatch';
    return 'mutual_match';
  }

  if (iPositive && !gPositive) return 'initiator_only';
  if (gPositive && !iPositive) return 'guest_only';
  return 'initiator_only';
}

export function compareFetishResponses(
  activities: FetishLabActivity[],
  initiatorResponses: ActivityResponse[],
  guestResponses: ActivityResponse[]
): FetishCompareItem[] {
  const guestMap = new Map(guestResponses.map((r) => [r.activityId, r]));
  const items: FetishCompareItem[] = [];

  for (const initiator of initiatorResponses) {
    const guest = guestMap.get(initiator.activityId);
    if (!guest) continue;
    const activity = activities.find((a) => a.id === initiator.activityId);
    if (!activity) continue;

    const iPositive = isPositive(initiator.rating);
    const gPositive = isPositive(guest.rating);
    if (!iPositive && !gPositive) continue;

    items.push({
      activityId: initiator.activityId,
      name: activity.name,
      section: classifyFetishPair(initiator, guest),
    });
  }

  return items;
}

export function defaultFootResponse(activityId: string): ActivityResponse {
  return {
    activityId,
    rating: 'not_interested',
    role: 'flexible',
    intensity: 3,
  };
}

export function emptySissyState(): SissyProtocolState {
  return {
    taskStatus: Object.fromEntries(SISSY_PROTOCOL_TASKS.map((t) => [t.id, 'pending' as SissyTaskStatus])),
    notes: '',
    aftercareDone: false,
    updatedAt: new Date().toISOString(),
  };
}

export function emptyTributeThread(): TributeThread {
  return {
    id: 'local-tribute',
    status: 'draft',
    prompt: TRIBUTE_DEFAULT_PROMPT,
    consentAdults: false,
    consentNoRedistribute: false,
    consentRevocable: false,
    mediaStaysOnDevice: true,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
}

export function isMarketplaceItemAllowed(item: MarketplaceCatalogItem): boolean {
  if (item.legal !== true) return false;
  const hay = `${item.id} ${item.name} ${item.blurb}`.toLowerCase();
  return !MARKETPLACE_FORBIDDEN_TAGS.some((tag) => hay.includes(tag));
}

const MINOR_LANGUAGE = [
  'menor',
  'minor',
  'child',
  'kid',
  'schoolgirl',
  'schoolboy',
  'niña',
  'niño',
  'bebe',
  'bebé',
  'baby',
  'lolita',
  'underage',
];

export function copyLooksAdultOnly(text: string): boolean {
  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return !MINOR_LANGUAGE.some((w) => n.includes(w.normalize('NFD').replace(/\p{M}/gu, '')));
}

export async function loadWishlistIds(): Promise<string[]> {
  return readJsonStorage<string[]>(FETISH_LAB_KEYS.marketplaceWishlist, []);
}

export async function saveWishlistIds(ids: string[]): Promise<void> {
  await writeJsonStorage(FETISH_LAB_KEYS.marketplaceWishlist, ids);
}

export async function loadFootResponses(side: 'initiator' | 'guest'): Promise<ActivityResponse[]> {
  const key = side === 'initiator' ? FETISH_LAB_KEYS.footInitiator : FETISH_LAB_KEYS.footGuest;
  const fallback = FOOT_ACTIVITIES.map((a) => defaultFootResponse(a.id));
  return readJsonStorage<ActivityResponse[]>(key, fallback);
}

export async function saveFootResponses(
  side: 'initiator' | 'guest',
  responses: ActivityResponse[]
): Promise<void> {
  const key = side === 'initiator' ? FETISH_LAB_KEYS.footInitiator : FETISH_LAB_KEYS.footGuest;
  await writeJsonStorage(key, responses);
}

export async function loadTributeThread(): Promise<TributeThread> {
  return readJsonStorage<TributeThread>(FETISH_LAB_KEYS.tributeThread, emptyTributeThread());
}

export async function saveTributeThread(thread: TributeThread): Promise<void> {
  await writeJsonStorage(FETISH_LAB_KEYS.tributeThread, {
    ...thread,
    mediaStaysOnDevice: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function loadSissyState(): Promise<SissyProtocolState> {
  return readJsonStorage<SissyProtocolState>(FETISH_LAB_KEYS.sissyProtocol, emptySissyState());
}

export async function saveSissyState(state: SissyProtocolState): Promise<void> {
  await writeJsonStorage(FETISH_LAB_KEYS.sissyProtocol, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

export function makeFootResponse(
  activityId: string,
  rating: Rating,
  role: RolePreference,
  intensity: ActivityResponse['intensity']
): ActivityResponse {
  return { activityId, rating, role, intensity };
}
