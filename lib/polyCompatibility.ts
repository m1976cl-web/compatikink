import { ACTIVITIES, getActivityById } from '@/data/activities';
import { ActivityResponse, Rating } from '@/types';

export interface GroupParticipant {
  name: string;
  responses: ActivityResponse[];
}

export interface PolyGroupItem {
  activityId: string;
  activityName: string;
  category: string;
  isUnanimousMatch: boolean;
  isGroupHardLimit: boolean;
  vetoedBy: string[];
  positiveBy: string[];
  consensusScore: number;
}

export interface PairwiseScore {
  p1Name: string;
  p2Name: string;
  score: number;
  mutualMatches: number;
  conflicts: number;
}

export interface PolyGroupReport {
  participants: string[];
  totalActivitiesEvaluated: number;
  unanimousMatches: PolyGroupItem[];
  groupHardLimits: PolyGroupItem[];
  exploreTogetherItems: PolyGroupItem[];
  pairwiseScores: PairwiseScore[];
  overallGroupConsensusScore: number;
}

const POSITIVE: Rating[] = ['curious', 'like', 'love'];

function isPositive(rating?: Rating): boolean {
  return !!rating && POSITIVE.includes(rating);
}

function isHardLimit(rating?: Rating): boolean {
  return rating === 'hard_limit';
}

export function calculatePolyGroupReport(participants: GroupParticipant[]): PolyGroupReport {
  if (participants.length < 2) {
    return {
      participants: participants.map((p) => p.name),
      totalActivitiesEvaluated: 0,
      unanimousMatches: [],
      groupHardLimits: [],
      exploreTogetherItems: [],
      pairwiseScores: [],
      overallGroupConsensusScore: 0,
    };
  }

  const participantNames = participants.map((p) => p.name);
  const evaluatedActivityIds = new Set<string>();

  // Map of activityId -> participantIndex -> response
  const responsesByActivity: Record<string, Record<number, ActivityResponse>> = {};

  participants.forEach((p, idx) => {
    p.responses.forEach((resp) => {
      evaluatedActivityIds.add(resp.activityId);
      if (!responsesByActivity[resp.activityId]) {
        responsesByActivity[resp.activityId] = {};
      }
      responsesByActivity[resp.activityId][idx] = resp;
    });
  });

  const unanimousMatches: PolyGroupItem[] = [];
  const groupHardLimits: PolyGroupItem[] = [];
  const exploreTogetherItems: PolyGroupItem[] = [];

  evaluatedActivityIds.forEach((actId) => {
    const act = getActivityById(actId) || ACTIVITIES.find((a) => a.id === actId);
    const actName = act?.name || actId;
    const category = act?.category || 'general';

    const respMap = responsesByActivity[actId] || {};
    const vetoedBy: string[] = [];
    const positiveBy: string[] = [];

    participants.forEach((p, idx) => {
      const resp = respMap[idx];
      if (resp) {
        if (isHardLimit(resp.rating)) vetoedBy.push(p.name);
        if (isPositive(resp.rating)) positiveBy.push(p.name);
      }
    });

    const isGroupHardLimit = vetoedBy.length > 0;
    const isUnanimousMatch = !isGroupHardLimit && positiveBy.length === participants.length;
    const isExplore = !isGroupHardLimit && positiveBy.length >= 2 && positiveBy.length < participants.length;

    const consensusScore = isGroupHardLimit
      ? 0
      : Math.round((positiveBy.length / participants.length) * 100);

    const item: PolyGroupItem = {
      activityId: actId,
      activityName: actName,
      category,
      isUnanimousMatch,
      isGroupHardLimit,
      vetoedBy,
      positiveBy,
      consensusScore,
    };

    if (isGroupHardLimit) groupHardLimits.push(item);
    else if (isUnanimousMatch) unanimousMatches.push(item);
    else if (isExplore) exploreTogetherItems.push(item);
  });

  // Calculate pairwise matrix scores
  const pairwiseScores: PairwiseScore[] = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];

      let totalOverlap = 0;
      let mutualMatches = 0;
      let conflicts = 0;

      const p1Map = Object.fromEntries(p1.responses.map((r) => [r.activityId, r]));
      const p2Map = Object.fromEntries(p2.responses.map((r) => [r.activityId, r]));

      const commonIds = Array.from(evaluatedActivityIds).filter((id) => p1Map[id] && p2Map[id]);

      commonIds.forEach((id) => {
        const r1 = p1Map[id].rating;
        const r2 = p2Map[id].rating;
        totalOverlap++;

        if (isPositive(r1) && isPositive(r2)) mutualMatches++;
        if (isHardLimit(r1) || isHardLimit(r2)) {
          if (isPositive(r1) || isPositive(r2)) conflicts++;
        }
      });

      const score = totalOverlap > 0
        ? Math.round((mutualMatches / totalOverlap) * 100)
        : 0;

      pairwiseScores.push({
        p1Name: p1.name,
        p2Name: p2.name,
        score,
        mutualMatches,
        conflicts,
      });
    }
  }

  const overallScoreSum = pairwiseScores.reduce((acc, curr) => acc + curr.score, 0);
  const overallGroupConsensusScore = pairwiseScores.length > 0
    ? Math.round(overallScoreSum / pairwiseScores.length)
    : 0;

  return {
    participants: participantNames,
    totalActivitiesEvaluated: evaluatedActivityIds.size,
    unanimousMatches,
    groupHardLimits,
    exploreTogetherItems,
    pairwiseScores,
    overallGroupConsensusScore,
  };
}

export function generatePolyMarkdownReport(report: PolyGroupReport): string {
  let md = `# Reporte Grupal & Poliamoroso CompatKink 🌐\n\n`;
  md += `**Participantes (${report.participants.length}):** ${report.participants.join(', ')}\n`;
  md += `**Consenso Grupal Global:** ${report.overallGroupConsensusScore}%\n`;
  md += `**Total Actividades Evaluadas:** ${report.totalActivitiesEvaluated}\n\n`;

  md += `## 🌟 Matches Unánimes del Grupo (${report.unanimousMatches.length})\n`;
  if (report.unanimousMatches.length === 0) {
    md += `*No hay coincidencia unánime al 100% en todas las actividades aún.*\n\n`;
  } else {
    report.unanimousMatches.forEach((item) => {
      md += `- **${item.activityName}** (Consenso: 100%)\n`;
    });
    md += `\n`;
  }

  md += `## 🛑 Vetos de Grupo / Límites Duros (${report.groupHardLimits.length})\n`;
  if (report.groupHardLimits.length === 0) {
    md += `*No hay límites duros conflictivos identificados en el grupo.*\n\n`;
  } else {
    report.groupHardLimits.forEach((item) => {
      md += `- **${item.activityName}**: Veto por ${item.vetoedBy.join(', ')}\n`;
    });
    md += `\n`;
  }

  md += `## 📊 Matriz de Compatibilidad Cruzada (Pares)\n`;
  report.pairwiseScores.forEach((p) => {
    md += `- **${p.p1Name} ↔ ${p.p2Name}**: ${p.score}% (${p.mutualMatches} matches, ${p.conflicts} puntos de cuidado)\n`;
  });

  return md;
}
