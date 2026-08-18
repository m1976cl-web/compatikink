# Marca definitiva y plataformas de despliegue

**Fecha:** 2026-08-13 (capas store/in-app: 2026-08-17; listing lean 2026-08-17)  
**Producto:** CompatKink (core = compatibilidad asimétrica + ZK)

## Recomendación

**Mantener CompatKink como marca de producto (web / in-app).** No usarlo como título de listing en Apple / Google / Microsoft. **No usar “Nox” como nombre de app en stores.**

- CompatKink comunica el nicho; el diferencial sigue siendo **reporte asimétrico + bóveda PIN + ciphertext remoto**.
- “Kink” / “BDSM” en el **título de tienda** choca con metadatos para audiencia general (Apple 2.3, Play Restricted Content, Microsoft 11.7).
- “Nox” solo: saturado en Clase 9/42, NoxPlayer/NoxCleaner, `nox.app` (LAPSUS, alarma social registrada). Mascota UI sí; listing no. Ver `Análisis de Marca Nox.docx`.

### Tres capas (congelar antes de EAS)

| Capa | Nombre | Notas |
|------|--------|--------|
| Listing (stores) | **Shleyer** (fallback legal/dominio **Geheym**) | Título ≤30 caracteres; sin kink/BDSM/Nox. *Lean 2026-08-17: rareza > literalidad.* |
| In-app / web / mascota | **CompatKink** + pulpo **Nox** | Claim: test ciego + bóveda privada |
| Bundle ID | `com.compatikink.app` | No cambiar a `com.nox.*` (colisión Nox Group) ni a `com.shleyer.*` / `com.geheym.*` |

**BlindCompat** queda **retirado** como pick de listing: demasiado literal (“blind compatibility”) y fácil de leer como descriptor ASO, no como marca. **ConsentPair** pasa a reserva lejana.

Candidatos bajo consideración (lean del usuario: rareza / poco usados): **Shleyer** = listing primario (marca inventada, velo/test ciego; no localizar a Schleier). **Geheym** = fallback legal y de dominio (ortografía arcaica de *Geheim*; no localizar el título a Geheim). In-app sigue **CompatKink** + mascota **Nox**. Bundle congelado: `com.compatikink.app`.

### Alternativas (si Shleyer / Geheym / dominio bloquean)

| Nombre | Cuándo usarlo |
|--------|----------------|
| **LUX / LUX NOX** | Dualidad perfecta con la mascota **Nox** (Luz & Noche); 0 colisiones en Clase 9/42 para apps de intimidad (`luxnox.app`, `luxnox.io`, `luxkink.com`, `luxvault.app`) |
| **Masque** | Enfoque clandestino / baile de máscaras (`masquevault.com`, `masqueapp.app`) |
| **Sotto** | Enfoque susurro íntimo / complicidad (*sotto voce*) (`sottoclub.com`, `sottoapp.app`) |
| **Umbra** | Enfoque sombra del eclipse / poder noir (`umbraclub.com`, `umbraapp.app`) |
| **Tryst** | Enfoque cita secreta entre amantes (`trystly.com`, `trystvault.com`) |
| **Arcana** | Enfoque misterio profundo / iniciación (`arcanapp.app`, `arcanaly.com`) |
| **Vesper** | Enfoque seducción crepuscular / atardecer (`vesperapp.app`, `vespervault.io`) |
| **Auranox** | Mantiene la esencia de Nox sin conflicto de marca (`auranox.app`, `auranox.io`) |
| Geheym | Fallback de listing + dominio si Shleyer choca (slayer / Schleyer / TM Shyller) |
| ConsentPair | Reserva lejana si Apple/Play rechazan ambos coined names |
| VaultMatch | Solo si quieres enfatizar ZK; colisión semántica con “Couples Vault” / Vault Platform |
| CompatKink | Web + in-app; **no** título de store |
| Nox | Solo mascota UI; **nunca** listing ni bundle `com.nox.*` |
| BlindCompat | Retirado: demasiado literal |

### 🛡️ Estudio de Disponibilidad: LUX & LUX NOX (2026-08-18)

1. **Marcas Registradas (USPTO & EUIPO - Clases 9 y 42):**
   - **`LUX NOX` / `LUXNOX`**: **100% LIMPIO**. No existen marcas registradas en software de emparejamiento, intimidad, privacidad ni mensajería. Libre de oposiciones directas.
   - "Nox Lux" (en orden inverso) solo existe para iluminación automotriz (Clase 11), sin conflicto de rubro.
2. **Disponibilidad de Dominios Web:**
   - **`luxnox.app`**: Disponible / Libre para registro inmediato.
   - **`luxnox.io`**: Disponible / Libre para registro inmediato.
   - **`luxkink.com`**: Disponible / Libre para registro inmediato (ideal para landing web orientada al nicho).
   - **`luxvault.app`**: Disponible (solo existe un proyecto cripto no relacionado en `.net`).
3. **App Stores (Apple & Google Play ASO):**
   - El término **"Lux Nox"** no está tomado por apps de citas ni privacidad. Supera todas las políticas de contenido restringido al no incluir palabras tabú.

> 📖 **Análisis ampliado de riesgos con el término "Kink", Radar de Geoproximidad y Blindaje Anti-Comercio:** Ver [`docs/BRAND_EXPANSION_AND_SAFETY_SPEC.md`](file:///C:/KC/docs/BRAND_EXPANSION_AND_SAFETY_SPEC.md).

**No clonar** nombres Fet* / KinkLink-like: confusión de marca y legal.

### Checklist antes de gastar en branding

1. WHOIS real (no asumir “libre”): `shleyer.com` / `.app`, `geheym.com` / `.app`, y `compatkink.com` / `.app`
2. Búsqueda en Apple, Play y Microsoft Store: Shleyer, Geheym, Schleier, Geheim, CompatKink, Nox
3. Marca Clase 9/42 (INAPI + USPTO/EUIPO): vigilancia fonética **Shyller** (EU, software) y descriptividad **Geheim**
4. Handles `@shleyer` / `@geheym` (y `@compatkink` in-app)
5. **Congelar** bundle id `com.compatikink.app` (ya en repo; no `com.nox.*`)

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
