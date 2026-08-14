# Perfil público vs bóveda (diseño post-core)

**Fecha:** 2026-08-13  
**Principio:** Google / Auth = identidad. PIN = DEK. Servidor = solo ciphertext (`ck1:`) para preferencias.

FetLife-like (descubrimiento social) y el core ZK pueden coexistir **solo si no se mezclan capas**.

## Dos caras del usuario

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  PUBLIC PROFILE (opt-in)    │     │  VAULT (siempre local+PIN)  │
│  nick, avatar, bio, rol     │     │  baseResponses, limits      │
│  badges, protocolos, loco.  │     │  notes, session ids         │
│  “Invitar a comparar” CTA   │     │  secretsCipher / pin meta    │
└──────────────┬──────────────┘     └──────────────┬──────────────┘
               │                                   │
               │  compare invite                   │ seal / open
               ▼                                   ▼
        create_zk_session RPC              AsyncStorage ck1:
        (ciphertext only)                  DEK from PIN
```

## Mapeo desde `UserProfile` actual

| Campo hoy | Capa |
|-----------|------|
| `nickname`, `role`, `safetyProtocols`, `fetishBadges`, `location`, `avatarUrl`, `bio` | Público (sync opt-in) |
| `pronouns`, `experienceLevel`, `verificationBadges`, `fetlifeHandle` | Público opcional |
| `baseResponses`, `notes`, `hardLimits`, `softLimits`, `safewords` | Bóveda |
| `pinSalt`, `pinVerifier`, `secretsCipher`, `duressMeta`, `autoLockTimeout` | Bóveda local only |
| `supabaseUserId` | Auth bridge (nunca es clave de cifrado) |
| `createdSessionIds`, `receivedSessionIds` | Índice bóveda / local |

Hoy `sealProfileSecrets` ya separa meta pública vs secrets; el siguiente paso de producto es **tabla remota solo para el slice público**.

## Schema propuesto (futuro — no aplicar aún sin tracción)

```sql
-- Pseudocódigo de diseño; no es migración activa.
create table public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  avatar_path text,
  bio text,
  role text,
  safety_protocols text[],
  badges jsonb default '[]',
  location_label text,           -- opaco / ciudad, no GPS
  discoverable boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public_profiles enable row level security;
-- SELECT: discoverable = true OR auth.uid() = user_id
-- INSERT/UPDATE: auth.uid() = user_id
```

**Nunca** columnas de respuestas / hard limits / ciphertext de cuestionario en esta tabla.

## Flujos sociales (H3) sin romper ZK

### 1. Invitar a comparar (prioridad)

- Desde perfil público → genera invite ZK existente (`create_zk_session` + link `#k=` / `?k=`).
- No es un “match score” servidor: es el core asimétrico ya construido.

### 2. Mensajes entre usuarios

- Solo tras vínculo / consentimiento (p.ej. tras compare o request aceptado).
- Tabla `messages`: `id`, `thread_id`, `sender_id`, `ciphertext`, `created_at`.
- Claves de hilo wrappeadas con material derivado de ambos usuarios (E2E); servidor no descifra.
- Rate limits + bloqueo / report 18+.

### 3. Fotos / vídeos

- Supabase Storage buckets privados.
- Objeto cifrado en cliente **o** URL firmada + media key wrappeada al destinatario.
- Share links con secreto (mismo patrón que invite `#k=`).
- Moderación: age gate, report, política CSAM, sin feed público de media en MVP social.

## Feature flags

- `EXPO_PUBLIC_MVP=1` (hoy): oculta suite social.
- Futuro: `EXPO_PUBLIC_SOCIAL=1` activa perfiles públicos / DM / media **después** del core estable.

## Orden de implementación

1. Core + dominio (`docs/BRAND_AND_DEPLOY.md`)  
2. `public_profiles` mínimo + pantalla “Mi perfil público”  
3. CTA “Invitar a comparar” → flujo invite actual  
4. DM E2E entre vínculos  
5. Media cifrada + políticas  
6. Quitar demos dating/feed o marcarlos Demo local  

No expandir dating/feed/AI en el core.
