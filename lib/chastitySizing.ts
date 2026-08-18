/**
 * Local chastity fit helpers — original CompatKink measurement bands.
 * Inspired by public sizing practice (flaccid length, shaft girth, base ring, waist/hip)
 * but not a Typeform/Oxy-Shop clone: no product SKUs, no checkout, no shop API.
 *
 * Geometry: inner diameter ≈ circumference / π; a little clearance on the tube;
 * cage length a bit shorter than flaccid so it does not push. Rings snapped to
 * common millimetre steps. Results are bands (S/M/L or mm), not a cart.
 *
 * Vault: fetish_lab_chastity_sizing_v1 → ck1: when unlocked.
 */

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { MEASUREMENT_EXPORT_DISCLAIMER } from '@/lib/measurementDisclaimer';

export const CHASTITY_SIZING_KEY = 'fetish_lab_chastity_sizing_v1';
export const CHASTITY_SIZING_VERSION = 1 as const;

export type MeasureUnit = 'mm' | 'inch';
export type SizeBand = 'S' | 'M' | 'L' | 'XL' | 'custom';
export type DeviceFamily = 'cage' | 'belt' | 'agreement';
export type EnclosureStyle = 'open' | 'closed' | 'extra_short';
export type MaterialFeel = 'rigid' | 'flexible';
export type DiscretionLevel = 'high' | 'medium';

export const COMMON_RING_MM = [38, 40, 42, 45, 48, 50, 52, 55, 58, 60] as const;

export interface ChastitySizingProfile {
  version: typeof CHASTITY_SIZING_VERSION;
  unit: MeasureUnit;
  cage: {
    shaftCircumference: number | null;
    flaccidLength: number | null;
    ringCircumference: number | null;
  };
  belt: {
    waistCircumference: number | null;
    hipCircumference: number | null;
    frontDrop: number | null;
    thighCircumference: number | null;
  };
  style: {
    device: DeviceFamily;
    enclosure: EnclosureStyle;
    material: MaterialFeel;
    discretion: DiscretionLevel;
  };
  updatedAtIso?: string;
}

export interface CageFitResult {
  ok: boolean;
  reason?: string;
  cageLengthMm: number;
  tubeInnerMm: number;
  ringInnerMm: number;
  ringSnappedMm: number;
  lengthBand: SizeBand;
  tubeBand: SizeBand;
  ringBand: SizeBand;
  overallBand: SizeBand;
  oversize: boolean;
  notes: string[];
}

export interface BeltFitResult {
  ok: boolean;
  reason?: string;
  waistMm: number;
  hipMm: number;
  frontDropMm: number;
  thighMm: number | null;
  waistBand: SizeBand;
  notes: string[];
}

export interface StyleFitResult {
  device: DeviceFamily;
  enclosure: EnclosureStyle;
  material: MaterialFeel;
  discretion: DiscretionLevel;
  summary: string;
  cage?: CageFitResult;
  belt?: BeltFitResult;
}

export const EMPTY_CHASTITY_SIZING: ChastitySizingProfile = {
  version: CHASTITY_SIZING_VERSION,
  unit: 'mm',
  cage: { shaftCircumference: null, flaccidLength: null, ringCircumference: null },
  belt: {
    waistCircumference: null,
    hipCircumference: null,
    frontDrop: null,
    thighCircumference: null,
  },
  style: { device: 'cage', enclosure: 'open', material: 'rigid', discretion: 'high' },
};

const PI = Math.PI;
/** Tube inner diameter gets a few millimetres of clearance beyond girth. */
const TUBE_CLEARANCE_MM = 3;
/** Cage interior is slightly shorter than flaccid length so it does not push. */
const LENGTH_REDUCTION_MM = 6;

export function toMillimetres(value: number, unit: MeasureUnit): number {
  if (!Number.isFinite(value)) return 0;
  return unit === 'inch' ? value * 25.4 : value;
}

export function fromMillimetres(mm: number, unit: MeasureUnit): number {
  if (!Number.isFinite(mm)) return 0;
  return unit === 'inch' ? mm / 25.4 : mm;
}

export function roundMm(value: number): number {
  return Math.round(value);
}

export function snapToCommonRing(diameterMm: number): number {
  if (!Number.isFinite(diameterMm) || diameterMm <= 0) return COMMON_RING_MM[0];
  let best: number = COMMON_RING_MM[0];
  for (const step of COMMON_RING_MM) {
    if (Math.abs(step - diameterMm) < Math.abs(best - diameterMm)) best = step;
  }
  return best;
}

export function circumferenceToInnerDiameterMm(circumferenceMm: number): number {
  if (!Number.isFinite(circumferenceMm) || circumferenceMm <= 0) return 0;
  return circumferenceMm / PI;
}

export function lengthBandFromMm(lengthMm: number): SizeBand {
  if (lengthMm <= 0) return 'custom';
  if (lengthMm <= 45) return 'S';
  if (lengthMm <= 75) return 'M';
  if (lengthMm <= 105) return 'L';
  return 'custom';
}

export function tubeBandFromMm(innerMm: number): SizeBand {
  if (innerMm <= 0) return 'custom';
  if (innerMm <= 32) return 'S';
  if (innerMm <= 38) return 'M';
  if (innerMm <= 45) return 'L';
  return 'custom';
}

export function ringBandFromMm(innerMm: number): SizeBand {
  if (innerMm <= 0) return 'custom';
  if (innerMm <= 42) return 'S';
  if (innerMm <= 50) return 'M';
  if (innerMm <= 58) return 'L';
  return 'custom';
}

/** Waist bands in centimetres (belt plates are usually ordered by waist). */
export function waistBandFromMm(waistMm: number): SizeBand {
  const cm = waistMm / 10;
  if (cm <= 0) return 'custom';
  if (cm < 70) return 'S';
  if (cm < 82) return 'M';
  if (cm < 96) return 'L';
  if (cm < 112) return 'XL';
  return 'custom';
}

function pickOverall(length: SizeBand, ring: SizeBand, tube: SizeBand): SizeBand {
  if (length === 'custom' || ring === 'custom' || tube === 'custom') return 'custom';
  const rank: Record<SizeBand, number> = { S: 1, M: 2, L: 3, XL: 4, custom: 5 };
  const max = Math.max(rank[length], rank[ring], rank[tube]);
  return (Object.keys(rank) as SizeBand[]).find((k) => rank[k] === max) ?? 'M';
}

export function computeCageFit(
  profile: Pick<ChastitySizingProfile, 'unit' | 'cage'>
): CageFitResult {
  const { unit, cage } = profile;
  const shaft = cage.shaftCircumference;
  const length = cage.flaccidLength;
  const ring = cage.ringCircumference;
  if (shaft == null || length == null || ring == null) {
    return {
      ok: false,
      reason: 'need_values',
      cageLengthMm: 0,
      tubeInnerMm: 0,
      ringInnerMm: 0,
      ringSnappedMm: 0,
      lengthBand: 'custom',
      tubeBand: 'custom',
      ringBand: 'custom',
      overallBand: 'custom',
      oversize: false,
      notes: [],
    };
  }

  const shaftMm = toMillimetres(shaft, unit);
  const lengthMm = toMillimetres(length, unit);
  const ringMm = toMillimetres(ring, unit);

  const tubeInnerMm = roundMm(circumferenceToInnerDiameterMm(shaftMm) + TUBE_CLEARANCE_MM);
  const cageLengthMm = Math.max(0, roundMm(lengthMm - LENGTH_REDUCTION_MM));
  const ringInnerMm = roundMm(circumferenceToInnerDiameterMm(ringMm));
  const ringSnappedMm = snapToCommonRing(ringInnerMm);

  const notes: string[] = [];
  const oversize = shaftMm > 125 || lengthMm > 106 || ringMm > 188;
  if (shaftMm > 125) notes.push('shaft_oversize');
  if (lengthMm > 106) notes.push('length_oversize');
  if (ringMm > 188) notes.push('ring_oversize');
  if (cageLengthMm < 20) notes.push('very_short');

  const lengthBand = lengthBandFromMm(cageLengthMm);
  const tubeBand = tubeBandFromMm(tubeInnerMm);
  const ringBand = ringBandFromMm(ringSnappedMm);

  return {
    ok: true,
    cageLengthMm,
    tubeInnerMm,
    ringInnerMm,
    ringSnappedMm,
    lengthBand,
    tubeBand,
    ringBand,
    overallBand: oversize ? 'custom' : pickOverall(lengthBand, ringBand, tubeBand),
    oversize,
    notes,
  };
}

export function computeBeltFit(
  profile: Pick<ChastitySizingProfile, 'unit' | 'belt'>
): BeltFitResult {
  const { unit, belt } = profile;
  const waist = belt.waistCircumference;
  const hip = belt.hipCircumference;
  const drop = belt.frontDrop;
  if (waist == null || hip == null || drop == null) {
    return {
      ok: false,
      reason: 'need_values',
      waistMm: 0,
      hipMm: 0,
      frontDropMm: 0,
      thighMm: null,
      waistBand: 'custom',
      notes: [],
    };
  }

  const waistMm = roundMm(toMillimetres(waist, unit));
  const hipMm = roundMm(toMillimetres(hip, unit));
  const frontDropMm = roundMm(toMillimetres(drop, unit));
  const thighMm =
    belt.thighCircumference == null ? null : roundMm(toMillimetres(belt.thighCircumference, unit));

  const notes: string[] = [];
  if (hipMm + 10 < waistMm) notes.push('hip_smaller_than_waist');
  if (frontDropMm < 80) notes.push('short_drop');
  if (waistMm > 1120) notes.push('waist_oversize');

  return {
    ok: true,
    waistMm,
    hipMm,
    frontDropMm,
    thighMm,
    waistBand: waistBandFromMm(waistMm),
    notes,
  };
}

export function computeStyleFit(profile: ChastitySizingProfile): StyleFitResult {
  const cage = computeCageFit(profile);
  const belt = computeBeltFit(profile);
  const { device, enclosure, material, discretion } = profile.style;

  const parts: string[] = [`device:${device}`, `enclosure:${enclosure}`, `material:${material}`, `discretion:${discretion}`];
  if (device === 'cage' && cage.ok) parts.push(`cage:${cage.overallBand}`, `ring:${cage.ringSnappedMm}mm`);
  if (device === 'belt' && belt.ok) parts.push(`belt:${belt.waistBand}`);
  if (device === 'agreement') parts.push('no_hardware');
  if (enclosure === 'extra_short' && discretion === 'high') parts.push('daily_short');
  if (material === 'flexible' && discretion === 'high') parts.push('soft_daily');

  return {
    device,
    enclosure,
    material,
    discretion,
    summary: parts.join(' · '),
    cage: cage.ok ? cage : undefined,
    belt: belt.ok ? belt : undefined,
  };
}

function isProfile(value: unknown): value is ChastitySizingProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as ChastitySizingProfile;
  return v.version === 1 && v.cage != null && v.belt != null && v.style != null;
}

export async function loadChastitySizing(): Promise<ChastitySizingProfile> {
  const raw = await readJsonStorage<ChastitySizingProfile | unknown[]>(
    CHASTITY_SIZING_KEY,
    EMPTY_CHASTITY_SIZING
  );
  if (!isProfile(raw)) return { ...EMPTY_CHASTITY_SIZING };
  return {
    ...EMPTY_CHASTITY_SIZING,
    ...raw,
    cage: { ...EMPTY_CHASTITY_SIZING.cage, ...raw.cage },
    belt: { ...EMPTY_CHASTITY_SIZING.belt, ...raw.belt },
    style: { ...EMPTY_CHASTITY_SIZING.style, ...raw.style },
  };
}

export async function saveChastitySizing(profile: ChastitySizingProfile): Promise<ChastitySizingProfile> {
  const next: ChastitySizingProfile = {
    ...profile,
    version: CHASTITY_SIZING_VERSION,
    updatedAtIso: new Date().toISOString(),
  };
  await writeJsonStorage(CHASTITY_SIZING_KEY, next);
  return next;
}

export function formatChastitySizingMarkdown(profile: ChastitySizingProfile): string {
  const cage = computeCageFit(profile);
  const belt = computeBeltFit(profile);
  const style = computeStyleFit(profile);
  const unit = profile.unit;
  const lines: string[] = [
    '# CompatKink — local chastity fit notes',
    '',
    MEASUREMENT_EXPORT_DISCLAIMER,
    '',
    `Unit entered: ${unit}`,
    `Updated: ${profile.updatedAtIso ?? '—'}`,
    '',
    '## Cage (local band, not a SKU)',
  ];

  if (cage.ok) {
    lines.push(
      `- Suggested cage length: ${cage.cageLengthMm} mm (band ${cage.lengthBand})`,
      `- Suggested tube inner Ø: ${cage.tubeInnerMm} mm (band ${cage.tubeBand})`,
      `- Suggested base ring inner Ø: ${cage.ringSnappedMm} mm (measured ${cage.ringInnerMm} mm, band ${cage.ringBand})`,
      `- Overall band: ${cage.overallBand}${cage.oversize ? ' (outside common stock — custom maker)' : ''}`
    );
  } else {
    lines.push('- Cage measurements incomplete.');
  }

  lines.push('', '## Belt (local band, not a SKU)');
  if (belt.ok) {
    lines.push(
      `- Waist: ${belt.waistMm} mm (band ${belt.waistBand})`,
      `- Hip: ${belt.hipMm} mm`,
      `- Front drop (waist to genital base): ${belt.frontDropMm} mm`
    );
    if (belt.thighMm != null) lines.push(`- Thigh: ${belt.thighMm} mm`);
  } else {
    lines.push('- Belt measurements incomplete.');
  }

  lines.push(
    '',
    '## Style + size band',
    `- Device family: ${style.device}`,
    `- Enclosure: ${style.enclosure}`,
    `- Material feel: ${style.material}`,
    `- Discretion: ${style.discretion}`,
    `- Summary: ${style.summary}`,
    '',
    'Inputs (as entered)',
    `- Shaft girth: ${profile.cage.shaftCircumference ?? '—'} ${unit}`,
    `- Flaccid length: ${profile.cage.flaccidLength ?? '—'} ${unit}`,
    `- Ring path (behind the scrotum): ${profile.cage.ringCircumference ?? '—'} ${unit}`,
    `- Waist: ${profile.belt.waistCircumference ?? '—'} ${unit}`,
    `- Hip: ${profile.belt.hipCircumference ?? '—'} ${unit}`,
    `- Front drop: ${profile.belt.frontDrop ?? '—'} ${unit}`,
    `- Thigh: ${profile.belt.thighCircumference ?? '—'} ${unit}`,
    ''
  );

  return lines.join('\n');
}
