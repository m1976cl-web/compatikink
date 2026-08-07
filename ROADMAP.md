# CompatKink — Technical Roadmap & Execution Plan

Documento de hoja de ruta y seguimiento de desarrollo técnico para CompatKink.

---

## 🎯 Horizontes de Desarrollo

```
Horizonte 1 (Actual): Mantenibilidad & Hardening Core (Lotes A + C + Tier 1 & 2)
Horizonte 2 (Próximo): Modularización de Storage & Feature Flags MVP
Horizonte 3 (Futuro): Deep Links HTTPS / PWA Native Integration & Biometría
```

---

## 📋 Checklist de Lotes A & C

### Lote A — Refactorización del Dashboard (`PLAN_REFACTOR.md`)
- [x] Instalación e integración de `zustand` en dependencies.
- [x] Creación de `stores/homeStore.ts` y suscripción a `VaultLockGateAPI`.
- [x] Extracción de componentes en `components/home/`:
  - [x] `HeroSection.tsx`
  - [x] `ProfileBar.tsx`
  - [x] `QuickInviteForm.tsx`
  - [x] `GuestJoinSection.tsx`
  - [x] `SessionList.tsx`
  - [x] `ModuleGrid.tsx`
  - [x] `HomeActions.tsx`
- [x] Hooks de negocio: `useQuickInvite.ts`, `useBackup.ts` y modal `BackupPassphraseModal.tsx` sin `globalThis.prompt`.
- [x] Orquestación del Dashboard principal `app/index.tsx` delgado (~180 líneas).

### Lote C — Hardening de Supabase & Tokens
- [x] Tokens de sesión con CSPRNG criptográfico (`crypto.getRandomValues()` / `generateInviteSecret()`).
- [x] Esquema `supabase/schema.sql` y migración `supabase/migrations/001_hardening.sql` con columna `expires_at` (24h).
- [x] RPCs de Supabase (`create_zk_session`, `get_session_by_invite`, `submit_guest_ciphertext`) validando caducidad y rate limits.
- [x] Rate limiting pragmático en RPCs con tabla `rpc_rate_limits`.
- [x] Limpieza de `refreshSession` en `lib/supabase.ts` (sin queries abiertas).

---

## 🔮 Siguiente para Antigravity / Próximos Pasos

1. **Split de `lib/storage.ts`:** División en sub-módulos temáticos (`profileStorage.ts`, `sessionStorage.ts`, `journalStorage.ts`).
2. **Feature Flags MVP-only (Lote D):** Control de visibilidad para laboratorios o módulos experimentales post-core.
3. **Deep Links HTTPS & Web Polish (Lote E):** Asociación de dominios universales (`.well-known/assetlinks.json` y `apple-app-site-association`).
4. **Biometría & PIN 6+ dígitos:** Integración de `expo-local-authentication` para desbloqueo por Huella/FaceID en dispositivos nativos.
