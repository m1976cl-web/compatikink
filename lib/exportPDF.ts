import { Platform } from 'react-native';
import { CompatibilityReport, CATEGORY_LABELS, SECTION_LABELS, SECTION_DESCRIPTIONS } from '@/types';
import { CATEGORY_ORDER } from '@/data/activities';

/**
 * Generates a standalone HTML string for the report and triggers
 * the browser's native Print → Save as PDF flow.
 */
export function exportReportAsPDF(
  report: CompatibilityReport,
  initiatorName: string,
  guestName: string
): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    alert('La exportación PDF solo está disponible en la versión web.');
    return;
  }

  const mutualMatches = report.items.filter((i) => i.section === 'mutual_match');
  const explore = report.items.filter((i) => i.section === 'explore_together');
  const conflicts = report.items.filter((i) => i.section === 'hard_limit_conflict');
  const roleMismatch = report.items.filter((i) => i.section === 'role_mismatch');

  const matchRow = (name: string, cat: string, emoji: string, borderColor: string) =>
    `<div class="activity-row" style="border-left: 3px solid ${borderColor};">
      <span class="activity-emoji">${emoji}</span>
      <span class="activity-name">${name}</span>
      <span class="activity-cat">${cat}</span>
    </div>`;

  const categoryBars = CATEGORY_ORDER.map((cat) => {
    const pct = report.categoryCompatibilities[cat] ?? 100;
    const barColor = pct >= 75 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171';
    return `
      <div class="cat-item">
        <div class="cat-label">
          <span>${CATEGORY_LABELS[cat]}</span>
          <strong style="color:${barColor}">${pct}%</strong>
        </div>
        <div class="cat-bar-bg">
          <div class="cat-bar-fill" style="width:${pct}%;background:${barColor};box-shadow:0 0 6px ${barColor}88;"></div>
        </div>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Compatikink — ${initiatorName} & ${guestName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0f0a1e;
      color: #e2d9f3;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 28px; font-weight: 900; color: #c084fc; margin-bottom: 4px; }
    .subtitle { color: #9ca3af; font-size: 13px; margin-bottom: 28px; }
    .score-block {
      display: flex;
      align-items: center;
      gap: 32px;
      background: #1a1030;
      border: 1.5px solid rgba(192,132,252,0.3);
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 24px;
    }
    .score-num { font-size: 72px; font-weight: 900; color: #c084fc; line-height: 1; text-shadow: 0 0 20px rgba(192,132,252,0.6); }
    .score-label { font-size: 13px; color: #9ca3af; margin-top: 4px; }
    .stats { display: flex; gap: 20px; margin-left: auto; }
    .stat { text-align: center; }
    .stat-val { font-size: 28px; font-weight: 800; }
    .stat-lbl { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin-bottom: 24px; }
    .section-title {
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 1.5px; margin-bottom: 6px; padding: 6px 12px;
      border-radius: 8px; display: inline-block;
    }
    .section-title.match { color: #c084fc; background: rgba(192,132,252,0.1); }
    .section-title.explore { color: #60a5fa; background: rgba(96,165,250,0.1); }
    .section-title.conflict { color: #f87171; background: rgba(248,113,113,0.1); }
    .section-title.mismatch { color: #fbbf24; background: rgba(251,191,36,0.1); }
    .section-desc { font-size: 12px; color: #9ca3af; margin-bottom: 10px; padding-left: 2px; }
    .activity-row {
      display: flex; align-items: center; gap: 10px;
      background: #1a1030; border-radius: 8px;
      padding: 8px 12px; margin-bottom: 6px;
    }
    .activity-emoji { font-size: 16px; }
    .activity-name { font-size: 13px; font-weight: 600; flex: 1; }
    .activity-cat { font-size: 11px; color: #9ca3af; }
    .cats-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #c084fc; margin-bottom: 12px; }
    .cat-item { margin-bottom: 10px; }
    .cat-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
    .cat-bar-bg { background: #2a1f42; border-radius: 4px; height: 6px; overflow: hidden; }
    .cat-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
    .venn {
      display: flex; border-radius: 12px; overflow: hidden;
      height: 56px; border: 1px solid #2a1f42; margin-bottom: 24px;
    }
    .venn-seg { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; }
    .venn-num { font-size: 20px; font-weight: 800; }
    .venn-lbl { font-size: 9px; color: #9ca3af; text-transform: uppercase; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #2a1f42; padding-top: 16px; }
    @media print {
      body { background: white !important; color: #111 !important; padding: 16px; }
      .score-block { background: #f9f9f9 !important; border-color: #e0e0e0 !important; }
      .score-num { color: #7c3aed !important; text-shadow: none !important; }
      .activity-row { background: #f9f9f9 !important; }
      .cat-bar-bg { background: #e5e7eb !important; }
      .section-title.match { background: #f3e8ff !important; color: #7c3aed !important; }
      .section-title.explore { background: #eff6ff !important; color: #2563eb !important; }
      .section-title.conflict { background: #fef2f2 !important; color: #dc2626 !important; }
      .section-title.mismatch { background: #fffbeb !important; color: #d97706 !important; }
      .venn-seg { border-color: #e5e7eb !important; }
      .footer { color: #9ca3af !important; }
    }
  </style>
</head>
<body>
  <h1>🔥 Reporte de Compatibilidad</h1>
  <p class="subtitle">
    ${initiatorName} &amp; ${guestName} · Generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
    · Privado y confidencial
  </p>

  <div class="score-block">
    <div>
      <div class="score-num">${report.compatibilityScore}%</div>
      <div class="score-label">Compatibilidad general</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val" style="color:#4ade80">${report.mutualMatchCount}</div><div class="stat-lbl">Matches</div></div>
      <div class="stat"><div class="stat-val" style="color:#60a5fa">${report.exploreCount}</div><div class="stat-lbl">Explorar</div></div>
      <div class="stat"><div class="stat-val" style="color:#fbbf24">${report.conflictCount}</div><div class="stat-lbl">Atención</div></div>
    </div>
  </div>

  <div class="venn">
    <div class="venn-seg" style="flex:${Math.max(1, report.overlapStats.initiatorOnlyCount)};background:rgba(192,132,252,0.15)">
      <div class="venn-num">${report.overlapStats.initiatorOnlyCount}</div>
      <div class="venn-lbl">Solo tú</div>
    </div>
    <div class="venn-seg" style="flex:${Math.max(1, report.overlapStats.sharedCount)};background:rgba(74,222,128,0.18)">
      <div class="venn-num" style="color:#4ade80">${report.overlapStats.sharedCount}</div>
      <div class="venn-lbl">Mutuos 🔥</div>
    </div>
    <div class="venn-seg" style="flex:${Math.max(1, report.overlapStats.guestOnlyCount)};background:rgba(244,114,182,0.15)">
      <div class="venn-num">${report.overlapStats.guestOnlyCount}</div>
      <div class="venn-lbl">Solo ellos</div>
    </div>
  </div>

  ${mutualMatches.length > 0 ? `
  <div class="section">
    <div class="section-title match">🔥 ${SECTION_LABELS['mutual_match']}</div>
    <p class="section-desc">${SECTION_DESCRIPTIONS['mutual_match']}</p>
    ${mutualMatches.map((i) => matchRow(i.activityName, CATEGORY_LABELS[i.category], '🔥', '#c084fc')).join('')}
  </div>` : ''}

  ${explore.length > 0 ? `
  <div class="section">
    <div class="section-title explore">💬 ${SECTION_LABELS['explore_together']}</div>
    <p class="section-desc">${SECTION_DESCRIPTIONS['explore_together']}</p>
    ${explore.map((i) => matchRow(i.activityName, CATEGORY_LABELS[i.category], '💬', '#60a5fa')).join('')}
  </div>` : ''}

  ${roleMismatch.length > 0 ? `
  <div class="section">
    <div class="section-title mismatch">🔄 ${SECTION_LABELS['role_mismatch']}</div>
    <p class="section-desc">${SECTION_DESCRIPTIONS['role_mismatch']}</p>
    ${roleMismatch.map((i) => matchRow(i.activityName, CATEGORY_LABELS[i.category], '🔄', '#fbbf24')).join('')}
  </div>` : ''}

  ${conflicts.length > 0 ? `
  <div class="section">
    <div class="section-title conflict">🚫 ${SECTION_LABELS['hard_limit_conflict']}</div>
    <p class="section-desc">${SECTION_DESCRIPTIONS['hard_limit_conflict']}</p>
    ${conflicts.map((i) => matchRow(i.activityName, CATEGORY_LABELS[i.category], '🚫', '#f87171')).join('')}
  </div>` : ''}

  <div class="section">
    <div class="cats-title">📊 Compatibilidad por Categorías</div>
    ${categoryBars}
  </div>

  <div class="footer">
    Generado por Compatikink · Solo para uso privado entre personas adultas que han dado su consentimiento ·
    Las respuestas individuales no están incluidas en este reporte.
  </div>
</body>
</html>`;

  // Open in a new tab and trigger print
  const win = window.open('', '_blank');
  if (!win) {
    alert('Por favor permite las ventanas emergentes para exportar el PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so fonts load
  setTimeout(() => win.print(), 600);
}

/**
 * Generates a clean PDF document specifically for a Scene Agreement / Safewords Contract
 */
export function exportSceneAgreementPDF(agreement: any, partnerName: string): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    alert('La exportación PDF solo está disponible en la versión web.');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Acuerdo de Escena — ${agreement.activityName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; background: #0f0a1e; color: #e2d9f3; padding: 32px; max-width: 600px; margin: 0 auto; }
    h1 { color: #c084fc; font-size: 24px; font-weight: 900; margin-bottom: 4px; }
    .sub { color: #9ca3af; font-size: 12px; margin-bottom: 24px; }
    .box { background: #1a1030; border: 1.5px solid rgba(192,132,252,0.3); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .safeword { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; font-weight: 700; font-size: 14px; }
    .sg { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
    .sy { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
    .sr { background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
    .lbl { color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .val { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 12px; }
    @media print {
      body { background: white !important; color: #111 !important; }
      .box { background: #f9f9f9 !important; border-color: #ddd !important; }
      .val { color: #111 !important; }
    }
  </style>
</head>
<body>
  <h1>📜 Acuerdo de Escena: ${agreement.activityName}</h1>
  <p class="sub">Acuerdo consensuado con ${partnerName} · Generado el ${new Date().toLocaleDateString('es-ES')}</p>

  <div class="box">
    <div class="lbl">Palabras Clave (Safewords)</div>
    <div class="safeword sg"><span>🟢 Verde (Seguir)</span> <span>${agreement.safewordGreen || 'VERDE'}</span></div>
    <div class="safeword sy"><span>🟡 Amarillo (Bajar ritmo)</span> <span>${agreement.safewordYellow || 'AMARILLO'}</span></div>
    <div class="safeword sr"><span>🔴 Rojo (Detener de inmediato)</span> <span>${agreement.safewordRed || 'ROJO'}</span></div>
  </div>

  <div class="box">
    ${agreement.nonVerbalSignal ? `<div class="lbl">Señal No Verbal</div><div class="val">${agreement.nonVerbalSignal}</div>` : ''}
    ${agreement.durationLimit ? `<div class="lbl">Duración Máxima</div><div class="val">${agreement.durationLimit}</div>` : ''}
    ${agreement.agreedLimits ? `<div class="lbl">Límites Estrictos Negociados</div><div class="val">${agreement.agreedLimits}</div>` : ''}
  </div>

  <div style="text-align:center;font-size:10px;color:#6b7280;margin-top:24px;">
    Documento de consentimiento privado · Compatikink
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Permite ventanas emergentes para exportar el acuerdo.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

