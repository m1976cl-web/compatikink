import { CompatibilityReport, CATEGORY_LABELS } from '@/types';
import { askGeminiAssistant } from '@/lib/geminiAssistant';

export interface AINextStep {
  id: string;
  stepNumber: number;
  title: string;
  category: string;
  estimatedMinutes: number;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  description: string;
  safetyAdvice: string;
}

export interface AIReportAnalysis {
  summary: string;
  strengths: string[];
  explorationZones: string[];
  conversationTip: string;
  suggestedSteps: AINextStep[];
}

/**
 * AI1: Generates an empathetic, natural language summary of the report
 * without sending any raw individual answers or PII (Zero-Knowledge safe).
 */
export async function generateReportAISummary(
  report: CompatibilityReport,
  guestName?: string
): Promise<AIReportAnalysis> {
  const partnerLabel = guestName || 'tu pareja';
  const score = report.compatibilityScore || 0;
  const categories = report.categoryCompatibilities || {};

  // Extract top matching categories (score >= 65)
  const topCategories = Object.entries(categories)
    .filter(([_, val]) => val >= 65)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat} (${val}%)`);

  // Extract growth/caution categories (score < 50)
  const cautionCategories = Object.entries(categories)
    .filter(([_, val]) => val < 50)
    .sort((a, b) => a[1] - b[1])
    .map(([cat, val]) => `${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat} (${val}%)`);

  const localFallback = generateLocalReportAnalysis(report, partnerLabel);

  try {
    const prompt = `
Genera un análisis íntimo, empático y sex-positive de compatibilidad para una pareja en CompatKink.
Datos anonimizados agregados:
- Puntaje General: ${score}%
- Categorías con mayor afinidad: ${topCategories.join(', ') || 'Exploración equilibrada'}
- Categorías que requieren diálogo y límites claros: ${cautionCategories.join(', ') || 'Sin discrepancias mayores'}
- Compatibilidad de Roles: ${report.initiatorProfile?.role && report.guestProfile?.role ? `${report.initiatorProfile.role} + ${report.guestProfile.role}` : 'Equilibrada'}

Escribe en tono cercano, respetuoso, libre de tabúes y enfocado en consentimiento (SSC/RACK) y comunicación.
Formato de respuesta:
1 párrafo descriptivo (100 palabras) sobre la dinámica de la pareja y cómo abordar sus deseos compartidos.
`.trim();

    const aiText = await askGeminiAssistant(prompt);
    if (aiText && !aiText.includes('⚠️')) {
      return {
        ...localFallback,
        summary: aiText.trim(),
      };
    }
  } catch (e) {
    // Fallback to local heuristic
  }

  return localFallback;
}

/**
 * Local deterministic heuristic analysis (works 100% offline with zero latency).
 */
export function generateLocalReportAnalysis(
  report: CompatibilityReport,
  partnerLabel: string
): AIReportAnalysis {
  const score = report.compatibilityScore || 0;
  const categories = report.categoryCompatibilities || {};

  const entries = Object.entries(categories);
  const topCategories = entries
    .filter(([_, val]) => val >= 60)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat);

  const explorationZones = entries
    .filter(([_, val]) => val < 50)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([cat]) => CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat);

  let summary = '';
  if (score >= 80) {
    summary = `¡Tienen una sincronía excepcional (${score}%)! Existe una base de complicidad muy sólida, especialmente en ${topCategories.join(' y ')}. Sus deseos coinciden en las áreas centrales, lo que les permite explorar con fluidez siempre que mantengan un protocolo de safewords claro.`;
  } else if (score >= 55) {
    summary = `Tienen una compatibilidad prometedora (${score}%) con gran potencial. Comparten afinidades clave en ${topCategories.join(' y ')}, mientras que en áreas como ${explorationZones.join(' o ') || 'roles específicos'} convendría negociar límites y avanzar de manera gradual.`;
  } else {
    summary = `Este reporte (${score}%) es una valiosa oportunidad de autodescubrimiento mutuo. Tienen estilos y ritmos diferentes, por lo que el éxito radica en una comunicación pausada, priorizando la seguridad emocional y el Aftercare antes de aumentar la intensidad.`;
  }

  const conversationTip =
    topCategories.length > 0
      ? `Comiencen celebrando sus coincidencias en ${topCategories[0]} antes de abordar las áreas donde sus límites difieren.`
      : 'Utilicen las tarjetas de Abre-hielos para explorar con curiosidad y sin expectativas de rendimiento.';

  const suggestedSteps: AINextStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Conversación de Alineación y Safewords',
      category: 'Comunicación & Consentimiento',
      estimatedMinutes: 15,
      difficulty: 'Principiante',
      description: `Revisen juntos su sistema de safewords (Semáforo Verde/Amarillo/Rojo) y establezcan una señal táctil no verbal.`,
      safetyAdvice: 'El consentimiento es dinámico y puede revocarse o pausarse en cualquier momento.',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: `Exploración Sensorial Gradual en ${topCategories[0] || 'Sensaciones'}`,
      category: topCategories[0] || 'Sensorial',
      estimatedMinutes: 30,
      difficulty: 'Intermedio',
      description: `Diseñen una mini-escena enfocada exclusivamente en los deseos compartidos de ${topCategories[0] || 'masajes y texturas'}, manteniendo la intensidad baja.`,
      safetyAdvice: 'Chequeen la respiración y el confort de la pareja cada 5 a 10 minutos.',
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Protocolo de Cierre & Aftercare Afectivo',
      category: 'Aftercare',
      estimatedMinutes: 20,
      difficulty: 'Principiante',
      description: 'Definan con anticipación qué necesita cada uno al terminar la sesión: mantas calientes, hidratación, silencio o abrazo sostenido.',
      safetyAdvice: 'Previene el Subdrop y Topdrop hidratándose y validando las emociones post-escena.',
    },
  ];

  return {
    summary,
    strengths: topCategories.length > 0 ? topCategories : ['Apertura a comunicar', 'Respeto mutuo'],
    explorationZones: explorationZones.length > 0 ? explorationZones : ['Exploración de fantasías', 'Rituales cotidianos'],
    conversationTip,
    suggestedSteps,
  };
}
