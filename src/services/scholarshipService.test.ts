import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../lib/supabase', () => ({
  sb: {
    from: () => ({ select: () => Promise.resolve({ data: null, error: new Error('mock-offline') }) }),
    rpc: () => Promise.resolve({ data: null, error: new Error('mock-offline') }),
  },
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: null, error: new Error('mock-offline') }),
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error('mock-offline') }),
  },
  isSupabaseConfigured: false,
}));

import {
  getScholarshipCoupons,
  saveScholarshipCoupon,
  toggleCouponStatus,
  deleteScholarshipCoupon,
  validateScholarshipCoupon,
} from './scholarshipService';
import type { CourseId } from '../types/database';

// Mock localStorage para vitest
const storageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    storageStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete storageStore[key];
  },
  clear: () => {
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
    }
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

describe('scholarshipService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('retorna cupones de prueba por defecto cuando no hay datos', async () => {
    const coupons = await getScholarshipCoupons();
    expect(coupons.length).toBeGreaterThan(0);
    expect(coupons.some((c) => c.code === 'RESIDENCIA-100')).toBe(true);
    expect(coupons.some((c) => c.code === 'COMEFYR-50')).toBe(true);
  });

  it('permite crear un nuevo cupón y recuperarlo', async () => {
    const created = await saveScholarshipCoupon({
      code: 'HOSPITAL-GENERAL-75',
      discount_percent: 75,
      description: 'Beca Residentes HG',
      max_uses: 15,
      course_id: 'emg_avanzado' as CourseId,
    });

    expect(created.code).toBe('HOSPITAL-GENERAL-75');
    expect(created.discount_percent).toBe(75);
    expect(created.max_uses).toBe(15);

    const all = await getScholarshipCoupons();
    expect(all.some((c) => c.code === 'HOSPITAL-GENERAL-75')).toBe(true);
  });

  it('permite pausar y reactivar un cupón', async () => {
    const created = await saveScholarshipCoupon({
      code: 'PAUSA-TEST',
      discount_percent: 50,
    });

    await toggleCouponStatus(created.id, false);
    let all = await getScholarshipCoupons();
    let found = all.find((c) => c.id === created.id);
    expect(found?.is_active).toBe(false);

    await toggleCouponStatus(created.id, true);
    all = await getScholarshipCoupons();
    found = all.find((c) => c.id === created.id);
    expect(found?.is_active).toBe(true);
  });

  it('permite eliminar un cupón', async () => {
    const created = await saveScholarshipCoupon({
      code: 'BORRAR-ME',
      discount_percent: 50,
    });

    await deleteScholarshipCoupon(created.id);
    const all = await getScholarshipCoupons();
    expect(all.some((c) => c.id === created.id)).toBe(false);
  });

  describe('validateScholarshipCoupon', () => {
    it('valida exitosamente un cupón vigente', async () => {
      const res = await validateScholarshipCoupon('RESIDENCIA-100', 'emg_basico' as CourseId);
      expect(res.valid).toBe(true);
      expect(res.discount_percent).toBe(100);
      expect(res.auto_admit).toBe(false);
    });

    it('rechaza código inexistente', async () => {
      const res = await validateScholarshipCoupon('NO-EXISTE', 'emg_basico' as CourseId);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/no existe/i);
    });

    it('rechaza cupón inactivo', async () => {
      const created = await saveScholarshipCoupon({
        code: 'INACTIVO-100',
        discount_percent: 100,
        is_active: false,
      });

      const res = await validateScholarshipCoupon(created.code, 'emg_basico' as CourseId);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/inactivo|pausado/i);
    });

    it('rechaza cupón vencido', async () => {
      const created = await saveScholarshipCoupon({
        code: 'VENCIDO-50',
        discount_percent: 50,
        expires_at: new Date(Date.now() - 100000).toISOString(),
      });

      const res = await validateScholarshipCoupon(created.code, 'emg_basico' as CourseId);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/vencido/i);
    });

    it('rechaza cupón cuyo curso no coincide', async () => {
      const created = await saveScholarshipCoupon({
        code: 'SOLO-AVANZADO',
        discount_percent: 50,
        course_id: 'emg_avanzado' as CourseId,
      });

      const res = await validateScholarshipCoupon(created.code, 'emg_basico' as CourseId);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/no aplica para el programa/i);
    });
  });
});
