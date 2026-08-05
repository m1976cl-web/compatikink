import { STATIC_MODULES } from '@/data/homeModules';
import { MANUAL_AREAS, MANUAL_MODULES } from '@/data/manualData';
import { ACTIVITIES } from '@/data/activities';
import { GLOSSARY } from '@/data/glossaryData';

export type SearchCategory = 'screen' | 'manual' | 'activity' | 'glossary';

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  categoryLabel: string;
  icon?: string;
  route: string;
  keywords?: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAllSearchItems(): SearchItem[] {
  const items: SearchItem[] = [];

  // 1. Screens / Home Modules
  STATIC_MODULES.forEach((mod) => {
    if (mod.route) {
      items.push({
        id: `screen_${mod.route}`,
        title: mod.title,
        subtitle: mod.description,
        category: 'screen',
        categoryLabel: 'Pantalla',
        icon: mod.mark,
        route: mod.route,
      });
    }
  });

  // 2. Manual Areas & Modules
  MANUAL_AREAS.forEach((area) => {
    items.push({
      id: `manual_area_${area.id}`,
      title: area.title,
      subtitle: area.description,
      category: 'manual',
      categoryLabel: 'Manual',
      icon: area.icon,
      route: '/manual',
    });
  });

  MANUAL_MODULES.forEach((m) => {
    items.push({
      id: `manual_mod_${m.id}`,
      title: m.title,
      subtitle: m.summary || m.description,
      category: 'manual',
      categoryLabel: 'Manual',
      icon: '📖',
      route: `/manual?moduleId=${m.id}`,
      keywords: m.keywords || m.tags,
    });
  });

  // 3. Activities
  ACTIVITIES.forEach((act) => {
    items.push({
      id: `act_${act.id}`,
      title: act.name,
      subtitle: act.description,
      category: 'activity',
      categoryLabel: 'Actividad',
      icon: '⚡',
      route: `/questionnaire?activity=${act.id}`,
      keywords: act.moods,
    });
  });

  // 4. Glossary Terms
  GLOSSARY.forEach((g) => {
    items.push({
      id: `glossary_${g.term}`,
      title: g.term,
      subtitle: g.definition,
      category: 'glossary',
      categoryLabel: 'Glosario',
      icon: '📚',
      route: `/glossary?term=${encodeURIComponent(g.term)}`,
    });
  });

  return items;
}

export function searchItems(query: string, categoryFilter?: SearchCategory | 'all'): SearchItem[] {
  if (!query.trim()) return [];
  const normQuery = normalizeText(query);
  const all = getAllSearchItems();

  const filtered = all.filter((item) => {
    if (categoryFilter && categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    const titleMatch = normalizeText(item.title).includes(normQuery);
    const subMatch = item.subtitle ? normalizeText(item.subtitle).includes(normQuery) : false;
    const kwMatch = item.keywords ? item.keywords.some((k) => normalizeText(k).includes(normQuery)) : false;
    return titleMatch || subMatch || kwMatch;
  });

  // Score sorting: exact start match comes first
  return filtered
    .sort((a, b) => {
      const aTitleNorm = normalizeText(a.title);
      const bTitleNorm = normalizeText(b.title);
      const aStartsWith = aTitleNorm.startsWith(normQuery) ? 2 : 0;
      const bStartsWith = bTitleNorm.startsWith(normQuery) ? 2 : 0;
      return bStartsWith - aStartsWith;
    })
    .slice(0, 30);
}
