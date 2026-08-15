# Deep links (AASA / Digital Asset Links)

Archivos servidos en Pages (tras `build:web` / CI):

- `https://m1976cl-web.github.io/compatikink/.well-known/apple-app-site-association`
- `https://m1976cl-web.github.io/compatikink/.well-known/assetlinks.json`

## iOS

1. Sustituye `TEAMID` en `public/.well-known/apple-app-site-association` por tu Apple Team ID.
2. `app.json` ya declara `associatedDomains: applinks:m1976cl-web.github.io`.
3. Con dominio propio, mueve AASA a `https://tudominio/.well-known/...` y actualiza `associatedDomains`.

Nota: en GitHub **project** Pages, Apple a veces espera AASA en el host raíz del usuario (`m1976cl-web.github.io/.well-known/...`). Si la verificación falla, publica también una copia en el sitio raíz o migra a dominio propio (recomendado).

## Android

1. Tras firmar con Play App Signing, pega el SHA-256 en `assetlinks.json`.
2. `app.json` ya tiene `intentFilters` para `https://m1976cl-web.github.io/compatikink`.

## WhatsApp / fragmento `#k=`

El secreto de invite va en `#k=` (no llega al servidor). WhatsApp a veces lo trunca.

La app también copia un enlace de respaldo con `?k=` (tradeoff: el secreto puede aparecer en logs de proxy). El iniciador ve la advertencia al copiar.
