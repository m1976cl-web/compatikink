import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ManualModule } from '@/data/manualData';

export type { ManualModule };

/**
 * Formats a set of user manual modules into clean, structured Markdown text.
 */
export function generateManualMarkdown(titleOrModules: string | ManualModule[], modulesList?: ManualModule[]): string {
  let title = 'Manual de Usuario — Compatikink';
  let modules: ManualModule[] = [];

  if (typeof titleOrModules === 'string') {
    title = titleOrModules;
    if (Array.isArray(modulesList)) {
      modules = modulesList;
    }
  } else if (Array.isArray(titleOrModules)) {
    modules = titleOrModules;
  }

  const currentDateStr = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let md = `# 📖 ${title}\n`;
  md += `> **Documento Oficial de Especificaciones y Guías de Uso**  \n`;
  md += `> *Generado el ${currentDateStr} | Total de Módulos: ${modules.length}*\n\n`;
  md += `---\n\n`;

  md += `## 📋 Tabla de Contenidos\n\n`;
  modules.forEach((mod, idx) => {
    const anchor = slugify(mod.title);
    const categoryName = mod.categoryName || mod.category;
    const icon = mod.icon ? `${mod.icon} ` : '';
    md += `${idx + 1}. [${icon}${mod.title}](#${anchor}) *(${categoryName})*\n`;
  });
  md += `\n---\n\n`;

  modules.forEach((mod, idx) => {
    const categoryName = mod.categoryName || mod.category;
    const icon = mod.icon ? `${mod.icon} ` : '';
    md += `## ${idx + 1}. ${icon}${mod.title}\n\n`;
    md += `- **ID Módulo**: \`${mod.id}\`  \n`;
    md += `- **Categoría**: ${categoryName}  \n`;
    if (mod.subtitle || mod.summary) {
      md += `- **Resumen**: *${mod.subtitle || mod.summary}*  \n\n`;
    }

    md += `### 📝 Descripción\n`;
    md += `${mod.description}\n\n`;

    const features = mod.features || mod.keyFeatures || [];
    if (features.length > 0) {
      md += `### ⚡ Características Clave\n`;
      features.forEach((feature: string) => {
        md += `- ${feature}\n`;
      });
      md += `\n`;
    }

    if (mod.steps && mod.steps.length > 0) {
      md += `### 📋 Guía Paso a Paso\n`;
      mod.steps.forEach((s) => {
        md += `${s.stepNumber}. **${s.title}:** ${s.description}\n`;
      });
      md += `\n`;
    } else if (mod.stepByStepGuide && mod.stepByStepGuide.length > 0) {
      md += `### 📋 Guía Paso a Paso\n`;
      mod.stepByStepGuide.forEach((step: string) => {
        md += `- ${step}\n`;
      });
      md += `\n`;
    }

    if (mod.callout) {
      const emoji = mod.callout.type === 'warning' ? '⚠️' : '💡';
      const label = mod.callout.type === 'warning' ? 'Importante' : 'Tip Pro';
      md += `> ${emoji} **${label}:** ${mod.callout.text}\n\n`;
    }

    if (mod.practicalExample) {
      md += `### 💡 Ejemplo Práctico / Código de Uso\n`;
      md += `\`\`\`typescript\n`;
      md += `${mod.practicalExample}\n`;
      md += `\`\`\`\n\n`;
    }

    const tags = mod.keywords || mod.tags || [];
    if (tags.length > 0) {
      md += `### 🏷️ Etiquetas\n`;
      md += `${tags.map((t: string) => `\`#${t}\``).join(' ')}\n\n`;
    }

    md += `---\n\n`;
  });

  md += `*Compatikink User Manual · Guía privada para fines de consentimiento, seguridad e información.*\n`;

  return md;
}

/**
 * Copies manual markdown text to system clipboard.
 */
export async function copyManualAsMarkdown(titleOrModules: string | ManualModule[], modulesList?: ManualModule[]): Promise<boolean> {
  try {
    const markdownText = generateManualMarkdown(titleOrModules, modulesList);
    await Clipboard.setStringAsync(markdownText);
    return true;
  } catch (error) {
    console.error('Error al copiar el manual en Markdown al portapapeles:', error);
    return false;
  }
}

/**
 * Downloads manual markdown file or copies to clipboard on mobile.
 */
export function downloadManualAsMarkdown(filenameOrTitle?: string | ManualModule[], titleOrModules?: string | ManualModule[], modulesList?: ManualModule[]): void {
  let filename = 'Compatikink_User_Manual.md';
  let markdownText = '';

  if (typeof filenameOrTitle === 'string' && typeof titleOrModules === 'string' && Array.isArray(modulesList)) {
    filename = filenameOrTitle.endsWith('.md') ? filenameOrTitle : `${filenameOrTitle}.md`;
    markdownText = generateManualMarkdown(titleOrModules, modulesList);
  } else if (typeof filenameOrTitle === 'string' && Array.isArray(titleOrModules)) {
    filename = filenameOrTitle.endsWith('.md') ? filenameOrTitle : `${filenameOrTitle}.md`;
    markdownText = generateManualMarkdown(titleOrModules);
  } else if (Array.isArray(filenameOrTitle)) {
    markdownText = generateManualMarkdown(filenameOrTitle);
  } else {
    markdownText = generateManualMarkdown('Manual de Usuario Compatikink');
  }

  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    if (markdownText) {
      Clipboard.setStringAsync(markdownText);
    }
    if (typeof alert !== 'undefined') {
      alert('La descarga de archivos .md está habilitada para la versión web. Se ha copiado el Markdown al portapapeles.');
    }
    return;
  }

  try {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar el archivo Markdown:', error);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
