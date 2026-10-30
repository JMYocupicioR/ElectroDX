export type StaffInboxKind =
  | 'retake'
  | 'submission'
  | 'question'
  | 'admission'
  | 'quiz'
  | 'editorial'
  | 'reply';

export type StaffInboxLevel = 0 | 1 | 2 | 3;

export type StaffInboxTone = 'urgent' | 'warning' | 'info' | 'success';

export interface StaffInboxRow {
  source_key: string;
  kind: StaffInboxKind;
  title: string;
  message: string;
  actor_name: string | null;
  context_label: string | null;
  link_url: string;
  action_required: boolean;
  waiting_since: string;
  due_at: string | null;
  assignment_priority: string | null;
  is_resubmission: boolean;
  topic_has_session_soon: boolean;
  is_read: boolean;
  notification_id: string | null;
}

export interface RankedStaffInboxItem extends StaffInboxRow {
  level: StaffInboxLevel;
  tone: StaffInboxTone;
  sortKind: number;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const KIND_ORDER: Record<StaffInboxKind | 'resubmission', number> = {
  retake: 0,
  resubmission: 1,
  submission: 2,
  question: 3,
  admission: 4,
  quiz: 5,
  editorial: 6,
  reply: 7,
};

const LEVEL_TONE: Record<StaffInboxLevel, StaffInboxTone> = {
  0: 'urgent',
  1: 'warning',
  2: 'info',
  3: 'success',
};

export function staffInboxSortKind(row: Pick<StaffInboxRow, 'kind' | 'is_resubmission'>): number {
  if (row.kind === 'submission' && row.is_resubmission) return KIND_ORDER.resubmission;
  return KIND_ORDER[row.kind];
}

export function rankStaffInboxItem(row: StaffInboxRow, nowMs = Date.now()): RankedStaffInboxItem {
  const waitingMs = new Date(row.waiting_since).getTime();
  const ageMs = Number.isNaN(waitingMs) ? 0 : nowMs - waitingMs;
  const dueMs = row.due_at ? new Date(row.due_at).getTime() : NaN;
  const overdue = !Number.isNaN(dueMs) && dueMs < nowMs;
  const highPriority = row.assignment_priority === 'high' || row.assignment_priority === 'urgent';

  let level: StaffInboxLevel = 3;

  if (row.kind === 'reply') {
    level = 3;
  } else if (row.kind === 'retake') {
    level = 0;
  } else if (row.kind === 'submission') {
    level =
      row.is_resubmission || highPriority || overdue || ageMs >= 48 * HOUR ? 0 : 1;
  } else if (row.kind === 'question') {
    level = row.topic_has_session_soon || ageMs >= DAY ? 0 : 1;
  } else if (row.kind === 'admission') {
    level = 1;
  } else if (row.kind === 'quiz' || row.kind === 'editorial') {
    level = ageMs >= 7 * DAY ? 1 : 2;
  }

  return {
    ...row,
    level,
    tone: LEVEL_TONE[level],
    sortKind: staffInboxSortKind(row),
  };
}

export function sortStaffInboxItems(
  items: RankedStaffInboxItem[]
): RankedStaffInboxItem[] {
  return [...items].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    const waitA = new Date(a.waiting_since).getTime();
    const waitB = new Date(b.waiting_since).getTime();
    if (waitA !== waitB) return waitA - waitB;
    if (a.sortKind !== b.sortKind) return a.sortKind - b.sortKind;
    return a.source_key.localeCompare(b.source_key);
  });
}

export function countStaffInboxBadge(items: RankedStaffInboxItem[]): number {
  return items.filter((item) => item.level <= 1).length;
}

export const STAFF_INBOX_SECTIONS = [
  { id: 'retakes', kinds: ['retake'] },
  { id: 'submissions', kinds: ['submission'] },
  { id: 'questions', kinds: ['question'] },
  { id: 'waitlist', kinds: ['admission'] },
  { id: 'quizzes', kinds: ['quiz'] },
  { id: 'editorial', kinds: ['editorial'] },
  { id: 'atRisk', kinds: [] },
  { id: 'calendar', kinds: [] },
  { id: 'topics', kinds: [] },
] as const;

export function sectionInboxLevel(
  items: RankedStaffInboxItem[],
  kinds: readonly StaffInboxKind[]
): StaffInboxLevel | null {
  const subset = items.filter((item) => kinds.includes(item.kind));
  if (!subset.length) return null;
  return Math.min(...subset.map((item) => item.level)) as StaffInboxLevel;
}

export function orderStaffInboxSections(
  items: RankedStaffInboxItem[],
  extras: { atRiskCount: number }
): string[] {
  return STAFF_INBOX_SECTIONS.map((section, destie) => {
    const level = sectionInboxLevel(items, section.kinds);
    let sortLevel = level ?? 9;
    if (section.id === 'atRisk' && extras.atRiskCount > 0) sortLevel = 8;
    return { id: section.id, sortLevel, destie };
  })
    .sort((a, b) => a.sortLevel - b.sortLevel || a.destie - b.destie)
    .map((section) => section.id);
}

export function countStaffInboxByKind(
  items: RankedStaffInboxItem[]
): {
  pendingTeacherReviews: number;
  pendingCourseEnrollments: number;
  pendingEnrollments: number;
  pendingQuizzes: number;
  pendingRevisions: number;
  pendingQuestions: number;
} {
  let pendingTeacherReviews = 0;
  let pendingCourseEnrollments = 0;
  let pendingEnrollments = 0;
  let pendingQuizzes = 0;
  let pendingRevisions = 0;
  let pendingQuestions = 0;

  for (const item of items) {
    if (item.kind === 'retake' || item.kind === 'submission') pendingTeacherReviews += 1;
    else if (item.kind === 'admission' && item.source_key.startsWith('admission_course:')) {
      pendingCourseEnrollments += 1;
    } else if (item.kind === 'admission') {
      pendingEnrollments += 1;
    } else if (item.kind === 'quiz') pendingQuizzes += 1;
    else if (item.kind === 'editorial') pendingRevisions += 1;
    else if (item.kind === 'question') pendingQuestions += 1;
  }

  return {
    pendingTeacherReviews,
    pendingCourseEnrollments,
    pendingEnrollments,
    pendingQuizzes,
    pendingRevisions,
    pendingQuestions,
  };
}
