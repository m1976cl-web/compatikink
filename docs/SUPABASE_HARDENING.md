# Supabase Hardening & Security Architecture Specification

Este documento especifica la arquitectura de endurecimiento de seguridad (hardening) implementada en Supabase para el proyecto **CompatKink**.

---

## 🛡️ Principios Criptográficos Zero-Knowledge

1. **Sin Plaintext en Servidor:** Supabase nunca recibe ni almacena textos planos, nombres, correos o respuestas de cuestionarios. Únicamente almacena blobs cifrados con el prefijo `ck1:`.
2. **Tokens de Alta Entropía:** Los identificadores de sesión (`initiator_token`, `invite_secret`) se generan mediante generadores de números aleatorios criptográficamente seguros (`CSPRNG` con 256-bit de entropía).
3. **UX vs Seguridad:** El `invite_code` de 6 caracteres es un atajo visual de conveniencia para la UX. La seguridad criptográfica real del canal asimétrico reside en la clave derivada `invite_secret` presente en el fragmento hash de la URL o QR.

---

## 🗄️ Esquema de Base de Datos y Hardening SQL

### 1. Columna de Caducidad (`expires_at`)
Todas las sesiones remotas creadas tienen un tiempo de vida máximo por defecto de **24 horas** (`NOW() + INTERVAL '24 hours'`).

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
```

### 2. Tabla de Rate Limiting (`rpc_rate_limits`)
Control de tasa de peticiones pragmático a nivel de base de datos para prevenir ataques de fuerza bruta sobre códigos de invitación o denegación de servicio.

```sql
CREATE TABLE IF NOT EXISTS rpc_rate_limits (
  bucket TEXT PRIMARY KEY,
  hits INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## ⚡ Funciones RPC Protegidas (SECURITY DEFINER)

### `create_zk_session(...)`
Crea una sesión cifrada remota con caducidad explícita.
- **Límite de tasa:** Máximo 30 creaciones por hora por token iniciador.
- **Parámetros:** `p_initiator_token`, `p_invite_code`, `p_ciphertext`, `p_expires_in_hours` (por defecto 24).

### `get_session_by_invite(...)`
Obtiene la sesión remota cifrada usando el código de 6 caracteres.
- **Validación:** Rechaza automáticamente si `expires_at < NOW()` devolviendo un error explícito.
- **Límite de tasa:** Máximo 30 intentos cada 15 minutos por código de invitación.

### `submit_guest_ciphertext(...)`
Envía las respuestas cifradas del invitado a la sesión.
- **Validación:** Comprueba que la sesión no haya caducado y que su estado sea `pending`.
- **Límite de tasa:** Máximo 5 intentos por código.

---

## 🚀 Guía de Migración para Proyectos Supabase Existentes

Si ya tienes un proyecto de Supabase desplegado y deseas aplicar este hardening:

1. Abre el **SQL Editor** en tu panel de control de Supabase.
2. Abre el archivo [`supabase/migrations/001_hardening.sql`](../supabase/migrations/001_hardening.sql).
3. Copia todo su contenido y ejecútalo (**Run**).
4. El script es **idempotente** (utiliza `IF NOT EXISTS` y `OR REPLACE`), por lo que no destruirá datos ni tablas existentes.
