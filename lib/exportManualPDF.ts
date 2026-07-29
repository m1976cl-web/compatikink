import { Platform } from 'react-native';
import { ManualModule } from '@/data/manualData';

export type { ManualModule };

/**
 * Exports a set of user manual modules as a formatted PDF document
 * using browser native print capabilities (@media print & window.print).
 */
export function exportManualAsPDF(titleOrModules: string | ManualModule[], modulesOrArea?: ManualModule[] | string): void {
  let title = 'Manual de Usuario — Compatikink';
  let modules: ManualModule[] = [];

  if (typeof titleOrModules === 'string') {
    title = titleOrModules;
    if (Array.isArray(modulesOrArea)) {
      modules = modulesOrArea;
    }
  } else if (Array.isArray(titleOrModules)) {
    modules = titleOrModules;
    if (typeof modulesOrArea === 'string') {
      title = `Manual de Usuario — ${modulesOrArea}`;
    }
  }

  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    if (typeof alert !== 'undefined') {
      alert('La exportación en formato PDF está optimizada para la versión web.');
    }
    return;
  }

  const win = window.open('', '_blank');
  if (!win) {
    if (typeof alert !== 'undefined') {
      alert('Por favor habilita las ventanas emergentes para generar y descargar el PDF.');
    }
    return;
  }

  const currentDateStr = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const modulesHtml = modules
    .map((mod, index) => {
      const categoryName = mod.categoryName || mod.category;
      const icon = mod.icon || '📖';
      const features = mod.features || mod.keyFeatures || [];
      const featuresHtml = features.map((f: string) => `<li>${escapeHtml(f)}</li>`).join('');

      let stepsHtml = '';
      if (mod.steps && mod.steps.length > 0) {
        stepsHtml = mod.steps
          .map((s) => `<li><strong>${escapeHtml(s.title)}:</strong> ${escapeHtml(s.description)}</li>`)
          .join('');
      } else if (mod.stepByStepGuide && mod.stepByStepGuide.length > 0) {
        stepsHtml = mod.stepByStepGuide.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
      }

      const tags = mod.keywords || mod.tags || [];
      const tagsHtml = tags.map((t: string) => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join(' ');

      const calloutHtml = mod.callout
        ? `<div class="callout callout-${mod.callout.type}">${escapeHtml(mod.callout.text)}</div>`
        : '';

      const exampleHtml = mod.practicalExample
        ? `<div class="section-block">
             <h3 class="section-heading">💡 Ejemplo Práctico</h3>
             <pre class="code-block"><code>${escapeHtml(mod.practicalExample)}</code></pre>
           </div>`
        : '';

      return `
      <div class="module-card">
        <div class="module-header">
          <span class="module-num">${icon} Módulo ${index + 1}</span>
          <span class="module-category">${escapeHtml(categoryName)}</span>
        </div>
        <h2 class="module-title">${escapeHtml(mod.title)}</h2>
        ${mod.subtitle ? `<p class="module-summary">${escapeHtml(mod.subtitle)}</p>` : mod.summary ? `<p class="module-summary">${escapeHtml(mod.summary)}</p>` : ''}
        <p class="module-description">${escapeHtml(mod.description)}</p>

        ${features.length > 0 ? `
        <div class="section-block">
          <h3 class="section-heading">⚡ Características Clave</h3>
          <ul class="features-list">
            ${featuresHtml}
          </ul>
        </div>` : ''}

        ${stepsHtml ? `
        <div class="section-block">
          <h3 class="section-heading">📋 Guía Paso a Paso</h3>
          <ol class="steps-list">
            ${stepsHtml}
          </ol>
        </div>` : ''}

        ${calloutHtml}
        ${exampleHtml}

        ${tags.length > 0 ? `<div class="module-tags">${tagsHtml}</div>` : ''}
      </div>`;
    })
    .join('');

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f0a1e;
      color: #e2d9f3;
      padding: 32px;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
    }
    .doc-header {
      text-align: center;
      border-bottom: 2px solid #9333ea;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-logo {
      font-size: 26px;
      font-weight: 900;
      color: #c084fc;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }
    .doc-meta {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    .module-card {
      background: #1a1030;
      border: 1px solid rgba(147, 51, 234, 0.3);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .module-num {
      font-size: 13px;
      font-weight: 800;
      color: #c084fc;
      letter-spacing: 0.5px;
    }
    .module-category {
      font-size: 11px;
      background: rgba(147, 51, 234, 0.2);
      color: #e9d5ff;
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid rgba(147, 51, 234, 0.4);
    }
    .module-title {
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .module-summary {
      font-size: 13px;
      color: #d8b4fe;
      margin-bottom: 10px;
      background: rgba(147, 51, 234, 0.1);
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 3px solid #9333ea;
    }
    .module-description {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }
    .section-block {
      margin-top: 14px;
    }
    .section-heading {
      font-size: 12px;
      font-weight: 700;
      color: #c084fc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .features-list, .steps-list {
      padding-left: 20px;
      font-size: 12px;
      color: #e2e8f0;
    }
    .features-list li, .steps-list li {
      margin-bottom: 4px;
    }
    .callout {
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
    }
    .callout-tip {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      color: #7dd3fc;
    }
    .callout-warning {
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid #fbbf24;
      color: #fde047;
    }
    .code-block {
      background: #090514;
      border: 1px solid #3b0764;
      border-radius: 8px;
      padding: 12px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #a855f7;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .module-tags {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag-pill {
      font-size: 10px;
      color: #a855f7;
      background: #1e1138;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid #581c87;
    }
    .doc-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #3b0764;
      font-size: 11px;
      color: #9ca3af;
    }

    @media print {
      body {
        background: #ffffff !important;
        color: #111111 !important;
        padding: 16px;
      }
      .brand-logo { color: #7e22ce !important; }
      .doc-title { color: #111827 !important; }
      .doc-header { border-bottom-color: #7e22ce !important; }
      .module-card {
        background: #ffffff !important;
        border: 1px solid #d1d5db !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .module-num { color: #6b21a8 !important; }
      .module-category {
        background: #f3e8ff !important;
        color: #6b21a8 !important;
        border-color: #d8b4fe !important;
      }
      .module-title { color: #111827 !important; }
      .module-summary {
        background: #f9fafb !important;
        color: #374151 !important;
        border-left-color: #7e22ce !important;
      }
      .module-description { color: #4b5563 !important; }
      .section-heading { color: #6b21a8 !important; }
      .features-list, .steps-list { color: #1f2937 !important; }
      .code-block {
        background: #f3f4f6 !important;
        border-color: #e5e7eb !important;
        color: #1f2937 !important;
      }
      .tag-pill {
        background: #f3e8ff !important;
        color: #6b21a8 !important;
        border-color: #e9d5ff !important;
      }
      .doc-footer {
        border-top-color: #e5e7eb !important;
        color: #6b7280 !important;
      }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="brand-logo">🔥 COMPATIKINK</div>
    <div class="doc-title">${escapeHtml(title)}</div>
    <div class="doc-meta">Documento Oficial · Generado el ${currentDateStr} · Total de Módulos: ${modules.length}</div>
  </div>

  <div class="doc-content">
    ${modulesHtml}
  </div>

  <div class="doc-footer">
    Compatikink User Manual · Guía interactiva de seguridad, consentimiento e interacción · Privado &amp; Confidencial
  </div>
</body>
</html>`;

  win.document.write(fullHtml);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
