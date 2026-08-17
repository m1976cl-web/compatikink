# IDEAS — Complemento al Plan de Usabilidad y Diversión

> **Estado:** Ideas activas para complementar el plan en `docs/USABILITY_IMPROVEMENTS.md`.  
> Mantener este archivo como fuente de inspiración para agentes y colaboradores.  
> Priorizar siempre el **core de compatibilidad** antes de implementar capas sociales o de IA.

---

## 🎮 Experiencia de Juego (Gamificación Profunda)

### G1 — Rachas (Streaks) de Uso ✅ [COMPLETADO]
- Contador de días consecutivos de actividad y conexión.
- Llama visual animada con estados progresivos (`🌱`, `🔥`, `⚡🔥`, `🌟🔥`, `💜🔥`, `👑🔥`, `✨🔥👑`).
- Widget con visualización de los últimos 7 días e insignias por hitos a los 7, 30 y 100 días integradas en el sistema de logros.
- Implementado en `lib/streaks.ts` y componentes `StreakBadgeWidget.tsx`.

### G2 — Modo Reto de Pareja (Partner Challenge)
- Desde el reporte de compatibilidad, proponer un "Reto de la Semana" generado automáticamente según los matches.
- Ambos deben confirmar haberlo completado para ganar XP.
- Enlazar con el sistema de XP existente en `lib/partnerJournal.ts` (`addXpToPartnerLink`).

### G3 — Tabla de Clasificación Anonimizada
- Ranking global opt-in (solo nickname público) por: # sesiones, # logros, XP total.
- Vista en `app/achievements.tsx` como pestaña extra "Ranking".
- Datos agregados en Supabase con RLS estricto; nunca exponer contenido de sesiones.

### G4 — Desafíos Diarios ✅ [COMPLETADO]
- Un reto pequeño nuevo cada día (ej. "Agrega un juguete a tu Gear Closet", "Lee una guía educativa", "Audita tus hard limits", "Aprende el término del día").
- Datos en `data/dailyChallenges.ts` con ciclo de 31 retos clasificados en 5 categorías (Educación, Exploración, Comunicación, Seguridad & Consent, Gear & Deseos) con recompensas de XP (+50 a +100 XP).
- Gestión en `lib/dailyChallenges.ts` con persistencia ZK, otorgamiento de XP al vínculo de pareja y mantenimiento de racha diaria.
- Componente `components/gamification/DailyChallengeCard.tsx` integrado en el dashboard principal con microinteracciones y hápticos.
- Notificación recordatoria configurable vía `lib/localNotifications.ts`.

### G5 — Sala de Trofeos (Trophy Room)
- Pantalla visual con todos los logros desbloqueados en formato galería.
- Trofeos con animación de "brillo" al desbloquear por primera vez.
- Compartir logro como imagen (sin contenido sensible) via `Share API`.

---

## 🤝 Social Ligero (Sin Infraestructura Compleja)

### S1 — Cards de Compatibilidad Compartibles
- Al finalizar el reporte, generar una **tarjeta de imagen** (Canvas/SVG) con solo el score general y los emojis de las categorías.
- Sin nombres ni datos sensibles. Solo "Compatibilidad: 87% 🔥".
- Compartir por WhatsApp, Telegram, etc. vía `Share API`.

### S2 — Modo "Abre-hielos" (Icebreaker)
- Sección con preguntas de conversación generadas según el reporte.
- Visible solo para el iniciador. Ayuda a estructurar la primera conversación post-test.
- Datos en `data/icebreakerQuestions.ts`, lógica en `lib/compatibility.ts`.

### S3 — Foro de Buenas Prácticas (Preview)
- Pantalla `app/communities.tsx` (ya existente) mejorada con hilos temáticos.
- Contenido curado por el equipo inicialmente (no UGC).
- Títulos de hilos: "Mi primera vez con límites", "Aftercare que funcionó", etc.

### S4 — Modo Pasar y Jugar (Pass and Play) ✅ [COMPLETADO]
- La pantalla `app/pass-and-play.tsx` se convierte en un modo donde dos personas usan el **mismo dispositivo** alternativamente con cortina de privacidad.
- Sin necesidad de dos cuentas ni invitación. Ideal para primeras exploraciones presenciales.
- Datos locales cifrados con DEK del dispositivo y generación inmediata del reporte.

### S5 — Widget de "Compatibilidad del Día"
- Para iOS 17+ / Android: un widget pequeño que muestre un consejo diario basado en el último reporte.
- Implementar con `expo-widgets` (experimental) o como Web App Widget si no está disponible.

---

## 📚 Contenido Educativo

### E1 — Biblioteca de Artículos
- Colección de artículos cortos (500-800 palabras) sobre: consentimiento, negociación, aftercare, seguridad física, salud mental.
- Datos en `data/articles.ts` con campos: `id, title, category, body, readTimeMin, tags[]`.
- UI en nueva pantalla `app/library.tsx` con búsqueda y filtros por categoría.

### E2 — Guías de Técnicas Específicas (Shibari, Cuero, Cera)
- Expandir la guía de Látex (`app/latex-guide.tsx`) con un framework reutilizable.
- `components/education/TechniqueGuide.tsx` con pasos numerados, imágenes y advertencias de seguridad.
- Datos en `data/techniqueGuides.ts`.

### E3 — Glosario Interactivo ✅ [COMPLETADO]
- La pantalla `app/glossary.tsx` cuenta con búsqueda en tiempo real, favoritos/bookmarks ZK persistentes y "Término del Día" con destacados.
- Al tocar un término, despliega definición extendida, consejos de seguridad/anatomía y términos relacionados interactivos.
- Mini-Quiz de 3 preguntas integrado directamente para poner a prueba el aprendizaje.

### E4 — Tests de Conocimiento (Quiz Mode)
- Quiz de 5 preguntas sobre BDSM, seguridad y consentimiento.
- Al completar, se desbloquea badge "Educado/a".
- Datos en `data/quizQuestions.ts`. Implementar en `app/quiz.tsx`.

### E5 — Selector de "Guía Personalizada" por Rol
- Al entrar por primera vez como Dom/Sub/Switch, la app muestra una guía inicial adaptada a su rol.
- Usa el campo `role` de `profileStorage`.
- UI en `OnboardingWizard` como último paso opcional.

---

## 🔐 Privacidad y Seguridad (UX)

### P1 — Indicador de Nivel de Privacidad
- Barra visual en la pantalla de perfil que muestre cuántos datos están cifrados vs. en texto plano.
- Ej: "🔐 94% de tus datos están protegidos en la Bóveda".
- Calculado desde `backupStorage` y `profileStorage`.

### P2 — Modo Privado Instantáneo (Panic Button en UI)
- Botón flotante (FAB) configurable que lleva a una pantalla neutra (ej. calculadora o notas) en 1 tap.
- Más accesible que el PIN canario actual (que es un flujo largo).
- Implementar como overlay en `app/_layout.tsx`.

### P3 — Auditoría de Sesiones
- En el perfil, lista de "últimas sesiones" con fecha, duración y estado (completada/expirada).
- Sin revelar contenido. Solo metadatos locales desde `sessionStorage`.
- UI en `app/profile.tsx` o nueva `app/session-history.tsx`.

### P4 — Control de Expiración Configurable
- Permitir al usuario elegir el TTL de la sesión (24h, 48h, 7 días) al crear la invitación.
- La UI actual tiene 48h hardcodeado. Hacer configurable en `app/invite.tsx`.

### P5 — Sistema de Denuncias y Bloqueo Mutuo (Trust & Safety / Bidirectional Block) ✅ [COMPLETADO]
- **Objetivo:** Salvaguardar la seguridad, el consentimiento estricto y la privacidad de la comunidad ante conductas inapropiadas o acoso.
- **Mecánica de Bloqueo Mutuo Bidireccional (Mutual Block):**
  - Al bloquear a un usuario (Usuario B bloqueado por Usuario A):
    1. **Ocultamiento Total de Perfil:** B no puede ver el perfil público ni la actividad de A (recibe estado neutro o 404). A tampoco ve el perfil de B.
    2. **Inhabilitación Recíproca de Mensajes:** Se bloquea el canal de DMs en ambas direcciones. Ninguno puede enviar ni recibir mensajes.
    3. **Ocultamiento en Feed y Comentarios:** Todos los posteos, encuestas y comentarios de A y B se filtran mutuamente en el feed comunitario.
    4. **Inhabilitación de Sesiones ZK:** Ninguno puede invitar al otro ni aceptar sesiones asimétricas conjuntas.
- **Mecánica de Denuncias (Reporting System):**
  - Botón de denuncia contextual accesible en: perfil de usuario, tarjeta de posteo en feed, y burbuja de mensaje directo.
  - Tipificación de motivos: *Acoso / Hostigamiento*, *Violación de Límites / No-Consent*, *Menores de 18 Años (Tolerancia Cero)*, *Spam / Fraude*, *Suplantación de Identidad*.
  - Cola de moderación en `app/admin-dashboard.tsx` con almacenamiento anonimizado/cifrado en Supabase (`moderation_reports`) protegiendo los datos Zero-Knowledge del denunciante.

---

## 🎨 UI/UX Avanzada

### U1 — Animaciones de Transición de Pantalla
- Transiciones personalizadas entre pantallas usando `react-native-reanimated`.
- Estilo slide-up para modales, fade para reportes, scale para badges.

### U2 — Haptic Feedback ✅ [COMPLETADO]
- Vibración multi-nivel suave y adaptativa: selección (`selection`), impacto (`light`/`medium`/`heavy`), y notificaciones (`success`/`warning`/`error`).
- Integrado en respuestas de cuestionario, ruleta kink, desbloqueo de insignias, pestañas y botones de selección.
- Fallback web (`navigator.vibrate`) y preferencia configurable (`setHapticsEnabled`).

### U3 — Modo Accesibilidad
- Tamaños de fuente ajustables (S/M/L/XL) persistidos en `profileStorage`.
- Alto contraste automático al seleccionar tema claro.
- Compatible con VoiceOver / TalkBack (etiquetas `accessibilityLabel` en todos los botones).

### U4 — Barra de Progreso del Cuestionario Mejorada ✅ [COMPLETADO]
- Progreso visual con animación fluida + texto "Pregunta X de Y" + tiempo estimado restante.
- Indicar categoría actual (Roles, Limites, Experiencias...) con badge e insignia de color temático distintivo.

### U5 — Microinteracciones de Feedback ✅ [COMPLETADO]
- Al responder cada pregunta: animación de rebote táctil en RatingPicker + checkmark activo.
- Al generar reporte: pantalla de análisis animada (`ReportAnalysisLoader`) con fases ZK y cálculo de compatibilidad en tiempo real.
- Micro-animaciones en componentes clave.

### U6 — Pantalla de Inicio Personalizada
- El home muestra: nombre del usuario, racha actual, último logro, reporte reciente.
- Módulo "¿Qué quieres explorar hoy?" con 3 sugerencias aleatorias basadas en historial.

---

## 🤖 IA (Post-Core, Solo con Tracción)

> ⚠️ Implementar SOLO después de que el core de compatibilidad tenga usuarios activos.

### AI1 — Resumen del Reporte en Lenguaje Natural
- GPT/Gemini genera un párrafo descriptivo del reporte de compatibilidad.
- Texto en primera persona: "Tienen alta afinidad en X pero deberían conversar sobre Y...".
- Cero datos sensibles enviados a la API; solo scores y categorías.

### AI2 — Sugerencia de Próximos Pasos
- IA genera 3 actividades concretas para explorar según el reporte.
- Datos: solo scores de categorías + wishlist de la Gear Closet (si el usuario da permiso).

### AI3 — Asistente de Negociación
- La pantalla `app/negotiation.tsx` (ya existe) mejorada con flujo guiado por IA.
- IA propone puntos de agenda de negociación basados en el reporte.

### AI4 — Roleplay AI con Contexto de Compatibilidad
- La pantalla `app/ai-roleplay.tsx` (ya existe) mejorada para usar el reporte como contexto.
- El personaje Nox puede referenciar los intereses detectados.

---

## 📊 Métricas y Analytics (Internos)

### M1 — Panel de Admin Mejorado
- La pantalla `app/admin-dashboard.tsx` (ya existe) con:
  - Sesiones creadas por día (sin contenido, solo conteo).
  - Usuarios activos por semana.
  - Pantallas más visitadas.
- Datos agregados y anónimos desde Supabase.

### M2 — Heatmap de Compatibilidad
- Visualización de qué categorías tienen más matches globalmente (datos anonimizados).
- "Esta semana, el 78% de las parejas tienen alta compatibilidad en Roles".

---

## 🌐 Internacionalización

### I1 — Soporte para Francés y Alemán
- Después de ES/EN/PT, añadir FR y DE como idiomas secundarios.
- Estructura ya lista en `data/translations.ts`.

### I2 — Selector de Idioma en Onboarding
- Al abrir la app por primera vez, pantalla de selección de idioma antes del wizard.
- Persiste en `profileStorage.language`.

### I3 — Traducción Automática del Glosario
- Glosario disponible en el idioma seleccionado.
- Datos en `data/glossaryData.ts` ampliados con campo `translations: {es, en, pt, fr}`.

---

## 🔗 Integración Externa

### X1 — Exportar Reporte como PDF
- Al finalizar el reporte, opción de exportar como PDF cifrado (sin datos sensibles, solo scores y guión de conversación).
- Usar `react-native-html-to-pdf` o generar en el cliente.

### X2 — Calendario de Citas/Eventos
- Integración con Google Calendar / Apple Calendar para agendar "momentos de conexión".
- Al completar un reto de pareja, opción de agendar el próximo.
- Usar `expo-calendar`.

### X3 — Compartir Wishlist de Gear Closet
- Generar link único (de solo lectura, expirable) para compartir la wishlist de juguetes.
- El link muestra solo nombre e imagen; nunca precios ni datos del usuario.

---

## 🏗️ Deuda Técnica y Mejoras de Arquitectura

### T1 — Pasada E2E Documentada
- Completar `docs/BETA_HAPPY_PATH.md` con capturas de pantalla reales.
- Registrar bugs encontrados en `docs/KNOWN_ISSUES.md`.

### T2 — Pruebas E2E Automatizadas
- Implementar con `Detox` (nativo) o `Playwright` (web).
- Cubrir el flujo: onboarding → cuestionario → invitación → reporte.

### T3 — Storybook de Componentes
- `components/` documentados en Storybook Web.
- Permite que diseñadores revisen componentes sin levantar la app completa.

### T4 — Monitoreo de Errores
- Integrar `Sentry` con `@sentry/react-native`.
- Configurar para **no** capturar ningún dato de sesión o reporte (solo stack traces).

---

## 📋 Priorización Sugerida

| ID | Mejora | Esfuerzo | Impacto | Prioridad |
|----|--------|----------|---------|-----------|
| U4 | Barra de progreso cuestionario | Bajo | Alto | ✅ Completado |
| U5 | Microinteracciones feedback | Bajo | Alto | ✅ Completado |
| S4 | Modo Pasar y Jugar | Medio | Alto | ✅ Completado |
| E3 | Glosario interactivo | Bajo | Medio | ✅ Completado |
| G1 | Rachas de uso | Medio | Alto | ✅ Completado |
| G4 | Desafíos diarios | Medio | Medio | ✅ Completado |
| S1 | Cards compartibles | Medio | Alto | 🟡 Media |
| P2 | Botón pánico FAB | Bajo | Alto | 🟡 Media |
| P5 | Denuncias y Bloqueo Mutuo | Medio | Muy Alto | ✅ Completado |
| U2 | Haptic feedback | Bajo | Medio | ✅ Completado |
| E1 | Biblioteca de artículos | Alto | Medio | 🟢 Baja |
| G3 | Tabla de clasificación | Alto | Medio | 🟢 Baja |
| T2 | Pruebas E2E automatizadas | Alto | Alto | 🟢 Baja |
| AI1-4 | Suite IA | Muy Alto | Alto | ⚫ Post-core |
| S3 | Foro comunidades | Muy Alto | Medio | ⚫ Post-core |

---

> **Nota para agentes:** Al implementar cualquier item de este documento, mover el item a `ROADMAP.md` con su estado (`[ ]` → `[/]` → `[x]`) y actualizarlo aquí con `✅` cuando esté completo.
