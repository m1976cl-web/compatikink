# Sync this PC checkout with origin/main (fast-forward only).
# Does not commit, push, or force. Refuse on merge conflicts or diverged history.
# Usage:  cd C:\KC\compatikink ; .\scripts\sync-local.ps1

$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Fail([string]$message) {
  Write-Host ""
  Write-Host "REFUSE: $message" -ForegroundColor Red
  Write-Host "No force-push. Resuelve a mano y vuelve a ejecutar este script."
  exit 1
}

Write-Host "CompatKink sync-local"
Write-Host "Repo: $repoRoot"
Write-Host ""

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) { Fail "no es un repositorio git." }

git fetch origin
if ($LASTEXITCODE -ne 0) { Fail "git fetch origin fallo." }

Write-Host "--- git status ---"
git status
Write-Host ""

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Rama actual: $branch"

if (Test-Path (Join-Path $repoRoot '.git\MERGE_HEAD')) {
  Fail "hay un merge en curso (conflictos). Resuelve, git add, commit o abort."
}

$unmerged = git diff --name-only --diff-filter=U
if ($LASTEXITCODE -eq 0 -and $unmerged) {
  Fail "archivos en conflicto:`n$unmerged"
}

$porcelain = git status --porcelain
if ($porcelain) {
  Write-Host "Hay cambios locales SIN commitear (no se auto-commitea):" -ForegroundColor Yellow
  Write-Host $porcelain
  Write-Host "Cuando termines: git add / commit / git push origin $branch"
  Write-Host ""
} else {
  Write-Host "Working tree limpio (nada sin commitear)."
  Write-Host ""
}

git rev-parse --verify origin/main *> $null
if ($LASTEXITCODE -ne 0) { Fail "no existe origin/main. Revisa el remoto." }

$localSha = (git rev-parse HEAD).Trim()
$remoteSha = (git rev-parse origin/main).Trim()
$baseSha = (git merge-base HEAD origin/main).Trim()

if ($localSha -ne $remoteSha -and $baseSha -ne $localSha -and $baseSha -ne $remoteSha) {
  Fail "historial divergente (local y origin/main tienen commits distintos). No se hace pull ni force."
}

Write-Host "git pull --ff-only origin main"
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) {
  Fail "git pull --ff-only fallo (working tree sucio, conflictos, o no es fast-forward)."
}

$ahead = (git rev-list --count origin/main..HEAD).Trim()
if ($ahead -ne '0') {
  Write-Host "Local tiene $ahead commit(s) por delante de origin/main. Push cuando este listo:"
  Write-Host "  git push origin HEAD"
}

Write-Host ""
Write-Host "Listo. Fuente de verdad: GitHub m1976cl-web/compatikink main."
exit 0
