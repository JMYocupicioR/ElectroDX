import { describe, expect, it } from 'vitest';
import { extractValidUuid, isValidUuid, sanitizeActionUrl } from './uuidUtils';

describe('uuidUtils', () => {
  const valid = 'e12d34da-6310-4f2d-8c5b-cfd311d999dd';
  const concatenated = 'e12d34da-6310-4f2d-8c5b-cfd311d999dd635-4543-a133-5fc98e12c742';

  describe('isValidUuid', () => {
    it('valida UUIDs estándar en minúsculas y mayúsculas', () => {
      expect(isValidUuid(valid)).toBe(true);
      expect(isValidUuid(valid.toUpperCase())).toBe(true);
    });

    it('rechaza cadenas inválidas o concatenadas', () => {
      expect(isValidUuid(concatenated)).toBe(false);
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid(null)).toBe(false);
      expect(isValidUuid(undefined)).toBe(false);
    });
  });

  describe('extractValidUuid', () => {
    it('extrae el UUID limpio de una cadena concatenada o con texto', () => {
      expect(extractValidUuid(concatenated)).toBe(valid);
      expect(extractValidUuid(`/taller/${valid}/details`)).toBe(valid);
    });

    it('retorna null si no hay UUID', () => {
      expect(extractValidUuid('texto-sin-id')).toBeNull();
      expect(extractValidUuid(null)).toBeNull();
    });
  });

  describe('sanitizeActionUrl', () => {
    it('corrige URLs de taller malformadas o concatenadas', () => {
      expect(sanitizeActionUrl(`/taller/${concatenated}`)).toBe(`/taller/${valid}`);
    });

    it('redirige a /talleres si la ruta de taller no contiene UUID válido', () => {
      expect(sanitizeActionUrl('/taller/invalido')).toBe('/talleres');
    });

    it('conserva rutas normales y les asegura prefijo /', () => {
      expect(sanitizeActionUrl('portal?tab=assignments')).toBe('/portal?tab=assignments');
      expect(sanitizeActionUrl('/biblioteca')).toBe('/biblioteca');
    });

    it('retorna fallback para valores vacíos o nulos', () => {
      expect(sanitizeActionUrl('')).toBe('/portal');
      expect(sanitizeActionUrl(null)).toBe('/portal');
    });
  });
});

