import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { allModules } from '../../src/content/modules/index';
import {
  applyLessonExpansions,
  findTopicInTree,
  getAllFlatTopics,
} from '../../src/services/contentMerge';
import { topicReferences, type Reference } from '../../src/content/topicReferences';
import { isQuizEligibleLeaf, listTopicsMissingQuiz } from '../../src/utils/topicsMissingQuiz';
import { findDuplicateStems, normalizeQuizStem } from '../../src/utils/quizDuplicates';
import { isAllowedImageUrl } from '../../src/utils/mediaValidation';
import { LOCAL_QUIZ_FLAGS } from '../../src/services/localQuizzesFallback';
import { EMG_QUESTIONS_FALLBACK } from '../../src/data/emgQuestionsFallback';
import { CLINICAL_PRESETS } from '../../src/components/simulator/traceEngine/defaultPresets';
import type { QuizQuestionDraft, QuizTopicFlag } from '../../src/types/quiz';
import type { ExamQuestion } from '../../src/types/exam';
import type { RevisionPayload } from '../../src/types/database';
import { renderCalibratedTraceSvg, type RenderTraceSvgInput } from './traceSvgRenderer';

const REPO_ROOT = process.cwd();
const DRAFTS_DIR = path.join(REPO_ROOT, '.agents', 'skills', 'emg-quiz-topics', 'drafts');
const PENDING_SEED_PATH = path.join(REPO_ROOT, 'supabase', 'seeds', 'topic_quizzes_pending_validation.json');
const PUBLIC_TRACES_DIR = path.join(REPO_ROOT, 'public', 'quiz-traces');

const BOILERPLATE_PATTERNS = [
  /en relacion con .+ cual es la primera accion tecnica antes de interpretar/i,
  /que patron localiza mejor la lesion cuando se estudia/i,
  /un hallazgo aislado relacionado con .+ basta para certificar un diagnostico/i,
  /al integrar .+ en el reporte electrodiagnostico cual practica es mas util/i,
];

export function isBoilerplateStem(stem: string): boolean {
  const norm = normalizeQuizStem(stem);
  return BOILERPLATE_PATTERNS.some((re) => re.test(norm));
}

function loadEnvMap(): Record<string, string> {
  const env: Record<string, string> = {};
  const envPath = path.join(REPO_ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  }
  return { ...env, ...(process.env as Record<string, string>) };
}

function getSupabaseClient(): { client: SupabaseClient | null; mode: 'service_role' | 'anon' | 'offline'; url?: string } {
  const env = loadEnvMap();
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || url.includes('YOUR_PROJECT')) {
    return { client: null, mode: 'offline' };
  }
  if (serviceKey && serviceKey.length > 20) {
    return {
      client: createClient(url, serviceKey, { auth: { persistSession: false } }),
      mode: 'service_role',
      url,
    };
  }
  if (anonKey && !anonKey.includes('YOUR_SUPABASE')) {
    return {
      client: createClient(url, anonKey, { auth: { persistSession: false } }),
      mode: 'anon',
      url,
    };
  }
  return { client: null, mode: 'offline' };
}

function getExpandedModules() {
  return allModules.map((mod) => applyLessonExpansions(mod));
}

interface PendingSeedQuiz {
  topic_id: string;
  title?: string;
  pass_score?: number;
  clinical_validation_status?: string;
  questions?: Array<{
    id?: string;
    sort_order?: number;
    type?: string;
    stem: string;
    stem_en?: string;
    image_url?: string | null;
    image_alt?: string | null;
    options?: Array<{ id: string; text: string; textEn?: string; isCorrect?: boolean; is_correct?: boolean }>;
    explanation?: string;
    difficulty?: string;
  }>;
}

function loadPendingSeedQuizzes(): Map<string, PendingSeedQuiz> {
  const map = new Map<string, PendingSeedQuiz>();
  if (!fs.existsSync(PENDING_SEED_PATH)) return map;
  try {
    const raw = JSON.parse(fs.readFileSync(PENDING_SEED_PATH, 'utf8'));
    for (const q of raw.quizzes ?? []) {
      if (q.topic_id) map.set(q.topic_id, q);
    }
  } catch {
    // ignore malformed seed
  }
  return map;
}

function loadLocalDraftQuizzes(): Map<string, RevisionPayload & { examQuestions?: Partial<ExamQuestion>[] }> {
  const map = new Map<string, RevisionPayload & { examQuestions?: Partial<ExamQuestion>[] }>();
  if (!fs.existsSync(DRAFTS_DIR)) return map;
  for (const name of fs.readdirSync(DRAFTS_DIR)) {
    if (!name.endsWith('.json')) continue;
    try {
      const fullPath = path.join(DRAFTS_DIR, name);
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const topicId = parsed.quizTopicId || parsed.topic_id || path.basename(name, '.json');
      map.set(topicId, parsed);
    } catch {
      // ignore invalid draft file
    }
  }
  return map;
}

function resolveTopicReferences(moduleId: string, topicPath: string[]): Reference[] {
  const modRefs = topicReferences[moduleId];
  if (!modRefs) return [];
  const collected: Reference[] = [];
  const seen = new Set<string>();

  const addList = (list?: Reference[]) => {
    for (const r of list ?? []) {
      const key = `${r.authors}:${r.title}:${r.year}`;
      if (!seen.has(key)) {
        seen.add(key);
        collected.push(r);
      }
    }
  };

  for (let i = topicPath.length - 1; i >= 0; i--) {
    addList(modRefs[topicPath[i]]);
  }
  addList(modRefs._default);
  return collected;
}

// ─── Tool 1: list_quiz_coverage / analyze_question_bank ───────────────────────

export async function listQuizCoverage(args: {
  moduleId?: string;
  includeBoilerplateCheck?: boolean;
  limit?: number;
}) {
  const modules = getExpandedModules();
  const targetModules = args.moduleId
    ? modules.filter((m) => m.id === args.moduleId)
    : modules;

  const { client, mode } = getSupabaseClient();
  const dbFlags = new Map<string, QuizTopicFlag>();
  let dbQuestionStats: Array<{
    question_id: string;
    topic_id: string;
    module_id: string;
    stem: string;
    miss_rate: number;
    attempt_count: number;
  }> = [];

  for (const flag of LOCAL_QUIZ_FLAGS) {
    if (flag.question_count > 0) dbFlags.set(flag.topic_id, flag);
  }

  if (client) {
    try {
      const { data } = await client.from('quiz_topic_flags').select('*');
      if (Array.isArray(data)) {
        for (const f of data as QuizTopicFlag[]) {
          if (f.question_count > 0) dbFlags.set(f.topic_id, f);
        }
      }
      if (mode === 'service_role') {
        const { data: statsData } = await client.rpc('admin_question_stats', {
          p_module_id: args.moduleId ?? null,
        });
        if (Array.isArray(statsData)) {
          dbQuestionStats = statsData;
        }
      }
    } catch {
      // continue with local flags
    }
  }

  const localDrafts = loadLocalDraftQuizzes();
  const pendingSeed = loadPendingSeedQuizzes();
  const limit = args.limit ?? 25;

  const withPublishedOrLocalQuiz = new Set<string>([
    ...dbFlags.keys(),
    ...localDrafts.keys(),
  ]);

  const missingPublished = listTopicsMissingQuiz(targetModules, withPublishedOrLocalQuiz);

  // Inspect boilerplate status and question breakdown
  const byType: Record<string, number> = { single: 0, multiple: 0, true_false: 0, image_choice: 0 };
  const byDifficulty: Record<string, number> = { basic: 0, intermediate: 0, advanced: 0 };
  const boilerplateTopics: Array<{ topicId: string; moduleId: string; title: string }> = [];
  const enrichedTopics: Array<{
    topicId: string;
    moduleId: string;
    source: 'draft' | 'published_flag' | 'seed';
    questionCount: number;
    hasImageChoice: boolean;
    hasCitations: boolean;
  }> = [];

  const allStemsForDedup: Array<{ quizId: string; topicId: string; stem: string }> = [];

  for (const mod of targetModules) {
    for (const { topic } of getAllFlatTopics(mod.topics)) {
      if (!isQuizEligibleLeaf(topic)) continue;
      const draft = localDrafts.get(topic.id);
      const seed = pendingSeed.get(topic.id);
      const flag = dbFlags.get(topic.id);

      if (draft && Array.isArray(draft.questions) && draft.questions.length > 0) {
        let hasImg = false;
        let hasCite = false;
        for (const q of draft.questions) {
          byType[q.type] = (byType[q.type] ?? 0) + 1;
          if (q.difficulty) byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
          if (q.type === 'image_choice' || q.imageUrl) hasImg = true;
          if ((q.citations && q.citations.length > 0) || /referencia:/i.test(q.explanation ?? '')) {
            hasCite = true;
          }
          allStemsForDedup.push({ quizId: `draft:${topic.id}`, topicId: topic.id, stem: q.stem });
        }
        enrichedTopics.push({
          topicId: topic.id,
          moduleId: mod.id,
          source: 'draft',
          questionCount: draft.questions.length,
          hasImageChoice: hasImg,
          hasCitations: hasCite,
        });
      } else if (flag) {
        enrichedTopics.push({
          topicId: topic.id,
          moduleId: mod.id,
          source: 'published_flag',
          questionCount: flag.question_count,
          hasImageChoice: false,
          hasCitations: false,
        });
      } else if (seed && Array.isArray(seed.questions)) {
        const isGeneric = seed.questions.some((q) => isBoilerplateStem(q.stem));
        if (isGeneric) {
          boilerplateTopics.push({ topicId: topic.id, moduleId: mod.id, title: topic.title });
        }
      }
    }
  }

  // System exam bank (exam_questions) coverage
  const examQuestionsByModule: Record<string, { total: number; critical: number }> = {};
  for (const eq of EMG_QUESTIONS_FALLBACK) {
    if (args.moduleId && eq.module_id !== args.moduleId) continue;
    const entry = examQuestionsByModule[eq.module_id] ?? { total: 0, critical: 0 };
    entry.total += 1;
    if (eq.is_critical) entry.critical += 1;
    examQuestionsByModule[eq.module_id] = entry;
    allStemsForDedup.push({ quizId: `exam:${eq.id}`, topicId: eq.topic_id ?? eq.topic_name, stem: eq.stem });
  }

  const duplicatesMap = findDuplicateStems(allStemsForDedup);

  return {
    supabaseConnectionMode: mode,
    filterModuleId: args.moduleId ?? 'all',
    summary: {
      eligibleLeafTopics: targetModules.reduce(
        (acc, m) => acc + getAllFlatTopics(m.topics).filter(({ topic }) => isQuizEligibleLeaf(topic)).length,
        0
      ),
      topicsWithRealQuizOrDraft: enrichedTopics.length,
      topicsMissingRealQuiz: missingPublished.length,
      topicsWithGenericBoilerplateSeed: boilerplateTopics.length,
      localDraftCount: localDrafts.size,
      duplicateStemClusters: duplicatesMap.size,
    },
    questionDistributionInDrafts: {
      byType,
      byDifficulty,
    },
    systemExamBankByModule: examQuestionsByModule,
    nextTopicsMissingQuiz: missingPublished.slice(0, limit),
    boilerplateSeedTopicsSample:
      args.includeBoilerplateCheck === false ? undefined : boilerplateTopics.slice(0, limit),
    enrichedTopicsSample: enrichedTopics.slice(0, limit),
    highMissRateQuestions: dbQuestionStats.slice(0, 10),
  };
}

// ─── Tool 2: get_topic_authoring_pack / get_topic_quiz ────────────────────────

export async function getTopicAuthoringPack(args: { topicId: string; moduleId?: string }) {
  const modules = getExpandedModules();
  const preferred = args.moduleId ? modules.filter((m) => m.id === args.moduleId) : [];
  const rest = modules.filter((m) => m.id !== args.moduleId);

  let foundModuleId = '';
  let foundModuleTitle = '';
  let foundPath: string[] = [];
  let foundTopic = null as ReturnType<typeof findTopicInTree>;

  for (const mod of [...preferred, ...rest]) {
    const match = getAllFlatTopics(mod.topics).find(({ topic }) => topic.id === args.topicId);
    if (match) {
      foundModuleId = mod.id;
      foundModuleTitle = mod.title;
      foundPath = match.path;
      foundTopic = match.topic;
      break;
    }
  }

  if (!foundTopic) {
    throw new Error(`Topic '${args.topicId}' no encontrado en src/content/modules/.`);
  }

  const references = resolveTopicReferences(foundModuleId, foundPath);
  const localDrafts = loadLocalDraftQuizzes();
  const pendingSeed = loadPendingSeedQuizzes();
  const draft = localDrafts.get(args.topicId) ?? null;
  const seedQuiz = pendingSeed.get(args.topicId) ?? null;
  const seedIsBoilerplate = seedQuiz?.questions?.some((q) => isBoilerplateStem(q.stem)) ?? false;

  const { client } = getSupabaseClient();
  let dbQuiz: unknown = null;
  let dbExamQuestions: unknown[] = [];

  if (client) {
    try {
      const { data: pq } = await client
        .from('published_quizzes')
        .select('*')
        .eq('topic_id', args.topicId)
        .maybeSingle();
      if (pq) {
        const { data: qs } = await client
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', (pq as { id: string }).id)
          .order('sort_order');
        dbQuiz = { quiz: pq, questions: qs ?? [] };
      }
      const { data: eqs } = await client
        .from('exam_questions')
        .select('*')
        .or(`topic_id.eq.${args.topicId},module_id.eq.${foundModuleId}`)
        .limit(15);
      if (Array.isArray(eqs)) dbExamQuestions = eqs;
    } catch {
      // fallback to local
    }
  }

  const fallbackExamQuestions = EMG_QUESTIONS_FALLBACK.filter(
    (q) =>
      q.topic_id === args.topicId ||
      normalizeQuizStem(q.topic_name).includes(normalizeQuizStem(foundTopic.title)) ||
      q.module_id === foundModuleId
  ).slice(0, 8);

  const matchingTracePresets = CLINICAL_PRESETS.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    studyType: p.studyType,
    nerveOrMuscle: p.nerveOrMuscle,
    sweepSpeed: p.sweepSpeed,
    sensitivity: p.sensitivity,
    normalSummary: p.normal.summary,
    pathologicSummary: p.pathologic?.summary ?? null,
  }));

  return {
    topic: {
      id: foundTopic.id,
      title: foundTopic.title,
      titleEn: foundTopic.titleEn ?? null,
      moduleId: foundModuleId,
      moduleTitle: foundModuleTitle,
      curriculumPath: foundPath,
      isEligibleLeaf: isQuizEligibleLeaf(foundTopic),
      description: foundTopic.description ?? null,
      content: foundTopic.content ?? '',
      clinicalPearls: foundTopic.clinicalPearls ?? [],
      keyPoints: foundTopic.keyPoints ?? [],
      existingImages: foundTopic.imageUrls ?? [],
    },
    verifiedBibliographicReferences: references,
    existingEvaluations: {
      publishedInSupabase: dbQuiz,
      localDraftInRepo: draft,
      pendingSeedQuiz: seedQuiz
        ? {
            ...seedQuiz,
            isGenericBoilerplate: seedIsBoilerplate,
            warning: seedIsBoilerplate
              ? 'Este seed contiene preguntas genéricas (boilerplate). Debe reemplazarse por preguntas clínicas específicas del tema.'
              : undefined,
          }
        : null,
      relatedExamBankQuestions: dbExamQuestions.length > 0 ? dbExamQuestions : fallbackExamQuestions,
    },
    availableTracePresetsForImageChoice: matchingTracePresets,
    authoringRequirements: {
      minTopicQuestions: 3,
      maxTopicQuestions: 8,
      requireImageChoiceWhenApplicable: true,
      requireVerifiedCitationInExplanation: 'Incluir bloque "📚 Referencia: ..." y arreglo citations[]',
      prohibitBoilerplateStems: true,
    },
  };
}

// ─── Tool 3: validate_quiz_draft / find_similar_stems ─────────────────────────

export async function validateQuizDraft(args: {
  topicId?: string;
  moduleId?: string;
  draftPath?: string;
  payload?: RevisionPayload & { examQuestions?: Partial<ExamQuestion>[] };
  stemsOnly?: string[];
}) {
  let payload = args.payload;
  if (!payload && args.draftPath) {
    const resolvedPath = path.isAbsolute(args.draftPath)
      ? args.draftPath
      : path.join(REPO_ROOT, args.draftPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`No existe el archivo de draft: ${resolvedPath}`);
    }
    payload = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  }

  // Build global stem corpus for duplicate checking
  const corpus: Array<{ quizId: string; topicId: string; stem: string }> = [];
  const localDrafts = loadLocalDraftQuizzes();
  const targetTopicId = args.topicId || payload?.quizTopicId || 'unknown-topic';

  for (const [tId, d] of localDrafts.entries()) {
    if (tId === targetTopicId) continue;
    for (const q of d.questions ?? []) {
      corpus.push({ quizId: `draft:${tId}`, topicId: tId, stem: q.stem });
    }
  }
  for (const eq of EMG_QUESTIONS_FALLBACK) {
    corpus.push({ quizId: `exam:${eq.id}`, topicId: eq.topic_id ?? eq.topic_name, stem: eq.stem });
  }

  if (args.stemsOnly && args.stemsOnly.length > 0) {
    for (let i = 0; i < args.stemsOnly.length; i++) {
      corpus.push({ quizId: `candidate:${i}`, topicId: targetTopicId, stem: args.stemsOnly[i] });
    }
    const dupes = findDuplicateStems(corpus);
    const candidateHits = [...dupes.values()].filter((h) =>
      h.quizIds.some((id) => id.startsWith('candidate:'))
    );
    return {
      candidateCount: args.stemsOnly.length,
      duplicateHits: candidateHits,
      boilerplateHits: args.stemsOnly.filter((s) => isBoilerplateStem(s)),
    };
  }

  if (!payload) {
    throw new Error('Debes proporcionar `payload`, `draftPath` o `stemsOnly`.');
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verify leaf topic exists
  const modules = getExpandedModules();
  const allMatchingLeaves = modules.flatMap((m) =>
    getAllFlatTopics(m.topics)
      .filter(({ topic }) => topic.id === targetTopicId)
      .map(({ topic }) => ({ moduleId: m.id, topic }))
  );

  if (allMatchingLeaves.length === 0) {
    errors.push(`quizTopicId '${targetTopicId}' no existe en ningún módulo de src/content/modules/.`);
  } else if (!allMatchingLeaves.some(({ topic }) => isQuizEligibleLeaf(topic))) {
    errors.push(`El tema '${targetTopicId}' es un contenedor sin contenido; los quizzes solo van en temas hoja.`);
  }

  const questions: QuizQuestionDraft[] = payload.questions ?? [];
  if (questions.length < 3 || questions.length > 8) {
    warnings.push(`Se recomiendan entre 3 y 8 preguntas por quiz de tema (actual: ${questions.length}).`);
  }
  if (questions.length === 0) {
    errors.push('El cuestionario no contiene preguntas (`questions` está vacío).');
  }

  const byType: Record<string, number> = { single: 0, multiple: 0, true_false: 0, image_choice: 0 };
  const byDifficulty: Record<string, number> = { basic: 0, intermediate: 0, advanced: 0 };
  let hasImageChoice = false;
  let questionsWithCitation = 0;

  questions.forEach((q, idx) => {
    const label = `Pregunta #${idx + 1} (${q.id || 'sin-id'})`;
    if (!q.stem?.trim()) {
      errors.push(`${label}: 'stem' vacío.`);
    } else {
      if (isBoilerplateStem(q.stem)) {
        errors.push(`${label}: detectado enunciado genérico (boilerplate). Redacta un caso o pregunta específica del tema.`);
      }
      corpus.push({ quizId: `candidate:${targetTopicId}`, topicId: targetTopicId, stem: q.stem });
    }

    byType[q.type] = (byType[q.type] ?? 0) + 1;
    if (q.difficulty) byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;

    const opts = q.options ?? [];
    if (opts.length < 2) {
      errors.push(`${label}: requiere al menos 2 opciones.`);
    }

    const optIds = new Set<string>();
    for (const o of opts) {
      if (!o.id?.trim()) errors.push(`${label}: una opción no tiene 'id'.`);
      else if (optIds.has(o.id)) errors.push(`${label}: 'id' de opción duplicado '${o.id}'.`);
      else optIds.add(o.id);
      if (!o.text?.trim()) errors.push(`${label}: opción '${o.id}' tiene 'text' vacío.`);
    }

    const correctCount = opts.filter((o) => o.isCorrect === true).length;
    if (q.type === 'multiple') {
      if (correctCount < 2) {
        errors.push(`${label}: tipo 'multiple' requiere al menos 2 opciones con isCorrect: true (tiene ${correctCount}).`);
      }
    } else {
      if (correctCount !== 1) {
        errors.push(`${label}: tipo '${q.type}' requiere exactamente 1 opción con isCorrect: true (tiene ${correctCount}).`);
      }
    }

    if (q.type === 'image_choice') {
      hasImageChoice = true;
      if (!q.imageUrl?.trim()) {
        errors.push(`${label}: tipo 'image_choice' requiere 'imageUrl'.`);
      } else if (!isAllowedImageUrl(q.imageUrl)) {
        errors.push(`${label}: 'imageUrl' no permitida por mediaValidation.ts (${q.imageUrl}).`);
      }
      if (!q.imageAlt?.trim()) {
        errors.push(`${label}: tipo 'image_choice' requiere 'imageAlt' descriptivo clínico.`);
      }
    }

    if (!q.explanation?.trim()) {
      errors.push(`${label}: falta 'explanation' pedagógica.`);
    } else {
      const hasRefText = /referencias?:/i.test(q.explanation);
      const hasCitationsArr = Array.isArray(q.citations) && q.citations.length > 0;
      if (hasRefText || hasCitationsArr) {
        questionsWithCitation += 1;
      } else {
        warnings.push(`${label}: falta cita bibliográfica ('📚 Referencia: ...' en explanation o arreglo 'citations').`);
      }
    }
  });

  if (!hasImageChoice) {
    warnings.push('El cuestionario no incluye ninguna pregunta de tipo "image_choice". Considera generar un trazo SVG con upload_or_render_quiz_image.');
  }

  // Validate optional examQuestions (for exam_questions table)
  const examQuestions = payload.examQuestions ?? [];
  examQuestions.forEach((eq, idx) => {
    const label = `ExamQuestion #${idx + 1}`;
    if (!eq.stem?.trim()) errors.push(`${label}: falta 'stem'.`);
    else corpus.push({ quizId: `candidate-exam:${idx}`, topicId: targetTopicId, stem: eq.stem });

    if (!eq.module_id?.trim()) errors.push(`${label}: falta 'module_id'.`);
    if (!eq.topic_name?.trim()) errors.push(`${label}: falta 'topic_name'.`);
    if (!eq.source_reference?.trim()) warnings.push(`${label}: falta 'source_reference' bibliográfica.`);
    if (!eq.pearl?.trim()) warnings.push(`${label}: se recomienda incluir 'pearl' (Perla COMEFYR).`);

    const opts = eq.options ?? [];
    if (opts.length < 3) errors.push(`${label}: requiere al menos 3 opciones.`);
    const correctOpts = opts.filter((o) => o.is_correct === true);
    if (correctOpts.length !== 1) {
      errors.push(`${label}: requiere exactamente 1 opción con is_correct: true (tiene ${correctOpts.length}).`);
    }
    if (opts.some((o) => !o.feedback?.trim())) {
      errors.push(`${label}: todas las opciones de exam_questions deben incluir 'feedback' individual.`);
    }
  });

  const allDupes = findDuplicateStems(corpus);
  const candidateDupes = [...allDupes.values()].filter((hit) =>
    hit.quizIds.some((id) => id.startsWith('candidate'))
  );
  if (candidateDupes.length > 0) {
    warnings.push(`Se detectaron ${candidateDupes.length} enunciados duplicados o muy similares en el banco.`);
  }

  return {
    valid: errors.length === 0,
    topicId: targetTopicId,
    errors,
    warnings,
    duplicateHits: candidateDupes,
    stats: {
      topicQuestionsCount: questions.length,
      examBankQuestionsCount: examQuestions.length,
      byType,
      byDifficulty,
      hasImageChoice,
      questionsWithCitation,
    },
  };
}

// ─── Tool 4: upload_or_render_quiz_image / upload_quiz_image ──────────────────

export async function uploadOrRenderQuizImage(
  args: RenderTraceSvgInput & {
    topicId: string;
    mode?: 'svg_trace' | 'file' | 'base64';
    alt: string;
    filePath?: string;
    base64Data?: string;
    mimeType?: string;
    fileName?: string;
  }
) {
  const mode = args.mode ?? 'svg_trace';
  const safeTopic = args.topicId.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const shortHash = crypto.randomBytes(3).toString('hex');

  let buffer: Buffer;
  let ext = 'svg';
  let contentType = 'image/svg+xml';
  let traceMeta: Record<string, unknown> | undefined;

  if (mode === 'svg_trace') {
    const rendered = renderCalibratedTraceSvg(args);
    buffer = Buffer.from(rendered.svg, 'utf8');
    ext = 'svg';
    contentType = 'image/svg+xml';
    traceMeta = rendered.summaryMeta;
  } else if (mode === 'file' && args.filePath) {
    const abs = path.isAbsolute(args.filePath) ? args.filePath : path.join(REPO_ROOT, args.filePath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Archivo de imagen no encontrado: ${abs}`);
    }
    buffer = fs.readFileSync(abs);
    ext = path.extname(abs).replace(/^\./, '').toLowerCase() || 'png';
    contentType =
      ext === 'svg'
        ? 'image/svg+xml'
        : ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'webp'
        ? 'image/webp'
        : 'image/png';
  } else if (mode === 'base64' && args.base64Data) {
    const cleaned = args.base64Data.replace(/^data:[^;]+;base64,/, '');
    buffer = Buffer.from(cleaned, 'base64');
    contentType = args.mimeType || 'image/png';
    ext = contentType.includes('svg')
      ? 'svg'
      : contentType.includes('jpeg')
      ? 'jpg'
      : contentType.includes('webp')
      ? 'webp'
      : 'png';
  } else {
    throw new Error("Especifica mode='svg_trace', mode='file' con filePath, o mode='base64' con base64Data.");
  }

  const baseName = args.fileName
    ? args.fileName.replace(/[^a-z0-9._-]/gi, '-')
    : `${safeTopic}-${args.tracePresetId ?? args.studyType ?? 'trace'}-${shortHash}.${ext}`;

  fs.mkdirSync(PUBLIC_TRACES_DIR, { recursive: true });
  const localFilePath = path.join(PUBLIC_TRACES_DIR, baseName);
  fs.writeFileSync(localFilePath, buffer);
  const localPublicUrl = `/quiz-traces/${baseName}`;

  const { client, mode: authMode } = getSupabaseClient();
  let supabasePublicUrl: string | null = null;
  let storageWarning: string | null = null;

  if (client && authMode === 'service_role') {
    const storagePath = `quizzes/${safeTopic}/${baseName}`;
    const { error } = await client.storage
      .from('emg-trace-images')
      .upload(storagePath, buffer, { contentType, upsert: true });
    if (!error) {
      const { data } = client.storage.from('emg-trace-images').getPublicUrl(storagePath);
      supabasePublicUrl = data.publicUrl;
    } else {
      storageWarning = `Guardado localmente en ${localPublicUrl} (Supabase Storage devolvió: ${error.message})`;
    }
  } else {
    storageWarning =
      'SUPABASE_SERVICE_ROLE_KEY no configurada en .env; imagen servida desde public/quiz-traces/ y lista para dev/build.';
  }

  const finalUrl = supabasePublicUrl ?? localPublicUrl;

  return {
    imageUrl: finalUrl,
    localPublicUrl,
    supabasePublicUrl,
    localDiskPath: localFilePath,
    imageAlt: args.alt,
    isAllowedByValidator: isAllowedImageUrl(finalUrl),
    traceMeta,
    note: storageWarning ?? 'Imagen subida a bucket público emg-trace-images.',
  };
}

// ─── Tool 5: submit_quiz_draft / create_quiz_revision_draft ───────────────────

function buildStagingSql(
  topicId: string,
  moduleId: string,
  payload: RevisionPayload,
  examQuestions: Partial<ExamQuestion>[]
): string {
  const quizQuestionsJson = (payload.questions ?? []).map((q, idx) => ({
    id: q.id ?? crypto.randomUUID(),
    sort_order: q.sortOrder ?? idx,
    type: q.type,
    stem: q.stem,
    stem_en: q.stemEn ?? null,
    image_url: q.imageUrl ?? null,
    image_alt: q.imageAlt ?? null,
    options: q.options,
    explanation: q.explanation ?? null,
    explanation_en: q.explanationEn ?? null,
    difficulty: q.difficulty ?? 'intermediate',
  }));

  const lines: string[] = [
    `-- ============================================================================`,
    `-- NeuroSAFE Staging Draft for Topic: ${topicId} (Module: ${moduleId})`,
    `-- Generated at: ${new Date().toISOString()}`,
    `-- SAFETY GATE: Sets clinical_validation_status = 'pending_review' and exam status = 'DRAFT'`,
    `-- ============================================================================`,
    `DO $stage$`,
    `DECLARE`,
    `  v_quiz_id uuid;`,
    `  v_q jsonb;`,
    `  v_questions jsonb := $qjson$${JSON.stringify(quizQuestionsJson)}$qjson$::jsonb;`,
    `BEGIN`,
    `  INSERT INTO public.published_quizzes (`,
    `    topic_id, module_id, title, pass_score, max_attempts,`,
    `    shuffle_questions, shuffle_options, question_count, version,`,
    `    source_revision_id, clinical_validation_status, validation_notes`,
    `  ) VALUES (`,
    `    ${sqlLiteral(topicId)},`,
    `    ${sqlLiteral(moduleId)},`,
    `    ${sqlLiteral(payload.title || `Evaluación: ${topicId}`)},`,
    `    ${Number(payload.passScore ?? 70)},`,
    `    ${payload.maxAttempts == null ? 'NULL' : Number(payload.maxAttempts)},`,
    `    ${payload.shuffleQuestions !== false},`,
    `    ${payload.shuffleOptions !== false},`,
    `    jsonb_array_length(v_questions),`,
    `    1,`,
    `    NULL,`,
    `    'pending_review',`,
    `    'Borrador enriquecido con IA pendiente de validación clínica humana'`,
    `  )`,
    `  ON CONFLICT (topic_id) DO UPDATE SET`,
    `    module_id = EXCLUDED.module_id,`,
    `    title = EXCLUDED.title,`,
    `    pass_score = EXCLUDED.pass_score,`,
    `    question_count = EXCLUDED.question_count,`,
    `    version = public.published_quizzes.version + 1,`,
    `    source_revision_id = NULL,`,
    `    clinical_validation_status = 'pending_review',`,
    `    validation_notes = 'Actualización en cola de validación clínica humana',`,
    `    published_at = now()`,
    `  RETURNING id INTO v_quiz_id;`,
    ``,
    `  DELETE FROM public.quiz_questions WHERE quiz_id = v_quiz_id;`,
    ``,
    `  FOR v_q IN SELECT value FROM jsonb_array_elements(v_questions)`,
    `  LOOP`,
    `    INSERT INTO public.quiz_questions (`,
    `      quiz_id, sort_order, type, stem, stem_en, image_url, image_alt,`,
    `      options, explanation, explanation_en, difficulty`,
    `    ) VALUES (`,
    `      v_quiz_id,`,
    `      COALESCE((v_q->>'sort_order')::int, 0),`,
    `      COALESCE(v_q->>'type', 'single'),`,
    `      COALESCE(v_q->>'stem', ''),`,
    `      v_q->>'stem_en',`,
    `      NULLIF(v_q->>'image_url', ''),`,
    `      NULLIF(v_q->>'image_alt', ''),`,
    `      COALESCE(v_q->'options', '[]'::jsonb),`,
    `      v_q->>'explanation',`,
    `      v_q->>'explanation_en',`,
    `      NULLIF(v_q->>'difficulty', '')`,
    `    );`,
    `  END LOOP;`,
    `END`,
    `$stage$;`,
  ];

  if (examQuestions.length > 0) {
    lines.push('', `-- ─── Banco Maestro del Simulador (exam_questions en estado DRAFT) ───`);
    for (const eq of examQuestions) {
      lines.push(
        `INSERT INTO public.exam_questions (`,
        `  island_name, module_id, topic_name, topic_id, stem, findings,`,
        `  image_url, image_alt, options, difficulty, is_critical, pearl,`,
        `  source_reference, tags, status`,
        `) VALUES (`,
        `  ${sqlLiteral(eq.island_name || 'EMG')},`,
        `  ${sqlLiteral(eq.module_id || moduleId)},`,
        `  ${sqlLiteral(eq.topic_name || topicId)},`,
        `  ${sqlLiteral(eq.topic_id || topicId)},`,
        `  ${sqlLiteral(eq.stem || '')},`,
        `  $fjson$${JSON.stringify(eq.findings ?? [])}$fjson$::jsonb,`,
        `  ${eq.image_url ? sqlLiteral(eq.image_url) : 'NULL'},`,
        `  ${eq.image_alt ? sqlLiteral(eq.image_alt) : 'NULL'},`,
        `  $ojson$${JSON.stringify(eq.options ?? [])}$ojson$::jsonb,`,
        `  ${Number(eq.difficulty ?? 2)},`,
        `  ${Boolean(eq.is_critical)},`,
        `  ${eq.pearl ? sqlLiteral(eq.pearl) : 'NULL'},`,
        `  ${eq.source_reference ? sqlLiteral(eq.source_reference) : 'NULL'},`,
        `  ARRAY[${(eq.tags ?? []).map((t) => sqlLiteral(t)).join(', ')}]::text[],`,
        `  'DRAFT'`,
        `);`
      );
    }
  }

  return lines.join('\n') + '\n';
}

function sqlLiteral(val: string): string {
  return `'${val.replace(/'/g, "''")}'`;
}

export async function submitQuizDraft(args: {
  topicId: string;
  moduleId: string;
  draftPath?: string;
  payload?: RevisionPayload & { examQuestions?: Partial<ExamQuestion>[] };
  stageToSupabase?: boolean;
}) {
  let payload = args.payload;
  if (!payload && args.draftPath) {
    const abs = path.isAbsolute(args.draftPath) ? args.draftPath : path.join(REPO_ROOT, args.draftPath);
    if (!fs.existsSync(abs)) {
      throw new Error(`Archivo draft no encontrado: ${abs}`);
    }
    payload = JSON.parse(fs.readFileSync(abs, 'utf8'));
  }

  if (!payload) {
    throw new Error('Debes proporcionar `payload` o `draftPath`.');
  }

  const normalizedPayload: RevisionPayload & {
    moduleId?: string;
    examQuestions?: Partial<ExamQuestion>[];
  } = {
    ...payload,
    moduleId: args.moduleId,
    revisionType: 'quiz',
    quizTopicId: args.topicId,
  };

  const validation = await validateQuizDraft({
    topicId: args.topicId,
    moduleId: args.moduleId,
    payload: normalizedPayload,
  });

  if (!validation.valid) {
    return {
      staged: false,
      reason: 'El borrador tiene errores de validación que deben corregirse antes de guardar.',
      validation,
    };
  }

  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const jsonOutPath = path.join(DRAFTS_DIR, `${args.topicId}.json`);
  const sqlOutPath = path.join(DRAFTS_DIR, `${args.topicId}.sql`);

  fs.writeFileSync(jsonOutPath, JSON.stringify(normalizedPayload, null, 2) + '\n', 'utf8');

  const sql = buildStagingSql(
    args.topicId,
    args.moduleId,
    normalizedPayload,
    normalizedPayload.examQuestions ?? []
  );
  fs.writeFileSync(sqlOutPath, sql, 'utf8');

  let supabaseStagingResult: Record<string, unknown> = {
    executed: false,
    note: 'Guardado en archivos locales (.json y .sql). Puedes ejecutar el SQL vía Supabase MCP o importar en el editor.',
  };

  if (args.stageToSupabase) {
    const { client, mode } = getSupabaseClient();
    if (client && mode === 'service_role') {
      const rpcPayload = {
        quizzes: [
          {
            topic_id: args.topicId,
            module_id: args.moduleId,
            title: normalizedPayload.title,
            pass_score: normalizedPayload.passScore ?? 70,
            max_attempts: normalizedPayload.maxAttempts ?? null,
            shuffle_questions: normalizedPayload.shuffleQuestions ?? true,
            shuffle_options: normalizedPayload.shuffleOptions ?? true,
            clinical_validation_status: 'pending_review',
            questions: (normalizedPayload.questions ?? []).map((q, idx) => ({
              id: q.id ?? crypto.randomUUID(),
              sort_order: q.sortOrder ?? idx,
              type: q.type,
              stem: q.stem,
              stem_en: q.stemEn ?? null,
              image_url: q.imageUrl ?? null,
              image_alt: q.imageAlt ?? null,
              options: q.options,
              explanation: q.explanation ?? null,
              explanation_en: q.explanationEn ?? null,
              difficulty: q.difficulty ?? 'intermediate',
            })),
          },
        ],
      };

      const { data: importRes, error: importErr } = await client.rpc('admin_import_pending_quizzes', {
        p_payload: rpcPayload,
      });

      let examInserted = 0;
      if ((normalizedPayload.examQuestions ?? []).length > 0) {
        const rows = (normalizedPayload.examQuestions ?? []).map((eq) => ({
          island_name: eq.island_name || 'EMG',
          module_id: eq.module_id || args.moduleId,
          topic_name: eq.topic_name || args.topicId,
          topic_id: eq.topic_id || args.topicId,
          stem: eq.stem || '',
          findings: eq.findings ?? [],
          image_url: eq.image_url ?? null,
          image_alt: eq.image_alt ?? null,
          options: eq.options ?? [],
          difficulty: eq.difficulty ?? 2,
          is_critical: Boolean(eq.is_critical),
          pearl: eq.pearl ?? null,
          source_reference: eq.source_reference ?? null,
          tags: eq.tags ?? [],
          status: 'DRAFT',
        }));
        const { data: eqData, error: eqErr } = await client
          .from('exam_questions')
          .insert(rows)
          .select('id');
        if (!eqErr && Array.isArray(eqData)) examInserted = eqData.length;
      }

      supabaseStagingResult = {
        executed: !importErr,
        quizImportResponse: importRes ?? importErr?.message,
        examQuestionsDraftsInserted: examInserted,
      };
    }
  }

  return {
    staged: true,
    topicId: args.topicId,
    moduleId: args.moduleId,
    filesWritten: {
      jsonDraftPath: path.relative(REPO_ROOT, jsonOutPath).replace(/\\/g, '/'),
      sqlStagingPath: path.relative(REPO_ROOT, sqlOutPath).replace(/\\/g, '/'),
    },
    humanReviewLinks: {
      adminQuizEditor: `/admin/quizzes?topicId=${args.topicId}&moduleId=${args.moduleId}`,
      contributorEditor: `/colaborador/cuestionario?moduleId=${args.moduleId}&topicId=${args.topicId}`,
      clinicalValidationPanel: `/admin/revisiones`,
    },
    supabaseStagingResult,
    validation,
  };
}

export const MCP_TOOL_DEFINITIONS = [
  {
    name: 'list_quiz_coverage',
    description:
      'Analiza la cobertura de cuestionarios por módulo/tema, detecta temas sin quiz (en orden curricular), identifica quizzes con enunciados genéricos (boilerplate), distribución por dificultad/tipo, duplicados y cobertura de exam_questions.',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: {
          type: 'string',
          description: 'ID opcional del módulo (ej. "fundamentals", "nerve-conduction", "emg-needle").',
        },
        includeBoilerplateCheck: {
          type: 'boolean',
          description: 'Si es true (por defecto), reporta temas cuyo seed tiene stems genéricos.',
        },
        limit: {
          type: 'number',
          description: 'Máximo de elementos de muestra por lista (default 25).',
        },
      },
    },
  },
  {
    name: 'get_topic_authoring_pack',
    description:
      'Obtiene todo el paquete de contexto de un tema hoja en una sola llamada: contenido de la lección, perlas clínicas, puntos clave, referencias bibliográficas verificadas (topicReferences.ts), quiz actual, preguntas de exam_questions relacionadas y presets de trazos EMG disponibles.',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: {
          type: 'string',
          description: 'ID del tema hoja (ej. "martin-gruber", "cathode-anode", "blink-technique").',
        },
        moduleId: {
          type: 'string',
          description: 'ID opcional del módulo para desambiguar si hubiera slugs repetidos.',
        },
      },
      required: ['topicId'],
    },
  },
  {
    name: 'validate_quiz_draft',
    description:
      'Valida un borrador de cuestionario (RevisionPayload + examQuestions): comprueba que el topicId sea hoja, reglas de puntuación por tipo, URLs de imagen (isAllowedImageUrl), presencia de citas bibliográficas ("📚 Referencia:"), ausencia de boilerplate y detección de stems duplicados (findDuplicateStems).',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: { type: 'string', description: 'ID del tema hoja.' },
        moduleId: { type: 'string', description: 'ID del módulo.' },
        draftPath: {
          type: 'string',
          description: 'Ruta al archivo JSON de borrador (ej. ".agents/skills/emg-quiz-topics/drafts/martin-gruber.json").',
        },
        payload: {
          type: 'object',
          description: 'Objeto RevisionPayload en línea (alternativa a draftPath).',
        },
        stemsOnly: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista opcional de enunciados para verificar solo similitud/duplicados.',
        },
      },
    },
  },
  {
    name: 'upload_or_render_quiz_image',
    description:
      'Genera un trazado EMG/NCS calibrado en formato SVG estilo osciloscopio (a partir de un preset de traceEngine o parámetros personalizados) o sube una imagen clínica a public/quiz-traces y al bucket público emg-trace-images de Supabase.',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: { type: 'string', description: 'ID del tema al que se asocia la imagen.' },
        mode: {
          type: 'string',
          enum: ['svg_trace', 'file', 'base64'],
          description: 'Modo de generación/subida (default "svg_trace").',
        },
        alt: {
          type: 'string',
          description: 'Descripción clínica obligatoria para accesibilidad (imageAlt).',
        },
        tracePresetId: {
          type: 'string',
          description: 'ID opcional de CLINICAL_PRESETS (ej. "median-cts", "ulnar-elbow", "axonal-poly", "cidp-dem", "als-mnd", "myopathy-polymyositis").',
        },
        variant: {
          type: 'string',
          enum: ['normal', 'pathologic', 'comparison'],
          description: 'Variante del preset a graficar (default "pathologic").',
        },
        studyType: {
          type: 'string',
          enum: ['motor', 'sensory', 'needle', 'late_response'],
        },
        latencyMs: { type: 'number', description: 'Latencia de inicio L1 en ms.' },
        amplitude: { type: 'number', description: 'Amplitud en mV o µV.' },
        durationMs: { type: 'number', description: 'Duración de la fase negativa en ms.' },
        proximalLatencyMs: { type: 'number', description: 'Latencia proximal L2 en ms (para doble canal).' },
        proximalAmplitude: { type: 'number', description: 'Amplitud proximal (para mostrar bloqueo de conducción).' },
        conductionBlock: { type: 'boolean' },
        temporalDispersion: { type: 'boolean' },
        needlePattern: {
          type: 'string',
          enum: [
            'normal_silence',
            'normal_mup',
            'fibrillations',
            'positive_waves',
            'fasciculations',
            'myotonia',
            'neurogenic_mup',
            'myopathic_mup',
          ],
        },
        sweepMsPerDiv: { type: 'number', description: 'Velocidad de barrido en ms/div (default 2 o 10).' },
        gainPerDiv: { type: 'string', description: 'Sensibilidad por división (ej. "2 mV", "20 µV", "100 µV").' },
        hideDiagnosis: {
          type: 'boolean',
          description: 'Si es true (default), oculta el nombre patológico del encabezado para no delatar la respuesta.',
        },
        filePath: { type: 'string', description: 'Ruta local cuando mode="file".' },
        base64Data: { type: 'string', description: 'Contenido base64 cuando mode="base64".' },
      },
      required: ['topicId', 'alt'],
    },
  },
  {
    name: 'submit_quiz_draft',
    description:
      'Valida y guarda el borrador completo en .agents/skills/emg-quiz-topics/drafts/{topicId}.json y genera el script SQL idempotente ({topicId}.sql) con clinical_validation_status = "pending_review" y exam_questions en status = "DRAFT". Nunca publica en vivo sin validación humana.',
    inputSchema: {
      type: 'object',
      properties: {
        topicId: { type: 'string', description: 'ID del tema hoja.' },
        moduleId: { type: 'string', description: 'ID del módulo.' },
        draftPath: { type: 'string', description: 'Ruta al archivo JSON de borrador.' },
        payload: { type: 'object', description: 'RevisionPayload + examQuestions en línea.' },
        stageToSupabase: {
          type: 'boolean',
          description: 'Si es true y existe SUPABASE_SERVICE_ROLE_KEY, inserta en cola pending_review / DRAFT.',
        },
      },
      required: ['topicId', 'moduleId'],
    },
  },
];

export async function dispatchToolCall(name: string, rawArgs: Record<string, unknown> = {}) {
  switch (name) {
    case 'list_quiz_coverage':
    case 'analyze_question_bank':
      return listQuizCoverage(rawArgs as Parameters<typeof listQuizCoverage>[0]);

    case 'get_topic_authoring_pack':
    case 'get_topic_quiz':
      return getTopicAuthoringPack(rawArgs as Parameters<typeof getTopicAuthoringPack>[0]);

    case 'validate_quiz_draft':
    case 'find_similar_stems':
      return validateQuizDraft(rawArgs as Parameters<typeof validateQuizDraft>[0]);

    case 'upload_or_render_quiz_image':
    case 'upload_quiz_image':
      return uploadOrRenderQuizImage(rawArgs as Parameters<typeof uploadOrRenderQuizImage>[0]);

    case 'submit_quiz_draft':
    case 'create_quiz_revision_draft':
      return submitQuizDraft(rawArgs as Parameters<typeof submitQuizDraft>[0]);

    default:
      throw new Error(`Tool desconocida: '${name}'. Tools disponibles: ${MCP_TOOL_DEFINITIONS.map((t) => t.name).join(', ')}`);
  }
}

