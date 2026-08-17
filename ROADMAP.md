# ROADMAP — CompatKink

Estado operativo y prioridades para agentes. Fuente canónica: `PROJECT.md` + este archivo.

---

## 🎯 Estado actual

- [x] Quick Invite usa `createSession` (ZK remoto) + TTL UI 48h  
- [x] Feature flags MVP (`EXPO_PUBLIC_MVP=1` default) — oculta FetishSuite + social/AI  
- [x] Cuestionario express (~25 ítems) + borrador reanudable (`questionnaire_draft_v1`)  
- [x] Google Sign-In (código) — activar provider + secrets; ver `docs/GOOGLE_AUTH.md`  
- [x] Schema ZK aplicado en `piegesepycvipfzjbraz`  
- [x] Sprint **beta usable**: home mínimo + `CorePathBanner` + happy path doc + reload vault  
- [x] Deep links AASA / assetlinks (`public/.well-known/` + `docs/DEEP_LINKS.md`) + invite `?k=` fallback  
- [x] Reporte accionable (banner hard limits + guión 10 min)  
- [x] i18n ES / EN / PT en happy path + catálogo + tips de conversación  
- [x] Nox host art por escena (`components/nox/` + `assets/nox/*.webp`) en el camino core  
- [x] Expansiones de contenido P0-P2 (36 preguntas intimidad, 42 ruleta, 31 actos diarios, 15 rituales, 161 actividades, 85 glosario)
- [x] Radar Chart SVG en reporte de compatibilidad
- [x] Gear Closet con fotos, wishlist y compatibilidad de juguetes
- [x] U4: Barra de progreso de cuestionario animada con insignias de categoría y tiempo estimado
- [x] U5: Microinteracciones de feedback (animaciones en RatingPicker y ReportAnalysisLoader para generación de reporte)
- [x] S4: Modo Pasar y Jugar presencial (Pass and Play) con turnos alternados, cortina de privacidad y reporte inmediato
- [x] E3: Glosario Interactivo (Término del Día, 5 categorías, favoritos/bookmarks ZK, términos relacionados y mini-quiz)
- [x] U2: Sistema integral de vibración y hápticos multi-nivel (selección, impacto, éxito, logros, ruleta y switch de preferencias)
- [x] G1: Contador de rachas (Streaks) con llama dinámica, historial de 7 días, widget interactivo y logros por hitos (7d, 30d, 100d)
- [ ] P3-1 Onboarding Wizard interactivo
- [ ] P3-2 Sistema de Badges y ranking
- [ ] P3-3 Galería de fotos y comparador de juguetes
- [ ] P3-4 Deep Links y QR para invitaciones
- [ ] P3-5 Mini‑guías educativas (Latex, cuidados)
- [ ] P3-6 Notificaciones After‑care mejoradas
- [ ] P3-7 Personalización de avatar y perfil de intereses
- [x] Guía especializada de Látex (`/latex-guide`)
- [x] Split modular de `lib/storage.ts` en `lib/storage/*`
- [ ] Pasada humana E2E registrada en `docs/BETA_HAPPY_PATH.md`  

---

## 🔮 Siguiente (orden recomendado)

### P1 — Core Producto & Testing Humano
1. [ ] Pasada humana E2E registrada en `docs/BETA_HAPPY_PATH.md`
2. [ ] Dominio propio + EAS stores (`docs/BRAND_AND_DEPLOY.md`)
3. [ ] Rate limit por IP (Edge / WAF)

### H3 — Social post-core (diseño listo; no implementar sin tracción)
Ver [`docs/PUBLIC_PROFILE_VS_VAULT.md`](./docs/PUBLIC_PROFILE_VS_VAULT.md):
- [ ] `public_profiles` (nick, avatar, bio, rol, badges) opt-in + RLS  
- [ ] CTA “Invitar a comparar” → `create_zk_session` existente  
- [ ] DM E2E (solo ciphertext en servidor)  
- [ ] Media cifrada (Storage + share con secreto) + política 18+  

---

## Comandos

```bash
cd C:\KC
pnpm install
pnpm start
pnpm exec tsc --noEmit
pnpm run test:vault:all
pnpm run build:web
```

Supabase: `supabase/schema.sql` (nuevo) o `supabase/migrations/001_hardening.sql` (existente).
