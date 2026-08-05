export interface ActionStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  keyTakeaways: string[];
}

export interface SampleScene {
  id: string;
  title: string;
  dynamicType: string;
  emoji: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedDuration: string;
  requiredGear: string[];
  setupNotes: string;
  steps: {
    phase: string;
    domScript: string;
    subScript: string;
    actionDescription: string;
  }[];
  aftercareGuide: string;
}

export interface DailyProtocolItem {
  id: string;
  timeOfDay: 'Mañana' | 'Tarde' | 'Noche';
  title: string;
  description: string;
  roleResponsible: 'Dom' | 'Sub' | 'Ambos';
  emoji: string;
}

export interface BondageDayChallenge {
  day: number;
  title: string;
  knotName: string;
  emoji: string;
  objective: string;
  safetyTip: string;
  instructions: string[];
}

export interface ResourceItem {
  category: string;
  title: string;
  emoji: string;
  description: string;
  recommendation: string;
}

export const ACTION_PLAN_STEPS: ActionStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Negociación Transparente & Semáforo',
    subtitle: 'Establecer límites antes de tocar una sola cuerda',
    description: 'La base de cualquier experiencia BDSM saludable es la claridad total sobre lo que se quiere explorar y lo que jamás se cruzará.',
    keyTakeaways: [
      'Define tu palabra de seguridad (🟢 Verde / 🟡 Amarillo / 🔴 Rojo).',
      'Completa la lista de Límites Duros (Hard Limits) e Inviolables.',
      'Acuerda el uso de ropa cómoda y ambiente privado.',
    ],
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Preparación de Seguridad & Kit de Rescate',
    subtitle: 'La seguridad no es negociable',
    description: 'Antes de realizar la primera atadura o escena de disciplina, mantén siempre a mano tijeras de rescate con punta roma y agua.',
    keyTakeaways: [
      'Coloca tijeras de rescate EMT a menos de 30 cm de la escena.',
      'Conoce los puntos nerviosos del cuerpo (muñecas, codos, hueco poplíteo).',
      'Prepara agua, mantas y chocolate para el Aftercare.',
    ],
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Ejecución de Escena Guiada (15-20 min)',
    subtitle: 'Comenzar con intensidad controlada',
    description: 'Sigue uno de nuestros guiones de muestra para tu primera sesión. Mantén el ritmo suave y realiza check-ins continuos.',
    keyTakeaways: [
      'El Dominante marca el ritmo y mantiene contacto visual.',
      'El Sumiso comunica su nivel de trance/subspace.',
      'Verificar circulación sanguínea en extremidades cada 3 minutos.',
    ],
  },
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'Debriefing & Aftercare Afectivo',
    subtitle: 'El aterrizaje suave post-endorfinas',
    description: 'Al concluir la escena, desatar con paciencia, abrazar, rehidratar y conversar abiertamente sobre cómo se sintieron ambos.',
    keyTakeaways: [
      'Mantas cálidas y bebida dulce para restaurar azúcar.',
      'Cuestionario de 3 preguntas: ¿Qué te encantó? ¿Qué ajustarías? ¿Cómo te sientes?',
      'Registro en el Diario de Vínculos de Compatikink.',
    ],
  },
];

export const SAMPLE_SCENES: SampleScene[] = [
  {
    id: 'scene-domme-sub',
    title: 'Escena Domme / Sub: Disciplina Elegante & Inversión de Roles',
    dynamicType: 'Dominación Femenina (FLR) / Submisión',
    emoji: '⚡',
    difficulty: 'Principiante',
    estimatedDuration: '20 - 30 minutos',
    requiredGear: ['Antaz o Venda de seda', 'Pala ligera de cuero / Spanker', 'Cuerda suave de algodón 5m'],
    setupNotes: 'Ambiente con luz tenue, música ambiental sensual y alfombra cómoda.',
    steps: [
      {
        phase: '1. Toma de Control & Privación Sensorial',
        domScript: '"Arrodíllate frente a mí, cierra los ojos y coloca la venda. Hoy estás completamente a mi cuidado y bajo mi mando."',
        subScript: '"Entendido, mi Señora. Confío plenamente en ti."',
        actionDescription: 'La Domme coloca suavemente la venda sobre los ojos del submisivo y realiza 3 respiraciones profundas conjuntas.',
      },
      {
        phase: '2. Contraste de Sensaciones & Impacto Ligero',
        domScript: '"Siente la caricia de mi mano... y ahora escucha el sonido de la pala antes de tocar tu piel."',
        subScript: '"Respiro profundo y acepto cada sensación."',
        actionDescription: 'Se intercalan caricias suaves con impactos ligeros de baja intensidad en glúteos, verificando el semáforo verde.',
      },
      {
        phase: '3. Atadura de Muñecas & Trance',
        domScript: '"Voy a sujetar tus manos a tu espalda. Relaja los hombros y entrega el control."',
        subScript: '"Siento tu presencia y me rindo al trance."',
        actionDescription: 'Se realiza un nudo de alondra suave en las muñecas detrás de la espalda, permitiendo libertad de movimiento de dedos.',
      },
    ],
    aftercareGuide: 'Quitar la venda lentamente, envolver con una manta cálida, ofrecer agua fresca y dar masajes en hombros durante 10 minutos.',
  },
  {
    id: 'scene-master-slave',
    title: 'Escena Master / Slave: Protocolo Formal & Servicio Consciente',
    dynamicType: 'Master / Slave (M/s)',
    emoji: '👑',
    difficulty: 'Intermedio',
    estimatedDuration: '30 - 45 minutos',
    requiredGear: ['Collar de cuero / gargantilla', 'Copa de agua', 'Libreta de notas de servicio'],
    setupNotes: 'Espacio ordenado y libre de distracciones. Silencio en el entorno.',
    steps: [
      {
        phase: '1. Imposición del Collar & Acuerdos de Protocolo',
        domScript: '"Este collar representa nuestra confianza y la estructura de nuestra dinámica. ¿Aceptas llevarlo durante esta sesión?"',
        subScript: '"Acepto con honor y respeto, Señor."',
        actionDescription: 'El Master abrocha el collar ceremoniosamente y el slave inclina la cabeza en señal de aceptación.',
      },
      {
        phase: '2. Tarea de Servicio & Atención al Detalle',
        domScript: '"Tu primera tarea de servicio es servir una copa de agua fresca con postura erguida y mirada baja."',
        subScript: '"A su servicio, Señor."',
        actionDescription: 'El slave sirve la bebida manteniendo la postura acordada y aguarda de rodillas hasta recibir la siguiente indicación.',
      },
      {
        phase: '3. Recompensa & Reconocimiento de Lealtad',
        domScript: '"Has demostrado impecable atención al detalle. Descansa tu cabeza en mi regazo."',
        subScript: '"Gracias, Señor."',
        actionDescription: 'El Master acaricia el cabello del slave mientras este se relaja completamente entrando en topspace/subspace.',
      },
    ],
    aftercareGuide: 'Retirar el collar ceremonial, compartir la bebida dulce, hablar sobre las emociones sentidas y registrar la sesión en el Diario.',
  },
  {
    id: 'scene-shibari-sensory',
    title: 'Escena de Shibari & Ataduras Sensoriales',
    dynamicType: 'Bondage & Restricción Sensorial',
    emoji: '🪢',
    difficulty: 'Principiante',
    estimatedDuration: '25 - 35 minutos',
    requiredGear: ['2 cuerdas de yute de 6mm (6m de largo)', 'Tijeras de rescate EMT', 'Vela de cera tibia para masaje'],
    setupNotes: 'Colchón acolchado en el suelo. Tijeras de rescate situadas a la derecha del rigger.',
    steps: [
      {
        phase: '1. Apertura de Cuerdas & Check de Nervios',
        domScript: '"Respira hondo mientras coloco la primera vuelta alrededor de tus muñecas. Comunícame cualquier molestia inmediatamente."',
        subScript: '"Respirando profundo. Semáforo verde."',
        actionDescription: 'El Rigger coloca una atadura de arnés de tórax básica (Takate Kote simplificado) comprobando que quepan 2 dedos entre la cuerda y la piel.',
      },
      {
        phase: '2. Suspensión de Suelo & Sensaciones Térmicas',
        domScript: '"Relaja todo el peso de tus brazos en la estructura de la cuerda. Siente el goteo de cera tibia en tu espalda."',
        subScript: '"Siento el calor... el trance es profundo."',
        actionDescription: 'Se aplican gotas de cera de bajo punto de fusión sobre la piel de la espalda a 30 cm de distancia.',
      },
    ],
    aftercareGuide: 'Cortar o desatar con calma las cuerdas, aplicar aceite hidratante en las zonas atadas y mantener contacto cuerpo a cuerpo.',
  },
  {
    id: 'scene-pegging-reversal',
    title: 'Escena de Pegging & Inversión de Control Progresivo',
    dynamicType: 'Pegging / Dominación Sensual',
    emoji: '🍑',
    difficulty: 'Intermedio',
    estimatedDuration: '30 - 45 minutos',
    requiredGear: ['Arnés anatómico calibrado', 'Dildo de silicona médica suave', 'Lubricante íntimo a base de agua abundante'],
    setupNotes: 'Toallas limpias, música relajante, dilatación previa realizada.',
    steps: [
      {
        phase: '1. Masaje de Dilatación & Relajación de Pelvis',
        domScript: '"No hay prisa. Sigue mi ritmo de respiración mientras aplicamos lubricante abundante y relajamos la musculatura."',
        subScript: '"Inhalando... exhalando... confío en ti."',
        actionDescription: 'Se realiza masaje en zona lumbar y muslos con lubricante tibio para asegurar dilatación física y mental completa.',
      },
      {
        phase: '2. Penetración Controlada & Comunicación Verbal',
        domScript: '"Voy a avanzar lentamente 1 centímetro. Dime si mantenemos este ritmo o pausamos."',
        subScript: '"El ritmo es perfecto. Semáforo verde."',
        actionDescription: 'Avance pausado manteniendo contacto visual y verificando el confort físico continuo.',
      },
    ],
    aftercareGuide: 'Permanecer abrazados durante 15 minutos, hidratación con agua o infusiones tibias y masaje descontracturante.',
  },
];

export const DAILY_PROTOCOLS: DailyProtocolItem[] = [
  {
    id: 'proto-1',
    timeOfDay: 'Mañana',
    title: 'Saludo Matutino & Mensaje de Confirmación D/s',
    description: 'El sumiso envía un mensaje o realiza el saludo acordado al despertar confirmando su estado de ánimo y bienestar.',
    roleResponsible: 'Sub',
    emoji: '🌅',
  },
  {
    id: 'proto-2',
    timeOfDay: 'Mañana',
    title: 'Check-in del Semáforo & Estado Emocional',
    description: 'El dominante verifica el nivel de energía y el color de semáforo del día (Verde / Amarillo / Rojo).',
    roleResponsible: 'Dom',
    emoji: '🟢',
  },
  {
    id: 'proto-3',
    timeOfDay: 'Tarde',
    title: 'Cumplimiento de Tarea de Servicio / Desafío',
    description: 'Realización de la tarea asignada para el día (ej. meditación de 10 min, postureo, diario de gratitud).',
    roleResponsible: 'Sub',
    emoji: '🎯',
  },
  {
    id: 'proto-4',
    timeOfDay: 'Noche',
    title: 'Registro en Diario & Aftercare Nocturno',
    description: 'Agradecimientos del día, diálogo abierto sobre la dinámica y 5 minutos de abrazos/contacto físico sin expectativas.',
    roleResponsible: 'Ambos',
    emoji: '🌙',
  },
];

export const BONDAGE_7_DAYS: BondageDayChallenge[] = [
  {
    day: 1,
    title: 'Día 1: Seguridad & Preparación del Kit de Rescate',
    knotName: 'Nulo / Seguridad Inicial',
    emoji: '✂️',
    objective: 'Reunir las herramientas de protección antes de atar la primera cuerda.',
    safetyTip: 'Mantener tijeras de rescate con punta curva (EMT shears) al alcance de la mano.',
    instructions: [
      'Revisa que tus cuerdas no tengan fibras sueltas o asperezas.',
      'Coloca las tijeras de rescate a tu derecha.',
      'Memoriza los 3 nervios principales del brazo (Radial, Cubital, Mediano).',
    ],
  },
  {
    day: 2,
    title: 'Día 2: El Nudo de Alondra (Larks Head)',
    knotName: 'Nudo de Alondra',
    emoji: '🪢',
    objective: 'Aprender la columna vertebral de casi todas las ataduras BDSM.',
    safetyTip: 'Nunca apretar el nudo directamente sobre articulaciones o huesos expuestos.',
    instructions: [
      'Dobla la cuerda por la mitad para encontrar el bight (centro).',
      'Pasa la lazada alrededor de la muñeca y desliza los dos extremos dentro de la curva.',
      'Verifica que entren 2 dedos libremente entre la piel y la cuerda.',
    ],
  },
  {
    day: 3,
    title: 'Día 3: Atadura de Muñecas Básica (Single Column Tie)',
    knotName: 'Columna Única',
    emoji: '✋',
    objective: 'Restringir una muñeca de forma cómoda y sin peligro circulatorio.',
    safetyTip: 'Revisar la temperatura y color de los dedos cada 3 minutos.',
    instructions: [
      'Realiza un Nudo de Alondra rodeando la muñeca.',
      'Haz un nudo simple de bloqueo (Locking knot) sobre la cuerda para fijar la tensión.',
      'Asegúrate de que la tensión no aprisione las arterias del pulso.',
    ],
  },
  {
    day: 4,
    title: 'Día 4: Atadura de Muñecas Doble (Double Column Tie)',
    knotName: 'Columna Doble',
    emoji: '🪢',
    objective: 'Unir ambas muñecas juntas con separación acolchada.',
    safetyTip: 'Coloca un espacio de cuerda de 2 cm entre ambas muñecas para evitar roces.',
    instructions: [
      'Rodea la primera muñeca con la primera columna.',
      'Rodea la segunda muñeca manteniendo separación.',
      'Bloquea en el centro entre ambas manos con un nudo cuadrado.',
    ],
  },
  {
    day: 5,
    title: 'Día 5: Arnés de Pecho Simplificado (Chest Harness)',
    knotName: 'Harness de Pecho',
    emoji: '👕',
    objective: 'Crear una prenda estética de cuerda rodeando el tórax sin oprimir el pecho.',
    safetyTip: 'Evita colocar cuerdas sobre la garganta o sobre la clavícula.',
    instructions: [
      'Pasa el centro de la cuerda por la espalda a la altura del esternón.',
      'Trae las cuerdas hacia el frente por encima de los hombros.',
      'Entrelaza en el centro formando un patrón geométrico armonioso.',
    ],
  },
  {
    day: 6,
    title: 'Día 6: Privación Sensorial + Atadura Ligera',
    knotName: 'Combo Venda & Cuerda',
    emoji: '🙈',
    objective: 'Combinar ataduras de columna doble con privación visual.',
    safetyTip: 'Comunicación constante verbal ya que no se pueden ver las expresiones.',
    instructions: [
      'Coloca una venda suave de seda sobre los ojos.',
      'Ata las muñecas detrás de la espalda con la columna doble aprendida en el Día 4.',
      'Realiza toques suaves de plumas o hielo durante 10 minutos.',
    ],
  },
  {
    day: 7,
    title: 'Día 7: Escena Completa de 20 Minutos & Graduación',
    knotName: 'Escena Integrada',
    emoji: '🎓',
    objective: 'Integrar todo lo aprendido en una sesión completa con Aftercare.',
    safetyTip: 'Completar el registro de debriefing al finalizar.',
    instructions: [
      'Prepara la escena con música, luz cálida y tijeras.',
      'Ejecuta el arnés de pecho y la atadura de muñecas.',
      'Disfruta de 15 minutos de trance y concluye con Aftercare de 10 minutos.',
    ],
  },
];

export const RESOURCE_GUIDE_ITEMS: ResourceItem[] = [
  {
    category: 'Cuerdas & Materiales',
    title: 'Cuerdas de Yute Tratado (6mm a 8mm)',
    emoji: '🪢',
    description: 'Material clásico de Shibari. Gran agarre, peso natural y flexibilidad tras ser quemada y acondicionada con aceite de jojoba.',
    recommendation: 'Ideal para ataduras corporales de suelo y arneses.',
  },
  {
    category: 'Cuerdas & Materiales',
    title: 'Cuerda de Algodón Suave de 3 Cabos',
    emoji: '🧵',
    description: 'Muy tersa y suave al contacto con la piel sensible. No raspa ni irrita.',
    recommendation: 'Excelente opción para principiantes y pieles delicadas.',
  },
  {
    category: 'Herramientas de Seguridad',
    title: 'Tijeras de Rescate EMT (Trauma Shears)',
    emoji: '✂️',
    description: 'Tijeras de punta roma curvada diseñadas para cortar cuerdas y ropa al instante sin dañar la piel en emergencias.',
    recommendation: 'Indispensables en cualquier kit BDSM. Mantener a menos de 50 cm.',
  },
  {
    category: 'Aftercare & Cuidado',
    title: 'Aceites Corporales de Jojoba & Mantas Térmicas',
    emoji: '🪷',
    description: 'Aceites orgánicos para rehidratar la piel tras el roce de cuerdas y mantas para prevenir la bajada de temperatura post-trance.',
    recommendation: 'Tener listos antes de dar inicio a la escena.',
  },
];
