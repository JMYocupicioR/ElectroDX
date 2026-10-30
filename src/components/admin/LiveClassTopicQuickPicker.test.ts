import { describe, expect, it } from 'vitest';
import type { Module } from '../../types/content';
import {
  buildLiveClassTopicCatalog,
  coveredLiveClassTopicIds,
  groupSelectedLiveClassTopics,
  sessionTopicIdsForLiveClass,
  topicIdsIncludedBySelection,
} from './LiveClassTopicQuickPicker';

const modules = [
  {
    id: 'm1',
    title: 'Fundamentos',
    topics: [
      {
        id: 'bases',
        title: 'Bases de Electricidad y Electrónica',
        children: [
          { id: 'voltaje', title: 'Principios de electricidad' },
          {
            id: 'filtros',
            title: 'Filtros',
            children: [{ id: 'notch', title: 'Filtro notch' }],
          },
        ],
      },
      { id: 'neuro', title: 'Neuroanatomía Funcional' },
    ],
  },
] as Module[];

describe('selección de temas para la clase en vivo', () => {
  const catalog = buildLiveClassTopicCatalog(modules);

  it('marca el tema general y todos sus subtemas, incluidos los anidados', () => {
    expect(topicIdsIncludedBySelection(catalog, 'bases')).toEqual([
      'bases',
      'voltaje',
      'filtros',
      'notch',
    ]);
  });

  it('un subtema suelto no arrastra a sus hermanos', () => {
    expect(topicIdsIncludedBySelection(catalog, 'voltaje')).toEqual(['voltaje']);
  });

  it('un subtema con hijos arrastra solo su propia rama', () => {
    expect(topicIdsIncludedBySelection(catalog, 'filtros')).toEqual(['filtros', 'notch']);
  });

  it('oculta el tema principal, sus subtemas y lo que ya se sumó a la clase', () => {
    const covered = coveredLiveClassTopicIds(catalog, 'neuro', ['bases']);
    expect(covered.has('neuro')).toBe(true);
    expect(covered.has('bases')).toBe(true);
    expect(covered.has('voltaje')).toBe(true);
    expect(covered.has('filtros')).toBe(true);
    expect(covered.has('notch')).toBe(true);
  });

  it('agrupa el tema general con los subtemas ya elegidos', () => {
    const groups = groupSelectedLiveClassTopics(catalog, ['bases', 'voltaje', 'filtros', 'notch']);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.entry.topicId).toBe('bases');
    expect(groups[0]?.children.map((child) => child.topicId)).toEqual([
      'voltaje',
      'filtros',
      'notch',
    ]);
    expect(groups[0]?.removeIds).toEqual(['bases', 'voltaje', 'filtros', 'notch']);
  });

  it('el tema principal arrastra sus subtemas aunque no se hayan marcado aparte', () => {
    expect(sessionTopicIdsForLiveClass(catalog, 'bases', ['neuro'])).toEqual([
      'bases',
      'voltaje',
      'filtros',
      'notch',
      'neuro',
    ]);
  });

  it('un extra suelto no arrastra a sus hermanos', () => {
    expect(sessionTopicIdsForLiveClass(catalog, 'neuro', ['voltaje'])).toEqual([
      'neuro',
      'voltaje',
    ]);
  });

  it('en un corte el tema general no cubre sus subtemas', () => {
    const covered = coveredLiveClassTopicIds(catalog, '', ['bases'], false);
    expect(covered.has('bases')).toBe(true);
    expect(covered.has('voltaje')).toBe(false);
    expect(covered.has('filtros')).toBe(false);
  });
});
