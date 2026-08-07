# Google Antigravity (AGY) — Handoff & Developer Guide

Guía de handoff para desarrolladores y agentes de **Google Antigravity (AGY)** para continuar la evolución y mantenimiento del repositorio **CompatKink**.

---

## 📌 Resumen del Producto (1 Párrafo)

CompatKink es una plataforma móvil y web (Expo 53 / React Native Web) de exploración de compatibilidad íntima asimétrica y cifrado Zero-Knowledge. Permite a parejas catalogar preferencias BDSM, fetichismo, límites y roles sin exponer respuestas no coincidentes a la otra persona ni a servidores centrales. Todo el cifrado ocurre en el cliente (`AES-GCM-256` / `PBKDF2`), garantizando soberanía total de datos y protección anti-coerción (PIN Canario).

---

## 🛠️ Stack Tecnológico & Comandos Clave

- **Framework Core:** Expo 53, React Native Web 0.20, React 19, TypeScript 5.8
- **Estado Global:** Zustand 5.0
- **Base de Datos & Proxy Serverless:** Supabase (PostgreSQL + Edge Functions en Deno)
- **Estilos:** Vanilla StyleSheet / Tokens del tema Noir Íntimo (`constants/theme.ts`)

```bash
# Desarrollo local
pnpm start

# Typecheck estricto TypeScript
pnpm exec tsc --noEmit

# Suite completa de pruebas automatizadas (Vault, i18n, Componentes, Notificaciones)
pnpm run test:vault:all

# Compilación de producción Web PWA
pnpm run build:web
```

---

## 📁 Estructura de Carpetas

```
app/               Rutas y pantallas (Expo Router)
components/        Componentes UI reutilizables
  ├── home/        Componentes del Dashboard (Hero, SessionList, ModuleGrid, etc.)
  └── modals/      Modales de interfaz (Backup, AgeGate, VaultLock, etc.)
data/              Catálogos estáticos e i18n (activities, manualData, translations)
hooks/             Hooks de React (useResponsive, useVaultSubscription, etc.)
lib/               Lógica de negocio, cifrado E2EE, Supabase y utilidades
stores/            Tiendas Zustand (homeStore, etc.)
supabase/          Esquema SQL y Edge Functions Deno
tests/             Suites de prueba unitarias e integración en Node.js
```

---

## 🔒 Archivos Sagrados (No Modificar sin Extrema Cautela)

Los siguientes archivos forman el núcleo criptográfico y de seguridad de la aplicación:

1. **[`lib/cryptoVault.ts`](file:///C:/KC/lib/cryptoVault.ts):** Implementación de la bóveda cliente, derivación de claves PBKDF2 (310k iteraciones), cifrado AES-GCM-256 y PIN Canario.
2. **[`lib/compatibility.ts`](file:///C:/KC/lib/compatibility.ts):** Motor de cálculo asimétrico de coincidencias y resolución de límites duros.
3. **[`supabase/schema.sql`](file:///C:/KC/supabase/schema.sql):** Esquema de base de datos SQL y definiciones de RPCs `SECURITY DEFINER`.

---

## 🎯 Lista de Trabajo Hecho vs Pendiente

### ✅ Trabajo Hecho (Lotes A + C + Tiers 1 y 2)
- Refactorización modular del Dashboard con Zustand (`stores/homeStore.ts` + `components/home/`).
- Hardening de Supabase: `expires_at` (24h), tokens CSPRNG de alta entropía y rate-limiting en RPCs.
- Proxy server-side para IA Gemini vía Supabase Edge Function (`gemini-proxy`).
- Auditoría de pantallas (`data/screenRegistry.ts`): 37 READY, 20 PREVIEW, 4 STUB.
- Suite de 12 pruebas automatizadas unitarias e integración en Node.js.

### 🔮 Trabajo Pendiente para Próximos Sprints (Lotes B, D, E)
- **Lote B:** GitHub Actions CI/CD y tests unitarios profundos de `lib/compatibility.ts`.
- **Lote D:** Feature flags para ocultar módulos experimentales en modo MVP.
- **Lote E:** Asociación de dominios universales HTTPS y PWA Native integration.
- **Refactor Storage:** Dividir `lib/storage.ts` en sub-módulos temáticos.
