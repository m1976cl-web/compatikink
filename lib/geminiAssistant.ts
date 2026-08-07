import { getCurrentLocale } from './i18n';

// Safe check for Supabase URL in environment without forcing top-level module load of native packages in Node.js
function checkSupabaseConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
}

export interface AssistantMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const GEMINI_DIRECT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Supabase Edge Function proxy URL.
 * When Supabase is configured, we route through this proxy so the API key
 * never touches the client bundle. The proxy adds the key server-side.
 */
const GEMINI_PROXY_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/gemini-proxy`
  : '';

const SYSTEM_INSTRUCTION = `
Eres la IA de Asistencia Íntima y Consentimiento de CompatKink (plataforma de compatibilidad BDSM, fetichismo y sexualidad consciente).
Principios clave:
1. Enfoque prioritario en Consentimiento Informado, SSC (Safe, Sane, Consensual) y RACK (Risk-Aware Consensual Kink).
2. Tono empático, profesional, educacional, sin prejuicios morales ni tabúes.
3. Asesora en negociación de límites, comunicación afectiva, prevención de riesgos anatómicos (ej. compresión nerviosa en Shibari), y Aftercare post-escena.
4. NUNCA guardes ni compartas logs. Recuerda al usuario que sus consultas son Zero-Knowledge en su propio dispositivo.
5. Responde siempre en el idioma solicitado por el usuario (Español por defecto).
`.trim();

// ─── Client-side rate limiter (30 requests / hour) ───────────────────
const CLIENT_RATE_LIMIT = 30;
const CLIENT_RATE_WINDOW_MS = 3600_000; // 1 hour
let _requestCount = 0;
let _windowStart = Date.now();

function isClientRateLimited(): boolean {
  const now = Date.now();
  if (now - _windowStart > CLIENT_RATE_WINDOW_MS) {
    _requestCount = 0;
    _windowStart = now;
  }
  if (_requestCount >= CLIENT_RATE_LIMIT) return true;
  _requestCount++;
  return false;
}

// ─── Debounce guard (2s minimum between requests) ────────────────────
let _lastRequestTime = 0;
const DEBOUNCE_MS = 2000;

export async function askGeminiAssistant(
  prompt: string,
  chatHistory: AssistantMessage[] = [],
  customApiKey?: string
): Promise<string> {
  // Debounce: reject if called within 2s of last request
  const now = Date.now();
  if (now - _lastRequestTime < DEBOUNCE_MS) {
    return generateSyntheticResponse(prompt);
  }
  _lastRequestTime = now;

  // Client-side rate limit
  if (isClientRateLimited()) {
    const locale = getCurrentLocale();
    return locale === 'en'
      ? '⚠️ Rate limit reached (30 requests/hour). Please try again later.'
      : '⚠️ Límite de consultas alcanzado (30/hora). Intenta de nuevo más tarde.';
  }

  // Determine which endpoint to use:
  // 1. Proxy (preferred): Supabase Edge Function hides the API key server-side
  // 2. Direct (fallback): User-provided key in RAM (never persisted)
  // 3. Synthetic: No key available, use local fallback responses
  const useProxy = checkSupabaseConfigured() && GEMINI_PROXY_URL;
  const directApiKey = customApiKey || '';

  if (!useProxy && !directApiKey) {
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

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    let response: Response;

    if (useProxy) {
      // Route through Supabase Edge Function proxy (API key stays server-side)
      response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    } else {
      // Direct call with user-provided RAM-only key (never from EXPO_PUBLIC_*)
      response = await fetch(`${GEMINI_DIRECT_URL}?key=${directApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    }

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
    console.warn('Falló Gemini API, usando respuesta asistencial local:', error?.message);
    return generateSyntheticResponse(prompt);
  }
}

export function generateSyntheticResponse(userPrompt: string): string {
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
