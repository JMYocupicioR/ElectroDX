import { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  BadgeCheck,
  Ticket,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { requestCourseEnrollment } from '../../services/courseService';
import { validateScholarshipCoupon } from '../../services/scholarshipService';
import { calculateScholarshipPricing } from '../../utils/scholarshipPricing';
import type { Course, CourseId } from '../../types/database';
import type { CouponValidationResult } from '../../types/scholarship';

interface CourseEnrollmentRequestModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCouponCode?: string;
}

export default function CourseEnrollmentRequestModal({
  course,
  isOpen,
  onClose,
  onSuccess,
  initialCouponCode,
}: CourseEnrollmentRequestModalProps) {
  const [autoLoadedCoupon, setAutoLoadedCoupon] = useState(false);
  const { profile, user, refreshProfile } = useAuth();
  const [notes, setNotes] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-cargar cupón inicial si viene por enlace o props
  useEffect(() => {
    if (isOpen && initialCouponCode && !autoLoadedCoupon) {
      setAutoLoadedCoupon(true);
      setCouponCodeInput(initialCouponCode.trim().toUpperCase());
      setShowCouponInput(true);
      setValidatingCoupon(true);
      validateScholarshipCoupon(
        initialCouponCode.trim().toUpperCase(),
        course.id as CourseId,
        Boolean(profile?.cedula_verified)
      )
        .then((res) => {
          if (res.valid) {
            setAppliedCoupon(res);
          } else {
            setCouponError(res.error || null);
          }
        })
        .catch((err) => {
          setCouponError(err?.message || null);
        })
        .finally(() => {
          setValidatingCoupon(false);
        });
    }
  }, [isOpen, initialCouponCode, autoLoadedCoupon, course.id, profile?.cedula_verified]);

  // Cupones y becas
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!isOpen) return null;

  const handleValidateCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = couponCodeInput.trim().toUpperCase();
    if (!clean) {
      setCouponError('Ingresa un código de beca o convenio.');
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await validateScholarshipCoupon(
        clean,
        course.id as CourseId,
        Boolean(profile?.cedula_verified)
      );

      if (res.valid) {
        setAppliedCoupon(res);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error || 'Código de beca inválido o no aplicable.');
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err?.message || 'Error al validar cupón de beca.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError(null);
  };

  // Pricing breakdown
  const pricing = appliedCoupon?.valid
    ? calculateScholarshipPricing(course.price_display, appliedCoupon.discount_percent || 0)
    : null;

  const isFullScholarship = pricing?.isFree ?? false;
  const isAutoAdmit = Boolean(appliedCoupon?.auto_admit && isFullScholarship);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await requestCourseEnrollment(course.id as CourseId, {
        notes,
        paymentReference: isFullScholarship ? undefined : paymentRef,
        couponCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
      });
      await refreshProfile();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al solicitar admisión:', err);
      setError(err?.message || 'No se pudo procesar la solicitud de admisión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-course-enrollment-title"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Suscripción Académica
              </p>
              <h2 id="modal-course-enrollment-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                {course.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice & Price */}
        <div className="mb-5 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-start gap-2.5">
            {isAutoAdmit ? (
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-bold mb-1">
                {isAutoAdmit
                  ? '⚡ Aprobación y acceso inmediato por Beca 100%'
                  : 'Admisión sujeta a aprobación del profesor'}
              </p>
              <p>
                {isAutoAdmit
                  ? 'Tu cupón cuenta con acreditación Fast-Track. Al enviar tu solicitud obtendrás acceso activo de inmediato para firmar tu reglamento e ingresar.'
                  : 'Cada nivel es una suscripción independiente. Al enviar tu solicitud ingresarás a la lista de espera oficial por orden de llegada para revisión docente.'}
              </p>
            </div>
          </div>

          {/* Pricing Row (Original or Recalculated with Scholarship) */}
          <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40">
            {pricing ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Precio de lista original:</span>
                  <span className="line-through">{pricing.formattedOriginal}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Beca aplicada ({pricing.discountPercent}%):</span>
                  <span>{pricing.formattedDiscount}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-amber-200/40 dark:border-amber-900/40 font-extrabold text-sm">
                  <span className="text-amber-900 dark:text-amber-100">Total neto a liquidar:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg ${
                      pricing.isFree
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100'
                    }`}
                  >
                    {pricing.formattedFinal}
                  </span>
                </div>
              </div>
            ) : (
              course.price_display && (
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-800 dark:text-amber-300">Precio mostrado:</span>
                  <span className="text-sm font-extrabold text-amber-900 dark:text-amber-100 bg-amber-200/50 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-lg">
                    {course.price_display}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Applicant details summary */}
        <div className="mb-5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Médico aspirante:</span>
            <span className="font-bold text-slate-800 dark:text-white">{profile?.display_name || user?.email}</span>
          </div>
          {profile?.cedula_profesional && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Cédula Profesional:</span>
              <span className="font-mono font-semibold flex items-center gap-1">
                {profile.cedula_profesional}
                {profile.cedula_verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 inline" />}
              </span>
            </div>
          )}
          {(profile?.specialty || profile?.residency_year) && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Especialidad / Nivel:</span>
              <span className="font-medium">
                {[profile.specialty, profile.residency_year].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}
          {profile?.institution && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Sede:
              </span>
              <span className="font-medium truncate max-w-[200px]">{profile.institution}</span>
            </div>
          )}
        </div>

        {/* Sección de Cupón de Beca */}
        <div className="mb-5 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-indigo-50/40 dark:bg-indigo-950/20">
          {!appliedCoupon ? (
            <div>
              {!showCouponInput ? (
                <button
                  type="button"
                  onClick={() => setShowCouponInput(true)}
                  className="w-full text-left flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    ¿Cuentas con código de beca o convenio institucional?
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-500">+ Canjear</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-indigo-500" />
                      Código de Beca o Convenio
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCouponInput(false);
                        setCouponError(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleValidateCoupon();
                        }
                      }}
                      placeholder="Ingresa tu código..."
                      className="flex-1 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={validatingCoupon}
                      onClick={() => handleValidateCoupon()}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {validatingCoupon ? 'Validando...' : 'Aplicar'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-200">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100">
                      Beca {appliedCoupon.discount_percent}% Otorgada
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {appliedCoupon.description || 'Convenio institucional verificado exitosamente.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas o motivación para el profesor{' '}
              <span className="font-normal text-slate-400">(Opcional)</span>
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={400}
                placeholder="Ej. Médico en formación con interés en electrodiagnóstico neuromuscular..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment reference: omitted/disabled if 100% scholarship */}
          {!isFullScholarship ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Referencia o comprobante de pago <span className="font-normal text-slate-400">(Opcional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ej. Transferencia SPEI #123456 / Comprobante BBVA"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {appliedCoupon
                  ? `Realiza tu transferencia por el importe remanente con beca (${pricing?.formattedFinal}) y anota tu folio.`
                  : 'Si ya realizaste tu pago o cuentas con un folio, indícalo aquí para acelerar tu admisión.'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Exención de pago activa:</strong> No requieres ficha bancaria ni comprobante de transferencia.
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer ${
                isAutoAdmit
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {loading ? (
                <span>Procesando solicitud...</span>
              ) : isAutoAdmit ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Obtener beca y acceder al curso</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{appliedCoupon ? 'Enviar solicitud con beca' : 'Unirme a la lista de espera'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
