<<<<<<< HEAD
# compatikink
=======
# CompatKink — App móvil de compatibilidad

App móvil (iOS + Android) para explorar compatibilidad de preferencias de forma **privada y asimétrica**:

1. **Tú** respondes el cuestionario y creas una invitación.
2. **La otra persona** responde con un código (sin ver tus respuestas).
3. **Tú** recibes un reporte completo y decides qué compartir.

## Requisitos

- [Node.js 20+](https://nodejs.org/)
- [Expo Go](https://expo.dev/go) en tu móvil (para probar) o Android Studio / Xcode (para build nativo)

## Instalación

```bash
cd Compatibilidadcursor
npm install
cp .env.example .env
```

### Supabase (recomendado para dos dispositivos)

Sin Supabase la app funciona en **modo local** (mismo dispositivo). Para que otra persona responda desde su móvil:

1. Crea un proyecto gratis en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Copia URL y anon key a `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Ejecutar

```bash
npx expo start
```

Escanea el QR con Expo Go (Android) o la app Cámara (iOS).

## Flujo de la app

| Pantalla | Descripción |
|----------|-------------|
| Inicio | Elegir "Soy quien inicia" o "Me invitaron" |
| Cuestionario | ~70 actividades con rating, rol e intensidad |
| Invitar | Código de 6 caracteres + compartir por WhatsApp |
| Reporte | Solo visible para quien inició la sesión |
| Compartir | Filtrar qué secciones enviar al invitado |

## Estructura

```
app/           Pantallas (Expo Router)
components/    UI reutilizable
data/          Catálogo de actividades
lib/           Compatibilidad, sesiones, Supabase
types/         Tipos TypeScript
supabase/      Schema SQL
```

## Reporte — secciones

- **Match mutuo** — interés positivo de ambos
- **Explorar juntos** — curiosidad compatible
- **Solo tus intereses** — privado, no se comparte por defecto
- **Intereses del invitado** — te interesa a ellos, no a ti
- **Conflicto de límites** — hard limit vs interés
- **Desalineación de roles** — mismo interés, roles/intensidad distintos

## Build para producción

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Aviso legal

Solo para mayores de 18 años. Herramienta de comunicación consensuada, no sustituye conversación ni consejo profesional.
>>>>>>> 82236ce (initial_commit_for_compatikink)
