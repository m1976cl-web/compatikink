# Plan de Refactorización del Dashboard (`app/index.tsx`)

Este documento detalla el plan de refactorización para convertir el Dashboard principal (`app/index.tsx`) en un orquestador ligero de ~150-250 líneas respaldado por **Zustand** y componentes modulares.

> **Estado:** Lote A **completado** en `C:\KC` (checklist abajo).  
> Plan original detallado se ejecutó por fases; el home ya usa `stores/homeStore.ts` y `components/home/*`.

---

## 📋 Checklist de Fases

### Fase A1 — Tienda Zustand & Suscripción a Bóveda
- [x] Crear `stores/homeStore.ts` conteniendo el estado del perfil, lista de perfiles, sesiones locales/remotas, acuerdos de escena y estado de la bóveda.
- [x] Crear `hooks/useVaultSubscription.ts` para suscribir componentes en tiempo real a los eventos de bloqueo/desbloqueo de `VaultLockGateAPI`.
- [x] Mover la carga de datos y mutaciones a la tienda `homeStore`.

### Fase A2 — Extracción de Componentes Modulares (`components/home/`)
- [x] `HeroSection.tsx`: Banner de bienvenida y llamada a la acción.
- [x] `ProfileBar.tsx`: Barra de estado del perfil del usuario y estado de la bóveda.
- [x] `QuickInviteForm.tsx`: Formulario rápido para generar invitaciones.
- [x] `GuestJoinSection.tsx`: Formulario para unirse como invitado con código de 6 caracteres.
- [x] `SessionList.tsx`: Lista de sesiones activas e historial.
- [x] `ModuleGrid.tsx`: Rejilla interactiva de módulos con soporte para badges "🚧 Beta" y filtrado por categoría.
- [x] `HomeActions.tsx`: Botones de acción rápida.

### Fase A3 — Hooks de Negocio & Modales
- [x] `hooks/useQuickInvite.ts`: Manejo de creación y copia de invitaciones.
- [x] `hooks/useBackup.ts` y `components/modals/BackupPassphraseModal.tsx` / `components/BackupPassphraseModal.tsx`: Modal para ingreso seguro de frase de contraseña de backup sin depender de `globalThis.prompt`.

### Fase A4 — Orquestación & Limpieza en `app/index.tsx`
- [x] Reducir `app/index.tsx` a ~180 líneas de orquestación pura.
- [x] Eliminar código muerto e imports no utilizados.

---

## Siguientes pasos (post-refactor)

Ver [`ROADMAP.md`](./ROADMAP.md) y [`docs/IMPROVEMENT_REVIEW.md`](./docs/IMPROVEMENT_REVIEW.md):

1. Feature flags MVP vs Beta  
2. Split de `lib/storage.ts`  
3. Deep links HTTPS  
4. Biometría + PIN 6+  
