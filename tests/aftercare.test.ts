// @ts-nocheck
import { 
  generateNoxAftercareAdvice, 
  scheduleAftercareReminder, 
  getPendingAftercareReminders, 
  markReminderCompleted,
  saveAftercareCheckin,
  getAftercareHistory,
  AftercareCheckin
} from '../lib/aftercare';


// Mock storage
jest.mock('../lib/cryptoVault', () => {
  let storage: Record<string, any> = {};
  return {
    readJsonStorage: jest.fn(async (key: string, def: any) => storage[key] || def),
    writeJsonStorage: jest.fn(async (key: string, val: any) => { storage[key] = val; })
  };
});

describe('Aftercare System', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Nox Advice Generator', () => {
    it('generates advice for dehydration', () => {
      const advice = generateNoxAftercareAdvice({ hydrationLevel: 1 });
      expect(advice).toContain('beber agua');
    });

    it('generates advice for low energy', () => {
      const advice = generateNoxAftercareAdvice({ energyLevel: 2 });
      expect(advice).toContain('necesita descanso');
    });

    it('generates advice for afterdrop', () => {
      const advice = generateNoxAftercareAdvice({ afterdropSymptoms: ['Tristeza repentina'] });
      expect(advice).toContain('síntomas de afterdrop');
    });

    it('generates advice for low connection', () => {
      const advice = generateNoxAftercareAdvice({ partnerConnectionRating: 1 });
      expect(advice).toContain('un abrazo prolongado');
    });

    it('generates positive advice when everything is fine', () => {
      const advice = generateNoxAftercareAdvice({ 
        energyLevel: 5, 
        hydrationLevel: 5, 
        physicalComfort: 5, 
        partnerConnectionRating: 5, 
        afterdropSymptoms: ['Ninguno'] 
      });
      expect(advice).toContain('Todo parece estar en equilibrio');
    });
  });

  describe('Reminders and Checkins', () => {
    it('schedules a reminder', async () => {
      const reminder = await scheduleAftercareReminder('sess_1', 'Test Session', 12);
      expect(reminder.hoursAfter).toBe(12);
      expect(reminder.completed).toBe(false);
      expect(reminder.sessionId).toBe('sess_1');
    });

    it('gets pending reminders', async () => {
      await scheduleAftercareReminder('sess_1', 'Test Session', 12);
      const pending = await getPendingAftercareReminders();
      expect(pending.length).toBeGreaterThan(0);
    });

    it('marks a reminder as completed', async () => {
      const reminder = await scheduleAftercareReminder('sess_1', 'Test Session', 12);
      await markReminderCompleted(reminder.id);
      const pending = await getPendingAftercareReminders();
      expect(pending.find(r => r.id === reminder.id)).toBeUndefined();
    });

    it('saves and retrieves checkin history', async () => {
      const checkin: AftercareCheckin = {
        id: 'chk_1',
        timestamp: new Date().toISOString(),
        scheduledForHours: 12,
        energyLevel: 4,
        moodLevel: 4,
        hydrationLevel: 4,
        physicalComfort: 4,
        afterdropSymptoms: ['Ninguno'],
        partnerConnectionRating: 5,
        noxAdvice: 'Test advice'
      };

      await saveAftercareCheckin(checkin);
      const history = await getAftercareHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('chk_1');
    });
  });
});
