# AGENTS.md — Handoff para agentes de IA

Instrucciones operativas para cualquier agente (Cursor Cloud, Antigravity, Grok, etc.) que trabaje en **CompatKink**.

- **Fuente de verdad:** GitHub [`m1976cl-web/compatikink`](https://github.com/m1976cl-web/compatikink) rama `main`.
- **Este PC (backup local):** `C:\KC\compatikink`. Flujo dual: [`docs/CLOUD_AND_LOCAL.md`](docs/CLOUD_AND_LOCAL.md).
- Prompt largo para pegar: [`ANTIGRAVITY_PROMPT.md`](ANTIGRAVITY_PROMPT.md). Guía narrativa: [`ANTIGRAVITY.md`](ANTIGRAVITY.md).

---

## Producto (estado actual)

App Expo/React Native Web de **compatibilidad íntima asimétrica**: el iniciador invita; el invitado responde a ciegas; solo el iniciador ve el reporte completo y filtra qué compartir.

Cifrado **zero-knowledge**: Supabase solo ve ciphertext `ck1:`. Vault cliente PBKDF2 + AES-GCM, PIN canario, panic wipe.

**Core listo:** stepper de 3 pasos (responder → invitar → reporte), cuestionario + invite/guest, reporte accionable, share filtrado, bóveda/backup, aftercare, Pass & Play, i18n **ES / EN / PT**, host **Nox** por escena.

**Labs (gated, no van al home MVP):** Fetish Labs (marketplace, foot, tribute, sissy), **castidad** (tallas locales + portador/keyholder/protocolo), **medidas de látex** (ficha en `/latex-guide`), **leisure** (`/leisure`, RouteFeatureGuard como castidad). Visible con `EXPO_PUBLIC_MVP=0` o toggle **⚡ Todos**.

**Estrategia:** core first. Suite social/dating/AI = post-core. **Pausa de naming:** no rebrandear a Shleyer / Geheym.

---

## Stack y comandos

Repo Expo en la raíz del clone. En este PC:

```bash
cd C:\KC\compatikink
pnpm install
cp .env.example .env   # rellenar ANON_KEY local; nunca commitear .env
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

Sincronizar este PC con GitHub (ff-only, no auto-commit):

```powershell
cd C:\KC\compatikink
.\scripts\sync-local.ps1
```

Cloud agent / clone fresco: trabajar desde la raíz del repo (no hace falta `C:\KC\…`).

- Expo 53 · React 19 · Expo Router · Zustand · Supabase · TypeScript
- Env: `.env.example` → `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MVP`
- **Supabase canónico:** `https://piegesepycvipfzjbraz.supabase.co` (ver `docs/GOOGLE_AUTH.md` para OAuth)
- Cloud: `EXPO_PUBLIC_MVP=1` (core). Labs/leisure: `EXPO_PUBLIC_MVP=0`. Anon key vía secretos de Actions / Cursor Cloud / `.env` local gitignored.

## Cursor Cloud specific instructions

Cloud Agents corren en Ubuntu y clonan GitHub; **no** usan `C:\KC\...`. Working directory = raíz del repo.

- Bootstrap: [`.cursor/environment.json`](.cursor/environment.json) — `install` = `pnpm install` (Build). Terminal `expo-web` = `pnpm start` (puerto 8081).
- Secretos en [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents) (nombres: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MVP`). No copiar valores al repo.
- No commitear `.env`. No force-push a `main`. Si `main` divergió, parar y avisar.
- Clics humanos, PR vs `main`, y prompt para pegar: [`docs/CLOUD_AND_LOCAL.md`](docs/CLOUD_AND_LOCAL.md).

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
- Core stepper + happy path + feature flag MVP (`EXPO_PUBLIC_MVP=1`)
- i18n ES/EN/PT, Nox, deep links (`docs/DEEP_LINKS.md`), reporte accionable
- Fetish Labs + castidad (tallas) + medidas látex + leisure **gated**
- Lote A (home Zustand) + Lote C (expires, rate limit SQL, tokens CSPRNG, refreshSession RPC-only)
- Tests + CI + threat model + privacy policy
- Split `lib/storage.ts` → `lib/storage/*` y `lib/vaultUnified.ts`
- U4/U5, S4, E3, U2, G1, P5, G4, S1, P2, S3, S2, E1, G5, P1, AI1–4

### Pendiente prioritario
1. Pasada humana E2E continua — `docs/BETA_HAPPY_PATH.md`
2. Biometría + PIN 6+
3. Dominio propio — `docs/BRAND_AND_DEPLOY.md`
4. Rate limit por IP (Edge / WAF)
5. Social H3 — `docs/PUBLIC_PROFILE_VS_VAULT.md` (post-core)

Detalle: `ROADMAP.md`, `docs/IMPROVEMENT_REVIEW.md`, `docs/CLOUD_AND_LOCAL.md`.

---

## Guardrails

1. Nunca plaintext de respuestas en Supabase (solo `ck1:`).
2. Nunca commitear secretos / `.env` / `.env.txt` / `.docx` de marca.
3. Nunca `globalThis.prompt` para backup/PIN en nativo.
4. No force-push ni schema destructivo sin confirmación del usuario.
5. Adultos 18+; consentimiento; no consejo médico/legal.
6. Preferir cambios pequeños + tests en crypto/compat/sesiones.
7. Cloud: commit + push a `main`; nunca `--force` a `main`.

---

## Estructura relevante

```
app/                 Pantallas Expo Router
components/home/     Dashboard modular
hooks/               useQuickInvite, useBackup, useVaultSubscription…
stores/homeStore.ts  Zustand
lib/                 crypto, compatibility, sessions, storage, supabase
supabase/            schema + migrations + edge functions
docs/                threat model, hardening, cloud/local, Google Auth
tests/               vault, compatibility, integration…
scripts/sync-local.ps1   Backup local ↔ origin/main (este PC)
```

---

## Al cerrar un cambio

1. Actualizar checkbox en `ROADMAP.md` si aplica.
2. Dejar nota breve en el commit/PR: qué, por qué, cómo probar.
3. No expandir dating/feed/AI salvo tarea explícita.
4. Push a `origin/main` para que Cloud Agents y este PC compartan el mismo backup.
