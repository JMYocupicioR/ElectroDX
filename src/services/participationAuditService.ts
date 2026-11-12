import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { allModules } from '../content/modules';
import { applyLessonExpansions, findTopicInTree } from './contentMerge';
import { stripLegacyPdfMarkdown } from '../utils/topicPrintables';
import { ALL_CASE_TEMPLATES } from '../../ejercicios/src/data/CaseTemplates';
import type { Topic } from '../types/content';
import type {
  ContentRevision,
  EditionCreditActItemRow,
  EditionCreditActRow,
  EditorialConfigTaskRow,
  ParticipationAuditLogRow,
  ParticipationBagCategory,
  PhysicianAgreement,
  PhysicianMarkedRole,
  Profile,
  PublishedTopic,
  TopicMediaAssetRow,
  TopicWordAttributionRow,
} from '../types/database';

export const PLATFORM_BASELINE_AUTHOR = 'PLATFORM_BASELINE';

const STATIC_CASE_IDS = new Set(ALL_CASE_TEMPLATES.map((t) => t.patternId));

export interface WordToken {
  raw: string;
  skeleton: string;
  ownerAuthorId: string; // 'PLATFORM_BASELINE' or physician UUID
  revisionId: string | null;
}

export interface RevisionAttributionDiagnostic {
  revisionId: string;
  topicId: string;
  moduleId: string;
  authorId: string;
  reviewedAt: string;
  netWordsAdded: number;
  wordsDeleted: number;
  orthographicTokensFixed: number;
  isOrthographicOrFormatOnly: boolean;
  isMediaOnlyChange: boolean;
  isReferencesOnlyChange: boolean;
  bagCategory: ParticipationBagCategory;
  legalClauseRef: string;
  summary: string;
}

export interface TopicAttributionSummary {
  topicId: string;
  moduleId: string;
  topicTitle: string;
  hasStaticBaseline: boolean;
  baselineWords: number;
  totalAuthoredWords: number;
  totalAllWords: number;
  principalAuthorId: string | null;
  requiresDirectionTieBreak: boolean;
  attributions: TopicWordAttributionRow[];
  revisionDiagnostics: RevisionAttributionDiagnostic[];
  embeddedMediaSummary: {
    videosCount: number;
    videosWithDurationCount: number;
    totalVideoDurationSeconds: number;
    imagesCount: number;
    pdfsCount: number;
    referencesCount: number;
  };
}

export interface PhysicianParticipationSummary {
  physicianId: string;
  displayName: string;
  credentials: string | null;
  markedRole: PhysicianMarkedRole | 'sin_convenio';
  agreementFolio: string | null;
  agreementSignedAt: string | null;
  // Candados Cláusula 2
  canEarnDocencia: boolean;
  canEarnObra: boolean;
  canEarnEditorial: boolean;
  // Bolsa 1: Docencia (Cláusula 6 y Art. 13-14)
  rawCompletedSessions: number;
  validatedSessions: number;
  computableSessions: number;
  totalTeachingMinutes: number;
  docenciaSharePct: number;
  docenciaPayoutMxn: number;
  // Bolsa 2: Obra (Cláusula 7 y Art. 5-8)
  rawSurvivingWords: number;
  computableWords: number;
  orthographicEditsFiltered: number;
  principalAuthorTopics: { topicId: string; title: string; words: number; sharePct: number }[];
  coauthorTopics: { topicId: string; title: string; words: number; sharePct: number }[];
  obraSharePct: number;
  obraPayoutMxn: number;
  // Bolsa 3: Labor Editorial (Cláusula 8 y Art. 10)
  publishedQuizQuestions: number; // x 1 u.
  publishedExamQuestions: number; // x 1 u.
  publishedClinicalCases: number; // x 2 u.
  closedConfigTasks: number;      // x 1 u.
  rawEditorialUnits: number;
  computableEditorialUnits: number;
  editorialSharePct: number;
  editorialPayoutMxn: number;
  // Multimedia informativa (Escenarios 5 y 6: Hora != Palabra)
  uploadedImagesCount: number;
  uploadedPdfsCount: number;
  uploadedVideosCount: number;
  uploadedVideosDurationSeconds: number;
  // Total
  totalPayoutMxn: number;
  excludedContributionsWarnings: string[];
}

export interface PlatformParticipationReport {
  editionLabel: string;
  generatedAt: string;
  pools: {
    docenciaPoolMxn: number;
    obraPoolMxn: number;
    editorialPoolMxn: number;
  };
  totals: {
    totalComputableSessions: number;
    totalPublishedAuthoredWords: number;
    totalPlatformBaselineWords: number;
    totalComputableEditorialUnits: number;
    totalOrthographicEditsFiltered: number;
  };
  physicians: PhysicianParticipationSummary[];
  topics: TopicAttributionSummary[];
  syntheticAuditEvents: RevisionAttributionDiagnostic[];
  snapshotSha256: string;
}

// ============================================================================
// 1. SANITIZACIÓN Y TOKENIZACIÓN CLÍNICA (Reglamento Art. 5 y 6)
// ============================================================================

/**
 * Elimina bloques que NO son redacción clínica según el Reglamento Editorial Art. 5 y 6:
 * - Bloques interactivos :::emg-trace{...}:::
 * - Citas de PDFs legadas (> 📄 **Recurso Clínico Docente:** ...)
 * - Bloques de código cercados (```...```)
 * - Secciones de Bibliografía / Referencias pegadas dentro del Markdown
 * - Etiquetas HTML, URLs puras, sintaxis de imágenes Markdown y firmas automáticas *(Aporte: ...)*
 */
export function sanitizeClinicalProse(input: {
  title?: string | null;
  description?: string | null;
  content?: string | null;
  clinicalPearls?: string[] | null;
  keyPoints?: string[] | null;
}): string {
  const rawBody = stripLegacyPdfMarkdown(input.content ?? '');

  // Excluir sección de Bibliografía/Referencias si fue pegada dentro del Markdown (Escenario 4)
  const bodyWithoutInlineBibliography = rawBody.replace(
    /(?:^|\n)#{1,4}\s*(?:bibliograf[íi]a|referencias(?:\s+bibliogr[áa]ficas)?|lecturas\s+recomendadas)\b[\s\S]*$/i,
    '\n'
  );

  const pearlsClean = (input.clinicalPearls ?? []).map((pearl) =>
    pearl.replace(/\*\(Aporte:[^)]+\)\*/gi, '')
  );
  const keyPointsClean = input.keyPoints ?? [];

  const combined = [
    input.description ?? '',
    bodyWithoutInlineBibliography,
    ...pearlsClean,
    ...keyPointsClean,
  ].join('\n\n');

  return combined
    // Bloques de simulador de trazos :::emg-trace{...}:::
    .replace(/:::emg-trace\{[\s\S]*?\}:::/g, ' ')
    // Bloques de código cercados
    .replace(/```[\s\S]*?```/g, ' ')
    // Imágenes en Markdown ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    // Enlaces en Markdown [texto](url) -> conservar únicamente el texto clínico
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // URLs sueltas
    .replace(/https?:\/\/\S+/gi, ' ')
    // Etiquetas HTML
    .replace(/<[^>]+>/g, ' ')
    // Separadores de tablas Markdown |---|---|
    .replace(/\|[\s:-]+\|/g, ' ')
    // Símbolos de formato Markdown
    .replace(/[#*_~`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza una palabra a su esqueleto fonético/ortográfico sin tildes ni mayúsculas
 * para detectar correcciones puramente ortográficas o de puntuación (Reglamento Art. 6).
 */
export function toWordSkeleton(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Distancia de edición de Levenshtein acotada a <= 2 para detectar corrección de 1 letra (typo).
 */
export function isSingleTypoCorrection(skeletonA: string, skeletonB: string): boolean {
  if (skeletonA === skeletonB) return true;
  if (skeletonA.length < 4 || skeletonB.length < 4) return false;
  const lenDiff = Math.abs(skeletonA.length - skeletonB.length);
  if (lenDiff > 1) return false;

  // Caso 1: misma longitud y difieren en exactamente 1 carácter (ej. "fisiolobia" -> "fisiologia")
  if (skeletonA.length === skeletonB.length) {
    let diffs = 0;
    for (let i = 0; i < skeletonA.length; i++) {
      if (skeletonA[i] !== skeletonB[i]) {
        diffs++;
        if (diffs > 1) return false;
      }
    }
    return diffs === 1;
  }

  // Caso 2: 1 letra insertada u omitida (ej. "electromiogrfia" -> "electromiografia")
  const shorter = skeletonA.length < skeletonB.length ? skeletonA : skeletonB;
  const longer = skeletonA.length < skeletonB.length ? skeletonB : skeletonA;
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      if (skipped) return false;
      skipped = true;
      j++;
    }
  }
  return true;
}

export function extractRawWords(cleanText: string): { raw: string; skeleton: string }[] {
  if (!cleanText.trim()) return [];
  const matches = cleanText.match(/[\p{L}\p{N}]+(?:[-'/][\p{L}\p{N}]+)*/gu) ?? [];
  const out: { raw: string; skeleton: string }[] = [];
  for (const raw of matches) {
    const skeleton = toWordSkeleton(raw);
    if (skeleton.length > 0) {
      out.push({ raw, skeleton });
    }
  }
  return out;
}

// ============================================================================
// 2. MOTOR DE DIFF PALABRA POR PALABRA Y ATRIBUCIÓN SIN DUPLICACIÓN (Art. 6, 7, 8)
// ============================================================================

/**
 * Aplica una revisión sobre la secuencia de tokens vigente:
 * - Conserva el ownerAuthorId de todos los pasajes sin cambio (Art. 7: ningún pasaje se cuenta dos veces).
 * - Si un token solo cambió de tilde, mayúscula, signo o 1 letra tipográfica en el mismo contexto,
 *   conserva el ownerAuthorId original y suma 0 palabras al autor que hizo la corrección (Art. 6).
 * - Solo asigna el nuevo authorId a palabras genuinamente nuevas o reescritas.
 */
export function applyRevisionWordDiff(
  prevTokens: WordToken[],
  nextTextClean: string,
  revisionAuthorId: string,
  revisionId: string | null
): {
  nextTokens: WordToken[];
  netWordsAdded: number;
  wordsDeleted: number;
  orthographicTokensFixed: number;
} {
  const nextWords = extractRawWords(nextTextClean);
  if (prevTokens.length === 0) {
    const created: WordToken[] = nextWords.map((w) => ({
      raw: w.raw,
      skeleton: w.skeleton,
      ownerAuthorId: revisionAuthorId,
      revisionId,
    }));
    return {
      nextTokens: created,
      netWordsAdded: created.length,
      wordsDeleted: 0,
      orthographicTokensFixed: 0,
    };
  }

  if (nextWords.length === 0) {
    return {
      nextTokens: [],
      netWordsAdded: 0,
      wordsDeleted: prevTokens.length,
      orthographicTokensFixed: 0,
    };
  }

  // Algoritmo de alineación por anclas + ventana LCS para soportar textos largos en < 5ms
  const n = prevTokens.length;
  const m = nextWords.length;
  const result: WordToken[] = [];
  let netWordsAdded = 0;
  let wordsDeleted = 0;
  let orthographicTokensFixed = 0;

  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    const prevTok = prevTokens[i];
    const nextW = nextWords[j];

    // 1. Coincidencia exacta de esqueleto (idéntica o cambio de tilde/mayúscula)
    if (prevTok.skeleton === nextW.skeleton) {
      if (prevTok.raw !== nextW.raw) {
        orthographicTokensFixed++;
      }
      result.push({
        raw: nextW.raw,
        skeleton: nextW.skeleton,
        ownerAuthorId: prevTok.ownerAuthorId,
        revisionId: prevTok.revisionId,
      });
      i++;
      j++;
      continue;
    }

    // 2. Corrección de 1 letra (typo in-situ, Reglamento Art. 6) con contexto vecino igual
    const nextPrevEq =
      (i + 1 < n && j + 1 < m && prevTokens[i + 1].skeleton === nextWords[j + 1].skeleton) ||
      (i === n - 1 && j === m - 1);
    if (nextPrevEq && isSingleTypoCorrection(prevTok.skeleton, nextW.skeleton)) {
      orthographicTokensFixed++;
      result.push({
        raw: nextW.raw,
        skeleton: nextW.skeleton,
        ownerAuthorId: prevTok.ownerAuthorId, // Mantiene el autor original (0 palabras para quien corrigió 1 letra)
        revisionId: prevTok.revisionId,
      });
      i++;
      j++;
      continue;
    }

    // 3. Búsqueda de resincronización en ventana de lookahead (hasta 120 palabras)
    const LOOKAHEAD = 120;
    let foundPrevIdx = -1;
    let foundNextIdx = -1;

    searchLoop: for (let dist = 1; dist <= LOOKAHEAD; dist++) {
      for (let di = 0; di <= dist; di++) {
        const dj = dist - di;
        if (i + di < n && j + dj < m) {
          if (prevTokens[i + di].skeleton === nextWords[j + dj].skeleton) {
            // Confirmar que al menos 2 palabras consecutivas empatan (para evitar falsos empates en "de", "la")
            const singleMatchOk =
              prevTokens[i + di].skeleton.length >= 5 ||
              (i + di + 1 < n &&
                j + dj + 1 < m &&
                prevTokens[i + di + 1].skeleton === nextWords[j + dj + 1].skeleton);
            if (singleMatchOk) {
              foundPrevIdx = i + di;
              foundNextIdx = j + dj;
              break searchLoop;
            }
          }
        }
      }
    }

    if (foundPrevIdx !== -1 && foundNextIdx !== -1) {
      // Las palabras entre i y foundPrevIdx fueron eliminadas
      wordsDeleted += foundPrevIdx - i;
      // Las palabras entre j y foundNextIdx fueron insertadas por revisionAuthorId
      for (let k = j; k < foundNextIdx; k++) {
        result.push({
          raw: nextWords[k].raw,
          skeleton: nextWords[k].skeleton,
          ownerAuthorId: revisionAuthorId,
          revisionId,
        });
        netWordsAdded++;
      }
      i = foundPrevIdx;
      j = foundNextIdx;
    } else {
      // Sustitución directa del token actual
      if (isSingleTypoCorrection(prevTok.skeleton, nextW.skeleton)) {
        orthographicTokensFixed++;
        result.push({
          raw: nextW.raw,
          skeleton: nextW.skeleton,
          ownerAuthorId: prevTok.ownerAuthorId,
          revisionId: prevTok.revisionId,
        });
      } else {
        wordsDeleted++;
        netWordsAdded++;
        result.push({
          raw: nextW.raw,
          skeleton: nextW.skeleton,
          ownerAuthorId: revisionAuthorId,
          revisionId,
        });
      }
      i++;
      j++;
    }
  }

  if (i < n) {
    wordsDeleted += n - i;
  }
  while (j < m) {
    result.push({
      raw: nextWords[j].raw,
      skeleton: nextWords[j].skeleton,
      ownerAuthorId: revisionAuthorId,
      revisionId,
    });
    netWordsAdded++;
    j++;
  }

  return {
    nextTokens: result,
    netWordsAdded,
    wordsDeleted,
    orthographicTokensFixed,
  };
}

// ============================================================================
// 3. CÁLCULO DE ATRIBUCIÓN POR TEMA Y DETECCIÓN DE LOS 6 ESCENARIOS BORDE
// ============================================================================

const expandedStaticModules = allModules.map(applyLessonExpansions);

export function findStaticBaselineTopic(moduleId: string, topicId: string): Topic | null {
  const mod = expandedStaticModules.find((m) => m.id === moduleId);
  if (!mod) return null;
  return findTopicInTree(mod.topics, topicId);
}

export function computeSingleTopicAttribution(params: {
  editionLabel: string;
  moduleId: string;
  topicId: string;
  publishedTopic?: PublishedTopic | null;
  approvedRevisions: ContentRevision[];
}): TopicAttributionSummary {
  const { editionLabel, moduleId, topicId, publishedTopic, approvedRevisions } = params;
  const staticTopic = findStaticBaselineTopic(moduleId, topicId);

  let tokens: WordToken[] = [];

  if (staticTopic) {
    const baselineClean = sanitizeClinicalProse({
      title: staticTopic.title,
      description: staticTopic.description,
      content: staticTopic.content,
      clinicalPearls: staticTopic.clinicalPearls,
      keyPoints: staticTopic.keyPoints,
    });
    const baselineRawWords = extractRawWords(baselineClean);
    tokens = baselineRawWords.map((w) => ({
      raw: w.raw,
      skeleton: w.skeleton,
      ownerAuthorId: PLATFORM_BASELINE_AUTHOR,
      revisionId: null,
    }));
  }

  const sortedRevs = [...approvedRevisions].sort((a, b) => {
    const ta = a.reviewed_at ?? a.updated_at ?? a.created_at;
    const tb = b.reviewed_at ?? b.updated_at ?? b.created_at;
    return ta.localeCompare(tb);
  });

  const revisionDiagnostics: RevisionAttributionDiagnostic[] = [];
  const orthographicIgnoredByAuthor = new Map<string, number>();
  const revisionsByAuthor = new Map<string, string[]>();

  let prevMediaJson = JSON.stringify({
    videoUrls: staticTopic?.videoUrls ?? [],
    youtubeUrls: staticTopic?.youtubeUrls ?? [],
    vimeoUrls: staticTopic?.vimeoUrls ?? [],
    embedUrls: staticTopic?.embedUrls ?? [],
    imageUrls: staticTopic?.imageUrls ?? [],
    pdfUrls: staticTopic?.pdfUrls ?? [],
  });
  let prevRefsJson = JSON.stringify([]);

  for (const rev of sortedRevs) {
    const p = rev.payload;
    const cleanProse = sanitizeClinicalProse({
      title: p.title,
      description: p.description,
      content: p.content,
      clinicalPearls: p.clinicalPearls,
      keyPoints: p.keyPoints,
    });

    const diff = applyRevisionWordDiff(tokens, cleanProse, rev.author_id, rev.id);
    tokens = diff.nextTokens;

    const currentMediaJson = JSON.stringify({
      videoUrls: p.media?.videoUrls ?? p.videoUrls ?? [],
      youtubeUrls: p.media?.youtubeUrls ?? p.youtubeUrls ?? [],
      vimeoUrls: p.media?.vimeoUrls ?? p.vimeoUrls ?? [],
      embedUrls: p.media?.embedUrls ?? p.embedUrls ?? [],
      imageUrls: p.media?.imageUrls ?? p.imageUrls ?? [],
      pdfUrls: p.media?.pdfUrls ?? p.pdfUrls ?? [],
    });
    const currentRefsJson = JSON.stringify(p.media?.references ?? p.references ?? []);

    const mediaChanged = currentMediaJson !== prevMediaJson;
    const refsChanged = currentRefsJson !== prevRefsJson;
    prevMediaJson = currentMediaJson;
    prevRefsJson = currentRefsJson;

    const isOrthographicOrFormatOnly =
      diff.netWordsAdded === 0 && !mediaChanged && !refsChanged;
    const isMediaOnlyChange = diff.netWordsAdded === 0 && mediaChanged;
    const isReferencesOnlyChange = diff.netWordsAdded === 0 && !mediaChanged && refsChanged;

    if (diff.orthographicTokensFixed > 0 || isOrthographicOrFormatOnly) {
      orthographicIgnoredByAuthor.set(
        rev.author_id,
        (orthographicIgnoredByAuthor.get(rev.author_id) ?? 0) +
          Math.max(1, diff.orthographicTokensFixed)
      );
    }

    const revList = revisionsByAuthor.get(rev.author_id) ?? [];
    revList.push(rev.id);
    revisionsByAuthor.set(rev.author_id, revList);

    let bagCategory: ParticipationBagCategory = 'obra';
    let legalClauseRef = 'Contrato Cl. 7 y Reglamento Art. 5 y 7 (Palabras publicadas sin duplicación)';
    let summary = `+${diff.netWordsAdded} palabras clínicas aportadas (${diff.wordsDeleted} reemplazadas/eliminadas).`;

    if (isMediaOnlyChange) {
      bagCategory = 'excluded';
      legalClauseRef =
        'Reglamento Art. 6 y Art. 13-14 (Subida de video/imagen/PDF no suma palabras en Obra; Hora ≠ Palabra)';
      summary = 'Actualización exclusiva de material multimedia/gráfico (0 palabras de Obra).';
    } else if (isReferencesOnlyChange) {
      bagCategory = 'excluded';
      legalClauseRef =
        'Reglamento Art. 6 (Actualización de metadatos bibliográficos no suma palabras de redacción clínica)';
      summary = 'Actualización exclusiva de bibliografía/referencias (0 palabras de Obra).';
    } else if (isOrthographicOrFormatOnly) {
      bagCategory = 'excluded';
      legalClauseRef =
        'Reglamento Art. 6 (Corrección ortográfica, puntuación o formato = 0 palabras)';
      summary = `Edición menor u ortográfica filtrada (${diff.orthographicTokensFixed} ajustes tipográficos → 0 palabras acreditadas).`;
    }

    revisionDiagnostics.push({
      revisionId: rev.id,
      topicId,
      moduleId,
      authorId: rev.author_id,
      reviewedAt: rev.reviewed_at ?? rev.updated_at ?? rev.created_at,
      netWordsAdded: diff.netWordsAdded,
      wordsDeleted: diff.wordsDeleted,
      orthographicTokensFixed: diff.orthographicTokensFixed,
      isOrthographicOrFormatOnly,
      isMediaOnlyChange,
      isReferencesOnlyChange,
      bagCategory,
      legalClauseRef,
      summary,
    });
  }

  // Si existe un publishedTopic modificado directamente sin revisiones aprobadas asociadas
  if (publishedTopic) {
    const finalClean = sanitizeClinicalProse({
      title: publishedTopic.title,
      description: publishedTopic.description,
      content: publishedTopic.content,
      clinicalPearls: publishedTopic.clinical_pearls,
      keyPoints: publishedTopic.key_points,
    });
    const fallbackAuthor =
      publishedTopic.last_edited_by ??
      publishedTopic.published_by ??
      PLATFORM_BASELINE_AUTHOR;
    const finalDiff = applyRevisionWordDiff(
      tokens,
      finalClean,
      fallbackAuthor,
      publishedTopic.source_revision_id
    );
    tokens = finalDiff.nextTokens;
  }

  // Contar palabras vivas al cierre por cada autor (Reglamento Art. 7)
  const wordsByAuthor = new Map<string, number>();
  for (const tok of tokens) {
    wordsByAuthor.set(tok.ownerAuthorId, (wordsByAuthor.get(tok.ownerAuthorId) ?? 0) + 1);
  }

  const survivingBaselineWords = wordsByAuthor.get(PLATFORM_BASELINE_AUTHOR) ?? 0;
  let totalAuthoredWords = 0;
  for (const [authorId, count] of wordsByAuthor.entries()) {
    if (authorId !== PLATFORM_BASELINE_AUTHOR) {
      totalAuthoredWords += count;
    }
  }
  const totalAllWords = survivingBaselineWords + totalAuthoredWords;

  // Incluir también autores que hicieron ediciones de 0 palabras para que quede constancia auditable
  const allParticipatingAuthors = new Set<string>([
    ...Array.from(wordsByAuthor.keys()).filter((k) => k !== PLATFORM_BASELINE_AUTHOR),
    ...Array.from(orthographicIgnoredByAuthor.keys()),
  ]);

  const physicianRows: TopicWordAttributionRow[] = Array.from(allParticipatingAuthors).map(
    (authorId) => {
      const survivingWords = wordsByAuthor.get(authorId) ?? 0;
      const sharePct =
        totalAuthoredWords > 0
          ? Number(((survivingWords / totalAuthoredWords) * 100).toFixed(3))
          : 0;
      return {
        edition_label: editionLabel,
        topic_id: topicId,
        module_id: moduleId,
        author_id: authorId,
        is_platform_baseline: false,
        surviving_words: survivingWords,
        total_topic_authored_words: totalAuthoredWords,
        total_topic_all_words: totalAllWords,
        author_share_pct: sharePct,
        is_principal_author: sharePct > 50, // Reglamento Art. 8: > 50% de las palabras del tema
        author_rank: 99,
        orthographic_edits_ignored: orthographicIgnoredByAuthor.get(authorId) ?? 0,
        source_revision_ids: revisionsByAuthor.get(authorId) ?? [],
        computed_at: new Date().toISOString(),
      };
    }
  );

  // Ordenar: 1º Autor Principal (>50%), luego por mayor número de palabras vivas (Art. 8)
  physicianRows.sort((a, b) => {
    if (a.is_principal_author !== b.is_principal_author) {
      return a.is_principal_author ? -1 : 1;
    }
    return b.surviving_words - a.surviving_words;
  });

  physicianRows.forEach((row, idx) => {
    row.author_rank = row.surviving_words > 0 ? idx + 1 : 99;
  });

  const principalRow = physicianRows.find((r) => r.is_principal_author && r.surviving_words > 0);
  const activeAuthorsWithWords = physicianRows.filter((r) => r.surviving_words > 0);
  const requiresDirectionTieBreak =
    activeAuthorsWithWords.length > 1 && !principalRow;

  // Resumen de recursos multimedia incrustados en el tema (Escenarios 5 y 6)
  const mediaSource = publishedTopic?.media ?? {
    videoUrls: staticTopic?.videoUrls ?? [],
    youtubeUrls: staticTopic?.youtubeUrls ?? [],
    vimeoUrls: staticTopic?.vimeoUrls ?? [],
    embedUrls: staticTopic?.embedUrls ?? [],
    imageUrls: staticTopic?.imageUrls ?? [],
    pdfUrls: staticTopic?.pdfUrls ?? [],
    references: [],
  };

  const allTopicVideos: Array<{ title: string; durationSeconds?: number; authorId?: string }> = [
    ...(mediaSource.videoUrls ?? []),
    ...(mediaSource.youtubeUrls ?? []),
    ...(mediaSource.vimeoUrls ?? []),
    ...(mediaSource.embedUrls ?? []),
  ];
  const videosWithDuration = allTopicVideos.filter(
    (v) => typeof v.durationSeconds === 'number' && v.durationSeconds > 0
  );
  const totalVideoDurationSeconds = allTopicVideos.reduce(
    (acc, v) => acc + (typeof v.durationSeconds === 'number' ? v.durationSeconds : 0),
    0
  );

  return {
    topicId,
    moduleId,
    topicTitle: publishedTopic?.title ?? staticTopic?.title ?? topicId,
    hasStaticBaseline: Boolean(staticTopic),
    baselineWords: survivingBaselineWords,
    totalAuthoredWords,
    totalAllWords,
    principalAuthorId: principalRow?.author_id ?? null,
    requiresDirectionTieBreak,
    attributions: physicianRows,
    revisionDiagnostics,
    embeddedMediaSummary: {
      videosCount: allTopicVideos.length,
      videosWithDurationCount: videosWithDuration.length,
      totalVideoDurationSeconds,
      imagesCount: (mediaSource.imageUrls ?? []).length,
      pdfsCount: (mediaSource.pdfUrls ?? []).length,
      referencesCount: (mediaSource.references ?? []).length,
    },
  };
}

// ============================================================================
// 4. BITÁCORA LEGAL INMUTABLE Y REGISTRO DE ACTIVOS (Escenarios 5 y 6)
// ============================================================================

export async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback determinista simple si no hay WebCrypto
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function recordParticipationAuditLog(input: {
  editionLabel?: string;
  actorId: string | null;
  authorId: string | null;
  markedRoleAtEvent?: PhysicianMarkedRole | null;
  bagCategory: ParticipationBagCategory;
  actionType: string;
  entityType: string;
  entityId: string;
  moduleId?: string | null;
  topicId?: string | null;
  deltaWords?: number;
  survivingWordsAfter?: number | null;
  deltaEditorialUnits?: number;
  deltaSessions?: number;
  durationSeconds?: number | null;
  isOrthographicOnly?: boolean;
  exclusionReason?: string | null;
  legalClauseRef: string;
  diffSummary?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const payloadString = JSON.stringify({
      actorId: input.actorId,
      authorId: input.authorId,
      actionType: input.actionType,
      entityId: input.entityId,
      deltaWords: input.deltaWords ?? 0,
      deltaEditorialUnits: input.deltaEditorialUnits ?? 0,
      deltaSessions: input.deltaSessions ?? 0,
      durationSeconds: input.durationSeconds ?? null,
    });
    const payloadSha256 = await sha256Hex(payloadString);

    await supabase.from('participation_audit_logs').insert({
      edition_label: input.editionLabel ?? '1.0',
      actor_id: input.actorId,
      author_id: input.authorId,
      marked_role_at_event: input.markedRoleAtEvent ?? null,
      bag_category: input.bagCategory,
      action_type: input.actionType,
      entity_type: input.entityType,
      entity_id: input.entityId,
      module_id: input.moduleId ?? null,
      topic_id: input.topicId ?? null,
      delta_words: input.deltaWords ?? 0,
      surviving_words_after: input.survivingWordsAfter ?? null,
      delta_editorial_units: input.deltaEditorialUnits ?? 0,
      delta_sessions: input.deltaSessions ?? 0,
      duration_seconds: input.durationSeconds ?? null,
      is_orthographic_only: Boolean(input.isOrthographicOnly),
      exclusion_reason: input.exclusionReason ?? null,
      legal_clause_ref: input.legalClauseRef,
      payload_sha256: payloadSha256,
      diff_summary: input.diffSummary ?? null,
      metadata: input.metadata ?? {},
    } as never);
  } catch (err) {
    console.warn('[participationAuditService] No se pudo insertar en participation_audit_logs:', err);
  }
}

export async function registerTopicMediaAsset(input: {
  topicId: string;
  moduleId: string;
  assetType: 'image' | 'pdf' | 'video' | 'emg_trace';
  url: string;
  title?: string;
  caption?: string;
  durationSeconds?: number | null;
  uploadedBy: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('topic_media_assets').insert({
      topic_id: input.topicId,
      module_id: input.moduleId,
      asset_type: input.assetType,
      url: input.url,
      title: input.title ?? null,
      caption: input.caption ?? null,
      duration_seconds: input.durationSeconds ?? null,
      uploaded_by: input.uploadedBy,
      is_own_authored_figure: true,
    } as never);

    const isVideo = input.assetType === 'video';
    const durationMinLabel =
      isVideo && input.durationSeconds
        ? ` (${Math.round(input.durationSeconds / 60)} min / ${input.durationSeconds} s)`
        : '';

    await recordParticipationAuditLog({
      actorId: input.uploadedBy,
      authorId: input.uploadedBy,
      bagCategory: 'excluded',
      actionType: `media_${input.assetType}_uploaded`,
      entityType: 'topic_media_asset',
      entityId: `${input.topicId}:${input.assetType}`,
      moduleId: input.moduleId,
      topicId: input.topicId,
      deltaWords: 0,
      deltaEditorialUnits: 0,
      deltaSessions: 0,
      durationSeconds: input.durationSeconds ?? null,
      exclusionReason: isVideo
        ? 'Principio Hora ≠ Palabra (Reglamento Art. 13-14): los videos no suman palabras en Obra ni unidades en Labor Editorial; solo las sesiones validadas por Dirección computan en Docencia.'
        : 'Reglamento Art. 6 y 10: las figuras, PDFs o trazos aislados se registran para crédito autoral de recurso pero no suman palabras ni unidades editoriales sueltas.',
      legalClauseRef: isVideo
        ? 'Contrato Cl. 6 y Reglamento Art. 13-14 (Hora ≠ Palabra)'
        : 'Reglamento Editorial Art. 3, 6 y 10 (Trazabilidad de figura/recurso sin inflar palabras)',
      diffSummary: `Recurso ${input.assetType.toUpperCase()} registrado en tema «${input.topicId}»${durationMinLabel}: ${input.title || input.caption || input.url}`,
      metadata: {
        assetType: input.assetType,
        url: input.url,
        title: input.title,
        durationSeconds: input.durationSeconds ?? null,
      },
    });
  } catch (err) {
    console.warn('[participationAuditService] Error al registrar activo multimedia:', err);
  }
}

// ============================================================================
// 5. REPORTE INTEGRAL DE PARTICIPACIÓN Y CONSOLIDACIÓN DE LAS 3 BOLSAS
// ============================================================================

export async function buildPlatformParticipationReport(options?: {
  editionLabel?: string;
  docenciaPoolMxn?: number;
  obraPoolMxn?: number;
  editorialPoolMxn?: number;
  persistTopicAttributions?: boolean;
}): Promise<PlatformParticipationReport> {
  const editionLabel = options?.editionLabel ?? '1.0';
  const docenciaPoolMxn = options?.docenciaPoolMxn ?? 0;
  const obraPoolMxn = options?.obraPoolMxn ?? 0;
  const editorialPoolMxn = options?.editorialPoolMxn ?? 0;

  if (!isSupabaseConfigured) {
    return {
      editionLabel,
      generatedAt: new Date().toISOString(),
      pools: { docenciaPoolMxn, obraPoolMxn, editorialPoolMxn },
      totals: {
        totalComputableSessions: 0,
        totalPublishedAuthoredWords: 0,
        totalPlatformBaselineWords: 0,
        totalComputableEditorialUnits: 0,
        totalOrthographicEditsFiltered: 0,
      },
      physicians: [],
      topics: [],
      syntheticAuditEvents: [],
      snapshotSha256: 'OFFLINE',
    };
  }

  const [
    publishedTopicsRes,
    revisionsRes,
    agreementsRes,
    quizQuestionsRes,
    publishedQuizzesRes,
    examQuestionsRes,
    clinicalCasesRes,
    configTasksRes,
    workshopsRes,
    workshopInstructorsRes,
    mediaAssetsRes,
    profilesRes,
  ] = await Promise.all([
    supabase.from('published_topics').select('*'),
    supabase.from('content_revisions').select('*').eq('status', 'approved'),
    supabase.from('physician_agreements').select('*').eq('document_type', 'anexo'),
    supabase.from('quiz_questions').select('*'),
    supabase.from('published_quizzes').select('*'),
    supabase.from('exam_questions').select('*'),
    supabase.from('emg_case_templates').select('*'),
    supabase.from('editorial_config_tasks').select('*'),
    supabase.from('live_workshops').select('*'),
    supabase.from('workshop_instructors').select('*'),
    supabase.from('topic_media_assets').select('*'),
    supabase.from('profiles').select('id, display_name, credentials'),
  ]);

  const publishedTopics = (publishedTopicsRes.data ?? []) as unknown as PublishedTopic[];
  const approvedRevisions = (revisionsRes.data ?? []) as unknown as ContentRevision[];
  const anexoAgreements = (agreementsRes.data ?? []) as unknown as PhysicianAgreement[];
  const quizQuestions = (quizQuestionsRes.data ?? []) as unknown as {
    id: string;
    quiz_id: string;
    author_id?: string | null;
    is_system_baseline?: boolean;
  }[];
  const publishedQuizzes = (publishedQuizzesRes.data ?? []) as unknown as {
    id: string;
    topic_id: string;
    published_by: string | null;
    last_edited_by: string | null;
  }[];
  const examQuestions = (examQuestionsRes.data ?? []) as unknown as {
    id: string;
    author_id?: string | null;
    is_system_baseline?: boolean;
    approved_for_editorial_units?: boolean;
  }[];
  const clinicalCases = (clinicalCasesRes.data ?? []) as unknown as {
    id: string;
    pattern_id?: string;
    title: string;
    created_by: string | null;
    is_system_baseline?: boolean;
  }[];
  const configTasks = (configTasksRes.data ?? []) as unknown as EditorialConfigTaskRow[];
  const workshops = (workshopsRes.data ?? []) as unknown as {
    id: string;
    title: string;
    status: string;
    duration_minutes: number;
    actual_duration_seconds?: number | null;
    computable_session_value?: number | null;
    validated_by_direction?: string | null;
    created_by: string;
  }[];
  const workshopInstructors = (workshopInstructorsRes.data ?? []) as unknown as {
    workshop_id: string;
    user_id?: string;
    teacher_id?: string;
    session_share?: number;
  }[];
  const mediaAssets = (mediaAssetsRes.data ?? []) as unknown as TopicMediaAssetRow[];
  const profilesList = (profilesRes.data ?? []) as unknown as Pick<
    Profile,
    'id' | 'display_name' | 'credentials'
  >[];

  const profileMap = new Map<string, Pick<Profile, 'id' | 'display_name' | 'credentials'>>();
  for (const p of profilesList) {
    profileMap.set(p.id, p);
  }

  // Mapa de convenio Anexo por médico (Cláusula 2)
  const agreementByUser = new Map<string, PhysicianAgreement>();
  for (const ag of anexoAgreements) {
    const existing = agreementByUser.get(ag.user_id);
    if (!existing || ag.signed_at > existing.signed_at) {
      agreementByUser.set(ag.user_id, ag);
    }
  }

  // 1. Evaluar atribución de palabras en todos los temas con actividad o publicados
  const topicRevisionsMap = new Map<string, ContentRevision[]>();
  const topicModuleMap = new Map<string, string>();
  const publishedTopicMap = new Map<string, PublishedTopic>();

  for (const pt of publishedTopics) {
    publishedTopicMap.set(pt.id, pt);
    topicModuleMap.set(pt.id, pt.module_id);
  }

  for (const rev of approvedRevisions) {
    const rType = rev.payload.revisionType ?? 'topic';
    if (rType !== 'topic') continue;
    const tId = rev.target_topic_id ?? rev.payload.id ?? rev.payload.slug;
    if (!tId) continue;
    topicModuleMap.set(tId, rev.module_id);
    const list = topicRevisionsMap.get(tId) ?? [];
    list.push(rev);
    topicRevisionsMap.set(tId, list);
  }

  const allTargetTopicIds = new Set<string>([
    ...Array.from(publishedTopicMap.keys()),
    ...Array.from(topicRevisionsMap.keys()),
  ]);

  const topicSummaries: TopicAttributionSummary[] = [];
  const syntheticAuditEvents: RevisionAttributionDiagnostic[] = [];
  const allAttributionRowsToPersist: TopicWordAttributionRow[] = [];

  for (const topicId of allTargetTopicIds) {
    const moduleId = topicModuleMap.get(topicId) ?? 'modulo-01';
    const summary = computeSingleTopicAttribution({
      editionLabel,
      moduleId,
      topicId,
      publishedTopic: publishedTopicMap.get(topicId) ?? null,
      approvedRevisions: topicRevisionsMap.get(topicId) ?? [],
    });
    topicSummaries.push(summary);
    syntheticAuditEvents.push(...summary.revisionDiagnostics);
    allAttributionRowsToPersist.push(...summary.attributions);
  }

  // Sincronizar atribuciones calculadas a topic_word_attributions si se solicita
  if (options?.persistTopicAttributions && allAttributionRowsToPersist.length > 0) {
    try {
      await supabase.from('topic_word_attributions').upsert(
        allAttributionRowsToPersist.map(({ id: _omit, ...rest }) => rest) as never,
        { onConflict: 'edition_label,topic_id,author_id' }
      );
    } catch (err) {
      console.warn('[participationAuditService] No se pudo persistir topic_word_attributions:', err);
    }
  }

  // 2. Consolidar conjunto de todos los médicos con convenio o con actividad
  const allPhysicianIds = new Set<string>();
  for (const uid of agreementByUser.keys()) allPhysicianIds.add(uid);
  for (const row of allAttributionRowsToPersist) {
    if (row.author_id) allPhysicianIds.add(row.author_id);
  }
  for (const pq of publishedQuizzes) {
    if (pq.published_by) allPhysicianIds.add(pq.published_by);
    if (pq.last_edited_by) allPhysicianIds.add(pq.last_edited_by);
  }
  for (const qq of quizQuestions) {
    if (qq.author_id) allPhysicianIds.add(qq.author_id);
  }
  for (const eq of examQuestions) {
    if (eq.author_id) allPhysicianIds.add(eq.author_id);
  }
  for (const cc of clinicalCases) {
    if (cc.created_by) allPhysicianIds.add(cc.created_by);
  }
  for (const ct of configTasks) {
    if (ct.assigned_to) allPhysicianIds.add(ct.assigned_to);
  }
  for (const wi of workshopInstructors) {
    const uid = wi.user_id ?? wi.teacher_id;
    if (uid) allPhysicianIds.add(uid);
  }
  for (const ma of mediaAssets) {
    if (ma.uploaded_by) allPhysicianIds.add(ma.uploaded_by);
  }

  // Mapa auxiliar para saber quién publicó el quiz padre cuando quiz_questions.author_id es null
  const quizFallbackAuthorMap = new Map<string, string>();
  for (const pq of publishedQuizzes) {
    const author = pq.published_by ?? pq.last_edited_by;
    if (author) quizFallbackAuthorMap.set(pq.id, author);
  }

  const workshopMap = new Map(workshops.map((w) => [w.id, w]));

  // 3. Construir resumen por médico aplicando candados de Cláusula 2 y Tabulador Art. 10
  const physicianSummaries: PhysicianParticipationSummary[] = [];

  for (const physicianId of allPhysicianIds) {
    const prof = profileMap.get(physicianId);
    const agreement = agreementByUser.get(physicianId);
    const markedRole: PhysicianMarkedRole | 'sin_convenio' =
      agreement?.marked_role ?? 'sin_convenio';

    // Candado de Bolsas por Rol (Contrato Cláusula 2)
    // Si aún no tiene convenio firmado ('sin_convenio'), mostramos el conteo técnico pero advertimos
    const canEarnDocencia = markedRole === 'profesor' || markedRole === 'ambos';
    const canEarnObra = markedRole === 'editor' || markedRole === 'ambos';
    const canEarnEditorial = markedRole === 'editor' || markedRole === 'ambos';

    // ── BOLSA 1: DOCENCIA (Cláusula 6 y Art. 13-14) ──
    const myInstructorRows = workshopInstructors.filter(
      (wi) => (wi.user_id ?? wi.teacher_id) === physicianId
    );
    let rawCompletedSessions = 0;
    let validatedSessions = 0;
    let totalTeachingMinutes = 0;

    for (const wi of myInstructorRows) {
      const ws = workshopMap.get(wi.workshop_id);
      if (!ws) continue;
      const share = typeof wi.session_share === 'number' ? wi.session_share : 1.0;
      const sessionVal =
        typeof ws.computable_session_value === 'number' ? ws.computable_session_value : 1.0;
      const mins = ws.actual_duration_seconds
        ? Math.round(ws.actual_duration_seconds / 60)
        : ws.duration_minutes || 90;

      if (ws.status === 'completed') {
        rawCompletedSessions += sessionVal * share;
        totalTeachingMinutes += mins;
        if (ws.validated_by_direction) {
          validatedSessions += sessionVal * share;
        }
      }
    }

    const computableSessions = canEarnDocencia ? validatedSessions : 0;

    // ── BOLSA 2: OBRA (Cláusula 7 y Reglamento Art. 5-8) ──
    let rawSurvivingWords = 0;
    let orthographicEditsFiltered = 0;
    const principalAuthorTopics: { topicId: string; title: string; words: number; sharePct: number }[] = [];
    const coauthorTopics: { topicId: string; title: string; words: number; sharePct: number }[] = [];

    for (const tSum of topicSummaries) {
      const myAttr = tSum.attributions.find((a) => a.author_id === physicianId);
      if (!myAttr) continue;
      rawSurvivingWords += myAttr.surviving_words;
      orthographicEditsFiltered += myAttr.orthographic_edits_ignored;
      if (myAttr.surviving_words > 0) {
        if (myAttr.is_principal_author) {
          principalAuthorTopics.push({
            topicId: tSum.topicId,
            title: tSum.topicTitle,
            words: myAttr.surviving_words,
            sharePct: myAttr.author_share_pct,
          });
        } else {
          coauthorTopics.push({
            topicId: tSum.topicId,
            title: tSum.topicTitle,
            words: myAttr.surviving_words,
            sharePct: myAttr.author_share_pct,
          });
        }
      }
    }

    const computableWords = canEarnObra ? rawSurvivingWords : 0;

    // ── BOLSA 3: LABOR EDITORIAL (Cláusula 8 y Reglamento Art. 10) ──
    // 1. Reactivos publicados en cuestionarios de tema (1 unidad c/u)
    const myTopicQuestions = quizQuestions.filter((q) => {
      if (q.is_system_baseline) return false;
      const effectiveAuthor = q.author_id ?? quizFallbackAuthorMap.get(q.quiz_id);
      return effectiveAuthor === physicianId;
    }).length;

    // 2. Reactivos publicados en banco de exámenes (1 unidad c/u)
    const myExamQuestions = examQuestions.filter(
      (eq) =>
        !eq.is_system_baseline &&
        eq.approved_for_editorial_units !== false &&
        eq.author_id === physicianId
    ).length;

    const publishedQuizQuestionsTotal = myTopicQuestions + myExamQuestions;

    // 3. Casos clínicos EMG publicados no-baseline (2 unidades c/u)
    const publishedClinicalCases = clinicalCases.filter(
      (cc) =>
        cc.created_by === physicianId &&
        !cc.is_system_baseline &&
        !STATIC_CASE_IDS.has(cc.pattern_id ?? cc.id)
    ).length;

    // 4. Tareas de configuración encargadas por escrito y cerradas por Dirección (1 unidad c/u)
    const closedConfigTasks = configTasks.filter(
      (ct) => ct.assigned_to === physicianId && ct.status === 'closed_by_direction'
    ).length;

    const rawEditorialUnits =
      publishedQuizQuestionsTotal * 1 + publishedClinicalCases * 2 + closedConfigTasks * 1;
    const computableEditorialUnits = canEarnEditorial ? rawEditorialUnits : 0;

    // ── RECURSOS MULTIMEDIA SUBIDOS (Escenarios 5 y 6: Hora != Palabra) ──
    const myAssets = mediaAssets.filter((ma) => ma.uploaded_by === physicianId);
    const uploadedImagesCount = myAssets.filter((ma) => ma.asset_type === 'image').length;
    const uploadedPdfsCount = myAssets.filter((ma) => ma.asset_type === 'pdf').length;
    const myVideos = myAssets.filter((ma) => ma.asset_type === 'video');
    const uploadedVideosCount = myVideos.length;
    const uploadedVideosDurationSeconds = myVideos.reduce(
      (acc, v) => acc + (v.duration_seconds ?? 0),
      0
    );

    // ── ADVERTENCIAS DE CANDADOS CONTRACTUALES (Cláusula 2 y Art. 6/13) ──
    const warnings: string[] = [];
    if (markedRole === 'sin_convenio' && (rawSurvivingWords > 0 || rawEditorialUnits > 0 || rawCompletedSessions > 0)) {
      warnings.push(
        'Sin Anexo firmado vigente: las aportaciones están registradas en bitácora pero requieren firma de Anexo (Cláusula 2) para computar en liquidación.'
      );
    }
    if (markedRole === 'profesor' && (rawSurvivingWords > 0 || rawEditorialUnits > 0)) {
      warnings.push(
        `Candado Cláusula 2 (Papel Profesor): tiene ${rawSurvivingWords} palabras y ${rawEditorialUnits} u. editoriales registradas, pero sus bolsas de Obra y Labor Editorial están cerradas salvo firma de nuevo Anexo.`
      );
    }
    if (markedRole === 'editor' && rawCompletedSessions > 0) {
      warnings.push(
        `Candado Cláusula 2 (Papel Editor): tiene ${rawCompletedSessions} sesiones docentes registradas, pero su bolsa de Docencia está cerrada salvo firma de nuevo Anexo.`
      );
    }
    if (rawCompletedSessions > validatedSessions) {
      warnings.push(
        `Cláusula 6 / Anexo §1.A: ${rawCompletedSessions - validatedSessions} sesión(es) completada(s) pendiente(s) del sello de validación de Dirección Académica.`
      );
    }

    physicianSummaries.push({
      physicianId,
      displayName: prof?.display_name ?? agreement?.full_name_typed ?? `Médico ${physicianId.slice(0, 6)}`,
      credentials: prof?.credentials ?? null,
      markedRole,
      agreementFolio: agreement?.verification_folio ?? null,
      agreementSignedAt: agreement?.signed_at ?? null,
      canEarnDocencia,
      canEarnObra,
      canEarnEditorial,
      rawCompletedSessions,
      validatedSessions,
      computableSessions,
      totalTeachingMinutes,
      docenciaSharePct: 0,
      docenciaPayoutMxn: 0,
      rawSurvivingWords,
      computableWords,
      orthographicEditsFiltered,
      principalAuthorTopics,
      coauthorTopics,
      obraSharePct: 0,
      obraPayoutMxn: 0,
      publishedQuizQuestions: myTopicQuestions,
      publishedExamQuestions: myExamQuestions,
      publishedClinicalCases,
      closedConfigTasks,
      rawEditorialUnits,
      computableEditorialUnits,
      editorialSharePct: 0,
      editorialPayoutMxn: 0,
      uploadedImagesCount,
      uploadedPdfsCount,
      uploadedVideosCount,
      uploadedVideosDurationSeconds,
      totalPayoutMxn: 0,
      excludedContributionsWarnings: warnings,
    });
  }

  // 4. Calcular denominadores globales de la edición y repartir las 3 bolsas (Anexo §5)
  const totalComputableSessions = physicianSummaries.reduce(
    (acc, p) => acc + p.computableSessions,
    0
  );
  const totalPublishedAuthoredWords = physicianSummaries.reduce(
    (acc, p) => acc + p.computableWords,
    0
  );
  const totalPlatformBaselineWords = topicSummaries.reduce(
    (acc, t) => acc + t.baselineWords,
    0
  );
  const totalComputableEditorialUnits = physicianSummaries.reduce(
    (acc, p) => acc + p.computableEditorialUnits,
    0
  );
  const totalOrthographicEditsFiltered = physicianSummaries.reduce(
    (acc, p) => acc + p.orthographicEditsFiltered,
    0
  );

  for (const p of physicianSummaries) {
    p.docenciaSharePct =
      totalComputableSessions > 0
        ? Number(((p.computableSessions / totalComputableSessions) * 100).toFixed(3))
        : 0;
    p.docenciaPayoutMxn =
      totalComputableSessions > 0
        ? Number((docenciaPoolMxn * (p.computableSessions / totalComputableSessions)).toFixed(2))
        : 0;

    p.obraSharePct =
      totalPublishedAuthoredWords > 0
        ? Number(((p.computableWords / totalPublishedAuthoredWords) * 100).toFixed(3))
        : 0;
    p.obraPayoutMxn =
      totalPublishedAuthoredWords > 0
        ? Number((obraPoolMxn * (p.computableWords / totalPublishedAuthoredWords)).toFixed(2))
        : 0;

    p.editorialSharePct =
      totalComputableEditorialUnits > 0
        ? Number(((p.computableEditorialUnits / totalComputableEditorialUnits) * 100).toFixed(3))
        : 0;
    p.editorialPayoutMxn =
      totalComputableEditorialUnits > 0
        ? Number(
            (editorialPoolMxn * (p.computableEditorialUnits / totalComputableEditorialUnits)).toFixed(2)
          )
        : 0;

    p.totalPayoutMxn = Number(
      (p.docenciaPayoutMxn + p.obraPayoutMxn + p.editorialPayoutMxn).toFixed(2)
    );
  }

  physicianSummaries.sort(
    (a, b) =>
      b.totalPayoutMxn - a.totalPayoutMxn ||
      b.rawSurvivingWords - a.rawSurvivingWords ||
      b.rawEditorialUnits - a.rawEditorialUnits ||
      b.rawCompletedSessions - a.rawCompletedSessions
  );

  const snapshotSha256 = await sha256Hex(
    JSON.stringify({
      editionLabel,
      totalComputableSessions,
      totalPublishedAuthoredWords,
      totalComputableEditorialUnits,
      physicians: physicianSummaries.map((p) => ({
        id: p.physicianId,
        role: p.markedRole,
        s: p.computableSessions,
        w: p.computableWords,
        u: p.computableEditorialUnits,
      })),
    })
  );

  return {
    editionLabel,
    generatedAt: new Date().toISOString(),
    pools: { docenciaPoolMxn, obraPoolMxn, editorialPoolMxn },
    totals: {
      totalComputableSessions,
      totalPublishedAuthoredWords,
      totalPlatformBaselineWords,
      totalComputableEditorialUnits,
      totalOrthographicEditsFiltered,
    },
    physicians: physicianSummaries,
    topics: topicSummaries.sort((a, b) => b.totalAuthoredWords - a.totalAuthoredWords),
    syntheticAuditEvents: syntheticAuditEvents.sort((a, b) =>
      b.reviewedAt.localeCompare(a.reviewedAt)
    ),
    snapshotSha256,
  };
}

// ============================================================================
// 6. OPERACIONES ADMINISTRATIVAS: LOGS, TAREAS DE CONFIG, VALIDACIÓN DOCENCIA Y ACTA
// ============================================================================

export async function listParticipationAuditLogs(limit = 150): Promise<ParticipationAuditLogRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('participation_audit_logs')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[participationAuditService] listParticipationAuditLogs:', error);
    return [];
  }
  return (data ?? []) as unknown as ParticipationAuditLogRow[];
}

export async function listEditorialConfigTasks(): Promise<EditorialConfigTaskRow[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('editorial_config_tasks')
    .select('*')
    .order('assigned_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as EditorialConfigTaskRow[];
}

export async function createEditorialConfigTask(input: {
  editionLabel?: string;
  assignedTo: string;
  title: string;
  writtenBrief: string;
  assignedBy: string;
}): Promise<EditorialConfigTaskRow> {
  const { data, error } = await supabase
    .from('editorial_config_tasks')
    .insert({
      edition_label: input.editionLabel ?? '1.0',
      assigned_to: input.assignedTo,
      title: input.title.trim(),
      written_brief: input.writtenBrief.trim(),
      editorial_units: 1.0,
      status: 'assigned',
      assigned_by: input.assignedBy,
    } as never)
    .select('*')
    .single();
  if (error) throw error;

  await recordParticipationAuditLog({
    editionLabel: input.editionLabel ?? '1.0',
    actorId: input.assignedBy,
    authorId: input.assignedTo,
    bagCategory: 'governance',
    actionType: 'config_task_assigned_in_writing',
    entityType: 'editorial_config_task',
    entityId: (data as unknown as EditorialConfigTaskRow).id,
    legalClauseRef: 'Reglamento Editorial Art. 10 (Tarea de configuración encargada por escrito = 1 u. al cerrarse)',
    diffSummary: `Encargo por escrito asignado: «${input.title.trim()}»`,
    metadata: { writtenBrief: input.writtenBrief },
  });

  return data as unknown as EditorialConfigTaskRow;
}

export async function closeEditorialConfigTaskByDirection(input: {
  taskId: string;
  closedByDirection: string;
  directionNotes?: string;
}): Promise<void> {
  const { data: task, error: fetchErr } = await supabase
    .from('editorial_config_tasks')
    .select('*')
    .eq('id', input.taskId)
    .single();
  if (fetchErr || !task) throw fetchErr ?? new Error('Tarea no encontrada');

  const typedTask = task as unknown as EditorialConfigTaskRow;

  const { error } = await supabase
    .from('editorial_config_tasks')
    .update({
      status: 'closed_by_direction',
      closed_by_direction: input.closedByDirection,
      closed_at: new Date().toISOString(),
      direction_notes: input.directionNotes ?? null,
    } as never)
    .eq('id', input.taskId);
  if (error) throw error;

  await recordParticipationAuditLog({
    editionLabel: typedTask.edition_label,
    actorId: input.closedByDirection,
    authorId: typedTask.assigned_to,
    bagCategory: 'editorial',
    actionType: 'config_task_closed_by_direction',
    entityType: 'editorial_config_task',
    entityId: typedTask.id,
    deltaEditorialUnits: 1,
    legalClauseRef: 'Contrato Cl. 8 y Reglamento Art. 10 (Tarea de configuración cerrada por la Dirección = 1 unidad)',
    diffSummary: `Tarea de configuración cerrada por Dirección (+1.00 unidad editorial): «${typedTask.title}»`,
    metadata: { directionNotes: input.directionNotes ?? null },
  });
}

export async function validateWorkshopForDocenciaPool(input: {
  workshopId: string;
  validatedBy: string;
  computableSessionValue?: number;
  actualDurationSeconds?: number;
  validationNotes?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('live_workshops')
    .update({
      validated_by_direction: input.validatedBy,
      validated_at: new Date().toISOString(),
      computable_session_value: input.computableSessionValue ?? 1.0,
      actual_duration_seconds: input.actualDurationSeconds ?? null,
      material_delivered: true,
      recording_available: true,
      validation_notes: input.validationNotes ?? null,
    } as never)
    .eq('id', input.workshopId);
  if (error) throw error;

  await recordParticipationAuditLog({
    actorId: input.validatedBy,
    authorId: null,
    bagCategory: 'docencia',
    actionType: 'workshop_validated_by_direction',
    entityType: 'live_workshop',
    entityId: input.workshopId,
    deltaSessions: input.computableSessionValue ?? 1.0,
    durationSeconds: input.actualDurationSeconds ?? null,
    legalClauseRef: 'Contrato Cl. 6, Anexo §1.A y Reglamento Art. 13-14 (Sesión validada por Dirección para bolsa de Docencia)',
    diffSummary: `Sesión docente validada por Dirección Académica (${input.computableSessionValue ?? 1.0} sesión computable).`,
    metadata: { validationNotes: input.validationNotes ?? null },
  });
}

export async function saveOrFreezeEditionCreditAct(input: {
  report: PlatformParticipationReport;
  actorId: string;
  freezeFinal?: boolean;
  notes?: string;
}): Promise<EditionCreditActRow> {
  const { report, actorId, freezeFinal, notes } = input;
  const nowIso = new Date().toISOString();
  const fiveDaysLaterIso = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const status: EditionCreditActRow['status'] = freezeFinal ? 'final_frozen' : 'notified';

  const { data: actRow, error: actErr } = await supabase
    .from('edition_credit_acts')
    .upsert(
      {
        edition_label: report.editionLabel,
        status,
        total_computable_sessions: report.totals.totalComputableSessions,
        total_published_words: report.totals.totalPublishedAuthoredWords,
        total_editorial_units: report.totals.totalComputableEditorialUnits,
        docencia_pool_mxn: report.pools.docenciaPoolMxn,
        obra_pool_mxn: report.pools.obraPoolMxn,
        editorial_pool_mxn: report.pools.editorialPoolMxn,
        snapshot_sha256: report.snapshotSha256,
        frozen_by: actorId,
        notified_at: nowIso,
        objection_deadline_at: fiveDaysLaterIso,
        frozen_at: freezeFinal ? nowIso : null,
        notes: notes ?? null,
        updated_at: nowIso,
      } as never,
      { onConflict: 'edition_label' }
    )
    .select('*')
    .single();

  if (actErr || !actRow) throw actErr ?? new Error('No se pudo guardar el Acta de Créditos');
  const typedAct = actRow as unknown as EditionCreditActRow;

  await supabase.from('edition_credit_act_items').delete().eq('act_id', typedAct.id);

  if (report.physicians.length > 0) {
    const itemsPayload: Omit<EditionCreditActItemRow, 'id'>[] = report.physicians.map((p) => ({
      act_id: typedAct.id,
      physician_id: p.physicianId,
      agreement_folio: p.agreementFolio,
      marked_role: p.markedRole,
      validated_sessions: p.validatedSessions,
      computable_sessions: p.computableSessions,
      docencia_share_pct: p.docenciaSharePct,
      docencia_payout_mxn: p.docenciaPayoutMxn,
      raw_surviving_words: p.rawSurvivingWords,
      computable_words: p.computableWords,
      obra_share_pct: p.obraSharePct,
      obra_payout_mxn: p.obraPayoutMxn,
      principal_author_topic_ids: p.principalAuthorTopics.map((t) => t.topicId),
      coauthor_topic_ids: p.coauthorTopics.map((t) => t.topicId),
      published_quiz_questions: p.publishedQuizQuestions + p.publishedExamQuestions,
      published_clinical_cases: p.publishedClinicalCases,
      closed_config_tasks: p.closedConfigTasks,
      raw_editorial_units: p.rawEditorialUnits,
      computable_editorial_units: p.computableEditorialUnits,
      editorial_share_pct: p.editorialSharePct,
      editorial_payout_mxn: p.editorialPayoutMxn,
      total_payout_mxn: p.totalPayoutMxn,
      breakdown_json: {
        principalAuthorTopics: p.principalAuthorTopics,
        coauthorTopics: p.coauthorTopics,
        orthographicEditsFiltered: p.orthographicEditsFiltered,
        uploadedImagesCount: p.uploadedImagesCount,
        uploadedVideosCount: p.uploadedVideosCount,
        uploadedVideosDurationSeconds: p.uploadedVideosDurationSeconds,
        warnings: p.excludedContributionsWarnings,
      },
    }));

    const { error: itemsErr } = await supabase
      .from('edition_credit_act_items')
      .insert(itemsPayload as never);
    if (itemsErr) throw itemsErr;
  }

  await recordParticipationAuditLog({
    editionLabel: report.editionLabel,
    actorId,
    authorId: null,
    bagCategory: 'governance',
    actionType: freezeFinal ? 'credit_act_final_frozen' : 'credit_act_notified',
    entityType: 'edition_credit_act',
    entityId: typedAct.id,
    legalClauseRef:
      'Contrato Cl. 10 y Reglamento Editorial Art. 3 y 16 (Emisión de Acta de Créditos y plazo de 5 días naturales)',
    diffSummary: `Acta de Créditos (${status}) emitida para edición ${report.editionLabel} · SHA-256: ${report.snapshotSha256.slice(0, 16)}…`,
    metadata: {
      totals: report.totals,
      pools: report.pools,
      snapshotSha256: report.snapshotSha256,
    },
  });

  return typedAct;
}
