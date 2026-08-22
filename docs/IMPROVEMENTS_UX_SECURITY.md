# CompatKink — Mejoras de Usabilidad y Seguridad

**Documento:** Guía de mejoras priorizadas  
**Fecha:** 2026-08-22  
**Propósito:** Referencia para agentes de desarrollo; integrable en CI/CD  
**Estado:** Ready for implementation  

---

## 🔒 **SEGURIDAD** (Prioridades Críticas)

### 1. **Rate Limiting Distribuido (IP + User)**

**Problema:** Rate limit SQL en Supabase no protege contra bots distribuidos.

**Solución:**
- Implementar **Edge Function + Cloudflare Rate Limiting** por IP + tipo de request
- Separar límites: login (10/15m), invite (5/hour), decrypt attempts (3/minute por dispositivo)
- Registrar intentos fallidos en tabla `failed_attempts` para análisis de anomalías

**Archivos a crear/modificar:**
- `lib/rateLimiting.ts` — lógica de rate limit client-side
- `supabase/functions/rate-limit.ts` — Edge Function
- `supabase/migrations/002_access_audit.sql` — tabla `access_audit`

**Código referencia:**
```typescript
// lib/rateLimiting.ts
async function checkRateLimit(key: string, limit: number, window: number) {
  const bucket = await redis.get(`rl:${key}`);
  if (bucket >= limit) throw new RateLimitError();
  await redis.incr(`rl:${key}`);
  await redis.expire(`rl:${key}`, window);
}
```

**Esfuerzo:** 🟢 Bajo (3–5 días)  
**Impacto:** 🔥🔥 Critical  

---

### 2. **Rotación Automática de Session Tokens**

**Problema:** Token de Supabase nunca se renueva; si se filtra, acceso indefinido.

**Solución:**
- Generar nuevo token cada 24h en background
- Usar `expires_at` + refresh token en secure storage
- Invalidar old tokens en servidor

**Archivos a crear/modificar:**
- `lib/supabaseAuth.ts` — token refresh loop
- `supabase/migrations/002_access_audit.sql` — campo `expires_at`

**Código referencia:**
```typescript
// lib/supabaseAuth.ts
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    const session = await refreshSessionToken();
    if (session) updateStoredSession(session);
  }, 23 * 60 * 60 * 1000); // 23h
  return () => clearInterval(refreshInterval);
}, []);
```

**Esfuerzo:** 🟡 Medio (2–3 días)  
**Impacto:** 🔥🔥 Critical  

---

### 3. **Verificación Biométrica para Decrypt (PIN + Huella)**

**Problema:** PIN de 6 dígitos = ~1M combinaciones; vulnerable a shoulder-surfing.

**Solución:**
- PIN mínimo 6 → preferencia de 8-10 caracteres
- Biometría (huella/Face ID) como segundo factor **obligatorio** en dispositivos que la soportan
- Fallback a PIN solo si biometría falla
- Ofuscación visual (vibración + haptic feedback en lugar de clicks)

**Archivos a crear/modificar:**
- `lib/biometrics.ts` — lógica de biometría + fallback
- `components/VaultUnlock.tsx` — UI mejorada

**Código referencia:**
```typescript
// lib/biometrics.ts
async function unlockVault(pin: string): Promise<void> {
  const isBioAvailable = await LocalAuthentication.hasHardwareAsync();
  if (isBioAvailable) {
    const bioPassed = await LocalAuthentication.authenticateAsync({
      reason: "Desbloquea tu bóveda",
      fallbackLabel: "Usar PIN",
    });
    if (!bioPassed) throw new BiometricError();
  }
  // Solo si bio OK (o no disponible), verificar PIN
  await verifyPIN(pin);
}
```

**Esfuerzo:** 🟡 Medio (4–5 días)  
**Impacto:** 🔥🔥 High  

---

### 4. **Panic Wipe con Confirmación Diferida**

**Problema:** Canary PIN borra todo al instante; no hay recuperación si accionas por error.

**Solución:**
- Canary PIN → estado "drip" por 5 segundos (pantalla fake, pero con overlay rojo/negro)
- Swipe up/tap 3x para **cancelar** antes de ejecutar wipe
- Log de intentos fallidos de panic (sin revelar si fue accidental)

**Archivos a crear/modificar:**
- `lib/cryptoVault.ts` — lógica de canary PIN (actualizar)
- `components/PanicWipeConfirm.tsx` — nueva componente
- `lib/anomalyDetection.ts` — log de intentos fallidos

**Código referencia:**
```typescript
// components/PanicWipeConfirm.tsx
const handleCanaryPin = async (pin: string) => {
  if (await verifyCanaryPin(pin)) {
    showFakeBiometricUI();
    let cancelConfirmed = false;
    const timer = setTimeout(async () => {
      if (!cancelConfirmed) await executePanicWipe();
    }, 5000);
    
    onSwipeUp(() => {
      cancelConfirmed = true;
      clearTimeout(timer);
      logAnomalyEvent("canary_pin_cancelled");
    });
  }
};
```

**Esfuerzo:** 🟡 Medio (3–4 días)  
**Impacto:** 🔥 High  

---

### 5. **Encriptación de Backup Local**

**Problema:** Backup en AsyncStorage sin cifrar si el dispositivo está rooteado.

**Solución:**
- Backup siempre con `ck1:` AES-GCM usando master key
- Exportar como `.cbk` (CompatKink Backup) con PBKDF2 derivation del password
- Validar integridad + checksum al restaurar

**Archivos a crear/modificar:**
- `lib/backupManager.ts` — mejorar con cifrado
- `lib/exportPDF.ts` — agregar `.cbk` format

**Código referencia:**
```typescript
// lib/backupManager.ts
export async function createEncryptedBackup(masterKey: CryptoKey, password: string) {
  const backupData = await getFullVaultState();
  const derived = await deriveKeyFromPassword(password);
  const encrypted = await encryptWithAES256(backupData, derived);
  return { version: "1.0", encrypted, timestamp, format: "cbk" };
}
```

**Esfuerzo:** 🟡 Medio (2–3 días)  
**Impacto:** 🔥 High  

---

### 6. **Auditoría de Acceso ZK (Privacy-Preserving Logs)**

**Problema:** No hay registro de quién accedió a qué sesión.

**Solución:**
- Hash de `session_id + timestamp` → almacenar en tabla `access_audit` (sin session_id en plaintext)
- Notificar al usuario si hubo acceso desde IP/dispositivo desconocido
- Mantener log local en vault cifrado

**Archivos a crear/modificar:**
- `supabase/functions/log-access.ts` — Edge Function nueva
- `supabase/migrations/002_access_audit.sql` — tabla `access_audit`
- `lib/privacyAuditor.ts` — cliente-side notification

**Código referencia:**
```typescript
// supabase/functions/log-access.ts
export async function logAccessEvent(sessionId: string, userId: string) {
  const hash = await hashSHA256(`${sessionId}:${Date.now()}`);
  await supabase.from("access_audit").insert({
    hash, user_id: userId, ip_hash: hashIP(request.ip), timestamp: now()
  });
}
```

**Esfuerzo:** 🟡 Medio (2–3 días)  
**Impacto:** 🟢 High (compliance + UX)  

---

## 🎯 **USABILIDAD** (High-ROI)

### 1. **Onboarding Progresivo (3 Pasos Claros)**

**Problema:** Home es abrumadora; usuarios no saben qué hacer primero.

**Solución:**
- Stepper visual en home (Responde → Invita → Lee Reporte)
- Cada step con botón CTA destacado + "Siguiente"
- Progress bar + estimado de tiempo (15 min + 5 min espera invitado)

**Archivos a crear/modificar:**
- `components/home/OnboardingFlow.tsx` — nueva componente
- `stores/homeStore.ts` — track progress

**Código referencia:**
```tsx
// components/home/OnboardingFlow.tsx
<VStack gap="md">
  <StepperUI step={userProgress.step} totalSteps={3} />
  
  {step === 1 && <QuestionnaireCard cta="Comenzar cuestionario" />}
  {step === 2 && <InviteCard cta="Generar código" />}
  {step === 3 && <ReportCard cta="Ver reporte" />}
  
  <ProgressBar value={step / 3} />
</VStack>
```

**Esfuerzo:** 🟢 Bajo (2–3 días)  
**Impacto:** 🔥🔥 Critical (conversion)  

---

### 2. **Express Questionnaire (5-10 min) + Reanudar**

**Problema:** Cuestionario completo = 30+ min; abandono alto.

**Solución:**
- "Express mode" = 20-30 ítems (top 3 categorías)
- Guardar borradores automáticamente cada 5 preguntas
- CTA "Terminar después" → reanudar link con `questionnaire_draft_v1`
- Mostrar progreso: "Pregunta 7 de 25"

**Archivos a crear/modificar:**
- `app/questionnaire.tsx` — agregar modo express + auto-save
- `lib/questionnaireDraft.ts` — mejorar persistencia

**Código referencia:**
```tsx
// app/questionnaire.tsx
const [draft, saveDraft] = useDraftSave({
  autosaveInterval: 5 * 60 * 1000,
  onSave: (progress) => {
    storeCurrentProgress(progress);
    showToast(`Borrador guardado (${progress}%)`);
  },
});

return (
  <>
    <ProgressBar current={currentQuestion} total={totalQuestions} />
    <QuestionCard question={...} onAnswered={saveDraft} />
    <Button.Ghost onPress={() => router.back()}>Terminar después</Button.Ghost>
  </>
);
```

**Esfuerzo:** 🟡 Medio (3–4 días)  
**Impacto:** 🔥🔥 High (completion rate)  

---

### 3. **Deep Links HTTPS Fallback (WhatsApp/SMS Amigable)**

**Problema:** `compatikink://` no funciona en WhatsApp/navegador; usuarios pierden el secreto.

**Solución:**
- Deep link HTTPS: `https://compatikink.app/invite?code=ABC123&k=<secret-in-fragment>`
- Fragment (`#k=`) nunca se envía al servidor (seguro)
- Fallback a universal link si app no instalada → web invite (mismo flujo)

**Archivos a crear/modificar:**
- `lib/linking.ts` — mejorar generación de links
- `supabase/functions/https-invite.ts` — Edge Function para web fallback
- `public/.well-known/assetlinks.json` — actualizar

**Código referencia:**
```typescript
// lib/linking.ts
export const createInviteLink = (code: string, secret: string) => {
  // Web-safe: https://...?code=ABC123#k=SECRET
  // Fragments nunca se envían al servidor
  const webUrl = `https://compatikink.app/invite?code=${code}#k=${secret}`;
  const appUrl = `compatikink://invite/${code}#k=${secret}`;
  
  return { webUrl, appUrl };
};
```

**Esfuerzo:** 🟢 Bajo (2–3 días)  
**Impacto:** 🔥 High (social distribution)  

---

### 4. **Estados de Error Unificados + Recuperación**

**Problema:** Errores genéricos ("Error desconocido"); usuario no sabe qué hacer.

**Solución:**
- Error modal con: mensaje claro + causa + acción (retry, contact support, offline mode)
- Offline-first: cuestionario se completa local, se sincroniza cuando hay conexión
- Rate limit error → mostrar countdown de segundos restantes

**Archivos a crear/modificar:**
- `lib/errorHandler.ts` — nueva o mejorada
- `components/ErrorModal.tsx` — componente unificada
- `lib/offlineSync.ts` — sincronización deferred

**Código referencia:**
```typescript
// lib/errorHandler.ts
export const ERROR_CATALOG = {
  SESSION_EXPIRED: {
    title: "Sesión expirada",
    message: "La invitación caducó (máx. 48h). Pide al iniciador que genere una nueva.",
    action: "Generar nueva invitación",
  },
  RATE_LIMIT: {
    title: "Demasiados intentos",
    message: (retryAfter: number) => `Intenta de nuevo en ${retryAfter}s`,
    action: "Esperar",
  },
  OFFLINE: {
    title: "Sin conexión",
    message: "Puedes responder el cuestionario. Se sincronizará cuando haya conexión.",
    action: "Continuar offline",
  },
};
```

**Esfuerzo:** 🟢 Bajo (2 días)  
**Impacto:** 🟢 Medium (UX polish)  

---

### 5. **Office Mode Reforzado (1-Tap Disguise)**

**Problema:** Modo Office existe pero no es suficientemente rápido ni visual.

**Solución:**
- Botón FAB (Floating Action Button) rojo/negra con ícono universal → **toca para cambiar**
- En 1 tap: UI → Calculadora funcional (historial falso) o Notas
- PIN requerido al salir de modo Office (doble protección)
- Vibración + haptic feedback opcional para confirmar cambio

**Archivos a crear/modificar:**
- `components/PanicButton.tsx` — nueva componente FAB
- `lib/officeMode.ts` — mejorar
- `components/CalculatorDisguise.tsx` — nueva componente fake

**Código referencia:**
```tsx
// components/PanicButton.tsx
<FAB
  icon="calculator"
  color="danger"
  onPress={async () => {
    if (isInOfficeMode) {
      const pinOk = await promptPIN();
      if (!pinOk) return;
    }
    toggleOfficeMode();
  }}
  label="Modo Office"
/>
```

**Esfuerzo:** 🟡 Medio (3–4 días)  
**Impacto:** 🔥 High (peace of mind)  

---

### 6. **Reporte Accionable (Script de 10 min + PDF)**

**Problema:** Reporte solo muestra matches sin contexto; pareja no sabe qué hacer.

**Solución:**
- Sección "10-Minute Conversation Script" con temas guiados
- Propuestas de actividades relacionadas (ej: si match en tie-up, sugerir "Shibari 101")
- Botón "Exportar PDF" con watermark "No compartir" (privacy-aware)
- Ofertar versión anónima para pareja (sin nombres, solo "Pareja A/B")

**Archivos a crear/modificar:**
- `components/report/ConversationScript.tsx` — nueva componente
- `lib/exportPDF.ts` — agregar script section
- `data/conversationGuides.ts` — nuevos datos

**Código referencia:**
```tsx
// components/report/ConversationScript.tsx
<VStack gap="lg">
  <SectionTitle>Conversación sugerida (10 min)</SectionTitle>
  
  <ScriptItem
    time="0-2 min"
    topic="Cuáles fueron tus 3 sorpresas principales?"
  />
  <ScriptItem
    time="2-5 min"
    topic="¿Hay algo que quieras explorar juntos?"
    suggestion="Ver guía: Shibari 101"
  />
  <ScriptItem
    time="5-10 min"
    topic="¿Cuáles son tus límites duros que no querés cruzar?"
  />
  
  <Button.Primary onPress={exportPDF}>
    Exportar como PDF
  </Button.Primary>
</VStack>
```

**Esfuerzo:** 🟡 Medio (3–4 días)  
**Impacto:** 🔥 High (core value)  

---

### 7. **i18n Completo (No Hardcoded Strings)**

**Problema:** Hay `lib/i18n.ts` pero muchas pantallas aún tienen strings hardcodeados (en inglés).

**Solución:**
- Centralizar todos los strings en `data/translations.json` (ES/EN/PT)
- Linter rule que detecte strings en componentes
- Fallback a EN si traducción falta
- Plurales + contexto (`{count, plural, one {# día} other {# días}}`)

**Archivos a crear/modificar:**
- `lib/i18n.ts` — mejorar con plurales + fallback
- `data/translations.json` — centralizar
- `.eslintrc.json` — agregar rule para hardcoded strings

**Código referencia:**
```typescript
// lib/i18n.ts (mejorado)
export const useTranslation = () => {
  const locale = useAppStore((s) => s.locale);
  const t = (key: string, vars?: Record<string, any>) => {
    const translation = TRANSLATIONS[locale]?.[key] || TRANSLATIONS["en"][key];
    return interpolate(translation, vars);
  };
  return { t };
};

// data/translations.json
{
  "es": {
    "invite.code_expires": "Código válido por {hours} horas",
    "report.matches_found": "{count, plural, one {1 coincidencia encontrada} other {# coincidencias encontradas}}"
  }
}
```

**Esfuerzo:** 🟢 Bajo (2–3 días, si parcial)  
**Impacto:** 🟢 Medium (localization)  

---

### 8. **Notificaciones Smart (Opt-in, Timing)**

**Problema:** Sin notificaciones = usuario olvida app; con notificaciones = spam.

**Solución:**
- Notify solo si: invitado respondió, sesión próxima a expirar (24h), aftercare check-in
- Schedule "quiet hours" (ej: 22:00-08:00)
- User control: "Notificaciones silenciosas" (iOS/Android focus modes)

**Archivos a crear/modificar:**
- `lib/localNotifications.ts` — mejorar con templates
- `app/settings.tsx` — agregar quiet hours config

**Código referencia:**
```typescript
// lib/localNotifications.ts
export async function scheduleContextualNotification(
  type: "GUEST_RESPONDED" | "SESSION_EXPIRING" | "AFTERCARE_CHECKIN",
  context: { sessionId: string; partnerName?: string }
) {
  const quietHours = useSettingsStore((s) => s.quietHoursEnabled);
  if (quietHours && isWithinQuietHours()) {
    saveNotificationForBadge(type, context);
    return; // Silencioso
  }
  
  const notification = NOTIFICATION_TEMPLATES[type](context);
  await scheduleNotification(notification);
}
```

**Esfuerzo:** 🟢 Bajo (2 días)  
**Impacto:** 🟢 Medium (retention)  

---

## 📊 **Resumen de Prioridades**

| Mejora | Seguridad | Usabilidad | Esfuerzo | Impacto | Horizonte |
|--------|-----------|-----------|----------|---------|-----------|
| Rate Limiting distribuido | 🔴 Critical | - | 🟢 Bajo | 🔥🔥 | **H1** |
| Token rotation 24h | 🔴 Critical | - | 🟡 Medio | 🔥🔥 | **H1** |
| Biometría + PIN | 🟠 High | 🟠 High | 🟡 Medio | 🔥🔥 | **H2** |
| Panic Wipe diferido | 🟠 High | 🟢 Nice | 🟡 Medio | 🔥 | **H2** |
| Backup cifrado | 🟠 High | 🟢 Nice | 🟡 Medio | 🔥 | **H2** |
| Auditoría ZK | 🟠 High | 🟢 Medium | 🟡 Medio | 🟢 | **H1** |
| **Onboarding 3 pasos** | - | 🔴 Critical | 🟢 Bajo | 🔥🔥 | **H1** |
| **Express Questionnaire** | - | 🟠 High | 🟡 Medio | 🔥🔥 | **H1** |
| HTTPS Deep Links | 🟠 High | 🟢 Nice | 🟢 Bajo | 🔥 | **H1** |
| Error handling | - | 🟠 High | 🟢 Bajo | 🔥 | **H1** |
| Office Mode FAB | 🟠 High | 🟠 High | 🟡 Medio | 🟢 | **H2** |
| Reporte accionable | - | 🟠 High | 🟡 Medio | 🔥 | **H2** |
| i18n completo | - | 🟠 High | 🟢 Bajo | 🟢 | **H2** |
| Notificaciones smart | - | 🟢 Nice | 🟢 Bajo | 🟢 | **H3** |

---

## 🎯 **Horizonte de Implementación**

### **H1 — Core Confiable & Conversión (Semanas 1–4)**
1. Rate Limiting distribuido
2. Token rotation
3. Onboarding 3 pasos
4. Express Questionnaire
5. HTTPS Deep Links
6. Error handling unificado
7. Auditoría ZK

### **H2 — Pareja Excelente (Semanas 5–8)**
1. Biometría + PIN
2. Panic Wipe diferido
3. Backup cifrado
4. Office Mode FAB
5. Reporte accionable + PDF
6. i18n completo (si parcial)

### **H3 — Polish & Retention (Semanas 9+)**
1. Notificaciones smart
2. Integración con Gemini (IA)
3. Análisis de métricas

---

## 🔧 **Checklist para Agentes**

- [ ] Rate Limiting: Edge Function + Redis/Upstash
- [ ] Token Rotation: useEffect + refresh loop
- [ ] Biometría: LocalAuthentication + fallback PIN
- [ ] Panic Wipe: 5s countdown + swipe cancel
- [ ] Backup: `.cbk` format + PBKDF2 derivation
- [ ] Auditoría: `access_audit` table + hash logs
- [ ] Onboarding: Stepper + 3 step progress
- [ ] Express Mode: 20-30 ítems + auto-save
- [ ] HTTPS Links: Fragment-safe URL generation
- [ ] Error Modal: ERROR_CATALOG + offline queue
- [ ] Office Mode: FAB + Calculadora disguise
- [ ] Conversation Script: 10-min template + PDF
- [ ] i18n: No hardcoded strings + linter rule
- [ ] Notifications: Context-aware + quiet hours

---

## 📝 **Referencias Internas**

- `PROJECT.md` — Visión del producto
- `ROADMAP.md` — Checklist operativo
- `docs/THREAT_MODEL.md` — Modelo de amenazas (ZK)
- `docs/SUPABASE_HARDENING.md` — SQL & RPCs
- `IMPROVEMENT_REVIEW.md` — Ideas priorizadas (anterior)
- `ANTIGRAVITY.md` — Handoff agentes
- `AGENTS.md` — Guardrails de desarrollo

---

## 📞 **Feedback & Iteración**

Documento vivo. Si hay:
- Cambios en crypto (PBKDF2, AES-GCM) → actualizar threat model
- Nueva feature flag → registrar en `lib/featureFlags.ts` + roadmap
- Residuales de seguridad → escalar a `docs/THREAT_MODEL.md`
- Métricas de éxito → agregar en `lib/analytics.ts`

**Última actualización:** 2026-08-22  
**Siguientes pasos:** Asignar H1 a sprint; comenzar con Rate Limiting + Onboarding.
