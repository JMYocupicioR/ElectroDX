import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Activity,
  ChevronRight,
  GraduationCap,
  Building2,
  Stethoscope,
  Users,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getAdminProfiles } from '../../services/editorialService';
import type { AdminProfileRow } from '../../types/admin';

export default function AdminStudentsListPage() {
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterResidency, setFilterResidency] = useState<string>('all');

  useEffect(() => {
    getAdminProfiles(false, 'all')
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.display_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.institution && p.institution.toLowerCase().includes(q)) ||
        (p.cedula_profesional && p.cedula_profesional.includes(q));

      const matchResidency =
        filterResidency === 'all'
          ? true
          : (p.residency_year || '').toLowerCase().includes(filterResidency.toLowerCase());

      return matchSearch && matchResidency;
    });
  }, [profiles, search, filterResidency]);

  return (
    <AdminLayout
      title="Progreso y Expedientes de Alumnos"
      subtitle="Supervisión académica de la cohorte, avance curricular, calificaciones y planes personalizados"
    >
      <div className="space-y-6 pb-20">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno por nombre, correo, hospital o cédula..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterResidency}
              onChange={(e) => setFilterResidency(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              <option value="all">Todos los grados</option>
              <option value="R1">Residentes R1</option>
              <option value="R2">Residentes R2</option>
              <option value="R3">Residentes R3</option>
              <option value="R4">Residentes R4</option>
              <option value="adscrito">Médicos Adscritos</option>
            </select>
          </div>
        </div>

        {/* Cohort Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Alumnos Registrados
            </span>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {profiles.length}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Médicos Admitidos al Curso
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {profiles.filter((p) => p.enrollment_status === 'approved').length}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cédula Profesional Verificada SEP
            </span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {profiles.filter((p) => p.cedula_verified).length}
            </span>
          </div>
        </div>

        {/* Students List Table */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Cargando alumnos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No se encontraron alumnos con los criterios seleccionados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((student) => {
                const isApproved = student.enrollment_status === 'approved';

                return (
                  <div
                    key={student.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 overflow-hidden">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.display_name?.slice(0, 2).toUpperCase() || 'AL'
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {student.display_name}
                          </p>
                          {student.residency_year && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                              {student.residency_year}
                            </span>
                          )}
                          {student.cedula_verified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SEP
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 truncate max-w-md">
                          {student.email} · {student.institution || 'Sede no registrada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isApproved ? 'Admitido' : 'Pendiente'}
                      </span>

                      <Link
                        to={`/admin/alumnos/${student.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer group"
                      >
                        <Activity className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
                        <span>Ver Expediente y Progreso</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
