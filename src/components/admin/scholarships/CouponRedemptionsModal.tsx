import { useState, useEffect } from 'react';
import {
  X,
  Users,
  Building2,
  BadgeCheck,
  Calendar,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { getCouponRedemptions } from '../../../services/scholarshipService';
import type { ScholarshipCoupon, CouponRedemption } from '../../../types/scholarship';

interface CouponRedemptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: ScholarshipCoupon | null;
}

export default function CouponRedemptionsModal({
  isOpen,
  onClose,
  coupon,
}: CouponRedemptionsModalProps) {
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && coupon) {
      setLoading(true);
      setError(null);
      getCouponRedemptions(coupon.id)
        .then((data) => setRedemptions(data))
        .catch((err) => {
          console.error('Error al cargar beneficiarios:', err);
          setError(err?.message || 'No se pudieron cargar los beneficiarios');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, coupon]);

  if (!isOpen || !coupon) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-redemptions-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {coupon.code}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Beca {coupon.discount_percent}%
                </span>
              </div>
              <h2 id="modal-redemptions-title" className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Médicos Beneficiarios
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Cargando historial de canjes...
            </div>
          ) : redemptions.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Sin canjes registrados aún</p>
              <p className="text-xs text-slate-400 mt-1">
                Ningún aspirante ha utilizado el código {coupon.code} hasta el momento.
              </p>
            </div>
          ) : (
            redemptions.map((r, i) => (
              <div
                key={r.id || r.redemption_id || i}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {r.display_name || 'Médico registrado'}
                      {r.cedula_profesional && (
                        <span className="font-mono text-[11px] font-normal text-slate-500 flex items-center gap-0.5">
                          • Céd. {r.cedula_profesional}
                          <BadgeCheck className="w-3 h-3 text-emerald-500 inline" />
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.email}</p>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      r.enrollment_status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {r.enrollment_status === 'active' ? 'Admitido / Activo' : 'En lista de espera'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  {r.course_title && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      {r.course_title}
                    </span>
                  )}
                  {r.institution && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {r.institution}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.redeemed_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

