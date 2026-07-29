export interface VibrationPattern {
  id: string;
  name: string;
  bpm: number;
  intensityLevel: 'Baja' | 'Media' | 'Alta' | 'Dinámica';
  pulseGraph: number[]; // Array of intensity values 0-100
}

export const PRESET_PATTERNS: VibrationPattern[] = [
  { id: 'pat-1', name: 'Olas Sensoriales (Soft Chill)', bpm: 60, intensityLevel: 'Baja', pulseGraph: [20, 35, 50, 35, 20, 10, 20, 40, 60, 40] },
  { id: 'pat-2', name: 'Ritmo Solfeggio 528Hz', bpm: 75, intensityLevel: 'Media', pulseGraph: [40, 60, 75, 90, 75, 60, 40, 50, 70, 85] },
  { id: 'pat-3', name: 'Cyberpunk Pulsante Intensivo', bpm: 120, intensityLevel: 'Alta', pulseGraph: [50, 90, 30, 100, 40, 95, 20, 100, 60, 90] },
  { id: 'pat-4', name: 'Respiración Holotrópica (Inhale/Exhale)', bpm: 45, intensityLevel: 'Dinámica', pulseGraph: [10, 30, 60, 90, 100, 80, 50, 20, 5, 0] },
];

export function calculateVibrationIntensity(bpm: number, currentBeat: number): number {
  const sinValue = Math.sin((currentBeat * Math.PI) / 10);
  return Math.round(Math.abs(sinValue) * 100);
}
