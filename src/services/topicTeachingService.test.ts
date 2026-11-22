import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TopicTeachingCommitment } from '../types/database';

const ADMIN_UUID = '11111111-1111-4111-8111-111111111111';
const OTHER_TEACHER_UUID = '22222222-2222-4222-8222-222222222222';
const WORKSHOP_UUID = 'eb829a37-a4ff-4fcf-981a-78b1e2b7b3b5';
const COMMITMENT_PARENT_UUID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const COMMITMENT_CHILD_UUID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

interface MockState {
  commitments: {
    id: string;
    cohort_id: string;
    module_id: string;
    topic_id: string;
    teacher_id: string;
    status: 'proposed' | 'confirmed' | 'withdrawn';
    workshop_id: string | null;
  }[];
  instructors: { workshop_id: string; teacher_id: string }[];
  rpcCalls: { fn: string; params: unknown }[];
}

const mockState: MockState = {
  commitments: [],
  instructors: [],
  rpcCalls: [],
};

function makeQuery(table: string) {
  const filters: Array<(row: Record<string, unknown>) => boolean> = [];
  let mode: 'select' | 'update' | 'delete' | 'upsert' = 'select';
  let patch: Record<string, unknown> = {};
  let upsertRows: Record<string, unknown>[] = [];

  const rowsRef = () =>
    (table === 'topic_teaching_commitments'
      ? mockState.commitments
      : table === 'workshop_instructors'
        ? mockState.instructors
        : []) as unknown as Record<string, unknown>[];

  const execute = () => {
    const rows = rowsRef();
    if (mode === 'select') {
      const matched = rows.filter((row) => filters.every((fn) => fn(row)));
      return { data: matched.map((r) => ({ ...r })), error: null, status: 200 };
    }
    if (mode === 'update') {
      const matched = rows.filter((row) => filters.every((fn) => fn(row)));
      for (const row of matched) {
        Object.assign(row, patch);
      }
      return { data: matched.map((r) => ({ ...r })), error: null, status: 200 };
    }
    if (mode === 'delete') {
      const keep = rows.filter((row) => !filters.every((fn) => fn(row)));
      if (table === 'workshop_instructors') {
        mockState.instructors = keep as MockState['instructors'];
      }
      return { data: [], error: null, status: 200 };
    }
    if (mode === 'upsert') {
      if (table === 'workshop_instructors') {
        for (const item of upsertRows) {
          const exists = mockState.instructors.some(
            (r) => r.workshop_id === item.workshop_id && r.teacher_id === item.teacher_id
          );
          if (!exists) {
            mockState.instructors.push({
              workshop_id: String(item.workshop_id),
              teacher_id: String(item.teacher_id),
            });
          }
        }
      }
      return { data: upsertRows, error: null, status: 200 };
    }
    return { data: [], error: null, status: 200 };
  };

  const builder: Record<string, unknown> = {
    select: () => builder,
    update: (values: Record<string, unknown>) => {
      mode = 'update';
      patch = values;
      return builder;
    },
    delete: () => {
      mode = 'delete';
      return builder;
    },
    upsert: (values: Record<string, unknown> | Record<string, unknown>[]) => {
      mode = 'upsert';
      upsertRows = Array.isArray(values) ? values : [values];
      return builder;
    },
    eq: (col: string, val: unknown) => {
      filters.push((row) => row[col] === val);
      return builder;
    },
    neq: (col: string, val: unknown) => {
      filters.push((row) => row[col] !== val);
      return builder;
    },
    in: (col: string, vals: unknown[]) => {
      filters.push((row) => vals.includes(row[col]));
      return builder;
    },
    limit: () => builder,
    order: () => builder,
    maybeSingle: () => {
      const res = execute();
      return Promise.resolve({
        data: Array.isArray(res.data) ? res.data[0] ?? null : null,
        error: res.error,
        status: res.status,
      });
    },
    then: (resolve: (val: unknown) => void, reject?: (err: unknown) => void) =>
      Promise.resolve(execute()).then(resolve, reject),
  };
  return builder;
}

vi.mock('../lib/supabase', () => ({
  sb: {
    from: (table: string) => makeQuery(table),
    rpc: vi.fn(async (fn: string, params: unknown) => {
      mockState.rpcCalls.push({ fn, params });
      return { data: null, error: null };
    }),
  },
}));

import {
  TOPIC_TEACHING_COHORT_ID,
  mergeRemoteAndLocalCommitments,
  removeTeacherFromTopics,
  syncWorkshopInstructors,
} from './topicTeachingService';

function makeCommitment(
  overrides: Partial<TopicTeachingCommitment> & Pick<TopicTeachingCommitment, 'id' | 'topic_id' | 'teacher_id'>
): TopicTeachingCommitment {
  return {
    cohort_id: TOPIC_TEACHING_COHORT_ID,
    module_id: 'estudios-conduccion',
    status: 'confirmed',
    milestone_id: null,
    workshop_id: null,
    proposed_at: '2026-11-20T00:00:00.000Z',
    confirmed_by: null,
    confirmed_at: '2026-11-20T00:00:00.000Z',
    teacher_name: 'Profesor',
    ...overrides,
  };
}

describe('topicTeachingService', () => {
  beforeEach(() => {
    mockState.commitments = [];
    mockState.instructors = [];
    mockState.rpcCalls = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('mergeRemoteAndLocalCommitments', () => {
    it('no resucita un compromiso UUID ya retirado en servidor aunque siga en localStorage', () => {
      const local = [
        makeCommitment({
          id: COMMITMENT_PARENT_UUID,
          topic_id: 'neuroconduccion-motora',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        }),
      ];
      const merged = mergeRemoteAndLocalCommitments([], local, TOPIC_TEACHING_COHORT_ID);
      expect(merged).toEqual([]);
    });

    it('conserva docentes invitados (no UUID) y filas locales pendientes', () => {
      const guest = makeCommitment({
        id: 'local_guest_1',
        topic_id: 'neuroconduccion-motora',
        teacher_id: 'guest_dra_laura',
        teacher_name: 'Dra. Laura Méndez',
      });
      const merged = mergeRemoteAndLocalCommitments([], [guest], TOPIC_TEACHING_COHORT_ID);
      expect(merged).toHaveLength(1);
      expect(merged[0].teacher_id).toBe('guest_dra_laura');
    });

    it('no oculta una reasignación remota activa por un tombstone local previo', () => {
      const remote = [
        makeCommitment({
          id: COMMITMENT_PARENT_UUID,
          topic_id: 'neuroconduccion-motora',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
        }),
      ];
      const staleLocal = [
        makeCommitment({
          id: COMMITMENT_PARENT_UUID,
          topic_id: 'neuroconduccion-motora',
          teacher_id: ADMIN_UUID,
          status: 'withdrawn',
        }),
      ];
      const merged = mergeRemoteAndLocalCommitments(remote, staleLocal, TOPIC_TEACHING_COHORT_ID);
      expect(merged).toHaveLength(1);
      expect(merged[0].teacher_id).toBe(ADMIN_UUID);
    });
  });

  describe('removeTeacherFromTopics', () => {
    it('retira tema padre y subtemas en Supabase aunque commitmentIds solo traiga el padre y limpia workshop_instructors', async () => {
      mockState.commitments = [
        {
          id: COMMITMENT_PARENT_UUID,
          cohort_id: TOPIC_TEACHING_COHORT_ID,
          module_id: 'estudios-conduccion',
          topic_id: 'neuroconduccion-motora',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        },
        {
          id: COMMITMENT_CHILD_UUID,
          cohort_id: TOPIC_TEACHING_COHORT_ID,
          module_id: 'estudios-conduccion',
          topic_id: 'cmap-morfologia',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        },
        {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          cohort_id: TOPIC_TEACHING_COHORT_ID,
          module_id: 'estudios-conduccion',
          topic_id: 'neuroconduccion-motora',
          teacher_id: OTHER_TEACHER_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        },
      ];
      mockState.instructors = [
        { workshop_id: WORKSHOP_UUID, teacher_id: ADMIN_UUID },
        { workshop_id: WORKSHOP_UUID, teacher_id: OTHER_TEACHER_UUID },
      ];

      await removeTeacherFromTopics({
        teacherId: ADMIN_UUID,
        topicIds: ['neuroconduccion-motora', 'cmap-morfologia'],
        commitmentIds: [COMMITMENT_PARENT_UUID],
        workshopId: WORKSHOP_UUID,
      });

      const adminRows = mockState.commitments.filter((c) => c.teacher_id === ADMIN_UUID);
      expect(adminRows.every((c) => c.status === 'withdrawn' && c.workshop_id === null)).toBe(true);

      const otherRow = mockState.commitments.find((c) => c.teacher_id === OTHER_TEACHER_UUID);
      expect(otherRow?.status).toBe('confirmed');
      expect(otherRow?.workshop_id).toBe(WORKSHOP_UUID);

      expect(mockState.instructors).toEqual([
        { workshop_id: WORKSHOP_UUID, teacher_id: OTHER_TEACHER_UUID },
      ]);
    });

    it('al desactivar incluir subtemas pero retirar de la clase, desvincula workshop_id de subtemas sin borrar al docente de esos subtemas', async () => {
      mockState.commitments = [
        {
          id: COMMITMENT_PARENT_UUID,
          cohort_id: TOPIC_TEACHING_COHORT_ID,
          module_id: 'estudios-conduccion',
          topic_id: 'neuroconduccion-motora',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        },
        {
          id: COMMITMENT_CHILD_UUID,
          cohort_id: TOPIC_TEACHING_COHORT_ID,
          module_id: 'estudios-conduccion',
          topic_id: 'cmap-morfologia',
          teacher_id: ADMIN_UUID,
          status: 'confirmed',
          workshop_id: WORKSHOP_UUID,
        },
      ];
      mockState.instructors = [{ workshop_id: WORKSHOP_UUID, teacher_id: ADMIN_UUID }];

      await removeTeacherFromTopics({
        teacherId: ADMIN_UUID,
        topicIds: ['neuroconduccion-motora'],
        commitmentIds: [COMMITMENT_PARENT_UUID],
        workshopId: WORKSHOP_UUID,
      });

      const parent = mockState.commitments.find((c) => c.id === COMMITMENT_PARENT_UUID);
      const child = mockState.commitments.find((c) => c.id === COMMITMENT_CHILD_UUID);
      expect(parent?.status).toBe('withdrawn');
      expect(parent?.workshop_id).toBeNull();
      expect(child?.status).toBe('confirmed');
      expect(child?.workshop_id).toBeNull();
      expect(mockState.instructors).toEqual([]);
    });
  });

  describe('syncWorkshopInstructors', () => {
    it('elimina instructores retirados y agrega los vigentes al guardar la clase', async () => {
      mockState.instructors = [
        { workshop_id: WORKSHOP_UUID, teacher_id: ADMIN_UUID },
      ];

      await syncWorkshopInstructors(WORKSHOP_UUID, [OTHER_TEACHER_UUID, 'guest_externo']);

      expect(mockState.instructors).toEqual([
        { workshop_id: WORKSHOP_UUID, teacher_id: OTHER_TEACHER_UUID },
      ]);
    });

    it('deja workshop_instructors vacío cuando no queda ningún docente asignado', async () => {
      mockState.instructors = [
        { workshop_id: WORKSHOP_UUID, teacher_id: ADMIN_UUID },
        { workshop_id: WORKSHOP_UUID, teacher_id: OTHER_TEACHER_UUID },
      ];

      await syncWorkshopInstructors(WORKSHOP_UUID, []);

      expect(mockState.instructors).toEqual([]);
    });
  });
});
