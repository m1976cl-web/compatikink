# Google Antigravity (AGY) — Handoff & Developer Guide

Guía de handoff para desarrolladores y agentes de **Google Antigravity (AGY)** en el repositorio **CompatKink** (`C:\KC`).

**Prompt listo para pegar:** [`ANTIGRAVITY_PROMPT.md`](./ANTIGRAVITY_PROMPT.md)  
**Versión corta:** [`AGENTS.md`](./AGENTS.md)  
**Ideas de mejora:** [`docs/IMPROVEMENT_REVIEW.md`](./docs/IMPROVEMENT_REVIEW.md)

---

## 📌 Resumen del Producto

CompatKink es una plataforma móvil y web (Expo 53 / React Native Web) de exploración de **compatibilidad íntima asimétrica** con cifrado **Zero-Knowledge**. El iniciador crea una invitación; el invitado responde a ciegas; el iniciador ve el reporte y filtra qué compartir. Todo el cifrado ocurre en el cliente (`AES-GCM-256` / `PBKDF2` ~310k). Incluye PIN canario (duress) y panic wipe.

**Estrategia:** *core first*. Dating/feed/AI/store son post-core / laboratorio.

---

## 🛠️ Stack y comandos

- **Core:** Expo 53, React Native Web, React 19, TypeScript 5.8  
- **Estado:** Zustand 5  
- **Backend:** Supabase (PostgreSQL + Edge Functions Deno) — solo ciphertext  
- **Tema:** tokens en `constants/theme.ts`

```bash
cd C:\KC
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

---

## 📁 Estructura

```
app/               Rutas Expo Router
components/home/   Dashboard modular (post Lote A)
hooks/             useQuickInvite, useBackup, useVaultSubscription, useHomeData…
lib/               cryptoVault, compatibility, sessions, storage, supabase…
stores/            homeStore (Zustand)
supabase/          schema.sql, migrations/, functions/
docs/              THREAT_MODEL, SUPABASE_HARDENING, IMPROVEMENT_REVIEW, PRIVACY_POLICY
tests/             vault, compatibility, integration, i18n…
```

---

## 🔒 Archivos sagrados

1. `lib/cryptoVault.ts` — bóveda, PBKDF2, AES-GCM, DEK, duress  
2. `lib/compatibility.ts` — matches, hard limits, arquetipos  
3. `supabase/schema.sql` + `supabase/migrations/001_hardening.sql`  

---

## ✅ Hecho

| Lote | Contenido |
|------|-----------|
| **A** | Home Zustand + `components/home/*` + hooks + passphrase modal |
| **C** | expires_at, rate limits SQL, tokens CSPRNG, refreshSession RPC-only |
| **B** | CI `.github/workflows/*` + suites de test amplias |
| **Tier 1–2** | gemini-proxy, screen registry, office mode, aftercare, deep link helpers |

---

## 🔮 Pendiente (orden)

### P0
- Alinear defaults 24h/48h y tablas de rate limit entre `schema.sql` y `001_hardening.sql`
- Re-smoke crypto/tests tras cambios de seguridad
- Confirmar cero paths con SELECT abierto a `sessions`

### P1
- Feature flags MVP vs Beta  
- Cuestionario express + reanudar  
- Deep links HTTPS / Universal Links  
- Reporte accionable  

### P2
- Split `lib/storage.ts`  
- Biometría + PIN 6+  
- Rate limit por IP real  

### P3
- Suite social real (solo con tracción del core)

Detalle en `ROADMAP.md` y `docs/IMPROVEMENT_REVIEW.md`.

---

## ⚠️ Guardrails

- Nunca plaintext de respuestas en Supabase  
- Nunca secretos en git  
- Nunca `globalThis.prompt` para PIN/backup en nativo  
- No force-push / schema destructivo sin confirmación humana  
- 18+ y consentimiento; no consejo médico/legal  

---

## Cómo arrancar en Antigravity

1. Abre el proyecto en `C:\KC`.  
2. Pega el contenido de **`ANTIGRAVITY_PROMPT.md`** (bloque de código).  
3. Pide: *“Ejecuta P0 y reporta hallazgos”*.  
4. Tras P0, elige un ítem P1 del roadmap.
