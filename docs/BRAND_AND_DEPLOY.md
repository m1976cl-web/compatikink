# Marca definitiva y plataformas de despliegue

**Fecha:** 2026-08-13  
**Producto:** CompatKink (core = compatibilidad asimétrica + ZK)

## Recomendación

**Mantener el nombre CompatKink** para el lanzamiento público del core.

- Comunica compatibilidad + kink sin parecer un clone de FetLife.
- Ya está en el repo, Pages, OAuth allow list y App Store slug mental.
- Competidores cercanos (KinkMatch, Comparekink, Carnal Calibration) ocupan el nicho “mutual quiz”; el diferencial es **reporte asimétrico + bóveda PIN + ciphertext remoto**.

### Alternativas (si dominio / trademark bloquean)

| Nombre | Cuándo usarlo |
|--------|----------------|
| VaultMatch | Si quieres enfatizar ZK en el listing |
| BlindCompat | Si el marketing gira 100% en guest ciego |
| Nox | Marca lifestyle (ya es mascota UI); claim “compat privado” aparte |
| ConsentPair | Listing más suave en stores (menos “kink” en el título) |

**No clonar** nombres Fet* / KinkLink-like: confusión de marca y legal.

### Checklist antes de gastar en branding

1. WHOIS: `compatkink.com` / `.app` / `.io`
2. Apple App Store + Google Play search (conflicto 17+)
3. Trademark (país + US/EU si aplica)
4. Handles `@compatkink` en X / IG / Bluesky
5. Bundle id: `com.compatkink.app` (o similar)

## Deploy público (post-desarrollo core)

| Capa | Hoy (beta) | Destino |
|------|------------|---------|
| Web | GitHub Pages `…/compatikink` | **Dominio propio** + Netlify / Cloudflare Pages / Vercel (export Expo web) |
| Auth + DB ZK | Supabase `piegesepycvipfzjbraz` | Mismo proyecto; schema ZK ya aplicado |
| Móvil | Expo web | **EAS Build** → App Store + Play (rating 17+/Adult) |
| Media | Local / demo | Supabase Storage + keys wrappeadas (ver perfil público vs bóveda) |

### Por qué salir de GitHub Pages path

- OAuth / deep links más limpios (`https://app.tudominio.com/auth`)
- WhatsApp y previews menos frágiles que `/compatikink` + `#k=`
- SEO y confianza de marca

Orden: **dominio web → tracción core → EAS stores → social H3**.

## Qué no es el 1.0

Red social tipo FetLife (feed, perfiles densos, DMs masivos, media abierta) = **Horizonte 3**, solo con tracción del core. Ver `docs/PUBLIC_PROFILE_VS_VAULT.md`.
