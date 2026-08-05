export type IntensityLevel = 'Nivel 1 (Sutil)' | 'Nivel 2 (Sensorial)' | 'Nivel 3 (Avanzado)';

export interface DailySubmissiveAct {
  id: string;
  title: string;
  category: 'Mental & Conexión' | 'Sensorial & Cuerpo' | 'Protocolo & Servicio' | 'Control & Trance';
  intensity: IntensityLevel;
  requiredGear: string;
  emoji: string;
  description: string;
  domInstruction: string;
  subInstruction: string;
  xpReward: number;
}

export const DAILY_SUBMISSIVE_ACTS: DailySubmissiveAct[] = [
  {
    id: 'act-1',
    title: 'El Saludo Matutino de Respeto',
    category: 'Mental & Conexión',
    intensity: 'Nivel 1 (Sutil)',
    requiredGear: 'Ninguno (Solo mente/cuerpo)',
    emoji: '🌅',
    description: 'Enviar un mensaje o realizar el saludo ceremonial al despertar expresando lealtad y confirmando el color de semáforo emocional.',
    domInstruction: 'Recibir el saludo, evaluar el nivel de energía del submisivo y responder confirmando la conexión.',
    subInstruction: 'Pausar 1 minuto al despertar, respirar profundo y enviar el mensaje de confirmación a tu Dominante.',
    xpReward: 50,
  },
  {
    id: 'act-2',
    title: '15 Minutos de Venda & Silencio',
    category: 'Sensorial & Cuerpo',
    intensity: 'Nivel 1 (Sutil)',
    requiredGear: 'Venda de seda / antifaz',
    emoji: '🙈',
    description: 'Permanecer 15 minutos con la vista privada en silencio absoluto mientras se escucha el entorno.',
    domInstruction: 'Colocar la venda suavemente y verificar que el espacio esté seguro y libre de ruidos fuertes.',
    subInstruction: 'Concentrarte en la respiración abdominal y entregar la tensión visual.',
    xpReward: 60,
  },
  {
    id: 'act-3',
    title: 'Postura de Servicio en el Té / Café',
    category: 'Protocolo & Servicio',
    intensity: 'Nivel 1 (Sutil)',
    requiredGear: 'Ninguno (Solo mente/cuerpo)',
    emoji: '☕',
    description: 'Servir una bebida caliente a tu Dominante manteniendo la mirada baja e inclinación de cabeza respetuosa.',
    domInstruction: 'Observar la postura y postura corporal del submisivo, reconociendo el gesto con un toque en la cabeza o hombro.',
    subInstruction: 'Mantener la postura recta, servil y pausada al entregar la taza.',
    xpReward: 55,
  },
  {
    id: 'act-4',
    title: 'Masaje de Pies de 10 Minutos',
    category: 'Sensorial & Cuerpo',
    intensity: 'Nivel 2 (Sensorial)',
    requiredGear: 'Aceite corporal de lavanda',
    emoji: '🦶',
    description: 'Masajear amablemente los pies de tu Dominante aplicando aceite caliente tras una jornada intensa.',
    domInstruction: 'Relajarte mientras tu submisivo cuida de ti, guiando la presión deseada.',
    subInstruction: 'Trabajar cada dedo y la planta del pie con atención al detalle.',
    xpReward: 75,
  },
  {
    id: 'act-5',
    title: 'Atadura de Muñecas en Columna Única (15 min)',
    category: 'Control & Trance',
    intensity: 'Nivel 2 (Sensorial)',
    requiredGear: 'Cuerda de yute o algodón 5m',
    emoji: '🪢',
    description: 'Permanecer con las muñecas atadas suavemente detrás de la espalda durante 15 minutos en postura de trance.',
    domInstruction: 'Verificar la circulación cada 3 minutos (dedos tibios y con pulso).',
    subInstruction: 'Cerrar los ojos, apoyar la espalda erguida y disfrutar de la cesión de movimiento.',
    xpReward: 85,
  },
  {
    id: 'act-6',
    title: '10 Impactos Ligeros con Spanker / Pala',
    category: 'Sensorial & Cuerpo',
    intensity: 'Nivel 2 (Sensorial)',
    requiredGear: 'Pala de cuero / Spanker',
    emoji: '🍑',
    description: 'Recibir 10 impactos calibrados de intensidad suave-media en glúteos verificando el semáforo verde.',
    domInstruction: 'Marcar un ritmo constante de 1 impacto cada 5 segundos, manteniendo contacto visual.',
    subInstruction: 'Agradecer verbalmente cada impacto diciendo "Gracias, mi Dominante".',
    xpReward: 80,
  },
  {
    id: 'act-7',
    title: 'Denegación de Orgasmo de 24 Horas (Teasing & Denial)',
    category: 'Control & Trance',
    intensity: 'Nivel 3 (Avanzado)',
    requiredGear: 'Jaula de castidad o acuerdo verbal',
    emoji: '🔒',
    description: 'Mantener el estado de excitación sin llegar al clímax por 24 horas continuas bajo el mandato del Dominante.',
    domInstruction: 'Enviar mensajes esporádicos recordando la restricción y elevando la tensión.',
    subInstruction: 'Aceptar la tensión dulce del deseo contenido y enfocar la energía en el servicio.',
    xpReward: 100,
  },
  {
    id: 'act-8',
    title: 'Lectura Formal del Contrato D/s & Renovación',
    category: 'Protocolo & Servicio',
    intensity: 'Nivel 2 (Sensorial)',
    requiredGear: 'Contrato Digital / Documento escrito',
    emoji: '📜',
    description: 'Leer en voz alta las cláusulas y acuerdos de la dinámica ante el Dominante.',
    domInstruction: 'Escuchar la lectura, reafirmar los puntos clave y realizar ajustes si es necesario.',
    subInstruction: 'Arrodillarse y pronunciar con claridad cada compromiso acordado.',
    xpReward: 70,
  },
  {
    id: 'act-9',
    title: 'Cera Tibia de Masaje en Espalda (5 gotas)',
    category: 'Sensorial & Cuerpo',
    intensity: 'Nivel 2 (Sensorial)',
    requiredGear: 'Vela de cera tibia BDSM',
    emoji: '🕯️',
    description: 'Recibir 5 gotas de cera tibia sobre los hombros y espalda seguido de un masaje rehidratante.',
    domInstruction: 'Sostener la vela a 30 cm de altura para templar las gotas antes del contacto.',
    subInstruction: 'Respirar con tranquilidad y disfrutar el contraste térmico.',
    xpReward: 85,
  },
  {
    id: 'act-10',
    title: 'Diario de Reflexión & Gratitud Submisiva',
    category: 'Mental & Conexión',
    intensity: 'Nivel 1 (Sutil)',
    requiredGear: 'Ninguno (Solo mente/cuerpo)',
    emoji: '📖',
    description: 'Escribir un párrafo de 50 palabras sobre lo que valoras de tu Dominante y de la dinámica.',
    domInstruction: 'Leer la reflexión enviada y ofrecer palabras de reconocimiento.',
    subInstruction: 'Escribir con total honestidad y vulnerabilidad consciente.',
    xpReward: 60,
  },
];
