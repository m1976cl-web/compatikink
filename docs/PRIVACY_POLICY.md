# CompatKink — Política de Privacidad & Tratamiento de Datos Sensibles

**Última actualización:** Agosto de 2026  
**Ámbito Legal:** Cumplimiento de la Ley N° 21.719 (Chile) y Reglamento General de Protección de Datos (GDPR Art. 9).

---

## 1. Naturaleza de los Datos Procesados

CompatKink es una plataforma de evaluación de compatibilidad y comunicación privada para personas adultas. Para entregar sus servicios, la aplicación procesa **datos de categoría especial** (preferencias íntimas, prácticas BDSM, safewords y límites de consentimiento).

### Principio de Cero-Conocimiento (Zero-Knowledge):
- **Cifrado en Cliente**: Todos tus datos sensibles se cifran en tu propio dispositivo utilizando el algoritmo `AES-GCM-256` con claves derivadas mediante `PBKDF2-SHA-256` (100.000 iteraciones).
- **Servidor Ciego**: La infraestructura de backend (Supabase) almacena únicamente textos cifrados de alta entropía (`ck1:...`). Ni los administradores ni terceros pueden leer tus respuestas o perfiles.

---

## 2. Base Legal del Tratamiento

El tratamiento de tus datos de categoría especial se basa exclusivamente en tu **consentimiento explícito e informado** (GDPR Art. 9(2)(a) y Ley N° 21.719 Art. 12). Al utilizar CompatKink y completar tu cuestionario o perfil:
- Otorgas consentimiento para el almacenamiento cifrado local y el intercambio asimétrico mediante invitaciones con secreto derivado en fragmento de URL (`#k=`).
- Puedes revocar este consentimiento en cualquier momento ejecutando el borrado de datos.

---

## 3. Tus Derechos (ARCO y Derecho al Olvido P0.4)

Tienes derecho a:
1. **Acceso y Exportación**: Descargar una copia cifrada completa de tu bóveda local en formato JSON (`AES-GCM-256`).
2. **Rectificación**: Modificar o eliminar tus respuestas y perfil en cualquier momento desde la app.
3. **Derecho al Olvido (Borrado Permanente)**:
   - Puedes activar el botón **"Eliminar todos mis datos de este dispositivo y servidor"** desde la configuración de la app o la pantalla de Privacidad.
   - Esta acción elimina de forma irreversible las claves locales, la base de datos de almacenamiento (`AsyncStorage`) y ejecuta la instrucción `purge_user_session_by_token` en Supabase.

---

## 4. Retención de Datos y Expiración

- **Sesiones e Invitaciones**: Las sesiones de invitación expiran automáticamente tras **48 horas** de su creación.
- **Códigos de Canje**: Invalidación automática al primer uso exitoso.
- **Rate-Limiting**: Bloqueo temporal de 15 minutos ante 5 intentos fallidos consecutuivos.

---

## 5. Verificación de Mayoría de Edad (18+)

El uso de CompatKink está estrictamente restringido a personas de **18 años o más**. La aplicación exige una confirmación activa de fecha de nacimiento y aceptación explícita antes de permitir la creación de cualquier perfil o cuestionario.
