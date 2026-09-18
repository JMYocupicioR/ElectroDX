import { supabase } from '../lib/supabase';
import { isTableMissingInSupabase, markTableAsMissingInSupabase } from './tableAvailability';
import type { ClassAttendanceRecord, SessionModality } from '../types/academicGradebook';

const KEY_LOCAL_ATTENDANCE = 'neurosafe_class_attendances_';

export function normalizeSessionModality(value: unknown): SessionModality {
  return value === 'in_person' ? 'in_person' : 'online';
}

function attendanceKey(record: Pick<ClassAttendanceRecord, 'student_id' | 'session_title' | 'session_date'>): string {
  return `${record.student_id}|${record.session_title}|${record.session_date}`;
}

function normalizeAttendanceRecord(row: ClassAttendanceRecord): ClassAttendanceRecord {
  return {
    ...row,
    session_modality: normalizeSessionModality(row.session_modality),
  };
}

// Talleres y sesiones base de ejemplo para el curso si no hay registros
export const DEFAULT_COURSE_SESSIONS: { title: string; date: string }[] = [];

export async function getStudentAttendance(studentId: string): Promise<ClassAttendanceRecord[]> {
  if (!studentId) return [];

  if (!isTableMissingInSupabase('class_attendances')) {
    try {
      const { data, error, status } = await (supabase.from as any)('class_attendances')
        .select('*')
        .eq('student_id', studentId)
        .order('session_date', { ascending: false });

      if (status === 404 || error) {
        markTableAsMissingInSupabase('class_attendances');
      } else if (data) {
        return (data as ClassAttendanceRecord[]).map(normalizeAttendanceRecord);
      }
    } catch {
      markTableAsMissingInSupabase('class_attendances');
    }
  }

  try {
    const raw = localStorage.getItem(`${KEY_LOCAL_ATTENDANCE}${studentId}`);
    if (raw) {
      return (JSON.parse(raw) as ClassAttendanceRecord[]).map(normalizeAttendanceRecord);
    }
  } catch {
    // ignore cache parse errors
  }

  return [];
}

export async function saveStudentAttendanceRecord(record: ClassAttendanceRecord): Promise<void> {
  // 1. Local
  try {
    const raw = localStorage.getItem(`${KEY_LOCAL_ATTENDANCE}${record.student_id}`);
    const list: ClassAttendanceRecord[] = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex(
      (r) => r.session_title === record.session_title && r.session_date === record.session_date
    );

    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...record, updated_at: new Date().toISOString() };
    } else {
      list.push({ ...record, updated_at: new Date().toISOString() });
    }

    localStorage.setItem(`${KEY_LOCAL_ATTENDANCE}${record.student_id}`, JSON.stringify(list));
  } catch (e) {
    console.warn('[attendanceService] Error saving local attendance:', e);
  }

  // 2. Supabase
  if (!isTableMissingInSupabase('class_attendances')) {
    const payload = {
      session_title: record.session_title,
      session_date: record.session_date,
      workshop_id: record.workshop_id ?? null,
      student_id: record.student_id,
      status: record.status,
      session_modality: normalizeSessionModality(record.session_modality),
      minutes_attended: record.minutes_attended ?? null,
      notes: record.notes ?? null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error, status } = await (supabase.from as any)('class_attendances').upsert(payload, {
        onConflict: 'student_id,session_title,session_date',
      });
      if (status === 404) {
        markTableAsMissingInSupabase('class_attendances');
      } else if (error && /session_modality/i.test(error.message || '')) {
        const { session_modality: _ignored, ...legacyPayload } = payload;
        const retry = await (supabase.from as any)('class_attendances').upsert(legacyPayload, {
          onConflict: 'student_id,session_title,session_date',
        });
        if (retry.status === 404 || retry.error) {
          markTableAsMissingInSupabase('class_attendances');
        }
      } else if (error) {
        markTableAsMissingInSupabase('class_attendances');
      }
    } catch {
      markTableAsMissingInSupabase('class_attendances');
    }
  }
}

export async function getCohortAttendance(studentIds: string[] = []): Promise<ClassAttendanceRecord[]> {
  const byKey = new Map<string, ClassAttendanceRecord>();

  if (!isTableMissingInSupabase('class_attendances')) {
    try {
      const { data, error, status } = await (supabase.from as any)('class_attendances')
        .select('*')
        .order('session_date', { ascending: false });

      if (status === 404 || error) {
        markTableAsMissingInSupabase('class_attendances');
      } else if (data) {
        for (const row of data as ClassAttendanceRecord[]) {
          const normalized = normalizeAttendanceRecord(row);
          byKey.set(attendanceKey(normalized), normalized);
        }
      }
    } catch {
      markTableAsMissingInSupabase('class_attendances');
    }
  }

  for (const studentId of studentIds) {
    try {
      const raw = localStorage.getItem(`${KEY_LOCAL_ATTENDANCE}${studentId}`);
      if (!raw) continue;
      const list = (JSON.parse(raw) as ClassAttendanceRecord[]).map(normalizeAttendanceRecord);
      for (const row of list) {
        const key = attendanceKey(row);
        if (!byKey.has(key)) byKey.set(key, row);
      }
    } catch {
      // ignore cache parse errors
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const dateCmp = (b.session_date || '').localeCompare(a.session_date || '');
    if (dateCmp !== 0) return dateCmp;
    return (a.session_title || '').localeCompare(b.session_title || '', 'es');
  });
}

export async function saveCohortAttendanceBatch(records: ClassAttendanceRecord[]): Promise<void> {
  for (const rec of records) {
    await saveStudentAttendanceRecord(rec);
  }
}

export async function calculateStudentAttendanceMetrics(studentId: string): Promise<{
  totalSessions: number;
  attendedSessions: number;
  lateSessions: number;
  excusedSessions: number;
  absentSessions: number;
  attendancePct: number;
  records: ClassAttendanceRecord[];
}> {
  const records = await getStudentAttendance(studentId);
  const total = records.length;
  if (total === 0) {
    return {
      totalSessions: 0,
      attendedSessions: 0,
      lateSessions: 0,
      excusedSessions: 0,
      absentSessions: 0,
      attendancePct: 100,
      records: [],
    };
  }

  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let absentCount = 0;
  let points = 0;

  for (const r of records) {
    if (r.status === 'present') {
      presentCount++;
      points += 1.0;
    } else if (r.status === 'late') {
      lateCount++;
      points += 0.8; // 80% de valor por retardo
    } else if (r.status === 'excused') {
      excusedCount++;
      points += 1.0; // Falta justificada cuenta al 100%
    } else {
      absentCount++;
      points += 0;
    }
  }

  const attendancePct = Math.min(100, Math.round((points / total) * 100));

  return {
    totalSessions: total,
    attendedSessions: presentCount,
    lateSessions: lateCount,
    excusedSessions: excusedCount,
    absentSessions: absentCount,
    attendancePct,
    records,
  };
}
