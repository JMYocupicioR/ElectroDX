import { describe, expect, it } from 'vitest';
import type { Module } from '../../types/content';
import {
  buildLiveClassTopicCatalog,
  buildLiveClassTopicHref,
  coveredLiveClassTopicIds,
  groupSelectedLiveClassTopics,
  matchesTopicSearch,
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

  it('construye la ruta jerárquica al temario para temas raíz y subtemas anidados', () => {
    const rootEntry = catalog.find((e) => e.topicId === 'bases')!;
    const childEntry = catalog.find((e) => e.topicId === 'voltaje')!;
    const deepEntry = catalog.find((e) => e.topicId === 'notch')!;

    expect(buildLiveClassTopicHref(catalog, rootEntry)).toBe('/modulo/m1/bases');
    expect(buildLiveClassTopicHref(catalog, childEntry)).toBe('/modulo/m1/bases/voltaje');
    expect(buildLiveClassTopicHref(catalog, deepEntry)).toBe('/modulo/m1/bases/filtros/notch');
  });

  it('incluye temas publicados que no están en el temario estático', () => {
    const withPublished = buildLiveClassTopicCatalog([
      {
        ...modules[0],
        topics: [
          { id: 'bienvenido-al-curso', title: 'Bienvenido al curso' },
          ...modules[0].topics,
        ],
      },
    ] as Module[]);
    expect(withPublished.some((e) => e.topicId === 'bienvenido-al-curso')).toBe(true);
    expect(withPublished.find((e) => e.topicId === 'bienvenido-al-curso')?.title).toBe(
      'Bienvenido al curso',
    );
  });
});

describe('matchesTopicSearch', () => {
  it('encuentra Bienvenido con la consulta bienvenida', () => {
    expect(matchesTopicSearch('Bienvenido al curso', 'bienvenida')).toBe(true);
  });

  it('ignora acentos', () => {
    expect(matchesTopicSearch('Neuroanatomía Funcional', 'neuroanatomia')).toBe(true);
  });

  it('no coincide con temas ajenos', () => {
    expect(matchesTopicSearch('EMG de Fibra Única (SFEMG)', 'bienvenida')).toBe(false);
  });
});
