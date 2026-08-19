# Cloud y local — flujo dual

CompatKink se desarrolla **a la vez** en Cursor Cloud Agents y en este PC. El disco local es backup; GitHub es la fuente de verdad.

## Fuente de verdad

- Repo: [`https://github.com/m1976cl-web/compatikink`](https://github.com/m1976cl-web/compatikink)
- Rama: `main`
- No force-push a `main`. No `--force` ni history rewrite sin petición explícita.

## Agentes en la nube (Cursor Cloud)

1. Clonan GitHub (no el disco de este PC).
2. Trabajan, commitean y hacen **push** a `main`.
3. Nunca force-push. Si `main` divergió: parar y avisar.
4. Variables: copiar `.env.example` → `.env` (gitignored). `EXPO_PUBLIC_MVP=1` para el core; `=0` para Fetish Labs / leisure. La anon key **no** va al repo: GitHub Actions secrets para CI/Pages.

## Este PC (backup local)

Ruta del checkout: `C:\KC\compatikink` (si `git rev-parse --show-toplevel` muestra `C:\KC`, esa es la raíz real del clone; Cursor puede montar el workspace como `compatikink`). El script `scripts/sync-local.ps1` usa la raíz del repo, no una ruta fija.

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
- Google OAuth: Client Secret solo en el dashboard de Supabase. Notas en `docs/GOOGLE_AUTH.md`.
