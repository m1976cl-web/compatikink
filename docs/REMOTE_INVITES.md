# Invitaciones remotas ZK (Supabase)

Proyecto canónico: **`piegesepycvipfzjbraz`**  
URL: `https://piegesepycvipfzjbraz.supabase.co`

## Estado actual

El cliente ya llama a `create_zk_session` / `get_session_by_invite` / `submit_guest_ciphertext`.  
Si el RPC no existe, PostgREST responde `PGRST202` y la app avisa (o cae a sesión local).

Comprobado: en este proyecto **aún no está** `public.create_zk_session`.

## Aplicar schema (una vez)

1. Abre el SQL Editor:  
   https://supabase.com/dashboard/project/piegesepycvipfzjbraz/sql/new
2. Copia **todo** el contenido de [`supabase/schema.sql`](../supabase/schema.sql).
3. **Run**.
4. Verifica:

```sql
select proname
from pg_proc
where proname in (
  'create_zk_session',
  'get_session_by_invite',
  'get_session_by_initiator_token',
  'submit_guest_ciphertext',
  'purge_user_session_by_token',
  'purge_expired_sessions'
)
order by 1;

select column_name
from information_schema.columns
where table_name = 'sessions' and column_name = 'expires_at';
```

Debes ver las 6 funciones y la columna `expires_at`.

Si la base ya tenía una tabla `sessions` antigua, ejecuta también  
[`supabase/migrations/001_hardening.sql`](../supabase/migrations/001_hardening.sql) (idempotente).

## Probar en la app

1. Recarga Pages (ventana privada).
2. Desbloquea bóveda (nick + PIN) si hace falta.
3. Invitación rápida → **Crear código**.
4. Debe abrir `/invite` con código + link que incluye secreto `#k=` / query.
5. En otro navegador/incógnito: abre el link de invitado y responde.
6. Iniciador refresca el reporte (solo ciphertext en servidor).

## Auth / API keys

- Cliente: publishable / anon (`EXPO_PUBLIC_SUPABASE_*`).
- Nunca service_role en Pages.
- Google OAuth es identidad; no sustituye el PIN de bóveda.

## MCP / agentes

El MCP de Supabase del agente puede estar ligado a otra org.  
Para aplicar SQL desde el agente hace falta acceso a la org **m1976cl-web** (re-auth MCP) o pegar el schema a mano en el SQL Editor.
