export type RiskLevel = 'danger' | 'caution' | 'safe';

export interface AnatomyZone {
  id: string;
  bodyPart: string;
  zoneType: RiskLevel;
  nerveOrVessel: string;
  description: string;
  precaution: string;
  emoji: string;
}

export interface ShibariStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  safetyCheck?: string;
}

export interface ShibariKnot {
  id: string;
  name: string;
  japaneseName: string;
  category: 'Ataduras de Muñecas' | 'Arneses de Pecho' | 'Ataduras de Piernas' | 'Suspensión de Suelo';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  recommendedRope: string;
  estimatedTime: string;
  emoji: string;
  anatomicalWarnings: string[];
  description: string;
  steps: ShibariStep[];
}

export const ANATOMY_SAFETY_ZONES: AnatomyZone[] = [
  {
    id: 'zone-radial-nerve',
    bodyPart: 'Muñeca & Fosa del Codo (Parte Superior)',
    zoneType: 'danger',
    nerveOrVessel: 'Nervio Radial (Radial Nerve)',
    emoji: '🔴',
    description: 'Punto altamente vulnerable a la presión. La compresión prolongada causa neuropatía radial ("caída de muñeca" / wrist drop).',
    precaution: 'Nunca colocar nudos apretados directamente sobre la fosa del codo ni apretar excesivamente sobre el hueso de la muñeca. Colocar siempre 2 dedos de holgura.',
  },
  {
    id: 'zone-ulnar-nerve',
    bodyPart: 'Cara Interna del Codo (Canal Epitrocleolecraniano)',
    zoneType: 'danger',
    nerveOrVessel: 'Nervio Cubital (Ulnar Nerve)',
    emoji: '🔴',
    description: 'Nervio expuesto en la cara interna del codo. Su compresión produce adormecimiento inmediato en los dedos meñique y anular.',
    precaution: 'Evitar pasar cuerdas tensas sobre el hueso del "codo de la risa". Si el atado siente hormigueo en el meñique, aflojar inmediatamente.',
  },
  {
    id: 'zone-carotid',
    bodyPart: 'Cuello & Garganta',
    zoneType: 'danger',
    nerveOrVessel: 'Arteria Carótida & Seno Carotídeo',
    emoji: '🔴',
    description: 'Peligro mortal. La presión en el seno carotídeo causa pérdida inmediata del conocimiento y paro cardíaco reflejo.',
    precaution: 'Jamás colocar cuerdas rodeando el cuello en Shibari. Mantener todas las ataduras torácicas por debajo de la clavícula.',
  },
  {
    id: 'zone-peroneal-nerve',
    bodyPart: 'Detrás de la Rodilla (Hueco Poplíteo)',
    zoneType: 'danger',
    nerveOrVessel: 'Nervio Peroneo Común (Peroneal Nerve)',
    emoji: '🔴',
    description: 'La presión detrás de las rodillas causa parálisis temporal del pie (pie caído) y pérdida de sensibilidad.',
    precaution: 'Usar acolchado de toalla o seda doblada si se dobla la pierna en ataduras como Futomomo.',
  },
  {
    id: 'zone-clavicle',
    bodyPart: 'Clavícula & Hombros',
    zoneType: 'caution',
    nerveOrVessel: 'Plexo Braquial (Brachial Plexus)',
    emoji: '🟡',
    description: 'Zona sensible a la tracción excesiva en suspensión o arneses tirantes.',
    precaution: 'Asegurar que los tirantes del arnés de pecho no presionen el espacio entre el cuello y la clavícula.',
  },
  {
    id: 'zone-sternum',
    bodyPart: 'Centro del Pecho (Esternón)',
    zoneType: 'safe',
    nerveOrVessel: 'Hueso Esternal (Estructura Ósea)',
    emoji: '🟢',
    description: 'Zona de apoyo ideal y segura para colocar los nudos centrales y bloqueos de los arneses de pecho.',
    precaution: 'Permitir expansión torácica completa comprobando que la persona pueda inhalar al 100%.',
  },
  {
    id: 'zone-thighs',
    bodyPart: 'Muslos Superiores & Caderas',
    zoneType: 'safe',
    nerveOrVessel: 'Musculatura Grande de Muslo',
    emoji: '🟢',
    description: 'Excelente área para ataduras de suelo, arneses pélvicos y distribución de peso.',
    precaution: 'Distribuir la tensión en múltiples vueltas anchas de cuerda de 6mm a 8mm.',
  },
];

export const SHIBARI_KNOTS_CATALOG: ShibariKnot[] = [
  {
    id: 'knot-larks-head',
    name: 'Nudo de Alondra',
    japaneseName: 'Koma Musubi (コマ結び)',
    category: 'Ataduras de Muñecas',
    difficulty: 'Principiante',
    recommendedRope: '1x Cuerda de yute/algodón 6mm x 5m',
    estimatedTime: '2 minutos',
    emoji: '🪢',
    anatomicalWarnings: ['No apretar estrangulando el hueso de la muñeca.'],
    description: 'La lazada fundamental de inicio en el Shibari. Permite crear un anillo ajustable y seguro para iniciar cualquier columna.',
    steps: [
      {
        stepNumber: 1,
        title: 'Encontrar el Centro (Bight)',
        instruction: 'Toma la cuerda doblada exactamente por la mitad, sosteniendo el bucle (bight) entre tus dedos.',
        tip: 'Asegúrate de que ambos extremos queden parejos.',
      },
      {
        stepNumber: 2,
        title: 'Rodeare la Extremidad',
        instruction: 'Pasa la lazada curvada alrededor de la muñeca del modelo de abajo hacia arriba.',
      },
      {
        stepNumber: 3,
        title: 'Insertar los Extremos',
        instruction: 'Toma los dos extremos libres de la cuerda y pásalos por dentro del bucle de la alondra.',
        safetyCheck: 'Verifica que entren libremente 2 dedos de holgura entre la piel y la cuerda.',
      },
    ],
  },
  {
    id: 'knot-single-column',
    name: 'Atadura de Columna Única',
    japaneseName: 'Single Column Tie',
    category: 'Ataduras de Muñecas',
    difficulty: 'Principiante',
    recommendedRope: '1x Cuerda de yute 6mm x 6m',
    estimatedTime: '4 minutos',
    emoji: '✋',
    anatomicalWarnings: ['Evitar presionar las arterias del pulso.', 'Monitorear la temperatura de las yemas de los dedos.'],
    description: 'Atadura clásica para asegurar una muñeca o tobillo individual con bloqueo para evitar que el nudo se apriete con la tracción.',
    steps: [
      {
        stepNumber: 1,
        title: 'Lazada de Alondra Inicial',
        instruction: 'Aplica un Nudo de Alondra alrededor de la muñeca dejando 2 dedos de holgura.',
      },
      {
        stepNumber: 2,
        title: 'Primera Vuelta de Envoltura',
        instruction: 'Da una segunda vuelta completa rodeando la muñeca en paralelo a la primera.',
      },
      {
        stepNumber: 3,
        title: 'Nudo Cuadrado de Bloqueo (Locking Knot)',
        instruction: 'Realiza un nudo simple apretado entre las dos vueltas de cuerda para fijar la tensión de forma permanente.',
        tip: 'El nudo de bloqueo evita que la tracción apriete la muñeca durante el movimiento.',
      },
    ],
  },
  {
    id: 'knot-double-column',
    name: 'Atadura de Columna Doble',
    japaneseName: 'Double Column Tie (DCT)',
    category: 'Ataduras de Muñecas',
    difficulty: 'Principiante',
    recommendedRope: '1x Cuerda de yute 6mm x 7m',
    estimatedTime: '5 minutos',
    emoji: '🪢',
    anatomicalWarnings: ['Mantener separación de 2 cm entre ambas muñecas para no generar roces en la piel.'],
    description: 'Permite unir ambas muñecas juntas (al frente o a la espalda) creando un canal central acolchado de separación.',
    steps: [
      {
        stepNumber: 1,
        title: 'Envolver la Primera Muñeca',
        instruction: 'Envuelve la primera muñeca con 2 vueltas paralelas comprobando holgura.',
      },
      {
        stepNumber: 2,
        title: 'Puente de Separación',
        instruction: 'Pasa las cuerdas hacia la segunda muñeca dejando 2 cm de espacio de cuerda en el medio.',
      },
      {
        stepNumber: 3,
        title: 'Envolver la Segunda Muñeca & Bloqueo Central',
        instruction: 'Da 2 vueltas en la segunda muñeca y ata un nudo cuadrado firme en el canal central entre ambas manos.',
        safetyCheck: 'Comprueba el pulso radial en ambas muñecas una vez fijado el nudo.',
      },
    ],
  },
  {
    id: 'knot-takate-kote',
    name: 'Arnés de Pecho Simplificado',
    japaneseName: 'Takate Kote (高手小手 - Versión Suelo)',
    category: 'Arneses de Pecho',
    difficulty: 'Intermedio',
    recommendedRope: '2x Cuerdas de yute 6mm x 7m',
    estimatedTime: '10 minutos',
    emoji: '👕',
    anatomicalWarnings: ['No oprimir las axilas ni el espacio del cuello.', 'Verificar la expansión respiratoria completa.'],
    description: 'Arnés estético y funcional para abrazar el tórax y sujetar los brazos en la espalda de forma cómoda sobre el suelo.',
    steps: [
      {
        stepNumber: 1,
        title: 'Vueltas del Pecho (Chest Wraps)',
        instruction: 'Pasa la cuerda por la espalda a la altura de los pezones y da 2 vueltas horizontales envolviendo el tórax.',
      },
      {
        stepNumber: 2,
        title: 'Tirantes de Hombro (Stem / Harness)',
        instruction: 'Lleva las cuerdas verticalmente por encima de los hombros hacia la espalda pasando por fuera de los brazos.',
      },
      {
        stepNumber: 3,
        title: 'Nudo Central en Esternón',
        instruction: 'Fija el nudo de cierre en el centro del esternón apretando solo lo suficiente para sostener la prenda.',
        safetyCheck: 'Pide al atado que inhale al 100% para verificar que no sienta opresión pulmonar.',
      },
    ],
  },
  {
    id: 'knot-futomomo',
    name: 'Atadura de Piernas / Muslos',
    japaneseName: 'Futomomo (二股/太腿)',
    category: 'Ataduras de Piernas',
    difficulty: 'Intermedio',
    recommendedRope: '1x Cuerda de yute 8mm x 7m',
    estimatedTime: '8 minutos',
    emoji: '🦵',
    anatomicalWarnings: ['Usar acolchado de toalla detrás de la rodilla para no comprimir el nervio peroneo.'],
    description: 'Atadura que pliega la pierna sobre el muslo manteniendo al modelo en una postura fetal o de reposo profundo.',
    steps: [
      {
        stepNumber: 1,
        title: 'Colocar Acolchado en Hueco Poplíteo',
        instruction: 'Inserta una pequeña toalla doblada detrás de la flexión de la rodilla.',
      },
      {
        stepNumber: 2,
        title: 'Pliegue de la Pierna',
        instruction: 'Dobla suavemente la pantorrilla hacia el muslo posterior.',
      },
      {
        stepNumber: 3,
        title: 'Envoltura de 3 Vueltas & Cierre',
        instruction: 'Da 3 vueltas rodeando juntos el muslo y la pantorrilla y asegura con un nudo de bloqueo.',
      },
    ],
  },
];
