import { describe, it, expect } from 'vitest';
import {
  parsePriceAmount,
  formatCurrencyMx,
  calculateScholarshipPricing,
} from './scholarshipPricing';

describe('scholarshipPricing utils', () => {
  describe('parsePriceAmount', () => {
    it('extrae número de "$12,000 MXN"', () => {
      expect(parsePriceAmount('$12,000 MXN')).toBe(12000);
    });

    it('extrae número sin comas "$6000"', () => {
      expect(parsePriceAmount('$6000')).toBe(6000);
    });

    it('extrae número con decimales "$1,250.50 MXN"', () => {
      expect(parsePriceAmount('$1,250.50 MXN')).toBe(1250.5);
    });

    it('retorna null para valores no numéricos como "Consultar" o cadenas vacías', () => {
      expect(parsePriceAmount('Consultar')).toBeNull();
      expect(parsePriceAmount('')).toBeNull();
      expect(parsePriceAmount(null)).toBeNull();
      expect(parsePriceAmount(undefined)).toBeNull();
    });
  });

  describe('formatCurrencyMx', () => {
    it('formatea correctamente a formato moneda mexicana', () => {
      expect(formatCurrencyMx(12000)).toBe('$12,000 MXN');
      expect(formatCurrencyMx(6000)).toBe('$6,000 MXN');
      expect(formatCurrencyMx(0)).toBe('$0 MXN');
    });
  });

  describe('calculateScholarshipPricing', () => {
    it('calcula beca del 50% sobre $12,000 MXN', () => {
      const summary = calculateScholarshipPricing('$12,000 MXN', 50);
      expect(summary.hasNumericPrice).toBe(true);
      expect(summary.originalAmount).toBe(12000);
      expect(summary.discountAmount).toBe(6000);
      expect(summary.finalAmount).toBe(6000);
      expect(summary.formattedOriginal).toBe('$12,000 MXN');
      expect(summary.formattedDiscount).toBe('-$6,000 MXN (50%)');
      expect(summary.formattedFinal).toBe('$6,000 MXN');
      expect(summary.isFree).toBe(false);
    });

    it('calcula beca total del 100% sobre $12,000 MXN', () => {
      const summary = calculateScholarshipPricing('$12,000 MXN', 100);
      expect(summary.hasNumericPrice).toBe(true);
      expect(summary.originalAmount).toBe(12000);
      expect(summary.discountAmount).toBe(12000);
      expect(summary.finalAmount).toBe(0);
      expect(summary.formattedFinal).toBe('$0 MXN (Beca 100%)');
      expect(summary.isFree).toBe(true);
    });

    it('calcula beca del 75% sobre $8,000 MXN', () => {
      const summary = calculateScholarshipPricing('$8,000 MXN', 75);
      expect(summary.discountAmount).toBe(6000);
      expect(summary.finalAmount).toBe(2000);
      expect(summary.formattedFinal).toBe('$2,000 MXN');
      expect(summary.isFree).toBe(false);
    });

    it('maneja precios no numéricos ("Consultar")', () => {
      const partial = calculateScholarshipPricing('Consultar', 50);
      expect(partial.hasNumericPrice).toBe(false);
      expect(partial.isFree).toBe(false);
      expect(partial.formattedOriginal).toBe('Consultar');
      expect(partial.formattedFinal).toBe('Beca del 50% aplicada');

      const full = calculateScholarshipPricing('Consultar', 100);
      expect(full.hasNumericPrice).toBe(false);
      expect(full.isFree).toBe(true);
      expect(full.formattedFinal).toBe('Exención total (Beca 100%)');
    });

    it('limita el descuento entre 1% y 100%', () => {
      const over = calculateScholarshipPricing('$10,000', 150);
      expect(over.discountPercent).toBe(100);
      expect(over.isFree).toBe(true);

      const under = calculateScholarshipPricing('$10,000', -10);
      expect(under.discountPercent).toBe(1);
    });
  });
});

