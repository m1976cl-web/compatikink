export type SupportedLocale = 'es' | 'en';

export const TRANSLATIONS: Record<SupportedLocale, Record<string, string>> = {
  es: {
    // General & Navigation
    'app.title': 'CompatKink',
    'app.subtitle': 'Compatibilidad Intima Privada & Cifrado Zero-Knowledge',
    'nav.back': '← Volver',
    'nav.home': 'Inicio',
    'nav.settings': 'Ajustes',
    'nav.privacy': 'Privacidad',

    // Vault & Security
    'vault.locked': 'Bóveda Bloqueada 🔒',
    'vault.unlocked': 'Bóveda Desbloqueada 🔓',
    'vault.enter_pin': 'Ingresa tu PIN de seguridad',
    'vault.unlock': 'Desbloquear Bóveda',
    'vault.decoy_active': 'Modo Señuelo Activo 🕊️',
    'vault.purge_data': 'Eliminar Todos Mis Datos',

    // Home & Modules
    'home.hero_title': 'Tu Bóveda Íntima Segura',
    'home.hero_subtitle': 'Compara afinidades de forma 100% privada con cifrado en tu dispositivo.',
    'home.quick_invite': '⚡ Invitación Rápida',
    'home.my_sessions': 'Mis Sesiones',
    'home.no_sessions': 'No tienes sesiones activas. ¡Crea tu primera invitación!',
    'home.categories.all': 'Todos los Módulos',
    'home.categories.questionnaire': 'Cuestionarios',
    'home.categories.social': 'Social & Dating',
    'home.categories.safety': 'Seguridad & Escena',
    'home.categories.vault': 'Bóveda & Backup',

    // Live Scene & Safety
    'scene.title': 'Modo Escena en Vivo ⚡🔴',
    'scene.start': '▶️ INICIAR ESCENA EN VIVO',
    'scene.green': '🟢 VERDE (Todo fluido)',
    'scene.yellow': '🟡 AMARILLO (Pausar/Bajar ritmo)',
    'scene.red': '🔴 ROJO / EMERGENCY (PARAR YA)',
    'scene.safeword_alert': '🚨 PALABRA DE SEGURIDAD ACTIVADA',
    'scene.aftercare': '🪷 Protocolo de Aftercare Nocturno (15 min)',

    // Dating & Social
    'dating.title': 'Dating & Kink Social 🖤✨',
    'dating.filter_role': 'Filtrar por Rol',
    'dating.match_score': 'Afinidad',
    'dating.connect': 'Conectar Cifrado 💬',

    // Privacy & Legal
    'privacy.title': 'Privacidad & Consentimiento Legal',
    'privacy.gdpr_notice': 'Cumplimiento GDPR Art. 9 y Ley N° 21.719 (Chile)',
    'privacy.age_gate': 'Verificación de Edad 🔞',
    'privacy.confirm_18': 'Confirmo que tengo 18 años o más.',
  },
  en: {
    // General & Navigation
    'app.title': 'CompatKink',
    'app.subtitle': 'Private Intimate Compatibility & Zero-Knowledge Encryption',
    'nav.back': '← Back',
    'nav.home': 'Home',
    'nav.settings': 'Settings',
    'nav.privacy': 'Privacy',

    // Vault & Security
    'vault.locked': 'Vault Locked 🔒',
    'vault.unlocked': 'Vault Unlocked 🔓',
    'vault.enter_pin': 'Enter your security PIN',
    'vault.unlock': 'Unlock Vault',
    'vault.decoy_active': 'Decoy Mode Active 🕊️',
    'vault.purge_data': 'Purge All My Data',

    // Home & Modules
    'home.hero_title': 'Your Secure Intimate Vault',
    'home.hero_subtitle': 'Compare compatibility 100% privately with client-side encryption.',
    'home.quick_invite': '⚡ Quick Invite',
    'home.my_sessions': 'My Sessions',
    'home.no_sessions': 'No active sessions. Create your first invite!',
    'home.categories.all': 'All Modules',
    'home.categories.questionnaire': 'Questionnaires',
    'home.categories.social': 'Social & Dating',
    'home.categories.safety': 'Safety & Live Scene',
    'home.categories.vault': 'Vault & Backup',

    // Live Scene & Safety
    'scene.title': 'Live Scene Mode ⚡🔴',
    'scene.start': '▶️ START LIVE SCENE',
    'scene.green': '🟢 GREEN (All good)',
    'scene.yellow': '🟡 YELLOW (Slow down / Pause)',
    'scene.red': '🔴 RED / EMERGENCY (STOP NOW)',
    'scene.safeword_alert': '🚨 SAFEWORD TRIGGERED',
    'scene.aftercare': '🪷 Aftercare Protocol (15 min)',

    // Dating & Social
    'dating.title': 'Dating & Kink Social 🖤✨',
    'dating.filter_role': 'Filter by Role',
    'dating.match_score': 'Affinity',
    'dating.connect': 'Encrypted Connect 💬',

    // Privacy & Legal
    'privacy.title': 'Privacy & Legal Consent',
    'privacy.gdpr_notice': 'GDPR Art. 9 & Chilean Law N° 21.719 Compliance',
    'privacy.age_gate': 'Age Verification Gate 🔞',
    'privacy.confirm_18': 'I confirm I am 18 years of age or older.',
  },
};
