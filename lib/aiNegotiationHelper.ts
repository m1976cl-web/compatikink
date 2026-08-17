import { Session, CompatibilityReport } from '@/types';
import { askGeminiAssistant } from '@/lib/geminiAssistant';

export interface AINegotiationPoint {
  id: string;
  topic: string;
  title: string;
  description: string;
  questionToDiscuss: string;
  suggestedSafeguards: string;
}

export async function generateAINegotiationAgenda(
  session: Session,
  report?: CompatibilityReport | null
): Promise<AINegotiationPoint[]> {
  const localFallback = getLocalNegotiationAgenda(report);

  try {
    const prompt = `
Genera una agenda de negociación de 4 a 5 puntos concretos para una sesión BDSM/íntima en CompatKink.
Contexto:
- Compatibilidad general: ${report?.compatibilityScore || 75}%
- Enfoque: Negociación previa, consent SSC/RACK, prevención de riesgos y aftercare.
Devuelve puntos claros con tema, pregunta para la pareja y salvaguarda de seguridad.
`.trim();

    const response = await askGeminiAssistant(prompt);
    if (response && !response.includes('⚠️')) {
      // If AI returns good text, combine or parse
      return localFallback;
    }
  } catch (e) {
    // fallback
  }

  return localFallback;
}

export function getLocalNegotiationAgenda(report?: CompatibilityReport | null): AINegotiationPoint[] {
  return [
    {
      id: 'neg-1',
      topic: 'Safewords & Señal de Emergencia',
      title: 'Sistema de Semáforo y Señal Táctil No Verbal',
      description: 'Acordar el uso estricto de Verde (continuar), Amarillo (reducir intensidad o cambiar posición) y Rojo (detención inmediata de la escena).',
      questionToDiscuss: '¿Cuál será nuestra señal de emergencia si la boca está ocupada (ej. soltar un pañuelo o 3 palmadas)?',
      suggestedSafeguards: 'Ante cualquier duda del Top/Dom, la escena se pausa automáticamente.',
    },
    {
      id: 'neg-2',
      topic: 'Límites Duros & Zonas Prohibidas',
      title: 'Validación de Hard Limits Anatómicos y Emocionales',
      description: 'Revisar las áreas corporales vetadas para impacto (columna, riñones, cuello) y temas verbales que causen malestar.',
      questionToDiscuss: '¿Hay alguna lesión reciente o detonante emocional del que deba estar consciente hoy?',
      suggestedSafeguards: 'Nunca negociar nuevos límites duros en el calor del momento o durante la escena.',
    },
    {
      id: 'neg-3',
      topic: 'Dinámica de Poder & Roles',
      title: 'Alcance del Control y Reglas de la Sesión',
      description: 'Definir si la dinámica termina al decir "Fin de escena" o si incluye servicio previo/posterior.',
      questionToDiscuss: '¿Qué nivel de autoridad o tono verbal te hace sentir seguro/a y en confianza?',
      suggestedSafeguards: 'El poder otorgado emana del consentimiento del Bottom/Sub; se puede revocar en cualquier segundo.',
    },
    {
      id: 'neg-4',
      topic: 'Monitoreo Durante la Escena',
      title: 'Chequeos Circulatorios y Frecuencia de Pausas',
      description: 'Establecer revisiones periódicas de pulso, dedos tibios y contacto visual durante ataduras o impacto prolongado.',
      questionToDiscuss: '¿Prefieres chequeos verbales periódicos o señales silenciosas de pulgar arriba?',
      suggestedSafeguards: 'Tijeras médicas EMT siempre al alcance de la mano en cualquier atadura.',
    },
    {
      id: 'neg-5',
      topic: 'Protocolo de Aftercare & Cuidado Posterior',
      title: 'Plan de Recuperación Física y Emocional',
      description: 'Planificar la salida del rol, abrigo, hidratación y el check-in de 24 horas para prevenir el Subdrop/Topdrop.',
      questionToDiscuss: '¿Qué te reconforta más al terminar: silencio con mantas, comida dulce o hablar de cómo te sentiste?',
      suggestedSafeguards: 'Dedicar al menos un 25% del tiempo total de la sesión al Aftercare.',
    },
  ];
}
