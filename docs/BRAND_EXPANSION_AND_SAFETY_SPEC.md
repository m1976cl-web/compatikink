# Especificación de Marca, Radar de Geoproximidad y Blindaje Anti-Comercio

**Fecha:** 17 de Agosto, 2026  
**Documento:** `docs/BRAND_EXPANSION_AND_SAFETY_SPEC.md`  
**Estado:** Propuesta Estratégica & Arquitectura en Evaluación  

---

## 1. Estrategia de Marca y Naming (Store-Safe & Escalabilidad)

### 1.1 El dilema con el término "Kink" en Tiendas de Apps
El uso de palabras explícitas como *"Kink"*, *"BDSM"* o *"Fetish"* en el título principal de una aplicación genera fricciones críticas en el ecosistema digital:
1. **Apple App Review & Google Play:** Escaneo automatizado de metadatos que activa revisiones humanas estrictas, riesgo de rechazo por *Contenido para Adultos / Sexually Explicit Services* y exclusión de listas destacadas o búsquedas sugeridas (shadowban).
2. **Publicidad Digital (Meta Ads, TikTok, Google Ads):** Bloqueo o encarecimiento severo de campañas de adquisición bajo políticas de *Adult Products & Services*.
3. **Pasarelas de Pago (Stripe, Apple Pay):** Riesgo de pausas operativas y auditorías de compliance al detectar nombres vinculados a industria para adultos.
4. **Privacidad de Pantalla del Usuario:** Falta de discreción en el icono del teléfono ante miradas de terceros.

### 1.2 La Estrategia Ganadora: Modelo de Doble Capa
Separar el **Nombre de Marca / App Store Listing** (limpio, elegante y discreto) del **Concepto y Subtítulo Descriptivo** (en la web y dentro de la app):

$$\text{App en Tiendas: } \mathbf{[Nombre\ Discreto]} \longrightarrow \text{Claim: } \textit{"Test de Compatibilidad Íntima & Bóveda Privada"}$$

### 1.3 Matriz de Nombres Evaluados y Disponibilidad de Dominios

#### A. Nombres Misteriosos, Evocativos y Clandestinos (Alta Curiosidad / Store-Safe)
| Nombre Candidato | Enfoque / Vibe | `.com` | `.app` | `.io` | Evaluación Estratégica & Registro |
|---|---|:---:|:---:|:---:|---|
| **Masque** / **Masquely** | Baile de máscaras, desinhibición elegante | `masquevault.com` (Libre)<br>`masquely.com` (Libre) | `masqueapp.app` (Libre) | `masquevault.io` (Libre) | **Top Misterio:** Evoca confidencialidad, antifaz veneciano y liberación de deseos sin juicio. |
| **Sotto** *(Sotto Voce)* | Susurro íntimo, secreto de pareja | `sottoclub.com` (Libre)<br>`sottovoceapp.com` (Libre) | `sottoapp.app` (Libre) | `sottoapp.io` (Libre) | **Top Elegancia:** En italiano "en voz baja", lo que se confiesa solo en la intimidad. |
| **Umbra** | Sombra del eclipse, universo noir | `umbraclub.com` (Libre)<br>`umbrasafe.com` (Libre) | `umbraapp.app` (Libre) | `umbrasafe.io` (Libre) | **Top Fuerza:** La zona más profunda y protegida de la sombra; magnético y sugerente. |
| **Tryst** / **Trystly** | Encuentro secreto entre amantes | `trystly.com` (Libre)<br>`trystvault.com` (Libre) | `trystly.app` (Libre) | `trystapp.io` (Libre) | **Muy Sugerente:** Cita íntima clandestina acordada a escondidas del mundo. |
| **Arcana** | Secretos profundos, conocimiento oculto | `arcanaly.com` (Libre) | `arcanapp.app` (Libre)<br>`arcanavault.app` (Libre) | `arcanavault.io` (Libre) | **Místico:** Los misterios que solo se revelan a quien posee la llave. |
| **Vesper** | Crepúsculo, estrella de la tarde | `vesperkink.com` (Libre) | `vesperapp.app` (Libre) | `vespervault.io` (Libre) | **Sofisticado:** Glamour nocturno y seducción clásica al caer el sol. |
| **Auranox** | Energía y mística de la noche | `auranox.com` (Libre) | `auranox.app` (Libre) | `auranox.io` (Libre) | **Identidad Nox Segura:** Mantiene la personalidad de Nox evitando colisiones de marca. |
| **Tacita** / **Tacit** | Acuerdo tácito, pacto sin palabras | `tacitavault.com` (Libre) | `tacitapp.app` (Libre) | `tacitvault.io` (Libre) | **Discreto:** La complicidad mutua que no requiere explicaciones al exterior. |
| **Enclave** | Territorio cerrado, refugio autónomo | `enclavevault.com` (Libre) | `enclaveapp.app` (Libre) | 🔴 | **Exclusivo:** Espacio seguro de reglas y acuerdos propios. |
| **Ciphra** / **Cyphra** | Código secreto, cifrado mutuo | `ciphrapp.com` (Libre) | `ciphrapp.app` (Libre) | `ciphra.io` (Libre) | **Criptográfico:** Símbolo de pacto indescifrable entre dos personas. |

#### B. Nombres Descriptivos y Funcionales
| Nombre Candidato | Enfoque / Vibe | `.com` | `.app` | `.io` | Evaluación Estratégica |
|---|---|:---:|:---:|:---:|---|
| **BlindCompat** | Asimétrico / Ciego | 🟢 Libre | 🟢 Libre | 🟢 Libre | Descriptivo directo: test ciego y compatibilidad asimétrica. |
| **CompatKink** | Descriptivo de nicho | 🟢 Libre | 🟢 Libre | 🟢 Libre | Marca ideal para la Web App / PWA y comunidad sex-positive. |
| **Velour** | Sensual / Textura | `velourkink.com` (Libre) | `velourapp.io` (Libre) | 🔴 | Sensualidad, tacto suave y bienestar íntimo. |
| **SyncPair** | Sincronización de acuerdos | `compatpair.com` (Libre) | `syncpair.app` (Libre) | 🟢 Libre | Enfoque directo en conexión de pareja y acuerdos mutuos. |
| **NoirKink** / **IntimaKink** | Lifestyle / Fetiche | 🟢 Libre | 🟢 Libre | 🟢 Libre | Posicionamiento editorial y formativo. |

---

## 2. Arquitectura del Radar de Geoproximidad ("Exploradores Cercanos")

### 2.1 Principio Sagrado: Aislamiento Criptográfico (Capa Pública vs. Bóveda ZK)
El radar geográfico **NUNCA** procesa ni expone respuestas íntimas, notas ni límites de la bóveda.

```
┌────────────────────────────────────────────────────────┐
│  CAPA PÚBLICA (Opt-In / Servidor Supabase)             │
│  • Nickname y avatar (con máscara/blur opcional)       │
│  • Rol (👑 Dom, 🪢 Sub, ⚡ Switch, 🌿 Rigger, etc.)    │
│  • Ubicación difusa (Geohash de 2 a 5 km de radio)     │
│  • CTA Principal: "🔒 Invitar a Test Asimétrico"       │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Invitación cifrada (token CSPRNG)
                            ▼
┌────────────────────────────────────────────────────────┐
│  BÓVEDA ZERO-KNOWLEDGE (Solo en dispositivo del usuario)│
│  • Respuestas, hard limits, fetiches, notas            │
│  • Cifrado AES-GCM-256 + PBKDF2 local                  │
└────────────────────────────────────────────────────────┘
```

### 2.2 Mitigaciones de Seguridad Física (Anti-Triangulación & Anti-Doxxing)
* **Geofuzzing Obligatorio:** El servidor nunca almacena coordenadas GPS exactas (latitud/longitud precisas). Utiliza geohashing con resolución reducida a cuadrículas de 2 a 5 km o etiquetas de comuna/ciudad.
* **Distancias Aproximadas:** En la interfaz solo se despliega distancia redondeada con variación aleatoria (*jitter*) (ej. `"~2.5 km"`, `"En tu zona"`).
* **Modo Fantasma / Incógnito (Ghost Mode):** Switch en 1 tap para apagar completamente la visibilidad en el radar o activarla solo para roles compatibles.
* **El Puente con el Core:** El perfil de radar no es solo para chatear en frío, sino para invitar a comparar compatibilidad asimétrica con revelación mutua.

---

## 3. Escudo de Blindaje Anti-Comercio (Lícito e Ilícito)

Para blindar la plataforma contra el comercio sexual, venta de packs/OnlyFans, Pro-Dommes de pago, estafas económicas y cumplir con **Apple, Google, Stripe y normativas de prevención de trata**:

### 3.1 Capa 1: Motor de Filtrado y Detección de Palabras Clave (Anti-Solicitation Engine)
Escaneo en tiempo real en biografías públicas, foros comunitarios y solicitudes de chat:
* **Pasarelas y Métodos de Pago:** Bloqueo de `PayPal`, `CashApp`, `Venmo`, `MercadoPago`, `Zelle`, `Transferencia`, `CBU`, `RUT bancario`, `USDT/BTC`, etc.
* **Plataformas de Monetización y Contenido:** Bloqueo de `OnlyFans`, `OF`, `Fansly`, `Arsmate`, `Cafecito`, `Patreon`, `Telegram VIP`, `Pack`, `Tarifa`, `X hora`, `$$$`.
* **Ofuscaciones:** Detección de patrones con espacios o guiones (`O-n-l-y-F-a-n-s`) y combinaciones de emojis comerciales (💵, 💸, 💳).

### 3.2 Capa 2: Restricción de Enlaces y Redes Externas
* Prohibición de URLs directas salientes (`https://...`) en perfiles del radar.
* Bloqueo de números telefónicos y enlaces directos de WhatsApp en biografías abiertas para evitar el desvío de tráfico no regulado.

### 3.3 Capa 3: Barrera de Doble Consentimiento & Anti-Spam
* Inexistencia de mensajes directos fríos masivos. Para abrir un canal de comunicación privado, ambas partes deben haber aceptado un match previo o completado un test mutuo.
* Rate limiting estricto (bloqueo ante ráfagas de solicitudes de contacto).

### 3.4 Capa 4: Sistema de Denuncias Tipificadas & Suspensión Automática (P5)
* Tipificaciones de reporte explícitas: *"Ofrecimiento de servicios remunerados"*, *"Promoción de OnlyFans/packs"*, *"Perfil comercial o bot"*.
* **Suspensión Preventiva:** Tras 2 reportes independientes en 24 horas, el perfil queda oculto del radar automáticamente a la espera de revisión.
* **Bloqueo Mutuo Bidireccional:** El denunciante y el denunciado quedan mutuamente invisibles de forma instantánea.

### 3.5 Capa 5: Cláusula Legal de Tolerancia Cero
* Cláusula en Términos de Servicio (`app/terms.tsx`) declarando la plataforma como **100% recreativa y no comercial**.
* Casillero de consentimiento obligatorio en el Onboarding aceptando la expulsión inmediata ante cualquier intento de cobro o publicidad monetizada.

---

## 4. Hoja de Ruta de Implementación

1. **Fase Inmediata (Core Beta & Registro de Dominio):**
   - Definir nombre definitivo entre `BlindCompat` / `Nox` / `CompatKink`.
   - Adquirir dominios (`.com` y `.app`).
   - Mantener el MVP enfocado en el test asimétrico y la bóveda ZK.
2. **Fase Expansión Social (Horizonte 3):**
   - Implementar tabla de perfiles públicos aislada en Supabase (`public_profiles`).
   - Desarrollar interfaz de Radar con Geofuzzing y Modo Fantasma.
   - Activar el motor de filtros Anti-Solicitación y reglas de suspensión automática.
