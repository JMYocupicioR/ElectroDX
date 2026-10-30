import { describe, expect, it } from 'vitest';
import {
  countStaffInboxBadge,
  orderStaffInboxSections,
  rankStaffInboxItem,
  sortStaffInboxItems,
  type StaffInboxRow,
} from './staffInboxRank';

const NOW = Date.parse('2026-10-29T18:00:00.000Z');

function row(partial: Partial<StaffInboxRow> & Pick<StaffInboxRow, 'kind' | 'source_key'>): StaffInboxRow {
  return {
    title: partial.title ?? partial.kind,
    message: partial.message ?? 'mensaje',
    actor_name: partial.actor_name ?? 'Dra. López',
    context_label: partial.context_label ?? 'Tema',
    link_url: partial.link_url ?? '/admin',
    action_required: partial.action_required ?? partial.kind !== 'reply',
    waiting_since: partial.waiting_since ?? '2026-10-29T17:00:00.000Z',
    due_at: partial.due_at ?? null,
    assignment_priority: partial.assignment_priority ?? null,
    is_resubmission: partial.is_resubmission ?? false,
    topic_has_session_soon: partial.topic_has_session_soon ?? false,
    is_read: partial.is_read ?? false,
    notification_id: partial.notification_id ?? null,
    ...partial,
  };
}

describe('rankStaffInboxItem', () => {
  it('pone un reintento en P0', () => {
    const ranked = rankStaffInboxItem(row({ kind: 'retake', source_key: 'r1' }), NOW);
    expect(ranked.level).toBe(0);
    expect(ranked.tone).toBe('urgent');
  });

  it('pone una reentrega en P0', () => {
    const ranked = rankStaffInboxItem(
      row({ kind: 'submission', source_key: 's1', is_resubmission: true }),
      NOW
    );
    expect(ranked.level).toBe(0);
  });

  it('pone una entrega de prioridad alta en P0', () => {
    const ranked = rankStaffInboxItem(
      row({ kind: 'submission', source_key: 's2', assignment_priority: 'high' }),
      NOW
    );
    expect(ranked.level).toBe(0);
  });

  it('pone una entrega vencida en P0', () => {
    const ranked = rankStaffInboxItem(
      row({
        kind: 'submission',
        source_key: 's3',
        due_at: '2026-10-28T18:00:00.000Z',
        waiting_since: '2026-10-29T16:00:00.000Z',
      }),
      NOW
    );
    expect(ranked.level).toBe(0);
  });

  it('pone una entrega de 48 horas en P0 y una reciente en P1', () => {
    const stale = rankStaffInboxItem(
      row({
        kind: 'submission',
        source_key: 's4',
        waiting_since: '2026-10-27T17:00:00.000Z',
      }),
      NOW
    );
    const fresh = rankStaffInboxItem(
      row({
        kind: 'submission',
        source_key: 's5',
        waiting_since: '2026-10-29T16:00:00.000Z',
      }),
      NOW
    );
    expect(stale.level).toBe(0);
    expect(fresh.level).toBe(1);
  });

  it('pone una duda de 24 horas en P0 y una reciente en P1', () => {
    const stale = rankStaffInboxItem(
      row({
        kind: 'question',
        source_key: 'q1',
        waiting_since: '2026-10-28T17:00:00.000Z',
      }),
      NOW
    );
    const fresh = rankStaffInboxItem(
      row({
        kind: 'question',
        source_key: 'q2',
        waiting_since: '2026-10-29T16:00:00.000Z',
      }),
      NOW
    );
    expect(stale.level).toBe(0);
    expect(fresh.level).toBe(1);
  });

  it('pone una duda con taller próximo en P0', () => {
    const ranked = rankStaffInboxItem(
      row({
        kind: 'question',
        source_key: 'q3',
        waiting_since: '2026-10-29T16:30:00.000Z',
        topic_has_session_soon: true,
      }),
      NOW
    );
    expect(ranked.level).toBe(0);
  });

  it('deja una admisión en P1', () => {
    const ranked = rankStaffInboxItem(row({ kind: 'admission', source_key: 'a1' }), NOW);
    expect(ranked.level).toBe(1);
  });

  it('pone un quiz de 8 días en P1 y uno de 1 día en P2', () => {
    const oldQuiz = rankStaffInboxItem(
      row({
        kind: 'quiz',
        source_key: 'quiz-old',
        waiting_since: '2026-10-21T17:00:00.000Z',
      }),
      NOW
    );
    const newQuiz = rankStaffInboxItem(
      row({
        kind: 'quiz',
        source_key: 'quiz-new',
        waiting_since: '2026-10-28T17:00:00.000Z',
      }),
      NOW
    );
    expect(oldQuiz.level).toBe(1);
    expect(newQuiz.level).toBe(2);
  });

  it('nunca sube una respuesta de P3', () => {
    const ranked = rankStaffInboxItem(
      row({
        kind: 'reply',
        source_key: 'reply1',
        waiting_since: '2026-10-01T00:00:00.000Z',
        action_required: false,
      }),
      NOW
    );
    expect(ranked.level).toBe(3);
  });
});

describe('sortStaffInboxItems y badge', () => {
  it('ordena P0 primero y, al empate, la espera más larga y el reintento antes que la entrega', () => {
    const items = sortStaffInboxItems([
      rankStaffInboxItem(
        row({
          kind: 'submission',
          source_key: 's-new',
          waiting_since: '2026-10-29T17:00:00.000Z',
        }),
        NOW
      ),
      rankStaffInboxItem(
        row({
          kind: 'retake',
          source_key: 'r-old',
          waiting_since: '2026-10-27T12:00:00.000Z',
        }),
        NOW
      ),
      rankStaffInboxItem(
        row({
          kind: 'submission',
          source_key: 's-old',
          is_resubmission: true,
          waiting_since: '2026-10-27T12:00:00.000Z',
        }),
        NOW
      ),
      rankStaffInboxItem(row({ kind: 'reply', source_key: 'reply' }), NOW),
    ]);

    expect(items.map((item) => item.source_key)).toEqual(['r-old', 's-old', 's-new', 'reply']);
  });

  it('cuenta solo P0 y P1 en el badge', () => {
    const items = [
      rankStaffInboxItem(row({ kind: 'retake', source_key: 'r' }), NOW),
      rankStaffInboxItem(row({ kind: 'admission', source_key: 'a' }), NOW),
      rankStaffInboxItem(
        row({
          kind: 'quiz',
          source_key: 'q',
          waiting_since: '2026-10-28T17:00:00.000Z',
        }),
        NOW
      ),
      rankStaffInboxItem(row({ kind: 'reply', source_key: 'rp' }), NOW),
    ];
    expect(countStaffInboxBadge(items)).toBe(2);
  });

  it('ordena secciones por nivel y, al empate, reintentos antes que entregas', () => {
    const items = [
      rankStaffInboxItem(row({ kind: 'submission', source_key: 's' }), NOW),
      rankStaffInboxItem(row({ kind: 'retake', source_key: 'r' }), NOW),
      rankStaffInboxItem(
        row({
          kind: 'quiz',
          source_key: 'q',
          waiting_since: '2026-10-28T17:00:00.000Z',
        }),
        NOW
      ),
    ];
    expect(orderStaffInboxSections(items, { atRiskCount: 2 })[0]).toBe('retakes');
    expect(orderStaffInboxSections(items, { atRiskCount: 2 }).slice(-1)[0]).toBe('topics');
  });
});
