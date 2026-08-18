import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface AftercareCheckin {
  id: string;
  sessionId?: string;
  sessionTitle?: string;
  timestamp: string; // ISO
  scheduledForHours: number; // 12, 24, 48
  energyLevel: number; // 1 to 5
  moodLevel: number; // 1 to 5
  hydrationLevel: number; // 1 to 5
  physicalComfort: number; // 1 to 5
  afterdropSymptoms: string[];
  partnerConnectionRating: number; // 1 to 5
  notes?: string;
  noxAdvice: string;
}

export interface ScheduledAftercareReminder {
  id: string;
  sessionId?: string;
  sessionTitle: string;
  reminderDate: string; // ISO string
  hoursAfter: number; // 12, 24, 48
  completed: boolean;
}

const AFTERCARE_HISTORY_KEY = 'aftercare_checkins_history_v1';
const AFTERCARE_REMINDERS_KEY = 'aftercare_scheduled_reminders_v1';

export function generateNoxAftercareAdvice(checkin: Partial<AftercareCheckin>): string {
  let advice = "🌿 Nox: Observo tus respuestas. ";
  
  if ((checkin.hydrationLevel || 5) <= 2) {
    advice += "Recuerda beber agua pronto, la hidratación es vital post-sesión. ";
  }
  
  if ((checkin.energyLevel || 5) <= 2 || (checkin.physicalComfort || 5) <= 2) {
    advice += "Parece que tu cuerpo necesita descanso. Tómate un tiempo en un lugar cómodo y abrigado. ";
  }

  const afterdrop = checkin.afterdropSymptoms || [];
  if (afterdrop.length > 0 && !afterdrop.includes('Ninguno')) {
    advice += "Detecto síntomas de afterdrop. Es completamente normal. Comunícate con tu pareja si te sientes vulnerable. ";
  }
  
  if ((checkin.partnerConnectionRating || 5) <= 2) {
    advice += "Si sientes desconexión, un abrazo prolongado o un check-in de 5 minutos con tu partner puede ayudar mucho. ";
  }

  if (advice === "🌿 Nox: Observo tus respuestas. ") {
    advice += "Todo parece estar en equilibrio. Sigue cuidándote. 💜";
  }

  return advice;
}

export async function saveAftercareCheckin(checkin: AftercareCheckin): Promise<void> {
  const history = await getAftercareHistory();
  history.push(checkin);
  await writeJsonStorage(AFTERCARE_HISTORY_KEY, history);
}

export async function getAftercareHistory(): Promise<AftercareCheckin[]> {
  return await readJsonStorage<AftercareCheckin[]>(AFTERCARE_HISTORY_KEY, []);
}

export async function scheduleAftercareReminder(sessionId: string, sessionTitle: string, hoursAfter: number): Promise<ScheduledAftercareReminder> {
  const reminders = await readJsonStorage<ScheduledAftercareReminder[]>(AFTERCARE_REMINDERS_KEY, []);
  
  const reminderDate = new Date();
  reminderDate.setHours(reminderDate.getHours() + hoursAfter);
  
  const newReminder: ScheduledAftercareReminder = {
    id: `reminder_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
    sessionId,
    sessionTitle,
    reminderDate: reminderDate.toISOString(),
    hoursAfter,
    completed: false
  };
  
  reminders.push(newReminder);
  await writeJsonStorage(AFTERCARE_REMINDERS_KEY, reminders);
  return newReminder;
}

export async function getPendingAftercareReminders(): Promise<ScheduledAftercareReminder[]> {
  const reminders = await readJsonStorage<ScheduledAftercareReminder[]>(AFTERCARE_REMINDERS_KEY, []);
  return reminders.filter(r => !r.completed);
}

export async function markReminderCompleted(id: string): Promise<void> {
  const reminders = await readJsonStorage<ScheduledAftercareReminder[]>(AFTERCARE_REMINDERS_KEY, []);
  const idx = reminders.findIndex(r => r.id === id);
  if (idx !== -1) {
    reminders[idx].completed = true;
    await writeJsonStorage(AFTERCARE_REMINDERS_KEY, reminders);
  }
}
