import { beforeEach, describe, expect, it } from 'vitest';
import {
  accreditStudentRecordingAttendance,
  attendanceStatusLabelEs,
  attendanceStatusSatisfiesSession,
} from './attendanceService';
import type { LiveWorkshop } from '../types/database';

beforeEach(() => {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
  };
});

describe('attendanceStatusSatisfiesSession', () => {
  it('acepta presente, retardo y justificada', () => {
    expect(attendanceStatusSatisfiesSession('present')).toBe(true);
    expect(attendanceStatusSatisfiesSession('late')).toBe(true);
    expect(attendanceStatusSatisfiesSession('excused')).toBe(true);
  });

  it('rechaza falta o vacío', () => {
    expect(attendanceStatusSatisfiesSession('absent')).toBe(false);
    expect(attendanceStatusSatisfiesSession(null)).toBe(false);
    expect(attendanceStatusSatisfiesSession(undefined)).toBe(false);
  });
});

describe('attendanceStatusLabelEs', () => {
  it('traduce estados del pase de lista', () => {
    expect(attendanceStatusLabelEs('present')).toBe('Presente');
    expect(attendanceStatusLabelEs('late')).toBe('Retardo');
    expect(attendanceStatusLabelEs('excused')).toBe('Justificada');
    expect(attendanceStatusLabelEs('absent')).toBe('Falta');
  });
});

describe('accreditStudentRecordingAttendance', () => {
  it('acredita asistencia asignando status presente y guardando en storage local', async () => {
    const fakeWorkshop = {
      id: 'ws-test-recorded-1',
      title: 'Clase: Bienvenido al curso',
      description: 'Intro',
      scheduled_at: '2026-11-03T18:00:00Z',
      duration_minutes: 90,
      stream_url: 'https://meet.google.com/test',
      status: 'completed',
      recording_url: 'https://drive.google.com/file/d/test/view',
      session_modality: 'online',
    } as unknown as LiveWorkshop;

    const record = await accreditStudentRecordingAttendance({
      workshop: fakeWorkshop,
      studentId: 'student-unit-test-1',
    });

    expect(record.status).toBe('present');
    expect(record.workshop_id).toBe('ws-test-recorded-1');
    expect(record.student_id).toBe('student-unit-test-1');
    expect(record.session_title).toBe('Clase: Bienvenido al curso');
    expect(record.session_date).toBe('2026-11-03');
    expect(record.session_modality).toBe('online');
    expect(record.minutes_attended).toBe(90);

    // Verificar que también se actualizó el storage local
    const raw = localStorage.getItem('neurosafe_class_attendances_student-unit-test-1');
    expect(raw).toBeTruthy();
    const list = JSON.parse(raw!);
    const found = list.find((r: any) => r.workshop_id === 'ws-test-recorded-1');
    expect(found).toBeDefined();
    expect(found.status).toBe('present');
  });
});
