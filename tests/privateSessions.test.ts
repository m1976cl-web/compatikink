declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

import { 
  PrivateSession, 
  SessionGearItem, 
  createEmptyPrivateSession, 
  getPrivateSessions, 
  savePrivateSession, 
  deletePrivateSession, 
  getPrivateSessionById 
} from '../lib/privateSessions';

// Mock storage
jest.mock('../lib/cryptoVault', () => {
  let store: any = null;
  return {
    readJsonStorage: jest.fn(async (key: string) => store),
    writeJsonStorage: jest.fn(async (key: string, data: any) => { store = data; })
  };
});

describe('Private Sessions Logic', () => {
  let mockDateString: string;

  beforeEach(() => {
    mockDateString = new Date().toISOString().split('T')[0];
    jest.clearAllMocks();
  });

  it('should create an empty private session correctly', () => {
    const session = createEmptyPrivateSession();
    expect(session.id).toBeDefined();
    expect(session.title).toBe('');
    expect(session.date).toBe(mockDateString);
    expect(session.location).toBe('');
    expect(session.feelings).toEqual([]);
    expect(session.gearInventory).toEqual([]);
    expect(session.rating1to7).toBeUndefined();
  });

  it('should test gear packing status calculation', () => {
    const session = createEmptyPrivateSession();
    const item1: SessionGearItem = { id: '1', name: 'Rope', category: 'Ataduras', packedOut: true, packedIn: false };
    const item2: SessionGearItem = { id: '2', name: 'Blindfold', category: 'Sensaciones', packedOut: true, packedIn: true };
    
    session.gearInventory = [item1, item2];
    
    const unverifiedCount = (session.gearInventory || []).filter(g => !g.packedIn).length;
    expect(unverifiedCount).toBe(1);

    // After packing
    if (session.gearInventory) {
      session.gearInventory[0].packedIn = true;
      expect(session.gearInventory.filter(g => !g.packedIn).length).toBe(0);
    }
  });

  it('should validate debrief feelings', () => {
    const session = createEmptyPrivateSession();
    
    const selectedFeelings = ['Subspace', 'Vulnerable'];
    session.feelings = selectedFeelings;
    
    expect(session.feelings).toContain('Subspace');
    expect(session.feelings?.length).toBe(2);
  });

  it('should save and retrieve a session (ZK Storage Round-Trip)', async () => {
    const session = createEmptyPrivateSession();
    session.title = 'Test Session';
    
    // Save
    await savePrivateSession(session);
    
    // Retrieve
    const retrieved = await getPrivateSessionById(session.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Test Session');
    
    // List
    const all = await getPrivateSessions();
    expect(all.length).toBe(1);
    
    // Delete
    await deletePrivateSession(session.id);
    const afterDelete = await getPrivateSessions();
    expect(afterDelete.length).toBe(0);
  });
});
