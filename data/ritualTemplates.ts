export interface RitualStep {
  stepNumber: number;
  title: string;
  instruction: string;
  durationMinutes: number;
  safetyCheck?: string;
}

export interface RitualTemplate {
  id: string;
  title: string;
  emoji: string;
  category: 'Matutino' | 'Nocturno' | 'Pre-Escena' | 'Protocolo D/s';
  description: string;
  steps: RitualStep[];
}

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    id: 'rit-1',
    title: 'Protocolo de Saludo Matutino D/s',
    emoji: '🌅',
    category: 'Matutino',
    description: 'Ritual diario de 5 minutos para iniciar la jornada con intención, presencia y alineación del rol.',
    steps: [
      { stepNumber: 1, title: 'Mensaje de Confirmación de Salud', instruction: 'Enviar mensaje breve informando estado físico y nivel de energía (1 al 10).', durationMinutes: 2 },
      { stepNumber: 2, title: 'Palabras de Protocolo', instruction: 'Expresar saludo de reconocimiento de rol según lo acordado.', durationMinutes: 1 },
      { stepNumber: 3, title: 'Revisión de Objetivos del Día', instruction: 'Confirmar las 2 tareas o prioridades asignadas para hoy.', durationMinutes: 2 },
    ],
  },
  {
    id: 'rit-2',
    title: 'Check-in de Seguridad & Anatomía Pre-Escena',
    emoji: '🛡️',
    category: 'Pre-Escena',
    description: 'Verificación estricta de seguridad física y nerviosa antes de comenzar ataduras o impacto.',
    steps: [
      { stepNumber: 1, title: 'Prueba de Palabras Clave (Safewords)', instruction: 'Confirmar en voz alta las palabras Rojo, Amarillo y Verde.', durationMinutes: 1, safetyCheck: 'Ambos deben responder sin dudar.' },
      { stepNumber: 2, title: 'Inspección de Cuerdas & Tijeras de Rescate', instruction: 'Comprobar que las tijeras EMT de rescate están al alcance de la mano.', durationMinutes: 2, safetyCheck: 'Tijeras visibles a menos de 1 metro.' },
      { stepNumber: 3, title: 'Monitoreo de Nervio Radial & Pulso', instruction: 'Revisar sensibilidad y pulso en muñecas y tobillos.', durationMinutes: 2 },
    ],
  },
  {
    id: 'rit-3',
    title: 'Ritual Nocturno de Aftercare & Cierre',
    emoji: '🪷',
    category: 'Nocturno',
    description: 'Secuencia de reconexión emocional y descanso al finalizar el día o una escena intensa.',
    steps: [
      { stepNumber: 1, title: 'Desconexión Física & Abrazo Piel con Piel', instruction: 'Mantener contacto físico tranquilo durante 10 minutos sin prisas.', durationMinutes: 10 },
      { stepNumber: 2, title: 'Rehidratación & Snack Térmico', instruction: 'Ofrecer agua fresca o infusión tibia y chocolate/fruta.', durationMinutes: 5 },
      { stepNumber: 3, title: 'Check-in de 3 Preguntas', instruction: 'Responder: ¿Cómo te sientes? ¿Qué disfrutaste más? ¿Qué podemos ajustar la próxima vez?', durationMinutes: 10 },
    ],
  },
];
