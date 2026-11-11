import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AdminScholarshipsPage from './AdminScholarshipsPage';
import CreateEditCouponModal from './CreateEditCouponModal';
import CouponRedemptionsModal from './CouponRedemptionsModal';
import type { ScholarshipCoupon } from '../../../types/scholarship';

vi.mock('../../../contexts/AuthProvider', () => ({
  useAuth: () => ({
    isAdmin: true,
    isEditor: false,
    user: { id: 'admin-1', email: 'admin@electrodx.com' },
    profile: { display_name: 'Dr. Administrador Titular' },
  }),
}));

// Mock localStorage para node
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

describe('AdminScholarshipsPage & Modals SSR Render', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renderiza el panel de becas y cupones con sus métricas y elementos estructurales', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AdminScholarshipsPage />
      </MemoryRouter>
    );

    expect(html).toContain('Becas y Cupones de Ingreso');
    expect(html).toContain('Crear Cupón de Beca');
    expect(html).toContain('Cupones creados');
    expect(html).toContain('Becas otorgadas');
    expect(html).toContain('Becas del 100%');
    expect(html).toContain('Becas parciales');
  });

  it('renderiza CreateEditCouponModal en modo creación', () => {
    const html = renderToStaticMarkup(
      <CreateEditCouponModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        courses={[]}
      />
    );

    expect(html).toContain('Configurar Código y Reglas');
    expect(html).toContain('Código del cupón');
    expect(html).toContain('Porcentaje de beca (% descuento)');
    expect(html).toContain('Límite de cupos (Usos)');
    expect(html).toContain('Aprobación Inmediata Automática (Auto-admit)');
  });

  it('renderiza CreateEditCouponModal en modo edición de cupón existente', () => {
    const sampleCoupon: ScholarshipCoupon = {
      id: 'coupon-edit-1',
      code: 'IMSS-RESIDENTE-100',
      discount_percent: 100,
      description: 'Beca completa para hospital IMSS',
      course_id: null,
      max_uses: 10,
      used_count: 2,
      starts_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      auto_admit: false,
      requires_cedula_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <CreateEditCouponModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        couponToEdit={sampleCoupon}
        courses={[]}
      />
    );

    expect(html).toContain('Configuración: IMSS-RESIDENTE-100');
    expect(html).toContain('Actualizar Beca');
  });

  it('renderiza CreateEditCouponModal para un Profesor con N/A de beca y remuneración económica', () => {
    const teacherCoupon: ScholarshipCoupon = {
      id: 'coupon-docente-1',
      code: 'VIP-DOCENTE-100',
      discount_percent: 100,
      description: 'Acceso Docente Invitado',
      course_id: null,
      max_uses: 5,
      used_count: 1,
      starts_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      auto_admit: true,
      requires_cedula_verified: false,
      account_type: 'teacher',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <CreateEditCouponModal
        isOpen={true}
        onClose={() => {}}
        onSuccess={() => {}}
        couponToEdit={teacherCoupon}
        courses={[]}
      />
    );

    expect(html).toContain('Configuración: VIP-DOCENTE-100');
    expect(html).toContain('N/A (No aplica)');
    expect(html).toContain('remuneración económica');
    expect(html).toContain('Actualizar Código Docente');
    expect(html).toContain('Acceso Fast-Track Docente Inmediato (Auto-admit)');
  });

  it('renderiza CouponRedemptionsModal correctamente para alumnos y docentes', () => {
    const sampleCoupon: ScholarshipCoupon = {
      id: 'coupon-sample',
      code: 'COMEFYR-50',
      discount_percent: 50,
      description: 'Convenio socios',
      course_id: null,
      max_uses: 20,
      used_count: 0,
      starts_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      auto_admit: false,
      requires_cedula_verified: false,
      account_type: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const studentHtml = renderToStaticMarkup(
      <CouponRedemptionsModal
        isOpen={true}
        onClose={() => {}}
        coupon={sampleCoupon}
      />
    );

    expect(studentHtml).toContain('Médicos Beneficiarios');
    expect(studentHtml).toContain('COMEFYR-50');
    expect(studentHtml).toContain('Beca 50%');

    const teacherCoupon: ScholarshipCoupon = {
      ...sampleCoupon,
      code: 'VIP-DOCENTE-100',
      discount_percent: 100,
      account_type: 'teacher',
    };

    const teacherHtml = renderToStaticMarkup(
      <CouponRedemptionsModal
        isOpen={true}
        onClose={() => {}}
        coupon={teacherCoupon}
      />
    );

    expect(teacherHtml).toContain('VIP-DOCENTE-100');
    expect(teacherHtml).toContain('Acceso Docente (N/A Beca)');
  });
});
