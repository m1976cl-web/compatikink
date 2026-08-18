import assert from 'node:assert/strict';
import { isSensitiveStorageKey } from '../lib/cryptoVault';
import {
  CHASTITY_SIZING_KEY,
  COMMON_RING_MM,
  EMPTY_CHASTITY_SIZING,
  circumferenceToInnerDiameterMm,
  computeBeltFit,
  computeCageFit,
  computeStyleFit,
  formatChastitySizingMarkdown,
  lengthBandFromMm,
  snapToCommonRing,
  toMillimetres,
  tubeBandFromMm,
  waistBandFromMm,
  type ChastitySizingProfile,
} from '../lib/chastitySizing';
import {
  EMPTY_LATEX_PROFILE,
  LATEXPATTERN_ALL_KEYS,
  LATEXPATTERN_FIELDS,
  LATEXPATTERN_SCHEMA,
  LATEX_MEASUREMENT_KEY,
  essentialMissing,
  formatLatexMeasurementJson,
  formatLatexMeasurementMarkdown,
  toLatexpatternPayload,
  type LatexMeasurementProfile,
} from '../lib/latexMeasurements';
import { MEASUREMENT_EXPORT_DISCLAIMER } from '../lib/measurementDisclaimer';

function run() {
  console.log('Measurement calc / export helpers…\n');

  assert.equal(isSensitiveStorageKey(CHASTITY_SIZING_KEY), true);
  assert.equal(isSensitiveStorageKey(LATEX_MEASUREMENT_KEY), true);
  assert.ok(CHASTITY_SIZING_KEY.startsWith('fetish_lab_'));
  assert.ok(LATEX_MEASUREMENT_KEY.startsWith('fetish_lab_'));

  assert.equal(toMillimetres(1, 'inch'), 25.4);
  assert.equal(toMillimetres(100, 'mm'), 100);
  assert.equal(snapToCommonRing(47.7), 48);
  assert.ok(COMMON_RING_MM.includes(48));
  assert.equal(lengthBandFromMm(40), 'S');
  assert.equal(lengthBandFromMm(60), 'M');
  assert.equal(lengthBandFromMm(90), 'L');
  assert.equal(lengthBandFromMm(120), 'custom');
  assert.equal(tubeBandFromMm(30), 'S');
  assert.equal(waistBandFromMm(850), 'L');
  assert.equal(waistBandFromMm(750), 'M');

  const incomplete = computeCageFit(EMPTY_CHASTITY_SIZING);
  assert.equal(incomplete.ok, false);
  assert.equal(incomplete.reason, 'need_values');

  const cageProfile: ChastitySizingProfile = {
    ...EMPTY_CHASTITY_SIZING,
    unit: 'mm',
    cage: { shaftCircumference: 100, flaccidLength: 80, ringCircumference: 150 },
  };
  const cage = computeCageFit(cageProfile);
  assert.equal(cage.ok, true);
  assert.equal(cage.cageLengthMm, 74);
  const expectedTube = Math.round(circumferenceToInnerDiameterMm(100) + 3);
  assert.equal(cage.tubeInnerMm, expectedTube);
  const expectedRing = Math.round(circumferenceToInnerDiameterMm(150));
  assert.equal(cage.ringInnerMm, expectedRing);
  assert.equal(cage.ringSnappedMm, snapToCommonRing(expectedRing));
  assert.equal(cage.lengthBand, 'M');
  assert.equal(cage.oversize, false);

  const inchProfile: ChastitySizingProfile = {
    ...EMPTY_CHASTITY_SIZING,
    unit: 'inch',
    cage: { shaftCircumference: 4, flaccidLength: 3.2, ringCircumference: 6 },
  };
  const inchCage = computeCageFit(inchProfile);
  assert.equal(inchCage.ok, true);
  assert.ok(inchCage.cageLengthMm > 50 && inchCage.cageLengthMm < 90);

  const oversize = computeCageFit({
    ...EMPTY_CHASTITY_SIZING,
    cage: { shaftCircumference: 140, flaccidLength: 120, ringCircumference: 200 },
  });
  assert.equal(oversize.oversize, true);
  assert.equal(oversize.overallBand, 'custom');
  assert.ok(oversize.notes.includes('shaft_oversize'));

  const belt = computeBeltFit({
    unit: 'mm',
    belt: { waistCircumference: 820, hipCircumference: 980, frontDrop: 220, thighCircumference: 560 },
  });
  assert.equal(belt.ok, true);
  assert.equal(belt.waistBand, 'L');
  assert.equal(belt.waistMm, 820);

  const style = computeStyleFit({
    ...cageProfile,
    style: { device: 'cage', enclosure: 'extra_short', material: 'flexible', discretion: 'high' },
  });
  assert.ok(style.summary.includes('device:cage'));
  assert.ok(style.summary.includes('daily_short'));
  assert.ok(style.summary.includes('soft_daily'));
  assert.ok(style.cage?.ok);

  const md = formatChastitySizingMarkdown({
    ...cageProfile,
    belt: { waistCircumference: 820, hipCircumference: 980, frontDrop: 220, thighCircumference: null },
    updatedAtIso: '2026-08-18T00:00:00.000Z',
  });
  assert.ok(md.includes(MEASUREMENT_EXPORT_DISCLAIMER.split('\n')[0]));
  assert.ok(md.toLowerCase().includes('not a shop') || md.includes('no es una tienda'));
  assert.ok(!md.toLowerCase().includes('oxy-shop'));
  assert.ok(!md.toLowerCase().includes('typeform'));
  assert.ok(!md.includes('http'));
  assert.ok(md.includes('74 mm'));
  assert.ok(md.includes(`${cage.ringSnappedMm} mm`));

  assert.equal(LATEXPATTERN_ALL_KEYS.length, 28);
  assert.equal(LATEXPATTERN_ALL_KEYS[0], 'gender');
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('neckCircum'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('bustCircum'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('waistCircum'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('hipCircum'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('legLength'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('armLength'));
  assert.ok(LATEXPATTERN_ALL_KEYS.includes('ubend'));
  assert.equal(LATEXPATTERN_FIELDS.length, 27);

  const latex: LatexMeasurementProfile = {
    ...EMPTY_LATEX_PROFILE,
    silhouette: 'male',
    values: {
      ...EMPTY_LATEX_PROFILE.values,
      height: 178,
      neckCircum: 38,
      bustCircum: 98,
      waistCircum: 82,
      hipCircum: 96,
      legLength: 80,
      armLength: 60,
    },
    notes: 'Catsuit commission',
    updatedAtIso: '2026-08-18T00:00:00.000Z',
  };
  const missing = essentialMissing(latex);
  assert.ok(missing.includes('shoulderLen'));
  assert.ok(!missing.includes('neckCircum'));

  const payload = toLatexpatternPayload(latex);
  assert.equal(payload.schema, LATEXPATTERN_SCHEMA);
  assert.equal(payload.garment, 'catsuit');
  assert.equal(payload.gender, 'male');
  const measurements = payload.measurements as Record<string, number>;
  assert.equal(measurements.gender, 2);
  assert.equal(measurements.neckCircum, 38);
  assert.equal(measurements.height, 178);
  assert.equal(measurements.legLength, 80);
  assert.equal('thighCircum' in measurements, false, 'omit empty latexpattern keys');

  const latexMd = formatLatexMeasurementMarkdown(latex);
  assert.ok(latexMd.includes('`neckCircum`'));
  assert.ok(latexMd.includes('latexpattern'));
  assert.ok(latexMd.includes(MEASUREMENT_EXPORT_DISCLAIMER.split('\n')[0]));
  assert.ok(!latexMd.toLowerCase().includes('oxy'));

  const json = formatLatexMeasurementJson(latex);
  const parsed = JSON.parse(json) as { measurements: Record<string, number>; schema: string };
  assert.equal(parsed.schema, LATEXPATTERN_SCHEMA);
  assert.equal(parsed.measurements.waistCircum, 82);

  console.log('  ✅ cage/belt bands, style rec, latexpattern export, vault key prefixes\n');
}

run();
