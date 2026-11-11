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
  const initialIsTeacher = couponToEdit
    ? couponToEdit.account_type === 'teacher' || (couponToEdit.code ? couponToEdit.code.includes('DOCENTE') : false)
    : false;

  const [code, setCode] = useState(couponToEdit?.code ?? '');
  const [accountType, setAccountType] = useState<'student' | 'teacher'>(initialIsTeacher ? 'teacher' : 'student');
  const [discountPercent, setDiscountPercent] = useState<number>(
    initialIsTeacher ? 100 : couponToEdit?.discount_percent ?? 100
  );
  const [description, setDescription] = useState(couponToEdit?.description ?? '');
  const [courseId, setCourseId] = useState<string>(couponToEdit?.course_id || 'all');
  const [hasMaxUses, setHasMaxUses] = useState(couponToEdit ? couponToEdit.max_uses !== null : true);
  const [maxUses, setMaxUses] = useState<number>(couponToEdit?.max_uses ?? 15);
  const [autoAdmit, setAutoAdmit] = useState(
    couponToEdit ? couponToEdit.auto_admit : initialIsTeacher ? true : false
  );
  const [requiresCedula, setRequiresCedula] = useState(couponToEdit ? couponToEdit.requires_cedula_verified : false);
  const [hasExpiration, setHasExpiration] = useState(couponToEdit ? !!couponToEdit.expires_at : true);
  const [startsAt, setStartsAt] = useState<string>(() => {
    if (couponToEdit?.starts_at) return new Date(couponToEdit.starts_at).toISOString().slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    if (couponToEdit?.expires_at) return new Date(couponToEdit.expires_at).toISOString().slice(0, 10);
    return new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  });
  const [isActive, setIsActive] = useState(couponToEdit ? couponToEdit.is_active : true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCourses = sellableCourses(courses);

  useEffect(() => {
    if (couponToEdit) {
      const isTeacher = couponToEdit.account_type === 'teacher' || (couponToEdit.code ? couponToEdit.code.includes('DOCENTE') : false);
      setCode(couponToEdit.code);
      setAccountType(isTeacher ? 'teacher' : 'student');
      setDiscountPercent(isTeacher ? 100 : couponToEdit.discount_percent);
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

  // Listener para cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleGenerateCodeSuggestion = () => {
    const year = new Date().getFullYear();
    if (accountType === 'teacher') {
      const prefixes = ['VIP-DOCENTE', 'PROF-INVITADO', 'CATEDRA', 'FACULTY', 'TITULAR'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const rand = Math.floor(100 + Math.random() * 900);
      setCode(`${prefix}-${rand}`);
    } else {
      const prefixes = ['BECA', 'CONVENIO', 'RESIDENCIA', 'HOSPITAL', 'TALENTO'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const pct = discountPercent || 100;
      setCode(`${prefix}-${pct}-${year}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError(
        accountType === 'teacher'
          ? 'Por favor define un código para el acceso docente.'
          : 'Por favor define un código para la beca.'
      );
      return;
    }

    if (accountType === 'student' && (discountPercent < 1 || discountPercent > 100)) {
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
      // Para profesores, la colegiatura no aplica (se guarda 100% como exención total en BD para consistencia de reglas)
      const effectiveDiscount = accountType === 'teacher' ? 100 : discountPercent;

      const payload: ScholarshipCouponInput = {
        id: couponToEdit?.id,
        code: cleanCode,
        discount_percent: effectiveDiscount,
        description: description.trim() || null,
        course_id: courseId === 'all' ? null : (courseId as CourseId),
        max_uses: hasMaxUses ? Number(maxUses) : null,
        starts_at: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : new Date().toISOString(),
        expires_at: hasExpiration && expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        is_active: isActive,
        auto_admit: effectiveDiscount === 100 ? autoAdmit : false,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-scholarship-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fijo arriba */}
        <div className="px-6 py-4.5 sm:px-7 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                accountType === 'teacher'
                  ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800/80 text-violet-600 dark:text-violet-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-[11px] font-bold uppercase tracking-wider truncate ${
                  accountType === 'teacher'
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {couponToEdit
                  ? accountType === 'teacher'
                    ? 'Editar Acceso Docente'
                    : 'Editar Beca'
                  : accountType === 'teacher'
                  ? 'Nuevo Acceso Docente'
                  : 'Nueva Beca o Cupón'}
              </p>
              <h2 id="modal-scholarship-title" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {couponToEdit ? `Configuración: ${couponToEdit.code}` : 'Configurar Código y Reglas'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form con Contenedor Scrolleable y Footer Fijo */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Cuerpo Scrolleable con scrollbar estilizado */}
          <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7 sm:py-6 space-y-5 scrollbar-thin">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Código y Botón Generador */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {accountType === 'teacher' ? 'Código de acceso docente' : 'Código del cupón'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCodeSuggestion}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold hover:underline cursor-pointer ${
                    accountType === 'teacher'
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Generar sugerencia
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={accountType === 'teacher' ? 'Ej. VIP-DOCENTE-2026, PROF-INVITADO...' : 'Ej. CONVENIO-HOSPITAL, BECA-2026...'}
                className="w-full text-sm font-mono font-bold tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {accountType === 'teacher'
                  ? 'El profesor ingresará este código al solicitar su registro docente en el sitio.'
                  : 'Los aspirantes ingresarán este código al solicitar su inscripción o registro de cuenta.'}
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
                  onClick={() => {
                    setAccountType('student');
                    if (description === 'Acceso Fast-Track Inmediato para Profesores Invitados y Ponentes') {
                      setDescription('');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
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
                    if (!description) {
                      setDescription('Acceso Fast-Track Inmediato para Profesores Invitados y Ponentes');
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    accountType === 'teacher'
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30 text-violet-900 dark:text-violet-200 shadow-xs ring-1 ring-violet-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">👑</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight">Profesor / Docente</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Habilita rol docente y cátedra con remuneración económica (N/A Beca).
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Porcentaje de Beca / Descuento o N/A para Profesor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {accountType === 'teacher' ? 'Régimen de pago / Beca' : 'Porcentaje de beca (% descuento)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                {accountType === 'teacher' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/70 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                    👑 Claustro Docente
                  </span>
                )}
              </div>

              {accountType === 'teacher' ? (
                <div className="p-3.5 rounded-2xl border border-violet-300 dark:border-violet-800/80 bg-gradient-to-br from-violet-50/90 via-purple-50/40 to-slate-50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-slate-900 space-y-2.5">
                  {/* Selector visual: 50%, 75%, 100% desactivados y N/A activado */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-slate-800 cursor-not-allowed opacity-60"
                      title="Desactivado: un docente no recibe beca de alumno"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-slate-800 cursor-not-allowed opacity-60"
                      title="Desactivado: un docente no recibe beca de alumno"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-slate-800 cursor-not-allowed opacity-60"
                      title="Desactivado: un docente no recibe beca de alumno"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      className="py-2 px-3 rounded-xl text-xs font-black bg-violet-600 text-white border border-violet-500 shadow-xs flex items-center justify-center gap-1.5 ring-2 ring-violet-500/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>N/A (No aplica)</span>
                    </button>
                  </div>

                  {/* Explicación de la remuneración económica institucional */}
                  <div className="flex items-start gap-2.5 text-xs text-violet-950 dark:text-violet-200 pt-0.5">
                    <span className="text-base shrink-0 mt-0.5">💼</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-violet-900 dark:text-violet-200">
                        No aplica porcentaje de beca (N/A) — Perfil Docente Remunerado
                      </p>
                      <p className="text-[11px] text-violet-800/90 dark:text-violet-300 leading-relaxed">
                        El titular de este código no es alumno y no realiza pagos de colegiatura. Al registrarse, se le asigna rol de <strong>Profesor / Docente</strong> del claustro académico y contará con <strong>remuneración económica</strong> en vez de pagar (según las actividades docentes y cátedra generadas en el sitio), junto con acceso total liberado al catálogo.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDiscountPercent(preset)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border cursor-pointer ${
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {discountPercent === 100
                      ? '🎓 Beca Completa (100%): Exención total de pago y eliminación de comprobante bancario para el alumno.'
                      : `🏷️ Beca Parcial (${discountPercent}%): El aspirante abonará el remanente con comprobante bancario.`}
                  </p>
                </div>
              )}
            </div>

            {/* Descripción / Convenio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {accountType === 'teacher'
                  ? 'Justificación o referencia del nombramiento docente'
                  : 'Descripción del convenio o justificación institucional'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  accountType === 'teacher'
                    ? 'Ej. Acceso Fast-Track Inmediato para Profesores Invitados y Ponentes'
                    : 'Ej. Beca de excelencia para Médicos Residentes de MFR / Neurología'
                }
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Alcance de Curso */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Layers className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                {accountType === 'teacher' ? 'Alcance del acceso docente por curso' : 'Alcance de la beca por curso'}
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
                  <Users
                    className={`w-4 h-4 ${
                      accountType === 'teacher' ? 'text-violet-500' : 'text-indigo-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {accountType === 'teacher' ? 'Límite de registros docentes' : 'Límite de cupos (Usos)'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMaxUses}
                    onChange={(e) => setHasMaxUses(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      accountType === 'teacher' ? 'peer-checked:bg-violet-600' : 'peer-checked:bg-indigo-600'
                    }`}
                  ></div>
                </label>
              </div>
              {hasMaxUses ? (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {accountType === 'teacher' ? 'Máximo de docentes a registrar:' : 'Máximo de becas a otorgar:'}
                  </span>
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {accountType === 'teacher'
                    ? 'Sin límite numérico: el código podrá ser utilizado por los profesores autorizados hasta su vigencia.'
                    : 'Sin límite numérico: el cupón podrá ser utilizado por cualquier aspirante hasta su vencimiento.'}
                </p>
              )}
            </div>

            {/* Modo de Admisión para Profesor o Beca 100% */}
            {accountType === 'teacher' ? (
              <div className="p-3.5 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Acceso Fast-Track Docente Inmediato (Auto-admit)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdmit}
                      onChange={(e) => setAutoAdmit(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {autoAdmit
                    ? '⚡ Activado: Al ingresar el código en su registro, el médico obtiene acceso docente activo de inmediato al catálogo formativo y herramientas de cátedra sin esperar autorización manual.'
                    : '⏳ Desactivado: El profesor completa su registro pero requerirá aprobación manual por parte de la administración antes de acceder al panel docente.'}
                </p>
              </div>
            ) : (
              discountPercent === 100 && (
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
                      <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {autoAdmit
                      ? '⚡ Activado: Al ingresar el código, el médico obtiene acceso activo de inmediato al curso sin esperar autorización manual (ideal para médicos becados con carta directa).'
                      : '⏳ Desactivado (Recomendado): El aspirante queda en lista de espera con una insignia destacada de "Beca 100%" para que el profesor revise su perfil antes de dar acceso.'}
                  </p>
                </div>
              )
            )}

            {/* Vigencia Temporal */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`w-4 h-4 ${
                      accountType === 'teacher' ? 'text-violet-500' : 'text-indigo-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Vigencia temporal</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasExpiration}
                    onChange={(e) => setHasExpiration(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      accountType === 'teacher' ? 'peer-checked:bg-violet-600' : 'peer-checked:bg-indigo-600'
                    }`}
                  ></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Válido desde:</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Válido hasta:</label>
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
                  className={`mt-0.5 rounded-sm border-slate-300 ${
                    accountType === 'teacher' ? 'text-violet-600 focus:ring-violet-500' : 'text-indigo-600 focus:ring-indigo-500'
                  }`}
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <ShieldCheck
                      className={`w-3.5 h-3.5 ${
                        accountType === 'teacher' ? 'text-violet-500' : 'text-indigo-500'
                      }`}
                    />
                    {accountType === 'teacher'
                      ? 'Exigir cédula profesional para registro docente'
                      : 'Exigir cédula profesional verificada'}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {accountType === 'teacher'
                      ? 'Solo médicos con cédula profesional registrada podrán completar su alta en el claustro docente.'
                      : 'Solo médicos que tengan su cédula profesional verificada en el portal podrán canjear esta beca.'}
                  </p>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Estado del código ({isActive ? 'Activo y disponible' : 'Pausado'})
                </span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className={`rounded-sm border-slate-300 ${
                    accountType === 'teacher' ? 'text-violet-600 focus:ring-violet-500' : 'text-indigo-600 focus:ring-indigo-500'
                  }`}
                />
              </label>
            </div>
          </div>

          {/* Footer Fijo con Botones de Acción */}
          <div className="px-6 py-4 sm:px-7 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm shrink-0 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer ${
                accountType === 'teacher'
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {loading ? (
                <span>Guardando configuración...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {couponToEdit
                      ? accountType === 'teacher'
                        ? 'Actualizar Código Docente'
                        : 'Actualizar Beca'
                      : accountType === 'teacher'
                      ? 'Crear Código Docente'
                      : 'Crear Beca'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

