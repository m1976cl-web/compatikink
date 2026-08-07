# CompatKink — App Móvil y Web de Compatibilidad Íntima Asimétrica

CompatKink es una plataforma web y móvil (Expo 53 / React Native Web) para explorar la compatibilidad de preferencias de forma **privada, asimétrica y con cifrado Zero-Knowledge**:

1. **Iniciador/a:** Responde el cuestionario de compatibilidad y genera un enlace o código de invitación con clave simétrica en su dispositivo.
2. **Invitado/a:** Responde desde su dispositivo con el código de invitación sin ver en ningún momento las respuestas del iniciador.
3. **Reporte Asimétrico:** El iniciador desvela únicamente las coincidencias mutuas deseada ("Matches"), protegiendo los límites y preferencias no compartidas.

---

## 🛡️ Arquitectura de Seguridad Zero-Knowledge (E2EE)

- **Cifrado Cliente:** Toda la información sensible en reposo se cifra localmente con `AES-GCM-256` y derivation `PBKDF2` (310,000 iteraciones).
- **Zero-Knowledge Backend:** El servidor de Supabase almacena exclusivamente cyphertext opaco `ck1:`. Ningún dato legible o plaintext toca servidores remotos.
- **Mecanismos Anti-Coerción:** Incluye sistema de PIN Canario (Decoy PIN) que desbloquea un estado señuelo inofensivo en caso de coacción física.

---

## 📦 Requisitos e Instalación

- **Node.js 20+**
- **pnpm 10** (o npm 10+)
- **Expo Go** en tu dispositivo móvil o navegador web para desarrollo

```bash
# Clonar e instalar dependencias
git clone https://github.com/m1976cl-web/compatikink.git
cd compatikink
pnpm install
```

### Configuración de Supabase (Opcional para sincronización remota)

Si no se configura Supabase, la app funciona en **modo local presencial (Mismo Teléfono)**. Para conectar dos dispositivos remotos:

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ejecuta los scripts `supabase/schema.sql` y `supabase/migrations/001_hardening.sql` en el SQL Editor.
3. Copia tus credenciales en `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🛠️ Comandos Principales

```bash
# Iniciar servidor de desarrollo (Expo / Web)
pnpm start

# Ejecutar typechecking TypeScript
pnpm exec tsc --noEmit

# Ejecutar suite completa de pruebas (Vault, Criptografía, i18n, Componentes)
pnpm run test:vault:all

# Compilar bundle de producción Web PWA
pnpm run build:web
```

---

## 📚 Documentación del Proyecto

- [`PROJECT.md`](./PROJECT.md) — Visión del producto, arquitectura y estado de desarrollo.
- [`ROADMAP.md`](./ROADMAP.md) — Plan de desarrollo de Horizontes 1–3 y checklist de refactorización.
- [`ANTIGRAVITY.md`](./ANTIGRAVITY.md) — Guía de handoff para desarrolladores y agentes IA (convenciones, stack y guardrails).
- [`docs/SUPABASE_HARDENING.md`](./docs/SUPABASE_HARDENING.md) — Hardening de base de datos, RPCs, rate limits y caducidad de sesiones.
- [`PLAN_REFACTOR.md`](./PLAN_REFACTOR.md) — Plan de refactorización del Dashboard y arquitectura Zustand.
