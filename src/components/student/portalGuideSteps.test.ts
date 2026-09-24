import { describe, expect, it } from 'vitest';
import { getPortalGuideSteps } from './portalGuideSteps';

describe('portalGuideSteps', () => {
  it('returns exactly 5 steps', () => {
    const steps = getPortalGuideSteps('active');
    expect(steps).toHaveLength(5);
    expect(steps.map((s) => s.id)).toEqual(['mapa', 'clases', 'curso', 'evaluacion', 'talleres']);
  });

  it('adjusts step 3 for active course state', () => {
    const steps = getPortalGuideSteps('active');
    const step3 = steps.find((s) => s.id === 'curso')!;
    expect(step3.title).toBe('Tu curso ya está activo');
    expect(step3.body).toContain('Activo / Cursando');
  });

  it('adjusts step 3 for pending course state', () => {
    const steps = getPortalGuideSteps('pending');
    const step3 = steps.find((s) => s.id === 'curso')!;
    expect(step3.title).toBe('Tu solicitud de curso está en revisión');
    expect(step3.body).toContain('En lista de espera');
  });

  it('adjusts step 3 for none course state', () => {
    const steps = getPortalGuideSteps('none');
    const step3 = steps.find((s) => s.id === 'curso')!;
    expect(step3.title).toBe('Primero solicita el curso');
    expect(step3.body).toContain('Solicitar admisión');
  });

  it('includes exact rubric weights (30, 30, 20, 20, 80) in evaluation step', () => {
    const steps = getPortalGuideSteps('active');
    const step4 = steps.find((s) => s.id === 'evaluacion')!;
    expect(step4.body).toContain('30');
    expect(step4.body).toContain('20');
    expect(step4.body).toContain('80');
    expect(step4.body).toContain('exámenes y quizzes teóricos');
    expect(step4.body).toContain('tareas y casos prácticos');
    expect(step4.body).toContain('asistencia a clases y talleres');
    expect(step4.body).toContain('avance curricular en la plataforma');
  });

  it('clarifies in step 5 that an empty workshop list is normal', () => {
    const steps = getPortalGuideSteps('active');
    const step5 = steps.find((s) => s.id === 'talleres')!;
    expect(step5.body).toContain('no hay sesión, es normal');
  });

  it('enforces maximum detail items constraint', () => {
    ['active', 'pending', 'none'].forEach((state) => {
      const steps = getPortalGuideSteps(state as any);
      steps.forEach((step) => {
        if (step.id === 'mapa') {
          expect(step.detail?.length ?? 0).toBeLessThanOrEqual(4);
        } else {
          expect(step.detail?.length ?? 0).toBeLessThanOrEqual(3);
        }
      });
    });
  });
});
