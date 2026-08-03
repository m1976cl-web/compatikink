import { getCurrentProfile, getAllSceneAgreements, getWishlist } from './storage';
import { ACTIVITIES } from '@/data/activities';

export interface SceneRecommendation {
  id: string;
  title: string;
  emoji: string;
  durationMinutes: number;
  intensity: 'Suave' | 'Moderada' | 'Intensa';
  category: string;
  activities: { name: string; durationMinutes: number; notes: string }[];
  suggestedPlaylist: string;
  aftercarePlan: string;
  matchReason: string;
}

export async function generateAISceneRecommendations(): Promise<SceneRecommendation[]> {
  const profile = await getCurrentProfile();
  const wishlist = await getWishlist();
  const wishlistActivityIds = wishlist.map((w: any) => (typeof w === 'string' ? w : w.activityId));
  const userWishlistActivities = ACTIVITIES.filter((a) => wishlistActivityIds.includes(a.id));
  const wishlistNames = userWishlistActivities.map((a) => a.name);

  return [
    {
      id: 'rec-1',
      title: 'Sesión Sensorial & Desconexión Profunda',
      emoji: '🕯️',
      durationMinutes: 45,
      intensity: 'Suave',
      category: 'Sensorial & Intimidad',
      activities: [
        { name: 'Vendas en los ojos & Sensación Térmica', durationMinutes: 15, notes: 'Usar antifaz de seda y velas de soya de bajo punto de fusión.' },
        { name: 'Masaje Sensotáctil con Aceites', durationMinutes: 20, notes: 'Presión progresiva en espalda y hombros.' },
        { name: 'Cuidado Posterior (Aftercare)', durationMinutes: 10, notes: 'Manta térmica, té tibio de manzanilla y abrazos sin prisas.' },
      ],
      suggestedPlaylist: 'Ambiente Zen & Frecuencias Solfeggio',
      aftercarePlan: 'Rehidratación con agua de coco y check-in emocional a los 15 minutos.',
      matchReason: 'Basado en tus preferencias de baja intensidad y enfoque en relajación.',
    },
    {
      id: 'rec-2',
      title: 'Exploración Shibari & Atadura de Torso',
      emoji: '🪢',
      durationMinutes: 60,
      intensity: 'Moderada',
      category: 'Bondage & Restricción',
      activities: [
        { name: 'Check-in de Salud & Nervios', durationMinutes: 5, notes: 'Verificar pulso en muñecas y lesiones previas.' },
        { name: 'Arnés de Pecho (Takate Kote Suave)', durationMinutes: 30, notes: 'Cuerda de yute tratada de 6mm. Monitoreo constante de circulación.' },
        { name: 'Desatadura Consciente (Unbinding)', durationMinutes: 10, notes: 'Retirar cuerdas lentamente con masajes circulares.' },
        { name: 'Aftercare con Recompensa', durationMinutes: 15, notes: 'Contacto piel con piel y diario emocional.' },
      ],
      suggestedPlaylist: 'Deep Downtempo & Ritual Beats',
      aftercarePlan: 'Chequeo de marcas cutáneas y manta ponderada.',
      matchReason: wishlistNames.length > 0 ? `Diseñado para probar ${wishlistNames[0] || 'Shibari'} de tu Wishlist.` : 'Recomendado por tu interés en Bondage.',
    },
    {
      id: 'rec-3',
      title: 'Dinámica D/s & Control de Tiempo',
      emoji: '🗝️',
      durationMinutes: 50,
      intensity: 'Intensa',
      category: 'Poder & Disciplina',
      activities: [
        { name: 'Negociación de Safewords & Reglas', durationMinutes: 5, notes: 'Confirmar palabras clave (Rojo / Amarillo / Verde).' },
        { name: 'Restricción de Muñecas & Denegación', durationMinutes: 25, notes: 'Uso de esposas acolchadas y control de estímulos.' },
        { name: 'Liberación de Protocolo', durationMinutes: 10, notes: 'Palabras de afirmación positiva por parte del Dominante.' },
        { name: 'Aftercare de Reconexión', durationMinutes: 10, notes: 'Verificación de Topdrop / Subspace.' },
      ],
      suggestedPlaylist: 'Cyberpunk Dark Synthwave',
      aftercarePlan: 'Snacks dulces, agua y espacio seguro sin juicio.',
      matchReason: 'Optimizado para ensayar dinámicas de poder consensuadas.',
    },
  ];
}
