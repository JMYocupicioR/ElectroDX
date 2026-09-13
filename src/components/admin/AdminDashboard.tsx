import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Video,
  Shield,
  Stethoscope,
  Lock,
  Unlock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Check,
  Award,
  Activity,
  Layers,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAdminStats,
  getAuditLog,
  getProfilesByIds,
  getAdminProfiles,
  verifyPhysicianEnrollment,
} from '../../services/editorialService';
import { getModuleAccessMap } from '../../services/courseService';
import { allModules } from '../../content/modules';
import { useAuth } from '../../contexts/AuthProvider';
import type { AdminStats, AuditLogEntry, AdminProfileRow } from '../../types/admin';
import type { ModuleAccess } from '../../types/database';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());
  const [pendingDoctors, setPendingDoctors] = useState<AdminProfileRow[]>([]);
  const [moduleAccessMap, setModuleAccessMap] = useState<Map<string, ModuleAccess>>(new Map());
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [statsData, accessMap, pendingUsers] = await Promise.all([
        getAdminStats(),
        getModuleAccessMap().catch(() => new Map()),
        getAdminProfiles(false, 'enrollment_pending').catch(() => []),
      ]);
      setStats(statsData);
      setModuleAccessMap(accessMap);
      setPendingDoctors(pendingUsers.slice(0, 4));

      const entries = await getAuditLog(8);
      setAudit(entries);
      const ids = entries.map((e) => e.actor_id).filter(Boolean) as string[];
      if (ids.length > 0) {
        const profiles = await getProfilesByIds(ids);
        const names = new Map<string, string>();
        profiles.forEach((p, id) => names.set(id, p.display_name));
        setActorNames(names);
      }
    } catch (e) {
      console.error('[AdminDashboard] Error loading dashboard:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (physicianId: string) => {
    setApprovingId(physicianId);
    setSuccessMessage(null);
    try {
      await verifyPhysicianEnrollment(physicianId);
      setSuccessMessage('¡Médico aprobado y acreditado exitosamente!');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al aprobar médico');
    } finally {
      setApprovingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const displayName = profile?.display_name || 'Dr. Marcos Yocupicio';

  return (
    <AdminLayout
      title="Panel de Control Directivo"
      subtitle="Supervisión académica, acreditación médica COMEFYR y control operativo de NeuroSAFE MX."
    >
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 mb-8 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Award className="w-3.5 h-3.5" /> Avalado COMEFYR
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Activity className="w-3.5 h-3.5" /> Sistema Clínico en Línea
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Bienvenido, {displayName}
            </h2>
            <p className="text-sm text-indigo-200/80 max-w-xl mt-1 leading-relaxed">
              Supervisa las solicitudes de médicos residentes y especialistas, programa sesiones de discusión de casos y gestiona los 13 módulos del programa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              to="/admin/talleres"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 transition-all hover:scale-102"
            >
              <Video className="w-4 h-4" />
              <span>Nuevo Taller En Vivo</span>
            </Link>
            <Link
              to="/admin/acceso"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Control de Acceso</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert if Pending Enrollments or Revisions */}
      {stats && (stats.pending_revisions > 0 || (stats.pending_enrollments ?? 0) > 0) && (
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base">
                {(stats.pending_enrollments ?? 0) > 0 && (
                  <span>
                    {stats.pending_enrollments} solicitud(es) de médicos esperando validación COMEFYR.{' '}
                  </span>
                )}
                {stats.pending_revisions > 0 && (
                  <span>{stats.pending_revisions} propuesta(s) de contenido esperando revisión.</span>
                )}
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                Valida las credenciales médicas o aprueba cambios para mantener actualizado el temario.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(stats.pending_enrollments ?? 0) > 0 && (
              <Link
                to="/admin/usuarios"
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Validar Médicos
              </Link>
            )}
            {stats.pending_revisions > 0 && (
              <Link
                to="/admin/revisiones"
                className="px-3.5 py-1.5 rounded-xl border border-amber-500/50 hover:bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs font-semibold transition"
              >
                Revisar Temas
              </Link>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {/* Médicos Inscritos */}
        <Link
          to="/admin/usuarios"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Médicos y Residentes
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.enrolled_physicians ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">acreditados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {stats?.pending_enrollments ?? 0} pendientes
            </span>
            <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Ver médicos <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Cola Editorial */}
        <Link
          to="/admin/revisiones"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cola Editorial
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.pending_revisions ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">en dictamen</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {stats?.approved_revisions ?? 0} aprobadas históricas
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Revisar <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Evaluaciones y Quizzes */}
        <Link
          to="/admin/evaluaciones"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Evaluaciones Médicas
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.published_quizzes ?? 13}
            </span>
            <span className="text-xs font-medium text-slate-500">quizzes activos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {stats?.quiz_attempts_total ?? 0} intentos registrados
            </span>
            <span className="text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Ver notas <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Usuarios Premium */}
        <Link
          to="/admin/usuarios?tab=premium"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Acceso Premium
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.premium_users ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">suscripciones</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Acceso a casos y simulador</span>
            <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Gestionar <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Talleres en Vivo */}
        <Link
          to="/admin/talleres"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Talleres y Webinars
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.upcoming_workshops ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">programados</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {stats?.total_workshops ?? 0} sesiones registradas
            </span>
            <span className="text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Programar <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Casos Clínicos y Simulador EMG */}
        <Link
          to="/admin/ejercicios"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Simulador Clínico EMG
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">33+</span>
            <span className="text-xs font-medium text-slate-500">patrones y casos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Osciloscopio, Audio & Asignación</span>
            <span className="text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Gestionar casos <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Contenido Académico */}
        <Link
          to="/temario"
          className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Currículo Neurofisiología
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">13</span>
            <span className="text-xs font-medium text-slate-500">módulos completos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">479+ lecciones y temas</span>
            <span className="text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Explorar temario <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Immediate Attention: Pending Doctor Enrollments */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" />
              Validación Inmediata de Médicos Residentes y Especialistas
            </h2>
            <p className="text-xs text-slate-500">
              Acredita con 1 clic para darles acceso a la formación avalada por COMEFYR.
            </p>
          </div>
          <Link
            to="/admin/usuarios"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ver todos los usuarios →
          </Link>
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No hay solicitudes de médicos pendientes
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Todas las inscripciones registradas han sido procesadas correctamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {doc.display_name}
                      </h4>
                      <p className="text-xs text-slate-500">{doc.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      Pendiente
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {doc.institution && (
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">Sede:</strong>{' '}
                        {doc.institution}
                      </p>
                    )}
                    {doc.cedula_profesional && (
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">Cédula:</strong>{' '}
                        {doc.cedula_profesional}
                      </p>
                    )}
                    {doc.specialty && (
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">Especialidad:</strong>{' '}
                        {doc.specialty}
                      </p>
                    )}
                    {doc.comefyr_member_id && (
                      <p className="text-blue-600 dark:text-cyan-400 font-semibold">
                        Socio COMEFYR: {doc.comefyr_member_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {new Date(doc.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <button
                    type="button"
                    disabled={approvingId === doc.id}
                    onClick={() => handleQuickApprove(doc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{approvingId === doc.id ? 'Aprobando…' : 'Aprobar Médico'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Curriculum & Module Access Quick Explorer */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Gestión de los 13 Módulos y Accesos
            </h2>
            <p className="text-xs text-slate-500">
              Configuración de acceso Gratis vs. Premium y exploración del programa formativo.
            </p>
          </div>
          <Link
            to="/admin/acceso"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Modificar políticas de acceso →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allModules.slice(0, 6).map((mod) => {
            const access = moduleAccessMap.get(mod.id);
            const isFree = access?.required_tier === 'free';
            return (
              <div
                key={mod.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Módulo {mod.id}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                    {mod.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {mod.topics?.length ?? 0} temas estructurados
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      isFree
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isFree ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{isFree ? 'Gratis' : 'Premium'}</span>
                  </span>
                  <Link
                    to={`/modulo/${mod.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Ver módulo"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/admin/acceso"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ver y configurar los 13 módulos completos →
          </Link>
        </div>
      </section>

      {/* Live System Activity Feed (Audit Log) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-slate-400" />
            Actividad Reciente del Sistema
          </h2>
          <Link
            to="/admin/auditoria"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Auditoría completa →
          </Link>
        </div>

        {audit.length === 0 ? (
          <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-400 bg-white/30 dark:bg-slate-900/30">
            Sin eventos registrados recientemente en la bitácora.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
            {audit.map((entry) => {
              const actionLabel = entry.action
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              const isVerify = entry.action.includes('verify') || entry.action.includes('enroll');
              const isRevision = entry.action.includes('revision');
              const isRole = entry.action.includes('role') || entry.action.includes('admin');

              return (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:px-4 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isVerify
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isRevision
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                          : isRole
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isVerify ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isRevision ? (
                        <FileCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {actionLabel}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Entidad: {entry.entity_type} {entry.entity_id ? `(#${entry.entity_id.slice(0, 8)})` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right text-[11px] text-slate-400 shrink-0">
                    <span>
                      {entry.actor_id ? actorNames.get(entry.actor_id) ?? 'Sistema' : 'Sistema'}
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>{new Date(entry.created_at).toLocaleString('es-MX')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
