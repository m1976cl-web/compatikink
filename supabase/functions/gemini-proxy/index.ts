// supabase/functions/gemini-proxy/index.ts
// Proxies Gemini API calls to prevent client-side API key exposure.
// The API key is stored as a Supabase secret: GEMINI_API_KEY
//
// Deploy: supabase functions deploy gemini-proxy --no-verify-jwt
// Set secret: supabase secrets set GEMINI_API_KEY=AIzaSy...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple in-memory rate limiter (per-instance; resets on cold start)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_HOUR = 30;

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimiter.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimiter.set(clientIp, { count: 1, resetAt: now + 3600_000 });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_HOUR) {
    return true;
  }

  entry.count++;
  return false;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Rate limit by IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Max 30 requests/hour.' }),
      {
        status: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // Get API key from Supabase secrets
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Gemini API key not configured on server.' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await req.json();

    // Validate payload structure
    if (!body.contents || !Array.isArray(body.contents)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: missing contents array.' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Forward to Gemini API with server-side key
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const geminiData = await geminiResponse.json();

    return new Response(JSON.stringify(geminiData), {
      status: geminiResponse.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal proxy error.' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
