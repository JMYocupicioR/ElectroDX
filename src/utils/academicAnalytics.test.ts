import { describe, expect, it } from 'vitest';
import {
  filterAttendance,
  filterExamAttempts,
  summarizeExamsByTopic,
} from './academicAnalytics';
import type {
  AttendanceAnalyticsRow,
  ExamAttemptAnalyticsRow,
} from '../types/academicAnalytics';

const attempts: ExamAttemptAnalyticsRow[] = [
  {
    id: '1',
    userId: 'a',
    studentName: 'Ana Pérez',
    studentEmail: 'ana@test.com',
    moduleId: 'm1',
    moduleLabel: 'Módulo 1',
    topicId: 't1',
    topicTitle: 'Potenciales',
    score: 90,
    passed: true,
    durationSeconds: 120,
    completedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: '2',
    userId: 'b',
    studentName: 'Luis Soto',
    studentEmail: 'luis@test.com',
    moduleId: 'm1',
    moduleLabel: 'Módulo 1',
    topicId: 't1',
    topicTitle: 'Potenciales',
    score: 60,
    passed: false,
    durationSeconds: 90,
    completedAt: '2026-09-02T10:00:00.000Z',
  },
];

describe('academic analytics filters', () => {
  it('summarizes exam attempts by topic', () => {
    const summary = summarizeExamsByTopic(attempts);
    expect(summary).toHaveLength(1);
    expect(summary[0].attempts).toBe(2);
    expect(summary[0].uniqueStudents).toBe(2);
    expect(summary[0].avgScore).toBe(75);
    expect(summary[0].passRate).toBe(50);
    expect(summary[0].bestScore).toBe(90);
    expect(summary[0].worstScore).toBe(60);
  });

  it('filters exams by student, result and date', () => {
    const filtered = filterExamAttempts(attempts, {
      studentId: 'a',
      moduleId: '',
      topicId: '',
      result: 'passed',
      minScore: '',
      search: '',
      from: '2026-09-01',
      to: '2026-09-01',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].studentName).toBe('Ana Pérez');
  });

  it('filters attendance by modality and status', () => {
    const rows: AttendanceAnalyticsRow[] = [
      {
        id: 'att1',
        studentId: 'a',
        studentName: 'Ana Pérez',
        studentEmail: 'ana@test.com',
        sessionTitle: 'Taller EMG',
        sessionDate: '2026-09-10',
        status: 'present',
        modality: 'in_person',
        notes: null,
      },
      {
        id: 'att2',
        studentId: 'b',
        studentName: 'Luis Soto',
        studentEmail: 'luis@test.com',
        sessionTitle: 'Sesión Zoom',
        sessionDate: '2026-09-11',
        status: 'absent',
        modality: 'online',
        notes: null,
      },
    ];

    const filtered = filterAttendance(rows, {
      studentId: '',
      status: 'all',
      modality: 'online',
      sessionTitle: '',
      search: '',
      from: '',
      to: '',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].sessionTitle).toBe('Sesión Zoom');
  });
});
