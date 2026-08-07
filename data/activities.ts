import { Activity, ActivityCategory, CATEGORY_LABELS } from '@/types';
import { t } from '@/lib/i18n';

export const ACTIVITIES: Activity[] = [
  // ═══════════════════════════════════════════
  // POWER EXCHANGE
  // ═══════════════════════════════════════════
  { id: 'pe_d/s_dynamic', category: 'power_exchange', name: 'Dinámica D/s', description: 'Relación de dominación/sumisión en escena o más prolongada.', moods: ['poder_adrenalina', 'fantasia_roles'], difficultyLevel: 'intermediate' },
  { id: 'pe_protocols', category: 'power_exchange', name: 'Protocolos y reglas', description: 'Normas acordadas dentro de la dinámica (postura, trato, horarios).', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'pe_ownership', category: 'power_exchange', name: 'Propiedad simbólica', description: 'Dinámicas de pertenencia consensuada entre adultos (collares, anillos).', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'intermediate' },
  { id: 'pe_pet_play', category: 'power_exchange', name: 'Pet play', description: 'Rol de mascota (puppy, kitten, pony) con consentimiento y reglas claras.', moods: ['fantasia_roles'], difficultyLevel: 'intermediate' },
  { id: 'pe_age_play', category: 'power_exchange', name: 'Age play', description: 'Roles de edad entre adultos consensuados en entorno seguro.', moods: ['fantasia_roles'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Requiere negociación profunda y límites claros. Siempre entre adultos.' },
  { id: 'pe_bratting', category: 'power_exchange', name: 'Bratting', description: 'Provocar al dominante para obtener reacción o castigo acordado.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'pe_praise', category: 'power_exchange', name: 'Elogios y refuerzo', description: 'Reconocimiento verbal afectivo dentro de la dinámica.', moods: ['romantico_afectivo', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'pe_degradation_light', category: 'power_exchange', name: 'Degradación ligera', description: 'Humillación verbal suave y negociada.', moods: ['poder_adrenalina', 'fantasia_roles'], difficultyLevel: 'intermediate' },
  { id: 'pe_degradation_intense', category: 'power_exchange', name: 'Degradación intensa', description: 'Humillación profunda (requiere alta confianza y safewords).', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Puede causar daño emocional. Negociar límites exactos y tener aftercare intensivo.' },
  { id: 'pe_orgasm_control', category: 'power_exchange', name: 'Control de orgasmo', description: 'Permiso o denegación de clímax según acuerdos.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate' },
  { id: 'pe_chastity', category: 'power_exchange', name: 'Castidad / control', description: 'Dispositivos o acuerdos de restricción genital.', moods: ['poder_adrenalina', 'fantasia_roles'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Higiene rigurosa. No usar por períodos prolongados sin supervisión.' },
  { id: 'pe_tasks', category: 'power_exchange', name: 'Tareas y órdenes', description: 'Instrucciones diarias fuera o dentro de la escena.', moods: ['fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'pe_financial_findom', category: 'power_exchange', name: 'FinDom simbólico', description: 'Control de presupuesto o pequeños tributos consensuados.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Establecer montos máximos claros. Nunca comprometer la estabilidad económica.' },
  { id: 'pe_silent_protocol', category: 'power_exchange', name: 'Protocolo de silencio', description: 'Periodos de silencio obligatorio durante escenas o rituales.', moods: ['poder_adrenalina', 'fantasia_roles'], difficultyLevel: 'intermediate' },

  // ═══════════════════════════════════════════
  // BONDAGE
  // ═══════════════════════════════════════════
  { id: 'bo_rope', category: 'bondage', name: 'Cuerdas (shibari)', description: 'Ataduras decorativas o restrictivas con cuerda.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate', suggestedGear: ['Cuerda de yute 6mm', 'Tijeras de seguridad'] },
  { id: 'bo_cuffs', category: 'bondage', name: 'Esposas y grilletes', description: 'Restricción física con cuero, metal o textil.', moods: ['poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'bo_restraints', category: 'bondage', name: 'Inmovilización completa', description: 'Ataduras en cama, silla, cruz o estructura.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate' },
  { id: 'bo_gags', category: 'bondage', name: 'Mordazas', description: 'Restricción verbal (ball gag, ring gag, tape).', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate', safetyTip: 'Siempre usar señal no verbal de emergencia. Nunca dejar sola a la persona amordazada.' },
  { id: 'bo_blindfold', category: 'bondage', name: 'Venda en ojos', description: 'Privación visual para intensificar las sensaciones.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'bo_suspension', category: 'bondage', name: 'Suspensión', description: 'Ataduras aéreas en suspensión (requiere experiencia técnica).', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Riesgo de lesión nerviosa grave. Solo con formación técnica. Máximo 15-20 min. Tener tijeras de emergencia.' },
  { id: 'bo_bondage_tape', category: 'bondage', name: 'Cinta de bondage', description: 'Inmovilización suave con cinta adhesiva de vinilo.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'bo_spreader', category: 'bondage', name: 'Barras separadoras', description: 'Mantener apertura de extremidades con barra.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'bo_vacuum_bed', category: 'bondage', name: 'Cama de vacío / latex', description: 'Inmovilización total en bolsa de vacío de látex.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Riesgo de asfixia. Supervisión constante obligatoria. Tener corte de emergencia.' },
  { id: 'bo_hogtie', category: 'bondage', name: 'Hogtie / atadura de 4 puntos', description: 'Unir muñecas y tobillos por la espalda.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'bo_breath_play_safe', category: 'bondage', name: 'Control de respiración suave', description: 'Sin obstrucción de vías aéreas, solo contención segura.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'NUNCA obstruir vías aéreas. Solo presión ligera lateral del cuello. Riesgo vital real.' },
  // NEW bondage
  { id: 'bo_mummification', category: 'bondage', name: 'Momificación', description: 'Envoltura completa del cuerpo con plástico, vendas o tela.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Vigilar temperatura corporal y respiración. Nunca cubrir la cara. Tener tijeras a mano.' },
  { id: 'bo_shibari_decorative', category: 'bondage', name: 'Shibari decorativo', description: 'Ataduras artísticas centradas en la estética, sin restricción fuerte.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'intermediate', suggestedGear: ['Cuerda de yute o algodón', 'Anillas de suspensión decorativa'] },
  { id: 'bo_self_bondage', category: 'bondage', name: 'Self-bondage guiado', description: 'Auto-atadura siguiendo instrucciones de la pareja a distancia.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Siempre tener método de escape inmediato. Nunca usar posiciones restrictivas solo/a.' },
  { id: 'bo_takate_kote', category: 'bondage', name: 'Arnés Takate Kote (Grown chest harness)', description: 'Arnés clásico de torso y brazos en Shibari.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate', safetyTip: 'Monitorear el nervio radial en la fosa del codo y axilas cada 10 min.' },
  { id: 'bo_bamboo_structure', category: 'bondage', name: 'Ataduras con bambú / estructuras', description: 'Inmovilización usando varas de bambú o estructuras metálicas.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium' },
  { id: 'bo_suspension_floor', category: 'bondage', name: 'Semisuspensión de suelo', description: 'Elevación parcial manteniendo un punto de apoyo en el piso.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate', safetyTip: 'Mantener tijeras EMT y nunca dejar sin supervisión directa.' },

  // ═══════════════════════════════════════════
  // IMPACT
  // ═══════════════════════════════════════════
  { id: 'im_spanking', category: 'impact', name: 'Nalgadas con mano', description: 'Impacto manual en glúteos u otras zonas acordadas.', moods: ['poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'im_paddle', category: 'impact', name: 'Paleta / Paddle', description: 'Impacto sordo con paleta de madera o cuero.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'im_flogger', category: 'impact', name: 'Flogger', description: 'Látigo de múltiples tiras para impacto picante o pesado.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate', suggestedGear: ['Flogger de cuero suave (principiantes)', 'Flogger de gamuza'] },
  { id: 'im_crop', category: 'impact', name: 'Fusta / Crop', description: 'Impacto preciso y localizado.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'im_whip', category: 'impact', name: 'Látigo de un solo ramal', description: 'Impacto de alta precisión (requiere técnica).', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Practicar en almohada antes. Puede causar heridas abiertas. Evitar zonas de riesgo (riñones, columna).' },
  { id: 'im_belt', category: 'impact', name: 'Cinturón', description: 'Impacto tradicional con cinturón de cuero.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'im_slapping', category: 'impact', name: 'Bofetadas consensuadas', description: 'Impacto facial o corporal muy negociado.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Nunca golpear en las sienes ni orejas. Solo en la mejilla con mano abierta. Alto riesgo emocional.' },
  { id: 'im_caning', category: 'impact', name: 'Vara / Caning', description: 'Impacto agudo con vara rígida de bambú o ratán.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Evitar zonas óseas y articulaciones. Solo en glúteos y muslos. Puede dejar marcas duraderas.' },
  { id: 'im_thuddy_vs_stinging', category: 'impact', name: 'Contraste sordo vs. picante', description: 'Alternar entre herramientas pesadas y picantes.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },

  // ═══════════════════════════════════════════
  // SENSATION
  // ═══════════════════════════════════════════
  { id: 'se_wax', category: 'sensation', name: 'Cera caliente', description: 'Goteo de cera corporal a temperatura segura.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'intermediate', safetyTip: 'Usar solo velas de parafina o soja. Nunca velas aromáticas (temperatura más alta). Probar en el antebrazo primero.' },
  { id: 'se_ice', category: 'sensation', name: 'Hielo y frío', description: 'Contraste térmico con hielo u objetos fríos.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'se_feather', category: 'sensation', name: 'Plumas y cosquillas', description: 'Estimulación ligera y teased de la piel.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'se_electro', category: 'sensation', name: 'Estimulación eléctrica (E-stim)', description: 'Uso de dispositivos electro-estimuladores seguros.', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Usar solo dispositivos diseñados para el cuerpo humano. Nunca usar cerca del pecho o cabeza.' },
  { id: 'se_clamps', category: 'sensation', name: 'Pinzas de pezón / cuerpo', description: 'Presión constante con pinzas regulables.', moods: ['poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'se_scratching', category: 'sensation', name: 'Arañazos y marcas', description: 'Marcas superficiales con uñas u objetos.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'se_sensory_deprivation', category: 'sensation', name: 'Privación sensorial total', description: 'Combinar vendas, tapones de oído y ataduras.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'se_massage', category: 'sensation', name: 'Masaje sensual / tántrico', description: 'Contacto corporal relajante enfocado en energía.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'se_vibration', category: 'sensation', name: 'Juguetes vibratorios', description: 'Estimulación con vibradores u ondas de presión.', moods: ['sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'se_latex_leather', category: 'sensation', name: 'Texturas látex y cuero', description: 'Estimulación táctil con prendas de látex, cuero o vinilo.', moods: ['sensual_relajante', 'fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'se_cupping', category: 'sensation', name: 'Ventosas / Cupping', description: 'Succión puntual en espalda o glúteos.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  // NEW sensation
  { id: 'se_wartenberg', category: 'sensation', name: 'Rueda Wartenberg', description: 'Rueda con puntas que estimula terminaciones nerviosas al rodarla por la piel.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'se_food_play', category: 'sensation', name: 'Food play', description: 'Usar alimentos (fruta, chocolate, crema) sobre el cuerpo para estimulación sensorial.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'se_body_paint', category: 'sensation', name: 'Body painting erótico', description: 'Pintar el cuerpo de la pareja con pinturas corporales seguras.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'se_temperature_play', category: 'sensation', name: 'Juego de temperaturas', description: 'Alternar entre objetos calientes y fríos (cristal, metal) sobre la piel.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'beginner' },

  // ═══════════════════════════════════════════
  // PSYCHOLOGICAL
  // ═══════════════════════════════════════════
  { id: 'ps_cnc', category: 'psychological', name: 'CNC (Consensual Non-Consent)', description: 'Fantasía de no-consentimiento simulado con límites estrictos.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'high', safetyTip: 'Negociación extremadamente detallada. Safewords y señales no verbales obligatorios. Alto riesgo emocional para ambos.' },
  { id: 'ps_fear_play', category: 'psychological', name: 'Fear play', description: 'Exploración de miedo controlado y suspenso acordado.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Puede activar respuestas de trauma. Conocer el historial emocional de la pareja. Aftercare obligatorio.' },
  { id: 'ps_tease_deny', category: 'psychological', name: 'Tease & Denial', description: 'Estimulación sin permitir clímax inmediato.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate' },
  { id: 'ps_objectification', category: 'psychological', name: 'Objetificación', description: 'Tratar a la persona como mueble o decoración (human furniture).', moods: ['fantasia_roles'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Alto impacto emocional. Aftercare intensivo obligatorio. Verificar bienestar constantemente.' },
  { id: 'ps_worship', category: 'psychological', name: 'Adoración de cuerpo / pies', description: 'Veneración de zonas del cuerpo (body / foot worship).', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ps_mind_control', category: 'psychological', name: 'Hipnosis y sugestión', description: 'Juego de trance, inducción o órdenes mentales.', moods: ['fantasia_roles'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Solo con formación en hipnosis erótica. No implantar sugestiones sin consentimiento explícito.' },
  { id: 'ps_edging', category: 'psychological', name: 'Edging prolongado', description: 'Mantener en el borde del clímax durante largo tiempo.', moods: ['poder_adrenalina', 'sensual_relajante'], difficultyLevel: 'intermediate' },
  { id: 'ps_forbidden', category: 'psychological', name: 'Fantasías tabú', description: 'Roleplay de escenarios prohibidos o ilícitos.', moods: ['fantasia_roles'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Diferenciar fantasía de realidad. Negociar contenido exacto. No presionar si hay incomodidad.' },
  { id: 'ps_humiliation_public', category: 'psychological', name: 'Humillación auditiva / sutil', description: 'Comentarios o instrucciones sugerentes en tono bajo.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },

  // ═══════════════════════════════════════════
  // SERVICE
  // ═══════════════════════════════════════════
  { id: 'sv_household', category: 'service', name: 'Servicio doméstico', description: 'Tareas del hogar realizadas como acto de devoción o rol.', moods: ['fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'sv_massage_service', category: 'service', name: 'Servicio de masaje', description: 'Brindar masajes o atención física como sumiso.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'sv_grooming', category: 'service', name: 'Cuidado y baño', description: 'Bañar, vestir o peinar al compañero/a.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'sv_waiting', category: 'service', name: 'Servicio en mesa / copa', description: 'Atender necesidades del dominante durante una velada.', moods: ['fantasia_roles'], difficultyLevel: 'intermediate' },
  { id: 'sv_kneeling', category: 'service', name: 'Postura de espera (hinkeln)', description: 'Permanecer arrodillado o a los pies esperando órdenes.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },

  // ═══════════════════════════════════════════
  // EXHIBITION & VOYEURISM
  // ═══════════════════════════════════════════
  { id: 'ex_public_subtle', category: 'exhibition', name: 'Juego discreto en público', description: 'Usar vibrador a distancia o tapones sin involucrar a terceros.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'ex_mirrors', category: 'exhibition', name: 'Juego frente a espejo', description: 'Observar la escena mediante espejos.', moods: ['sensual_relajante', 'fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'ex_voyeur', category: 'exhibition', name: 'Voyeurismo consensuado', description: 'Observar a la pareja mientras se estimula o viste.', moods: ['sensual_relajante', 'fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'ex_exhibition', category: 'exhibition', name: 'Exhibicionismo privado', description: 'Mostrarse o posar para la pareja.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'ex_photo_video', category: 'exhibition', name: 'Fotos y videos privados', description: 'Registrar escenas para consumo exclusivo entre ambos.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner', safetyTip: 'Acordar almacenamiento seguro y reglas de borrado. Nunca compartir sin consentimiento explícito.' },
  { id: 'ex_window_curtain', category: 'exhibition', name: 'Sombras y ventanas', description: 'Juego con luz y sombras detrás de cortinas.', moods: ['sensual_relajante', 'fantasia_roles'], difficultyLevel: 'intermediate' },

  // ═══════════════════════════════════════════
  // INTIMACY & EMOTIONAL
  // ═══════════════════════════════════════════
  { id: 'in_eye_contact', category: 'intimacy', name: 'Contacto visual sostenido', description: 'Mirarse a los ojos durante 5 minutos en silencio.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'in_slow_touch', category: 'intimacy', name: 'Contacto ultra lento', description: 'Caricias lentas en zonas no genitales.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'in_breath_sync', category: 'intimacy', name: 'Sincronización respiratoria', description: 'Respirar al mismo ritmo abrazados.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'in_vulnerability', category: 'intimacy', name: 'Compartir secretos eróticos', description: 'Revelar fantasías profundas con escucha sin juicio.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'in_extended_foreplay', category: 'intimacy', name: 'Juegos previos sin prisa', description: 'Dedicarse 1 hora a los juegos previos sin meta de penetración.', moods: ['romantico_afectivo', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'in_edging_hug', category: 'intimacy', name: 'Abrazo de alta frecuencia', description: 'Contacto cuerpo a cuerpo con máxima tensión romántica.', moods: ['romantico_afectivo', 'sensual_relajante'], difficultyLevel: 'beginner' },
  // NEW intimacy
  { id: 'in_tantra', category: 'intimacy', name: 'Tantra', description: 'Prácticas tántricas de respiración, energía y conexión sexual consciente.', moods: ['romantico_afectivo', 'sensual_relajante'], difficultyLevel: 'intermediate' },
  { id: 'in_meditation', category: 'intimacy', name: 'Meditación erótica en pareja', description: 'Meditación guiada enfocada en la energía sexual y la conexión.', moods: ['romantico_afectivo', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'in_shared_journal', category: 'intimacy', name: 'Journaling erótico compartido', description: 'Escribir fantasías y deseos en un diario compartido.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'in_love_letters', category: 'intimacy', name: 'Cartas eróticas', description: 'Escribir y compartir cartas de deseo, fantasía o agradecimiento.', moods: ['romantico_afectivo', 'fantasia_roles'], difficultyLevel: 'beginner' },

  // ═══════════════════════════════════════════
  // AFTERCARE
  // ═══════════════════════════════════════════
  { id: 'ac_cuddling', category: 'aftercare', name: 'Abrazos y contacto físico', description: 'Cuchareo, mantas y contacto suave tras la escena.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_talk', category: 'aftercare', name: 'Charla de descompresión', description: 'Hablar sobre lo que gustó y cómo se sintieron.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_blanket_tea', category: 'aftercare', name: 'Té caliente y mantas', description: 'Atención física: bebida tibia, comida o chocolates.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_quiet_time', category: 'aftercare', name: 'Tiempo en silencio acompañados', description: 'Estar juntos sin necesidad de hablar hasta volver a la realidad.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_bath', category: 'aftercare', name: 'Baño de agua tibia juntos', description: 'Lavado suave y relajación muscular posterior.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_reassurance', category: 'aftercare', name: 'Validación emocional', description: 'Palabras de afecto y seguridad por parte del dominante.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  // NEW aftercare
  { id: 'ac_kit', category: 'aftercare', name: 'Kit de aftercare personalizado', description: 'Preparar un kit con snacks, mantas, agua y música para después de la escena.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_remote', category: 'aftercare', name: 'Aftercare a distancia', description: 'Check-in por mensaje o llamada cuando la escena fue virtual o se separaron.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ac_afterdrop_check', category: 'aftercare', name: 'Afterdrop check-in', description: 'Revisión emocional 24-48h después de la escena para detectar bajones.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },

  // ═══════════════════════════════════════════
  // ROLEPLAY (NEW CATEGORY)
  // ═══════════════════════════════════════════
  { id: 'rp_doctor', category: 'roleplay', name: 'Médico / paciente', description: 'Examen médico simulado con elementos de vulnerabilidad y control.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'rp_teacher', category: 'roleplay', name: 'Profesor / alumno', description: 'Dinámica de autoridad académica con reglas y castigos.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'rp_strangers', category: 'roleplay', name: 'Desconocidos en un bar', description: 'Simular un encuentro casual con la pareja en un lugar público.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'rp_captor', category: 'roleplay', name: 'Captor / cautivo', description: 'Escenario de captura y retención consensuada.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Negociar límites de restricción y duración. Safeword y señal no verbal obligatorios.' },
  { id: 'rp_boss', category: 'roleplay', name: 'Jefe / empleado', description: 'Dinámica de autoridad laboral con tareas y evaluaciones.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'rp_cosplay', category: 'roleplay', name: 'Cosplay erótico', description: 'Disfrazarse de personajes de ficción o fantasía para la escena.', moods: ['fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'rp_stripper', category: 'roleplay', name: 'Striptease privado', description: 'Realizar un baile sensual con desnudo gradual para la pareja.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'rp_photographer', category: 'roleplay', name: 'Fotógrafo / modelo', description: 'Sesión de fotos erótica con poses dirigidas y cosplay.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'rp_interrogation', category: 'roleplay', name: 'Interrogatorio', description: 'Escena de interrogación con presión psicológica y resistencia.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Alto impacto emocional. Evitar si hay historial de trauma. Aftercare obligatorio.' },
  { id: 'rp_bodyguard', category: 'roleplay', name: 'Guardaespaldas / protegido', description: 'Dinámica protectora donde uno cuida físicamente al otro.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'rp_trainer', category: 'roleplay', name: 'Entrenador / atleta', description: 'Dinámica deportiva con disciplina, ejercicio y recompensas.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'rp_maid', category: 'roleplay', name: 'Sirvienta / mayordomo', description: 'Servicio doméstico con uniformes y protocolos de atención.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },

  // ═══════════════════════════════════════════
  // TOYS & GEAR (NEW CATEGORY)
  // ═══════════════════════════════════════════
  { id: 'tg_plugs', category: 'toys_gear', name: 'Plugs anales', description: 'Estimulación anal con plugs de silicona, acero o vidrio.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'intermediate', safetyTip: 'Usar siempre lubricante adecuado. Solo juguetes con base ancha de seguridad.' },
  { id: 'tg_dildos', category: 'toys_gear', name: 'Dildos y falos', description: 'Penetración con juguetes de diversos tamaños y materiales.', moods: ['sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'tg_strapon', category: 'toys_gear', name: 'Strap-on / pegging', description: 'Penetración con arnés y dildo, independiente del género.', moods: ['poder_adrenalina', 'fantasia_roles'], difficultyLevel: 'intermediate' },
  { id: 'tg_machines', category: 'toys_gear', name: 'Máquinas de placer', description: 'Uso de máquinas mecánicas de estimulación (fucking machines).', moods: ['poder_adrenalina'], difficultyLevel: 'advanced', riskLevel: 'medium', safetyTip: 'Empezar con velocidad mínima. Tener acceso al botón de apagado inmediato.' },
  { id: 'tg_pump', category: 'toys_gear', name: 'Bombas de succión', description: 'Succión genital o de pezones con bombas de vacío.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'tg_balls', category: 'toys_gear', name: 'Bolas chinas / kegel', description: 'Bolas internas para estimulación progresiva y entrenamiento.', moods: ['sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'tg_wand', category: 'toys_gear', name: 'Magic wand / masajeador', description: 'Vibrador potente de uso externo para estimulación intensa.', moods: ['sensual_relajante'], difficultyLevel: 'beginner' },
  { id: 'tg_rings', category: 'toys_gear', name: 'Cockrings / anillos', description: 'Anillos para mantener la erección o intensificar la estimulación.', moods: ['sensual_relajante', 'poder_adrenalina'], difficultyLevel: 'beginner', safetyTip: 'Máximo 30 min de uso continuo. Retirar inmediatamente si hay dolor o color azulado.' },
  { id: 'tg_remote', category: 'toys_gear', name: 'Juguetes de control remoto', description: 'Vibradores o plugs controlados por app o mando a distancia.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'beginner' },
  { id: 'tg_harness', category: 'toys_gear', name: 'Arneses corporales', description: 'Arneses decorativos o funcionales de cuero, nylon o elástico.', moods: ['fantasia_roles', 'sensual_relajante'], difficultyLevel: 'beginner' },

  // ═══════════════════════════════════════════
  // LIFESTYLE (NEW CATEGORY)
  // ═══════════════════════════════════════════
  { id: 'ls_journal', category: 'lifestyle', name: 'Diario de sumisión', description: 'Registro diario de pensamientos, emociones y experiencias dentro de la dinámica.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ls_checkin', category: 'lifestyle', name: 'Check-in emocional diario', description: 'Rutina diaria de compartir estado emocional y necesidades con la pareja.', moods: ['romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ls_collar_ritual', category: 'lifestyle', name: 'Ritual de collar', description: 'Ceremonia de colocación y retiro del collar como símbolo de la dinámica.', moods: ['fantasia_roles', 'romantico_afectivo'], difficultyLevel: 'intermediate' },
  { id: 'ls_public_protocol', category: 'lifestyle', name: 'Protocolo público discreto', description: 'Señales, códigos o reglas sutiles practicadas en espacios públicos.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'ls_posture_training', category: 'lifestyle', name: 'Entrenamiento postural', description: 'Practicar posturas específicas de sumisión como ejercicio diario.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
  { id: 'ls_dress_code', category: 'lifestyle', name: 'Dress code acordado', description: 'Código de vestimenta elegido por el dominante para escenas o eventos.', moods: ['fantasia_roles'], difficultyLevel: 'beginner' },
  { id: 'ls_scene_playlist', category: 'lifestyle', name: 'Playlist de escena', description: 'Curar música específica para diferentes tipos de escenas y ambientes.', moods: ['sensual_relajante', 'romantico_afectivo'], difficultyLevel: 'beginner' },
  { id: 'ls_contract', category: 'lifestyle', name: 'Contratos de dinámica', description: 'Documento formal con acuerdos, límites, roles y revisiones periódicas.', moods: ['fantasia_roles', 'poder_adrenalina'], difficultyLevel: 'intermediate' },
];

import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';

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
  'roleplay',
  'toys_gear',
  'lifestyle',
];

// Storage key for user-defined custom activities
const STORAGE_KEY_CUSTOM_ACTIVITIES = 'user_custom_activities_v1';

// Dynamically register custom activities added by the user
let dynamicCustomActivities: Activity[] = [];

export function registerCustomActivity(activity: Activity): void {
  if (!dynamicCustomActivities.some((a) => a.id === activity.id)) {
    dynamicCustomActivities.push(activity);
  }
}

export async function loadUserCustomActivities(): Promise<Activity[]> {
  try {
    const saved = await readJsonStorage<Activity[]>(STORAGE_KEY_CUSTOM_ACTIVITIES, []);
    if (Array.isArray(saved)) {
      dynamicCustomActivities = saved;
      return saved;
    }
  } catch {
    // Ignore load error
  }
  return dynamicCustomActivities;
}

export async function saveUserCustomActivity(newActivity: Omit<Activity, 'id'>): Promise<Activity> {
  const customId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullActivity: Activity = {
    ...newActivity,
    id: customId,
  };

  const current = await loadUserCustomActivities();
  const updated = [fullActivity, ...current];
  dynamicCustomActivities = updated;
  await writeJsonStorage(STORAGE_KEY_CUSTOM_ACTIVITIES, updated);
  return fullActivity;
}

export async function deleteUserCustomActivity(id: string): Promise<void> {
  const current = await loadUserCustomActivities();
  const updated = current.filter((a) => a.id !== id);
  dynamicCustomActivities = updated;
  await writeJsonStorage(STORAGE_KEY_CUSTOM_ACTIVITIES, updated);
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

/**
 * Returns localized name for an activity, falling back to activity.name.
 */
export function getActivityName(activity: Activity): string {
  const key = `activity.${activity.id}.name`;
  const translated = t(key);
  return translated !== key ? translated : activity.name;
}

/**
 * Returns localized description for an activity, falling back to activity.description.
 */
export function getActivityDescription(activity: Activity): string {
  const key = `activity.${activity.id}.desc`;
  const translated = t(key);
  return translated !== key ? translated : activity.description;
}

/**
 * Returns localized safety tip for an activity, if any, falling back to activity.safetyTip.
 */
export function getActivitySafetyTip(activity: Activity): string | undefined {
  if (!activity.safetyTip) return undefined;
  const key = `activity.${activity.id}.safety`;
  const translated = t(key);
  return translated !== key ? translated : activity.safetyTip;
}

/**
 * Returns localized category label for an activity category, falling back to CATEGORY_LABELS[category].
 */
export function getCategoryLabel(category: ActivityCategory): string {
  const key = `category.${category}`;
  const translated = t(key);
  return translated !== key ? translated : CATEGORY_LABELS[category] ?? category;
}

