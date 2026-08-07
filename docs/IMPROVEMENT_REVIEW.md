# CompatKink — Revisión de mejoras (2026-08-07)

Revisión del repositorio local `C:\KC` y del producto CompatKink.  
Alcance aprobado de ejecución inmediata en su día: **Lote A (refactor home)** + **Lote C (hardening Supabase)** + **documentación para Antigravity**.  
Este documento conserva las **ideas de mejora** priorizadas para continuar el desarrollo.

---

## 1. Fortalezas (no romper)

| Área | Qué está bien |
|------|----------------|
| Producto core | Flujo asimétrico + secciones de reporte claras |
| Privacidad | ZK en Supabase (ciphertext + RPC); vault client-side con threat model |
| Seguridad local | PIN verifier, lockout, auto-lock, duress, panic wipe, export cifrado |
| Código home | Refactor A ya aplicado (Zustand + `components/home/*`) |
| Hardening | `expires_at`, rate limits, tokens CSPRNG (verificar residuales) |
| Calidad | Suites de test, CI, privacy policy, threat model |

---

## 2. Problema estructural principal: scope creep

Hay muchas pantallas en `app/` (dating, feed, AI, store, hardware, astrology…). El valor diferencial real es:

**invitar → responder ciego → reporte privado**

Recomendación: **core first**. Suite social = post-core / feature-flagged.

### MVP core sugerido

- Age gate 18+
- Perfil + PIN / vault
- Cuestionario (completo + express)
- Invite (código + secreto deep link)
- Guest flow
- Reporte + share filtrado
- Backup cifrado
- Manual / safety / aftercare

Todo lo demás → pestaña Experimental o flags.

---

## 3. Mejoras por dominio

### A. Producto y UX

1. **Onboarding en 3 pasos** visibles en home: Responde → Invita → Lee reporte.
2. **Cuestionario express** (20–30 ítems por mood/categoría) + reanudar.
3. **Deep links HTTPS** además de `compatikink://…#k=…` (WhatsApp/web rompen esquemas custom).
4. **Estados de error unificados**: sin Supabase, sesión caducada, vault bloqueada, rate limit.
5. **Reporte accionable**: guión de conversación de 10 min; no trivializar hard limits con score.
6. **Office mode reforzado**: icono/nombre neutro, PIN al abrir app.

### B. Arquitectura

1. ~~Refactor home~~ ✅ (hecho en `C:\KC`)
2. **Split `lib/storage.ts`** en profiles / sessions / backup / scene / dating
3. **Feature flags** (`EXPO_PUBLIC_FEATURES` o config local)
4. **Consolidar stores** si hay duplicados (`stores/` vs `lib/stores/`)
5. **i18n real** (hay `lib/i18n.ts` y `data/translations.ts`; muchas pantallas aún hardcodeadas)

### C. Seguridad

1. Códigos de 6 chars: seguridad real = **invite secret + rate limit**, no el código solo
2. Caducidad server-side ✅ — unificar 24h vs 48h entre schema y migration
3. Rate limit por IP real (Edge Function / Cloudflare) además del bucket SQL
4. PIN mínimo 6 + biometría como UX
5. No vender DMs/dating locales como multi-dispositivo sin E2EE de red
6. Admin local: sin backdoor por defecto en builds store
7. Legal: age gate + privacy policy ✅ — mantener ToS / store listings

### D. Backend

1. Migraciones versionadas ✅ (`supabase/migrations/`)
2. Unificar `schema.sql` con `001_hardening.sql` (fuente de verdad única)
3. Realtime opcional al completar sesión (sin filtrar ciphertext)
4. Métricas agregadas (conteos, no contenido)

### E. Producto high-ROI sobre el core

| Idea | Por qué |
|------|---------|
| Pass-and-play pulido | Pareja en un solo dispositivo, sin red |
| Plantillas negociación / safewords en reporte | Diferenciador vs tests genéricos |
| Poly comparator formal | Ya hay modal |
| Historial + re-invitar + diff | Reusar respuestas base |
| Education tooltips en cuestionario | Ya hay safety tips en data |

### F. Posponer

Dating marketplace, feed público, eventos reales, AI roleplay costoso, store/premium hardware, astrología/gamificación pesada — hasta tracción del core.

---

## 4. Horizontes

### H1 — Core confiable
- Cerrar residuales P0 (tokens, refreshSession, alinear SQL docs)
- Feature flags MVP
- Deep links HTTPS
- Cuestionario express
- Smoke E2E invite → guest → report

### H2 — Pareja excelente
- Reporte accionable + PDF unificado
- Pass-and-play + poly
- Biometría + office mode
- Split storage

### H3 — Suite
- Social real con moderación y E2EE
- Monetización con valor claro

---

## 5. Métricas de éxito

- % invitaciones → `complete`
- Tiempo medio cuestionario guest
- % reportes que usan share filtrado
- Fallos de descifrado / lockouts
- Feedback cualitativo tras primera pareja

---

## 6. Referencias en el repo

- `ROADMAP.md` — checklist A/C y siguientes pasos
- `PLAN_REFACTOR.md` — fases del home (marcadas done)
- `docs/SUPABASE_HARDENING.md` — SQL y RPCs
- `docs/THREAT_MODEL.md` — modelo de amenazas
- `ANTIGRAVITY.md` / `AGENTS.md` — convenciones de agente
- `ANTIGRAVITY_PROMPT.md` — **texto listo para pegar**
