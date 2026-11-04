import { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Copy,
  Share2,
  Check,
  PauseCircle,
  PlayCircle,
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from '../AdminLayout';
import {
  getScholarshipCoupons,
  toggleCouponStatus,
  deleteScholarshipCoupon,
} from '../../../services/scholarshipService';
import type { ScholarshipCoupon } from '../../../types/scholarship';
import type { CourseId } from '../../../types/database';
import { useSyllabusCatalog } from '../../../hooks/useSyllabusCatalog';
import { sellableCourses } from '../../../content/courseCatalog';
import CreateEditCouponModal from './CreateEditCouponModal';
import CouponRedemptionsModal from './CouponRedemptionsModal';

export default function AdminScholarshipsPage() {
  const { courses } = useSyllabusCatalog();
  const availableCourses = useMemo(() => sellableCourses(courses), [courses]);

  const [coupons, setCoupons] = useState<ScholarshipCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'expired'>('all');
  const [selectedDiscount, setSelectedDiscount] = useState<'all' | '100' | 'partial'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<ScholarshipCoupon | null>(null);
  const [inspectRedemptionsCoupon, setInspectRedemptionsCoupon] = useState<ScholarshipCoupon | null>(null);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScholarshipCoupons();
      setCoupons(data);
    } catch (err: any) {
      console.error('Error al cargar cupones de beca:', err);
      setError(err?.message || 'No se pudieron cargar los cupones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Código ${code} copiado al portapapeles`);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback
      showToast(`Código: ${code}`);
    }
  };

  const handleCopyShareLink = async (code: string) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://electrodx.com';
      const url = `${origin}/cursos?beca=${encodeURIComponent(code)}`;
      await navigator.clipboard.writeText(url);
      showToast(`Enlace de invitación con beca copiado al portapapeles`);
    } catch {
      showToast(`Código: ${code}`);
    }
  };

  const handleToggleStatus = async (coupon: ScholarshipCoupon) => {
    const nextStatus = !coupon.is_active;
    try {
      await toggleCouponStatus(coupon.id, nextStatus);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
      );
      showToast(nextStatus ? `Cupón ${coupon.code} activado` : `Cupón ${coupon.code} pausado`);
    } catch (err: any) {
      alert(`Error al cambiar estado: ${err?.message}`);
    }
  };

  const handleDelete = async (coupon: ScholarshipCoupon) => {
    if (!window.confirm(`¿Seguro que deseas eliminar permanentemente el cupón ${coupon.code}?`)) {
      return;
    }
    try {
      await deleteScholarshipCoupon(coupon.id);
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      showToast(`Cupón ${coupon.code} eliminado`);
    } catch (err: any) {
      alert(`Error al eliminar: ${err?.message}`);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.is_active).length;
    const totalUses = coupons.reduce((acc, c) => acc + (c.used_count || 0), 0);
    const fullScholarships = coupons.filter((c) => c.discount_percent === 100).length;
    const partialScholarships = coupons.filter((c) => c.discount_percent < 100).length;

    return { total, active, totalUses, fullScholarships, partialScholarships };
  }, [coupons]);

  // Filtered list
  const filteredCoupons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = new Date();

    return coupons.filter((coupon) => {
      // Search
      if (query) {
        const matchesCode = coupon.code.toLowerCase().includes(query);
        const matchesDesc = coupon.description?.toLowerCase().includes(query) ?? false;
        if (!matchesCode && !matchesDesc) return false;
      }

      // Course
      if (selectedCourse !== 'all') {
        if (coupon.course_id !== selectedCourse) return false;
      }

      // Discount
      if (selectedDiscount === '100' && coupon.discount_percent !== 100) return false;
      if (selectedDiscount === 'partial' && coupon.discount_percent === 100) return false;

      // Status
      if (selectedStatus === 'active') {
        if (!coupon.is_active) return false;
        if (coupon.expires_at && new Date(coupon.expires_at) < now) return false;
      } else if (selectedStatus === 'paused') {
        if (coupon.is_active) return false;
      } else if (selectedStatus === 'expired') {
        if (!coupon.expires_at || new Date(coupon.expires_at) >= now) return false;
      }

      return true;
    });
  }, [coupons, searchQuery, selectedCourse, selectedDiscount, selectedStatus]);

  const getCourseTitle = (courseId: CourseId | null) => {
    if (!courseId) return 'Todos los programas del catálogo';
    const found = availableCourses.find((c) => c.id === courseId);
    return found ? found.title : courseId;
  };

  return (
    <AdminLayout
      title="Becas y Cupones de Ingreso"
      subtitle="Configuración de convenios de beca (50% al 100%), cupos máximos, vigencias y reglas de admisión."
      headerActions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Recargar cupones"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setCouponToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Cupón de Beca</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Cupones creados</span>
              <Ticket className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {stats.active} activos y vigentes
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Becas otorgadas (Canjes)</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUses}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Total de médicos beneficiados</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Becas del 100%</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.fullScholarships}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Exención total de colegiatura</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Becas parciales (50%-99%)</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.partialScholarships}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Con abono de remanente bancario</p>
          </div>
        </div>

        {/* Filters and search */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código o descripción..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Course Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los cursos</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Cualquier estado</option>
                <option value="active">Solo Activos</option>
                <option value="paused">Solo Pausados</option>
                <option value="expired">Solo Expirados</option>
              </select>
            </div>

            {/* Discount Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las becas</option>
                <option value="100">Beca 100%</option>
                <option value="partial">Beca Parcial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons List / Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
            Cargando cupones y becas configuradas...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8">
            <Ticket className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              No se encontraron cupones de beca
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
              {searchQuery || selectedCourse !== 'all' || selectedStatus !== 'all'
                ? 'Prueba ajustando los filtros de búsqueda para ver más resultados.'
                : 'Crea tu primer código de beca para asignarlo a médicos residentes, convenios o profesores.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setCouponToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Cupón de Beca</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCoupons.map((coupon) => {
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
              const isFull = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
              const usagePercent = coupon.max_uses
                ? Math.min(100, Math.round((coupon.used_count / coupon.max_uses) * 100))
                : null;

              return (
                <div
                  key={coupon.id}
                  className={`relative rounded-3xl border p-5 sm:p-6 transition flex flex-col justify-between ${
                    !coupon.is_active || isExpired
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div>
                    {/* Top line: Code, Copy & Discount Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Copiar código"
                          aria-label={`Copiar código ${coupon.code}`}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyShareLink(coupon.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Copiar enlace de invitación directo con esta beca"
                          aria-label={`Copiar enlace de invitación para ${coupon.code}`}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Badge % */}
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full shadow-2xs ${
                          coupon.account_type === 'teacher'
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-600/20'
                            : coupon.discount_percent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {coupon.account_type === 'teacher'
                          ? '👑 Profesor Invitado'
                          : coupon.discount_percent === 100
                          ? '🎓 Beca 100%'
                          : `🏷️ Beca ${coupon.discount_percent}%`}
                      </span>
                    </div>

                    {/* Description */}
                    {coupon.description && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-3">
                        {coupon.description}
                      </p>
                    )}

                    {/* Meta tags: Scope, Approval mode, Cedula */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
                      {/* Course */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[220px]">{getCourseTitle(coupon.course_id)}</span>
                      </span>

                      {/* Approval rule */}
                      {coupon.discount_percent === 100 && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                            coupon.auto_admit
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {coupon.auto_admit ? (
                            <>
                              <Zap className="w-3 h-3 text-emerald-500" /> Auto-admit Inmediato
                            </>
                          ) : (
                            '⏳ Requiere Visto Bueno Docente'
                          )}
                        </span>
                      )}

                      {/* Cedula Requirement */}
                      {coupon.requires_cedula_verified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          <ShieldCheck className="w-3 h-3 text-blue-500" /> Requiere Cédula
                        </span>
                      )}

                      {/* Expiration Tag */}
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold">
                          Expirado
                        </span>
                      ) : coupon.expires_at ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          Vence:{' '}
                          {new Date(coupon.expires_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Vigencia indefinida
                        </span>
                      )}
                    </div>

                    {/* Progress Bar (Usos / Cupo) */}
                    <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Redenciones / Cupo:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {coupon.used_count === 0 ? (
                            coupon.max_uses ? (
                              `0 / ${coupon.max_uses} becas (${coupon.max_uses} disponibles)`
                            ) : (
                              '0 redenciones (Sin límite)'
                            )
                          ) : (
                            coupon.max_uses ? (
                              `${coupon.used_count} / ${coupon.max_uses} becas (${Math.max(0, coupon.max_uses - coupon.used_count)} disponibles)`
                            ) : (
                              `${coupon.used_count} usos (Sin límite)`
                            )
                          )}
                        </span>
                      </div>
                      {coupon.max_uses && (
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFull
                                ? 'bg-rose-500'
                                : (usagePercent || 0) > 80
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                      {isFull && (
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                          ⚠️ Cupo límite de becas alcanzado
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* View beneficiaries */}
                    <button
                      type="button"
                      onClick={() => setInspectRedemptionsCoupon(coupon)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Ver beneficiarios ({coupon.used_count})</span>
                    </button>

                    {/* Controls: toggle, edit, delete */}
                    <div className="flex items-center gap-1">
                      {/* Switch Pause/Play */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(coupon)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          coupon.is_active
                            ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={coupon.is_active ? 'Pausar cupón' : 'Reactivar cupón'}
                      >
                        {coupon.is_active ? (
                          <PauseCircle className="w-4 h-4" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setCouponToEdit(coupon);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                        title="Editar reglas de beca"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(coupon)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Eliminar cupón"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      <CreateEditCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCouponToEdit(null);
        }}
        onSuccess={() => {
          loadData();
          showToast(couponToEdit ? 'Cupón actualizado exitosamente' : 'Nuevo cupón de beca creado');
        }}
        couponToEdit={couponToEdit}
        courses={courses}
      />

      {/* Modal Redenciones / Beneficiarios */}
      <CouponRedemptionsModal
        isOpen={Boolean(inspectRedemptionsCoupon)}
        onClose={() => setInspectRedemptionsCoupon(null)}
        coupon={inspectRedemptionsCoupon}
      />
    </AdminLayout>
  );
}
