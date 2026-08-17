import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { VirtualDateSession, VirtualIcebreakerPrompt } from '@/types/profileEnhancements';

const VIRTUAL_DATES_STORAGE_KEY = 'virtual_date_sessions_v1';

export const DEFAULT_ICEBREAKERS: VirtualIcebreakerPrompt[] = [
  {
    id: 'prompt_1',
    category: 'vulnerability',
    question: '¿Cuál fue la primera fantasía o curiosidad que recuerdas haber descubierto y que no sueles compartir fácilmente?',
    followUpPrompt: 'Comparte qué emoción sentiste al darte cuenta de esa curiosidad.',
  },
  {
    id: 'prompt_2',
    category: 'fantasies',
    question: 'Si tuviéramos un escenario de exploración 100% seguro con consentimiento absoluto hoy, ¿qué dinámica te gustaría intentar primero?',
    followUpPrompt: 'Especifica la intensidad esperada del 1 al 5.',
  },
  {
    id: 'prompt_3',
    category: 'boundaries',
    question: '¿Cuál es tu límite duro (Hard Limit) más importante y por qué es fundamental que se respete sin cuestionamiento?',
    followUpPrompt: 'Asegúrense de confirmar que ambos comprenden este límite.',
  },
  {
    id: 'prompt_4',
    category: 'aftercare',
    question: 'Después de una experiencia intensa o vulnerable, ¿qué tipo de cuidado posterior (Aftercare) te hace sentir verdaderamente a salvo y reconectado/a?',
    followUpPrompt: 'Mencionen detalles específicos: hidratación, contacto físico, espacio en silencio, etc.',
  },
  {
    id: 'prompt_5',
    category: 'playful',
    question: 'Si pudieras definir nuestra energía mutua con un solo símbolo o insignia fetichista de la app, ¿cuál elegirías y por qué?',
    followUpPrompt: 'Ambos respondan simultáneamente.',
  },
];

export async function loadVirtualDateSessions(): Promise<VirtualDateSession[]> {
  return readJsonStorage<VirtualDateSession[]>(VIRTUAL_DATES_STORAGE_KEY, []);
}

export async function createVirtualDateSession(
  initiatorNickname: string,
  partnerNickname: string
): Promise<VirtualDateSession> {
  const sessions = await loadVirtualDateSessions();

  const session: VirtualDateSession = {
    id: `vdate_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    initiatorNickname,
    partnerNickname,
    createdAt: new Date().toISOString(),
    status: 'active',
    currentSafeword: 'green',
    currentStepIndex: 0,
  };

  sessions.push(session);
  await writeJsonStorage(VIRTUAL_DATES_STORAGE_KEY, sessions);
  return session;
}

export async function updateVirtualDateSafeword(
  sessionId: string,
  safeword: 'green' | 'yellow' | 'red'
): Promise<VirtualDateSession | null> {
  const sessions = await loadVirtualDateSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  session.currentSafeword = safeword;
  if (safeword === 'red') {
    session.status = 'safeword_paused';
  } else if (session.status === 'safeword_paused') {
    session.status = 'active';
  }

  await writeJsonStorage(VIRTUAL_DATES_STORAGE_KEY, sessions);
  return session;
}

export async function advanceVirtualDateStep(
  sessionId: string
): Promise<VirtualDateSession | null> {
  const sessions = await loadVirtualDateSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  if (session.currentStepIndex < DEFAULT_ICEBREAKERS.length - 1) {
    session.currentStepIndex++;
  } else {
    session.status = 'completed';
  }

  await writeJsonStorage(VIRTUAL_DATES_STORAGE_KEY, sessions);
  return session;
}
