export type ZodiacSign =
  | 'aries'
  | 'tauro'
  | 'geminis'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'escorpio'
  | 'sagitario'
  | 'capricornio'
  | 'acuario'
  | 'piscis';

export interface ZodiacInfo {
  id: ZodiacSign;
  name: string;
  emoji: string;
  element: 'Fuego 🔥' | 'Tierra 🪵' | 'Aire 🌬️' | 'Agua 💧';
  dates: string;
  kinkArchetype: string;
  description: string;
  dailyAdvice: string;
}

export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacInfo> = {
  aries: {
    id: 'aries',
    name: 'Aries',
    emoji: '♈',
    element: 'Fuego 🔥',
    dates: '21 Mar - 19 Abr',
    kinkArchetype: 'Dominante Impulsivo & Primal',
    description: 'Enérgico, directo y audaz. Prefiere escenas dinámicas, juego de roles intenso y toma de iniciativa.',
    dailyAdvice: 'Hoy es un excelente día para proponer un reto espontáneo o probar una nueva técnica de impacto.',
  },
  tauro: {
    id: 'tauro',
    name: 'Tauro',
    emoji: '♉',
    element: 'Tierra 🪵',
    dates: '20 Abr - 20 May',
    kinkArchetype: 'Especialista Sensorial & Cuerdas',
    description: 'Amante del confort, masajes, sedas, aceites y Shibari pausado de alta estética táctil.',
    dailyAdvice: 'Enfócate en el aftercare y los estímulos térmicos suaves con cera tibia.',
  },
  geminis: {
    id: 'geminis',
    name: 'Géminis',
    emoji: '♊',
    element: 'Aire 🌬️',
    dates: '21 May - 20 Jun',
    kinkArchetype: 'Negociador Creativo & Verbal',
    description: 'Curioso y juguetón. Ama la negociación verbal, el dirty talk elegante y cambiar de rol (Switch).',
    dailyAdvice: 'Utiliza la Sala de Negociación para redactar un acuerdo con cláusulas creativas.',
  },
  cancer: {
    id: 'cancer',
    name: 'Cáncer',
    emoji: '♋',
    element: 'Agua 💧',
    dates: '21 Jun - 22 Jul',
    kinkArchetype: 'Guardián del Aftercare & Intimidad',
    description: 'Profundamente intuitivo. Conecta a través de la contención emocional y la vulnerabilidad segura.',
    dailyAdvice: 'Prioriza el apoyo durante el descenso neuroquímico (Afterdrop).',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    emoji: '♌',
    element: 'Fuego 🔥',
    dates: '23 Jul - 22 Ago',
    kinkArchetype: 'Exhibicionista & Estrella de Escena',
    description: 'Le apasiona el drama estético, ser el centro de atención y las actuaciones con vestuario sofisticado.',
    dailyAdvice: 'Tómense una foto encriptada para la Bóveda Privada después de su escena.',
  },
  virgo: {
    id: 'virgo',
    name: 'Virgo',
    emoji: '♍',
    element: 'Tierra 🪵',
    dates: '23 Ago - 22 Sep',
    kinkArchetype: 'Maestro de Protocolos & Castidad',
    description: 'Meticuloso y detallista. Disfruta de las listas de verificación, el control de tiempo y el orden impecable.',
    dailyAdvice: 'Diseña un ritual matutino de 3 pasos en el Ritual Builder.',
  },
  libra: {
    id: 'libra',
    name: 'Libra',
    emoji: '♎',
    element: 'Aire 🌬️',
    dates: '23 Sep - 22 Oct',
    kinkArchetype: 'Buscador de Equilibrio & Estética Shibari',
    description: 'Busca la armonía simétrica en las ataduras y la reciprocidad elegante en el intercambio de poder.',
    dailyAdvice: 'Practica la prueba del Match Secreto Double-Blind hoy con tu pareja.',
  },
  escorpio: {
    id: 'escorpio',
    name: 'Escorpio',
    emoji: '♏',
    element: 'Agua 💧',
    dates: '23 Oct - 21 Nov',
    kinkArchetype: 'Explorador Intenso & Poder Profundo',
    description: 'Misterioso, magnético y apasionado. Atraído por la rendición total, la catarsis emocional y el control.',
    dailyAdvice: 'Canaliza tu intensidad con una sesión de privación sensorial prolongada.',
  },
  sagitario: {
    id: 'sagitario',
    name: 'Sagitario',
    emoji: '♐',
    element: 'Fuego 🔥',
    dates: '22 Nov - 21 Dic',
    kinkArchetype: 'Aventurero & Retos Semanales',
    description: 'Espíritu libre. Ama los retos, el humor, la experimentación sin tabúes y las dinámicas al aire libre.',
    dailyAdvice: 'Revisa los Retos Semanales Kink y completa el desafío más audaz.',
  },
  capricornio: {
    id: 'capricornio',
    name: 'Capricornio',
    emoji: '♑',
    element: 'Tierra 🪵',
    dates: '22 Dic - 19 Ene',
    kinkArchetype: 'Arquitecto de Contratos & Disciplina D/s',
    description: 'Estructurado y consistente. Valora los contratos firmados, la disciplina de tareas y el logro de objetivos.',
    dailyAdvice: 'Ratifica un contrato de dinámica en la sección de Contratos Digitales.',
  },
  acuario: {
    id: 'acuario',
    name: 'Acuario',
    emoji: '♒',
    element: 'Aire 🌬️',
    dates: '20 Ene - 18 Feb',
    kinkArchetype: 'Innovador Teledildonics & Hardware',
    description: 'Vanguardista y mental. Atraído por la tecnología smart sex toys, la IA y los enfoques no convencionales.',
    dailyAdvice: 'Conecta un dispositivo Bluetooth para una sesión de Sync de Vibración.',
  },
  piscis: {
    id: 'piscis',
    name: 'Piscis',
    emoji: '♓',
    element: 'Agua 💧',
    dates: '19 Feb - 20 Mar',
    kinkArchetype: 'Soñador de Subspace & Roleplay',
    description: 'Empático y trascendental. Se sumerge fácilmente en el subspace y las fantasías poéticas.',
    dailyAdvice: 'Genera un guión de escena poético con el AI Scene Builder.',
  },
};

export interface SynastryResult {
  score: number;
  synergyTitle: string;
  synergyDesc: string;
  recommendedScene: string;
  aftercareTip: string;
}

export function calculateSynastry(sign1: ZodiacSign, sign2: ZodiacSign): SynastryResult {
  const z1 = ZODIAC_SIGNS[sign1];
  const z2 = ZODIAC_SIGNS[sign2];

  // Base score calculation based on elements
  let score = 85;
  if (z1.element === z2.element) {
    score = 95;
  } else if (
    (z1.element.includes('Fuego') && z2.element.includes('Aire')) ||
    (z1.element.includes('Aire') && z2.element.includes('Fuego')) ||
    (z1.element.includes('Tierra') && z2.element.includes('Agua')) ||
    (z1.element.includes('Agua') && z2.element.includes('Tierra'))
  ) {
    score = 92;
  } else {
    score = 78;
  }

  return {
    score,
    synergyTitle: `${z1.name} (${z1.element}) + ${z2.name} (${z2.element})`,
    synergyDesc: `Una combinación cósmica fascinante. ${z1.name} aporta ${z1.kinkArchetype.toLowerCase()}, mientras que ${z2.name} complementa con ${z2.kinkArchetype.toLowerCase()}.`,
    recommendedScene: `Sesión de ${z1.element.includes('Fuego') || z2.element.includes('Fuego') ? 'Impacto & Pasión' : 'Shibari & Sensación Térmica'} con Vendas en los Ojos.`,
    aftercareTip: `Combinar rehidratación con infusión cálida y 15 minutos de abrazo skin-to-skin.`,
  };
}
