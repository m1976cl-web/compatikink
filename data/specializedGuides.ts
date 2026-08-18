export interface GuideSection {
  id: string;
  title: string;
  content: string;
  type?: 'warning' | 'danger' | 'info';
}

export interface InteractiveChecklist {
  id: string;
  label: string;
}

export interface SpecializedGuide {
  id: string;
  title: string;
  shortDescription: string;
  sections: GuideSection[];
  checklist: InteractiveChecklist[];
  badgeId: string;
}

export const SPECIALIZED_GUIDES: SpecializedGuide[] = [
  {
    id: 'cuerdas-shibari',
    title: 'Tratamiento y Cuidado de Cuerdas (Shibari / Yute)',
    shortDescription: 'Todo lo que necesitas saber para preparar y cuidar tus cuerdas de yute.',
    badgeId: 'estudiante_shibari',
    sections: [
      {
        id: 'cuerdas-1',
        title: 'Desmotado y Hervido',
        content: 'El desmotado (eliminar pelusas quemándolas o cortándolas) y el hervido son pasos cruciales para suavizar el yute. Al hervir, añade unas gotas de aceite de jojoba o cera natural para comenzar el proceso de acondicionamiento.'
      },
      {
        id: 'cuerdas-2',
        title: 'Tensado y Secado',
        content: 'Seca las cuerdas a la sombra y con tensión. El sol directo o el secado sin tensión puede debilitar o encoger las fibras de manera desigual.'
      },
      {
        id: 'cuerdas-3',
        title: 'Acondicionado y Almacenamiento',
        content: 'Acondiciona periódicamente con aceite de jojoba o cera para cuerdas. Guárdalas en madejas sin nudos y en lugares secos para prevenir el moho y mantener la integridad estructural.'
      },
      {
        id: 'cuerdas-warn',
        title: 'Advertencia de Humedad',
        content: 'Nunca almacenes las cuerdas si aún están húmedas. El yute es susceptible a pudrirse por dentro sin signos externos visibles, lo cual puede causar roturas en momentos críticos.',
        type: 'danger'
      }
    ],
    checklist: [
      { id: 'shibari-chk-1', label: 'Cuerdas desmotadas correctamente.' },
      { id: 'shibari-chk-2', label: 'Cuerdas hervidas y secadas bajo tensión a la sombra.' },
      { id: 'shibari-chk-3', label: 'Acondicionadas con cera o jojoba.' },
      { id: 'shibari-chk-4', label: 'Almacenadas en madejas sin nudos.' }
    ]
  },
  {
    id: 'higiene-juguetes',
    title: 'Higiene, Materiales y Esterilización de Juguetes',
    shortDescription: 'Guía definitiva sobre materiales seguros y protocolos de limpieza.',
    badgeId: 'enciclopedia_intima',
    sections: [
      {
        id: 'juguetes-1',
        title: 'Materiales Seguros',
        content: 'Privilegia la Silicona platino 100%, Vidrio borosilicato y Acero inoxidable. Estos materiales no son porosos y pueden esterilizarse fácilmente (ej. hirviéndolos).'
      },
      {
        id: 'juguetes-2',
        title: 'Materiales Porosos',
        content: 'Evita o usa siempre con barreras materiales como TPE/TPR, Cyberskin, Jelly rubber. Son porosos, retienen bacterias y no pueden ser esterilizados completamente.'
      },
      {
        id: 'juguetes-3',
        title: 'Reglas de Lubricantes',
        content: 'NUNCA uses lubricante a base de silicona con juguetes de silicona (los degrada). Usa lubricantes a base de agua para silicona, y reserva la silicona para vidrio o acero.'
      },
      {
        id: 'juguetes-4',
        title: 'Protocolos de Desinfección',
        content: 'Lava siempre con agua tibia y jabón neutro. Para materiales compatibles (silicona 100%, acero, vidrio), hiérvelos 5-10 minutos o usa una solución de lejía al 10% (con enjuague extremo).'
      }
    ],
    checklist: [
      { id: 'juguetes-chk-1', label: 'Identifiqué los materiales de mi colección.' },
      { id: 'juguetes-chk-2', label: 'Tengo lubricante base agua para juguetes de silicona.' },
      { id: 'juguetes-chk-3', label: 'Conozco el método de esterilización para cada material.' }
    ]
  },
  {
    id: 'botiquin-emergencia',
    title: 'Botiquín de Primeros Auxilios & Rescate BDSM',
    shortDescription: 'Elementos esenciales y protocolos ante accidentes.',
    badgeId: 'enciclopedia_intima',
    sections: [
      {
        id: 'botiquin-1',
        title: 'Herramienta #1: Tijeras EMT',
        content: 'Tijeras EMT de punta roma son la herramienta obligatoria de rescate. Deben estar SIEMPRE accesibles para cortar ropa o cuerdas de inmediato sin riesgo de cortar la piel.'
      },
      {
        id: 'botiquin-2',
        title: 'Contenido del Botiquín',
        content: 'Compresas frías instantáneas, vendas elásticas autoadherentes, crema árnica, electrolitos (para recuperación tras el drop o dolor agudo), y guantes de nitrilo.'
      },
      {
        id: 'botiquin-3',
        title: 'Emergencia por Compresión de Nervio',
        content: 'En suspensión o ataduras, la compresión del nervio radial es común. Signos: entumecimiento, "hormigueo" prolongado, pérdida de fuerza. Acción inmediata: cortar tensión, bajar, evaluar, no masajear fuertemente, aplicar frío leve y descanso.',
        type: 'danger'
      }
    ],
    checklist: [
      { id: 'botiquin-chk-1', label: 'Tengo tijeras EMT de punta roma accesibles durante cada sesión.' },
      { id: 'botiquin-chk-2', label: 'Mi botiquín incluye vendas, hielo instantáneo y electrolitos.' },
      { id: 'botiquin-chk-3', label: 'Sé reconocer signos de compresión de nervios (entumecimiento/hormigueo).' }
    ]
  },
  {
    id: 'protocolo-rack',
    title: 'Protocolo SSC / RACK en Citas & Munches',
    shortDescription: 'Gestión de riesgos y negociación en encuentros BDSM.',
    badgeId: 'enciclopedia_intima',
    sections: [
      {
        id: 'rack-1',
        title: 'Diferencia SSC y RACK',
        content: 'SSC (Seguro, Sensato y Consensuado) es el estándar tradicional. RACK (Riesgo Asumido y Consensuado en el Kink) reconoce que algunas actividades son inherentemente riesgosas y se enfoca en conocer y mitigar esos riesgos.'
      },
      {
        id: 'rack-2',
        title: 'Regla de las 3 Fases',
        content: '1. Negociación previa lúcida (sin alteradores mentales).\n2. Chequeo de límites duros antes de empezar.\n3. Sistema de palabras de seguridad semáforo (Verde, Amarillo, Rojo).'
      },
      {
        id: 'rack-3',
        title: 'Prevención en Citas Nuevas',
        content: 'Si conoces a un nuevo compañero, haz la primera cita (Vanilla Date / Munch) en terreno neutral. No hagas escenas intensas el primer día. Informa a alguien de confianza dónde estás y con quién.',
        type: 'warning'
      }
    ],
    checklist: [
      { id: 'rack-chk-1', label: 'Conozco la diferencia entre SSC y RACK.' },
      { id: 'rack-chk-2', label: 'Siempre negocio límites duros antes de jugar.' },
      { id: 'rack-chk-3', label: 'Utilizo el sistema de palabra de seguridad semáforo.' },
      { id: 'rack-chk-4', label: 'Informo a un tercero al asistir a citas nuevas o munches.' }
    ]
  }
];
