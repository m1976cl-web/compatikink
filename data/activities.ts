import { Activity, ActivityCategory } from '@/types';

export const ACTIVITIES: Activity[] = [
  // Power exchange
  { id: 'pe_d/s_dynamic', category: 'power_exchange', name: 'Dinámica D/s', description: 'Relación de dominación/sumisión en escena o más prolongada.' },
  { id: 'pe_protocols', category: 'power_exchange', name: 'Protocolos y reglas', description: 'Normas acordadas dentro de la dinámica (postura, trato, horarios).' },
  { id: 'pe_ownership', category: 'power_exchange', name: 'Propiedad simbólica', description: 'Dinámicas de pertenencia consensuada entre adultos.' },
  { id: 'pe_pet_play', category: 'power_exchange', name: 'Pet play', description: 'Rol de mascota con consentimiento y negociación clara.' },
  { id: 'pe_age_play', category: 'power_exchange', name: 'Age play', description: 'Roles de edad entre adultos, siempre consensuado y acordado.' },
  { id: 'pe_bratting', category: 'power_exchange', name: 'Bratting', description: 'Provocar al dominante para obtener reacción o castigo acordado.' },
  { id: 'pe_praise', category: 'power_exchange', name: 'Elogios y refuerzo', description: 'Reconocimiento verbal como parte de la dinámica.' },
  { id: 'pe_degradation_light', category: 'power_exchange', name: 'Degradación ligera', description: 'Humillación suave, verbal y negociada.' },
  { id: 'pe_degradation_intense', category: 'power_exchange', name: 'Degradación intensa', description: 'Humillación más profunda, requiere alta confianza.' },
  { id: 'pe_orgasm_control', category: 'power_exchange', name: 'Control de orgasmo', description: 'Permiso o denegación de climax según acuerdos.' },
  { id: 'pe_chastity', category: 'power_exchange', name: 'Castidad / control', description: 'Restricción de estimulación genital acordada.' },
  { id: 'pe_tasks', category: 'power_exchange', name: 'Tareas y órdenes', description: 'Instrucciones fuera o dentro de escena.' },

  // Bondage
  { id: 'bo_rope', category: 'bondage', name: 'Cuerdas (shibari)', description: 'Ataduras decorativas o restrictivas con cuerda.' },
  { id: 'bo_cuffs', category: 'bondage', name: 'Esposas y grilletes', description: 'Restricción con material dedicado.' },
  { id: 'bo_restraints', category: 'bondage', name: 'Inmovilización completa', description: 'Ataduras en cama, silla o estructura.' },
  { id: 'bo_gags', category: 'bondage', name: 'Mordazas', description: 'Restricción verbal con mordaza acordada.' },
  { id: 'bo_blindfold', category: 'bondage', name: 'Venda en ojos', description: 'Privación visual para intensificar sensaciones.' },
  { id: 'bo_suspension', category: 'bondage', name: 'Suspensión', description: 'Ataduras en suspensión (requiere experiencia).' },
  { id: 'bo_bondage_tape', category: 'bondage', name: 'Cinta de bondage', description: 'Inmovilización con cinta elástica especializada.' },
  { id: 'bo_spreader', category: 'bondage', name: 'Barras separadoras', description: 'Mantener posición con barra o similar.' },

  // Impact
  { id: 'im_spanking', category: 'impact', name: 'Nalgadas con mano', description: 'Impacto manual en glúteos u otras zonas acordadas.' },
  { id: 'im_paddle', category: 'impact', name: 'Paleta', description: 'Impacto con paddle de madera, cuero u otro material.' },
  { id: 'im_flogger', category: 'impact', name: 'Flogger', description: 'Látigo de tiras para impacto rítmico.' },
  { id: 'im_crop', category: 'impact', name: 'Fusta / crop', description: 'Impacto preciso y localizado.' },
  { id: 'im_whip', category: 'impact', name: 'Látigo', description: 'Impacto avanzado, requiere práctica.' },
  { id: 'im_belt', category: 'impact', name: 'Cinturón', description: 'Impacto con cinturón u objeto similar.' },
  { id: 'im_slapping', category: 'impact', name: 'Bofetadas', description: 'Impacto en rostro o cuerpo, muy negociado.' },
  { id: 'im_caning', category: 'impact', name: 'Vara / caning', description: 'Impacto con vara rígida.' },

  // Sensation
  { id: 'se_wax', category: 'sensation', name: 'Cera caliente', description: 'Gotas de cera corporal a temperatura segura.' },
  { id: 'se_ice', category: 'sensation', name: 'Hielo / frío', description: 'Contraste térmico con hielo u objetos fríos.' },
  { id: 'se_feather', category: 'sensation', name: 'Plumas y cosquillas', description: 'Estimulación ligera y teasing.' },
  { id: 'se_electro', category: 'sensation', name: 'Estimulación eléctrica (e-stim)', description: 'Dispositivos e-stim consensuados.' },
  { id: 'se_clamps', category: 'sensation', name: 'Pinzas', description: 'Presión en pezones u otras zonas.' },
  { id: 'se_scratching', category: 'sensation', name: 'Arañazos', description: 'Marcas leves con uñas u objetos.' },
  { id: 'se_sensory_deprivation', category: 'sensation', name: 'Privación sensorial', description: 'Combinar vendas, orejas tapadas, etc.' },
  { id: 'se_massage', category: 'sensation', name: 'Masaje erótico', description: 'Contacto corporal relajante o sensual.' },
  { id: 'se_vibration', category: 'sensation', name: 'Juguetes vibratorios', description: 'Estimulación con vibradores u otros juguetes.' },

  // Psychological
  { id: 'ps_cnc', category: 'psychological', name: 'CNC (consensual non-consent)', description: 'Fantasía de no-consentimiento acordada con límites estrictos.' },
  { id: 'ps_fear_play', category: 'psychological', name: 'Fear play', description: 'Juego con miedo controlado y señales claras.' },
  { id: 'ps_tease_deny', category: 'psychological', name: 'Tease & denial', description: 'Provocar sin permitir liberación inmediata.' },
  { id: 'ps_objectification', category: 'psychological', name: 'Objetificación', description: 'Tratar como objeto de forma consensuada.' },
  { id: 'ps_worship', category: 'psychological', name: 'Adoración', description: 'Veneración de cuerpo o rol (body worship).' },
  { id: 'ps_mind_control', category: 'psychological', name: 'Control mental / hipnosis', description: 'Sugerencia erótica o roleplay de control.' },
  { id: 'ps_edging', category: 'psychological', name: 'Edging', description: 'Llevar al borde del orgasmo repetidamente.' },
  { id: 'ps_forbidden', category: 'psychological', name: 'Fantasías tabú', description: 'Roleplay de escenarios prohibidos entre adultos.' },

  // Service
  { id: 'sv_household', category: 'service', name: 'Servicio doméstico', description: 'Tareas del hogar como parte de la dinámica.' },
  { id: 'sv_pampering', category: 'service', name: 'Mimar al dominante', description: 'Atenciones físicas al partner dominante.' },
  { id: 'sv_rituals', category: 'service', name: 'Rituales de servicio', description: 'Gestos repetidos (arrodillarse, presentar, etc.).' },
  { id: 'sv_food', category: 'service', name: 'Servicio de comida/bebida', description: 'Preparar o servir como acto de servicio.' },
  { id: 'sv_massage_service', category: 'service', name: 'Masaje como servicio', description: 'Masajear al partner como acto de servicio.' },

  // Exhibition
  { id: 'ex_voyeur', category: 'exhibition', name: 'Ser observado (voyeurismo)', description: 'Exhibirse ante persona(s) acordadas.' },
  { id: 'ex_watch', category: 'exhibition', name: 'Observar (voyeur)', description: 'Ver a otros en escena consensuada.' },
  { id: 'ex_photos_private', category: 'exhibition', name: 'Fotos/vídeo privados', description: 'Registro íntimo solo entre ustedes.' },
  { id: 'ex_public_discreet', category: 'exhibition', name: 'Público discreto', description: 'Juego en público sin exponer a terceros no consentidos.' },
  { id: 'ex_threesome', category: 'exhibition', name: 'Trío', description: 'Escena con tercera persona acordada.' },
  { id: 'ex_group', category: 'exhibition', name: 'Grupo / orgía', description: 'Escena con múltiples participantes.' },
  { id: 'ex_swapping', category: 'exhibition', name: 'Intercambio de pareja', description: 'Compartir escena con otras parejas.' },

  // Intimacy
  { id: 'in_oral_give', category: 'intimacy', name: 'Sexo oral (dar)', description: 'Estimulación oral activa.' },
  { id: 'in_oral_receive', category: 'intimacy', name: 'Sexo oral (recibir)', description: 'Recibir estimulación oral.' },
  { id: 'in_anal', category: 'intimacy', name: 'Penetración anal', description: 'Actividad anal consensuada y preparada.' },
  { id: 'in_toys', category: 'intimacy', name: 'Juguetes compartidos', description: 'Uso de juguetes en pareja.' },
  { id: 'in_strap', category: 'intimacy', name: 'Arnés / strap-on', description: 'Penetración con arnés.' },
  { id: 'in_breeding', category: 'intimacy', name: 'Fantasía breeding', description: 'Roleplay de embarazo/conservación, sin implicar reproducción real.' },
  { id: 'in_raw', category: 'intimacy', name: 'Sin barrera (fluid bonded)', description: 'Relaciones sin protección solo con acuerdo y confianza médica.' },
  { id: 'in_romantic', category: 'intimacy', name: 'Intimidad romántica', description: 'Conexión emocional y afecto durante el juego.' },

  // Aftercare
  { id: 'ac_cuddling', category: 'aftercare', name: 'Abrazos y contacto', description: 'Reconexión física tras la escena.' },
  { id: 'ac_talk', category: 'aftercare', name: 'Conversación post-escena', description: 'Hablar de lo vivido y emociones.' },
  { id: 'ac_water_food', category: 'aftercare', name: 'Agua y comida', description: 'Hidratación y snack después del juego.' },
  { id: 'ac_checkins', category: 'aftercare', name: 'Check-ins regulares', description: 'Seguimiento emocional horas o días después.' },
  { id: 'ac_first_aid', category: 'aftercare', name: 'Cuidado de marcas/lesiones', description: 'Atención a moretones, irritaciones, etc.' },
];

let customActivitiesRegistry: Activity[] = [];

export function registerCustomActivity(activity: Activity): void {
  if (!customActivitiesRegistry.some((a) => a.id === activity.id)) {
    customActivitiesRegistry.push(activity);
  }
}

export function setCustomActivitiesRegistry(activities: Activity[]): void {
  customActivitiesRegistry = activities;
}

export function getAllActivities(customs?: Activity[]): Activity[] {
  const merged = [...ACTIVITIES, ...customActivitiesRegistry];
  if (customs) {
    for (const c of customs) {
      if (!merged.some((m) => m.id === c.id)) {
        merged.push(c);
      }
    }
  }
  return merged;
}

export function getActivitiesByCategory(category: ActivityCategory, customs?: Activity[]): Activity[] {
  return getAllActivities(customs).filter((a) => a.category === category);
}

export function getActivityById(id: string, customs?: Activity[]): Activity | undefined {
  return getAllActivities(customs).find((a) => a.id === id);
}

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
