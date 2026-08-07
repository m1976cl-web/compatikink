# CompatKink — Technical Roadmap & Execution Plan

**Ruta local:** `C:\KC`  
**Remoto:** https://github.com/m1976cl-web/compatikink  
**Actualizado:** 2026-08-07  

Documentos relacionados:
- [`docs/IMPROVEMENT_REVIEW.md`](./docs/IMPROVEMENT_REVIEW.md) — ideas de mejora priorizadas  
- [`AGENTS.md`](./AGENTS.md) — handoff corto para agentes  
- [`ANTIGRAVITY.md`](./ANTIGRAVITY.md) — guía ampliada  
- [`ANTIGRAVITY_PROMPT.md`](./ANTIGRAVITY_PROMPT.md) — **texto listo para pegar en Antigravity**  
- [`PLAN_REFACTOR.md`](./PLAN_REFACTOR.md) — detalle Lote A  
- [`docs/SUPABASE_HARDENING.md`](./docs/SUPABASE_HARDENING.md) — detalle Lote C  

---

## 🎯 Horizontes

```
Horizonte 1 (actual):  P0 residuales + feature flags + deep links + cuestionario express
Horizonte 2 (próximo): storage split + reporte accionable + biometría
Horizonte 3 (futuro):  suite social real (solo con tracción del core)
```

**Estrategia de producto:** core first (compatibilidad asimétrica + ZK). Suite dating/feed/AI = post-core.

---

## 📋 Checklist Lotes A & C

### Lote A — Refactor Dashboard (`PLAN_REFACTOR.md`)

- [x] `zustand` en dependencies  
- [x] `stores/homeStore.ts` + `useVaultSubscription`  
- [x] `components/home/*` (Hero, ProfileBar, QuickInvite, GuestJoin, SessionList, ModuleGrid, HomeActions, …)  
- [x] `useQuickInvite`, `useBackup`, `BackupPassphraseModal` (sin `globalThis.prompt`)  
- [x] `app/index.tsx` orquestador delgado (~180–220 líneas)  

### Lote C — Hardening Supabase & tokens

- [x] Tokens CSPRNG (`generateInviteSecret` / `crypto.getRandomValues`)  
- [x] `expires_at` en sessions + checks en RPC  
- [x] Rate limiting SQL (`invite_attempts` + `rpc_rate_limits`)  
- [x] `refreshSession` RPC-only en `lib/supabase.ts`  

### P0 — Cierre y coherencia (2026-08-07)

- [x] Unificar **48h** TTL en `schema.sql` y `migrations/001_hardening.sql`  
- [x] Mismas RPCs + límites en ambos SQL (fuente de verdad = schema; migration alinea existentes)  
- [x] Tokens/códigos: `lib/utils.ts` CSPRNG estricto; `storage.ts` reutiliza utils  
- [x] Sin `.from('sessions')` en cliente (solo RPC)  
- [x] Docs `docs/SUPABASE_HARDENING.md` actualizados  
- [x] Smoke `tsc` + `test:vault:all` (ver CI / commit P0)  

---

## 🔮 Siguiente (orden recomendado)

### P1 — Core producto
1. Feature flags MVP vs Beta (`data/homeModules.ts` / `ModuleGrid`).  
2. Cuestionario express + reanudar.  
3. Deep links HTTPS + fallback web `#k=`.  
4. Reporte accionable (guión + export unificado).

### P2 — Ingeniería
9. Split `lib/storage.ts`.  
10. Consolidar stores duplicados si existen.  
11. Biometría + PIN 6+.  
12. Rate limit por IP (Edge / WAF).

### P3 — Suite (después)
13. Dating/feed/eventos con backend + moderación + E2EE real.  

---

## 🧪 Comandos

```bash
cd C:\KC
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

Supabase: ejecutar `supabase/schema.sql` en proyecto nuevo, o `supabase/migrations/001_hardening.sql` en proyecto ya existente (ver `docs/SUPABASE_HARDENING.md`).
