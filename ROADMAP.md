# CompatKink — Technical Roadmap & Execution Plan

**Ruta local:** `C:\KC\compatikink`  
**Remoto:** https://github.com/m1976cl-web/compatikink  
**Actualizado:** 2026-08-13  

Documentos relacionados:
- [`docs/IMPROVEMENT_REVIEW.md`](./docs/IMPROVEMENT_REVIEW.md) — ideas de mejora priorizadas  
- [`AGENTS.md`](./AGENTS.md) — handoff corto para agentes  
- [`docs/SUPABASE_HARDENING.md`](./docs/SUPABASE_HARDENING.md) — detalle Lote C  

---

## Horizontes

```
Horizonte 1 (actual):  feature flags MVP + deep links polish + reporte accionable
Horizonte 2 (próximo): storage split + biometría + PIN 6+
Horizonte 3 (futuro):  suite social real (solo con tracción del core)
```

**Estrategia de producto:** core first (compatibilidad asimétrica + ZK). Suite dating/feed/AI = post-core.

---

## Checklist Lotes A & C

### Lote A — Refactor Dashboard — done
### Lote C — Hardening Supabase & tokens — done
### P0 — Cierre y coherencia (2026-08-07) — done

### P1 — Core producto (2026-08-13)

- [x] Quick Invite usa `createSession` (ZK remoto) + TTL UI 48h  
- [x] Feature flags MVP (`EXPO_PUBLIC_MVP=1` default) — oculta FetishSuite + social/AI  
- [x] Cuestionario express (~25 ítems) + borrador reanudable (`questionnaire_draft_v1`)  
- [x] Google Sign-In (código) — activar provider + secrets; ver `docs/GOOGLE_AUTH.md`  
- [ ] Deep links AASA / assetlinks  
- [ ] Reporte accionable (guión 10 min unificado)  

### P2 — Ingeniería

- [ ] Split `lib/storage.ts`  
- [ ] Biometría + PIN 6+  
- [ ] Rate limit por IP (Edge / WAF)  

---

## Comandos

```bash
cd C:\KC\compatikink
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

Supabase: `supabase/schema.sql` (nuevo) o `supabase/migrations/001_hardening.sql` (existente).
