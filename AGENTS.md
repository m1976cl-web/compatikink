# AGENTS.md — Handoff para agentes de IA

Instrucciones operativas para cualquier agente (Antigravity, Grok Build, Cursor, etc.) que trabaje en **CompatKink** en `C:\KC`.

Para un prompt largo listo para pegar: ver **`ANTIGRAVITY_PROMPT.md`**.  
Guía narrativa ampliada: **`ANTIGRAVITY.md`**.

---

## Producto (1 párrafo)

App Expo/React Native Web de **compatibilidad íntima asimétrica**: el iniciador invita; el invitado responde sin ver sus respuestas; solo el iniciador ve el reporte completo y filtra qué compartir. Cifrado **zero-knowledge** (Supabase solo ciphertext `ck1:`). Vault cliente PBKDF2 + AES-GCM, PIN canario, panic wipe.

**Estrategia:** core first. Suite social/dating/AI = post-core.

---

## Stack y comandos

```bash
cd C:\KC
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

- Expo 53 · React 19 · Expo Router · Zustand · Supabase · TypeScript  
- Env: `.env.example` → `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## Archivos sagrados

| Archivo | Por qué |
|---------|---------|
| `lib/cryptoVault.ts` | Cifrado, vault, DEK wrap, duress |
| `lib/compatibility.ts` | Motor de matches / hard limits |
| `supabase/schema.sql` | RLS + RPC ZK |
| `supabase/migrations/001_hardening.sql` | expires_at + rate limits |

No refactors cosméticos en estos archivos sin necesidad de seguridad o bugfix.

---

## Hecho vs pendiente

### Hecho
- Lote A: home Zustand + `components/home/*` + hooks
- Lote C: expires, rate limit SQL, tokens CSPRNG, refreshSession RPC-only
- Tests + CI + threat model + privacy policy
- Tier 1–2 (gemini-proxy, office mode, aftercare, screen registry…)

### Pendiente prioritario
1. P0: auditoría residual tokens/SQL coherencia + smoke tests 
2. Deep links HTTPS / AASA  
3. Reporte accionable  
4. Split `lib/storage.ts`  
5. Biometría + PIN 6+  
6. Dominio propio + marca fija — `docs/BRAND_AND_DEPLOY.md`  
7. Social H3 (perfiles públicos / DM / media) — `docs/PUBLIC_PROFILE_VS_VAULT.md` (post-core)  

Detalle: `ROADMAP.md`, `docs/IMPROVEMENT_REVIEW.md`.

---

## Guardrails

1. Nunca plaintext de respuestas en Supabase.  
2. Nunca commitear secretos / `.env` real.  
3. Nunca `globalThis.prompt` para backup/PIN en nativo.  
4. No force-push ni schema destructivo sin confirmación del usuario.  
5. Adultos 18+; consentimiento; no consejo médico/legal.  
6. Preferir cambios pequeños + tests en crypto/compat/sesiones.

---

## Estructura relevante

```
app/                 Pantallas Expo Router
components/home/     Dashboard modular
hooks/               useQuickInvite, useBackup, useVaultSubscription…
stores/homeStore.ts  Zustand
lib/                 crypto, compatibility, sessions, storage, supabase
supabase/            schema + migrations + edge functions
docs/                threat model, hardening, improvement review
tests/               vault, compatibility, integration…
```

---

## Al cerrar un cambio

1. Actualizar checkbox en `ROADMAP.md` si aplica.  
2. Dejar nota breve en el commit/PR: qué, por qué, cómo probar.  
3. No expandir dating/feed/AI salvo tarea explícita.
