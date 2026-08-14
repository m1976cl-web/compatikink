# CompatKink — Technical Roadmap & Execution Plan

**Ruta local:** `C:\KC\compatikink`  
**Remoto:** https://github.com/m1976cl-web/compatikink  
**Actualizado:** 2026-08-13  

Documentos relacionados:
- [`docs/IMPROVEMENT_REVIEW.md`](./docs/IMPROVEMENT_REVIEW.md) — ideas de mejora priorizadas  
- [`AGENTS.md`](./AGENTS.md) — handoff corto para agentes  
- [`docs/SUPABASE_HARDENING.md`](./docs/SUPABASE_HARDENING.md) — detalle Lote C  
- [`docs/BRAND_AND_DEPLOY.md`](./docs/BRAND_AND_DEPLOY.md) — nombre + plataformas públicas  
- [`docs/PUBLIC_PROFILE_VS_VAULT.md`](./docs/PUBLIC_PROFILE_VS_VAULT.md) — FetLife-light vs ZK  

---

## Horizontes

```
Horizonte 1 (actual):  deep links polish + reporte accionable + dominio propio
Horizonte 2 (próximo): storage split + biometría + PIN 6+
Horizonte 3 (futuro):  public_profiles + comparar + DM E2E + media cifrada
```

**Estrategia de producto:** core first (compatibilidad asimétrica + ZK). Suite dating/feed/AI = post-core.  
**Marca recomendada:** CompatKink (ver `docs/BRAND_AND_DEPLOY.md`).

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

### H3 — Social post-core (diseño listo; no implementar sin tracción)

Ver [`docs/PUBLIC_PROFILE_VS_VAULT.md`](./docs/PUBLIC_PROFILE_VS_VAULT.md):

- [ ] `public_profiles` (nick, avatar, bio, rol, badges) opt-in + RLS  
- [ ] CTA “Invitar a comparar” → `create_zk_session` existente  
- [ ] DM E2E (solo ciphertext en servidor)  
- [ ] Media cifrada (Storage + share con secreto) + política 18+  
- [ ] Dominio propio + EAS stores (`docs/BRAND_AND_DEPLOY.md`)  

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
