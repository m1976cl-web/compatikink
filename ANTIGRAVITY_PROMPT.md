# Texto para pegar en Antigravity

Copia **desde la línea siguiente** hasta el final del bloque (o todo el archivo) y pégalo como prompt inicial en Antigravity.

---

```
Eres el agente de continuación del repo CompatKink.

## Contexto de entorno
- Ruta local del proyecto: C:\KC
- Repo remoto: https://github.com/m1976cl-web/compatikink
- Gestor preferido: pnpm (también hay package-lock.json)
- Lee primero y respeta: AGENTS.md, ANTIGRAVITY.md, ROADMAP.md, PROJECT.md, docs/IMPROVEMENT_REVIEW.md, docs/THREAT_MODEL.md, docs/SUPABASE_HARDENING.md

## Qué es el producto
CompatKink es una app Expo 53 / React Native Web de **compatibilidad íntima asimétrica y privada**:
1) El iniciador responde el cuestionario y crea invitación.
2) El invitado responde con código (sin ver respuestas del iniciador).
3) El iniciador ve el reporte y decide qué compartir.
Cifrado zero-knowledge: el servidor Supabase solo ve ciphertext (ck1:). Vault cliente AES-GCM-256 + PBKDF2 (~310k). PIN canario / duress y panic wipe.

## Core vs no-core
- CORE: cuestionario, invite/guest, reporte, share filtrado, vault, backup cifrado, aftercare/safety, age gate.
- POST-CORE / laboratorio: dating, feed, events, AI, store, premium, hardware, etc.
No amplíes la suite social hasta que el core y la seguridad residual estén impecables. Estrategia: **core first**.

## Stack
- Expo 53, React 19, RN 0.79, Expo Router, TypeScript, Zustand, Supabase JS
- Crypto: lib/cryptoVault.ts (sagrado)
- Motor de matches: lib/compatibility.ts (sagrado)
- SQL: supabase/schema.sql + supabase/migrations/001_hardening.sql (sagrado)

## Estado ya hecho (NO rehacer desde cero)
### Lote A — Refactor home ✅
- zustand + stores/homeStore.ts
- components/home/* (Hero, ProfileBar, QuickInvite, GuestJoin, SessionList, ModuleGrid, HomeActions, FetishSuite…)
- hooks: useHomeData, useQuickInvite, useBackup, useVaultSubscription
- BackupPassphraseModal (sin globalThis.prompt)
- app/index.tsx orquestador ~180–220 líneas

### Lote C — Hardening Supabase ✅ (verificar residuales)
- expires_at en sessions
- rate limits (invite_attempts y/o rpc_rate_limits según schema vs migration)
- tokens vía generateInviteSecret / CSPRNG en storage y utils
- refreshSession en lib/supabase.ts debe ser RPC-only (getSessionByToken), no .from('sessions').select por id

### Otros ✅
- tests (test:vault:all, compatibility, integration, i18n, …)
- CI .github/workflows/ci.yml y audit.yml
- docs PRIVACY_POLICY, THREAT_MODEL, SUPABASE_HARDENING
- Edge gemini-proxy

## Trabajo prioritario para TI (en este orden)

### P0 — Cierre y coherencia (rápido)
1. Verificar que lib/storage.ts y lib/utils.ts no regeneran tokens débiles (Date.now + Math.random). Unificar en CSPRNG.
2. Verificar que ningún path de cliente hace SELECT abierto a sessions sin claim; solo RPCs.
3. Alinear schema.sql (48h / invite_attempts) con migrations/001_hardening.sql (24h / rpc_rate_limits): documentar fuente de verdad o unificar.
4. Smoke: pnpm exec tsc --noEmit && pnpm run test:vault:all

### P1 — Producto core
5. Feature flags / home “MVP only” vs módulos Beta (data/homeModules.ts + ModuleGrid).
6. Cuestionario express (20–30 ítems) + reanudar progreso.
7. Deep links HTTPS + fallback web para invite con #k=secret (lib/linking.ts, app.json, public).
8. Reporte más accionable (guión de conversación + export unificado).

### P2 — Ingeniería
9. Split lib/storage.ts → profiles / sessions / backup / scene / dating.
10. Consolidar stores duplicados si existen (stores/homeStore.ts vs lib/stores/*).
11. Biometría (expo-local-authentication) + PIN mínimo 6.
12. Rate limit por IP real vía Edge Function o WAF (el rate limit SQL por código no basta solo).

### P3 — Solo con tracción del core
13. Dating/feed/eventos con backend real + moderación + E2EE mensajes.
14. No vender DMs locales en AsyncStorage como red multi-dispositivo.

## Guardrails (obligatorios)
- NUNCA subir plaintext de respuestas/perfiles a Supabase.
- NUNCA commitear .env con keys reales.
- NUNCA reintroducir globalThis.prompt para flujos nativos.
- NUNCA force-push a main sin instrucción explícita del usuario.
- No tocar a la ligera: lib/cryptoVault.ts, lib/compatibility.ts, supabase/schema.sql.
- Adultos 18+; contenido consentido; no consejo médico/legal.

## Comandos
```bash
cd C:\KC
pnpm install
cp .env.example .env   # si hace falta
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

## Cómo trabajar
1. Lee el archivo relevante antes de editar.
2. Cambios pequeños y verificables; tests después de crypto/compatibilidad/sesiones.
3. Actualiza ROADMAP.md / PLAN_REFACTOR.md checkboxes al cerrar ítems.
4. Si implementas SQL, deja script idempotente y nota en docs/SUPABASE_HARDENING.md.
5. Al terminar un lote: resume qué hiciste, cómo probarlo, y qué queda.

## Primera tarea sugerida
Empieza por **P0** (auditoría residual de tokens + refreshSession + alinear docs schema/migration + smoke tests). Luego propone PR plan para **P1.5 feature flags MVP**.

Cuando termines P0, reporta hallazgos y diffs sin pedir permiso para leer; pregunta solo antes de borrar datos, push remoto o cambios de schema destructivos.
```
