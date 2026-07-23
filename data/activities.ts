import { Activity, ActivityCategory } from '@/types';

export const ACTIVITIES: Activity[] = [
  // Power exchange
  { id: 'pe_d/s_dynamic', category: 'power_exchange', name: 'Dinámica D/s', description: 'Relación de dominación/sumisión en escena o más prolongada.', moods: ['poder_adrenalina', 'fantasia_roles'] },
  { id: 'pe_protocols', category: 'power_exchange', name: 'Protocolos y reglas', description: 'Normas acordadas dentro de la dinámica (postura, trato, horarios).', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'pe_ownership', category: 'power_exchange', name: 'Propiedad simbólica', description: 'Dinámicas de pertenencia consensuada entre adultos (collares, anillos).', moods: ['fantasia_roles', 'romantico_afectivo'] },
  { id: 'pe_pet_play', category: 'power_exchange', name: 'Pet play', description: 'Rol de mascota (puppy, kitten, pony) con consentimiento y reglas claras.', moods: ['fantasia_roles'] },
  { id: 'pe_age_play', category: 'power_exchange', name: 'Age play', description: 'Roles de edad entre adultos consensuados en entorno seguro.', moods: ['fantasia_roles'] },
  { id: 'pe_bratting', category: 'power_exchange', name: 'Bratting', description: 'Provocar al dominante para obtener reacción o castigo acordado.', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'pe_praise', category: 'power_exchange', name: 'Elogios y refuerzo', description: 'Reconocimiento verbal afectivo dentro de la dinámica.', moods: ['romantico_afectivo', 'sensual_relajante'] },
  { id: 'pe_degradation_light', category: 'power_exchange', name: 'Degradación ligera', description: 'Humillación verbal suave y negociada.', moods: ['poder_adrenalina', 'fantasia_roles'] },
  { id: 'pe_degradation_intense', category: 'power_exchange', name: 'Degradación intensa', description: 'Humillación profunda (requiere alta confianza y safewords).', moods: ['poder_adrenalina'] },
  { id: 'pe_orgasm_control', category: 'power_exchange', name: 'Control de orgasmo', description: 'Permiso o denegación de clímax según acuerdos.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'pe_chastity', category: 'power_exchange', name: 'Castidad / control', description: 'Dispositivos o acuerdos de restricción genital.', moods: ['poder_adrenalina', 'fantasia_roles'] },
  { id: 'pe_tasks', category: 'power_exchange', name: 'Tareas y órdenes', description: 'Instrucciones diarias fuera o dentro de la escena.', moods: ['fantasia_roles'] },
  { id: 'pe_financial_findom', category: 'power_exchange', name: 'FinDom simbólico', description: 'Control de presupuesto o pequeños tributos consensuados.', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'pe_silent_protocol', category: 'power_exchange', name: 'Protocolo de silencio', description: 'Periodos de silencio obligatorio durante escenas o rituales.', moods: ['poder_adrenalina', 'fantasia_roles'] },

  // Bondage
  { id: 'bo_rope', category: 'bondage', name: 'Cuerdas (shibari)', description: 'Ataduras decorativas o restrictivas con cuerda.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'bo_cuffs', category: 'bondage', name: 'Esposas y grilletes', description: 'Restricción física con cuero, metal o textil.', moods: ['poder_adrenalina'] },
  { id: 'bo_restraints', category: 'bondage', name: 'Inmovilización completa', description: 'Ataduras en cama, silla, cruz o estructura.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'bo_gags', category: 'bondage', name: 'Mordazas', description: 'Restricción verbal (ball gag, ring gag, tape).', moods: ['poder_adrenalina'] },
  { id: 'bo_blindfold', category: 'bondage', name: 'Venda en ojos', description: 'Privación visual para intensificar las sensaciones.', moods: ['sensual_relajante', 'romantico_afectivo'] },
  { id: 'bo_suspension', category: 'bondage', name: 'Suspensión', description: 'Ataduras aéreas en suspensión (requiere experiencia técnica).', moods: ['poder_adrenalina'] },
  { id: 'bo_bondage_tape', category: 'bondage', name: 'Cinta de bondage', description: 'Inmovilización suave con cinta adhesiva de vinilo.', moods: ['sensual_relajante', 'poder_adrenalina'] },
  { id: 'bo_spreader', category: 'bondage', name: 'Barras separadoras', description: 'Mantener apertura de extremidades con barra.', moods: ['poder_adrenalina'] },
  { id: 'bo_vacuum_bed', category: 'bondage', name: 'Cama de vacío / latex', description: 'Inmovilización total en bolsa de vacío de látex.', moods: ['poder_adrenalina'] },
  { id: 'bo_hogtie', category: 'bondage', name: 'Hogtie / atadura de 4 puntos', description: 'Unir muñecas y tobillos por la espalda.', moods: ['poder_adrenalina'] },
  { id: 'bo_breath_play_safe', category: 'bondage', name: 'Control de respiración suave', description: 'Sin obstrucción de vías aéreas, solo contención segura.', moods: ['poder_adrenalina'] },

  // Impact
  { id: 'im_spanking', category: 'impact', name: 'Nalgadas con mano', description: 'Impacto manual en glúteos u otras zonas acordadas.', moods: ['poder_adrenalina'] },
  { id: 'im_paddle', category: 'impact', name: 'Paleta / Paddle', description: 'Impacto sordo con paleta de madera o cuero.', moods: ['poder_adrenalina'] },
  { id: 'im_flogger', category: 'impact', name: 'Flogger', description: 'Látigo de múltiples tiras para impacto picante o pesado.', moods: ['poder_adrenalina'] },
  { id: 'im_crop', category: 'impact', name: 'Fusta / Crop', description: 'Impacto preciso y localizado.', moods: ['poder_adrenalina'] },
  { id: 'im_whip', category: 'impact', name: 'Látigo de un solo ramal', description: 'Impacto de alta precisión (requiere técnica).', moods: ['poder_adrenalina'] },
  { id: 'im_belt', category: 'impact', name: 'Cinturón', description: 'Impacto tradicional con cinturón de cuero.', moods: ['poder_adrenalina'] },
  { id: 'im_slapping', category: 'impact', name: 'Bofetadas consensuadas', description: 'Impacto facial o corporal muy negociado.', moods: ['poder_adrenalina'] },
  { id: 'im_caning', category: 'impact', name: 'Vara / Caning', description: 'Impacto agudo con vara rígida de bambú o ratán.', moods: ['poder_adrenalina'] },
  { id: 'im_thuddy_vs_stinging', category: 'impact', name: 'Contraste sordo vs. picante', description: 'Alternar entre herramientas pesadas y picantes.', moods: ['poder_adrenalina'] },

  // Sensation
  { id: 'se_wax', category: 'sensation', name: 'Cera caliente', description: 'Goteo de cera corporal a temperatura segura.', moods: ['sensual_relajante', 'poder_adrenalina'] },
  { id: 'se_ice', category: 'sensation', name: 'Hielo y frío', description: 'Contraste térmico con hielo u objetos fríos.', moods: ['sensual_relajante', 'poder_adrenalina'] },
  { id: 'se_feather', category: 'sensation', name: 'Plumas y cosquillas', description: 'Estimulación ligera y teased de la piel.', moods: ['sensual_relajante', 'romantico_afectivo'] },
  { id: 'se_electro', category: 'sensation', name: 'Estimulación eléctrica (E-stim)', description: 'Uso de dispositivos electro-estimuladores seguros.', moods: ['poder_adrenalina'] },
  { id: 'se_clamps', category: 'sensation', name: 'Pinzas de pezón / cuerpo', description: 'Presión constante con pinzas regulables.', moods: ['poder_adrenalina'] },
  { id: 'se_scratching', category: 'sensation', name: 'Arañazos y marcas', description: 'Marcas superficiales con uñas u objetos.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'se_sensory_deprivation', category: 'sensation', name: 'Privación sensorial total', description: 'Combinar vendas, tapones de oído y ataduras.', moods: ['sensual_relajante', 'poder_adrenalina'] },
  { id: 'se_massage', category: 'sensation', name: 'Masaje sensual / tántrico', description: 'Contacto corporal relajante enfocado en energía.', moods: ['sensual_relajante', 'romantico_afectivo'] },
  { id: 'se_vibration', category: 'sensation', name: 'Juguetes vibratorios', description: 'Estimulación con vibradores u ondas de presión.', moods: ['sensual_relajante'] },
  { id: 'se_latex_leather', category: 'sensation', name: 'Texturas látex y cuero', description: 'Estimulación táctil con prendas de látex, cuero o vinilo.', moods: ['sensual_relajante', 'fantasia_roles'] },
  { id: 'se_cupping', category: 'sensation', name: 'Ventosas / Cupping', description: 'Succión puntual en espalda o glúteos.', moods: ['sensual_relajante', 'poder_adrenalina'] },

  // Psychological
  { id: 'ps_cnc', category: 'psychological', name: 'CNC (Consensual Non-Consent)', description: 'Fantasía de no-consentimiento simulado con límites estrictos.', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'ps_fear_play', category: 'psychological', name: 'Fear play', description: 'Exploración de miedo controlado y suspenso acordado.', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'ps_tease_deny', category: 'psychological', name: 'Tease & Denial', description: 'Estimulación sin permitir clímax inmediato.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'ps_objectification', category: 'psychological', name: 'Objetificación', description: 'Tratar a la persona como mueble o decoración (human furniture).', moods: ['fantasia_roles'] },
  { id: 'ps_worship', category: 'psychological', name: 'Adoración de cuerpo / pies', description: 'Veneración de zonas del cuerpo (body / foot worship).', moods: ['fantasia_roles', 'romantico_afectivo'] },
  { id: 'ps_mind_control', category: 'psychological', name: 'Hipnosis y sugestión', description: 'Juego de trance, inducción o órdenes mentales.', moods: ['fantasia_roles'] },
  { id: 'ps_edging', category: 'psychological', name: 'Edging prolongado', description: 'Mantener en el borde del clímax durante largo tiempo.', moods: ['poder_adrenalina', 'sensual_relajante'] },
  { id: 'ps_forbidden', category: 'psychological', name: 'Fantasías tabú', description: 'Roleplay de escenarios prohibidos o ilícitos.', moods: ['fantasia_roles'] },
  { id: 'ps_humiliation_public', category: 'psychological', name: 'Humillación auditiva / sutil', description: 'Comentarios o instrucciones sugerentes en tono bajo.', moods: ['fantasia_roles', 'poder_adrenalina'] },

  // Service
  { id: 'sv_household', category: 'service', name: 'Servicio doméstico', description: 'Tareas del hogar realizadas como acto de devoción o rol.', moods: ['fantasia_roles'] },
  { id: 'sv_massage_service', category: 'service', name: 'Servicio de masaje', description: 'Brindar masajes o atención física como sumiso.', moods: ['fantasia_roles', 'sensual_relajante'] },
  { id: 'sv_grooming', category: 'service', name: 'Cuidado y baño', description: 'Bañar, vestir o peinar al compañero/a.', moods: ['fantasia_roles', 'romantico_afectivo'] },
  { id: 'sv_waiting', category: 'service', name: 'Servicio en mesa / copa', description: 'Atender necesidades del dominante durante una velada.', moods: ['fantasia_roles'] },
  { id: 'sv_kneeling', category: 'service', name: 'Postura de espera (hinkeln)', description: 'Permanecer arrodillado o a los pies esperando órdenes.', moods: ['fantasia_roles', 'poder_adrenalina'] },

  // Exhibition & Voyeurism
  { id: 'ex_public_subtle', category: 'exhibition', name: 'Juego discreto en público', description: 'Usar vibrador a distancia o tapones sin involucrar a terceros.', moods: ['fantasia_roles', 'poder_adrenalina'] },
  { id: 'ex_mirrors', category: 'exhibition', name: 'Juego frente a espejo', description: 'Observar la escena mediante espejos.', moods: ['sensual_relajante', 'fantasia_roles'] },
  { id: 'ex_voyeur', category: 'exhibition', name: 'Voyeurismo consensuado', description: 'Observar a la pareja mientras se estimula o viste.', moods: ['sensual_relajante', 'fantasia_roles'] },
  { id: 'ex_exhibition', category: 'exhibition', name: 'Exhibicionismo privado', description: 'Mostrarse o posar para la pareja.', moods: ['fantasia_roles', 'sensual_relajante'] },
  { id: 'ex_photo_video', category: 'exhibition', name: 'Fotos y videos privados', description: 'Registrar escenas para consumo exclusivo entre ambos.', moods: ['fantasia_roles', 'romantico_afectivo'] },
  { id: 'ex_window_curtain', category: 'exhibition', name: 'Sombras y ventanas', description: 'Juego con luz y sombras detrás de cortinas.', moods: ['sensual_relajante', 'fantasia_roles'] },

  // Intimacy & Emotional
  { id: 'in_eye_contact', category: 'intimacy', name: 'Contacto visual sostenido', description: 'Mirarse a los ojos durante 5 minutos en silencio.', moods: ['romantico_afectivo'] },
  { id: 'in_slow_touch', category: 'intimacy', name: 'Contacto ultra lento', description: 'Caricias lentas en zonas no genitales.', moods: ['sensual_relajante', 'romantico_afectivo'] },
  { id: 'in_breath_sync', category: 'intimacy', name: 'Sincronización respiratoria', description: 'Respirar al mismo ritmo abrazados.', moods: ['romantico_afectivo'] },
  { id: 'in_vulnerability', category: 'intimacy', name: 'Compartir secretos eróticos', description: 'Revelar fantasías profundas con escucha sin juicio.', moods: ['romantico_afectivo'] },
  { id: 'in_extended_foreplay', category: 'intimacy', name: 'Juegos previos sin prisa', description: 'Dedicarse 1 hora a los juegos previos sin meta de penetración.', moods: ['romantico_afectivo', 'sensual_relajante'] },
  { id: 'in_edging_hug', category: 'intimacy', name: 'Abrazo de alta frecuencia', description: 'Contacto cuerpo a cuerpo con máxima tensión romántica.', moods: ['romantico_afectivo', 'sensual_relajante'] },

  // Aftercare
  { id: 'ac_cuddling', category: 'aftercare', name: 'Abrazos y contacto físico', description: 'Cuchareo, mantas y contacto suave tras la escena.', moods: ['romantico_afectivo'] },
  { id: 'ac_talk', category: 'aftercare', name: 'Charla de descompresión', description: 'Hablar sobre lo que gustó y cómo se sintieron.', moods: ['romantico_afectivo'] },
  { id: 'ac_blanket_tea', category: 'aftercare', name: 'Té caliente y mantas', description: 'Atención física: bebida tibia, comida o chocolates.', moods: ['romantico_afectivo'] },
  { id: 'ac_quiet_time', category: 'aftercare', name: 'Tiempo en silencio acompañados', description: 'Estar juntos sin necesidad de hablar hasta volver a la realidad.', moods: ['romantico_afectivo'] },
  { id: 'ac_bath', category: 'aftercare', name: 'Baño de agua tibia juntos', description: 'Lavado suave y relajación muscular posterior.', moods: ['sensual_relajante', 'romantico_afectivo'] },
  { id: 'ac_reassurance', category: 'aftercare', name: 'Validación emocional', description: 'Palabras de afecto y seguridad por parte del dominante.', moods: ['romantico_afectivo'] },
];

export const CATEGORY_ORDER: ActivityCategory[] = [
  'power_exchange',
  'bondage',
  'impact',
  'sensation',
  'psychological',
  'service',
  'exhibition',
  'intimacy',
  'aftercare',
];

// Dynamically register custom activities added by the user
let dynamicCustomActivities: Activity[] = [];

export function registerCustomActivity(activity: Activity): void {
  if (!dynamicCustomActivities.some((a) => a.id === activity.id)) {
    dynamicCustomActivities.push(activity);
  }
}

export function getAllActivities(customs?: Activity[]): Activity[] {
  const merged = [...ACTIVITIES];
  const listToMerge = customs ?? dynamicCustomActivities;
  for (const c of listToMerge) {
    if (!merged.some((m) => m.id === c.id)) {
      merged.push(c);
    }
  }
  return merged;
}

export function getActivityById(id: string, customs?: Activity[]): Activity | undefined {
  return getAllActivities(customs).find((a) => a.id === id);
}
