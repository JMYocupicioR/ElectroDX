import { describe, expect, it } from 'vitest';
import type { LiveWorkshop } from '../types/database';
import { planUnlinkRecordedWorkshopFromTopic } from './linkRecordedClassService';

function workshop(
  partial: Partial<LiveWorkshop> & Pick<LiveWorkshop, 'id' | 'topic_id'>,
): Pick<LiveWorkshop, 'topic_id' | 'clinical_case_json'> {
  return {
    topic_id: partial.topic_id,
    clinical_case_json: partial.clinical_case_json ?? null,
  };
}

describe('planUnlinkRecordedWorkshopFromTopic', () => {
  it('quita un tema extra y conserva el primario', () => {
    const plan = planUnlinkRecordedWorkshopFromTopic(
      workshop({
        id: 'w1',
        topic_id: 'primary',
        clinical_case_json: { session_topic_ids: ['primary', 'extra'] },
      }),
      'extra',
    );
    expect(plan.remainingTopicIds).toEqual(['primary']);
    expect(plan.nextPrimaryTopicId).toBe('primary');
  });

  it('si se quita el primario, promociona el siguiente de la lista', () => {
    const plan = planUnlinkRecordedWorkshopFromTopic(
      workshop({
        id: 'w1',
        topic_id: 'primary',
        clinical_case_json: { session_topic_ids: ['primary', 'extra-a', 'extra-b'] },
      }),
      'primary',
    );
    expect(plan.remainingTopicIds).toEqual(['extra-a', 'extra-b']);
    expect(plan.nextPrimaryTopicId).toBe('extra-a');
  });

  it('si era el único tema, deja el taller sin topic_id', () => {
    const plan = planUnlinkRecordedWorkshopFromTopic(
      workshop({
        id: 'w1',
        topic_id: 'solo',
        clinical_case_json: { session_topic_ids: ['solo'] },
      }),
      'solo',
    );
    expect(plan.remainingTopicIds).toEqual([]);
    expect(plan.nextPrimaryTopicId).toBeNull();
  });

  it('quita el tema aunque solo estuviera en session_topic_ids', () => {
    const plan = planUnlinkRecordedWorkshopFromTopic(
      workshop({
        id: 'w1',
        topic_id: 'bienvenido-al-curso',
        clinical_case_json: {
          session_topic_ids: ['bienvenido-al-curso', 'intro-neurodiagnostics'],
        },
      }),
      'intro-neurodiagnostics',
    );
    expect(plan.remainingTopicIds).toEqual(['bienvenido-al-curso']);
    expect(plan.nextPrimaryTopicId).toBe('bienvenido-al-curso');
  });
});
