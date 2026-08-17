# Usabilidad, Diversión y Utilidad

Este documento describe las mejoras planificadas para la app **CompatKink** que buscan:

1. **Mejorar la experiencia de usuario** (onboarding, tema claro, accesibilidad).
2. **Introducir elementos de juego** (badges, ranking, comparador de fotos).
3. **Agregar contenido educativo** (guías de látex, mini‑quizzes).
4. **Facilitar la invitación** mediante deep‑links y QR.
5. **Mantener la seguridad** usando los mecanismos Zero‑Knowledge ya existentes.

---
### 1️⃣ Onboarding Wizard
- Archivo: `components/onboarding/OnboardingWizard.tsx`
- flujo de 3‑4 pasos con animaciones simples.
- Guarda el progreso en `AsyncStorage` para permitir reanudación.
- Al finalizar llama a `createSession` y luego a `schedule3PhaseAftercareProtocol`.

### 2️⃣ Theme Toggle
- Archivo: `components/theme/ThemeToggle.tsx`
- Usa `React.createContext` (`ThemeContext`) para alternar entre **dark** (default) y **light/office**.
- Persiste la preferencia en `AsyncStorage`.

### 3️⃣ Badge System
- Archivo: `components/gamification/BadgeSystem.tsx`
- Define una lista de badges (`BADGES`) con ID, icono SVG y texto.
- Exporta `useBadges` hook que lee/writes en `profileStorage`.

### 4️⃣ Photo Gallery & Comparator
- Archivo: `components/gallery/PhotoUpload.tsx`
- Permite subir foto (max 5 MB, jpg/png) a Supabase Storage bajo `public/gallery/`.
- Al subir, guarda la URL en `customStorage` bajo `toyPhotos`.
- `components/gallery/PhotoComparator.tsx` (no creado aquí) mostrará dos imágenes lado a lado.

### 5️⃣ Deep‑Link Handler
- Archivo: `components/deeplink/DeepLinkHandler.tsx`
- Detecta esquemas `compatikink://join/{code}` y parámetros `k=`.
- Usa `Linking` de React‑Native / `expo-linking` para navegar a `app/invite.tsx`.
- Funciones helper en `lib/deeplink.ts` (`createInviteLink`, `parseInviteLink`).

### 6️⃣ Educación – Latex Guide
- Archivo: `components/education/EduGuide.tsx`
- Renderiza secciones con texto markdown y quizzes interactivos.
- Usa `react-native-webview` para contenido HTML embebido.

### 7️⃣ Notificaciones After‑care Mejoradas
- Ya presente en `lib/localNotifications.ts` con la función `schedule3PhaseAftercareProtocol`.
- Se expondrá desde UI mediante `useAftercare` hook.

### 8️⃣ Personalización de Avatar y Perfil de Intereses
- Extender `profileStorage` con campos `avatarUrl` y `interestTags`.
- UI en `components/profile/ProfileEditor.tsx` (esqueleto).

---
### Integración en la app
- Añadir los componentes al árbol de navegación en `app/_layout.tsx` o en una pantalla de **Settings**.
- Registrar los reducers de Redux/Zustand (`badgeStore`, `galleryStore`).
- Actualizar `data/translations.ts` con claves `onboarding.title`, `badge.*`, `gallery.upload`, `deeplink.instruction`, `edu.latex.title`.

---
### Tests
- `tests/onboarding.test.tsx` – cubre render y paso a paso.
- `tests/badgeSystem.test.tsx` – verifica obtención y persistencia.
- `tests/photoUpload.test.tsx` – mock de Supabase upload.
- `tests/deeplink.test.tsx` – parse y navegación.

---
### Seguridad
- Todas las fotos se suben a Supabase con **policy** que permite solo al propietario leer.
- Los deep‑links solo contienen **código** y **hash** que el backend valida antes de crear la sesión.
- No se guarda ninguna información sensible en el cliente fuera del contenedor ZK.

---
### Roadmap
- Los ítems P3‑1 … P3‑7 fueron añadidos al `ROADMAP.md` para seguimiento.

> **Próximos pasos**: Implementar los componentes y los tests; luego ejecutar `pnpm run test` y `pnpm run build:web`.

---

> 💡 Ver ideas extendidas y complementarias en [`docs/IDEAS_MEJORAS.md`](./IDEAS_MEJORAS.md).

