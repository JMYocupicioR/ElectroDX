import { describe, expect, it } from 'vitest';
import {
  describeStudentActivity,
  formatActivityScore,
  studentActivityErrorText,
  type StudentActivityRow,
} from './studentActivityFeed';

function row(partial: Partial<StudentActivityRow> & Pick<StudentActivityRow, 'kind'>): StudentActivityRow {
  return {
    occurred_at: '2026-10-30T15:31:00.000Z',
    actor_id: 'user-1',
    topic_id: null,
    module_id: null,
    score: null,
    passed: null,
    excerpt: null,
    entity_id: 'evt-1',
    detail: null,
    ...partial,
  };
}

describe('describeStudentActivity', () => {
  it('arma la lectura con tema y subtema', () => {
    const sentence = describeStudentActivity(
      row({ kind: 'reading', topic_id: 'history', module_id: 'fundamentals' }),
      'Ana López',
    );
    expect(sentence).toBe(
      'Ana López completó la lectura de Introducción al Neurodiagnóstico › Historia de la electrofisiología clínica',
    );
  });

  it('incluye el puntaje de la evaluación', () => {
    const sentence = describeStudentActivity(
      row({ kind: 'quiz', topic_id: 'history', score: 60, passed: false }),
      'Luis Gómez',
    );
    expect(sentence).toBe(
      'Luis Gómez completó la evaluación de Introducción al Neurodiagnóstico › Historia de la electrofisiología clínica y obtuvo 60',
    );
  });

  it('describe el simulacro con los temas guardados', () => {
    const sentence = describeStudentActivity(
      row({
        kind: 'exam',
        module_id: 'fundamentals',
        score: 60,
        passed: false,
        excerpt: 'Historia de la electrofisiología clínica',
        detail: 'FULL_SIMULATION',
      }),
      'Luis Gómez',
    );
    expect(sentence).toBe(
      'Luis Gómez completó un simulacro completo de Historia de la electrofisiología clínica y obtuvo 60',
    );
  });

  it('escribe el comentario y la respuesta', () => {
    expect(
      describeStudentActivity(
        row({ kind: 'comment', topic_id: 'history', excerpt: '¿La onda V es la última?' }),
        'Carla Ruiz',
      ),
    ).toBe(
      'Carla Ruiz comentó en Introducción al Neurodiagnóstico › Historia de la electrofisiología clínica: ¿La onda V es la última?',
    );
    expect(
      describeStudentActivity(
        row({ kind: 'reply', topic_id: 'history', excerpt: 'Sí, es la más robusta.' }),
        'Carla Ruiz',
      ),
    ).toContain('respondió en');
  });

  it('usa un nombre genérico si el perfil no tiene nombre', () => {
    expect(describeStudentActivity(row({ kind: 'reading', topic_id: 'history' }), '  ')).toMatch(
      /^Un alumno completó la lectura de /,
    );
  });
});

describe('formatActivityScore', () => {
  it('redondea un decimal y deja enteros sin .0', () => {
    expect(formatActivityScore(60)).toBe('60');
    expect(formatActivityScore(60.04)).toBe('60');
    expect(formatActivityScore(60.25)).toBe('60.3');
    expect(formatActivityScore(null)).toBe('—');
  });
});

describe('studentActivityErrorText', () => {
  it('explica si falta la función en la base', () => {
    expect(studentActivityErrorText({ code: 'PGRST202', message: 'Could not find the function' })).toMatch(
      /20261030120000_admin_platform_activity/,
    );
  });

  it('explica si quien consulta no es administrador', () => {
    expect(
      studentActivityErrorText(new Error('Solo un administrador puede ver la actividad de los alumnos.')),
    ).toMatch(/administrador/);
  });
});
