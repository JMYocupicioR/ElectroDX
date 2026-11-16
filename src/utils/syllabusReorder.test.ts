import { describe, expect, it } from 'vitest';
import {
  buildModuleReorderProposal,
  buildTopicReorderProposal,
  describePlacement,
} from './syllabusReorder';
import type { SyllabusTopicOverride } from '../types/database';

describe('syllabusReorder', () => {
  describe('describePlacement', () => {
    const items = [
      { id: 'a', title: 'Primero' },
      { id: 'b', title: 'Segundo' },
      { id: 'c', title: 'Tercero' },
      { id: 'd', title: 'Cuarto' },
    ];

    it('returns empty string for single-item lists', () => {
      expect(describePlacement([{ id: 'only', title: 'Único' }], 0, 0, (x) => x.title)).toBe('');
    });

    it('describes moving to the beginning or end', () => {
      const movedFirst = [items[2], items[0], items[1], items[3]];
      expect(describePlacement(movedFirst, 2, 0, (x) => x.title)).toBe(
        'al inicio, antes de «Primero»'
      );

      const movedLast = [items[0], items[2], items[3], items[1]];
      expect(describePlacement(movedLast, 1, 3, (x) => x.title)).toBe(
        'al final, después de «Cuarto»'
      );
    });

    it('describes moving backward or forward inside the list', () => {
      const movedUp = [items[0], items[2], items[1], items[3]];
      expect(describePlacement(movedUp, 2, 1, (x) => x.title)).toBe('antes de «Segundo»');

      const movedDown = [items[0], items[2], items[1], items[3]];
      expect(describePlacement(movedDown, 1, 2, (x) => x.title)).toBe('después de «Tercero»');
    });
  });

  describe('buildModuleReorderProposal', () => {
    const modules = [
      { id: 'm1', title: 'Fundamentos' },
      { id: 'm2', title: 'Seguridad' },
      { id: 'm3', title: 'Conducción Nerviosa' },
    ];

    it('returns null when indices are equal or out of range', () => {
      expect(
        buildModuleReorderProposal({
          courseId: 'principiante',
          courseTitle: 'Nivel 1',
          modules,
          fromIndex: 1,
          toIndex: 1,
          source: 'temario-flechas',
        })
      ).toBeNull();
      expect(
        buildModuleReorderProposal({
          courseId: 'principiante',
          courseTitle: 'Nivel 1',
          modules,
          fromIndex: 0,
          toIndex: -1,
          source: 'temario-flechas',
        })
      ).toBeNull();
      expect(
        buildModuleReorderProposal({
          courseId: 'principiante',
          courseTitle: 'Nivel 1',
          modules,
          fromIndex: 0,
          toIndex: 3,
          source: 'temario-salto',
        })
      ).toBeNull();
    });

    it('creates a confirmation payload with previous and proposed module sequences', () => {
      const proposal = buildModuleReorderProposal({
        courseId: 'principiante',
        courseTitle: 'Nivel 1',
        modules,
        fromIndex: 2,
        toIndex: 0,
        source: 'sidebar-drag',
        impacts: {
          isHidden: false,
          openTopicsInModuleCount: 2,
        },
      });

      expect(proposal).not.toBeNull();
      expect(proposal?.entityType).toBe('modulo');
      expect(proposal?.itemTitle).toBe('Conducción Nerviosa');
      expect(proposal?.oldPosition).toBe(3);
      expect(proposal?.newPosition).toBe(1);
      expect(proposal?.totalItems).toBe(3);
      expect(proposal?.orderedModuleIds).toEqual(['m3', 'm1', 'm2']);
      expect(proposal?.previousModuleIds).toEqual(['m1', 'm2', 'm3']);
      expect(proposal?.placementDescription).toBe('al inicio, antes de «Fundamentos»');
      expect(proposal?.impacts.openTopicsInModuleCount).toBe(2);
    });
  });

  describe('buildTopicReorderProposal', () => {
    const siblings = [
      { id: 't1', title: 'Potencial de reposo' },
      { id: 't2', title: 'Despolarización' },
      { id: 't3', title: 'Periodo refractario' },
    ];
    const overrides: SyllabusTopicOverride[] = [
      { module_id: 'fundamentals', topic_id: 't1', sort_order: 0, is_visible: true },
      { module_id: 'fundamentals', topic_id: 't2', sort_order: 1, is_visible: false },
      { module_id: 'fundamentals', topic_id: 't3', sort_order: 2, is_visible: true },
    ];

    it('preserves hidden visibility flags while reindexing sort_order on topic jump', () => {
      const proposal = buildTopicReorderProposal({
        moduleId: 'fundamentals',
        containerTitle: 'Fundamentos',
        siblings,
        overrides,
        fromIndex: 0,
        toIndex: 2,
        entityType: 'tema',
        source: 'temario-salto',
        impacts: {
          isOpenToRegistration: true,
          hasScheduledDate: true,
          scheduledDateLabel: '12 abr 2026',
        },
      });

      expect(proposal).not.toBeNull();
      expect(proposal?.entityType).toBe('tema');
      expect(proposal?.oldPosition).toBe(1);
      expect(proposal?.newPosition).toBe(3);
      expect(proposal?.successMessage).toBe('Orden de temas actualizado.');
      expect(proposal?.topicOverrideInputs).toEqual([
        { topic_id: 't2', sort_order: 0, is_visible: false },
        { topic_id: 't3', sort_order: 1, is_visible: true },
        { topic_id: 't1', sort_order: 2, is_visible: true },
      ]);
      expect(proposal?.previousTopicOverrideInputs).toEqual([
        { topic_id: 't1', sort_order: 0, is_visible: true },
        { topic_id: 't2', sort_order: 1, is_visible: false },
        { topic_id: 't3', sort_order: 2, is_visible: true },
      ]);
    });

    it('handles subtema moves and returns subtema success copy', () => {
      const proposal = buildTopicReorderProposal({
        moduleId: 'fundamentals',
        containerTitle: 'Potencial de acción',
        siblings,
        overrides: [],
        fromIndex: 1,
        toIndex: 0,
        entityType: 'subtema',
        source: 'drawer-flechas',
      });

      expect(proposal?.entityType).toBe('subtema');
      expect(proposal?.successMessage).toBe('Orden de subtemas actualizado.');
      expect(proposal?.placementDescription).toBe('al inicio, antes de «Potencial de reposo»');
    });
  });
});
