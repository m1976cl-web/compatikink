import AsyncStorage from '@react-native-async-storage/async-storage';

const FANTASY_KEY = 'fantasy_match_responses_v1';

export interface FantasyItem {
  id: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
}

export interface FantasyMatchResult {
  fantasyId: string;
  title: string;
  emoji: string;
  category: string;
  myRating: 'yes' | 'maybe' | 'no';
  partnerRating: 'yes' | 'maybe' | 'no';
  isMatch: boolean;
}

export const FANTASIES_DATA: FantasyItem[] = [
  { id: 'f-1', title: 'Vendas en los ojos & Privación Sensorial', category: 'Sensorial', emoji: '🕯️', description: 'Explorar caricias y estímulos sin ver lo que ocurre.' },
  { id: 'f-2', title: 'Ataduras de Muñecas / Shibari Suave', category: 'Bondage', emoji: '🪢', description: 'Restricción física de extremidades con cuerda tratada.' },
  { id: 'f-3', title: 'Juegos de Roles & Escenarios', category: 'Roleplay', emoji: '🎭', description: 'Adoptar personajes y dinámicas teatrales durante la sesión.' },
  { id: 'f-4', title: 'Denegación de Orgásmo & Control', category: 'Control', emoji: '🗝️', description: 'Retrasar o controlar el clímax según la guía del Dominante.' },
  { id: 'f-5', title: 'Juegos con Hielo & Cera Tibia', category: 'Térmico', emoji: '❄️', description: 'Sensación de contraste de temperatura en la piel.' },
  { id: 'f-6', title: 'Impacto Suave (Spanking / Azotes)', category: 'Impacto', emoji: '🍑', description: 'Estimulación de impacto con palmas o remates acolchados.' },
  { id: 'f-7', title: 'Uso de Dispositivos de Castidad', category: 'Castidad', emoji: '🔒', description: 'Restricción del acceso erótico mediante candado o app.' },
  { id: 'f-8', title: 'Aftercare Extendido & Manta Térmica', category: 'Aftercare', emoji: '🪷', description: 'Ritual de reconexión de 30 minutos post-escena.' },
];

export async function getSavedRatings(): Promise<Record<string, 'yes' | 'maybe' | 'no'>> {
  const raw = await AsyncStorage.getItem(FANTASY_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveRating(fantasyId: string, rating: 'yes' | 'maybe' | 'no'): Promise<void> {
  const current = await getSavedRatings();
  current[fantasyId] = rating;
  await AsyncStorage.setItem(FANTASY_KEY, JSON.stringify(current));
}

export function calculateDoubleBlindMatches(
  myRatings: Record<string, 'yes' | 'maybe' | 'no'>,
  partnerRatings: Record<string, 'yes' | 'maybe' | 'no'>
): FantasyMatchResult[] {
  const results: FantasyMatchResult[] = [];

  FANTASIES_DATA.forEach((f) => {
    const myR = myRatings[f.id];
    const partnerR = partnerRatings[f.id];

    // Double-blind rule: ONLY show match if BOTH said 'yes' or 'maybe'.
    // If ANY partner said 'no', it is NEVER revealed to prevent judgment.
    const isMatch = (myR === 'yes' || myR === 'maybe') && (partnerR === 'yes' || partnerR === 'maybe');

    if (isMatch) {
      results.push({
        fantasyId: f.id,
        title: f.title,
        emoji: f.emoji,
        category: f.category,
        myRating: myR,
        partnerRating: partnerR,
        isMatch: true,
      });
    }
  });

  return results;
}
