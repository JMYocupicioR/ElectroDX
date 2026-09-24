import { describe, it, expect } from 'vitest';
import { resolveBackTarget } from './useGoBack';

describe('resolveBackTarget', () => {
  it('prioritizes stateFrom when valid internal path', () => {
    const target = resolveBackTarget({
      stateFrom: '/modulo/01-fundamentos/tema-1',
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
    });

    expect(target).toEqual({
      type: 'navigate',
      path: '/modulo/01-fundamentos/tema-1',
    });
  });

  it('ignores stateFrom if it matches current pathname (prevents loop)', () => {
    const target = resolveBackTarget({
      stateFrom: '/colaborador/cuestionario',
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
      historyIdx: 2,
    });

    expect(target).toEqual({
      type: 'back',
    });
  });

  it('uses search param from if stateFrom is absent', () => {
    const target = resolveBackTarget({
      search: '?from=/admin/revisiones',
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
    });

    expect(target).toEqual({
      type: 'navigate',
      path: '/admin/revisiones',
    });
  });

  it('uses back action when historyIdx > 0 and no explicit from override', () => {
    const target = resolveBackTarget({
      historyIdx: 3,
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
    });

    expect(target).toEqual({
      type: 'back',
    });
  });

  it('uses back action when hasReferrer is true', () => {
    const target = resolveBackTarget({
      hasReferrer: true,
      historyIdx: 0,
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
    });

    expect(target).toEqual({
      type: 'back',
    });
  });

  it('uses fallback when historyIdx is 0 or absent and no referrer/from', () => {
    const target = resolveBackTarget({
      historyIdx: 0,
      hasReferrer: false,
      currentPathname: '/colaborador/cuestionario',
      fallback: '/colaborador',
    });

    expect(target).toEqual({
      type: 'navigate',
      path: '/colaborador',
    });
  });
});
