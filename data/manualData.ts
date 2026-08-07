export interface ManualModule {
  id: string;
  title: string;
  category: string;
  description: string;
  summary: string;
  keyFeatures: string[];
  stepByStepGuide: string[];
  practicalExample: string;
  tags: string[];
  icon?: string;
  subtitle?: string;
  keywords?: string[];
  features?: string[];
  steps?: Array<{ stepNumber: number; title: string; description: string }>;
  callout?: { type: 'tip' | 'warning'; text: string };
  actionRoute?: string;
  actionLabel?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface ManualArea {
  id: string;
  title: string;
  icon: string;
  description: string;
  moduleIds: string[];
}

export const MANUAL_AREAS: ManualArea[] = [
  {
    id: 'area_1_security',
    title: 'Area 1: Protocolos de Seguridad & Salud',
    icon: '🛡️',
    description: 'Herramientas críticas para salvaguardar la integridad física y emocional durante sesiones BDSM, comunicación de límites y marcos éticos.',
    moduleIds: [
      'mod_safewords_traffic',
      'mod_panic_timer',
      'mod_voice_checkin',
      'mod_ssc_rack_framework',
      'mod_scene_debrief',
    ],
  },
  {
    id: 'area_2_questionnaire',
    title: 'Area 2: Cuestionario & Ruleta de Citas',
    icon: '🎰',
    description: 'Herramientas para catalogar preferencias, descubrir intereses compatibles mediante ludificación, tarjetas deslizables y ruletas temáticas.',
    moduleIds: [
      'mod_questionnaire_catalogue',
      'mod_swipe_deck',
      'mod_scene_roulette',
      'mod_compatibility_matrix',
      'mod_wishlist_custom',
    ],
  },
  {
    id: 'area_3_connections',
    title: 'Area 3: Conexiones & Dating',
    icon: '🔗',
    description: 'Buscadores de perfiles por roles fetichistas, filtros avanzados por kinks y desacuerdos, chat cifrado y comparador de grupos poliamorosos.',
    moduleIds: [
      'mod_role_explorer',
      'mod_kink_filters',
      'mod_encrypted_chat',
      'mod_kink_feed',
      'mod_poly_comparator',
    ],
  },
  {
    id: 'area_4_chastity_hw',
    title: 'Area 4: Castidad & Hardware',
    icon: '🔒',
    description: 'Integración con dispositivos Bluetooth IoT (QIUI Cellmate, Lovense), verificaciones fotográficas con timestamp y solicitudes de permisos.',
    moduleIds: [
      'mod_chastity_timestamp',
      'mod_push_requests',
      'mod_qiui_cellmate',
      'mod_lovense_control',
      'mod_gear_closet',
    ],
  },
  {
    id: 'area_5_negotiation',
    title: 'Area 5: Negociación en Vivo & Firma Digital',
    icon: '📝',
    description: 'Formulación formal de contratos consensuados, negociación colaborativa en tiempo real, firma digital SHA-256 y plantillas de escena.',
    moduleIds: [
      'mod_realtime_negotiation',
      'mod_crypto_signature',
      'mod_scene_templates',
      'mod_scene_planner',
      'mod_pass_and_play',
    ],
  },
  {
    id: 'area_6_vault_admin',
    title: 'Area 6: Bóveda Cifrada Zero-Knowledge & Administración',
    icon: '🔐',
    description: 'Almacenamiento Zero-Knowledge cifrado en local (AES-GCM-256), control granular de revelado de datos, panel de administración y sandbox IA.',
    moduleIds: [
      'mod_zero_knowledge_vault',
      'mod_permission_granularity',
      'mod_admin_dashboard',
      'mod_anon_export',
      'mod_ai_roleplay_sandbox',
    ],
  },
];

export const MANUAL_MODULES: ManualModule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 1: Protocolos de Seguridad & Salud
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_safewords_traffic',
    title: 'Sistema de Safewords de Semáforo (Verde, Amarillo, Rojo)',
    category: 'Protocolos de Seguridad & Salud',
    description: 'Protocolo de comunicación rápida mediante código de colores estandarizado internacionalmente para indicar el nivel de comodidad y límites durante una escena BDSM.',
    summary: 'Permite evaluar y comunicar el estado físico y emocional instantáneamente sin romper el ambiente erótico salvo en emergencias.',
    keyFeatures: [
      'Respuesta de un solo toque en pantalla o mediante comandos por voz',
      'Configuración de safewords personalizadas (palabras clave alternas)',
      'Código de colores de alta visibilidad: Verde (Continuar), Amarillo (Pausar/Ajustar), Rojo (Parar inmediatamente)',
      'Registro auditables de alertas y eventos durante el historial de la escena',
    ],
    stepByStepGuide: [
      '1. Iniciar el modo "Escena en Curso" o la herramienta de Timer de Escena.',
      '2. Visualizar los tres botones de safeword en el HUD principal de seguridad.',
      '3. Si la intensidad es adecuada, presionar o vocalizar "VERDE".',
      '4. Si se requiere ajustar posición, pausar o bajar intensidad, decir "AMARILLO". La app emitirá un tono de aviso sutil.',
      '5. En caso de incomodidad, dolor no negociado o peligro, presionar o decir "ROJO". La app activará vibración continua, sonido de paro y pausará el temporizador.',
    ],
    practicalExample: `const handleSafewordPress = (color: 'green' | 'yellow' | 'red') => {
  if (color === 'red') {
    Vibration.vibrate([0, 500, 200, 500]);
    stopSceneTimer();
    triggerEmergencyScreen();
  } else if (color === 'yellow') {
    logSceneEvent('PAUSE_REQUESTED');
    notifyDominant('Bajar intensidad / Verificar postura');
  }
};`,
    tags: ['safeword', 'seguridad', 'semaforo', 'verde', 'amarillo', 'rojo', 'emergencia', 'consentimiento'],
  },
  {
    id: 'mod_panic_timer',
    title: 'Temporizador de Pánico & Alarma de Inactividad',
    category: 'Protocolos de Seguridad & Salud',
    description: 'Cronómetro inteligente programable con temporizadores regresivos para verificar el estado de los participantes en intervalos fijos.',
    summary: 'Previene accidentes por pérdida de conocimiento o falta de respuesta durante ataduras (bondage) o restricción sensorial.',
    keyFeatures: [
      'Intervalos de check-in configurables (3 min, 5 min, 10 min, 15 min)',
      'Vibración progresiva y tonos sutiles de aviso previo',
      'Escala automática a alarma sonora estridente si no hay confirmación activa en 30 segundos',
      'Envío automático de notificación a contacto de emergencia de confianza en caso de inactividad prolongada',
    ],
    stepByStepGuide: [
      '1. Abrir la herramienta SceneTimerModal desde el panel de seguridad.',
      '2. Seleccionar la duración estimada de la escena y el intervalo de check-in (ej. 5 minutos).',
      '3. Iniciar el temporizador antes de aplicar ataduras o restricción física.',
      '4. Al cumplirse cada intervalo, la app emitirá un pulso háptico suave solicitando toque en pantalla o respuesta vocal.',
      '5. Si no se confirma en 30 segundos, el sistema entra en modo Alarma de Pánico.',
    ],
    practicalExample: `useEffect(() => {
  if (secondsElapsed > 0 && secondsElapsed % (checkInIntervalMinutes * 60) === 0) {
    triggerCheckInPrompt();
    startEmergencyCountdownTimer(30); // 30s para responder antes de activar alarma
  }
}, [secondsElapsed]);`,
    tags: ['panico', 'temporizador', 'check-in', 'alerta', 'inactividad', 'bondage_safe', 'timer'],
  },
  {
    id: 'mod_voice_checkin',
    title: 'Check-in de Voz Hands-Free con Reconocimiento',
    category: 'Protocolos de Seguridad & Salud',
    description: 'Reconocimiento de voz continuo y pasivo en segundo plano para procesar respuestas verbales sin necesidad de tocar la pantalla.',
    summary: 'Esencial cuando la persona sumisa o atada no tiene acceso a sus manos para presionar la pantalla.',
    keyFeatures: [
      'Detección por micrófono de palabras clave ("Verde", "Amarillo", "Rojo", "Status")',
      'Algoritmo de filtrado de ruido ambiental para evitar falsos positivos',
      'Indicador visual de escucha activa en la interfaz',
      'Soporte para frases de seguridad personalizadas',
    ],
    stepByStepGuide: [
      '1. Activar el interruptor "Check-in de Voz Hands-Free" en la configuración de la escena.',
      '2. Otorgar permisos de micrófono a la aplicación.',
      '3. Posicionar el teléfono a una distancia menor a 2 metros del área de la escena.',
      '4. Durante el prompt de check-in, responder con voz clara "VERDE" o la safeword acordada.',
      '5. La app reconocerá la voz, registrará "Check-in Exitoso" y reiniciará el temporizador.',
    ],
    practicalExample: `const startVoiceListening = () => {
  VoiceRecognition.start({
    keywords: ['verde', 'amarillo', 'rojo', 'stop', 'socorro'],
    onResult: (detectedWord) => {
      if (detectedWord === 'rojo' || detectedWord === 'stop') {
        triggerPanicMode();
      } else if (detectedWord === 'verde') {
        confirmCheckInSuccess();
      }
    }
  });
};`,
    tags: ['voz', 'hands-free', 'reconocimiento', 'ataduras', 'handsfree', 'mic', 'audio'],
  },
  {
    id: 'mod_ssc_rack_framework',
    title: 'Marcos SSC (Sano, Seguro, Consensuado) & RACK (Riesgo Aceptado)',
    category: 'Protocolos de Seguridad & Salud',
    description: 'Guía interactiva y matriz de evaluación de riesgos basada en los principios éticos SSC (Safe, Sane, Consensual) y RACK (Risk-Aware Consensual Kink).',
    summary: 'Educa y ayuda a clasificar actividades según su nivel intrínseco de riesgo físico y emocional.',
    keyFeatures: [
      'Evaluación de nivel de riesgo por actividad (Bajo, Medio, Alto)',
      'Calculadora de mitigación de daños (Safety tips & Equipo recomendado)',
      'Declaración de consentimiento expreso RACK con firma de riesgo informado',
      'Módulos de primeros auxilios BDSM integrados (cortes de cuerda, marcas, quemaduras de cera)',
    ],
    stepByStepGuide: [
      '1. Acceder a Guía de Seguridad desde el menú principal o al inspeccionar una actividad avanzada.',
      '2. Seleccionar el marco ético preferido (SSC para principiantes/intermedios, RACK para prácticas de riesgo elevado).',
      '3. Revisar los puntos de chequeo de seguridad obligatorios antes de la práctica.',
      '4. Marcar la casilla de verificación de equipo de emergencia listo (ej. tijeras de rescate, agua, botiquín).',
    ],
    practicalExample: `interface RiskAssessment {
  activityId: string;
  riskLevel: 'low' | 'medium' | 'high';
  framework: 'SSC' | 'RACK';
  mitigationChecklist: string[];
}`,
    tags: ['ssc', 'rack', 'riesgo', 'primeros_auxilios', 'consensuado', 'salud', 'educacion'],
  },
  {
    id: 'mod_scene_debrief',
    title: 'Debriefing Emocional & Protocolo Afterdrop',
    category: 'Protocolos de Seguridad & Salud',
    description: 'Sistema post-escena estructurado para evaluar el estado emocional, físico y brindar cuidados posteriores (Aftercare).',
    summary: 'Ayuda a prevenir y gestionar el "Sub Drop" o "Top Drop" mediante seguimiento durante las 24-48 horas posteriores.',
    keyFeatures: [
      'Formulario de evaluación rápida post-escena (1 a 5 estrellas + notas)',
      'Checklist de Aftercare (Abrazos, té/hidratación, manta, validación verbal)',
      'Programador de Check-in de 24h y 48h para detectar bajones emocionales tardíos',
      'Exportación de registro diario de bienestar físico y muscular',
    ],
    stepByStepGuide: [
      '1. Al finalizar la escena, presionar "Finalizar & Abrir Debriefing".',
      '2. Responder las preguntas de estado: Nivel de satisfacción, zonas doloridas, hidratación.',
      '3. Marcar las actividades de aftercare completadas.',
      '4. Programar un recordatorio en la app para el "Afterdrop Check-in" del día siguiente.',
    ],
    practicalExample: `const submitDebrief = async (debriefData: SceneDebriefData) => {
  await saveDebriefToSession(debriefData);
  if (debriefData.emotionalState === 'vulnerable') {
    scheduleNotification('Check-in emocional de 24h: ¿Cómo te sientes hoy?', 24 * 3600);
  }
};`,
    tags: ['debriefing', 'aftercare', 'afterdrop', 'emocional', 'cuidado', 'post-escena', 'sub_drop'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 2: Cuestionario & Ruleta de Citas
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_questionnaire_catalogue',
    title: 'Catálogo Extensivo de 158+ Actividades Kink & BDSM',
    category: 'Cuestionario & Ruleta de Citas',
    description: 'Cuestionario completo divido en 12 categorías clave con calificación de 5 niveles e intensidad.',
    summary: 'Permite declarar gustos de forma asimétrica y privada sin exponerse antes del match mutuo.',
    keyFeatures: [
      '158+ actividades precargadas + creador de actividades personalizadas',
      'Escala de 5 niveles: Límite Duro (-2), No me interesa (-1), Curiosidad (0), Me gusta (1), Me encanta (2)',
      'Selección de rol (Dar/Dominar, Recibir/Sumiso, Ambos, Flexible) e intensidad (1 a 5)',
      'Agrupación por 4 atmósferas / moods (Sensual, Poder, Fantasía, Romántico)',
    ],
    stepByStepGuide: [
      '1. Entrar a Cuestionario y seleccionar la categoría deseada o el modo "Ver Todas".',
      '2. Deslizar o tocar una tarjeta de actividad (ej. "Shibari").',
      '3. Seleccionar la calificación, el rol deseado y el nivel de intensidad deseado.',
      '4. Opcional: Agregar una nota privada que solo tú podrás ver en tu reporte.',
      '5. Guardar progreso. Los datos se cifran localmente.',
    ],
    practicalExample: `const response: ActivityResponse = {
  activityId: 'bo_rope',
  rating: 'love',
  role: 'receive',
  intensity: 4,
  privateNote: 'Me interesa probar arneses de pecho en yute suave'
};`,
    tags: ['cuestionario', 'actividades', 'kinks', 'catalogo', 'rating', 'roles', 'intensidad'],
  },
  {
    id: 'mod_swipe_deck',
    title: 'Mazo Swipe Deck (Evaluación Rápida Estilo Tarjetas)',
    category: 'Cuestionario & Ruleta de Citas',
    description: 'Interfaz interactiva de tarjetas deslizables estilo Tinder/Bumble para calificar actividades rápidamente con gestos táctiles.',
    summary: 'Acelera la respuesta del cuestionario convirtiéndolo en una experiencia ágil y divertida.',
    keyFeatures: [
      'Gestos intuitivos: Deslizar a la derecha (Me gusta), Izquierda (No me interesa), Arriba (Me encanta), Abajo (Límite duro)',
      'Controles virtuales complementarios para pantallas de escritorio',
      'Micro-animaciones y retroalimentación háptica en cada respuesta',
      'Contador de progreso en vivo y filtro por categorías durante el swipe',
    ],
    stepByStepGuide: [
      '1. En la pantalla del cuestionario, cambiar al modo de vista "Mazo Swipe".',
      '2. Visualizar la tarjeta actual con su título, descripción, nivel de riesgo y emojis.',
      '3. Deslizar la tarjeta en la dirección correspondiente según tu inclinación.',
      '4. Configurar el rol e intensidad en la pequeña barra inferior si la calificación es positiva.',
    ],
    practicalExample: `const onSwipeComplete = (direction: 'right' | 'left' | 'up' | 'down') => {
  const ratingMap = { right: 'like', left: 'not_interested', up: 'love', down: 'hard_limit' };
  saveResponse(currentActivity.id, ratingMap[direction]);
  advanceToNextCard();
};`,
    tags: ['swipe', 'mazo', 'tarjetas', 'gestos', 'evaluacion_rapida', 'tinder_style'],
  },
  {
    id: 'mod_scene_roulette',
    title: 'Ruleta Estocástica de Escenas por Atmósferas',
    category: 'Cuestionario & Ruleta de Citas',
    description: 'Generador aleatorio de ideas para citas y escenas filtrado exclusivamente por las coincidencias mutuas aprobadas entre ambos participantes.',
    summary: 'Elimina la indecisión al sugerir actividades divertidas o intensas que a ambos les encantan.',
    keyFeatures: [
      'Animación visual de ruleta giratoria con efectos sonoros',
      'Filtro selector por atmósfera (Sensual, Adrenalina, Fantasía, Romántico)',
      'Exclusión automática de límites duros de cualquiera de los participantes',
      'Botón instantáneo "Planificar esta Escena" que llena la plantilla de negociación',
    ],
    stepByStepGuide: [
      '1. Abrir SceneRouletteModal desde el menú principal o la pantalla de Reporte.',
      '2. Elegir una atmósfera (ej. "⚡ Poder & Adrenalina") o seleccionar "Todas".',
      '3. Presionar el botón "¡Girar Ruleta!".',
      '4. La ruleta girará y seleccionará una actividad en la que ambos tengan match.',
      '5. Presionar "Aceptar Sugerencia" para abrir el temporizador o planificador.',
    ],
    practicalExample: `const getRandomMatch = (report: CompatibilityReport, mood?: ActivityMood) => {
  const validMatches = report.items.filter(item => 
    (item.section === 'mutual_match' || item.section === 'explore_together') &&
    (!mood || getActivityMoods(item.activityId).includes(mood))
  );
  return validMatches[Math.floor(Math.random() * validMatches.length)];
};`,
    tags: ['ruleta', 'citas', 'juego', 'azar', 'sugerencia', 'escenas', 'atmosphera'],
  },
  {
    id: 'mod_compatibility_matrix',
    title: 'Matriz Algorítmica de Compatibilidad & Brújula Kink',
    category: 'Cuestionario & Ruleta de Citas',
    description: 'Algoritmo matemático que procesa las respuestas de dos usuarios para calcular un score de compatibilidad (0-100%) y proyectar sus arqueotipos en un eje cartesiano 2D.',
    summary: 'Transforma datos de respuestas en un informe visual claro clasificando coincidencias, exploraciones y conflictos.',
    keyFeatures: [
      'Porcentaje global de compatibilidad ponderado por valoración e intensidad',
      'Visualización en Brújula 2D (Eje X: Dominante <-> Sumiso, Eje Y: Sensual <-> Intenso)',
      'Desglose por 6 secciones del reporte (Match Mutuo, Explorar Juntos, Solo Tus Intereses, Intereses del Invitado, Conflicto de Límites, Desalineación de Roles)',
      'Matriz de calor (heatmap) por categorías',
    ],
    stepByStepGuide: [
      '1. Completar el cuestionario e invitar a la pareja mediante código de 6 caracteres.',
      '2. Una vez que la pareja responde, navegar a la pantalla Reporte.',
      '3. Observar el puntaje de compatibilidad global y la posición de ambos en el gráfico de la Brújula.',
      '4. Explorar los acordeones desplegables para ver detalles específicos de cada actividad.',
    ],
    practicalExample: `export function calculateCompassPoint(responses: ActivityResponse[]): { x: number; y: number } {
  // X: Dominante (-100) a Sumiso (+100)
  // Y: Sensual (-100) a Intenso (+100)
  return computeCartesianCoordinates(responses);
}`,
    tags: ['matriz', 'compatibilidad', 'brujula', 'compass', 'algoritmo', 'reporte', 'score'],
  },
  {
    id: 'mod_wishlist_custom',
    title: 'Wishlist Privada & Creador de Actividades Custom',
    category: 'Cuestionario & Ruleta de Citas',
    description: 'Módulo para agregar kinks o fantasías personalizadas que no estén precargadas en el catálogo base y gestionar una lista de deseos priorizada.',
    summary: 'Brinda flexibilidad ilimitada para adaptar la aplicación a nichos o dinámicas muy específicas.',
    keyFeatures: [
      'Formulario para crear actividades con título, categoría, descripción y tips de seguridad',
      'Marcado de ítems favoritos en Wishlist con nivel de prioridad (Alta, Media, Deseo)',
      'Sincronización automática de actividades custom en sesiones de reporte',
      'Opciones de ocultación o encriptación extra para la Wishlist personal',
    ],
    stepByStepGuide: [
      '1. En el Cuestionario, presionar el botón + Actividad Personalizada.',
      '2. Ingresar el nombre de la práctica (ej. "Juego con cera de soja perfumada"), categoría y nivel de riesgo.',
      '3. Guardar la actividad. Aparecerá inmediatamente etiquetada como [Personalizada].',
      '4. Asignarle tu calificación y agregarla a tu Wishlist.',
    ],
    practicalExample: `const newCustomActivity: Activity = {
  id: \`custom_\${Date.now()}\`,
  category: 'sensation',
  name: 'Juego de plumas con antifaz térmico',
  description: 'Estimulación táctil guiada por música suave.',
  riskLevel: 'low'
};
registerCustomActivity(newCustomActivity);`,
    tags: ['wishlist', 'custom', 'personalizado', 'fantasias', 'deseos', 'creador'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 3: Conexiones & Dating
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_role_explorer',
    title: 'Buscador de Perfiles por Roles FetLife-Style',
    category: 'Conexiones & Dating',
    description: 'Explorador de perfiles de la comunidad categorizados por roles tradicionales BDSM/Kink (Dominante, Sumiso/a, Switch, Rigging Top, Bunny, Keyholder, Pet, etc.).',
    summary: 'Permite encontrar compañeros de escena o parejas según la dinámica de relación buscada.',
    keyFeatures: [
      'Filtrado por roles primarios y secundarios estilo FetLife',
      'Nivel de experiencia declarado (Principiante, Intermedio, Avanzado)',
      'Vista de tarjetas de perfil con pronombres, bio y compatibilidad estimada',
      'Modo "Incógnito" para explorar sin revelar presencia pública',
    ],
    stepByStepGuide: [
      '1. Navegar a la sección Dating / Conexiones (app/dating.tsx).',
      '2. Seleccionar la pestaña "Explorar Perfiles".',
      '3. Aplicar el filtro de rol (ej. Seleccionar "Rigging Top" o "Keyholder").',
      '4. Inspeccionar las tarjetas de perfiles públicos de la comunidad.',
    ],
    practicalExample: `const filteredProfiles = communityProfiles.filter(profile => 
  filterRole === 'all' || profile.role === filterRole
);`,
    tags: ['dating', 'roles', 'fetlife', 'dominante', 'sumiso', 'switch', 'perfiles', 'busqueda'],
  },
  {
    id: 'mod_kink_filters',
    title: 'Filtros Avanzados por Kinks & Nivel de Intensidad',
    category: 'Conexiones & Dating',
    description: 'Motor de búsqueda mutua que cruza perfiles en función de kinks específicos de interés o límites compartidos.',
    summary: 'Evita perder tiempo con perfiles incompatibles al filtrar por acuerdos fundamentales previo al contacto.',
    keyFeatures: [
      'Filtro de "Kinks Obligatorios" (Must-Haves) y "Límites Incompatibles" (Deal-Breakers)',
      'Filtro por nivel de experiencia deseado en la pareja',
      'Filtro de disponibilidad para escenas presenciales o relación a distancia',
      'Ordenamiento por porcentaje de afinidad teórica',
    ],
    stepByStepGuide: [
      '1. En la pantalla de Dating, presionar el icono de "Filtros Avanzados".',
      '2. Seleccionar hasta 3 kinks clave que deben estar en "Me gusta" o "Me encanta" del otro perfil.',
      '3. Indicar si deseas excluir perfiles que tengan ciertos límites duros.',
      '4. Aplicar filtros para actualizar el listado de conexiones en tiempo real.',
    ],
    practicalExample: `const matches = communityProfiles.filter(p => 
  requiredKinks.every(kinkId => p.topKinks.includes(kinkId)) &&
  !p.hardLimits.some(limitId => myInterests.includes(limitId))
);`,
    tags: ['filtros', 'kinks', 'busqueda_avanzada', 'match', 'dealbreakers', 'afinidad'],
  },
  {
    id: 'mod_encrypted_chat',
    title: 'Chat Directo Cifrado E2E con Mensajes Temporales',
    category: 'Conexiones & Dating',
    description: 'Canal de mensajería punto a punto cifrado mediante claves efímeras para acordar detalles de escenas de forma 100% confidencial.',
    summary: 'Protege la privacidad de las conversaciones eróticas y la negociación previa sin intermediarios.',
    keyFeatures: [
      'Cifrado E2E en el cliente (ningún servidor lee los mensajes)',
      'Temporizador de autodestrucción de mensajes (Ephemerality)',
      'Bloqueo de capturas de pantalla en dispositivos compatibles',
      'Envío seguro de notas de voz y fotos cifradas',
    ],
    stepByStepGuide: [
      '1. Seleccionar un perfil conectado y presionar "Iniciar Chat Seguro".',
      '2. Se genera un par de llaves criptográficas únicas para la sesión de chat.',
      '3. Escribir mensajes o enviar audios de negociación.',
      '4. Configurar la autodestrucción (ej. "Borrar 1 hora después de leer").',
    ],
    practicalExample: `const sendMessage = async (text: string) => {
  const encrypted = await encryptMessageE2E(text, recipientPublicKey);
  websocket.send({ payload: encrypted, ephemeralTtl: 3600 });
};`,
    tags: ['chat', 'cifrado', 'e2e', 'mensajeria', 'privacidad', 'efimero', 'mensajes'],
  },
  {
    id: 'mod_kink_feed',
    title: 'Feed Comunitario de Tendencias & Eventos BDSM',
    category: 'Conexiones & Dating',
    description: 'Muro de noticias, eventos (munches, talleres, workshops de shibari) y publicaciones de la comunidad respetando el anonimato.',
    summary: 'Mantiene informados a los usuarios sobre actividades locales y virtuales de la subcultura Kink.',
    keyFeatures: [
      'Calendario de Munches y eventos locales con mapa de ubicación segura',
      'Publicaciones educativas escritas por educadores y organizadores verificados',
      'Votaciones de tendencias de la comunidad (ej. kinks más populares del mes)',
      'Sistema de confirmación de asistencia privada (RSVP discreto)',
    ],
    stepByStepGuide: [
      '1. Abrir la pantalla Kink Feed (app/kink-feed.tsx).',
      '2. Explorar las pestañas "Eventos Cercanos", "Educación" y "Tendencias".',
      '3. Presionar en un evento de Munch para ver horarios, código de vestimenta y reglas del lugar.',
      '4. Confirmar asistencia en modo anónimo si deseas recibir recordatorios.',
    ],
    practicalExample: `interface KinkEvent {
  id: string;
  title: string;
  location: string;
  dateIso: string;
  dressCode: string;
  isDiscreetRSVP: boolean;
}`,
    tags: ['feed', 'eventos', 'munch', 'comunidad', 'talleres', 'tendencias', 'noticias'],
  },
  {
    id: 'mod_poly_comparator',
    title: 'Comparador Poliamoroso & Dinámicas de Grupo',
    category: 'Conexiones & Dating',
    description: 'Herramienta multi-perfil capaz de cruzar respuestas de 3 o más personas simultáneamente para identificar zonas de solapamiento mutuo en grupos o relaciones poliamorosas.',
    summary: 'Resuelve la complejidad de negociar dinámicas de trío, cuatriadas o comunas kinky sin dejar a nadie fuera.',
    keyFeatures: [
      'Soporte para vincular de 3 a 8 perfiles en una misma matriz de reporte',
      'Diagrama de Venn de compatibilidad grupal interactivo',
      'Identificación de "Interés Unánime" vs "Interés Parcial"',
      'Alerta de conflictos de límites duros si al menos 1 integrante marcó límite',
    ],
    stepByStepGuide: [
      '1. Abrir PolyComparatorModal desde el menú de opciones avanzadas.',
      '2. Seleccionar los códigos de sesión de los 3 o más integrantes del grupo.',
      '3. Presionar "Calcular Matriz Grupal".',
      '4. Inspeccionar la lista de actividades marcadas con el sello "100% Aprobado por Todos".',
    ],
    practicalExample: `const getGroupConsensus = (sessions: Session[], activityId: string) => {
  const ratings = sessions.map(s => getRatingForActivity(s, activityId));
  const hasHardLimit = ratings.some(r => r === 'hard_limit');
  const allLoveOrLike = ratings.every(r => r === 'like' || r === 'love');
  return { isSafeForGroup: !hasHardLimit, isUnanimous: allLoveOrLike };
};`,
    tags: ['poliamor', 'poly', 'grupos', 'triada', 'multi_user', 'matriz_grupal', 'venn'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 4: Castidad & Hardware
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_chastity_timestamp',
    title: 'Verificación Fotográfica con Marca de Agua Criptográfica',
    category: 'Castidad & Hardware',
    description: 'Módulo de captura de cámara segura que estampa coordenadas temporales, código hash anti-manipulación y estado de piel sobre la fotografía de control.',
    summary: 'Permite al usuario portador (wearer) demostrar su estado de castidad o cuidado higiénico a su poseedor de llave (keyholder) sin falsificaciones.',
    keyFeatures: [
      'Generación de marca de agua indeleble con fecha, hora exacta UTC y token de sesión',
      'Hash de verificación SHA-256 para prevenir alteración con programas de edición',
      'Formulario de autoevaluación de salud cutánea (Excelente, Irritación leve, Requiere descanso)',
      'Almacenamiento local privado en la bóveda o envío cifrado al Keyholder',
    ],
    stepByStepGuide: [
      '1. En la pantalla Chastity (app/chastity.tsx), seleccionar la pestaña "Verificación de Foto".',
      '2. Presionar "Tomar Foto de Check-in".',
      '3. Capturar la imagen utilizando la cámara de la app.',
      '4. Seleccionar el estado de la piel e ingresar observaciones.',
      '5. Enviar al Keyholder. Se aplicará el timestamp automático.',
    ],
    practicalExample: `const watermarkData = {
  timestamp: new Date().toISOString(),
  keyholderId: 'kh_772',
  hash: sha256(photoBase64 + timestamp)
};`,
    tags: ['castidad', 'chastity', 'verificacion', 'foto', 'timestamp', 'keyholder', 'wearer'],
  },
  {
    id: 'mod_push_requests',
    title: 'Sistema de Solicitudes Push de Liberación & Permisos',
    category: 'Castidad & Hardware',
    description: 'Canal de notificaciones push prioritarias para enviar solicitudes formales de apertura de candado, tiempo de higiene o recompensas.',
    summary: 'Organiza las peticiones del wearer y permite al keyholder conceder o denegar solicitudes de forma instantánea.',
    keyFeatures: [
      'Plantillas de solicitud: "Limpieza e Higiene (30 min)", "Permiso de Salida", "Petición de Clímax"',
      'Botones de respuesta rápida para el Keyholder en la notificación Push (Conceder, Denegar, Extender tiempo)',
      'Contador regresivo de tiempo concedido con alerta de cierre de ventana',
      'Historial de concesiones y denegaciones auditables',
    ],
    stepByStepGuide: [
      '1. El Wearer presiona "Solicitar Liberación Temporal" en la interfaz de Castidad.',
      '2. Elige la razón (ej. "Baño & Mantenimiento") y el tiempo deseado (30 min).',
      '3. La app envía una alerta Push inmediata al smartphone del Keyholder.',
      '4. El Keyholder presiona "Aprobar 30 Minutos" directamente desde la notificación.',
      '5. Se inicia el temporizador de ventana de liberación.',
    ],
    practicalExample: `const sendReleaseRequest = async (reason: string, durationMinutes: number) => {
  await pushNotificationService.sendToUser(keyholderToken, {
    title: '🔑 Solicitud de Liberación',
    body: \`Razón: \${reason} (\${durationMinutes} mins)\`,
    actions: [{ id: 'approve', title: 'Aprobar' }, { id: 'deny', title: 'Denegar' }]
  });
};`,
    tags: ['push', 'solicitudes', 'liberacion', 'permisos', 'keyholder', 'notificaciones'],
  },
  {
    id: 'mod_qiui_cellmate',
    title: 'Integración Bluetooth QIUI Cellmate & Chaster API',
    category: 'Castidad & Hardware',
    description: 'Conexión directa mediante Bluetooth Low Energy (BLE) y WebBluetooth con candados electrónicos QIUI Cellmate 1/2 y sincronización con Chaster.app.',
    summary: 'Permite bloquear, desbloquear y monitorear el estado del candado físico desde la app o conceder el control al Keyholder a distancia.',
    keyFeatures: [
      'Escaneo e integración BLE para QIUI Cellmate 2 y Cellmate Pro',
      'Integración con API v2 de Chaster.app mediante tokens OAuth2',
      'Lectura de nivel de batería y sensor de manipulación física',
      'Protocolo de emergencia para desbloqueo por safeword o PIN máster',
    ],
    stepByStepGuide: [
      '1. Ir a la pantalla Hardware (app/hardware.tsx).',
      '2. Encender el Bluetooth del dispositivo y presionar "Escanear Dispositivos BLE".',
      '3. Seleccionar "QIUI Cellmate 2" de la lista de dispositivos encontrados.',
      '4. Vincular el dispositivo y verificar el estado del pasador (Bloqueado/Desbloqueado).',
    ],
    practicalExample: `const connectQIUIDevice = async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'Cellmate' }],
    optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
  });
  await device.gatt.connect();
};`,
    tags: ['qiui', 'cellmate', 'bluetooth', 'ble', 'chaster', 'candado', 'hardware'],
  },
  {
    id: 'mod_lovense_control',
    title: 'Telecontrol de Juguetes Lovense & Haptic Feedback API',
    category: 'Castidad & Hardware',
    description: 'Módulo de control remoto de vibradores y estimuladores de la marca Lovense (Lush, Domi, Max, Nora) mediante API local/cloud y patrones vibratorios.',
    summary: 'Habilita experiencias de estimulación a distancia sintonizadas con la intensidad pactada en la negociación.',
    keyFeatures: [
      'Conexión vía Lovense Connect API y Bluetooth directo',
      'Creador de patrones de vibración personalizados con curvas de frecuencia',
      'Sincronización de vibración según la música o el ritmo cardíaco',
      'Modo "Control por la Pareja" mediante enlace QR cifrado',
    ],
    stepByStepGuide: [
      '1. Conectar el juguete Lovense en la sección Hardware.',
      '2. Seleccionar el modo de control: "Manual", "Patrones Preconfigurados" o "Telecontrol Remoto".',
      '3. Si es a distancia, enviar la URL de invitación única a la pareja.',
      '4. La pareja podrá manipular la barra de intensidad en tiempo real desde su dispositivo.',
    ],
    practicalExample: `const sendLovenseCommand = async (command: 'Vibrate', level: number) => {
  await fetch(\`https://127-0-0-1.lovense.club:30010/command\`, {
    method: 'POST',
    body: JSON.stringify({ command: 'Function', action: \`Vibrate:\${level}\`, timeSec: 0 })
  });
};`,
    tags: ['lovense', 'vibrador', 'lush', 'domi', 'telecontrol', 'haptic', 'remoto'],
  },
  {
    id: 'mod_gear_closet',
    title: 'Armario Virtual de Equipamiento & Mantenimiento Higiénico',
    category: 'Castidad & Hardware',
    description: 'Registro y catálogo privado de juguetes, arneses, cuerdas y candados poseídos con recordatorios de desinfección y mantenimiento.',
    summary: 'Ayuda a mantener una lista de inventario disponible para planificar escenas y asegurar la higiene de los materiales.',
    keyFeatures: [
      'Inventario categorizado (Cuerdas, Impacto, Juguetes de silicona, Metal/Candados, Cuero)',
      'Registro de material y compatibilidad de lubricantes (Silicona vs Agua)',
      'Programador de mantenimiento e higiene (ej. desinfección de juguetes, aceitado de cuerdas de yute)',
      'Vinculación directa con las actividades del cuestionario que los requieren',
    ],
    stepByStepGuide: [
      '1. Entrar a Gear Closet (app/gear-closet.tsx).',
      '2. Presionar + Agregar Equipamiento.',
      '3. Indicar el nombre (ej. "Flogger de cuero negro 45cm"), material y fecha del último lavado.',
      '4. Vincular el objeto a la actividad "Impacto - Flogger".',
    ],
    practicalExample: `interface GearItem {
  id: string;
  name: string;
  category: 'rope' | 'impact' | 'silicone_toy' | 'metal_lock' | 'leather';
  material: string;
  compatibleLube: 'water_based' | 'silicone_based' | 'both' | 'none';
  lastCleanedIso: string;
}`,
    tags: ['gear', 'armario', 'inventario', 'juguetes', 'mantenimiento', 'higiene', 'closet'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 5: Negociación en Vivo & Firma Digital
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_realtime_negotiation',
    title: 'Negociación Consensuada en Tiempo Real (Live Sync)',
    category: 'Negociación en Vivo & Firma Digital',
    description: 'Sala de negociación colaborativa síncrona donde dos o más participantes ajustan límites, roles e intensidades en una misma pantalla.',
    summary: 'Permite acordar los términos exactos de una escena de forma ágil, transparente y consensuada antes de iniciar.',
    keyFeatures: [
      'Sincronización instantánea de cambios vía WebSockets o estado local comparado',
      'Estados por ítem: Acordado (Agreed), Ajustar Intensidad (Adjust), Rechazado (Rejected)',
      'Campo de anotaciones específicas por actividad (ej. "Solo 10 golpes suaves en glúteos")',
      'Resumen de salvaguardas y safewords fijadas para la sesión',
    ],
    stepByStepGuide: [
      '1. Navegar a Negociación (app/negotiation.tsx) tras completar un reporte.',
      '2. Seleccionar la sesión completada y presionar "Iniciar Negociación en Vivo".',
      '3. Cada participante revisa los ítems en match e indica si acepta o sugiere ajustes.',
      '4. Una vez que todos los ítems están en verde o ajustados, se habilita la firma del contrato.',
    ],
    practicalExample: `const handleToggleStatus = (activityId: string, status: 'agreed' | 'adjust' | 'rejected') => {
  setNegotiationStatuses(prev => ({ ...prev, [activityId]: status }));
  broadcastStateToPeer(activityId, status);
};`,
    tags: ['negociacion', 'live_sync', 'contrato', 'tiempo_real', 'acuerdos', 'limites'],
  },
  {
    id: 'mod_crypto_signature',
    title: 'Firma Digital Criptográfica & Sellado SHA-256',
    category: 'Negociación en Vivo & Firma Digital',
    description: 'Mecanismo para rubricar digitalmente contratos consensuados mediante trazo en pantalla y generación de un hash inmutable SHA-256.',
    summary: 'Otorga solemnidad simbólica y garantiza que los términos acordados no fueron modificados a posteriori.',
    keyFeatures: [
      'Canvas táctil para firma manuscrita de cada participante',
      'Algoritmo de hashing SHA-256 que combina los textos del acuerdo + timestamps + firmas',
      'Exportación en documento PDF/Imagen sellada para conservación privada',
      'Botón de revocación de consentimiento en cualquier momento',
    ],
    stepByStepGuide: [
      '1. Al finalizar la negociación de la escena, presionar "Firmar Acuerdo Consensuado".',
      '2. Dibujar la firma manuscrita en el panel canvas de la pantalla.',
      '3. Presionar "Generar Hash y Sellar Contrato".',
      '4. El sistema mostrará la huella digital SHA-256 resultante y guardará el comprobante en la bóveda local.',
    ],
    practicalExample: `const sealContract = (termsText: string, signatureSvg: string) => {
  const contractPayload = termsText + signatureSvg + new Date().toISOString();
  const sha256Hash = Crypto.digestString(Crypto.CryptoDigestAlgorithm.SHA256, contractPayload);
  return { sha256Hash, sealedAt: new Date().toISOString() };
};`,
    tags: ['firma', 'criptografia', 'sha256', 'sellado', 'contrato', 'consentimiento', 'canvas'],
  },
  {
    id: 'mod_scene_templates',
    title: 'Plantillas Prediseñadas de Escenas (BDSM / D/s / Shibari / Impact)',
    category: 'Negociación en Vivo & Firma Digital',
    description: 'Colección de contratos y planes de escena precargados para los escenarios más comunes en la comunidad kink.',
    summary: 'Ahorra tiempo al ofrecer estructuras probadas con todos los puntos de seguridad y aftercare ya predefinidos.',
    keyFeatures: [
      'Plantillas incluidas: "Iniciación al Shibari", "Dominación/Sumisión Estándar", "Noche de Sensaciones", "Escena de Impacto Moderado"',
      'Personalización rápida de campos editables',
      'Recordatorios de equipo e inspección de seguridad asociados a cada plantilla',
      'Opción de guardar plantillas personalizadas propias',
    ],
    stepByStepGuide: [
      '1. Abrir ScenePlannerModal desde la vista de inicio o herramientas.',
      '2. Elegir "Cargar Plantilla Prediseñada".',
      '3. Seleccionar, por ejemplo, "Iniciación al Shibari".',
      '4. La app auto-completará la lista de cuerdas requeridas, safewords recomendadas y checklist de seguridad.',
      '5. Ajustar según preferencias y guardar.',
    ],
    practicalExample: `const SHIBARI_TEMPLATE = {
  title: 'Escena de Shibari Piso / Cuerdas Suaves',
  equipment: ['2x Cuerda Yute 6mm 8m', 'Tijeras de rescate'],
  safewords: { green: 'Verde', yellow: 'Amarillo', red: 'Rojo' },
  maxDurationMinutes: 45,
  aftercarePlan: ['Agua tibia', 'Manta térmica', 'Masaje de hombros']
};`,
    tags: ['plantillas', 'escenas', 'templates', 'shibari', 'bdsm', 'planificador', 'predefinido'],
  },
  {
    id: 'mod_scene_planner',
    title: 'Planificador Completo de Escenas & Lista de Verificación',
    category: 'Negociación en Vivo & Firma Digital',
    description: 'Asistente paso a paso para estructurar una escena desde la preparación previa hasta la ejecución y el aftercare final.',
    summary: 'Asegura que no se olvide ningún aspecto crítico de seguridad, logística o cuidado durante la preparación.',
    keyFeatures: [
      'Lista de verificación previa: Entorno seguro, hidratación, tijeras de emergencia, teléfono con batería',
      'Cronograma por fases (Pre-escena, Escena principal, Bajada, Aftercare)',
      'Asignación de roles y responsabilidades logísticas',
      'Almacenamiento de notas de la escena para futuras revisiones',
    ],
    stepByStepGuide: [
      '1. Seleccionar "Crear Nueva Escena" en el Planificador.',
      '2. Marcar los ítems de la lista de chequeo previa (ej. "Tijeras de rescate al alcance de la mano").',
      '3. Asignar el tiempo máximo de duración y el intervalo de alerta.',
      '4. Iniciar la escena y guardar el plan en el diario de experiencias.',
    ],
    practicalExample: `interface ScenePlan {
  id: string;
  title: string;
  checklist: { item: string; checked: boolean }[];
  maxDuration: number;
  aftercareNotes: string;
}`,
    tags: ['planificador', 'checklist', 'escena', 'verificacion', 'logistica', 'preparacion'],
  },
  {
    id: 'mod_pass_and_play',
    title: 'Modo Pass & Play (Dispositivo Único Presencial)',
    category: 'Negociación en Vivo & Firma Digital',
    description: 'Modo interactivo que permite a dos personas completar el cuestionario o negociar en el mismo teléfono de forma segura alternando turnos con PIN de privacidad.',
    summary: 'Ideal para parejas en el mismo lugar que no cuentan con dos móviles o prefieren responder presencialmente.',
    keyFeatures: [
      'Pantalla de transición de turno con bloqueo por PIN o cortina opaca',
      'Ocultamiento de las respuestas del jugador anterior durante el turno del segundo jugador',
      'Revelado inmediato del reporte conjunto al finalizar ambos turnos',
      'Cero envío de datos a servidores externos en este modo',
    ],
    stepByStepGuide: [
      '1. En el menú de Inicio, seleccionar "Modo Pass & Play (Un solo móvil)" (app/pass-and-play.tsx).',
      '2. El Jugador 1 responde el cuestionario y establece un PIN temporal.',
      '3. Al finalizar, la app muestra la pantalla "Pasa el dispositivo al Jugador 2".',
      '4. El Jugador 2 responde de forma independiente sin ver las elecciones del Jugador 1.',
      '5. Al terminar, la app desbloquea el reporte de compatibilidad combinado.',
    ],
    practicalExample: `const handleNextPlayerTurn = () => {
  hideCurrentResponses();
  setScreenState('WAITING_FOR_PLAYER_2');
  Alert.alert('Pasa el teléfono 📲', 'Entrega el dispositivo a tu pareja para su turno.');
};`,
    tags: ['pass_and_play', 'mismo_dispositivo', 'presencial', 'pareja', 'privacy_curtain', 'offline'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AREA 6: Bóveda Cifrada Zero-Knowledge & Administración
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mod_zero_knowledge_vault',
    title: 'Bóveda Cifrada Zero-Knowledge (AES-GCM-256 Local)',
    category: 'Bóveda Cifrada Zero-Knowledge & Administración',
    description: 'Arquitectura de almacenamiento en el dispositivo donde los datos sensibles, notas privadas y respuestas se cifran con una clave derivada del PIN del usuario usando AES-GCM-256.',
    summary: 'Garantiza que ni siquiera los servidores de la app puedan acceder o leer el contenido privado de los usuarios.',
    keyFeatures: [
      'Derivación de clave mediante PBKDF2-SHA-256 (~310 000 iteraciones) desde el PIN del usuario',
      'Cifrado local transparente (AES-GCM-256) antes de persistir en AsyncStorage o enviar a Supabase',
      'Borrado de pánico: destruye VaultSession en RAM y todas las claves sensibles',
      'En web el ciphertext vive en localStorage (SecureStore no aplica); threat model documentado',
    ],
    stepByStepGuide: [
      '1. Crear un PIN de seguridad en quick-profile.tsx o auth.tsx.',
      '2. La app deriva la clave simétrica AES-GCM-256 en memoria local.',
      '3. Todas las respuestas del cuestionario y notas privadas se cifran antes de guardarse en disco.',
      '4. Al cerrar la app o caducar la sesión, la clave de descifrado se destruye de la memoria RAM.',
    ],
    practicalExample: `const encryptSensitiveData = async (data: object, userPin: string) => {
  const key = await deriveKeyFromPin(userPin);
  const encryptedBytes = await AES_GCM_Encrypt(JSON.stringify(data), key);
  return encryptedBytes;
};`,
    tags: ['boveda', 'zero_knowledge', 'aes_256', 'cifrado', 'privacidad', 'secure_store', 'pin'],
  },
  {
    id: 'mod_permission_granularity',
    title: 'Control Granular de Permisos & Revelado Progresivo',
    category: 'Bóveda Cifrada Zero-Knowledge & Administración',
    description: 'Sistema de filtros de privacidad que permite al usuario decidir exactamente qué secciones de su reporte compartir con la otra persona.',
    summary: 'Oculta gustos privados no compartidos o conflictos sensibles hasta que el usuario decida voluntariamente revelarlos.',
    keyFeatures: [
      'Interruptores individuales por sección (Compartir Match Mutuo: SÍ, Compartir Solo Mis Intereses: NO)',
      'Máscara de anonimización para notas privadas',
      'Generación de enlaces de reporte compartible con permisos temporales o expiración por lecturas',
      'Opción de ocultar completamente categorías específicas (ej. Ocultar sección "Fantasia/Roleplay")',
    ],
    stepByStepGuide: [
      '1. En la pantalla de Reporte, presionar el botón "Configurar Compartido" (app/share.tsx).',
      '2. Desactivar los interruptores de las secciones que deseas mantener estrictamente privadas.',
      '3. Generar el código de vista recortado o PDF filtrado.',
      '4. Compartir el enlace resultante. El destinatario solo verá las secciones autorizadas.',
    ],
    practicalExample: `const getShareableReport = (fullReport: CompatibilityReport, settings: PrivacySettings) => {
  return {
    ...fullReport,
    items: fullReport.items.filter(item => settings.allowedSections.includes(item.section))
  };
};`,
    tags: ['permisos', 'granularidad', 'revelado_progresivo', 'privacidad', 'filtros_compartido', 'anonimo'],
  },
  {
    id: 'mod_admin_dashboard',
    title: 'Panel de Administración & Analítica de Tendencias Globales',
    category: 'Bóveda Cifrada Zero-Knowledge & Administración',
    description: 'Consola administrativa protegida por PIN máster para inspeccionar la salud del sistema, perfiles registrados y métricas agregadas anónimas.',
    summary: 'Permite a los administradores del sistema monitorear la plataforma y gestionar la base de conocimientos.',
    keyFeatures: [
      'Acceso tras desbloquear la bóveda + rol local explícito (isLocalAdmin); sin PIN maestro hardcodeado',
      'Métricas globales agregadas (Total de perfiles, distribución por niveles de experiencia)',
      'Top 10 Kinks más populares y Top 10 Límites Duros más frecuentes',
      'Explorador de sesiones locales y depuración de base de datos',
    ],
    stepByStepGuide: [
      '1. Acceder a /admin (app/admin.tsx).',
      '2. Ingresar el PIN de Administrador.',
      '3. Inspeccionar los gráficos de analítica global y métricas de uso de la comunidad.',
      '4. Navegar entre las pestañas "Analítica", "Perfiles" y "Sesiones" para auditoría.',
    ],
    practicalExample: `const analytics = useMemo(() => {
  const topKinks = computeTopKinks(profiles);
  const topHardLimits = computeTopHardLimits(profiles);
  return { totalProfiles: profiles.length, topKinks, topHardLimits };
}, [profiles]);`,
    tags: ['admin', 'dashboard', 'analitica', 'metricas', 'gestion', 'pin_master', 'tendencias'],
  },
  {
    id: 'mod_anon_export',
    title: 'Exportación Anónima Cifrada & Backup Portátil',
    category: 'Bóveda Cifrada Zero-Knowledge & Administración',
    description: 'Herramienta para respaldar o transferir perfiles y sesiones mediante archivos JSON cifrados o códigos QR de gran densidad de datos.',
    summary: 'Otorga soberanía total al usuario sobre sus datos para llevar su información a otro dispositivo sin depender de la nube.',
    keyFeatures: [
      'Exportación en archivo cifrado comprimido .kinkbak / JSON',
      'Generación de paquete QR multipartes para transferencia offline entre pantallas',
      'Limpieza total de metadatos identificativos (RUT/Email/IP borrados)',
      'Función de Importación y Restauración con verificación de integridad de datos',
    ],
    stepByStepGuide: [
      '1. Ir a Ajustes de Perfil / Bóveda.',
      '2. Seleccionar "Exportar Backup Anónimo".',
      '3. Definir una clave de cifrado para el archivo de respaldo.',
      '4. Descargar el archivo .kinkbak o escanear el código QR en el dispositivo de destino.',
    ],
    practicalExample: `const exportBackup = async (profile: UserProfile, password: string) => {
  const jsonString = JSON.stringify(profile);
  const encrypted = await encryptWithPassword(jsonString, password);
  downloadFile('compatikink_backup.kinkbak', encrypted);
};`,
    tags: ['exportacion', 'backup', 'backup_anonimo', 'json', 'qr_code', 'soberania_datos', 'restauracion'],
  },
  {
    id: 'mod_ai_roleplay_sandbox',
    title: 'Sandbox de Simulación con IA & Entrenamiento de Negociación',
    category: 'Bóveda Cifrada Zero-Knowledge & Administración',
    description: 'Entorno interactivo de prueba donde un bot de IA simula un compañero de negociación para practicar la comunicación de límites de forma segura.',
    summary: 'Ayuda a usuarios principiantes a perder el miedo a comunicar sus fantasías o límites duros en un entorno libre de juicio.',
    keyFeatures: [
      'Bot de negociación con IA con 3 personalidades (Principiante Tímido, Dominante Respetuoso, Experimentado Kinky)',
      'Retroalimentación en tiempo real sobre la claridad de la negociación del usuario',
      'Ejercicios prácticos de safewords y resolución de conflictos de límites',
      'Historial de práctica privado sin registro en servidores',
    ],
    stepByStepGuide: [
      '1. Entrar a AI Roleplay (app/ai-roleplay.tsx).',
      '2. Seleccionar el perfil del bot simulado para la práctica.',
      '3. Iniciar el chat de negociación de prueba.',
      '4. Practicar proponer una actividad kinky y defender un límite duro.',
      '5. Recibir el reporte de evaluación de comunicación asertiva del bot.',
    ],
    practicalExample: `const handleAIBotResponse = async (userMessage: string) => {
  const prompt = \`Eres un compañero de negociación BDSM. El usuario dice: "\${userMessage}". Responde con respeto y negociación consensuada.\`;
  const aiResponse = await callAIRoleplayEngine(prompt);
  appendMessageToChat(aiResponse);
};`,
    tags: ['ai', 'ia', 'roleplay', 'sandbox', 'simulacion', 'entrenamiento', 'comunicacion_asertiva'],
  },
];

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

const STORAGE_KEY_MANUAL_BOOKMARKS = 'manual_bookmarked_modules_v1';

// Helper functions for search & retrieval
export function getManualModuleById(id: string): ManualModule | undefined {
  return MANUAL_MODULES.find((m) => m.id === id);
}

export function getManualModulesByArea(areaId: string): ManualModule[] {
  const area = MANUAL_AREAS.find((a) => a.id === areaId);
  if (!area) return [];
  return MANUAL_MODULES.filter((m) => area.moduleIds.includes(m.id));
}

export function searchManualModules(query: string): ManualModule[] {
  const q = query.toLowerCase().trim();
  if (!q) return MANUAL_MODULES;
  return MANUAL_MODULES.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function loadManualBookmarks(): Promise<string[]> {
  try {
    const saved = await readJsonStorage<string[]>(STORAGE_KEY_MANUAL_BOOKMARKS, []);
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export async function toggleManualBookmark(moduleId: string): Promise<string[]> {
  const current = await loadManualBookmarks();
  const next = current.includes(moduleId)
    ? current.filter((id) => id !== moduleId)
    : [...current, moduleId];
  await writeJsonStorage(STORAGE_KEY_MANUAL_BOOKMARKS, next);
  return next;
}
