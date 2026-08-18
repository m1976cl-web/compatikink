/**
 * Latex catsuit measurement ficha aligned with latexpattern MEASUREMENTS_DEF
 * (https://github.com/m1976cl-web/latexpattern — 28 keys, cm/kg).
 *
 * CompatKink stores the ficha in the local vault and exports markdown + JSON
 * the wearer can send to a tailor. JSON `measurements` uses the same keys so it
 * can be loaded in latexpattern (import looks for `importedState.measurements`).
 *
 * No shop checkout. User sends the export themselves.
 */

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { MEASUREMENT_EXPORT_DISCLAIMER } from '@/lib/measurementDisclaimer';

export const LATEX_MEASUREMENT_KEY = 'fetish_lab_latex_measurements_v1';
export const LATEX_MEASUREMENT_VERSION = 1 as const;
export const LATEXPATTERN_SCHEMA = 'latexpattern.MEASUREMENTS_DEF.v28';

export type LatexSilhouette = 'female' | 'male';
export type LatexTension = 'comfort' | 'tight' | 'second_skin';
export type LatexGroup = 'general' | 'cabeza' | 'torso' | 'brazo' | 'pierna';

export interface LatexFieldDef {
  key: string;
  group: LatexGroup;
  unit: 'cm' | 'kg' | 'tipo';
  min: number;
  max: number;
  step: number;
  /** latexpattern defaultVal — used only as placeholder, never auto-saved. */
  placeholder: number;
  essential?: boolean;
}

/**
 * Exact key order from latexpattern `MEASUREMENTS_DEF` (id 1–28).
 * gender is stored as silhouette on the profile; export maps female→1, male→2.
 */
export const LATEXPATTERN_FIELDS: LatexFieldDef[] = [
  { key: 'weight', group: 'general', unit: 'kg', min: 40, max: 130, step: 0.5, placeholder: 62 },
  { key: 'height', group: 'general', unit: 'cm', min: 140, max: 210, step: 1, placeholder: 165, essential: true },
  { key: 'headCircum', group: 'cabeza', unit: 'cm', min: 48, max: 64, step: 0.5, placeholder: 55 },
  { key: 'headLength', group: 'cabeza', unit: 'cm', min: 18, max: 32, step: 0.5, placeholder: 23 },
  { key: 'neckCircum', group: 'cabeza', unit: 'cm', min: 28, max: 48, step: 0.5, placeholder: 33, essential: true },
  { key: 'neckLength', group: 'cabeza', unit: 'cm', min: 4, max: 12, step: 0.2, placeholder: 7 },
  { key: 'shoulderLen', group: 'torso', unit: 'cm', min: 32, max: 52, step: 0.5, placeholder: 38, essential: true },
  { key: 'armpitCircum', group: 'torso', unit: 'cm', min: 75, max: 125, step: 0.5, placeholder: 88 },
  { key: 'bustCircum', group: 'torso', unit: 'cm', min: 70, max: 130, step: 1, placeholder: 90, essential: true },
  { key: 'waistCircum', group: 'torso', unit: 'cm', min: 50, max: 120, step: 1, placeholder: 68, essential: true },
  { key: 'hipCircum', group: 'torso', unit: 'cm', min: 70, max: 130, step: 1, placeholder: 95, essential: true },
  { key: 'thighCircum', group: 'pierna', unit: 'cm', min: 38, max: 74, step: 0.5, placeholder: 54, essential: true },
  { key: 'kneeCircum', group: 'pierna', unit: 'cm', min: 28, max: 48, step: 0.5, placeholder: 36 },
  { key: 'shankCircum', group: 'pierna', unit: 'cm', min: 26, max: 48, step: 0.5, placeholder: 34 },
  { key: 'ankleCircum', group: 'pierna', unit: 'cm', min: 16, max: 28, step: 0.5, placeholder: 22 },
  { key: 'footLength', group: 'pierna', unit: 'cm', min: 20, max: 32, step: 0.5, placeholder: 24 },
  { key: 'kneeToAnkle', group: 'pierna', unit: 'cm', min: 30, max: 55, step: 1, placeholder: 38 },
  { key: 'legLength', group: 'pierna', unit: 'cm', min: 55, max: 95, step: 1, placeholder: 72, essential: true },
  { key: 'upperArm', group: 'brazo', unit: 'cm', min: 20, max: 45, step: 0.5, placeholder: 28 },
  { key: 'elbowCircum', group: 'brazo', unit: 'cm', min: 18, max: 38, step: 0.5, placeholder: 24 },
  { key: 'forearmCircum', group: 'brazo', unit: 'cm', min: 16, max: 36, step: 0.5, placeholder: 22 },
  { key: 'wristCircum', group: 'brazo', unit: 'cm', min: 11, max: 24, step: 0.5, placeholder: 16 },
  { key: 'armLength', group: 'brazo', unit: 'cm', min: 45, max: 75, step: 1, placeholder: 56, essential: true },
  { key: 'handLength', group: 'brazo', unit: 'cm', min: 14, max: 25, step: 0.5, placeholder: 18 },
  { key: 'ubend', group: 'torso', unit: 'cm', min: 110, max: 200, step: 1, placeholder: 150, essential: true },
  { key: 'neckToWaist', group: 'torso', unit: 'cm', min: 30, max: 60, step: 0.5, placeholder: 42 },
  { key: 'waistToAnkle', group: 'pierna', unit: 'cm', min: 80, max: 125, step: 1, placeholder: 98 },
];

/** All 28 latexpattern keys including numeric gender. */
export const LATEXPATTERN_ALL_KEYS = [
  'gender',
  ...LATEXPATTERN_FIELDS.map((f) => f.key),
] as const;

export const LATEX_GROUPS: LatexGroup[] = ['general', 'cabeza', 'torso', 'brazo', 'pierna'];

export interface LatexMeasurementProfile {
  version: typeof LATEX_MEASUREMENT_VERSION;
  silhouette: LatexSilhouette;
  garment: 'catsuit';
  thicknessMm: number;
  tension: LatexTension;
  seamAllowanceMm: number;
  values: Record<string, number | null>;
  notes?: string;
  updatedAtIso?: string;
}

export const EMPTY_LATEX_PROFILE: LatexMeasurementProfile = {
  version: LATEX_MEASUREMENT_VERSION,
  silhouette: 'female',
  garment: 'catsuit',
  thicknessMm: 0.4,
  tension: 'tight',
  seamAllowanceMm: 8,
  values: Object.fromEntries(LATEXPATTERN_FIELDS.map((f) => [f.key, null])),
};

const TENSION_TO_PATTERN: Record<LatexTension, string> = {
  comfort: 'comfort',
  tight: 'tight',
  second_skin: 'second_skin',
};

function isProfile(value: unknown): value is LatexMeasurementProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as LatexMeasurementProfile;
  return v.version === 1 && v.values != null && typeof v.values === 'object';
}

export async function loadLatexMeasurements(): Promise<LatexMeasurementProfile> {
  const raw = await readJsonStorage<LatexMeasurementProfile | unknown[]>(
    LATEX_MEASUREMENT_KEY,
    EMPTY_LATEX_PROFILE
  );
  if (!isProfile(raw)) return { ...EMPTY_LATEX_PROFILE, values: { ...EMPTY_LATEX_PROFILE.values } };
  return {
    ...EMPTY_LATEX_PROFILE,
    ...raw,
    garment: 'catsuit',
    values: { ...EMPTY_LATEX_PROFILE.values, ...raw.values },
  };
}

export async function saveLatexMeasurements(
  profile: LatexMeasurementProfile
): Promise<LatexMeasurementProfile> {
  const next: LatexMeasurementProfile = {
    ...profile,
    version: LATEX_MEASUREMENT_VERSION,
    garment: 'catsuit',
    updatedAtIso: new Date().toISOString(),
  };
  await writeJsonStorage(LATEX_MEASUREMENT_KEY, next);
  return next;
}

export function filledCount(profile: LatexMeasurementProfile): number {
  return LATEXPATTERN_FIELDS.filter((f) => profile.values[f.key] != null).length;
}

export function essentialMissing(profile: LatexMeasurementProfile): string[] {
  return LATEXPATTERN_FIELDS.filter((f) => f.essential && profile.values[f.key] == null).map((f) => f.key);
}

/** latexpattern state.gender is "female" | "male"; measurements.gender is 1 | 2. */
export function toLatexpatternPayload(profile: LatexMeasurementProfile): Record<string, unknown> {
  const genderNum = profile.silhouette === 'male' ? 2 : 1;
  const measurements: Record<string, number> = { gender: genderNum };
  for (const field of LATEXPATTERN_FIELDS) {
    const v = profile.values[field.key];
    if (v != null && Number.isFinite(v)) measurements[field.key] = v;
  }
  return {
    schema: LATEXPATTERN_SCHEMA,
    source: 'CompatKink',
    garment: 'catsuit',
    gender: profile.silhouette,
    sizePreset: 'manual',
    thickness: profile.thicknessMm,
    tension: TENSION_TO_PATTERN[profile.tension],
    seamAllowance: profile.seamAllowanceMm,
    currentClient: 'CompatKink vault export',
    measurements,
    notes: profile.notes ?? '',
    updatedAtIso: profile.updatedAtIso ?? null,
  };
}

const FIELD_LABELS: Record<string, string> = {
  weight: 'Weight / Peso',
  height: 'Height / Estatura',
  headCircum: 'Head around / Contorno cabeza',
  headLength: 'Head length / Altura cabeza',
  neckCircum: 'Neck around / Contorno cuello',
  neckLength: 'Neck length / Largo cuello',
  shoulderLen: 'Shoulder length / Ancho hombros',
  armpitCircum: 'Armpit around / Axila–pecho superior',
  bustCircum: 'Bust/chest / Busto–pecho',
  waistCircum: 'Waist around / Cintura',
  hipCircum: 'Hip around / Cadera',
  thighCircum: 'Thigh around / Muslo',
  kneeCircum: 'Knee around / Rodilla',
  shankCircum: 'Shank around / Pantorrilla',
  ankleCircum: 'Ankle around / Tobillo',
  footLength: 'Foot length / Largo pie',
  kneeToAnkle: 'Knee to ankle / Rodilla–tobillo',
  legLength: 'Inseam / Largo pierna interno',
  upperArm: 'Upper arm / Bíceps',
  elbowCircum: 'Elbow around / Codo',
  forearmCircum: 'Forearm / Antebrazo',
  wristCircum: 'Wrist around / Muñeca',
  armLength: 'Arm length / Largo brazo',
  handLength: 'Hand length / Largo mano',
  ubend: 'U-bend / Tiro completo',
  neckToWaist: 'Neck to waist front / Talle cuello–cintura',
  waistToAnkle: 'Waist to ankle / Cintura–tobillo',
};

export function formatLatexMeasurementMarkdown(profile: LatexMeasurementProfile): string {
  const payload = toLatexpatternPayload(profile);
  const measurements = payload.measurements as Record<string, number>;
  const lines: string[] = [
    '# CompatKink — latex catsuit ficha for a tailor',
    '',
    MEASUREMENT_EXPORT_DISCLAIMER,
    '',
    'Field names match latexpattern MEASUREMENTS_DEF (28-point schema).',
    'JSON export can be imported there (`measurements` object).',
    '',
    `- Silhouette / pattern gender: ${profile.silhouette} (measurements.gender = ${measurements.gender})`,
    `- Garment: ${profile.garment}`,
    `- Latex thickness: ${profile.thicknessMm} mm`,
    `- Tension: ${profile.tension}`,
    `- Seam allowance: ${profile.seamAllowanceMm} mm`,
    `- Updated: ${profile.updatedAtIso ?? '—'}`,
    '',
    '## Measurements (cm unless noted)',
  ];

  for (const field of LATEXPATTERN_FIELDS) {
    const v = profile.values[field.key];
    const label = FIELD_LABELS[field.key] ?? field.key;
    const shown = v == null ? '—' : `${v} ${field.unit}`;
    lines.push(`- \`${field.key}\` — ${label}: ${shown}`);
  }

  if (profile.notes?.trim()) {
    lines.push('', '## Notes', profile.notes.trim());
  }

  lines.push('');
  return lines.join('\n');
}

export function formatLatexMeasurementJson(profile: LatexMeasurementProfile): string {
  return JSON.stringify(toLatexpatternPayload(profile), null, 2);
}
