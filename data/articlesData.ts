export type ArticleCategory =
  | 'consent_negotiation'
  | 'aftercare_emotional'
  | 'safety_anatomy'
  | 'power_exchange'
  | 'polyamory_relationships'
  | 'gear_maintenance';

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  subtitle: string;
  category: ArticleCategory;
  readTimeMin: number;
  author: string;
  authorRole: string;
  emoji: string;
  tags: string[];
  keyTakeaways: string[];
  sections: ArticleSection[];
  relatedTerms?: string[];
}

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, { label: string; emoji: string; color: string }> = {
  consent_negotiation: { label: 'Consentimiento & Negociación', emoji: '🤝', color: '#c084fc' },
  aftercare_emotional: { label: 'Aftercare & Emocional', emoji: '🪷', color: '#38bdf8' },
  safety_anatomy: { label: 'Seguridad & Anatomía', emoji: '🩺', color: '#f87171' },
  power_exchange: { label: 'D/s & Poder', emoji: '🗝️', color: '#fbbf24' },
  polyamory_relationships: { label: 'Vínculos & No Monogamia', emoji: '🌿', color: '#4ade80' },
  gear_maintenance: { label: 'Látex & Gear', emoji: '🧤', color: '#f472b6' },
};

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'El Framework FRIES de Consentimiento Entusiasta',
    subtitle: 'Por qué el consentimiento no es solo un contrato legal, sino un diálogo continuo y dinámico',
    category: 'consent_negotiation',
    readTimeMin: 5,
    author: 'Dra. Sofía Ramos',
    authorRole: 'Sexóloga & Educadora',
    emoji: '🤝',
    tags: ['FRIES', 'Consentimiento', 'Comunicación', 'Límites'],
    keyTakeaways: [
      'Freely given: Debe ser otorgado sin coerción, culpa o presión económica/afectiva.',
      'Reversible: Cualquier persona puede cambiar de opinión en cualquier segundo.',
      'Informed: Ambas partes deben conocer de antemano qué implementos y prácticas se usarán.',
      'Enthusiastic: Se busca el deseo activo ("¡Sí, quiero!"), no la mera resignación.',
      'Specific: Consentir una caricia no autoriza ataduras ni penetración.',
    ],
    sections: [
      {
        heading: '1. Más allá del "No es No"',
        body: 'Durante décadas, la educación tradicional limitó la idea del consentimiento a la ausencia de negativa. En la cultura BDSM y alternativa moderna, adoptamos el modelo de "Solo Sí es Sí" y el estándar FRIES (Freely given, Reversible, Informed, Enthusiastic, Specific).',
      },
      {
        heading: '2. La Reversibilidad como Regla Sagrada',
        body: 'El consentimiento nunca es un cheque en blanco. Si tu pareja aceptó un nivel de impacto o una atadura al inicio de la noche, pero luego se siente cansada o abrumada, tiene el derecho absoluto e incuestionable de decir "Rojo" o "Pausa" sin recibir reproches.',
      },
      {
        heading: '3. El Cuestionario Asimétrico como Puente',
        body: 'Negociar cara a cara puede generar timidez. El uso de cuestionarios digitales asimétricos con revelación mutua permite a ambos listar sus deseos y límites desde la privacidad de su propio espacio.',
      },
    ],
    relatedTerms: ['FRIES', 'Safe word semáforo', 'Hard Limit', 'Soft Limit'],
  },
  {
    id: 'art-2',
    title: 'Neuroquímica del Aftercare: Dominando el Subdrop y Topdrop',
    subtitle: 'Comprender la caída de endorfinas y dopamina para acompañar la recuperación post-escena',
    category: 'aftercare_emotional',
    readTimeMin: 6,
    author: 'Lic. Mateo Valenzuela',
    authorRole: 'Psicólogo Clínico & Switch',
    emoji: '🪷',
    tags: ['Aftercare', 'Subdrop', 'Topdrop', 'Endorfinas', 'Contención'],
    keyTakeaways: [
      'El subdrop y topdrop ocurren por el reajuste fisiológico de endorfinas, oxitocina y adrenalina.',
      'Pueden manifestarse inmediatamente o entre 24 y 48 horas después de la sesión.',
      'El Topdrop es tan real como el Subdrop: sostener el espacio energético también agota.',
      'Protocolo recomendado: Hidratación + Calor físico + Carbohidratos + Check-in emocional a las 24h.',
    ],
    sections: [
      {
        heading: '1. Qué ocurre en el cerebro durante el juego intenso',
        body: 'Durante una escena de impacto, restricción o juego sensorial, el sistema nervioso inunda el organismo con endorfinas analgésicas y dopamina. Al finalizar, los niveles caen en picada, lo que puede provocar tristeza súbita, irritabilidad o sensación de desamparo.',
      },
      {
        heading: '2. Protocolo de Aftercare en 3 Fases',
        body: 'Fase 1 (Inmediata - 15m): Abrigo con mantas, posición fetal o abrazo sostenido, reposición de electrolitos y agua.\nFase 2 (Intermedia - 1 hora): Salida del rol, comida reconfortante, charla suave sin analizar críticamente la escena.\nFase 3 (Tardía - 24 a 48h): Mensaje breve o llamada para validar que la reintegración cotidiana marcha bien.',
      },
      {
        heading: '3. Visibilizando el Topdrop',
        body: 'Los Dominantes / Tops a menudo sienten que deben mantenerse invulnerables. Sin embargo, el esfuerzo de vigilar la respiración, la tensión y los límites ajenos genera un agotamiento mental significativo que requiere su propio descanso.',
      },
    ],
    relatedTerms: ['Subdrop', 'Topdrop', 'Aftercare', 'Scene Debrief'],
  },
  {
    id: 'art-3',
    title: 'Seguridad Anatómica en Cuerdas y Shibari: Nervios y Circulación',
    subtitle: 'Zonas rojas, prevención del síndrome compartimental y uso de herramientas de emergencia',
    category: 'safety_anatomy',
    readTimeMin: 7,
    author: 'Dr. Lucas Navarro',
    authorRole: 'Médico Urgenciólogo & Rigger',
    emoji: '🩺',
    tags: ['Anatomía', 'Nervios', 'Shibari', 'Tijeras EMT', 'Circulación'],
    keyTakeaways: [
      'El nervio radial en la muñeca y el nervio peroneo en la rodilla son los más vulnerables a compresión.',
      'Tijeras EMT de rescate: Siempre a menos de 50 cm de distancia y accesibles con una sola mano.',
      'Señales de alarma: Hormigueo persistente, dedos fríos o palidez súbita.',
      'Nunca suspender sin formación presencial específica y chequeos circulatorios cada 2 minutos.',
    ],
    sections: [
      {
        heading: '1. El mapa de los nervios periféricos',
        body: 'En las muñecas, el nervio radial pasa superficialmente sobre el hueso. Una atadura con tensión excesiva o nudos que crucen directamente esa área puede causar parálisis radial temporal ("mano caída"). En las piernas, el nervio peroneo común rodea el cuello del peroné justo debajo de la rodilla.',
      },
      {
        heading: '2. Regla de oro de los 2 dedos',
        body: 'En ataduras de suelo (floorwork), debes poder deslizar con facilidad dos dedos entre la cuerda y la piel del participante para asegurar que no se restrinja el flujo venoso profundo.',
      },
      {
        heading: '3. El equipo de seguridad que nunca debe faltar',
        body: 'Jamás uses cuchillos convencionales con punta. Utiliza tijeras médicas EMT con punta roma de acero inoxidable que puedan cortar cuerdas de 6mm de un solo golpe sin riesgo de herir la piel.',
      },
    ],
    relatedTerms: ['Nervio Radial & Ulnar', 'Tijeras EMT / Rescate', 'Síndrome de Compartimento'],
  },
  {
    id: 'art-4',
    title: 'Diseñando un Contrato D/s Saludable: Dinámicas de Poder Consensuadas',
    subtitle: 'Estructuración de acuerdos, protocolos diarios y cláusulas de salida segura',
    category: 'power_exchange',
    readTimeMin: 6,
    author: 'Clara & Sergio (D/s 24/7)',
    authorRole: 'Practicantes TPE',
    emoji: '🗝️',
    tags: ['D/s', 'Contratos', 'TPE', 'Protocolos', 'Límites'],
    keyTakeaways: [
      'Un contrato D/s no es un documento legal: es un acuerdo ético y afectivo de intercambio de poder.',
      'Debe contener cláusula de safewords, cláusula de revisión trimestral y cláusula de disolución limpia.',
      'El poder otorgado siempre emana del Sumiso/a (consentimiento de base).',
    ],
    sections: [
      {
        heading: '1. Por qué poner acuerdos por escrito',
        body: 'Escribir las reglas y expectativas elimina la ambigüedad. Define con precisión qué responsabilidades asume el Dominante (cuidado, guía, límites) y qué actos de servicio o entrega corresponden al Sumiso/a.',
      },
      {
        heading: '2. Protocolos sutiles para la vida moderna',
        body: 'En dinámicas que conviven con trabajos corporativos, los mejores protocolos son invisibles para terceros: horarios de saludo formal matutino, una prenda interior específica o una postura discreta al sentarse juntos.',
      },
      {
        heading: '3. Cláusula de Revisión y Salida de Emergencia',
        body: 'La confianza se fortalece cuando existe un mecanismo pactado para pausar el contrato sin dramas si surgen crisis personales, estrés laboral o cambios de salud.',
      },
    ],
    relatedTerms: ['TPE', 'Keyholder', 'MICA', 'Scene Debrief'],
  },
  {
    id: 'art-5',
    title: 'Compersión y Manejo del NRE en Relaciones No Monógamas',
    subtitle: 'Cómo acompañar la euforia de un nuevo vínculo sin desestabilizar acuerdos previos',
    category: 'polyamory_relationships',
    readTimeMin: 6,
    author: 'Martina Osses',
    authorRole: 'Consejera Relacional',
    emoji: '🌿',
    tags: ['Poliamor', 'Compersión', 'NRE', 'Metamores', 'Vínculos'],
    keyTakeaways: [
      'NRE (New Relationship Energy): Es una respuesta bioquímica natural que dura de 6 a 18 meses.',
      'La compersión no es obligatoria para ser poliamoroso ético: la no-posesividad es suficiente.',
      'Priorizar la comunicación transparente y no hacer promesas vitales bajo el influjo del NRE.',
    ],
    sections: [
      {
        heading: '1. La química del enamoramiento temprano',
        body: 'El NRE genera euforia similar al consumo de estimulantes. Es vital recordar que las decisiones de largo plazo (mudanzas, cambios de acuerdos) deben tomarse con la mente clara y no en el pico de adrenalina.',
      },
      {
        heading: '2. Cultivando la Compersión poco a poco',
        body: 'La compersión —la alegría por la dicha ajena— es un músculo emocional. Si sientes celos, no te castigues: los celos son mensajeros que señalan inseguridades o necesidades de reafirmación desatendidas.',
      },
      {
        heading: '3. Higiene en Acuerdos de Salud Sexual',
        body: 'Establecer calendarios compartidos de chequeos de salud sexual y uso consensuado de barreras protege a toda la red afectiva sin necesidad de tabúes ni secretismo.',
      },
    ],
    relatedTerms: ['Compersión', 'NRE', 'Poliamor', 'Metamor', 'Bisagra / Hinge'],
  },
  {
    id: 'art-6',
    title: 'Guía Maestra de Cuidado del Látex: Lavado, Brillo y Almacenamiento',
    subtitle: 'Maximiza la vida útil de tus prendas de goma y evita los 4 errores más destructivos',
    category: 'gear_maintenance',
    readTimeMin: 5,
    author: 'Latex Craft Workshop',
    authorRole: 'Artesanos de Látex',
    emoji: '🧤',
    tags: ['Látex', 'Vivishine', 'Brillo', 'Cuidado Gear', 'Mantenimiento'],
    keyTakeaways: [
      'Enemigos mortales del látex: Metales (cobre/latón), aceites minerales, luz solar directa y calor.',
      'Lavado: Agua tibia con jabón neutro sin perfume tras cada uso.',
      'Brillo: Emulsiones de silicona pura (Vivishine / Pjur Cult) nunca vaselina ni cremas corporales.',
      'Guardado: En bolsas plásticas herméticas oscuras o fundas opacas con talco sin fragancia.',
    ],
    sections: [
      {
        heading: '1. Los 4 destructores del caucho natural',
        body: 'El látex es un polímero orgánico susceptible a la oxidación. Una moneda de cobre o una percha metálica oxidada puede dejar manchas oscuras irreversibles en cuestión de horas. Los aceites vegetales o vaselina disuelven las costuras encoladas.',
      },
      {
        heading: '2. Proceso de Lavado y Abrillantado',
        body: '1. Llena un lavamanos con agua tibia y jabón suave.\n2. Enjuaga con abundante agua limpia.\n3. Añade unas gotas de producto abrillantador de silicona en el último enjuague.\n4. Deja secar al aire libre sobre una toalla a la sombra.',
      },
      {
        heading: '3. Almacenamiento a largo plazo',
        body: 'Usa perchas anchas de plástico o madera tratada. Si vas a guardarlo doblado por meses, espolvorea talco puro sin perfume para evitar que el látex se adhiera a sí mismo.',
      },
    ],
    relatedTerms: ['Castidad', 'Fricción de cuerda / Quemadura'],
  },
];
