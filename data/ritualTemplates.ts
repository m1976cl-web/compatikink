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
  {
    id: 'rit-4',
    title: 'Ceremonia de Collar',
    emoji: '⛓️',
    category: 'Protocolo D/s',
    description: 'Ceremonia formal para la colocación de un collar, sellando el compromiso de la dinámica y la aceptación mutua de los roles.',
    steps: [
      { stepNumber: 1, title: 'Purificación del Espacio', instruction: 'Encender una vela y limpiar el espacio visual y emocionalmente para marcar el momento.', durationMinutes: 3 },
      { stepNumber: 2, title: 'Intercambio de Votos y Postura', instruction: 'El/La submisivo/a adopta la postura de entrega acordada (ej. de rodillas) y se leen los votos o intenciones.', durationMinutes: 5 },
      { stepNumber: 3, title: 'Colocación del Símbolo', instruction: 'Se coloca el collar alrededor del cuello, pronunciando las palabras de aceptación de propiedad/guía.', durationMinutes: 2, safetyCheck: 'Verificar que el ajuste del collar no limite la respiración o la comodidad (espacio para dos dedos).' },
      { stepNumber: 4, title: 'Reconocimiento y Cierre', instruction: 'Contacto visual prolongado y un gesto de afecto o beso para sellar la ceremonia.', durationMinutes: 3 },
    ],
  },
  {
    id: 'rit-5',
    title: 'Lectura de Contrato D/s',
    emoji: '📜',
    category: 'Protocolo D/s',
    description: 'Revisión y renovación de los acuerdos de la dinámica, límites y expectativas en un entorno formal.',
    steps: [
      { stepNumber: 1, title: 'Apertura de Protocolo', instruction: 'Establecer formalidad mediante vestimenta o postura y declarar el inicio de la sesión de revisión.', durationMinutes: 2 },
      { stepNumber: 2, title: 'Lectura Cláusula por Cláusula', instruction: 'Leer en voz alta los puntos clave del acuerdo, prestando especial atención a límites y expectativas.', durationMinutes: 10 },
      { stepNumber: 3, title: 'Reafirmación y Firma', instruction: 'Confirmar el acuerdo mutuo y firmar o sellar simbólicamente la renovación del compromiso.', durationMinutes: 5, safetyCheck: 'Asegurar que cualquier modificación fue libre de coerción.' },
    ],
  },
  {
    id: 'rit-6',
    title: 'Inspección Formal',
    emoji: '🧐',
    category: 'Protocolo D/s',
    description: 'Evaluación de presentación personal, postura y disposición del submisivo/a antes de una tarea o evento.',
    steps: [
      { stepNumber: 1, title: 'Presentación', instruction: 'El/La sumiso/a se presenta en la postura asignada, esperando pacientemente el escrutinio.', durationMinutes: 2 },
      { stepNumber: 2, title: 'Evaluación Visual y Física', instruction: 'El Dominante realiza una inspección meticulosa del atuendo, aseo personal y postura.', durationMinutes: 5, safetyCheck: 'Mantener la revisión dentro de los límites físicos negociados.' },
      { stepNumber: 3, title: 'Feedback y Correcciones', instruction: 'Señalar aciertos, corregir posturas o instruir mejoras con tono firme pero educativo.', durationMinutes: 3 },
      { stepNumber: 4, title: 'Aprobación Final', instruction: 'Otorgar el permiso para continuar o asignar la tarea correspondiente.', durationMinutes: 1 },
    ],
  },
  {
    id: 'rit-7',
    title: 'Entrega de Llaves (Castidad)',
    emoji: '🗝️',
    category: 'Protocolo D/s',
    description: 'Ritual simbólico y físico de entrega de control sobre la gratificación sexual a través de un dispositivo de castidad.',
    steps: [
      { stepNumber: 1, title: 'Higiene y Colocación', instruction: 'Asegurar que el área y el dispositivo estén limpios antes de la colocación formal.', durationMinutes: 5, safetyCheck: 'Comprobar que la piel no esté irritada y el flujo sanguíneo sea correcto.' },
      { stepNumber: 2, title: 'Bloqueo y Retiro de Llave', instruction: 'Asegurar el candado y entregar la llave al Dominante, con las palabras de renuncia de control.', durationMinutes: 2 },
      { stepNumber: 3, title: 'Custodia de la Llave', instruction: 'El Dominante guarda la llave en un lugar seguro y se acuerda la duración o condición de la retención.', durationMinutes: 2 },
    ],
  },
  {
    id: 'rit-8',
    title: 'Preparación Sensorial',
    emoji: '👁️',
    category: 'Pre-Escena',
    description: 'Aislamiento sensorial progresivo para enfocar la mente en la experiencia física inminente y aumentar la receptividad.',
    steps: [
      { stepNumber: 1, title: 'Bloqueo Visual', instruction: 'Colocar una venda en los ojos de manera delicada pero firme, ajustando la oscuridad.', durationMinutes: 2 },
      { stepNumber: 2, title: 'Aislamiento Auditivo', instruction: 'Colocar tapones o auriculares con música ambiental seleccionada previamente.', durationMinutes: 2 },
      { stepNumber: 3, title: 'Respiración Sincronizada', instruction: 'El Dominante guía 5 ciclos de respiración profunda, tocando un punto de anclaje (ej. el hombro).', durationMinutes: 3 },
      { stepNumber: 4, title: 'Body Scan Rápido', instruction: 'Evaluar tensión en el cuerpo mediante tacto ligero, ayudando a relajar músculos rígidos.', durationMinutes: 3, safetyCheck: 'Confirmar si hay sensación de claustrofobia tras el aislamiento sensorial.' },
    ],
  },
  {
    id: 'rit-9',
    title: 'Negociación Express de 10 Minutos',
    emoji: '⏱️',
    category: 'Pre-Escena',
    description: 'Lista de verificación rápida pero esencial para acordar una escena espontánea de forma segura y consensuada.',
    steps: [
      { stepNumber: 1, title: 'Límites Duros y Blandos', instruction: 'Recordar rápidamente los "no" absolutos (límites duros) y los aspectos negociables de hoy.', durationMinutes: 3 },
      { stepNumber: 2, title: 'Palabras de Seguridad', instruction: 'Reconfirmar palabras de seguridad y cómo comunicar malestar si hay amordazamiento.', durationMinutes: 2, safetyCheck: 'Asegurar el conocimiento del sistema de semáforo o gestos físicos alternativos.' },
      { stepNumber: 3, title: 'Duración e Intensidad', instruction: 'Acordar el tiempo estimado de la escena y el nivel máximo de intensidad esperado (1 al 10).', durationMinutes: 2 },
      { stepNumber: 4, title: 'Necesidades de Aftercare', instruction: 'Planear brevemente qué se necesitará al terminar (agua, mantas, abrazos, silencio).', durationMinutes: 3 },
    ],
  },
  {
    id: 'rit-10',
    title: 'Preparación de Bondage Shibari',
    emoji: '🪢',
    category: 'Pre-Escena',
    description: 'Revisión técnica de equipo y evaluación física antes de iniciar una sesión de ataduras de cuerdas (Shibari/Kinbaku).',
    steps: [
      { stepNumber: 1, title: 'Inspección de Material', instruction: 'Revisar condición de las cuerdas, ordenar las madejas y asegurar tener tijeras EMT a mano.', durationMinutes: 3, safetyCheck: 'Tijeras EMT ubicadas, desenfundadas y visibles.' },
      { stepNumber: 2, title: 'Revisión Anatómica', instruction: 'Hablar sobre lesiones recientes, dolores articulares o zonas sensibles a evitar.', durationMinutes: 3 },
      { stepNumber: 3, title: 'Calentamiento Articular', instruction: 'Realizar rotaciones suaves de hombros, muñecas y cuello para preparar el cuerpo.', durationMinutes: 3 },
      { stepNumber: 4, title: 'Atadura de Anclaje', instruction: 'Realizar una primera atadura sencilla de prueba (ej. single column) para evaluar tensión y reacción.', durationMinutes: 3, safetyCheck: 'Comprobar color de piel, temperatura y pulso distal bajo la cuerda.' },
    ],
  },
  {
    id: 'rit-11',
    title: 'Despertar con Servicio',
    emoji: '☕',
    category: 'Matutino',
    description: 'El sumiso/a inicia el día preparando el desayuno o bebida matutina, integrando actos de servicio desde la mañana.',
    steps: [
      { stepNumber: 1, title: 'Preparación Silenciosa', instruction: 'Levantarse y preparar el café/té y desayuno con atención al detalle y de forma ordenada.', durationMinutes: 10 },
      { stepNumber: 2, title: 'Entrega Formal', instruction: 'Llevar la bebida al Dominante adoptando la postura acordada (ej. de rodillas a un lado de la cama).', durationMinutes: 2 },
      { stepNumber: 3, title: 'Recepción y Aprobación', instruction: 'El Dominante recibe el servicio, prueba y otorga una palabra de reconocimiento o corrección suave.', durationMinutes: 3 },
    ],
  },
  {
    id: 'rit-12',
    title: 'Meditación Dinámica Matutina',
    emoji: '🧘',
    category: 'Matutino',
    description: 'Práctica guiada para enfocar la mente en el intercambio de poder y las intenciones del día, fortaleciendo el vínculo.',
    steps: [
      { stepNumber: 1, title: 'Enraizamiento Conjunto', instruction: 'Sentarse frente a frente, tomarse de las manos y sincronizar la respiración.', durationMinutes: 3 },
      { stepNumber: 2, title: 'Visualización del Intercambio', instruction: 'El Dominante guía verbalmente una visualización sobre la conexión, confianza y el rol de cada uno.', durationMinutes: 5 },
      { stepNumber: 3, title: 'Intención Diaria', instruction: 'Compartir una palabra clave o intención que guiará las acciones de ambos durante la jornada.', durationMinutes: 2 },
    ],
  },
  {
    id: 'rit-13',
    title: 'Baño Ritual Post-Escena',
    emoji: '🛁',
    category: 'Nocturno',
    description: 'Proceso de limpieza física y emocional profunda tras una sesión intensa, para relajar músculos y asentar las emociones.',
    steps: [
      { stepNumber: 1, title: 'Preparación del Agua', instruction: 'Llenar la bañera con agua tibia, añadir sales de Epsom o aceites esenciales relajantes.', durationMinutes: 5 },
      { stepNumber: 2, title: 'Limpieza Cuidadosa', instruction: 'El Dominante lava suavemente al submisivo/a, o viceversa, enfocándose en áreas trabajadas.', durationMinutes: 10, safetyCheck: 'Lavar con extrema suavidad las zonas con marcas o abrasiones leves.' },
      { stepNumber: 3, title: 'Cuidado Corporal', instruction: 'Aplicar crema hidratante, árnica o ungüentos reparadores en marcas y músculos tensos.', durationMinutes: 5 },
      { stepNumber: 4, title: 'Procesamiento Emocional', instruction: 'Conversar de forma calmada sobre las sensaciones experimentadas mientras el cuerpo se destensa.', durationMinutes: 10 },
    ],
  },
  {
    id: 'rit-14',
    title: 'Diario Compartido de Reflexión',
    emoji: '📓',
    category: 'Nocturno',
    description: 'Ejercicio de escritura para procesar el día, expresar gratitud o detallar lecciones aprendidas dentro de la dinámica.',
    steps: [
      { stepNumber: 1, title: 'Tiempo de Escritura', instruction: 'Ambos dedican tiempo a escribir en un diario compartido o personal sobre eventos y sentimientos del día.', durationMinutes: 10 },
      { stepNumber: 2, title: 'Intercambio de Notas', instruction: 'Leer en silencio lo escrito por la otra persona (si es compartido) para entender su perspectiva.', durationMinutes: 5 },
      { stepNumber: 3, title: 'Cierre Verbal', instruction: 'Comentar brevemente un aspecto positivo o constructivo leído, reafirmando el apoyo mutuo.', durationMinutes: 5 },
    ],
  },
  {
    id: 'rit-15',
    title: 'Reconexión Vanilla de Cierre',
    emoji: '🫂',
    category: 'Nocturno',
    description: 'Transición deliberada del espacio de poder D/s a un entorno igualitario o "vanilla" antes de dormir, fomentando el descanso.',
    steps: [
      { stepNumber: 1, title: 'Cambio de Vestimenta', instruction: 'Retirar cualquier elemento de la dinámica (collares de día, ropa de escena) y ponerse ropa cómoda de dormir.', durationMinutes: 3 },
      { stepNumber: 2, title: 'Charla Ligera', instruction: 'Hablar de temas completamente externos a la dinámica: trabajo, hobbies, planes futuros.', durationMinutes: 10 },
      { stepNumber: 3, title: 'Abrazo Desestructurado', instruction: 'Acurrucarse en la cama sin formalidades ni etiquetas de rol, simplemente disfrutando de la compañía del otro.', durationMinutes: 5 },
    ],
  }
];
