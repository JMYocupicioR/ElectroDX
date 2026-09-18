import type {
  AssignmentAnalyticsFilters,
  AssignmentAnalyticsRow,
  AttendanceAnalyticsFilters,
  AttendanceAnalyticsRow,
  DateRangeFilter,
  ExamAnalyticsFilters,
  ExamAttemptAnalyticsRow,
  TopicExamSummary,
} from '../types/academicAnalytics';

export function inDateRange(iso: string | null | undefined, range: DateRangeFilter): boolean {
  if (!range.from && !range.to) return true;
  if (!iso) return false;
  const day = iso.slice(0, 10);
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

function matchesSearch(haystack: Array<string | null | undefined>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((value) => (value || '').toLowerCase().includes(q));
}

export function filterExamAttempts(
  rows: ExamAttemptAnalyticsRow[],
  filters: ExamAnalyticsFilters
): ExamAttemptAnalyticsRow[] {
  const minScore = filters.minScore === '' ? null : Number(filters.minScore);
  return rows.filter((row) => {
    if (filters.studentId && row.userId !== filters.studentId) return false;
    if (filters.moduleId && row.moduleId !== filters.moduleId) return false;
    if (filters.topicId && row.topicId !== filters.topicId) return false;
    if (filters.result === 'passed' && !row.passed) return false;
    if (filters.result === 'failed' && row.passed) return false;
    if (minScore != null && !Number.isNaN(minScore) && row.score < minScore) return false;
    if (!inDateRange(row.completedAt, filters)) return false;
    return matchesSearch(
      [row.studentName, row.studentEmail, row.topicTitle, row.moduleLabel, row.topicId],
      filters.search
    );
  });
}

export function summarizeExamsByTopic(rows: ExamAttemptAnalyticsRow[]): TopicExamSummary[] {
  const grouped = new Map<string, ExamAttemptAnalyticsRow[]>();
  for (const row of rows) {
    const key = `${row.moduleId}::${row.topicId}`;
    const list = grouped.get(key);
    if (list) list.push(row);
    else grouped.set(key, [row]);
  }

  return [...grouped.entries()]
    .map(([, list]) => {
      const scores = list.map((item) => item.score);
      const uniqueStudents = new Set(list.map((item) => item.userId)).size;
      const passed = list.filter((item) => item.passed).length;
      const first = list[0];
      return {
        topicId: first.topicId,
        topicTitle: first.topicTitle,
        moduleId: first.moduleId,
        moduleLabel: first.moduleLabel,
        attempts: list.length,
        uniqueStudents,
        avgScore: Math.round((scores.reduce((sum, score) => sum + score, 0) / list.length) * 10) / 10,
        passRate: Math.round((passed / list.length) * 100),
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
      };
    })
    .sort((a, b) => a.moduleLabel.localeCompare(b.moduleLabel, 'es') || a.topicTitle.localeCompare(b.topicTitle, 'es'));
}

export function filterAssignments(
  rows: AssignmentAnalyticsRow[],
  filters: AssignmentAnalyticsFilters
): AssignmentAnalyticsRow[] {
  return rows.filter((row) => {
    if (filters.studentId && row.student_id !== filters.studentId) return false;
    if (filters.type !== 'all' && row.type !== filters.type) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (!inDateRange(row.submitted_at || row.due_date, filters)) return false;
    return matchesSearch(
      [row.studentName, row.studentEmail, row.title, row.type, row.status, row.target_topic_id],
      filters.search
    );
  });
}

export function filterAttendance(
  rows: AttendanceAnalyticsRow[],
  filters: AttendanceAnalyticsFilters
): AttendanceAnalyticsRow[] {
  return rows.filter((row) => {
    if (filters.studentId && row.studentId !== filters.studentId) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.modality !== 'all' && row.modality !== filters.modality) return false;
    if (filters.sessionTitle && row.sessionTitle !== filters.sessionTitle) return false;
    if (!inDateRange(row.sessionDate, filters)) return false;
    return matchesSearch(
      [row.studentName, row.studentEmail, row.sessionTitle, row.notes],
      filters.search
    );
  });
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
