import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

export interface SceneStep {
  id: string;
  title: string;
  durationMins: number;
  description: string;
  safetyCheckin: boolean;
  notes?: string;
}

export interface SceneTemplate {
  id: string;
  title: string;
  description: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  totalDurationMins: number;
  gearRequired: string[];
  isPreset?: boolean;
  createdAt: string;
  steps: SceneStep[];
}

const STORAGE_KEY_SCENE_TEMPLATES = 'scene_templates_custom_v1';

export const PRESET_SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'preset_shibari_gentle',
    title: '🪢 Shibari & Restraint Gentle Scene',
    description: 'Sesión progresiva de suspensión baja o ataduras suaves en piso con check-ins de circulación cada 5 min.',
    intensity: 2,
    totalDurationMins: 30,
    gearRequired: ['Cuerdas de Yute / Algodón', 'Tijeras de Emergencia (EMS Shears)', 'Manta de Aftercare'],
    isPreset: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    steps: [
      {
        id: 'step_1',
        title: '1. Negociación y Check de Nervios',
        durationMins: 5,
        description: 'Revisión de palabras de seguridad (Semáforo), pulsos en muñecas y test sensorial.',
        safetyCheckin: true,
      },
      {
        id: 'step_2',
        title: '2. Arnes de Pecho y Posicionamiento',
        durationMins: 10,
        description: 'Construcción del arnés base. Verificar respiración libre y respuesta nerviosa.',
        safetyCheckin: true,
      },
      {
        id: 'step_3',
        title: '3. Restricción y Estimulación Sensorial',
        durationMins: 10,
        description: 'Tensión moderada, caricias con plumas o vendaje de ojos.',
        safetyCheckin: false,
      },
      {
        id: 'step_4',
        title: '4. Corte / Desatado Seguro y Aftercare',
        durationMins: 5,
        description: 'Retiro suave de cuerdas, frotado de piel para circulación y abrazo de contención.',
        safetyCheckin: true,
      },
    ],
  },
  {
    id: 'preset_impact_rhythm',
    title: '⚡ Rhythmic Impact & Warm-Up',
    description: 'Escena de impacto progresivo (Palmadas ➔ Paleta de Cuero ➔ Flogger) con escala de intensidad.',
    intensity: 4,
    totalDurationMins: 35,
    gearRequired: ['Flogger de Napa', 'Paleta de Cuero', 'Aceite Corporal', 'Agua'],
    isPreset: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    steps: [
      {
        id: 'step_1',
        title: '1. Calentamiento Corporal (Warm-Up)',
        durationMins: 5,
        description: 'Fricción y palmadas suaves en glúteos para irrigar la piel.',
        safetyCheckin: false,
      },
      {
        id: 'step_2',
        title: '2. Impacto Ritmo Progresivo (Flogger)',
        durationMins: 15,
        description: 'Golpes rítmicos evitando riñones y zona lumbar.',
        safetyCheckin: true,
      },
      {
        id: 'step_3',
        title: '3. Clímax Sensorial y Descenso',
        durationMins: 10,
        description: 'Reducción de velocidad del golpe e integración de caricias de reconexión.',
        safetyCheckin: false,
      },
      {
        id: 'step_4',
        title: '4. Protocolo de Aftercare Inmediato',
        durationMins: 5,
        description: 'Hidratación, cubrir con manta térmica y chequeo emocional.',
        safetyCheckin: true,
      },
    ],
  },
  {
    id: 'preset_sensory_deprivation',
    title: '🧘 Sensory Deprivation & Mind Control',
    description: 'Privación sensorial completa con antifaz, auriculares aislantes y masajes con cera tibia.',
    intensity: 3,
    totalDurationMins: 25,
    gearRequired: ['Antifaz Opaco', 'Auriculares / Ruido Blanco', 'Vela de Masaje Kink', 'Plumas'],
    isPreset: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    steps: [
      {
        id: 'step_1',
        title: '1. Aislamiento Sensorial',
        durationMins: 5,
        description: 'Colocar antifaz y audífonos. Establecer señal de toques físicos para seguridad.',
        safetyCheckin: true,
      },
      {
        id: 'step_2',
        title: '2. Mapa de Contrastes Térmicos',
        durationMins: 12,
        description: 'Alternar hielo suave y cera tibia de bajo punto de fusión.',
        safetyCheckin: false,
      },
      {
        id: 'step_3',
        title: '3. Reconexión Sensorial y Masaje',
        durationMins: 8,
        description: 'Retiro del antifaz despacio a luz tenue, abrazo de contención.',
        safetyCheckin: true,
      },
    ],
  },
];

export async function loadCustomSceneTemplates(): Promise<SceneTemplate[]> {
  const custom = await readJsonStorage<SceneTemplate[]>(STORAGE_KEY_SCENE_TEMPLATES, []);
  return [...PRESET_SCENE_TEMPLATES, ...(custom || [])];
}

export async function saveCustomSceneTemplate(template: SceneTemplate): Promise<SceneTemplate[]> {
  const custom = await readJsonStorage<SceneTemplate[]>(STORAGE_KEY_SCENE_TEMPLATES, []);
  const updated = [template, ...(custom || []).filter((t) => t.id !== template.id)];
  await writeJsonStorage(STORAGE_KEY_SCENE_TEMPLATES, updated);
  return [...PRESET_SCENE_TEMPLATES, ...updated];
}

export async function deleteCustomSceneTemplate(id: string): Promise<SceneTemplate[]> {
  const custom = await readJsonStorage<SceneTemplate[]>(STORAGE_KEY_SCENE_TEMPLATES, []);
  const updated = (custom || []).filter((t) => t.id !== id);
  await writeJsonStorage(STORAGE_KEY_SCENE_TEMPLATES, updated);
  return [...PRESET_SCENE_TEMPLATES, ...updated];
}
