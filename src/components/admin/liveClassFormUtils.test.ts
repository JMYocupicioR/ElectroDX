import { describe, expect, it } from 'vitest';
import {
  composeClassDescription,
  splitDateTimeLocalInput,
  splitStoredDescription,
} from './liveClassFormUtils';

describe('datos de la clase en vivo', () => {
  it('separa la sede guardada en la descripción', () => {
    expect(
      splitStoredDescription('Repaso de aguja\n\n📍 Ubicación: Aula 2'),
    ).toEqual({
      description: 'Repaso de aguja',
      location: 'Aula 2',
    });
  });

  it('solo agrega la sede cuando la clase es presencial', () => {
    expect(composeClassDescription('Temario', 'Laboratorio', 'in_person')).toBe(
      'Temario\n\n📍 Ubicación: Laboratorio',
    );
    expect(composeClassDescription('Temario', 'Laboratorio', 'online')).toBe('Temario');
  });

  it('lee la hora de pared de un datetime-local sin recorrer la zona', () => {
    expect(splitDateTimeLocalInput('2026-11-02T20:00')).toEqual({
      date: '2026-11-02',
      time: '20:00',
    });
  });
});
