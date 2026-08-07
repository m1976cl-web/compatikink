import { getCurrentLocale } from './i18n';

export interface AssistantMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `
Eres la IA de Asistencia Íntima y Consentimiento de CompatKink (plataforma de compatibilidad BDSM, fetichismo y sexualidad consciente).
Principios clave:
1. Enfoque prioritario en Consentimiento Informado, SSC (Safe, Sane, Consensual) y RACK (Risk-Aware Consensual Kink).
2. Tono empático, profesional, educacional, sin prejuicios morales ni tabúes.
3. Asesora en negociación de límites, comunicación afectiva, prevención de riesgos anatómicos (ej. compresión nerviosa en Shibari), y Aftercare post-escena.
4. NUNCA guardes ni compartas logs. Recuerda al usuario que sus consultas son Zero-Knowledge en su propio dispositivo.
5. Responde siempre en el idioma solicitado por el usuario (Español por defecto).
`.trim();

export async function askGeminiAssistant(
  prompt: string,
  chatHistory: AssistantMessage[] = [],
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!apiKey) {
    // Fallback asistencial sintético cuando no se configura clave API
    return generateSyntheticResponse(prompt);
  }

  try {
    const contents = [
      ...chatHistory.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Respuesta de la IA vacía o en formato no esperado.');
    }

    return candidateText.trim();
  } catch (error: any) {
    console.warn('Falló Gemini API HTTP, usando respuesta asistencial local:', error?.message);
    return generateSyntheticResponse(prompt);
  }
}

function generateSyntheticResponse(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();
  const locale = getCurrentLocale();

  if (locale === 'en') {
    if (lower.includes('shibari') || lower.includes('rope') || lower.includes('knot')) {
      return `🪢 **Shibari Safety Advice**:
- Always check skin warmth and pulse in tied limbs every 10 minutes.
- Keep EMT safety shears within reach at all times.
- Avoid wrapping directly around high-risk nerve bundles like the radial nerve in the inner elbow.`;
    }
    if (lower.includes('debrief') || lower.includes('aftercare')) {
      return `🪷 **Aftercare Guidance**:
- Wrap up in a warm blanket to prevent post-adrenaline drop.
- Offer warm tea/water and light snacks.
- Talk gently: "How are you feeling right now? What was your favorite part of today?"`;
    }
    return `🔮 **Intimate AI Assistant**:
Communication is the cornerstone of BDSM. Clearly negotiate hard limits, soft limits, and safewords (Green, Yellow, Red) before starting any scene.`;
  }

  // Default Spanish responses
  if (lower.includes('shibari') || lower.includes('cuerda') || lower.includes('nudo')) {
    return `🪢 **Asesoría de Seguridad en Shibari**:
- Revisa el pulso y la temperatura de la piel en extremidades atadas cada 10 minutos.
- Ten siempre tijeras de rescate EMT a mano en caso de emergencia.
- Evita la presión directa sobre paquetes nerviosos de alto riesgo como el nervio radial en la fosa del codo.`;
  }
  if (lower.includes('debrief') || lower.includes('aftercare') || lower.includes('cuidado')) {
    return `🪷 **Guía de Aftercare Post-Escena**:
- Envuelve a tu pareja en una manta cálida para prevenir la bajada de temperatura tras la adrenalina.
- Ofrece agua tibia, infusión o chocolate.
- Conversa con empatía: "¿Cómo te sientes en este momento? ¿Qué te gustaría repetir la próxima vez?"`;
  }
  return `🔮 **Asistente Íntimo de CompatKink**:
La comunicación explícita es la piedra angular del consentimiento. Negocia previamente los límites duros, límites suaves y el uso del semáforo de seguridad (Verde, Amarillo, Rojo) antes de iniciar la escena.`;
}
