import { ActivityCategory, CompatibilityReport } from '@/types';

export type IcebreakerCategory =
  | 'apertura_curiosa'
  | 'limites_confort'
  | 'fantasias_deseos'
  | 'dinamicas_roles'
  | 'seguridad_senales'
  | 'aftercare_afecto';

export interface IcebreakerQuestion {
  id: string;
  category: IcebreakerCategory;
  categoryLabel: string;
  categoryEmoji: string;
  question: string;
  followUpTip: string;
  relatedKinkCategory?: ActivityCategory;
  depthLevel: 'ligero' | 'intermedio' | 'profundo';
}

export const ICEBREAKER_QUESTIONS: IcebreakerQuestion[] = [
  // ── 1. Apertura y Curiosidad ──
  {
    id: 'ice-1',
    category: 'apertura_curiosa',
    categoryLabel: 'Apertura & Curiosidad',
    categoryEmoji: '✨',
    question: 'Al ver los resultados del reporte, ¿qué coincidencia te causó más emoción o sorpresa positiva?',
    followUpTip: 'Escucha sin interrumpir y valida el entusiasmo antes de saltar a los detalles.',
    depthLevel: 'ligero',
  },
  {
    id: 'ice-2',
    category: 'apertura_curiosa',
    categoryLabel: 'Apertura & Curiosidad',
    categoryEmoji: '✨',
    question: '¿Hay alguna actividad que marcaste como "Curioso/a" sobre la que te gustaría saber más antes de probar?',
    followUpTip: 'La curiosidad no es un compromiso inmediato: es una puerta para investigar juntos.',
    depthLevel: 'ligero',
  },
  {
    id: 'ice-3',
    category: 'apertura_curiosa',
    categoryLabel: 'Apertura & Curiosidad',
    categoryEmoji: '✨',
    question: '¿Qué ambiente o momento del día sientes que sería ideal para conversar sobre nuestros deseos sin prisas?',
    followUpTip: 'Elegir un entorno relajado (sin distracciones del trabajo) facilita la vulnerabilidad.',
    depthLevel: 'ligero',
  },
  {
    id: 'ice-4',
    category: 'apertura_curiosa',
    categoryLabel: 'Apertura & Curiosidad',
    categoryEmoji: '✨',
    question: 'Si tuviéramos un "Pase Libre de Cero Juicios" durante 10 minutos, ¿qué fantasía te gustaría describir en voz alta?',
    followUpTip: 'Asegura a tu pareja que escuchar una fantasía no obliga a realizarla en la práctica.',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-5',
    category: 'apertura_curiosa',
    categoryLabel: 'Apertura & Curiosidad',
    categoryEmoji: '✨',
    question: '¿Qué fue lo más liberador o divertido de responder el test por tu cuenta?',
    followUpTip: 'Reconocer el proceso de autodescubrimiento refuerza la confianza en la pareja.',
    depthLevel: 'ligero',
  },

  // ── 2. Límites y Confort ──
  {
    id: 'ice-6',
    category: 'limites_confort',
    categoryLabel: 'Límites & Confort',
    categoryEmoji: '🛡️',
    question: '¿Hay algún límite blando (soft limit) que quieras explicarme para que sepa exactamente qué te incomoda de él?',
    followUpTip: 'Comprender el "por qué" de un límite ayuda a construir un espacio de máxima seguridad.',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-7',
    category: 'limites_confort',
    categoryLabel: 'Límites & Confort',
    categoryEmoji: '🛡️',
    question: '¿Cómo te gustaría que reaccione si en algún momento dices "No" o decides pausar una actividad a mitad de camino?',
    followUpTip: 'La gratitud inmediata ante un "No" o límite demuestra que el consentimiento es real y respetado.',
    depthLevel: 'profundo',
  },
  {
    id: 'ice-8',
    category: 'limites_confort',
    categoryLabel: 'Límites & Confort',
    categoryEmoji: '🛡️',
    question: '¿Sientes que hay algo en lo que necesites más tiempo o experiencia previa antes de que lo intentemos?',
    followUpTip: 'La progresión gradual genera mucho más placer y seguridad que apresurar los pasos.',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-9',
    category: 'limites_confort',
    categoryLabel: 'Límites & Confort',
    categoryEmoji: '🛡️',
    question: '¿Qué podemos hacer si durante una escena uno de los dos siente timidez o ganas de reírse?',
    followUpTip: 'El humor y la risa son perfectamente válidos y reducen la tensión en cualquier dinámica íntima.',
    depthLevel: 'ligero',
  },

  // ── 3. Fantasías y Deseos Mutuos ──
  {
    id: 'ice-10',
    category: 'fantasias_deseos',
    categoryLabel: 'Fantasías & Deseos',
    categoryEmoji: '🔥',
    question: 'Si eligiéramos una sola práctica de las que coincidimos para explorar este fin de semana, ¿cuál elegirías tú?',
    followUpTip: 'Enfocarse en un solo deseo a la vez permite planificar con calma y sin sobrecarga.',
    relatedKinkCategory: 'intimacy',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-11',
    category: 'fantasias_deseos',
    categoryLabel: 'Fantasías & Deseos',
    categoryEmoji: '🔥',
    question: 'En tus fantasías, ¿qué tipo de iluminación, música o vestuario hace que la escena sea perfecta?',
    followUpTip: 'La atmósfera sensorial potencia la inmersión psicológica.',
    relatedKinkCategory: 'sensation',
    depthLevel: 'ligero',
  },
  {
    id: 'ice-12',
    category: 'fantasias_deseos',
    categoryLabel: 'Fantasías & Deseos',
    categoryEmoji: '🔥',
    question: '¿Te atrae más la idea de anticipar una escena durante días mediante mensajes o que ocurra de forma espontánea?',
    followUpTip: 'Conocer el ritmo de excitación psicológica de tu pareja ayuda a crear tensión previa deliciosa.',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-13',
    category: 'fantasias_deseos',
    categoryLabel: 'Fantasías & Deseos',
    categoryEmoji: '🔥',
    question: '¿Hay algún objeto, accesorio o juguete de nuestro Gear Closet que te genere especial curiosidad estrenar?',
    followUpTip: 'Inspeccionar juntos los implementos antes de usarlos familiariza a ambos con el tacto y seguridad.',
    relatedKinkCategory: 'toys_gear',
    depthLevel: 'ligero',
  },

  // ── 4. Dinámicas y Roles ──
  {
    id: 'ice-14',
    category: 'dinamicas_roles',
    categoryLabel: 'Dinámicas & Roles',
    categoryEmoji: '🗝️',
    question: 'Cuando piensas en tener el control o cederlo, ¿qué emoción predomina en ti: relajación, poder, entrega o adrenalina?',
    followUpTip: 'Entender la motivación emocional detrás del rol profundiza la conexión íntima.',
    relatedKinkCategory: 'power_exchange',
    depthLevel: 'profundo',
  },
  {
    id: 'ice-15',
    category: 'dinamicas_roles',
    categoryLabel: 'Dinámicas & Roles',
    categoryEmoji: '🗝️',
    question: '¿Te gustaría que usemos algún protocolo formal (pedir permiso, posturas, nombres específicos) o prefieres algo libre y fluido?',
    followUpTip: 'Los protocolos pequeños pueden probarse en periodos cortos (ej. 15 minutos) antes de extenderlos.',
    relatedKinkCategory: 'power_exchange',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-16',
    category: 'dinamicas_roles',
    categoryLabel: 'Dinámicas & Roles',
    categoryEmoji: '🗝️',
    question: 'Si practicamos ataduras o restricción (Shibari/Bondage), ¿prefieres sentirte completamente inmóvil o tener cierto rango de movimiento?',
    followUpTip: 'La sensación de libertad vs. inmovilidad total debe calibrarse siempre antes de ajustar nudos.',
    relatedKinkCategory: 'bondage',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-17',
    category: 'dinamicas_roles',
    categoryLabel: 'Dinámicas & Roles',
    categoryEmoji: '🗝️',
    question: 'En juegos de rol (Roleplay), ¿qué personaje o contexto te resultaría más atractivo explorar primero?',
    followUpTip: 'Establecer previamente qué está permitido y qué no dentro del guión evita malentendidos.',
    relatedKinkCategory: 'roleplay',
    depthLevel: 'ligero',
  },

  // ── 5. Seguridad y Señales de Parada ──
  {
    id: 'ice-18',
    category: 'seguridad_senales',
    categoryLabel: 'Seguridad & Señales',
    categoryEmoji: '🚦',
    question: '¿Qué sistema de safewords te resulta más fácil de recordar bajo estrés: Semáforo (Verde/Amarillo/Rojo) o una palabra única?',
    followUpTip: 'El sistema de semáforo es universal: Amarillo = baja la intensidad / pausa; Rojo = detención absoluta inmediata.',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-19',
    category: 'seguridad_senales',
    categoryLabel: 'Seguridad & Señales',
    categoryEmoji: '🚦',
    question: 'Si tienes la boca cubierta o estás en un estado de trance profundo, ¿qué señal no verbal usaremos como alerta (ej. soltar un objeto, dos toques en el muslo)?',
    followUpTip: 'La "campana de seguridad" o soltar un pañuelo de la mano es infalible cuando no se puede hablar.',
    relatedKinkCategory: 'bondage',
    depthLevel: 'profundo',
  },
  {
    id: 'ice-20',
    category: 'seguridad_senales',
    categoryLabel: 'Seguridad & Señales',
    categoryEmoji: '🚦',
    question: '¿Cómo prefieres que te pregunte si estás bien durante la escena: con un código rápido ("¿Rojo/Amarillo/Verde?") o con una caricia en la frente?',
    followUpTip: 'Preguntar con frecuencia calibrada mantiene la inmersión sin romper el flujo de la experiencia.',
    depthLevel: 'intermedio',
  },

  // ── 6. Aftercare y Conexión Emocional ──
  {
    id: 'ice-21',
    category: 'aftercare_afecto',
    categoryLabel: 'Aftercare & Afecto',
    categoryEmoji: '🪷',
    question: 'Justo después de una experiencia intensa, ¿qué te ayuda más a aterrizar: silencio y abrazos, una bebida caliente o hablar de lo que sentimos?',
    followUpTip: 'Cada persona tiene un lenguaje de aftercare diferente; identificarlo evita fricciones post-escena.',
    relatedKinkCategory: 'aftercare',
    depthLevel: 'intermedio',
  },
  {
    id: 'ice-22',
    category: 'aftercare_afecto',
    categoryLabel: 'Aftercare & Afecto',
    categoryEmoji: '🪷',
    question: 'Al día siguiente de jugar, ¿cómo te gustaría que hagamos el check-in emocional (un mensaje cariñoso, una llamada breve o una cena juntos)?',
    followUpTip: 'El Subdrop y Topdrop pueden aparecer 24-48 horas después debido a la caída de endorfinas.',
    relatedKinkCategory: 'aftercare',
    depthLevel: 'profundo',
  },
  {
    id: 'ice-23',
    category: 'aftercare_afecto',
    categoryLabel: 'Aftercare & Afecto',
    categoryEmoji: '🪷',
    question: '¿Hay algún elogio o frase de afirmación específica que te haga sentir especialmente valorado/a y protegido/a al cerrar una sesión?',
    followUpTip: 'Las palabras de afirmación y gratitud sellan la experiencia con amor y pertenencia.',
    depthLevel: 'profundo',
  },
];

/**
 * Filters and prioritizes icebreaker questions tailored to a specific compatibility report.
 */
export function getTailoredIcebreakers(report?: CompatibilityReport): IcebreakerQuestion[] {
  if (!report || !report.categoryCompatibilities) {
    return ICEBREAKER_QUESTIONS;
  }

  // Find top categories with score >= 50
  const topCategories = Object.entries(report.categoryCompatibilities)
    .filter(([_, score]) => score >= 40)
    .map(([cat]) => cat as ActivityCategory);

  const matched = ICEBREAKER_QUESTIONS.filter(
    (q) => q.relatedKinkCategory && topCategories.includes(q.relatedKinkCategory)
  );

  const general = ICEBREAKER_QUESTIONS.filter(
    (q) => !q.relatedKinkCategory || !topCategories.includes(q.relatedKinkCategory)
  );

  // Return matched questions first, followed by general questions
  return [...matched, ...general];
}
