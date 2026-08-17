export interface TopicReply {
  id: string;
  author: string;
  authorRole?: string;
  authorEmoji?: string;
  timeAgo: string;
  content: string;
  likes: number;
  isVerified?: boolean;
}

export interface CommunityTopic {
  id: string;
  title: string;
  author: string;
  authorRole?: string;
  authorEmoji?: string;
  timeAgo: string;
  content: string;
  repliesCount: number;
  likes: number;
  tags: string[];
  isPinned?: boolean;
  replies?: TopicReply[];
}

export type CommunityCategory =
  | 'shibari'
  | 'aftercare'
  | 'power_exchange'
  | 'gear_latex'
  | 'polyamory'
  | 'sensation_impact'
  | 'beginners'
  | 'queer_inclusive';

export interface CommunityGroup {
  id: string;
  name: string;
  category: CommunityCategory;
  emoji: string;
  description: string;
  memberCount: number;
  topicsCount: number;
  tags: string[];
  topics: CommunityTopic[];
}

export const COMMUNITY_CATEGORY_LABELS: Record<CommunityCategory, { label: string; emoji: string; color: string }> = {
  shibari: { label: 'Shibari & Cuerdas', emoji: '🪢', color: '#c084fc' },
  aftercare: { label: 'Aftercare & Emocional', emoji: '🪷', color: '#38bdf8' },
  power_exchange: { label: 'D/s & Intercambio de Poder', emoji: '🗝️', color: '#fbbf24' },
  gear_latex: { label: 'Látex, Cuero & Gear', emoji: '🧤', color: '#f472b6' },
  polyamory: { label: 'No Monogamia & Poliamor', emoji: '🌿', color: '#4ade80' },
  sensation_impact: { label: 'Sensorial & BDSM', emoji: '⚡', color: '#fb923c' },
  beginners: { label: 'Principiantes & Primeros Pasos', emoji: '🌱', color: '#a78bfa' },
  queer_inclusive: { label: 'Queer & Diversidad', emoji: '🌈', color: '#ec4899' },
};

export const INITIAL_COMMUNITIES: CommunityGroup[] = [
  {
    id: 'comm-shibari',
    name: 'Shibari & Cuerdas: Técnica y Seguridad',
    category: 'shibari',
    emoji: '🪢',
    description: 'Comunidad dedicada a la atadura japonesa, patrones estéticos, cuidado de cuerdas naturales (yute/cáñamo) y seguridad anatómica estricta.',
    memberCount: 1840,
    topicsCount: 42,
    tags: ['Shibari', 'Yute', 'Seguridad Anatómica', 'Cáñamo', 'Tijeras EMT'],
    topics: [
      {
        id: 'top-shib-1',
        title: '📌 Guía de Cuidado: Tratamiento de cuerdas de yute con aceite de jojoba',
        author: 'Rigger_Lucas',
        authorRole: 'Top / Rigger',
        authorEmoji: '🪢',
        timeAgo: 'hace 2 días',
        content: 'El tratamiento de la cuerda es fundamental no solo por estética, sino para evitar quemaduras por fricción en la piel del rope bottom. Recomiendo hervir, flamear pelusa y tratar con mezcla de cera de abejas y aceite de jojoba mineral.',
        repliesCount: 18,
        likes: 64,
        tags: ['Mantenimiento', 'Yute', 'Piel'],
        isPinned: true,
        replies: [
          {
            id: 'rep-1',
            author: 'Valeria_Rope',
            authorRole: 'Switch',
            authorEmoji: '✨',
            timeAgo: 'hace 1 día',
            content: 'Totalmente de acuerdo. La cera natural además aporta ese agarre exacto necesario para nudos de fricción sin que se deslicen.',
            likes: 12,
            isVerified: true,
          },
          {
            id: 'rep-2',
            author: 'Cami_Sub',
            authorRole: 'Bottom',
            authorEmoji: '🌸',
            timeAgo: 'hace 18 horas',
            content: 'Como modelo, la diferencia entre una cuerda tratada y una áspera se siente de inmediato en muñecas y tobillos.',
            likes: 9,
          },
        ],
      },
      {
        id: 'top-shib-2',
        title: 'Verificación del nervio radial en ataduras de muñeca (Goby)',
        author: 'Dr_Kink_Anatomy',
        authorRole: 'Educador',
        authorEmoji: '🩺',
        timeAgo: 'hace 4 días',
        content: 'Recuerden que la cara dorsal de la muñeca (donde pasa la rama superficial del nervio radial) es muy vulnerable. Nunca cruzar cuerdas con tensión directa sobre el hueso.',
        repliesCount: 14,
        likes: 52,
        tags: ['Anatomía', 'Nervios', 'Seguridad'],
        replies: [
          {
            id: 'rep-3',
            author: 'RopeMaster_Alex',
            authorRole: 'Rigger',
            authorEmoji: '🖤',
            timeAgo: 'hace 3 días',
            content: 'Siempre mantener las tijeras EMT a menos de un brazo de distancia por si ocurre entumecimiento súbito.',
            likes: 15,
            isVerified: true,
          },
        ],
      },
    ],
  },
  {
    id: 'comm-aftercare',
    name: 'Aftercare, Salud Mental & Contención',
    category: 'aftercare',
    emoji: '🪷',
    description: 'Espacio de apoyo y buenas prácticas para la fase post-escena. Gestión del Subdrop/Topdrop, descompresión emocional y cuidados físicos.',
    memberCount: 1490,
    topicsCount: 38,
    tags: ['Aftercare', 'Subdrop', 'Topdrop', 'Contención', 'Vulnerabilidad'],
    topics: [
      {
        id: 'top-after-1',
        title: '📌 Protocolo de Aftercare en 3 Fases: Físico, Emocional y Check-in 24h',
        author: 'PsicoKink_Ana',
        authorRole: 'Psicóloga / Switch',
        authorEmoji: '🪷',
        timeAgo: 'hace 3 días',
        content: 'El aftercare no termina al soltar las cuerdas o guardar el látigo. Proponemos 3 fases: Fase 1 (15m): mantas, glucosa e hidratación; Fase 2 (30-60m): conversación tranquila; Fase 3 (día siguiente): mensaje breve para revisar el estado anímico.',
        repliesCount: 29,
        likes: 98,
        tags: ['Protocolo', 'Salud Mental', 'Topdrop'],
        isPinned: true,
        replies: [
          {
            id: 'rep-4',
            author: 'Master_Nox',
            authorRole: 'Dominante',
            authorEmoji: '👑',
            timeAgo: 'hace 2 días',
            content: 'Excelente resumen. Los Tops a veces olvidamos que la responsabilidad energética genera un desgaste enorme que requiere su propio descanso.',
            likes: 24,
            isVerified: true,
          },
        ],
      },
      {
        id: 'top-after-2',
        title: '¿Qué alimentos o bebidas tienen listos para después de una escena intensa?',
        author: 'Sensual_Sofi',
        authorRole: 'Sub',
        authorEmoji: '🍵',
        timeAgo: 'hace 5 días',
        content: 'En casa siempre dejamos preparado té de manzanilla con miel tibia, frutos secos y electrolitos listos antes de empezar para no tener que cocinar nada.',
        repliesCount: 22,
        likes: 41,
        tags: ['Alimentación', 'Confort', 'Kits'],
      },
    ],
  },
  {
    id: 'comm-power',
    name: 'Power Exchange & Dinámicas D/s Consensuadas',
    category: 'power_exchange',
    emoji: '🗝️',
    description: 'Debates sobre acuerdos de poder, contratos D/s dinámicos, protocolos de servicio, castidad, comunicación no violenta y dinámicas TPE.',
    memberCount: 1650,
    topicsCount: 47,
    tags: ['D/s', 'Contratos', 'Protocolos', 'Castidad', 'TPE', 'Límites'],
    topics: [
      {
        id: 'top-pwr-1',
        title: '📌 Cláusulas de Revisión Periódica en Contratos D/s (No son estáticos)',
        author: 'LegalKink_Carlos',
        authorRole: 'Dominante',
        authorEmoji: '⚖️',
        timeAgo: 'hace 1 semana',
        content: 'Un contrato D/s sano nunca es un documento inamovible. Debe contemplar una cláusula de revisión cada 3 o 6 meses para reevaluar límites blandos, reglas obsoletas y necesidades emocionales de ambas partes.',
        repliesCount: 31,
        likes: 85,
        tags: ['Contrato', 'Consenso', 'Evolución'],
        isPinned: true,
        replies: [
          {
            id: 'rep-5',
            author: 'Elena_Switch',
            authorRole: 'Switch',
            authorEmoji: '🗝️',
            timeAgo: 'hace 4 días',
            content: 'Exacto. Lo que nos gustaba hace un año puede cambiar con la confianza o el estrés del trabajo.',
            likes: 16,
          },
        ],
      },
      {
        id: 'top-pwr-2',
        title: 'Cómo instaurar un protocolo matutino sutil que no interfiera con la rutina laboral',
        author: 'Devoted_Soul',
        authorRole: 'Sumiso',
        authorEmoji: '☕',
        timeAgo: 'hace 2 días',
        content: 'Buscamos ideas de protocolo que sean discretas: enviar un mensaje formal de saludo matutino o llevar un accesorio simbólico que recuerde el vínculo sin llamar la atención en la oficina.',
        repliesCount: 26,
        likes: 58,
        tags: ['Protocolo', 'Rutina', 'Discreción'],
      },
    ],
  },
  {
    id: 'comm-latex',
    name: 'Látex, Cuero & Fetiche Gear',
    category: 'gear_latex',
    emoji: '🧤',
    description: 'Comunidad para apasionados del látex negro brillante, vestuario de vinilo, arneses de cuero artesanal y mantenimiento de juguetes.',
    memberCount: 1230,
    topicsCount: 31,
    tags: ['Látex', 'Shine', 'Cuero', 'Vivishine', 'Gear Closet'],
    topics: [
      {
        id: 'top-ltx-1',
        title: '📌 Almacenamiento correcto de látex: Cero luz UV y lubricación en talco/silicona',
        author: 'Latex_Queen_Val',
        authorRole: 'Domina',
        authorEmoji: '🖤',
        timeAgo: 'hace 3 días',
        content: 'El látex es un material vivo. Nunca guardarlo en perchas metálicas (el cobre lo mancha irremediablemente) ni cerca de ventanas. Guardar en bolsas oscuras con talco sin perfume o baño previo en Vivishine.',
        repliesCount: 24,
        likes: 76,
        tags: ['Cuidado', 'Vivishine', 'Mantenimiento'],
        isPinned: true,
      },
      {
        id: 'top-ltx-2',
        title: '¿Silicona líquida o gel para vestirse rápido sin tirones?',
        author: 'RubberMan_99',
        authorRole: 'Explorador',
        authorEmoji: '🧤',
        timeAgo: 'hace 1 día',
        content: 'Personalmente prefiero aceite de silicona pura de grado cosmético. Reduce el tiempo de vestimenta a la mitad y cuida las costuras cloradas.',
        repliesCount: 15,
        likes: 33,
        tags: ['Vestirse', 'Tips', 'Silicona'],
      },
    ],
  },
  {
    id: 'comm-poly',
    name: 'No Monogamia Ética, Poliamor & Relaciones Libres',
    category: 'polyamory',
    emoji: '🌿',
    description: 'Consejos sobre gestión de metamores, anarquía relacional, compersión, agendas compartidas y acuerdos de salud sexual transparente.',
    memberCount: 1390,
    topicsCount: 35,
    tags: ['Poliamor', 'Compersión', 'Metamores', 'Salud Sexual', 'NRE'],
    topics: [
      {
        id: 'top-poly-1',
        title: '📌 La Compersión se entrena: Manejando la energía de nueva relación (NRE) sin descuidar vínculos',
        author: 'PolyGuide_Mar',
        authorRole: 'Bisagra / Poli',
        authorEmoji: '🌿',
        timeAgo: 'hace 4 días',
        content: 'Sentir NRE es natural y excitante, pero la responsabilidad afectiva exige sostener los acuerdos previos con tu pareja ancla o metamores con empatía y comunicación clara.',
        repliesCount: 33,
        likes: 91,
        tags: ['Compersión', 'NRE', 'Acuerdos'],
        isPinned: true,
      },
      {
        id: 'top-poly-2',
        title: 'Protocolos de exámenes de ITS en redes poliamorosas: ¿Cada cuánto se testean?',
        author: 'SafeHealth_Sam',
        authorRole: 'Switch',
        authorEmoji: '🩺',
        timeAgo: 'hace 2 días',
        content: 'En nuestra red acordamos panel completo cada 6 meses y compartir los resultados con total naturalidad sin estigmas.',
        repliesCount: 20,
        likes: 67,
        tags: ['Salud Sexual', 'Transparencia'],
      },
    ],
  },
  {
    id: 'comm-sensation',
    name: 'Juego Sensorial, Impacto & BDSM Seguro',
    category: 'sensation_impact',
    emoji: '⚡',
    description: 'Técnicas de impacto progresivo (paleta, flogger, vara), cera de baja temperatura, privación sensorial, electro-estimulación y juego de temperatura.',
    memberCount: 1520,
    topicsCount: 40,
    tags: ['Impacto', 'Cera', 'Sensorial', 'Flogger', 'Temperatura', 'TENS'],
    topics: [
      {
        id: 'top-sens-1',
        title: '📌 Curva de Impacto: El calentamiento previo con floggers suaves evita hematomas',
        author: 'Impact_Pro_Dave',
        authorRole: 'Top',
        authorEmoji: '⚡',
        timeAgo: 'hace 5 días',
        content: 'Nunca comenzar con un implemento rígido o golpe seco. Empezar con caricias de cuero suave, luego golpes ligeros de dispersión para irrigar sangre y liberar endorfinas de forma gradual.',
        repliesCount: 27,
        likes: 82,
        tags: ['Impacto', 'Endorfinas', 'Técnica'],
        isPinned: true,
      },
      {
        id: 'top-sens-2',
        title: 'Cera de soja vs Cera de parafina: Puntos de fusión y temperatura segura',
        author: 'WaxArtist_Clara',
        authorRole: 'Switch',
        authorEmoji: '🕯️',
        timeAgo: 'hace 3 días',
        content: 'La cera de soja suele fundir a 48-52°C, ideal para principiantes. Nunca usar velas decorativas convencionales que superen los 65°C.',
        repliesCount: 19,
        likes: 49,
        tags: ['Cera', 'Temperatura', 'Seguridad'],
      },
    ],
  },
  {
    id: 'comm-beginners',
    name: 'Principiantes: Primeros Pasos sin Miedo',
    category: 'beginners',
    emoji: '🌱',
    description: 'Espacio libre de juicios para personas curiosas. Cómo hablar de deseos con tu pareja, desmitificar prejuicios y dar los primeros pasos seguros.',
    memberCount: 2100,
    topicsCount: 65,
    tags: ['Primeros Pasos', 'Comunicación', 'Curiosidad', 'Sin Juicios', 'Preguntas'],
    topics: [
      {
        id: 'top-beg-1',
        title: '📌 "Quiero proponerle algo a mi pareja pero me da vergüenza": La técnica del cuestionario asimétrico',
        author: 'Sofi_Explora',
        authorRole: 'Curiosa',
        authorEmoji: '🌱',
        timeAgo: 'hace 1 día',
        content: 'Compartir la app de CompatKink con mi novio nos quitó todo el peso de hablarlo directamente al principio. Saber que solo veríamos lo que coincidía nos dio la seguridad que necesitábamos.',
        repliesCount: 42,
        likes: 125,
        tags: ['CompatKink', 'Pareja', 'Confianza'],
        isPinned: true,
      },
      {
        id: 'top-beg-2',
        title: '¿Qué es lo primero que recomiendan comprar para empezar a experimentar en casa?',
        author: 'Newbie_Tom',
        authorRole: 'Principiante',
        authorEmoji: '❓',
        timeAgo: 'hace 6 horas',
        content: 'Estamos pensando en una venda suave de satén para los ojos y un par de esposas de velcro acolchadas.',
        repliesCount: 31,
        likes: 48,
        tags: ['Gear Inicial', 'Vendas', 'Recomendaciones'],
      },
    ],
  },
  {
    id: 'comm-queer',
    name: 'Espacios Queer, Fluidos & Diversos',
    category: 'queer_inclusive',
    emoji: '🌈',
    description: 'Comunidad LGBTQIA+, dinámicas trans-inclusivas, exploración de género, pegging, subversión de roles tradicionales y espacios libres de heteronormatividad.',
    memberCount: 1310,
    topicsCount: 28,
    tags: ['Queer', 'Trans Inclusive', 'Pegging', 'Roles Fluidos', 'Diversidad'],
    topics: [
      {
        id: 'top-queer-1',
        title: '📌 Desmarcando el BDSM de los roles de género tradicionales: Dominación y Sumisión Queer',
        author: 'Alex_Fluid',
        authorRole: 'Switch',
        authorEmoji: '🌈',
        timeAgo: 'hace 3 días',
        content: 'El poder en una escena no tiene nada que ver con el género ni la anatomía. La belleza de los espacios alternativos radica en redefinir el poder en nuestros propios términos.',
        repliesCount: 25,
        likes: 79,
        tags: ['Queer', 'Roles', 'Inclusión'],
        isPinned: true,
      },
    ],
  },
];
