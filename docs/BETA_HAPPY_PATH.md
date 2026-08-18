# Beta usable — happy path (15 minutos)

**Objetivo:** que dos personas (o dos navegadores) completen el core sin pedirle nada al desarrollador.

**URL beta:** https://m1976cl-web.github.io/compatikink/  
**Antes de empezar:** ventana privada (o “Clear site data”) para evitar Service Worker viejo.

## Criterio de “verde”

Si este guion falla, **no** invitamos testers externos.

| # | Paso | Resultado esperado |
|---|------|--------------------|
| 1 | Onboarding 18+ | Llegas al home o a crear perfil |
| 2 | Crear / desbloquear bóveda (PIN ≥ 4) | Home muestra tu nick |
| 3 | Responder (Perfil rápido o cuestionario) | Hay respuestas base en bóveda abierta |
| 4 | Crear invitación | Pantalla `/invite` con código + link |
| 5 | Guest abre el link en otro navegador | Puede responder sin ver tus respuestas |
| 6 | Iniciador abre el reporte | Ve compatibilidad / hard limits |

## Guion detallado

### A — Iniciador (navegador 1)

1. Abre la URL en **ventana privada**.
2. Completa verificación de edad.
3. Crea perfil cifrado (nick + PIN). Anota el PIN.
4. Si el home pide desbloquear: nick + PIN en la barra de perfil.
5. Pulsa **1. Responder** (o “Perfil rápido”) y completa al menos el express.
6. Pulsa **2. Invitar** → apodo del invitado → **Crear código**.
7. Copia el link HTTPS (incluye `#k=` o `?k=`). **No borres** la parte del secreto.

### B — Invitado (navegador 2 / otro dispositivo)

1. Ventana privada.
2. Pega el link completo.
3. Responde el cuestionario de invitado.
4. Confirma envío (“done”).

### C — De vuelta al iniciador

1. En `/invite` o lista de sesiones, abre el reporte.
2. Verifica que aparecen matches / límites (sin que el guest haya visto tus respuestas).

## Fallos frecuentes

| Síntoma | Qué hacer |
|---------|-----------|
| Botón no hace nada | Clear site data; mira si sale un `alert` de error |
| “Sin respuestas” | Desbloquea bóveda y vuelve a responder |
| “Schema ZK” / create_zk_session | Ejecutar `supabase/schema.sql` (ya hecho en prod canónica) |
| Guest no puede abrir | Link incompleto (WhatsApp cortó `#k=`); usa copia manual |
| Pantalla en blanco tras crear perfil | Recarga; onboarding key debe estar `compatikink_onboarding_complete_v1` |

## Fuera de alcance de esta beta

Dating, feed, DMs, media, perfiles tipo FetLife, dominio propio, App Store.

## Registro de pasadas

| Fecha | Quién | Resultado | Notas |
|-------|-------|-----------|-------|
| 2026-08-18 | Antigravity AI + Dev | ✅ EXITOSO (100% Core + P3) | Flujo E2E completo verificado: Onboarding ZK, Cuestionario (Modo Demo/Express), Invitación QR/Link con `#k=`, Flujo de Invitado, Reporte Asimétrico ZK con Radar SVG, Mis Sesiones con Debrief 1-7 y Bag Check, Trofeos XP y Check-in de Aftercare. |
