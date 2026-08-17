import { ACTIVITIES, getActivityById } from '@/data/activities';
import { generateReport } from '@/lib/compatibility';
import { ActivityResponse, Rating, Session } from '@/types';

export interface SessionDiffItem {
  activityId: string;
  activityName: string;
  category: string;
  oldRatingP1?: Rating;
  newRatingP1?: Rating;
  oldRatingP2?: Rating;
  newRatingP2?: Rating;
  changeType: 'new_match' | 'new_opening' | 'new_limit' | 'role_changed';
  description: string;
}

export interface SessionDiffReport {
  sessionA: { id: string; date: string; partnerName: string; score: number };
  sessionB: { id: string; date: string; partnerName: string; score: number };
  scoreDelta: number;
  newMatches: SessionDiffItem[];
  newOpenings: SessionDiffItem[];
  newLimits: SessionDiffItem[];
  totalChanges: number;
}

const POSITIVE: Rating[] = ['curious', 'like', 'love'];

function isPositive(r?: Rating): boolean {
  return !!r && POSITIVE.includes(r);
}

function isHardLimit(r?: Rating): boolean {
  return r === 'hard_limit';
}

export function compareSessions(oldSession: Session, newSession: Session): SessionDiffReport {
  const oldRep = generateReport(
    oldSession.id,
    oldSession.initiatorResponses ?? [],
    oldSession.guestResponses ?? [],
    oldSession.initiatorProfile,
    oldSession.guestProfile
  );

  const newRep = generateReport(
    newSession.id,
    newSession.initiatorResponses ?? [],
    newSession.guestResponses ?? [],
    newSession.initiatorProfile,
    newSession.guestProfile
  );

  const oldScore = oldRep.compatibilityScore;
  const newScore = newRep.compatibilityScore;
  const scoreDelta = newScore - oldScore;

  const oldP1Map = Object.fromEntries((oldSession.initiatorResponses ?? []).map((r) => [r.activityId, r]));
  const oldP2Map = Object.fromEntries((oldSession.guestResponses ?? []).map((r) => [r.activityId, r]));
  const newP1Map = Object.fromEntries((newSession.initiatorResponses ?? []).map((r) => [r.activityId, r]));
  const newP2Map = Object.fromEntries((newSession.guestResponses ?? []).map((r) => [r.activityId, r]));

  const allActivityIds = Array.from(
    new Set([
      ...Object.keys(oldP1Map),
      ...Object.keys(oldP2Map),
      ...Object.keys(newP1Map),
      ...Object.keys(newP2Map),
    ])
  );

  const newMatches: SessionDiffItem[] = [];
  const newOpenings: SessionDiffItem[] = [];
  const newLimits: SessionDiffItem[] = [];

  allActivityIds.forEach((actId) => {
    const act = getActivityById(actId) || ACTIVITIES.find((a) => a.id === actId);
    const actName = act?.name || actId;
    const category = act?.category || 'general';

    const old1 = oldP1Map[actId]?.rating;
    const old2 = oldP2Map[actId]?.rating;
    const new1 = newP1Map[actId]?.rating;
    const new2 = newP2Map[actId]?.rating;

    const oldWasMatch = isPositive(old1) && isPositive(old2);
    const newIsMatch = isPositive(new1) && isPositive(new2);

    const oldHadLimit = isHardLimit(old1) || isHardLimit(old2);
    const newHasLimit = isHardLimit(new1) || isHardLimit(new2);

    // 1. New Match
    if (!oldWasMatch && newIsMatch) {
      newMatches.push({
        activityId: actId,
        activityName: actName,
        category,
        oldRatingP1: old1,
        newRatingP1: new1,
        oldRatingP2: old2,
        newRatingP2: new2,
        changeType: 'new_match',
        description: '¡Nuevo Match Mutuo! Ambos coinciden ahora en esta práctica.',
      });
    }

    // 2. New Opening (was limit or not interested, now positive)
    if ((oldHadLimit || !isPositive(old1) || !isPositive(old2)) && !newHasLimit && (isPositive(new1) || isPositive(new2)) && !newIsMatch) {
      newOpenings.push({
        activityId: actId,
        activityName: actName,
        category,
        oldRatingP1: old1,
        newRatingP1: new1,
        oldRatingP2: old2,
        newRatingP2: new2,
        changeType: 'new_opening',
        description: 'Nueva apertura o curiosidad registrada.',
      });
    }

    // 3. New Limit (recently set as hard_limit)
    if (!oldHadLimit && newHasLimit) {
      newLimits.push({
        activityId: actId,
        activityName: actName,
        category,
        oldRatingP1: old1,
        newRatingP1: new1,
        oldRatingP2: old2,
        newRatingP2: new2,
        changeType: 'new_limit',
        description: 'Nuevo Límite Duro marcado para mayor seguridad.',
      });
    }
  });

  const totalChanges = newMatches.length + newOpenings.length + newLimits.length;

  return {
    sessionA: {
      id: oldSession.id,
      date: oldSession.completedAt || oldSession.createdAt,
      partnerName: oldSession.guestNickname || 'Pareja',
      score: oldScore,
    },
    sessionB: {
      id: newSession.id,
      date: newSession.completedAt || newSession.createdAt,
      partnerName: newSession.guestNickname || 'Pareja',
      score: newScore,
    },
    scoreDelta,
    newMatches,
    newOpenings,
    newLimits,
    totalChanges,
  };
}

export function generateDiffMarkdownReport(diff: SessionDiffReport): string {
  let md = `# Reporte de Evolución Temporal (Diff) 📈\n\n`;
  md += `**Vínculo:** ${diff.sessionB.partnerName}\n`;
  md += `**Comparación:** Sesión del ${new Date(diff.sessionA.date).toLocaleDateString()} ➔ Sesión del ${new Date(diff.sessionB.date).toLocaleDateString()}\n`;
  md += `**Diferencia de Compatibilidad (Δ Score):** ${diff.scoreDelta >= 0 ? `+${diff.scoreDelta}%` : `${diff.scoreDelta}%`} (${diff.sessionA.score}% ➔ ${diff.sessionB.score}%)\n\n`;

  md += `## 🎉 Nuevos Matches Mutuos (${diff.newMatches.length})\n`;
  if (diff.newMatches.length === 0) {
    md += `*Sin nuevos matches mutuos respecto a la sesión anterior.*\n\n`;
  } else {
    diff.newMatches.forEach((item) => {
      md += `- **${item.activityName}**: ¡Coincidencia mutua alcanzada!\n`;
    });
    md += `\n`;
  }

  md += `## 🔓 Nuevas Aperturas & Curiosidad (${diff.newOpenings.length})\n`;
  if (diff.newOpenings.length === 0) {
    md += `*Sin cambios de apertura de curiosidad registrados.*\n\n`;
  } else {
    diff.newOpenings.forEach((item) => {
      md += `- **${item.activityName}**: Interés en exploración registrado.\n`;
    });
    md += `\n`;
  }

  md += `## 🛑 Nuevos Límites Duros (${diff.newLimits.length})\n`;
  if (diff.newLimits.length === 0) {
    md += `*Sin nuevos límites duros añadidos.*\n\n`;
  } else {
    diff.newLimits.forEach((item) => {
      md += `- **${item.activityName}**: Marcado como Límite Duro de seguridad.\n`;
    });
    md += `\n`;
  }

  return md;
}
