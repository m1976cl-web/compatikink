/**
 * docs/GOOGLE_AUTH.md — Continuar con Google (Supabase OAuth + PIN de bóveda)
 *
 * Google solo identifica la cuenta. La DEK de la bóveda sigue derivándose del PIN (ZK).
 */

## Estado del backend

Proyecto restaurado (2026-08-13):

- URL: `https://pkcuhoudvkvtunjlpidb.supabase.co`
- Redirect de Google Cloud / Supabase callback:
  `https://pkcuhoudvkvtunjlpidb.supabase.co/auth/v1/callback`

## 1. Google Cloud Console

1. APIs & Services → Credentials → Create OAuth client ID → **Web application**.
2. Authorized redirect URIs → añade exactamente:
   `https://pkcuhoudvkvtunjlpidb.supabase.co/auth/v1/callback`
3. Copia Client ID y Client Secret.

## 2. Supabase Dashboard

1. Authentication → Providers → **Google** → Enable.
2. Pega Client ID / Secret.
3. Authentication → URL Configuration:
   - **Site URL:** `https://m1976cl-web.github.io/compatikink`
   - **Redirect URLs** (allow list):
     - `https://m1976cl-web.github.io/compatikink`
     - `https://m1976cl-web.github.io/compatikink/auth`
     - `http://localhost:8081/auth`
     - `http://127.0.0.1:8081/auth`

## 3. Variables de entorno

Local (archivo `.env`, no se comitea) — usa URL + **anon/publishable** del proyecto
`pkcuhoudvkvtunjlpidb` (Dashboard → Settings → API):

```env
EXPO_PUBLIC_SUPABASE_URL=https://pkcuhoudvkvtunjlpidb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key del dashboard>
EXPO_PUBLIC_MVP=1
```

GitHub Actions (repo → Settings → Secrets and variables → Actions):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

El job `build` del CI las inyecta para que Pages tenga OAuth real.

## 4. Flujo en la app

1. `/auth` → **Continuar con Google**.
2. Vuelves a `/auth` con sesión Supabase.
3. Si no hay perfil local ligado → crear nick + PIN (bóveda).
4. Si ya hay perfil con `supabaseUserId` → desbloquear con PIN.
5. Home con bóveda abierta.

## Cómo probar

```bash
pnpm start
# abrir /auth → Continuar con Google
```

Errores frecuentes:

- `redirect_uri_mismatch` → falta la URI en Google Cloud.
- Botón oculto / “Supabase no configurado” → falta `.env` o secrets de CI.
- Vuelves a `/auth` sin sesión → Site URL / allow list incompletos.
