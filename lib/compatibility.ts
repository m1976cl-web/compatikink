import { ACTIVITIES, getActivityById } from '@/data/activities';
import {
  ActivityCategory,
  ActivityResponse,
  CompatibilityReport,
  Rating,
  ReportItem,
  ReportSectionType,
  RATING_VALUES,
  UserProfile,
} from '@/types';

const POSITIVE: Rating[] = ['curious', 'like', 'love'];

function isPositive(rating: Rating): boolean {
  return POSITIVE.includes(rating);
}

function isHardLimit(rating: Rating): boolean {
  return rating === 'hard_limit';
}

function classifyPair(
  initiator: ActivityResponse,
  guest: ActivityResponse
): ReportSectionType {
  const iRating = initiator.rating;
  const gRating = guest.rating;

  if (isHardLimit(iRating) || isHardLimit(gRating)) {
    if (
      (isHardLimit(iRating) && isPositive(gRating)) ||
      (isHardLimit(gRating) && isPositive(iRating))
    ) {
      return 'hard_limit_conflict';
    }
  }

  const iPositive = isPositive(iRating);
  const gPositive = isPositive(gRating);

  // One of them is curious and the other has positive interest (curious, like or love)
  if (
    (iRating === 'curious' && gPositive) ||
    (gRating === 'curious' && iPositive)
  ) {
    return 'explore_together';
  }

  if (iPositive && gPositive) {
    const roleClash =
      initiator.role !== 'flexible' &&
      guest.role !== 'flexible' &&
      initiator.role !== guest.role &&
      initiator.role !== 'both' &&
      guest.role !== 'both';
    const intensityGap = Math.abs(initiator.intensity - guest.intensity) >= 2;

    if (roleClash || intensityGap) {
      return 'role_mismatch';
    }
    return 'mutual_match';
  }

  if (iPositive && !gPositive) {
    return 'initiator_only';
  }

  if (gPositive && !iPositive) {
    return 'guest_only';
  }

  return 'initiator_only';
}

function buildPrompt(section: ReportSectionType, activityName: string): string | undefined {
  switch (section) {
    case 'mutual_match':
      return `¿Cómo os gustaría explorar "${activityName}" la primera vez?`;
    case 'explore_together':
      return `Uno tiene curiosidad sobre "${activityName}". ¿Qué os gustaría probar primero?`;
    case 'hard_limit_conflict':
      return `"${activityName}" cruza un límite duro. Acordad respeto mutuo sin presión.`;
    case 'role_mismatch':
      return `En "${activityName}", ¿cómo encajan vuestros roles e intensidad?`;
    case 'guest_only':
      return `"${activityName}" les interesa. ¿Te apetece conversarlo sin compromiso?`;
    default:
      return undefined;
  }
}

export function generateReport(
  sessionId: string,
  initiatorResponses: ActivityResponse[],
  guestResponses: ActivityResponse[],
  initiatorProfile?: UserProfile,
  guestProfile?: UserProfile
): CompatibilityReport {
  const guestMap = new Map(guestResponses.map((r) => [r.activityId, r]));
  const items: ReportItem[] = [];

  for (const initiator of initiatorResponses) {
    const guest = guestMap.get(initiator.activityId);
    if (!guest) continue;

    const activity = getActivityById(initiator.activityId);
    if (!activity) continue;

    const iPositive = isPositive(initiator.rating);
    const gPositive = isPositive(guest.rating);

    // Skip if neither party has a positive interest (curious, like, love)
    if (!iPositive && !gPositive) {
      continue;
    }

    const section = classifyPair(initiator, guest);

    items.push({
      activityId: activity.id,
      activityName: activity.name,
      category: activity.category,
      section,
      initiatorRating: initiator.rating,
      guestRating: guest.rating,
      initiatorRole: initiator.role,
      guestRole: guest.role,
      initiatorIntensity: initiator.intensity,
      guestIntensity: guest.intensity,
      conversationPrompt: buildPrompt(section, activity.name),
    });
  }

  const mutualMatchCount = items.filter((i) => i.section === 'mutual_match').length;
  const exploreCount = items.filter((i) => i.section === 'explore_together').length;
  const conflictCount = items.filter(
    (i) => i.section === 'hard_limit_conflict' || i.section === 'role_mismatch'
  ).length;

  let scoreSum = 0;
  let scoreWeight = 0;

  for (const item of items) {
    if (item.section === 'mutual_match') {
      scoreSum += 100;
      scoreWeight += 1;
    } else if (item.section === 'explore_together') {
      scoreSum += 70;
      scoreWeight += 1;
    } else if (item.section === 'role_mismatch') {
      scoreSum += 50;
      scoreWeight += 1;
    }
    // hard_limit_conflict is a blocker banner, not a 0% average dilutor
  }

  const compatibilityScore =
    scoreWeight > 0 ? Math.round(scoreSum / scoreWeight) : 0;

  const conversationOrder = [
    ...items.filter((i) => i.section === 'hard_limit_conflict').map((i) => i.activityId),
    ...items.filter((i) => i.section === 'mutual_match').map((i) => i.activityId),
    ...items.filter((i) => i.section === 'explore_together').map((i) => i.activityId),
    ...items.filter((i) => i.section === 'role_mismatch').map((i) => i.activityId),
    ...items.filter((i) => i.section === 'guest_only').map((i) => i.activityId),
  ];

  const initiatorCompass = calculateUserCompass(initiatorResponses);
  const guestCompass = calculateUserCompass(guestResponses);

  const initiatorArchetype = determineArchetype(initiatorResponses, initiatorCompass.y);
  const guestArchetype = determineArchetype(guestResponses, guestCompass.y);

  const categoryCompatibilities = calculateCategoryCompatibilities(items);

  const initiatorOnlyCount = items.filter((i) => i.section === 'initiator_only').length;
  const guestOnlyCount = items.filter((i) => i.section === 'guest_only').length;
  const sharedCount = items.filter(
    (i) => i.section === 'mutual_match' || i.section === 'explore_together' || i.section === 'role_mismatch'
  ).length;

  return {
    sessionId,
    generatedAt: new Date().toISOString(),
    compatibilityScore,
    mutualMatchCount,
    exploreCount,
    conflictCount,
    items,
    conversationOrder,
    initiatorCompass,
    guestCompass,
    initiatorArchetype,
    guestArchetype,
    categoryCompatibilities,
    overlapStats: {
      initiatorOnlyCount,
      guestOnlyCount,
      sharedCount,
    },
    initiatorProfile,
    guestProfile,
  };
}

export function filterReportForSharing(
  report: CompatibilityReport,
  includeSections: ReportSectionType[]
): CompatibilityReport {
  const filteredItems = report.items.filter((i) => includeSections.includes(i.section));
  return {
    ...report,
    items: filteredItems,
    mutualMatchCount: filteredItems.filter((i) => i.section === 'mutual_match').length,
    exploreCount: filteredItems.filter((i) => i.section === 'explore_together').length,
    conflictCount: filteredItems.filter(
      (i) => i.section === 'hard_limit_conflict' || i.section === 'role_mismatch'
    ).length,
  };
}

export function ratingEmoji(rating: Rating): string {
  switch (rating) {
    case 'hard_limit':
      return '🔴';
    case 'not_interested':
      return '⚪';
    case 'curious':
      return '💡';
    case 'like':
      return '💜';
    case 'love':
      return '🔥';
  }
}

export function averageRatingValue(responses: ActivityResponse[]): number {
  if (responses.length === 0) return 0;
  const sum = responses.reduce((acc, r) => acc + RATING_VALUES[r.rating], 0);
  return sum / responses.length;
}

export function calculateUserCompass(responses: ActivityResponse[]): { x: number; y: number } {
  let xSum = 0;
  let ySum = 0;
  let yCount = 0;

  for (const r of responses) {
    if (isPositive(r.rating)) {
      const ratingValue = r.rating === 'love' ? 3 : r.rating === 'like' ? 2 : 1;
      xSum += ratingValue * r.intensity;

      if (r.role === 'give') {
        ySum += 1;
        yCount += 1;
      } else if (r.role === 'receive') {
        ySum -= 1;
        yCount += 1;
      } else if (r.role === 'both' || r.role === 'flexible') {
        yCount += 1;
      }
    }
  }

  const rawX = Math.min(100, Math.round((xSum / 150) * 100));
  const x = Math.max(5, Math.min(95, rawX));

  const rawY = yCount > 0 ? Math.round((ySum / yCount) * 100) : 0;
  const y = Math.max(5, Math.min(95, 50 + (rawY / 2)));

  return { x, y };
}

export const calculateCompassPoint = calculateUserCompass;

export function determineArchetype(responses: ActivityResponse[], compassY: number): string {
  const roleScore = (compassY - 50) * 2;

  const categoryScores: Record<string, number> = {};
  for (const r of responses) {
    if (isPositive(r.rating)) {
      const activity = getActivityById(r.activityId);
      if (activity) {
        const ratingValue = r.rating === 'love' ? 3 : r.rating === 'like' ? 2 : 1;
        const score = ratingValue * r.intensity;
        categoryScores[activity.category] = (categoryScores[activity.category] || 0) + score;
      }
    }
  }

  let topCategory: string = 'intimacy';
  let maxScore = -1;
  for (const cat in categoryScores) {
    if (categoryScores[cat] > maxScore) {
      maxScore = categoryScores[cat];
      topCategory = cat;
    }
  }

  if (maxScore === -1) {
    return 'Explorador Neutro';
  }

  if (roleScore > 20) {
    switch (topCategory) {
      case 'power_exchange': return 'Líder Dominante';
      case 'bondage': return 'Creador de Nudos (Riggr)';
      case 'impact': return 'Sádico de Impacto';
      case 'sensation': return 'Dominante Sensorial';
      case 'psychological': return 'Dominante Mental';
      case 'service': return 'Amo Exigente';
      case 'exhibition': return 'Exhibicionista Alfa';
      case 'intimacy': return 'Guía Íntimo';
      case 'aftercare': return 'Protector Atento';
      default: return 'Dominante Activo';
    }
  } else if (roleScore < -20) {
    switch (topCategory) {
      case 'power_exchange': return 'Sumiso Devoto';
      case 'bondage': return 'Sub de Ataduras';
      case 'impact': return 'Masoquista de Impacto';
      case 'sensation': return 'Receptor Sensorial';
      case 'psychological': return 'Sumiso Psicológico';
      case 'service': return 'Servidor Entregado';
      case 'exhibition': return 'Objeto de Deseo';
      case 'intimacy': return 'Sumiso Romántico';
      case 'aftercare': return 'Receptor de Cuidados';
      default: return 'Sumiso Receptivo';
    }
  } else {
    switch (topCategory) {
      case 'power_exchange': return 'Switch Versátil';
      case 'bondage': return 'Amante del Shibari';
      case 'impact': return 'Switch de Impacto';
      case 'sensation': return 'Explorador Sensorial';
      case 'psychological': return 'Switch Mental';
      case 'service': return 'Switch Servicial';
      case 'exhibition': return 'Voyeur / Exhibicionista';
      case 'intimacy': return 'Socio de Intimidad';
      case 'aftercare': return 'Cuidador Recíproco';
      default: return 'Explorador Switch';
    }
  }
}

export function calculateCategoryCompatibilities(items: ReportItem[]): Record<string, number> {
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const result: Record<string, number> = {};

  for (const cat of categories) {
    const catItems = items.filter((i) => i.category === cat);
    let scoreSum = 0;
    let scoreWeight = 0;

    for (const item of catItems) {
      if (item.section === 'mutual_match') {
        scoreSum += 100;
        scoreWeight += 1;
      } else if (item.section === 'explore_together') {
        scoreSum += 70;
        scoreWeight += 1;
      } else if (item.section === 'role_mismatch') {
        scoreSum += 50;
        scoreWeight += 1;
      }
      // hard_limit_conflict excluded from category % (surfaced separately in UI)
    }

    result[cat] = scoreWeight > 0 ? Math.round(scoreSum / scoreWeight) : 100;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// P1.4 — GUIÓN DE CONVERSACIÓN GUIADO DE 10 MINUTOS (Accionable & ZK)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversationGuidePhase {
  phase: number;
  title: string;
  durationMinutes: number;
  icon: string;
  objective: string;
  suggestedQuestions: string[];
  activities: {
    activityId: string;
    activityName: string;
    category: ActivityCategory;
    section: ReportSectionType;
    prompt?: string;
  }[];
}

export interface ConversationGuide {
  totalDurationMinutes: number;
  phases: ConversationGuidePhase[];
  formattedMarkdown: string;
}

export function generate10MinConversationGuide(report: CompatibilityReport): ConversationGuide {
  const mutuals = report.items.filter((i) => i.section === 'mutual_match');
  const explores = report.items.filter((i) => i.section === 'explore_together');
  const mismatches = report.items.filter((i) => i.section === 'role_mismatch');
  const hardLimits = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const guestOnly = report.items.filter((i) => i.section === 'guest_only');

  const phase1: ConversationGuidePhase = {
    phase: 1,
    title: 'Fase 1: Rompehielos & Coincidencias Mutuas',
    durationMinutes: 2,
    icon: '💬',
    objective: 'Celebrar los deseos y actividades en las que ambos coinciden activamente.',
    suggestedQuestions: [
      '¿Qué coincidencia mutua fue la que más te sorprendió o entusiasmó?',
      '¿Cuál de estas actividades compartidas te gustaría agendar primero?',
    ],
    activities: mutuals.slice(0, 5).map((i) => ({
      activityId: i.activityId,
      activityName: i.activityName,
      category: i.category,
      section: i.section,
      prompt: i.conversationPrompt,
    })),
  };

  const phase2: ConversationGuidePhase = {
    phase: 2,
    title: 'Fase 2: Exploración de Fantasías & Roles',
    durationMinutes: 4,
    icon: '🔮',
    objective: 'Explorar curiosidades e intereses asimétricos con apertura y sin presiones.',
    suggestedQuestions: [
      '¿Bajo qué condiciones o ritmo te sentirías cómodo/a probando una curiosidad?',
      '¿Cómo podemos ajustar la intensidad y los roles para que ambos disfrutemos?',
    ],
    activities: [...explores, ...mismatches, ...guestOnly].slice(0, 6).map((i) => ({
      activityId: i.activityId,
      activityName: i.activityName,
      category: i.category,
      section: i.section,
      prompt: i.conversationPrompt,
    })),
  };

  const phase3: ConversationGuidePhase = {
    phase: 3,
    title: 'Fase 3: Consentimiento, Límites & Safewords',
    durationMinutes: 4,
    icon: '🛡️',
    objective: 'Alinear acuerdos, límites infranqueables y protocolo de cuidado posterior (Aftercare).',
    suggestedQuestions: [
      'Confirmemos vuestras Palabras de Seguridad (Rojo = Detener, Amarillo = Pausa/Bajar intensidad).',
      '¿Qué necesita cada uno después de jugar? (Ej: abrazo, agua, silencio, conversación).',
    ],
    activities: hardLimits.slice(0, 5).map((i) => ({
      activityId: i.activityId,
      activityName: i.activityName,
      category: i.category,
      section: i.section,
      prompt: i.conversationPrompt,
    })),
  };

  const phases = [phase1, phase2, phase3];

  let md = `# 🗣️ Guión de Conversación Guiado de 10 Minutos — CompatKink\n\n`;
  md += `**Puntaje de Compatibilidad:** ${report.compatibilityScore}%\n`;
  md += `**Coincidencias Mutuas:** ${report.mutualMatchCount} | **Por Explorar:** ${report.exploreCount}\n\n`;

  for (const p of phases) {
    md += `## ${p.icon} ${p.title} (${p.durationMinutes} min)\n`;
    md += `> **Objetivo:** ${p.objective}\n\n`;
    md += `### ❓ Preguntas Sugeridas:\n`;
    for (const q of p.suggestedQuestions) {
      md += `- ${q}\n`;
    }
    if (p.activities.length > 0) {
      md += `\n### 📌 Actividades Destacadas:\n`;
      for (const a of p.activities) {
        md += `- **${a.activityName}** (${a.category}) ${a.prompt ? `— *${a.prompt}*` : ''}\n`;
      }
    }
    md += `\n---\n\n`;
  }

  md += `🔒 *Este guión ha sido generado de forma 100% local en tu dispositivo con cifrado Zero-Knowledge.*`;

  return {
    totalDurationMinutes: 10,
    phases,
    formattedMarkdown: md,
  };
}
