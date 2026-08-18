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
- [x] UX slice: stepper 3 pasos (todo/doing/done) + home 2 columnas + FlowBar + banners de siguiente paso  
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
- [x] P5: Sistema de Denuncias (Reports) y Bloqueo Mutuo Bidireccional (Mutual Block) en feed, dating y admin dashboard
- [x] G4: Desafíos diarios (ciclo de 31 retos, 5 categorías, recompensas de XP, widget en dashboard, persistencia ZK y notificación)
- [x] S1: Cards de compatibilidad compartibles (formatos 9:16 Story, 1:1 Post y Badge, exportación anónima y portapapeles)
- [x] P2: Modo Privado Instantáneo / Botón de Pánico FAB (camuflaje en 1 tap con Calculadora funcional y Notas, bloqueo de bóveda en RAM)
- [x] S3: Foro y Comunidades de Buenas Prácticas (8 áreas temáticas, debates estructurados, respuestas, likes y moderación ZK)
- [x] S2: Modo Abre-hielos (Icebreaker) post-reporte (23 preguntas guiadas en 6 categorías, consejos y generador personalizado)
- [x] E1: Biblioteca de Artículos y Guías Educativas (6 artículos extensos, 6 categorías, lector inmersivo y bookmarks ZK)
- [x] G5: Sala de Trofeos interactiva (Vitrina de pedestales 3D con resplandor, modal de inspección táctil y compartir logros)
- [x] P1: Indicador de Nivel de Privacidad y Auditoría Criptográfica (Escudo 100% ZK, desglose de 5 capas y recomendaciones)
- [x] AI1-4: Suite de Inteligencia Artificial Íntima (AI1 Resumen narrativo de reporte, AI2 Sugerencia de 3 próximos pasos, AI3 Asistente de negociación con agenda guiada, AI4 Roleplay contextual con Nox y arquetipos)
- [ ] P3-1 Onboarding Wizard interactivo
- [ ] P3-2 Sistema de Badges y ranking
- [ ] P3-3 Galería de fotos y comparador de juguetes
- [x] P3-4 Deep Links y QR interactivo para invitaciones presenciales (Pestañas QR, Chat, PIN y zoom full screen)
- [ ] P3-5 Mini‑guías educativas (Latex, cuidados)
- [ ] P3-6 Notificaciones After‑care mejoradas
- [ ] P3-7 Personalización de avatar y perfil de intereses
- [x] Guía especializada de Látex (`/latex-guide`)
- [x] Split modular de `lib/storage.ts` en `lib/storage/*`
- [ ] Pasada humana E2E registrada en `docs/BETA_HAPPY_PATH.md`  
- [x] UX-1: Micro-animaciones en flujo de cuestionario (fade-in secuencial, slide en transiciones)
- [x] UX-2: Modo Demo con respuestas aleatorias realistas para el cuestionario
- [x] UX-3: Toggle de tema en ajustes (tema oscuro por defecto, ya implementado)
- [x] QIUI-1: Integración Bluetooth QIUI (lib/qiui.ts — scan, connect, lock/unlock, mock mode)
- [x] QIUI-2: Panel de dispositivos QIUI en hub de castidad (components/chastity/QIUIDevicePanel.tsx)
- [x] SEC-1: Suite de tests de seguridad para vault (seal/open round-trip, PIN incorrecto, duress, lockout)
- [x] BOT-1: Roadmap actualizado con checklist para seguimiento por bots de automatización

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
- [x] **Trust & Safety / Moderación (P5)**:
  - [x] Sistema de **Denuncias (Reports)** para usuario específico, posteo de feed o mensaje directo (con tipificación de motivos y cola de moderación).
  - [x] Sistema de **Bloqueo Mutuo Bidireccional (Mutual Block)**: el usuario bloqueado no puede ver el perfil de quien lo bloqueó y se bloquea recíprocamente la mensajería, invitaciones y visibilidad de posteos.  

### Experimental — Fetish Labs (preview, gated; naming paused)
First slice local/ZK. Hidden from beta home (`EXPO_PUBLIC_MVP=1`). Preview with `EXPO_PUBLIC_MVP=0` or home toggle **⚡ Todos**.
- [x] Marketplace Dark (`/marketplace-dark`) — catálogo legal + wishlist bóveda; sin checkout
- [x] Foot fetish (`/foot-fetish`) — subset + compare privado (no dating feed)
- [x] Cum tribute (`/tribute`) — petición/respuesta cifrada iniciador↔invitado; sin galería
- [x] Sissy training (`/sissy-training`) — protocolo PIN + aftercare; roleplay 18+ (no feed público)
- [x] Castidad hub (`/chastity`) — 3 mini-apps originales (portador / keyholder / protocolo), compare ZK, invite; no Typeform/Oxy checkout
- [x] Tallas locales de castidad (`/chastity-cage` `/chastity-belt` `/chastity-fit`) + ficha látex 28 puntos (`/latex-guide` tab medidas) en bóveda; export markdown/JSON; sin tienda
Deliberadamente no construido: pagos, upload público a Storage, CDN de media, bienes ilegales.

### Bot Automation Checklist
> Entries below are designed for CI/CD bots to track implementation status.

- [ ] All TypeScript compiles without errors (`pnpm exec tsc --noEmit`)
- [ ] Vault security tests pass (`pnpm run test:vault:all`)
- [ ] Web build succeeds (`pnpm run build:web`)
- [ ] Demo mode generates valid responses
- [ ] QIUI mock scan returns simulated devices
- [ ] Theme defaults to dark on fresh install

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
