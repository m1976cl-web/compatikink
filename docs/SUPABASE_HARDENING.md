# Supabase Hardening & Security Architecture Specification

Hardening unificado de Supabase para **CompatKink** (P0, 2026-08-07).

**Fuente de verdad:** [`supabase/schema.sql`](../supabase/schema.sql)  
**Bases ya desplegadas:** ejecutar [`supabase/migrations/001_hardening.sql`](../supabase/migrations/001_hardening.sql) (idempotente; alinea con schema).

---

## Principios Zero-Knowledge

1. **Sin plaintext en servidor:** solo blobs `ck1:` (AES-GCM-256).
2. **Tokens CSPRNG:** `initiator_token` e `invite_secret` se generan en cliente con `crypto.getRandomValues` (`lib/utils.ts`, `lib/cryptoVault.ts`).
3. **Código de 6 chars = UX:** la seguridad del canal es el secreto `#k=` / DEK wrap, no el código corto.
4. **Cliente sin SELECT abierto:** no hay `.from('sessions')` en el app; solo RPC con claim (invite code o initiator token).

---

## Defaults canónicos (P0)

| Parámetro | Valor |
|-----------|--------|
| TTL sesión remota (`expires_at`) | **48 horas** al crear |
| Rate limit canje invite | **20** intentos / **15 min** (por código o IP, tabla `invite_attempts`) |
| Rate limit create sesión | **30** / hora por token (`rpc_rate_limits`, bucket `create:…`) |
| Rate limit get por token | **60** / 15 min (`token:…`) |
| Rate limit guest submit | **5** / hora por código (`submit:…`) + un solo `status=waiting→complete` |

Tablas de rate limit:

- `invite_attempts` — log de intentos guest (código + IP + timestamp)
- `rpc_rate_limits` — contadores por bucket (`check_and_increment_rate_limit`)

---

## RPCs (SECURITY DEFINER)

| RPC | Rol |
|-----|-----|
| `create_zk_session` | Insert ciphertext + `expires_at = now()+48h` |
| `get_session_by_invite` | Guest; rate limit + rechaza expiradas |
| `get_session_by_initiator_token` | Iniciador; rate limit por token |
| `submit_guest_ciphertext` | Guest complete; rate limit + expires check |
| `purge_user_session_by_token` | Derecho al olvido por token |
| `purge_expired_sessions` | Limpieza de filas caducadas |

RLS: SELECT solo con `request.compatikink.invite_code` o `initiator_token` vía `set_config` en la misma transacción RPC.

---

## Migración en proyecto existente

1. SQL Editor de Supabase.
2. Pegar y **Run** `supabase/migrations/001_hardening.sql`.
3. Verificar:

```sql
select column_name, column_default
from information_schema.columns
where table_name = 'sessions' and column_name = 'expires_at';

select tablename from pg_tables
where tablename in ('invite_attempts', 'rpc_rate_limits');
```

4. Opcional: `select purge_expired_sessions();`

Proyecto **nuevo:** ejecutar `supabase/schema.sql` completo (incluye lo anterior).

---

## Cliente TypeScript

- `lib/supabase.ts` — solo RPC; `refreshSession(token)` → `getSessionByToken`
- `lib/utils.ts` — `generateToken()` / `generateInviteCode()` con CSPRNG (falla si no hay WebCrypto)
- `lib/storage.ts` — reutiliza utils (sin `Date.now`+`Math.random` para tokens)

---

## Limitaciones honestas

- La IP de guest depende de que el cliente pase `p_client_ip` (hoy el RPC tiene default `0.0.0.0`). Rate limit por IP real robusto = Edge Function o proxy delante de Supabase.
- El código de 6 caracteres sigue siendo enumerable en teoría; el secreto de invite y el rate limit mitigan abuso.
- Tras cambiar SQL en el repo, hay que **re-aplicar** la migración en el proyecto Supabase de producción/staging.
