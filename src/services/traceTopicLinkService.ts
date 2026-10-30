import { allModules } from '../content/modules';
import type { Topic } from '../types/content';
import { getAllPublishedTopics } from './editorialService';
import { getTopicPublicUrl } from '../utils/adminUtils';
import { findTopicInTree, findTopicPathInTree, topicToRevisionPayload } from './contentMerge';
import { saveRevision, submitRevision, reviewRevision } from './editorialService';

export interface TraceTopicOccurrence {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
  publicUrl: string;
  fullDirective: string;
  source: 'static' | 'published';
}

function extractDirectivesForPreset(content: string, presetId: string): string[] {
  if (!content) return [];
  // Directivas de tipo :::emg-trace{...}
  // Coincide si preset="<presetId>" o preset='<presetId>'
  const regex = /:::emg-trace\{[^}]*preset=["']([^"']+)["'][^}]*\}:::/g;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    if (m[1] === presetId) {
      matches.push(m[0]);
    }
  }
  return matches;
}

/**
 * Escanea todos los temas de todos los módulos (estáticos y publicados en Supabase)
 * para encontrar en cuáles está incrustado un trazo específico (por su presetId).
 */
export async function findTopicOccurrencesForTrace(presetId: string): Promise<TraceTopicOccurrence[]> {
  const occurrences: TraceTopicOccurrence[] = [];
  const visitedKey = new Set<string>();

  // 1. Obtener temas publicados en Supabase para tener la versión más fresca
  let publishedTopics: Awaited<ReturnType<typeof getAllPublishedTopics>> = [];
  try {
    publishedTopics = await getAllPublishedTopics();
  } catch (err) {
    console.warn('[traceTopicLinkService] Fallback a módulos estáticos:', err);
  }

  // Mapa rápido de temas publicados por `${moduleId}:${topicId}`
  const publishedMap = new Map<string, (typeof publishedTopics)[0]>();
  for (const pt of publishedTopics) {
    publishedMap.set(`${pt.module_id}:${pt.id}`, pt);
  }

  // Función recursiva para caminar el árbol de temas
  const walkTopic = (modId: string, modNum: number, modTitle: string, topic: Topic) => {
    const key = `${modId}:${topic.id}`;
    if (visitedKey.has(key)) return;
    visitedKey.add(key);

    const pub = publishedMap.get(key);
    const content = pub?.content ?? topic.content ?? '';
    const source: 'static' | 'published' = pub ? 'published' : 'static';

    const directives = extractDirectivesForPreset(content, presetId);
    for (const fullDirective of directives) {
      occurrences.push({
        moduleId: modId,
        moduleNumber: modNum,
        moduleTitle: modTitle,
        topicId: topic.id,
        topicTitle: pub?.title ?? topic.title,
        publicUrl: getTopicPublicUrl(modId, topic.id) || `/modulo/${modId}/${topic.id}`,
        fullDirective,
        source,
      });
    }

    if (topic.children && topic.children.length > 0) {
      for (const child of topic.children) {
        walkTopic(modId, modNum, modTitle, child);
      }
    }
  };

  for (const mod of allModules) {
    for (const t of mod.topics) {
      walkTopic(mod.id, mod.number, mod.title, t);
    }
  }

  // Revisar si hay temas creados dinámicamente en Supabase que no estén en los estáticos
  for (const pt of publishedTopics) {
    const key = `${pt.module_id}:${pt.id}`;
    if (!visitedKey.has(key)) {
      visitedKey.add(key);
      const mod = allModules.find((m) => m.id === pt.module_id);
      const directives = extractDirectivesForPreset(pt.content || '', presetId);
      for (const fullDirective of directives) {
        occurrences.push({
          moduleId: pt.module_id,
          moduleNumber: mod?.number ?? 0,
          moduleTitle: mod?.title ?? pt.module_id,
          topicId: pt.id,
          topicTitle: pt.title,
          publicUrl: getTopicPublicUrl(pt.module_id, pt.id) || `/modulo/${pt.module_id}/${pt.id}`,
          fullDirective,
          source: 'published',
        });
      }
    }
  }

  return occurrences;
}

/**
 * Incrusta la directiva de un trazo en un tema destino mediante el sistema de revisiones editoriales
 * con auto-aprobación instantánea si el usuario es staff (Admin o Editor).
 */
export async function attachTraceToTopic(input: {
  presetId: string;
  moduleId: string;
  topicId: string;
  authorId: string;
  authorName?: string;
  mode?: 'comparison' | 'static' | 'interactive';
}): Promise<void> {
  const { presetId, moduleId, topicId, authorId, authorName = 'Administrador Docente', mode = 'comparison' } = input;
  const mod = allModules.find((m) => m.id === moduleId);
  if (!mod) throw new Error(`Módulo no encontrado: ${moduleId}`);

  const topic = findTopicInTree(mod.topics, topicId);
  if (!topic) throw new Error(`Tema no encontrado en el temario: ${topicId}`);

  // Verificar si hay versión publicada fresca
  let currentContent = topic.content || '';
  try {
    const publishedTopics = await getAllPublishedTopics();
    const pub = publishedTopics.find((pt) => pt.module_id === moduleId && pt.id === topicId);
    if (pub && typeof pub.content === 'string') {
      currentContent = pub.content;
    }
  } catch {
    // Usar contenido estático
  }

  // Comprobar si ya está incrustado
  const existing = extractDirectivesForPreset(currentContent, presetId);
  if (existing.length > 0) {
    throw new Error('Este trazo ya se encuentra incrustado en el tema seleccionado.');
  }

  const snippet = `\n\n:::emg-trace{preset="${presetId}" mode="${mode}"}:::\n\n`;
  const nextContent = currentContent ? `${currentContent.trim()}\n\n${snippet.trim()}\n` : snippet.trim();

  const payload = topicToRevisionPayload(topic);
  payload.content = nextContent;

  const path = findTopicPathInTree(mod.topics, topic.id);
  const parentId = path && path.length > 1 ? path[path.length - 2] : null;

  const saved = await saveRevision({
    targetTopicId: topic.id,
    moduleId,
    parentId,
    action: 'update',
    payload,
    authorId,
  });

  await submitRevision(saved.id);
  await reviewRevision(saved.id, 'approved', `Trazo «${presetId}» vinculado al tema por ${authorName}`);
}

/**
 * Retira la directiva de un trazo del contenido de un tema.
 */
export async function detachTraceFromTopic(input: {
  presetId: string;
  moduleId: string;
  topicId: string;
  authorId: string;
  authorName?: string;
}): Promise<void> {
  const { presetId, moduleId, topicId, authorId, authorName = 'Administrador Docente' } = input;
  const mod = allModules.find((m) => m.id === moduleId);
  if (!mod) throw new Error(`Módulo no encontrado: ${moduleId}`);

  const topic = findTopicInTree(mod.topics, topicId);
  if (!topic) throw new Error(`Tema no encontrado: ${topicId}`);

  let currentContent = topic.content || '';
  try {
    const publishedTopics = await getAllPublishedTopics();
    const pub = publishedTopics.find((pt) => pt.module_id === moduleId && pt.id === topicId);
    if (pub && typeof pub.content === 'string') {
      currentContent = pub.content;
    }
  } catch {
    // Usar estático
  }

  // Remover directivas que tengan este presetId
  const regex = new RegExp(`\\n*:::emg-trace\\{[^}]*preset=["']${presetId}["'][^}]*\\}:::\\n*`, 'g');
  const nextContent = currentContent.replace(regex, '\n\n').trim();

  const payload = topicToRevisionPayload(topic);
  payload.content = nextContent;

  const path = findTopicPathInTree(mod.topics, topic.id);
  const parentId = path && path.length > 1 ? path[path.length - 2] : null;

  const saved = await saveRevision({
    targetTopicId: topic.id,
    moduleId,
    parentId,
    action: 'update',
    payload,
    authorId,
  });

  await submitRevision(saved.id);
  await reviewRevision(saved.id, 'approved', `Trazo «${presetId}» desvinculado del tema por ${authorName}`);
}
