/**
 * Fetish Events & Munches Dataset — Feature 4
 * Directory of BDSM/Fetish events, educational workshops, and social Munches.
 */

export type EventType = 'Munch' | 'Workshop' | 'PlayParty' | 'VirtualMunch';

export interface FetishEvent {
  id: string;
  title: string;
  type: EventType;
  emoji: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  dressCode: string;
  description: string;
  safetyRules: string[];
  vibeTags: string[];
  maxCapacity: number;
}

export const FETISH_EVENTS: FetishEvent[] = [
  {
    id: 'evt_munch_obsidian',
    title: 'Munch Social Obsidiana — Primera Acogida',
    type: 'Munch',
    emoji: '☕',
    organizer: 'Colectivo Kink & SSC',
    date: '2026-08-15',
    time: '19:00 hrs',
    location: 'Café Cultural Discreto (Santiago / Centro)',
    isVirtual: false,
    dressCode: 'Vainilla / Casual discreto (Sin accesorios de escena)',
    description: 'Reunión social informal en lugar público para principiantes y veteranos del BDSM. Ideal para hacer preguntas, conocer la comunidad sin presión y conversar en un entorno seguro.',
    safetyRules: [
      'Respeto absoluto al anonimato y nombres de escena.',
      'Prohibido tomar fotografías o videos.',
      'Cero contacto físico no solicitado.',
      'SSC (Sano, Sensato y Consensuado) como regla base.',
    ],
    vibeTags: ['Principiantes', 'Charla', 'Lugar Público', 'Sin Costo'],
    maxCapacity: 30,
  },
  {
    id: 'evt_workshop_shibari',
    title: 'Taller de Shibari: Suspensiones de Seguridad & Anatomía',
    type: 'Workshop',
    emoji: '🪢',
    organizer: 'Dojo Rigger & Sensei',
    date: '2026-08-22',
    time: '16:00 - 20:00 hrs',
    location: 'Estudio Privado de Cuerdas',
    isVirtual: false,
    dressCode: 'Ropa deportiva cómoda de algodón (Evitar sintéticos deslizantes)',
    description: 'Taller práctico intensivo sobre anatomía del nervio radial, arneses de pecho seguros, gestión de presión y técnicas de corte de emergencia.',
    safetyRules: [
      'Traer tijeras de rescate (EMT shears).',
      'No se permite consumo de alcohol pre o durante el taller.',
      'Revisión previa de puntos de anclaje probados.',
    ],
    vibeTags: ['Educación', 'Shibari', 'Seguridad Médica', 'Práctico'],
    maxCapacity: 16,
  },
  {
    id: 'evt_playparty_latex_velvet',
    title: 'Noche de Escena: Latex & Terciopelo Noir',
    type: 'PlayParty',
    emoji: '👠',
    organizer: 'Círculo Oscuro Privado',
    date: '2026-08-29',
    time: '22:00 - 04:00 hrs',
    location: 'Lugar Privado con RSVP Aprobado',
    isVirtual: false,
    dressCode: 'Estricto: Latex, Cuero, Vinilo, Lencería Fina o Traje Formal Negro',
    description: 'Fiesta de juego privada con zonas delimitadas para impacto, Shibari y sensorial. Cuenta con Dungeon Monitors (DM) capacitados en primeros auxilios y gestión de consentimiento.',
    safetyRules: [
      'Consentimiento verbal activo antes de cualquier interacción.',
      'Uso obligatorio de palabras clave (Verde/Amarillo/Rojo).',
      'Cámaras de teléfonos selladas en la entrada.',
      'Zona de Aftercare permanente con hidratación y calma.',
    ],
    vibeTags: ['Fiesta Privada', 'Latex & Cuero', 'DM Presentes', 'Aftercare Zone'],
    maxCapacity: 50,
  },
  {
    id: 'evt_virtual_munch',
    title: 'Munch Virtual Global: Protocolos D/s en Relaciones a Distancia',
    type: 'VirtualMunch',
    emoji: '🎧',
    organizer: 'Compatikink Community',
    date: '2026-09-05',
    time: '21:00 hrs (GMT-4)',
    location: 'Sala E2EE Cifrada en Vivo',
    isVirtual: true,
    dressCode: 'Libre',
    description: 'Conversatorio online internacional sobre cómo mantener la sintonía D/s a distancia, creación de contratos digitales efímeros y rituales de servicio remotos.',
    safetyRules: [
      'Alias o apodos permitidos.',
      'Micrófono opcional; canal de chat cifrado habilitado.',
    ],
    vibeTags: ['Online', 'Internacional', 'D/s a Distancia', 'E2EE'],
    maxCapacity: 100,
  },
];
