import type { CourseEnrollmentStatus, CourseId } from './database';

export type CouponAccountType = 'student' | 'teacher';

export interface ScholarshipCoupon {
  id: string;
  code: string;
  discount_percent: number; // 1 to 100
  description: string | null;
  course_id: CourseId | null; // null means valid for any course
  max_uses: number | null; // null means unlimited
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  auto_admit: boolean;
  requires_cedula_verified: boolean;
  account_type?: CouponAccountType;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipCouponInput {
  id?: string;
  code: string;
  discount_percent: number;
  description?: string | null;
  course_id?: CourseId | null;
  max_uses?: number | null;
  starts_at?: string;
  expires_at?: string | null;
  is_active?: boolean;
  auto_admit?: boolean;
  requires_cedula_verified?: boolean;
  account_type?: CouponAccountType;
}

export interface CouponRedemption {
  redemption_id?: string;
  id?: string;
  coupon_id: string;
  user_id: string;
  course_id: CourseId;
  course_title?: string;
  discount_percent: number;
  redeemed_at: string;
  display_name?: string;
  email?: string;
  cedula_profesional?: string | null;
  institution?: string | null;
  enrollment_status?: CourseEnrollmentStatus;
}

export interface CouponValidationResult {
  coupon?: ScholarshipCoupon;
  valid: boolean;
  error?: string;
  coupon_id?: string;
  code?: string;
  discount_percent?: number;
  description?: string | null;
  auto_admit?: boolean;
  course_id?: CourseId | null;
  account_type?: CouponAccountType;
  target_role_label?: string;
}

export interface ScholarshipPricingSummary {
  originalAmount: number | null;
  discountPercent: number;
  discountAmount: number | null;
  finalAmount: number | null;
  formattedOriginal: string;
  formattedDiscount: string;
  formattedFinal: string;
  isFree: boolean;
  hasNumericPrice: boolean;
}
