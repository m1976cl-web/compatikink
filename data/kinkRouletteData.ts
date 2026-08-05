export type RouletteIntensity = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface KinkChallenge {
  id: string;
  title: string;
  category: 'Verdad o Reto' | 'Dominación Ligera' | 'Sensorial & Masaje' | 'Protocolo & Juegos';
  intensity: RouletteIntensity;
  emoji: string;
  description: string;
  domRoleText: string;
  subRoleText: string;
  xpReward: number;
}

export const KINK_ROULETTE_CHALLENGES: KinkChallenge[] = [
  {
    id: 'roul-1',
    title: 'Masaje a Ciegas de 5 Minutos',
    category: 'Sensorial & Masaje',
    intensity: 'Principiante',
    emoji: '🙈',
    description: 'El sumiso se coloca una venda de ojos mientras el dominante le da un masaje alternando roces de pluma y toques firmes.',
    domRoleText: 'Dar el masaje variando la velocidad y temperatura de tus manos.',
    subRoleText: 'Permanecer relajado con los ojos vendados comunicando sensaciones.',
    xpReward: 50,
  },
  {
    id: 'roul-2',
    title: 'Verdad Kink: Revelar una Fantasía Guardada',
    category: 'Verdad o Reto',
    intensity: 'Principiante',
    emoji: '💬',
    description: 'Confesar una fantasía o deseo fetichista que aún no hayan explorado juntos.',
    domRoleText: 'Escuchar con apertura total y sin juzgar.',
    subRoleText: 'Compartir tu deseo con vulnerabilidad y confianza.',
    xpReward: 55,
  },
  {
    id: 'roul-3',
    title: '10 Impactos Ligeros de Palmaditas',
    category: 'Dominación Ligera',
    intensity: 'Intermedio',
    emoji: '🍑',
    description: 'El dominante aplica 10 nalgadas de intensidad suave-media en los glúteos verificando el semáforo verde.',
    domRoleText: 'Marcar 10 nalgadas rítmicas contando en voz alta.',
    subRoleText: 'Agradecer cada golpe diciendo "Gracias".',
    xpReward: 75,
  },
  {
    id: 'roul-4',
    title: 'Inversión de Control de 3 Minutos',
    category: 'Protocolo & Juegos',
    intensity: 'Intermedio',
    emoji: '🔄',
    description: 'Intercambiar los roles por 3 minutos completos para experimentar la perspectiva del otro.',
    domRoleText: 'Recibir órdenes sencillas del nuevo líder por 3 min.',
    subRoleText: 'Tomar la iniciativa y dar 2 indicaciones directas.',
    xpReward: 80,
  },
  {
    id: 'roul-5',
    title: 'Atadura de Muñecas Sensorial de 10 Minutos',
    category: 'Protocolo & Juegos',
    intensity: 'Intermedio',
    emoji: '🪢',
    description: 'Atar las muñecas a la espalda con una cuerda suave y colocar música ambiental de relajación.',
    domRoleText: 'Atar con alondra suave comprobando 2 dedos de holgura.',
    subRoleText: 'Entregarse al trance de la inmovilidad.',
    xpReward: 90,
  },
  {
    id: 'roul-6',
    title: 'Goteo de Cera Tibia en Espalda (3 gotas)',
    category: 'Sensorial & Masaje',
    intensity: 'Avanzado',
    emoji: '🕯️',
    description: 'Aplicación de cera de masajes de bajo punto de fusión sobre hombros.',
    domRoleText: 'Gotear la cera desde 30 cm de distancia.',
    subRoleText: 'Disfrutar el calor y mantener la respiración profunda.',
    xpReward: 100,
  },
  {
    id: 'roul-7',
    title: 'Teasing & Denial de 5 Minutos',
    category: 'Dominación Ligera',
    intensity: 'Avanzado',
    emoji: '🔥',
    description: 'Estimulación sensual intensa detenida justo antes del clímax.',
    domRoleText: 'Guíar el ritmo y pausar exactamente al llegar al borde.',
    subRoleText: 'Disfrutar la tensión contenida sin buscar el clímax.',
    xpReward: 110,
  },
];
