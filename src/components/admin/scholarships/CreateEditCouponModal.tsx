import { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { saveScholarshipCoupon } from '../../../services/scholarshipService';
import type { ScholarshipCoupon, ScholarshipCouponInput } from '../../../types/scholarship';
import type { Course, CourseId } from '../../../types/database';
import { sellableCourses } from '../../../content/courseCatalog';

interface CreateEditCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  couponToEdit?: ScholarshipCoupon | null;
  courses: Course[];
}

export default function CreateEditCouponModal({
  isOpen,
  onClose,
  onSuccess,
  couponToEdit,
  courses,
}: CreateEditCouponModalProps) {
  const [code, setCode] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'teacher'>('student');
  const [discountPercent, setDiscountPercent] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string>('all');
  const [hasMaxUses, setHasMaxUses] = useState(false);
  const [maxUses, setMaxUses] = useState<number>(15);
  const [autoAdmit, setAutoAdmit] = useState(false);
  const [requiresCedula, setRequiresCedula] = useState(false);
  const [hasExpiration, setHasExpiration] = useState(false);
  const [startsAt, setStartsAt] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCourses = sellableCourses(courses);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setAccountType(couponToEdit.account_type ?? (couponToEdit.code.includes('DOCENTE') ? 'teacher' : 'student'));
      setDiscountPercent(couponToEdit.discount_percent);
      setDescription(couponToEdit.description || '');
      setCourseId(couponToEdit.course_id || 'all');
      setHasMaxUses(couponToEdit.max_uses !== null);
      setMaxUses(couponToEdit.max_uses ?? 15);
      setAutoAdmit(couponToEdit.auto_admit);
      setRequiresCedula(couponToEdit.requires_cedula_verified);
      setIsActive(couponToEdit.is_active);

      if (couponToEdit.starts_at) {
        setStartsAt(new Date(couponToEdit.starts_at).toISOString().slice(0, 10));
      } else {
        setStartsAt(new Date().toISOString().slice(0, 10));
      }

      if (couponToEdit.expires_at) {
        setHasExpiration(true);
        setExpiresAt(new Date(couponToEdit.expires_at).toISOString().slice(0, 10));
      } else {
        setHasExpiration(false);
        setExpiresAt('');
      }
    } else {
      // Defaults for new coupon
      setCode('');
      setAccountType('student');
      setDiscountPercent(100);
      setDescription('');
      setCourseId('all');
      setHasMaxUses(true);
      setMaxUses(15);
      setAutoAdmit(false);
      setRequiresCedula(false);
      setHasExpiration(true);
      setStartsAt(new Date().toISOString().slice(0, 10));
      const in90Days = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      setExpiresAt(in90Days);
      setIsActive(true);
    }
    setError(null);
  }, [couponToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGenerateCodeSuggestion = () => {
    const prefixes = ['BECA', 'CONVENIO', 'RESIDENCIA', 'HOSPITAL', 'TALENTO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = new Date().getFullYear();
    const pct = discountPercent;
    setCode(`${prefix}-${pct}-${year}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor define un código para la beca.');
      return;
    }

    if (discountPercent < 1 || discountPercent > 100) {
      setError('El porcentaje de beca debe estar entre 1% y 100%.');
      return;
    }

    if (hasMaxUses && (!maxUses || maxUses <= 0)) {
      setError('El límite de cupos debe ser un número entero mayor a 0.');
      return;
    }

    if (hasExpiration && !expiresAt) {
      setError('Indica la fecha de expiración o desmarca la opción.');
      return;
    }

    setLoading(true);

    try {
      const payload: ScholarshipCouponInput = {
        id: couponToEdit?.id,
        code: cleanCode,
        discount_percent: discountPercent,
        description: description.trim() || null,
        course_id: courseId === 'all' ? null : (courseId as CourseId),
        max_uses: hasMaxUses ? Number(maxUses) : null,
        starts_at: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : new Date().toISOString(),
        expires_at: hasExpiration && expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        is_active: isActive,
        auto_admit: discountPercent === 100 ? autoAdmit : false,
        requires_cedula_verified: requiresCedula,
        account_type: accountType,
      };

      await saveScholarshipCoupon(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar cupón:', err);
      setError(err?.message || 'No se pudo guardar la configuración del cupón.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-scholarship-title"
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {couponToEdit ? 'Editar Beca' : 'Nueva Beca o Cupón'}
              </p>
              <h2 id="modal-scholarship-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                {couponToEdit ? `Configuración: ${couponToEdit.code}` : 'Configurar Código y Reglas'}
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

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Código y Botón Generador */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Código del cupón <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateCodeSuggestion}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Sparkles className="w-3 h-3" /> Generar sugerencia
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. CONVENIO-HOSPITAL, BECA-2026..."
              className="w-full text-sm font-mono font-bold tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Los aspirantes ingresarán este código al solicitar su inscripción o registro de cuenta.
            </p>
          </div>

          {/* Tipo de Cuenta / Beneficiario */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipo de cuenta / Beneficio otorgado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('student')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  accountType === 'student'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-base">🎓</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">Alumno con Beca</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Estudiante con descuento del 50% al 100% en colegiatura.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('teacher');
                  setDiscountPercent(100);
                  setAutoAdmit(true);
                  if (!description) setDescription('Acceso Fast-Track Inmediato para Profesores Invitados y Ponentes');
                }}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  accountType === 'teacher'
                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-base">👑</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">Profesor / Docente</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Habilita rol docente y acceso liberado total (100%).
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Porcentaje de Beca / Descuento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Porcentaje de beca (% descuento) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDiscountPercent(preset)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                    discountPercent === preset
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset}%
                </button>
              ))}
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-full text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {discountPercent === 100
                ? '🎓 Beca Completa (100%): Exención total de pago y eliminación de comprobante bancario.'
                : `🏷️ Beca Parcial (${discountPercent}%): El aspirante abonará el remanente con comprobante bancario.`}
            </p>
          </div>

          {/* Descripción / Convenio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción del convenio o justificación institucional
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Beca de excelencia para Médicos Residentes de MFR / Neurología"
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Alcance de Curso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Layers className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
              Alcance de la beca por curso
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">🌍 Válido para cualquier curso del catálogo</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Cupo Máximo (Límite de Redenciones) */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">Límite de cupos (Usos)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMaxUses}
                  onChange={(e) => setHasMaxUses(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            {hasMaxUses ? (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-600 dark:text-slate-300">Máximo de becas a otorgar:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxUses}
                  onChange={(e) => setMaxUses(Math.max(1, Number(e.target.value)))}
                  className="w-24 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400">redenciones</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Sin límite numérico: el cupón podrá ser utilizado por cualquier aspirante hasta su vencimiento.
              </p>
            )}
          </div>

          {/* Modo de Admisión para Beca 100% */}
          {discountPercent === 100 && (
            <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Aprobación Inmediata Automática (Auto-admit)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdmit}
                    onChange={(e) => setAutoAdmit(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {autoAdmit
                  ? '⚡ Activado: Al ingresar el código, el médico obtiene acceso activo de inmediato al curso sin esperar autorización manual (ideal para profesores invitados).'
                  : '⏳ Desactivado (Recomendado): El aspirante queda en lista de espera con una insignia destacada de "Beca 100%" para que el profesor revise su perfil antes de dar acceso.'}
              </p>
            </div>
          )}

          {/* Vigencia Temporal */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">Vigencia temporal</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiration}
                  onChange={(e) => setHasExpiration(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Válido desde:</label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Válido hasta:</label>
                <input
                  type="date"
                  value={expiresAt}
                  disabled={!hasExpiration}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {/* Requisito de Cédula y Switch de Activo */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresCedula}
                onChange={(e) => setRequiresCedula(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Exigir cédula profesional verificada
                </span>
                <p className="text-[11px] text-slate-500">
                  Solo médicos que tengan su cédula profesional verificada en el portal podrán canjear esta beca.
                </p>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Estado del cupón ({isActive ? 'Activo y disponible' : 'Pausado'})
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Guardando configuración...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{couponToEdit ? 'Actualizar Beca' : 'Crear Beca'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

