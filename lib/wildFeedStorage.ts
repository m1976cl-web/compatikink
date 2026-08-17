import { readJsonStorage, writeJsonStorage } from '@/lib/cryptoVault';
import { WildPost, WildComment } from '@/types/wildFeed';

const WILD_POSTS_STORAGE_KEY = 'wild_uncensored_posts_v1';
const TERMS_ACCEPTED_STORAGE_KEY = 'wild_terms_accepted_v1';

export const ILLEGAL_CONTENT_WARNING_TEXT =
  '⚠️ ADVERTENCIA LEGAL Y REGLAS INVIOLABLES DE LA COMUNIDAD (CHILE 🇨🇱) ⚠️\n\n' +
  '1. Está ESTRICTAMENTE PROHIBIDO subir imágenes o videos ilegales, de menores de edad (hasta 18 años), con animales (zoofilia), violencia no consensuada o difusión sin consentimiento (Ley N° 21.523 - Ley Antonia).\n' +
  '2. Todo el contenido debe ser entre adultos (18+) con consentimiento pleno e informado bajo el marco de protección de datos sensibles de la Ley N° 19.628.\n' +
  '3. Las publicaciones son monitoreadas. Cualquier infracción resultará en el borrado inmediato y el bloqueo permanente del perfil.';

export async function hasAcceptedWildTerms(): Promise<boolean> {
  const accepted = await readJsonStorage<boolean>(TERMS_ACCEPTED_STORAGE_KEY, false);
  return Boolean(accepted);
}

export async function setAcceptedWildTerms(accepted: boolean): Promise<void> {
  await writeJsonStorage(TERMS_ACCEPTED_STORAGE_KEY, accepted);
}

const DEFAULT_SAMPLE_WILD_POSTS: WildPost[] = [
  {
    id: 'wild_sample_1',
    authorNickname: 'Anónimo',
    isAnonymous: true,
    title: 'Noche de Shibari & Látex',
    caption: 'Explorando ataduras de torso en látex negro. ¿Alguien para comparar afinidad en cuerdas?',
    mediaUri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    mediaType: 'photo',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'c1',
        postId: 'wild_sample_1',
        authorNickname: 'Vesper_Kink',
        isAnonymous: false,
        content: 'Excelente tensión en los nudos del arnés. ¡Te envié solicitud de test!',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'c2',
        postId: 'wild_sample_1',
        authorNickname: 'Anónimo',
        isAnonymous: true,
        content: 'Increíble estética de látex. Me encanta la combinación.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
    comparisonRequestsCount: 3,
  },
  {
    id: 'wild_sample_2',
    authorNickname: 'Kira_Dom',
    isAnonymous: false,
    title: 'Sesión de Impacto & Cuero',
    caption: 'Probandos nuevos floggers de gamuza. Si te interesa la disciplina D/s compara tu test conmigo.',
    mediaUri: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop',
    mediaType: 'photo',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    comments: [],
    comparisonRequestsCount: 1,
  },
];

export async function loadAllWildPosts(): Promise<WildPost[]> {
  const posts = await readJsonStorage<WildPost[]>(WILD_POSTS_STORAGE_KEY, DEFAULT_SAMPLE_WILD_POSTS);
  return posts.filter((p) => !p.isBlocked);
}

export async function createWildPost(
  newPost: Omit<WildPost, 'id' | 'createdAt' | 'comments' | 'comparisonRequestsCount'>
): Promise<WildPost[]> {
  const allPosts = await readJsonStorage<WildPost[]>(WILD_POSTS_STORAGE_KEY, DEFAULT_SAMPLE_WILD_POSTS);
  const created: WildPost = {
    ...newPost,
    id: `wild_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    comments: [],
    comparisonRequestsCount: 0,
  };

  const updated = [created, ...allPosts];
  await writeJsonStorage(WILD_POSTS_STORAGE_KEY, updated);
  return updated;
}

export async function addWildComment(
  postId: string,
  authorNickname: string,
  content: string,
  isAnonymous: boolean
): Promise<WildPost[]> {
  const allPosts = await readJsonStorage<WildPost[]>(WILD_POSTS_STORAGE_KEY, DEFAULT_SAMPLE_WILD_POSTS);
  const target = allPosts.find((p) => p.id === postId);
  if (target) {
    const comment: WildComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      postId,
      authorNickname: isAnonymous ? 'Anónimo' : authorNickname,
      isAnonymous,
      content,
      createdAt: new Date().toISOString(),
    };
    target.comments.push(comment);
    await writeJsonStorage(WILD_POSTS_STORAGE_KEY, allPosts);
  }
  return allPosts;
}

export async function incrementComparisonRequest(postId: string): Promise<number> {
  const allPosts = await readJsonStorage<WildPost[]>(WILD_POSTS_STORAGE_KEY, DEFAULT_SAMPLE_WILD_POSTS);
  const target = allPosts.find((p) => p.id === postId);
  if (target) {
    target.comparisonRequestsCount = (target.comparisonRequestsCount || 0) + 1;
    await writeJsonStorage(WILD_POSTS_STORAGE_KEY, allPosts);
    return target.comparisonRequestsCount;
  }
  return 0;
}

export async function reportWildPost(postId: string, userNickname: string): Promise<boolean> {
  const allPosts = await readJsonStorage<WildPost[]>(WILD_POSTS_STORAGE_KEY, DEFAULT_SAMPLE_WILD_POSTS);
  const target = allPosts.find((p) => p.id === postId);
  if (target) {
    target.reportedBy = target.reportedBy || [];
    if (!target.reportedBy.includes(userNickname)) {
      target.reportedBy.push(userNickname);
      if (target.reportedBy.length >= 2) {
        target.isBlocked = true;
      }
      await writeJsonStorage(WILD_POSTS_STORAGE_KEY, allPosts);
      return true;
    }
  }
  return false;
}
