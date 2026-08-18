import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface SessionGearItem {
  id: string;
  name: string;
  category: string;
  photoUri?: string;
  packedOut: boolean;
  packedIn: boolean;
}

export interface PrivateSession {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  participants?: string;
  roles?: string[];
  activities?: string[];
  sensations?: string[];
  feelings?: string[];
  rating1to7?: number;
  wouldRepeat?: 'yes' | 'no' | 'maybe';
  notes?: string;
  gearInventory?: SessionGearItem[];
  prePhotoUri?: string;
  postPhotoUri?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'private_sessions_list_v1';

export async function getPrivateSessions(): Promise<PrivateSession[]> {
  const data = await readJsonStorage<PrivateSession[]>(STORAGE_KEY, []);
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export async function getPrivateSessionById(id: string): Promise<PrivateSession | null> {
  const sessions = await getPrivateSessions();
  return sessions.find(s => s.id === id) || null;
}

export async function savePrivateSession(session: PrivateSession): Promise<void> {
  const sessions = await getPrivateSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.push({ ...session, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  await writeJsonStorage(STORAGE_KEY, sessions);
}

export async function deletePrivateSession(id: string): Promise<void> {
  const sessions = await getPrivateSessions();
  const filtered = sessions.filter(s => s.id !== id);
  await writeJsonStorage(STORAGE_KEY, filtered);
}

export function createEmptyPrivateSession(): PrivateSession {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    participants: '',
    roles: [],
    activities: [],
    sensations: [],
    feelings: [],
    rating1to7: undefined,
    wouldRepeat: undefined,
    notes: '',
    gearInventory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
