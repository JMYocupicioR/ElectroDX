import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Doble de PostgREST: registra cada consulta encadenada para poder afirmar el
 * orden de las escrituras (cerrar el intento anterior antes de crear el nuevo)
 * y los filtros aplicados.
 */
type Call = { table: string; op: 'select' | 'insert' | 'update' | 'delete'; filters: Record<string, unknown>; payload?: unknown };
const calls: Call[] = [];

function builder(table: string) {
  const call: Call = { table, op: 'select', filters: {} };
  calls.push(call);

  const chain: Record<string, unknown> = {
    select() { return chain; },
    insert(payload: unknown) { call.op = 'insert'; call.payload = payload; return chain; },
    update(payload: unknown) { call.op = 'update'; call.payload = payload; return chain; },
    delete() { call.op = 'delete'; return chain; },
    eq(column: string, value: unknown) { call.filters[column] = value; return chain; },
    neq(column: string, value: unknown) { call.filters[`neq:${column}`] = value; return chain; },
    gte(column: string, value: unknown) { call.filters[`gte:${column}`] = value; return chain; },
    order() { return chain; },
    limit() { return chain; },
    maybeSingle() { return Promise.resolve({ data: null, error: null }); },
    single() { return Promise.resolve({ data: { id: 'attempt-nuevo' }, error: null }); },
    // `await query` sin .single(): resuelve como lo hace PostgREST
    then: (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null }),
  };

  return chain;
}

vi.mock('../lib/supabase', () => ({
  sb: { from: (table: string) => builder(table), rpc: () => Promise.resolve({ data: [], error: null }) },
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon-key',
  isSupabaseConfigured: true,
}));

const { createExamAttempt, getPendingExamAttempt, PENDING_ATTEMPT_MAX_AGE_HOURS } = await import('./examService');

const config = { mode: 'FULL_SIMULATION' as const, feedbackMode: 'end' as const, timeLimitSeconds: 1800 };

beforeEach(() => {
  calls.length = 0;
});

describe('createExamAttempt', () => {
  it('cierra los intentos en curso antes de insertar el nuevo', async () => {
    await createExamAttempt('user-1', config, ['q1', 'q2']);

    expect(calls.map(c => c.op)).toEqual(['update', 'insert']);

    const [abandon, insert] = calls;
    expect(abandon.table).toBe('exam_attempts');
    expect(abandon.payload).toEqual({ status: 'ABANDONED' });
    expect(abandon.filters).toMatchObject({ user_id: 'user-1', status: 'IN_PROGRESS' });
    expect(insert.table).toBe('exam_attempts');
  });

  it('persiste la permutación de opciones, el deadline y la asignación', async () => {
    await createExamAttempt('user-1', config, ['q1'], {
      optionOrder: { q1: [2, 0, 1] },
      expiresAt: '2026-09-18T10:00:00.000Z',
      assignmentId: 'asg-9',
    });

    const insert = calls.find(c => c.op === 'insert');
    expect(insert?.payload).toMatchObject({
      option_order: { q1: [2, 0, 1] },
      expires_at: '2026-09-18T10:00:00.000Z',
      assignment_id: 'asg-9',
      status: 'IN_PROGRESS',
      time_remaining_seconds: 1800,
      question_ids: ['q1'],
    });
  });

  it('sin permutación guarda un objeto vacío, nunca undefined', async () => {
    await createExamAttempt('user-1', config, ['q1']);

    const insert = calls.find(c => c.op === 'insert');
    expect((insert?.payload as { option_order: unknown }).option_order).toEqual({});
    expect((insert?.payload as { assignment_id: unknown }).assignment_id).toBeNull();
  });
});

describe('getPendingExamAttempt', () => {
  it('solo considera intentos en curso con actividad reciente', async () => {
    await getPendingExamAttempt('user-1');

    const query = calls.find(c => c.table === 'exam_attempts');
    expect(query?.op).toBe('select');
    expect(query?.filters).toMatchObject({ user_id: 'user-1', status: 'IN_PROGRESS' });

    const cutoff = new Date(String(query?.filters['gte:updated_at'])).getTime();
    const expected = Date.now() - PENDING_ATTEMPT_MAX_AGE_HOURS * 3_600_000;
    expect(Math.abs(cutoff - expected)).toBeLessThan(5_000);
  });

  it('respeta una ventana temporal personalizada', async () => {
    await getPendingExamAttempt('user-1', 2);

    const cutoff = new Date(String(calls[0].filters['gte:updated_at'])).getTime();
    expect(Math.abs(cutoff - (Date.now() - 2 * 3_600_000))).toBeLessThan(5_000);
  });
});
