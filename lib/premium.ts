import AsyncStorage from '@react-native-async-storage/async-storage';

const PREMIUM_KEY = 'user_is_premium';

export async function isPremiumUser(): Promise<boolean> {
  const val = await AsyncStorage.getItem(PREMIUM_KEY);
  return val === 'true';
}

export async function setPremiumStatus(isPremium: boolean): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_KEY, isPremium ? 'true' : 'false');
}

export const PREMIUM_FEATURES = [
  { id: 'poly_matrix', name: '👥 Matriz Grupal & Poliamor (3+ personas)', desc: 'Comparación cruzada para triadas y grupos' },
  { id: 'ai_recommender', name: '🤖 Recomendador IA de Escenas', desc: 'Sugerencias personalizadas basadas en debriefs' },
  { id: 'unlimited_dating', name: '💬 Chat Directo Ilimitado en Dating', desc: 'Conecta sin restricciones con perfiles compatibles' },
  { id: 'full_analytics', name: '📈 Analítica Emocional Avanzada', desc: 'Gráficos históricos de subspace y aftercare' },
  { id: 'custom_themes', name: '🎨 Todos los Temas Visuales Exclusivos', desc: 'Acceso a paletas Cyberpunk, Pasión y Esmeralda' },
];
