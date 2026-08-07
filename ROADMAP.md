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
- [x] Rate limiting SQL (`invite_attempts` y/o `rpc_rate_limits` — **alinear schema vs migration**)  
- [x] `refreshSession` RPC-only en `lib/supabase.ts`  
- [ ] **P0 residual:** unificar default 24h vs 48h entre `schema.sql` y `001_hardening.sql` y documentar fuente de verdad  
- [ ] **P0 residual:** smoke `tsc` + `test:vault:all` tras cualquier toque crypto/SQL  

---

## 🔮 Siguiente para Antigravity (orden recomendado)

### P0 — Cierre y coherencia
1. Auditoría tokens: ningún `Date.now`+`Math.random` para `initiator_token`.  
2. Ningún `.from('sessions').select` sin claim en cliente.  
3. Alinear schema/migration de caducidad y rate-limit tables.  
4. Smoke tests.

### P1 — Core producto
5. Feature flags MVP vs Beta (`data/homeModules.ts` / `ModuleGrid`).  
6. Cuestionario express + reanudar.  
7. Deep links HTTPS + fallback web `#k=`.  
8. Reporte accionable (guión + export unificado).

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
