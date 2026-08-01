export interface PeggingProfile {
  id: string;
  nickname: string;
  role: 'Pegger (Giver / Top)' | 'Peggee (Receiver / Bottom)' | 'Switch (Ambos)';
  experience: 'Principiante' | 'Intermedio' | 'Avanzado';
  bio: string;
  location: string;
  badges: string[];
}

export const PEGGING_PROFILES_DATA: PeggingProfile[] = [
  {
    id: 'peg-1',
    nickname: 'Valeria_Giver',
    role: 'Pegger (Giver / Top)',
    experience: 'Avanzado',
    bio: 'Apasionada por la técnica, el control de ritmo y el aftercare cálido. Busco comunicación abierta y cero tabúes.',
    location: 'Santiago / Madrid',
    badges: ['Arnés Pro 🛠️', 'Aftercare Garantizado 🪷', 'Verificada 📸'],
  },
  {
    id: 'peg-2',
    nickname: 'Mateo_Explorer',
    role: 'Peggee (Receiver / Bottom)',
    experience: 'Principiante',
    bio: 'Buscando una compañera con experiencia y paciencia que valore la preparación lenta y la confianza.',
    location: 'Buenos Aires / Barcelona',
    badges: ['Confianza Plena 🤝', 'Comunicación 100% 💬'],
  },
  {
    id: 'peg-3',
    nickname: 'Alex_Switch',
    role: 'Switch (Ambos)',
    experience: 'Intermedio',
    bio: 'Disfruto ambos roles en la dinámica. Me enfoco en la estimulación prostática relajada y la música ambiental.',
    location: 'CDMX / Valencia',
    badges: ['Versátil 🔄', 'Teledildonics 🎵'],
  },
];

export interface PeggingGuideSection {
  id: string;
  title: string;
  emoji: string;
  type: 'psicologico' | 'practico';
  summary: string;
  points: string[];
}

export const PEGGING_GUIDE: PeggingGuideSection[] = [
  {
    id: 'psico-1',
    title: 'Aspecto Psicológico & Desconexión de Tabúes',
    emoji: '🧠',
    type: 'psicologico',
    summary: 'El Pegging es una práctica de máxima confianza y entrega erótica que trasciende los roles tradicionales de género.',
    points: [
      'Desmitificación: La anatomía del placer no tiene orientación sexual; la estimulación de la próstata es puramente biológica.',
      'Vulnerabilidad Consensuada: Entregar el control requiere un entorno seguro, libre de juicio y con entusiasmo mutuo.',
      'Reafirmación Afectiva: Celebrar la complicidad de pareja y validar los deseos sin estigmas externos.',
    ],
  },
  {
    id: 'psico-2',
    title: 'Comunicación Previa & Negociación Libre de Presión',
    emoji: '💬',
    type: 'psicologico',
    summary: 'Establecer expectativas y safewords antes de tocar el equipamiento.',
    points: [
      'Entusiasmo Mutuo: Ambos deben desear la experiencia sin presiones ni compromisos por compromiso.',
      'Límites Claros (Hard Limits): Acordar el tamaño del dildo, las posiciones y el tiempo de preparación previa.',
      'Palabras Clave de Control: Usar el sistema semáforo (Verde / Amarillo / Rojo) durante toda la práctica.',
    ],
  },
  {
    id: 'prac-1',
    title: 'Selección de Equipamiento & Juguetes Adecuados',
    emoji: '🛠️',
    type: 'practico',
    summary: 'La elección correcta del arnés y dildo es clave para el confort y la ergonomía.',
    points: [
      'Arnés Cómodo: Elegir arneses de cintura ajustables con correas de neopreno o cuero suave de buena sujeción.',
      'Dildos de Silicona Platinum: Usar silicona médica de firmeza gradual con base ancha abocinada obligatoria.',
      'Diseño Ergonómico: Comenzar con dildos de menor diámetro y curvatura orientada al punto P (próstata).',
    ],
  },
  {
    id: 'prac-2',
    title: 'Técnica, Lubricación & Preparación Física',
    emoji: '💧',
    type: 'practico',
    summary: 'La paciencia y el volumen de lubricante determinan una experiencia placentera.',
    points: [
      'Lubricación Abundante: Usar lubricante específico de alta viscosidad a base de agua o silicona pura.',
      'Relajación & Respiración: Iniciar con masajes progresivos y respiración abdominal profunda sin prisas.',
      'Posiciones Recomendadas: Posición del perro (Doggy) relajado o Cuchara lateral (Spoon) para control total del ritmo.',
    ],
  },
];
