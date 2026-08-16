/**
 * Nox scene registry — page-job captions live here (not in i18n)
 * so host art can ship without colliding with translations work.
 */
export const NOX_SCENE_IDS = [
  'landing',
  'onboarding',
  'home',
  'auth',
  'questionnaire',
  'invite',
  'guest',
  'report',
  'manual',
  'share',
  'privacy',
] as const;

export type NoxSceneId = (typeof NOX_SCENE_IDS)[number];

export type NoxSceneMeta = {
  caption: string;
  a11y: string;
};

export const NOX_SCENES: Record<NoxSceneId, NoxSceneMeta> = {
  landing: {
    caption: 'Te doy la bienvenida. La bóveda se queda en tu dispositivo.',
    a11y: 'Nox, el pulpo anfitrión, da la bienvenida junto a una bóveda privada.',
  },
  onboarding: {
    caption: 'Solo adultos 18+. Consentimiento primero.',
    a11y: 'Nox verifica que eres mayor de 18 años.',
  },
  home: {
    caption: 'Responde → Invita → Lee el reporte.',
    a11y: 'Nox señala el camino: responder, invitar y leer el reporte.',
  },
  auth: {
    caption: 'Yo guardo la puerta. Tú tienes el PIN.',
    a11y: 'Nox guarda la bóveda cifrada.',
  },
  questionnaire: {
    caption: 'Responde en privado. Nadie ve tus no-matches.',
    a11y: 'Nox presenta el cuestionario con un clipboard.',
  },
  invite: {
    caption: 'Comparte el sobre. El secreto viaja con el enlace.',
    a11y: 'Nox entrega un sobre sellado con el código de invitación.',
  },
  guest: {
    caption: 'Tú no ves las respuestas de quien te invitó.',
    a11y: 'Nox cubre las respuestas del iniciador para proteger la privacidad del invitado.',
  },
  report: {
    caption: 'Límites duros primero. El reporte es solo tuyo.',
    a11y: 'Nox presenta el reporte privado, con límites duros primero.',
  },
  manual: {
    caption: 'Seguridad, aftercare y el camino con calma.',
    a11y: 'Nox guía seguridad y aftercare.',
  },
  share: {
    caption: 'Tú eliges qué mostrar. El resto queda en la bóveda.',
    a11y: 'Nox filtra qué partes del reporte se pueden compartir.',
  },
  privacy: {
    caption: 'Cero conocimiento: el servidor solo ve ciphertext.',
    a11y: 'Nox sostiene un escudo de privacidad frente a la bóveda.',
  },
};

export function isNoxSceneId(value: string): value is NoxSceneId {
  return (NOX_SCENE_IDS as readonly string[]).includes(value);
}

export function getNoxScene(scene: string): NoxSceneMeta {
  return NOX_SCENES[isNoxSceneId(scene) ? scene : 'landing'];
}
