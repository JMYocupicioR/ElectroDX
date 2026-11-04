import { supabase, sb, isSupabaseConfigured } from '../lib/supabase';
import type {
  ScholarshipCoupon,
  ScholarshipCouponInput,
  CouponRedemption,
  CouponValidationResult,
} from '../types/scholarship';
import type { CourseId } from '../types/database';

const STORAGE_KEY_COUPONS = 'electrodx_scholarship_coupons_v2';
const STORAGE_KEY_REDEMPTIONS = 'electrodx_coupon_redemptions_v1';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  } catch {
    // Ignore restricted environments
  }
  return null;
}

const DEFAULT_SEED_COUPONS: ScholarshipCoupon[] = [
  {
    id: 'seed-beca-100-residencia',
    code: 'RESIDENCIA-100',
    discount_percent: 100,
    description: 'Beca de Excelencia para Médicos Residentes (Exención total)',
    course_id: null,
    max_uses: 20,
    used_count: 0,
    starts_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 180 * 86400000).toISOString(),
    is_active: true,
    auto_admit: false, // Requiere visto bueno del profesor en lista de espera
    requires_cedula_verified: false,
    account_type: 'student',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-beca-50-comefyr',
    code: 'COMEFYR-50',
    discount_percent: 50,
    description: 'Convenio Especial Miembros COMEFYR / Sociedades Médicas',
    course_id: null,
    max_uses: 30,
    used_count: 0,
    starts_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
    is_active: true,
    auto_admit: false,
    requires_cedula_verified: true,
    account_type: 'student',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-beca-100-profesor',
    code: 'VIP-DOCENTE-100',
    discount_percent: 100,
    description: 'Acceso Fast-Track Inmediato para Profesores Invitados y Ponentes',
    course_id: null,
    max_uses: 10,
    used_count: 0,
    starts_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    expires_at: null,
    is_active: true,
    auto_admit: true,
    requires_cedula_verified: false,
    account_type: 'teacher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getLocalCoupons(): ScholarshipCoupon[] {
  const storage = getStorage();
  if (!storage) return DEFAULT_SEED_COUPONS;
  try {
    const raw = storage.getItem(STORAGE_KEY_COUPONS);
    if (!raw) {
      storage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(DEFAULT_SEED_COUPONS));
      return DEFAULT_SEED_COUPONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEED_COUPONS;
  } catch {
    return DEFAULT_SEED_COUPONS;
  }
}

function saveLocalCoupons(coupons: ScholarshipCoupon[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
  } catch (err) {
    console.warn('[scholarshipService] Error al guardar en localStorage:', err);
  }
}

function getLocalRedemptions(): CouponRedemption[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY_REDEMPTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRedemptions(list: CouponRedemption[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_REDEMPTIONS, JSON.stringify(list));
  } catch (err) {
    console.warn('[scholarshipService] Error al guardar redenciones locales:', err);
  }
}

/**
 * Obtiene la lista completa de cupones de beca (Panel de Administrador).
 */
export async function getScholarshipCoupons(): Promise<ScholarshipCoupon[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('scholarship_coupons' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        saveLocalCoupons(data as unknown as ScholarshipCoupon[]);
        return data as unknown as ScholarshipCoupon[];
      }
    } catch (err) {
      console.warn('[scholarshipService] Fallback a local storage al consultar cupones:', err);
    }
  }

  return getLocalCoupons();
}

/**
 * Crea o actualiza un cupón de beca con sus reglas de negocio.
 */
export async function saveScholarshipCoupon(
  input: ScholarshipCouponInput
): Promise<ScholarshipCoupon> {
  const cleanCode = input.code.trim().toUpperCase();
  const clampedPercent = Math.max(1, Math.min(100, Math.round(input.discount_percent)));

  if (!cleanCode) {
    throw new Error('El código de cupón no puede estar vacío.');
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await sb.rpc('admin_save_scholarship_coupon' as any, {
        p_id: input.id || null,
        p_code: cleanCode,
        p_discount_percent: clampedPercent,
        p_description: input.description?.trim() || null,
        p_course_id: input.course_id || null,
        p_max_uses: input.max_uses ?? null,
        p_starts_at: input.starts_at || new Date().toISOString(),
        p_expires_at: input.expires_at || null,
        p_is_active: input.is_active ?? true,
        p_auto_admit: input.auto_admit ?? false,
        p_requires_cedula_verified: input.requires_cedula_verified ?? false,
        p_account_type: input.account_type || (cleanCode.includes('DOCENTE') ? 'teacher' : 'student'),
      });

      if (!error && data) {
        return data as unknown as ScholarshipCoupon;
      }
    } catch (err) {
      console.warn('[scholarshipService] Error en RPC admin_save_scholarship_coupon, usando fallback:', err);
    }
  }

  // Fallback local
  const current = getLocalCoupons();
  const now = new Date().toISOString();

  if (input.id) {
    const idx = current.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      const updated: ScholarshipCoupon = {
        ...current[idx],
        code: cleanCode,
        discount_percent: clampedPercent,
        description: input.description?.trim() || null,
        course_id: input.course_id || null,
        max_uses: input.max_uses ?? null,
        starts_at: input.starts_at || current[idx].starts_at,
        expires_at: input.expires_at || null,
        is_active: input.is_active ?? current[idx].is_active,
        auto_admit: input.auto_admit ?? current[idx].auto_admit,
        requires_cedula_verified: input.requires_cedula_verified ?? current[idx].requires_cedula_verified,
        account_type: input.account_type ?? current[idx].account_type ?? 'student',
        updated_at: now,
      };
      current[idx] = updated;
      saveLocalCoupons(current);
      return updated;
    }
  }

  // Comprobar colisión de código en local
  if (current.some((c) => c.code.toUpperCase() === cleanCode && c.id !== input.id)) {
    throw new Error(`El código de cupón "${cleanCode}" ya existe. Elige uno diferente.`);
  }

  const created: ScholarshipCoupon = {
    id: input.id || `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code: cleanCode,
    discount_percent: clampedPercent,
    description: input.description?.trim() || null,
    course_id: input.course_id || null,
    max_uses: input.max_uses ?? null,
    used_count: 0,
    starts_at: input.starts_at || now,
    expires_at: input.expires_at || null,
    is_active: input.is_active ?? true,
    auto_admit: input.auto_admit ?? false,
    requires_cedula_verified: input.requires_cedula_verified ?? false,
    account_type: input.account_type || (cleanCode.includes('DOCENTE') ? 'teacher' : 'student'),
    created_at: now,
    updated_at: now,
  };

  current.unshift(created);
  saveLocalCoupons(current);
  return created;
}

/**
 * Pausa o activa un cupón de beca.
 */
export async function toggleCouponStatus(couponId: string, isActive: boolean): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await sb.rpc('admin_toggle_coupon_status' as any, {
        p_coupon_id: couponId,
        p_is_active: isActive,
      });
      if (!error) return;
    } catch (err) {
      console.warn('[scholarshipService] Error al pausar/activar en RPC:', err);
    }
  }

  const current = getLocalCoupons();
  const idx = current.findIndex((c) => c.id === couponId);
  if (idx !== -1) {
    current[idx].is_active = isActive;
    current[idx].updated_at = new Date().toISOString();
    saveLocalCoupons(current);
  }
}

/**
 * Elimina un cupón de beca.
 */
export async function deleteScholarshipCoupon(couponId: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await sb.rpc('admin_delete_scholarship_coupon' as any, {
        p_coupon_id: couponId,
      });
      if (!error) return;
    } catch (err) {
      console.warn('[scholarshipService] Error al eliminar cupón en RPC:', err);
    }
  }

  const current = getLocalCoupons().filter((c) => c.id !== couponId);
  saveLocalCoupons(current);
}

/**
 * Consulta la lista de beneficiarios / redenciones de un cupón de beca.
 */
export async function getCouponRedemptions(couponId: string): Promise<CouponRedemption[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await sb.rpc('admin_get_coupon_redemptions' as any, {
        p_coupon_id: couponId,
      });
      if (!error && data) {
        return data as unknown as CouponRedemption[];
      }
    } catch (err) {
      console.warn('[scholarshipService] Error al consultar redenciones en RPC:', err);
    }
  }

  const localRedemptions = getLocalRedemptions().filter((r) => r.coupon_id === couponId);
  return localRedemptions;
}

/**
 * Valida un cupón de beca o invitación docente antes de aplicarlo en el formulario de admisión o registro.
 */
export async function validateScholarshipCoupon(
  code: string,
  courseId?: CourseId | null,
  isCedulaVerified?: boolean
): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Ingresa un código de beca o invitación.' };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await sb.rpc('validate_scholarship_coupon' as any, {
        p_code: cleanCode,
        p_course_id: courseId || null,
      });

      if (!error && data) {
        const res = data as any;
        return {
          valid: Boolean(res.valid),
          error: res.error,
          coupon_id: res.coupon_id,
          code: res.code,
          discount_percent: res.discount_percent,
          description: res.description,
          auto_admit: res.auto_admit,
          course_id: res.course_id,
          account_type: res.account_type || (res.code?.includes('DOCENTE') ? 'teacher' : 'student'),
          target_role_label: res.target_role_label,
        };
      }
    } catch (err) {
      console.warn('[scholarshipService] Fallback local para validación de cupón:', err);
    }
  }

  // Validación local
  const coupons = getLocalCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, error: 'El código ingresado no existe o fue escrito incorrectamente.' };
  }

  if (!coupon.is_active) {
    return { valid: false, error: 'Este código se encuentra temporalmente inactivo o pausado.' };
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: 'Este código aún no se encuentra vigente.' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'Este código de beca ha vencido.' };
  }

  if (courseId && coupon.course_id && coupon.course_id !== courseId) {
    return { valid: false, error: 'Este código de beca no aplica para el programa seleccionado.' };
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: 'El cupo asignado para este código se ha agotado.' };
  }

  if (coupon.requires_cedula_verified && !isCedulaVerified) {
    return {
      valid: false,
      error: 'Este código requiere que tu cédula profesional esté verificada previamente en tu perfil.',
    };
  }

  const isTeacher = coupon.account_type === 'teacher' || coupon.code.includes('DOCENTE');
  const targetLabel = isTeacher
    ? 'Cuenta de Profesor Invitado / Docente'
    : coupon.discount_percent === 100
    ? 'Alumno con Beca al 100% (Exención Total)'
    : `Alumno con Beca Parcial (${coupon.discount_percent}% Descuento)`;

  return {
    valid: true,
    coupon,
    coupon_id: coupon.id,
    code: coupon.code,
    discount_percent: coupon.discount_percent,
    description: coupon.description,
    auto_admit: coupon.auto_admit,
    course_id: coupon.course_id,
    account_type: isTeacher ? 'teacher' : 'student',
    target_role_label: targetLabel,
  };
}

/**
 * Aplica un cupón durante el registro de un nuevo usuario en la plataforma.
 */
export async function applyRegistrationCoupon(
  userId: string,
  couponCode: string
): Promise<{ success: boolean; message?: string; account_type?: string }> {
  const cleanCode = couponCode.trim().toUpperCase();
  if (!cleanCode || !userId) return { success: false, message: 'Parámetros inválidos' };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await sb.rpc('apply_registration_coupon' as any, {
        p_user_id: userId,
        p_coupon_code: cleanCode,
      });
      if (!error && data) {
        return data as any;
      }
    } catch (err) {
      console.warn('[scholarshipService] Error al aplicar cupón de registro en RPC:', err);
    }
  }

  // Local fallback
  const coupons = getLocalCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode);
  if (coupon) {
    coupon.used_count += 1;
    saveLocalCoupons(coupons);
    return { success: true, account_type: coupon.account_type || 'student' };
  }
  return { success: false, message: 'Cupón no encontrado' };
}
