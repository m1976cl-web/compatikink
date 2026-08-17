# PROJECT.md — CompatKink Architecture & Vision

## 1. Visión y Fundamentos del Producto
**CompatKink** es una aplicación progresiva Web / Mobile (Expo 53 / React 19) enfocada en la exploración de compatibilidad íntima y dinámicas BDSM bajo un modelo asimétrico y cifrado Zero-Knowledge.

### Pilares Fundamentales (El Core Inviolable)
1. **Privacidad Asimétrica:** El iniciador/a crea una sesión cifrada; el invitado/a responde de forma ciega sin ver las respuestas del iniciador/a. El sistema calcula únicamente coincidencias mutuas ("Matches") y conflictos de límites duros ("Hard Limits").
2. **Arquitectura Zero-Knowledge Real:** Todo cifrado y derivación de clave ocurren exclusivamente en el cliente (`PBKDF2-SHA-256` con 310,000 iteraciones + `AES-GCM-256`).
3. **PIN Canario (Decoy PIN):** Protección anti-coerción que desbloquea una bóveda señuelo inofensiva bajo coacción física o intrusión.
4. **Soberanía de Datos:** Eliminación total instantánea ("Right to Be Forgotten") conforme a GDPR Art. 9 y Ley N° 21.719.

---

## 2. Jerarquía de Funcionalidades (Core vs Post-Core)

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PRINCIPAL (v1 - v2)                 │
│  Cuestionario Asimétrico · Bóveda ZK · Reportes · Aftercare  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   POST-CORE / EXPANSIONES (v3+)             │
│   Suite Social (Events, Dating, Feed) · AI Roleplay Sandbox │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Estado de Hitos de Desarrollo

| Hito / Lote | Descripción | Estado |
|---|---|---|
| **Lote A — Refactor Home** | Módulo `stores/homeStore.ts`, componentes `components/home/`, desmonolitización de `index.tsx` | `DONE` ✅ |
| **Lote C — Hardening Supabase** | Tokens CSPRNG de alta entropía, `expires_at`, rate-limiting RPC, limpieza de `refreshSession` | `DONE` ✅ |
| **Lote B — CI/CD & Tests** | GitHub Actions (`ci.yml`, `audit.yml`) y suites de prueba integradas | `DONE` ✅ |
| **Tier 1 — Proxy IA & Audit** | Edge Function Gemini, clasificación Screen Registry, analytics Plausible | `DONE` ✅ |
| **Tier 2 — Modo Office & Aftercare** | Tema Claro / Excel Disguise, Protocolo Aftercare 3 fases, Deep Links QR, i18n Actividades | `DONE` ✅ |
| **Expansión P0-P2** | 36 Preguntas intimidad, 42 Ruleta, 31 Actos diarios, 15 Rituales, 161 Actividades, 85 Glosario | `DONE` ✅ |
| **UX & Nuevos Módulos** | Radar Chart SVG, Gear Closet con fotos/wishlist, Guía de Látex (`/latex-guide`) | `DONE` ✅ |
| **Docs handoff Antigravity** | `AGENTS.md`, `ANTIGRAVITY_PROMPT.md`, `docs/IMPROVEMENT_REVIEW.md`, roadmap alineado | `DONE` ✅ |
