# Cloud y local — flujo dual

CompatKink se desarrolla **a la vez** en Cursor Cloud Agents y en este PC. El disco local es backup; GitHub es la fuente de verdad.

Cursor Cloud **no abre el disco de Windows**. Un Cloud Agent clona [`m1976cl-web/compatikink`](https://github.com/m1976cl-web/compatikink) en una VM Ubuntu, trabaja ahí y publica el resultado en GitHub. Este PC se sincroniza después con [`scripts/sync-local.ps1`](../scripts/sync-local.ps1).

Cursor Web ([cursor.com/agents](https://cursor.com/agents)) no es un VS Code completo en el navegador. Es el panel para lanzar y ver Cloud Agents, más escritorio remoto de esa VM. El editor “de verdad” sigue siendo Cursor Desktop o el takeover de la VM.

## Fuente de verdad

- Repo: [`https://github.com/m1976cl-web/compatikink`](https://github.com/m1976cl-web/compatikink)
- Rama: `main`
- No force-push a `main`. No `--force` ni history rewrite sin petición explícita.

## Una vez: GitHub, entorno y secretos (humano)

OAuth y secretos del dashboard **no** se pueden terminar desde un agente. Clics restantes:

1. Plan de Cursor de pago (Cloud Agents no van en el plan gratis).
2. GitHub: [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations) → **Connect** y dar acceso a `m1976cl-web/compatikink`.
3. Entorno: [cursor.com/dashboard/cloud-agents#environments](https://cursor.com/dashboard/cloud-agents#environments) → repo `compatikink`, rama base `main`. El repo ya trae [`.cursor/environment.json`](../.cursor/environment.json) (`install` = `pnpm install`; terminal Expo = `pnpm start` en 8081).
4. Secretos en [cursor.com/dashboard/cloud-agents](https://cursor.com/dashboard/cloud-agents) (el `.env` local **no** viaja a la nube). Nombres:

   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_MVP`

   Valores: los mismos que en `.env` local / `.env.example`. **No** pegar la anon key en el repo ni en un chat. Tras añadir secretos, reinicia el agente o dispara un Build.

El Client Secret de Google **no** va a Cursor Secrets; sigue en el dashboard de Supabase (`docs/GOOGLE_AUTH.md`).

## Arrancar un Cloud Agent (cada tarea)

No lances un Cloud Agent recursivo desde otro Cloud Agent. Tú lanzas la tarea:

**Desde el navegador:** [cursor.com/agents](https://cursor.com/agents) → elige el repo `compatikink` / rama `main` → pega el prompt de abajo → envía.

**Desde Cursor Desktop:** en el input del agente, cambia el dropdown de ubicación a **Cloud** (o `Ctrl+Shift+P` → **Open Agents Window**). **Move to Cloud** solo manda el contexto del chat, no los archivos sin commitear.

Antes de lanzar, empuja a GitHub lo que el agente deba ver:

```powershell
git status
git add ...
git commit ...
git push origin main
```

Cambios locales sin push son invisibles para la VM.

### Prompt para pegar

```
Trabaja desde la raíz del repo GitHub m1976cl-web/compatikink. Sigue AGENTS.md y docs/CLOUD_AND_LOCAL.md. No commitees .env. No force-push a main. Core first; no expandas dating/AI. Si main divergió, para y avisa.
```

## Cómo vuelve el código a este PC

Por defecto Cursor crea una rama `cursor/...` y un PR (más seguro). La convención de este repo pide push a `main` **sin** force-push. Puedes:

- Dejar que abra PR y mergear tú, o
- Decirle explícitamente: “commit y push a `main`, sin force-push; si `main` divergió, para y avisa”.

Luego en Windows, desde la raíz del clone (el script no usa una ruta fija):

```powershell
.\scripts\sync-local.ps1
```

Eso hace `git fetch` + `git pull --ff-only`. No auto-commitea. Si local y remoto divergieron, se niega: no hagas force-push.

El `.env` de este PC no lo rellenan los secretos de Cursor; si hace falta, cópialo otra vez desde [`.env.example`](../.env.example).

## Agentes en la nube (Cursor Cloud)

1. Clonan GitHub (no el disco de este PC). Trabajan en Linux, desde la **raíz del repo**, no `C:\KC\...`.
2. Trabajan, commitean y hacen **push** a `main` (o abren PR).
3. Nunca force-push. Si `main` divergió: parar y avisar.
4. Variables: secretos del dashboard (arriba). En un clone fresco también se puede copiar `.env.example` → `.env` (gitignored). `EXPO_PUBLIC_MVP=1` para el core; `=0` para Fetish Labs / leisure. La anon key **no** va al repo: GitHub Actions secrets para CI/Pages, Cursor Secrets para Cloud Agents.
5. MCP locales de Desktop no existen en la VM; los de Cloud se configuran en el dashboard de agentes.

## Este PC (backup local)

Ruta típica del checkout: `C:\KC\compatikink` (si `git rev-parse --show-toplevel` muestra otra carpeta, p. ej. `C:\KC\compatikink-1`, esa es la raíz real del clone). El script `scripts/sync-local.ps1` usa la raíz del repo, no una ruta fija.

**Antes de trabajar en local:**

```powershell
cd C:\KC\compatikink
.\scripts\sync-local.ps1
```

El script hace `git fetch`, muestra `git status`, y `git pull --ff-only`. **No auto-commitea.** Si hay conflictos o historial divergente, se niega y te dice qué hacer.

Equivalente manual: `git pull --ff-only`.

**Después de trabajar en local:** commit + `git push origin main` para que Cloud Agents vean el cambio.

## Cómo recuperar

| Qué se perdió | Qué hacer |
|---------------|-----------|
| Disco local (este PC) | `git clone https://github.com/m1976cl-web/compatikink.git` otra vez (p. ej. en `C:\KC\compatikink`). Recrear `.env` desde `.env.example` + anon key del dashboard. |
| GitHub va atrasado | El disco local sigue teniendo los archivos. Commitea y pushea. Si no hay commit, los cambios viven solo en el working tree. |
| Cloud y local divergieron | No force-push. `git status`, `git log --oneline origin/main..HEAD`, resolver a mano (rebase o merge). |

## Secretos

- **No** commitear `.env`, `.env.txt`, ni documentos de marca (`.docx`).
- Local: `.env` gitignored en este PC (URL canónica `https://piegesepycvipfzjbraz.supabase.co` + anon key).
- CI / GitHub Pages: secrets de Actions `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Cursor Cloud Agents: los **mismos tres nombres** en el dashboard (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_MVP`). Sin valores en el repo.
- Google OAuth: Client Secret solo en el dashboard de Supabase. Notas en `docs/GOOGLE_AUTH.md`.

## Lo que no hace falta

- No clonar el repo a Origin (`origin.cursor.com`): CompatKink se queda en GitHub. Origin CLI además no está soportado en Windows nativo.
- No copiar `C:\KC\compatikink` a la nube: GitHub ya es la copia canónica.
