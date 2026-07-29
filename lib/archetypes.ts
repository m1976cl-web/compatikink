export interface ArchetypeResult {
  dominant: number;
  submissive: number;
  rigger: number;
  ropeBunny: number;
  sadist: number;
  masochist: number;
  primal: number;
  sensorySpecialist: number;
}

export interface ArchetypeQuestion {
  id: number;
  question: string;
  options: { label: string; scores: Partial<ArchetypeResult> }[];
}

export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = [
  {
    id: 1,
    question: 'En una sesión erótica, tu rol preferido de forma natural es:',
    options: [
      { label: 'Dirigir, cuidar y establecer el ritmo de la experiencia', scores: { dominant: 30, sensorySpecialist: 10 } },
      { label: 'Entregar el control, confiar y dejarse llevar', scores: { submissive: 30, ropeBunny: 10 } },
      { label: 'Depende de la química; me adapto a ambos roles (Switch)', scores: { dominant: 15, submissive: 15 } },
    ],
  },
  {
    id: 2,
    question: 'Tu relación con el Shibari y las cuerdas es:',
    options: [
      { label: 'Me apasiona diseñar arneses, nudos y mantener la tensión justa', scores: { rigger: 35 } },
      { label: 'Me encanta la sensación de restricción, peso y abrazo de las cuerdas', scores: { ropeBunny: 35 } },
      { label: 'Disfruto el aspecto estético, pero prefiero otras sensaciones', scores: { sensorySpecialist: 15 } },
    ],
  },
  {
    id: 3,
    question: 'Respecto al impacto y dolor controlado (Spanking, fustetes, cera):',
    options: [
      { label: 'Disfruto provocar sensaciones intensas de dolor consensual', scores: { sadist: 35 } },
      { label: 'El dolor controlado me genera endorfinas y me lleva al subspace', scores: { masochist: 35 } },
      { label: 'Prefiero caricias suaves, temperatura y vendas (Sensorial)', scores: { sensorySpecialist: 30 } },
    ],
  },
];

export function calculateArchetypes(answers: number[]): ArchetypeResult {
  const totals: ArchetypeResult = {
    dominant: 0,
    submissive: 0,
    rigger: 0,
    ropeBunny: 0,
    sadist: 0,
    masochist: 0,
    primal: 0,
    sensorySpecialist: 0,
  };

  answers.forEach((optIdx, qIdx) => {
    const question = ARCHETYPE_QUESTIONS[qIdx];
    if (question && question.options[optIdx]) {
      const scores = question.options[optIdx].scores;
      Object.entries(scores).forEach(([k, v]) => {
        const key = k as keyof ArchetypeResult;
        totals[key] += v || 0;
      });
    }
  });

  return totals;
}
