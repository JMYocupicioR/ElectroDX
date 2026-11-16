/**
 * Participación que sí mueve dinero: tiempo de clase, texto modificado
 * y unidades de quizzes, casos y demás labor en la plataforma.
 * La liquidación del acta sigue el anexo; este módulo calcula el reparto por actividad.
 */

export interface ProseEditSize {
  lettersChanged: number;
  paragraphsChanged: number;
}

export interface PhysicianActivity {
  classVideoCount: number;
  classVideoSeconds: number;
  topicsModified: number;
  lettersChanged: number;
  wordsChanged: number;
  paragraphsChanged: number;
  /** Palabras vivas si las hay; si no, las palabras del diff. Es el peso de la bolsa de obra. */
  obraWeightWords: number;
  quizzesAdded: number;
  quizzesModified: number;
  questionsAdded: number;
  questionsModified: number;
  casesAdded: number;
  figuresAdded: number;
  pdfsAdded: number;
  tracesAdded: number;
  configClosed: number;
  examQuestions: number;
  activityEditorialUnits: number;
  docenciaActivityPct: number;
  docenciaActivityMxn: number;
  obraActivityPct: number;
  obraActivityMxn: number;
  editorialActivityPct: number;
  editorialActivityMxn: number;
  activityPayoutMxn: number;
  staffRoles: string[];
}

export interface ClassCredit {
  seconds: number;
  count: number;
}

export function emptyActivity(staffRoles: string[] = []): PhysicianActivity {
  return {
    classVideoCount: 0,
    classVideoSeconds: 0,
    topicsModified: 0,
    lettersChanged: 0,
    wordsChanged: 0,
    paragraphsChanged: 0,
    obraWeightWords: 0,
    quizzesAdded: 0,
    quizzesModified: 0,
    questionsAdded: 0,
    questionsModified: 0,
    casesAdded: 0,
    figuresAdded: 0,
    pdfsAdded: 0,
    tracesAdded: 0,
    configClosed: 0,
    examQuestions: 0,
    activityEditorialUnits: 0,
    docenciaActivityPct: 0,
    docenciaActivityMxn: 0,
    obraActivityPct: 0,
    obraActivityMxn: 0,
    editorialActivityPct: 0,
    editorialActivityMxn: 0,
    activityPayoutMxn: 0,
    staffRoles,
  };
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** Caracteres que entran o salen en un solo tramo (una inserción, borrado o sustitución). */
export function charEdits(previous: string, next: string): number {
  if (previous === next) return 0;
  const max = Math.min(previous.length, next.length);
  let prefix = 0;
  while (prefix < max && previous[prefix] === next[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < max - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  return previous.length - prefix - suffix + (next.length - prefix - suffix);
}

/**
 * Tamaño de un cambio de tema: letras tocadas y párrafos agregados, borrados o reescritos.
 * Un ajuste de una letra cuenta como un párrafo reescrito y esas letras, no como el párrafo entero.
 */
export function measureProseEdit(previous: string, next: string): ProseEditSize {
  if (previous === next) return { lettersChanged: 0, paragraphsChanged: 0 };
  const prev = splitParagraphs(previous);
  const nextParas = splitParagraphs(next);
  const n = prev.length;
  const m = nextParas.length;

  if (n * m > 8000) {
    let letters = Math.abs(previous.length - next.length);
    if (letters === 0) letters = charEdits(previous, next);
    return {
      lettersChanged: letters,
      paragraphsChanged: Math.abs(n - m) || (letters > 0 ? 1 : 0),
    };
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        prev[i] === nextParas[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  let letters = 0;
  let paragraphs = 0;
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (prev[i] === nextParas[j]) {
      i += 1;
      j += 1;
      continue;
    }
    const skipPrev = dp[i + 1][j];
    const skipNext = dp[i][j + 1];
    const skipBoth = dp[i + 1][j + 1];
    if (skipBoth >= skipPrev && skipBoth >= skipNext) {
      letters += charEdits(prev[i], nextParas[j]);
      paragraphs += 1;
      i += 1;
      j += 1;
    } else if (skipPrev >= skipNext) {
      letters += prev[i].length;
      paragraphs += 1;
      i += 1;
    } else {
      letters += nextParas[j].length;
      paragraphs += 1;
      j += 1;
    }
  }
  while (i < n) {
    letters += prev[i].length;
    paragraphs += 1;
    i += 1;
  }
  while (j < m) {
    letters += nextParas[j].length;
    paragraphs += 1;
    j += 1;
  }
  return { lettersChanged: letters, paragraphsChanged: paragraphs };
}

export function classDurationSeconds(workshop: {
  status?: string | null;
  duration_minutes?: number | null;
  actual_duration_seconds?: number | null;
  recording_duration_seconds?: number | null;
  clinical_case_json?: Record<string, unknown> | null;
}): number {
  const meta = workshop.clinical_case_json ?? {};
  const metaSeconds = [
    meta.actual_duration_seconds,
    meta.real_duration_seconds,
    meta.recording_duration_seconds,
  ];
  const metaMinutes = meta.actual_duration_minutes;
  const candidates = [
    workshop.recording_duration_seconds,
    workshop.actual_duration_seconds,
    ...metaSeconds,
    typeof metaMinutes === 'number' && metaMinutes > 0 ? metaMinutes * 60 : 0,
    (workshop.duration_minutes ?? 0) > 0 ? (workshop.duration_minutes ?? 0) * 60 : 0,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && candidate > 0) return Math.round(candidate);
  }
  if (workshop.status === 'completed') return 90 * 60;
  return 0;
}

export function workshopCountsAsClass(workshop: {
  status?: string | null;
  recording_url?: string | null;
  actual_duration_seconds?: number | null;
  recording_duration_seconds?: number | null;
}): boolean {
  if (workshop.status === 'completed') return true;
  if (typeof workshop.recording_url === 'string' && workshop.recording_url.trim().length > 0) return true;
  if ((workshop.actual_duration_seconds ?? 0) > 0) return true;
  if ((workshop.recording_duration_seconds ?? 0) > 0) return true;
  return false;
}

export interface ClassSessionInput {
  id: string;
  status?: string | null;
  recording_url?: string | null;
  duration_minutes?: number | null;
  actual_duration_seconds?: number | null;
  recording_duration_seconds?: number | null;
  clinical_case_json?: Record<string, unknown> | null;
  instructors: { id: string; share?: number | null }[];
}

export function creditClassSessions(sessions: ClassSessionInput[]): {
  byAuthor: Map<string, ClassCredit>;
  recordingKeys: Set<string>;
} {
  const byAuthor = new Map<string, ClassCredit>();
  const recordingKeys = new Set<string>();

  for (const session of sessions) {
    const recording = session.recording_url?.trim().toLowerCase();
    if (recording) recordingKeys.add(recording);
    if (!workshopCountsAsClass(session)) continue;
    const seconds = classDurationSeconds(session);
    if (seconds <= 0) continue;
    const instructors = session.instructors.filter((person) => person.id);
    if (instructors.length === 0) continue;
    for (const person of instructors) {
      const share = typeof person.share === 'number' && person.share > 0 ? person.share : 1;
      const credited = Math.round(seconds * share);
      if (credited <= 0) continue;
      const current = byAuthor.get(person.id) ?? { seconds: 0, count: 0 };
      current.seconds += credited;
      current.count += 1;
      byAuthor.set(person.id, current);
    }
  }

  return { byAuthor, recordingKeys };
}

export interface LessonVideoInput {
  key: string;
  blockKey?: string | null;
  seconds: number;
  authorIds: string[];
}

export function creditLessonVideos(
  videos: LessonVideoInput[],
  blockedKeys: Set<string>,
  into: Map<string, ClassCredit>,
): void {
  const seen = new Set<string>();
  for (const video of videos) {
    const block = video.blockKey?.trim().toLowerCase() ?? '';
    if (block && blockedKeys.has(block)) continue;
    const authors = [...new Set(video.authorIds.filter(Boolean))];
    if (authors.length === 0) continue;
    for (const authorId of authors) {
      const stamp = `${authorId}:${video.key}`;
      if (seen.has(stamp)) continue;
      seen.add(stamp);
      const current = into.get(authorId) ?? { seconds: 0, count: 0 };
      current.count += 1;
      if (video.seconds > 0) current.seconds += Math.round(video.seconds);
      into.set(authorId, current);
    }
  }
}

export interface QuizCredit {
  quizzesAdded: number;
  quizzesModified: number;
  questionsAdded: number;
  questionsModified: number;
}

function bump(map: Map<string, QuizCredit>, authorId: string | null | undefined, field: keyof QuizCredit) {
  if (!authorId) return;
  const row = map.get(authorId) ?? {
    quizzesAdded: 0,
    quizzesModified: 0,
    questionsAdded: 0,
    questionsModified: 0,
  };
  row[field] += 1;
  map.set(authorId, row);
}

export function creditQuizActivity(input: {
  questions: {
    quiz_id: string;
    author_id?: string | null;
    last_edited_by?: string | null;
    is_system_baseline?: boolean;
  }[];
  quizzes: {
    id: string;
    topic_id: string;
    published_by: string | null;
    last_edited_by: string | null;
    version?: number | null;
  }[];
  revisionAuthorsByTopic: Map<string, string[]>;
}): Map<string, QuizCredit> {
  const credits = new Map<string, QuizCredit>();
  const quizById = new Map(input.quizzes.map((quiz) => [quiz.id, quiz]));

  for (const question of input.questions) {
    const quiz = quizById.get(question.quiz_id);
    const topicAuthors = quiz ? input.revisionAuthorsByTopic.get(quiz.topic_id) ?? [] : [];
    const uniqueRevisionAuthor = topicAuthors.length === 1 ? topicAuthors[0] : null;
    const publishedBy = quiz?.published_by ?? null;
    let author = question.author_id ?? null;
    if ((!author || author === publishedBy) && uniqueRevisionAuthor && uniqueRevisionAuthor !== publishedBy) {
      author = uniqueRevisionAuthor;
    }
    if (!author) author = uniqueRevisionAuthor ?? publishedBy;
    const editor = question.last_edited_by ?? null;

    if (question.is_system_baseline) {
      if (editor && editor !== author) bump(credits, editor, 'questionsModified');
      continue;
    }
    if (author) bump(credits, author, 'questionsAdded');
    if (editor && editor !== author) bump(credits, editor, 'questionsModified');
  }

  for (const quiz of input.quizzes) {
    const creator = quiz.published_by;
    const editor = quiz.last_edited_by;
    const version = quiz.version ?? 1;
    if (creator && editor && editor !== creator) {
      bump(credits, creator, 'quizzesAdded');
      bump(credits, editor, 'quizzesModified');
    } else if (creator || editor) {
      const who = creator ?? editor;
      bump(credits, who, version > 1 ? 'quizzesModified' : 'quizzesAdded');
    }
  }

  return credits;
}

/** Tabulador de la actividad que entra a la bolsa editorial. */
export function editorialActivityUnits(input: {
  questionsAdded: number;
  questionsModified: number;
  examQuestions: number;
  cases: number;
  configClosed: number;
  figures: number;
  pdfs: number;
  traces: number;
}): number {
  const units =
    input.questionsAdded * 1 +
    input.questionsModified * 0.5 +
    input.examQuestions * 1 +
    input.cases * 2 +
    input.configClosed * 1 +
    input.figures * 0.25 +
    input.pdfs * 0.25 +
    input.traces * 0.5;
  return Number(units.toFixed(2));
}

export function splitPool(weights: number[], pool: number): number[] {
  const total = weights.reduce((sum, weight) => sum + (weight > 0 ? weight : 0), 0);
  if (total <= 0 || pool <= 0) return weights.map(() => 0);
  return weights.map((weight) =>
    weight > 0 ? Number(((pool * weight) / total).toFixed(2)) : 0,
  );
}

export function applyActivitySplit(
  people: PhysicianActivity[],
  pools: { docencia: number; obra: number; editorial: number },
): void {
  const classWeights = people.map((person) => person.classVideoSeconds);
  const wordWeights = people.map((person) => person.obraWeightWords);
  const unitWeights = people.map((person) => person.activityEditorialUnits);
  const classTotal = classWeights.reduce((sum, weight) => sum + weight, 0);
  const wordTotal = wordWeights.reduce((sum, weight) => sum + weight, 0);
  const unitTotal = unitWeights.reduce((sum, weight) => sum + weight, 0);
  const docencia = splitPool(classWeights, pools.docencia);
  const obra = splitPool(wordWeights, pools.obra);
  const editorial = splitPool(unitWeights, pools.editorial);

  people.forEach((person, index) => {
    person.docenciaActivityMxn = docencia[index];
    person.obraActivityMxn = obra[index];
    person.editorialActivityMxn = editorial[index];
    person.docenciaActivityPct =
      classTotal > 0 ? Number(((person.classVideoSeconds / classTotal) * 100).toFixed(2)) : 0;
    person.obraActivityPct =
      wordTotal > 0 ? Number(((person.obraWeightWords / wordTotal) * 100).toFixed(2)) : 0;
    person.editorialActivityPct =
      unitTotal > 0 ? Number(((person.activityEditorialUnits / unitTotal) * 100).toFixed(2)) : 0;
    person.activityPayoutMxn = Number(
      (docencia[index] + obra[index] + editorial[index]).toFixed(2),
    );
  });
}

export function formatClassDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours} h ${rem} min` : `${hours} h`;
}
