export type GlossaryCategory =
  | 'Consentimiento & Ética'
  | 'Seguridad & Anatomía'
  | 'Prácticas & BDSM'
  | 'Roles & Dinámicas'
  | 'No Monogamia & Vínculos';

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms?: string[];
  safetyTip?: string;
  example?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Acuerdos de Salud Sexual',
    category: 'No Monogamia & Vínculos',
    definition: 'Protocolos pactados entre parejas sobre frecuencia de pruebas de ETS, uso de barreras de protección e información sobre nuevos compañeros sexuales.',
    relatedTerms: ['Poliamor', 'Swinger / Intercambio', 'Consent (Consentimiento)'],
  },
  {
    term: 'Aftercare',
    category: 'Consentimiento & Ética',
    definition: 'Cuidado posterior a una escena para reconectar emocionalmente. Incluye contacto físico, charla, bebidas calientes, mantas y validación emocional.',
    relatedTerms: ['AfterDrop', 'Topdrop', 'Scene Debrief'],
    safetyTip: 'Planificar el aftercare antes de iniciar la escena asegura que ambos sepan qué necesitan para aterrizar de vuelta a la calma.',
  },
  {
    term: 'AfterDrop',
    category: 'Seguridad & Anatomía',
    definition: 'Bajón emocional o físico que puede ocurrir horas o días después de una escena intensa. Se debe a la caída súbita de endorfinas y adrenalina.',
    relatedTerms: ['Aftercare', 'Topdrop', 'Subspace'],
    safetyTip: 'Mantén comunicación al día siguiente; una bebida caliente, descanso e hidratación ayudan al cuerpo a reponerse.',
  },
  {
    term: 'Anarquía Relacional',
    category: 'No Monogamia & Vínculos',
    definition: 'Filosofía de relaciones que rechaza jerarquías prefijadas (como primarias vs amistades) y construye cada vínculo basado en acuerdos únicos y autónomos.',
    relatedTerms: ['Poliamor', 'Compersión', 'Metamor'],
  },
  {
    term: 'Bisagra / Hinge',
    category: 'No Monogamia & Vínculos',
    definition: 'En poliamor, la persona que conecta a dos o más metamores y mantiene relaciones románticas/sexuales con ambos de forma equilibrada y comunicativa.',
    relatedTerms: ['Poliamor', 'Metamor', 'Compersión'],
  },
  {
    term: 'Bondage',
    category: 'Prácticas & BDSM',
    definition: 'Práctica de restricción física consensuada usando cuerdas, esposas u otros elementos. Puede ser estético, decorativo o restrictivo.',
    relatedTerms: ['Shibari', 'Tijeras EMT / Rescate', 'Nervio Radial & Ulnar'],
    safetyTip: 'Siempre ten a mano tijeras de rescate (EMT) y nunca dejes a una persona atada sin supervisión continua.',
  },
  {
    term: 'Brat Tamer',
    category: 'Roles & Dinámicas',
    definition: 'Dominante especializado en manejar, provocar e interactuar pacientemente con las conductas desafiantes de un sumiso tipo Brat.',
    relatedTerms: ['Bratting', 'Dominante (Dom/Domme)', 'Switch'],
  },
  {
    term: 'Bratting',
    category: 'Roles & Dinámicas',
    definition: 'Comportamiento provocador o juguetón del sumiso para obtener una reacción del dominante dentro del juego de poder acordado.',
    relatedTerms: ['Brat Tamer', 'Sumiso/a (Sub)', 'Protocolo'],
  },
  {
    term: 'Breath Play Warning',
    category: 'Seguridad & Anatomía',
    definition: 'Advertencia de alto riesgo (edgeplay) en restricciones de respiración. Requiere extrema precaución y profundo conocimiento anatómico.',
    relatedTerms: ['Edgeplay', 'RACK', 'Informed Consent'],
    safetyTip: '⚠️ Práctica de muy alto riesgo. La hipoxia cerebral puede causar desmayos súbitos o secuelas en segundos sin aviso previo.',
  },
  {
    term: 'Castidad',
    category: 'Prácticas & BDSM',
    definition: 'Uso de dispositivos mecánicos para restringir el acceso a los genitales. Puede ser de negación física, psicológica o visual para control del orgasmo.',
    relatedTerms: ['Keyholder', 'Orgasm Control', 'Tease & Denial'],
    safetyTip: 'Revisar la higiene diaria, circulación y ajustar el tamaño del dispositivo para evitar laceraciones o inflamación.',
  },
  {
    term: 'CGL / Caregiver & Little',
    category: 'Roles & Dinámicas',
    definition: 'Dinámica de cuidado y regresión de edad consensuada. Enfocada en la inocencia, protección y vulnerabilidad en un ambiente seguro.',
    relatedTerms: ['Protocolo', 'Aftercare', 'Sumiso/a (Sub)'],
  },
  {
    term: 'CNC',
    category: 'Consentimiento & Ética',
    definition: 'Consensual Non-Consent. Fantasía de no-consentimiento completamente acordada y negociada previamente con límites estrictos y safewords.',
    relatedTerms: ['Safeword (Palabra de seguridad)', 'Hard Limit (Límite duro)', 'Informed Consent'],
    safetyTip: 'Requiere una base de confianza sólida, negociación exhaustiva previa y palabras de seguridad que detengan la escena al instante.',
  },
  {
    term: 'Collar',
    category: 'Roles & Dinámicas',
    definition: 'Elemento simbólico (gargantilla, pulsera o anillo) que representa el vínculo y entrega en una dinámica D/s acordada.',
    relatedTerms: ['Protocolo', 'TPE (Total Power Exchange)', 'D/s (Dominación/sumisión)'],
  },
  {
    term: 'Compersión',
    category: 'No Monogamia & Vínculos',
    definition: 'Sentimiento de alegría empática que surge al presenciar la felicidad amorosa o sexual de tu pareja con otra persona. El opuesto emocional a los celos.',
    relatedTerms: ['Poliamor', 'Anarquía Relacional', 'Metamor'],
  },
  {
    term: 'Consent (Consentimiento)',
    category: 'Consentimiento & Ética',
    definition: 'Acuerdo libre, informado, entusiasta y revocable en cualquier momento para participar en una práctica o interacción.',
    relatedTerms: ['FRIES', 'MICA', 'Safeword (Palabra de seguridad)'],
  },
  {
    term: 'D/s (Dominación/sumisión)',
    category: 'Roles & Dinámicas',
    definition: 'Dinámica de poder donde una persona asume el rol dominante y otra el sumiso, siempre dentro de un marco consensuado y seguro.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Sumiso/a (Sub)', 'Switch'],
  },
  {
    term: 'Dominante (Dom/Domme)',
    category: 'Roles & Dinámicas',
    definition: 'Persona que asume el control en una dinámica de poder consensuada. Es la principal responsable de la seguridad y el bienestar de la persona sumisa.',
    relatedTerms: ['Sumiso/a (Sub)', 'Topspace', 'Service Top'],
  },
  {
    term: 'Dungeon',
    category: 'Prácticas & BDSM',
    definition: 'Espacio privado o comunitario equipado para prácticas BDSM. Puede incluir cruz de San Andrés, bancos de azote, poleas y fijaciones seguras.',
    relatedTerms: ['Munch', 'Bondage', 'Impacto'],
  },
  {
    term: 'Edgeplay',
    category: 'Seguridad & Anatomía',
    definition: 'Prácticas situadas en el límite del riesgo físico, fisiológico o psicológico (fuego, agujas, corte). Exigen el máximo nivel de RACK y protocolos de emergencia.',
    relatedTerms: ['RACK', 'Informed Consent', 'Breath Play Warning'],
    safetyTip: 'Nunca realizar edgeplay bajo influencia de alcohol o sustancias, ni sin equipo de primeros auxilios verificado.',
  },
  {
    term: 'Edging',
    category: 'Prácticas & BDSM',
    definition: 'Técnica de llevar al borde del orgasmo repetidamente sin permitir el clímax hasta que se otorgue permiso, intensificando el placer final.',
    relatedTerms: ['Orgasm Control', 'Tease & Denial', 'Castidad'],
  },
  {
    term: 'E-stim',
    category: 'Prácticas & BDSM',
    definition: 'Electro-estimulación. Uso de dispositivos eléctricos médicos o específicos de baja intensidad para estimulación sensorial táctil controlada.',
    relatedTerms: ['Violet Wand', 'Sensory Overload'],
    safetyTip: 'Nunca colocar electrodos por encima del corazón, en el pecho cruzado, cuello o cabeza. Usar solo equipo regulado.',
  },
  {
    term: 'Facesitting',
    category: 'Prácticas & BDSM',
    definition: 'Práctica de sentarse sobre el rostro de la pareja con fines de dominación, asfixia erótica leve consensuada o estimulación oral.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Sumiso/a (Sub)'],
    safetyTip: 'Establecer señales táctiles de seguridad claras (como tocar dos veces el muslo) si la voz queda bloqueada.',
  },
  {
    term: 'Fetiche',
    category: 'Prácticas & BDSM',
    definition: 'Atracción erótica intensa hacia un objeto, prenda, material (cuero, látex, seda) o parte del cuerpo específica.',
    relatedTerms: ['Foot Worship', 'Kink', 'Vanilla'],
  },
  {
    term: 'Flogger',
    category: 'Prácticas & BDSM',
    definition: 'Instrumento de impacto con múltiples tiras de cuero, gamuza o silicona. Produce sensaciones envolventes desde caricias hasta golpes rotundos.',
    relatedTerms: ['Impacto', 'Zonas de Impacto Seguro', 'Zonas de Impacto Prohibidas'],
  },
  {
    term: 'Foot Worship',
    category: 'Prácticas & BDSM',
    definition: 'Adoración de pies. Práctica fetichista y de servicio que involucra masajear, besar o lamer los pies del dominante como acto de entrega.',
    relatedTerms: ['Fetiche', 'Service Top', 'Sumiso/a (Sub)'],
  },
  {
    term: 'Fricción de cuerda / Quemadura',
    category: 'Seguridad & Anatomía',
    definition: 'Riesgo térmico o mecánico común en ataduras con cuerda. Prevenible mediante técnicas adecuadas de tensión, deslizamiento suave y cuerdas tratadas.',
    relatedTerms: ['Bondage', 'Shibari', 'Tijeras EMT / Rescate'],
    safetyTip: 'Pasa las cuerdas con lentitud sobre la piel y aplica cera mineral o acondicionador a las cuerdas naturales de yute/cáñamo.',
  },
  {
    term: 'FRIES',
    category: 'Consentimiento & Ética',
    definition: 'Marco de consentimiento: Freely given (Libre), Reversible (Revocable), Informed (Informado), Enthusiastic (Entusiasta), Specific (Específico).',
    relatedTerms: ['Consent (Consentimiento)', 'MICA', 'PRICK'],
  },
  {
    term: 'Handler',
    category: 'Roles & Dinámicas',
    definition: 'Persona que guía, entrena y cuida a alguien que asume el rol de Pet Play (puppy, kitten), velando por su seguridad física y mental.',
    relatedTerms: ['Pet Play', 'Dominante (Dom/Domme)', 'Aftercare'],
  },
  {
    term: 'Hard Limit (Límite duro)',
    category: 'Consentimiento & Ética',
    definition: 'Límite innegociable y absoluto que no debe cruzarse bajo ninguna circunstancia. Debe ser respetado sin discusión previa ni durante la escena.',
    relatedTerms: ['Límite blando (Soft Limit)', 'Safeword (Palabra de seguridad)', 'Negociación'],
  },
  {
    term: 'Impacto',
    category: 'Prácticas & BDSM',
    definition: 'Prácticas de golpes consensuados con mano (spanking), paleta, fusta o flogger aplicados en zonas carnosas seguras del cuerpo.',
    relatedTerms: ['Zonas de Impacto Seguro', 'Zonas de Impacto Prohibidas', 'Flogger'],
    safetyTip: 'Calienta la zona gradualmente con palmadas suaves antes de aumentar la intensidad para favorecer la irrigación sanguínea.',
  },
  {
    term: 'Informed Consent',
    category: 'Consentimiento & Ética',
    definition: 'Consentimiento otorgado con pleno conocimiento de los riesgos anatómicos, fisiológicos o emocionales específicos antes de participar.',
    relatedTerms: ['RACK', 'PRICK', 'FRIES'],
  },
  {
    term: 'Juego Médico / Medical Play',
    category: 'Prácticas & BDSM',
    definition: 'Roleplay de temática clínica o médica (exámenes, vendajes, instrumental). Requiere higiene estricta, esterilización y consentimientos explícitos.',
    relatedTerms: ['Sensory Deprivation', 'Edgeplay'],
    safetyTip: 'Usa material médico desechable de grado sanitario y no reutilices agujas ni elementos punzantes.',
  },
  {
    term: 'Keyholder',
    category: 'Roles & Dinámicas',
    definition: 'Guardián de la llave en dinámicas de castidad. Persona que administra el candado o acceso al dispositivo de restricción sexual de su pareja.',
    relatedTerms: ['Castidad', 'Orgasm Control', 'Tease & Denial'],
  },
  {
    term: 'Kink',
    category: 'Prácticas & BDSM',
    definition: 'Término paraguas que describe el amplio espectro de prácticas sexuales, sensuales o relacionales no convencionales consensuadas.',
    relatedTerms: ['Vanilla', 'BDSM', 'Fetiche'],
  },
  {
    term: 'Límite blando (Soft Limit)',
    category: 'Consentimiento & Ética',
    definition: 'Actividad que genera cierta duda o timidez pero que podría explorarse de forma gradual y cuidadosa si existe confianza y buena comunicación.',
    relatedTerms: ['Hard Limit (Límite duro)', 'Negociación', 'Redirection'],
  },
  {
    term: 'Maledom / Master',
    category: 'Roles & Dinámicas',
    definition: 'Dominación ejercida por hombres, frecuentemente orientada a dinámicas de autoridad, estructura, disciplina o servicio consensuado.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Sadette / FemDom', 'D/s (Dominación/sumisión)'],
  },
  {
    term: 'Masoquismo',
    category: 'Roles & Dinámicas',
    definition: 'Placer o catarsis derivada de recibir sensaciones intensas o dolor controlado dentro de un marco psicológicamente seguro y consensuado.',
    relatedTerms: ['Sadismo', 'Sadomasoquismo', 'Impacto'],
  },
  {
    term: 'Metamor',
    category: 'No Monogamia & Vínculos',
    definition: 'La pareja de tu pareja, con quien compartes una conexión en la red no monógama pero no tienes un vínculo afectivo o sexual directo.',
    relatedTerms: ['Bisagra / Hinge', 'Compersión', 'Poliamor'],
  },
  {
    term: 'MICA',
    category: 'Consentimiento & Ética',
    definition: 'Acrónimo ético: Mandatorio, Informado, Consensuado y Acordado. Los cuatro pilares de cualquier práctica consensuada.',
    relatedTerms: ['FRIES', 'Consent (Consentimiento)', 'SSC'],
  },
  {
    term: 'Munch',
    category: 'No Monogamia & Vínculos',
    definition: 'Reunión social informal de la comunidad kink en un espacio público y neutro (bar, restaurante). Es estrictamente de charla y convivencia sin juego erótico.',
    relatedTerms: ['Dungeon', 'Kink', 'Vanilla'],
  },
  {
    term: 'Negociación',
    category: 'Consentimiento & Ética',
    definition: 'Conversación detallada previa a una escena donde se definen límites duros, deseos, safewords, duración y necesidades de aftercare.',
    relatedTerms: ['Scene Debrief', 'Hard Limit (Límite duro)', 'Safeword (Palabra de seguridad)'],
  },
  {
    term: 'Nervio Peroneo',
    category: 'Seguridad & Anatomía',
    definition: 'Nervio situado en la cara externa de la pierna bajo la rodilla. Altamente vulnerable a compresión por cuerdas apretadas, pudiendo provocar entumecimiento o pie caído.',
    relatedTerms: ['Nervio Radial & Ulnar', 'Bondage', 'Síndrome de Compartimento'],
    safetyTip: 'Nunca apliques ataduras apretadas directamente sobre la cabeza del peroné ni mantengas flexión extrema por tiempo prolongado.',
  },
  {
    term: 'Nervio Radial & Ulnar',
    category: 'Seguridad & Anatomía',
    definition: 'Nervios de las muñecas propensos a daño por presión en ataduras si las esposas o cuerdas no se distribuyen en un área amplia y sin cruces sobre huesos.',
    relatedTerms: ['Nervio Peroneo', 'Bondage', 'Shibari'],
    safetyTip: 'Deja siempre espacio para introducir un dedo entre la cuerda y la muñeca, y vigila la temperatura y color de los dedos.',
  },
  {
    term: 'NRE (New Relationship Energy)',
    category: 'No Monogamia & Vínculos',
    definition: 'Energía de Nueva Relación. Fase inicial de euforia química y fascinación mutua al comenzar un nuevo vínculo afectivo.',
    relatedTerms: ['Poliamor', 'Compersión', 'Bisagra / Hinge'],
  },
  {
    term: 'Orgasm Control',
    category: 'Prácticas & BDSM',
    definition: 'Práctica donde una persona cede la decisión del momento, frecuencia y condiciones de su clímax al dominante.',
    relatedTerms: ['Edging', 'Tease & Denial', 'Castidad'],
  },
  {
    term: 'Pegging',
    category: 'Prácticas & BDSM',
    definition: 'Práctica sexual donde una persona con arnés y dildo penetra analmente a su pareja masculina o con próstata de forma consensuada.',
    relatedTerms: ['Roles & Dinámicas', 'Kink'],
  },
  {
    term: 'Pet Play',
    category: 'Roles & Dinámicas',
    definition: 'Juego de rol donde una persona encarna la mentalidad y movimientos de una mascota (cachorro, gatito, poni) con accesorios y cuidados consensuados.',
    relatedTerms: ['Handler', 'Sumiso/a (Sub)', 'Roleplay'],
  },
  {
    term: 'Poliamor',
    category: 'No Monogamia & Vínculos',
    definition: 'Práctica de mantener múltiples relaciones amorosas, afectivas y sexuales consensuadas, transparentes y éticas de manera simultánea.',
    relatedTerms: ['Compersión', 'Anarquía Relacional', 'Poliamor Jerárquico'],
  },
  {
    term: 'Poliamor Jerárquico',
    category: 'No Monogamia & Vínculos',
    definition: 'Modelo poliamoroso donde una relación tiene mayor prioridad estructural (convivencia, finanzas) frente a otras relaciones secundarias.',
    relatedTerms: ['Poliamor', 'Bisagra / Hinge', 'Anarquía Relacional'],
  },
  {
    term: 'PRICK',
    category: 'Consentimiento & Ética',
    definition: 'Progressive Risk-Aware Informed Consensual Kink. Enfoque que promueve el aprendizaje gradual y la evaluación continua de riesgos antes de subir la intensidad.',
    relatedTerms: ['RACK', 'SSC', 'Informed Consent'],
  },
  {
    term: 'Pro-Domme',
    category: 'Roles & Dinámicas',
    definition: 'Dominante profesional que ofrece sesiones acordadas de BDSM y juego de poder a cambio de honorarios, generalmente sin penetración sexual.',
    relatedTerms: ['Sadette / FemDom', 'Dominante (Dom/Domme)', 'Dungeon'],
  },
  {
    term: 'Protocolo',
    category: 'Roles & Dinámicas',
    definition: 'Reglas de etiqueta, saludo, servicio y lenguaje pactadas formalmente dentro de una dinámica D/s estructurada.',
    relatedTerms: ['Collar', 'TPE (Total Power Exchange)', 'D/s (Dominación/sumisión)'],
  },
  {
    term: 'RACK',
    category: 'Consentimiento & Ética',
    definition: 'Risk-Aware Consensual Kink. Filosofía que asume que el riesgo cero no existe y se enfoca en la educación, reducción de daños y consentimiento lúcido.',
    relatedTerms: ['SSC', 'PRICK', 'Informed Consent'],
  },
  {
    term: 'Redirection',
    category: 'Consentimiento & Ética',
    definition: 'Técnica de desviar o sustituir suavemente una actividad cuando se detecta un límite o fatiga, manteniendo la conexión y el juego sin frustración.',
    relatedTerms: ['Safeword (Palabra de seguridad)', 'Límite blando (Soft Limit)', 'Aftercare'],
  },
  {
    term: 'Sadette / FemDom',
    category: 'Roles & Dinámicas',
    definition: 'Dominación femenina. Mujeres que lideran la dinámica de poder y dirigen la escena con autoridad, sensualidad y control.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Maledom / Master', 'Pro-Domme'],
  },
  {
    term: 'Sadismo',
    category: 'Roles & Dinámicas',
    definition: 'Placer o satisfacción erótica al administrar sensaciones intensas o dolor controlado a una pareja masoquista que lo desea y disfruta.',
    relatedTerms: ['Masoquismo', 'Sadomasoquismo', 'Impacto'],
  },
  {
    term: 'Sadomasoquismo',
    category: 'Roles & Dinámicas',
    definition: 'Interacción consensuada que combina el intercambio de dar y recibir estímulos sensoriales intensos o dolor recreativo.',
    relatedTerms: ['Sadismo', 'Masoquismo', 'Impacto'],
  },
  {
    term: 'Safe word semáforo',
    category: 'Consentimiento & Ética',
    definition: 'Sistema universal de tres niveles: Verde (continúa / más intenso), Amarillo (estoy cerca del límite, mantén o baja ritmo), Rojo (detén la escena de inmediato).',
    relatedTerms: ['Safeword (Palabra de seguridad)', 'Hard Limit (Límite duro)', 'Consent (Consentimiento)'],
  },
  {
    term: 'Safeword (Palabra de seguridad)',
    category: 'Consentimiento & Ética',
    definition: 'Palabra o señal pactada que interrumpe la escena de inmediato sin dar lugar a ambigüedades. Su uso debe respetarse al 100%.',
    relatedTerms: ['Safe word semáforo', 'Hard Limit (Límite duro)', 'RACK'],
  },
  {
    term: 'Scene (Escena)',
    category: 'Prácticas & BDSM',
    definition: 'Período acotado en el que se ejecuta una sesión de juego kink. Consta de tres partes indispensables: negociación, juego y aftercare.',
    relatedTerms: ['Scene Debrief', 'Aftercare', 'Negociación'],
  },
  {
    term: 'Scene Debrief',
    category: 'Consentimiento & Ética',
    definition: 'Conversación reflexiva posterior a la escena para analizar qué funcionó bien, qué causó incomodidad y cómo mejorar futuros encuentros.',
    relatedTerms: ['Aftercare', 'Scene (Escena)', 'Negociación'],
  },
  {
    term: 'Sensory Deprivation',
    category: 'Prácticas & BDSM',
    definition: 'Privación de uno o más sentidos (antifaz, tapones auditivos, capuchas) para potenciar al máximo la sensibilidad táctil y psicológica.',
    relatedTerms: ['Sensory Overload', 'Bondage', 'Subspace'],
  },
  {
    term: 'Sensory Overload',
    category: 'Prácticas & BDSM',
    definition: 'Saturación sensorial controlada mediante múltiples estímulos combinados (tacto, temperatura, luz, sonido) para inducir un estado de trance.',
    relatedTerms: ['Sensory Deprivation', 'Subspace', 'Topspace'],
  },
  {
    term: 'Service Top',
    category: 'Roles & Dinámicas',
    definition: 'Persona que lidera y domina en la escena con el propósito primordial de satisfacer los deseos, necesidades o fantasías de quien recibe.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Submissive Top', 'Switch'],
  },
  {
    term: 'Shibari',
    category: 'Prácticas & BDSM',
    definition: 'Arte japonés tradicional de ataduras con cuerda (Kinbaku). Busca el equilibrio entre técnica estética, tensión corporal y complicidad íntima.',
    relatedTerms: ['Bondage', 'Tijeras EMT / Rescate', 'Nervio Radial & Ulnar'],
    safetyTip: 'Aprende anatomía básica antes de realizar suspensiones parciales o totales, y mantén tijeras de corte inmediato.',
  },
  {
    term: 'Síndrome de Compartimento',
    category: 'Seguridad & Anatomía',
    definition: 'Aumento severo de presión dentro de un compartimento muscular por ataduras que compromete la circulación y puede causar necrosis o daño neuromuscular.',
    relatedTerms: ['Nervio Peroneo', 'Bondage', 'Tijeras EMT / Rescate'],
    safetyTip: 'Corta inmediatamente las ataduras ante hinchazón marcada, dolor punzante desproporcionado, palidez o pérdida de pulso periférico.',
  },
  {
    term: 'SSC',
    category: 'Consentimiento & Ética',
    definition: 'Safe, Sane and Consensual (Seguro, Sensato y Consensuado). Uno de los primeros marcos éticos históricos de la comunidad BDSM.',
    relatedTerms: ['RACK', 'PRICK', 'Consent (Consentimiento)'],
  },
  {
    term: 'Submissive Top',
    category: 'Roles & Dinámicas',
    definition: 'Persona que actúa activamente como Top en una escena física (administrando impacto o ataduras) siguiendo órdenes expresas de su Dominante.',
    relatedTerms: ['Service Top', 'Dominante (Dom/Domme)', 'Sumiso/a (Sub)'],
  },
  {
    term: 'Subspace',
    category: 'Seguridad & Anatomía',
    definition: 'Estado mental alterado de calma, euforia y trance que experimenta el sumiso durante una escena intensa gracias a la liberación masiva de endorfinas.',
    relatedTerms: ['Topspace', 'Aftercare', 'AfterDrop'],
  },
  {
    term: 'Sumiso/a (Sub)',
    category: 'Roles & Dinámicas',
    definition: 'Persona que consensuadamente cede el control y la toma de decisiones al dominante para explorar la entrega y la vulnerabilidad.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Switch', 'Subspace'],
  },
  {
    term: 'Swinger / Intercambio',
    category: 'No Monogamia & Vínculos',
    definition: 'Práctica consensuada de intercambio de parejas o participación en actividades sexuales en grupo con enfoque recreativo y acuerdos claros.',
    relatedTerms: ['Poliamor', 'Acuerdos de Salud Sexual', 'Consent (Consentimiento)'],
  },
  {
    term: 'Switch',
    category: 'Roles & Dinámicas',
    definition: 'Persona que disfruta de intercambiar los roles dominante y sumiso según el contexto, la pareja, la escena o el estado de ánimo.',
    relatedTerms: ['Dominante (Dom/Domme)', 'Sumiso/a (Sub)', 'D/s (Dominación/sumisión)'],
  },
  {
    term: 'Tea Consent',
    category: 'Consentimiento & Ética',
    definition: 'Analogía pedagógica: ofrecer sexo es como ofrecer una taza de té; si la persona dice que no, cambia de idea o está dormida, nunca se le obliga a beberlo.',
    relatedTerms: ['FRIES', 'MICA', 'Consent (Consentimiento)'],
  },
  {
    term: 'Tease & Denial',
    category: 'Prácticas & BDSM',
    definition: 'Estimulación erótica intencionalmente pausada y negada para construir tensión acumulada y amplificar el deseo en la persona sumisa.',
    relatedTerms: ['Edging', 'Orgasm Control', 'Castidad'],
  },
  {
    term: 'Tijeras EMT / Rescate',
    category: 'Seguridad & Anatomía',
    definition: 'Tijeras con punta roma diseñadas para cortar rápidamente cuerdas o ropa ajustada sin peligro de pinchar la piel de la modelo en una emergencia.',
    relatedTerms: ['Bondage', 'Shibari', 'Síndrome de Compartimento'],
    safetyTip: 'Deben estar accesibles a menos de un brazo de distancia en cualquier sesión con cuerdas.',
  },
  {
    term: 'Topdrop',
    category: 'Seguridad & Anatomía',
    definition: 'Bajón emocional y agotamiento físico o mental que puede sufrir la persona dominante tras sostener la responsabilidad de una escena intensa.',
    relatedTerms: ['AfterDrop', 'Topspace', 'Aftercare'],
  },
  {
    term: 'Topspace',
    category: 'Seguridad & Anatomía',
    definition: 'Estado de concentración plena, agudeza y flujo que experimenta el dominante mientras guía la escena y vela por su pareja.',
    relatedTerms: ['Subspace', 'Topdrop', 'Dominante (Dom/Domme)'],
  },
  {
    term: 'TPE (Total Power Exchange)',
    category: 'Roles & Dinámicas',
    definition: 'Intercambio Total de Poder. Dinámica de estilo de vida 24/7 donde el sumiso delega formalmente las decisiones cotidianas en el dominante.',
    relatedTerms: ['Collar', 'Protocolo', 'D/s (Dominación/sumisión)'],
  },
  {
    term: 'Triada / Unicornio',
    category: 'No Monogamia & Vínculos',
    definition: 'Dinámica afectiva de tres personas unidas. Unicornio describe habitualmente a una persona que se integra a una pareja ya consolidada.',
    relatedTerms: ['Poliamor', 'Metamor', 'Compersión'],
  },
  {
    term: 'Vanilla',
    category: 'Prácticas & BDSM',
    definition: 'Prácticas y relaciones afectivas y sexuales convencionales, sin dinámicas de poder ni elementos BDSM. No implica nada peyorativo.',
    relatedTerms: ['Kink', 'Fetiche'],
  },
  {
    term: 'Violet Wand',
    category: 'Prácticas & BDSM',
    definition: 'Dispositivo eléctrico de bulbo de vidrio que genera chispas y descargas de alta frecuencia y baja corriente sobre la piel.',
    relatedTerms: ['E-stim', 'Sensory Overload'],
    safetyTip: 'No usar cerca de líquidos inflamables ni en personas con marcapasos o implantes metálicos cercanos.',
  },
  {
    term: 'Voyeurismo',
    category: 'Prácticas & BDSM',
    definition: 'Disfrute erótico al observar a otras personas en actividades íntimas, siempre con su consentimiento informado y explícito en entornos kink.',
    relatedTerms: ['Exhibición', 'Kink', 'Consent (Consentimiento)'],
  },
  {
    term: 'Zonas de Impacto Prohibidas',
    category: 'Seguridad & Anatomía',
    definition: 'Áreas anatómicas que NUNCA deben golpearse: riñones, columna vertebral, articulaciones, cuello, cabeza, cóccix y detrás de las rodillas.',
    relatedTerms: ['Zonas de Impacto Seguro', 'Impacto', 'Flogger'],
    safetyTip: 'Golpear sobre los riñones o la columna puede causar hemorragias internas o daño nervioso permanente.',
  },
  {
    term: 'Zonas de Impacto Seguro',
    category: 'Seguridad & Anatomía',
    definition: 'Zonas con mayor masa muscular y tejido adiposo seguras para recibir impacto: glúteos y cara externa de los muslos.',
    relatedTerms: ['Zonas de Impacto Prohibidas', 'Impacto', 'Flogger'],
    safetyTip: 'Evita la parte inferior de los glúteos cercana al hueso ciático y nunca golpees hacia arriba hacia los riñones.',
  },
];

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  'Consentimiento & Ética',
  'Seguridad & Anatomía',
  'Prácticas & BDSM',
  'Roles & Dinámicas',
  'No Monogamia & Vínculos',
];

/**
 * Deterministic Term of the Day calculation
 */
export function getTermOfTheDay(date: Date = new Date()): GlossaryTerm {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % GLOSSARY.length;
  return GLOSSARY[index];
}

export function getRelatedGlossaryTerms(term: GlossaryTerm): GlossaryTerm[] {
  if (!term.relatedTerms || term.relatedTerms.length === 0) return [];
  return GLOSSARY.filter((t) => term.relatedTerms?.includes(t.term));
}
