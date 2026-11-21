import { describe, expect, it } from 'vitest';
import {
  buildAtRiskMessageTemplates,
  buildStudentApplicantTemplates,
  buildWaitlistMessageTemplates,
  DIRECT_CHAT_MODULE_ID,
} from './directChatService';

describe('directChatService templates & helpers', () => {
  it('usa el identificador reservado __direct_chat__ para conversaciones privadas 1:1', () => {
    expect(DIRECT_CHAT_MODULE_ID).toBe('__direct_chat__');
  });

  it('incluye los motivos específicos de riesgo en las plantillas para alumnos en riesgo', () => {
    const templates = buildAtRiskMessageTemplates('Eduardo Martinez Villa', [
      'Lectura vencida: "Leer los temas restantes"',
    ]);
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates[0].text).toContain('Eduardo Martinez Villa');
    expect(templates[0].text).toContain('Lectura vencida: "Leer los temas restantes"');
  });

  it('genera plantillas de admisión para médicos en lista de espera o no aceptados', () => {
    const pendingTemplates = buildWaitlistMessageTemplates('Brandon Lul Flores Velasquez', {
      courseTitle: 'Nivel 1',
      isProfilePending: true,
    });
    expect(pendingTemplates.length).toBeGreaterThanOrEqual(3);
    expect(pendingTemplates[0].text).toContain('Brandon Lul Flores Velasquez');
    expect(pendingTemplates[0].text).toContain('Nivel 1');

    const rejectedTemplates = buildWaitlistMessageTemplates('Brandon Lul Flores Velasquez', {
      courseTitle: 'Nivel 1',
      isRejected: true,
    });
    expect(rejectedTemplates.length).toBeGreaterThanOrEqual(2);
    expect(rejectedTemplates[0].text).toContain('Brandon Lul Flores Velasquez');
  });

  it('genera plantillas rápidas para el aspirante desde la pantalla de espera de aprobación', () => {
    const applicantTemplates = buildStudentApplicantTemplates('Curso Avanzado de Electrodiagnóstico');
    expect(applicantTemplates.length).toBeGreaterThanOrEqual(3);
    expect(applicantTemplates[0].text).toContain('Curso Avanzado de Electrodiagnóstico');
  });
});
