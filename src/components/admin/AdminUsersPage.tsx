import { useEffect, useState } from 'react';
import {
  UserCheck,
  Shield,
  UserX,
  PenLine,
  Mail,
  Calendar,
  AlertTriangle,
  Users,
  Stethoscope,
  XCircle,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAdminProfiles,
  verifyContributor,
  verifyPhysicianEnrollment,
  rejectPhysicianEnrollment,
  revokePhysicianEnrollment,
  grantRole,
  revokeContributor,
  grantPremiumAccess,
  revokePremiumAccess,
} from '../../services/editorialService';
import type { AdminProfileRow } from '../../types/admin';
import type { AppRole } from '../../types/database';
import { isEnrollmentProfileComplete, isProfileComplete } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';

type Tab = 'enrollment_pending' | 'enrolled' | 'contributors' | 'premium';

const TAB_LABELS: Record<Tab, string> = {
  enrollment_pending: 'Inscripciones pendientes',
  enrolled: 'Médicos inscritos',
  contributors: 'Colaboradores',
  premium: 'Usuarios Premium',
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  
  // Get initial tab from URL if present
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = (searchParams.get('tab') as Tab) || 'enrollment_pending';
  
  const [tab, setTab] = useState<Tab>(initialTab);
  const [users, setUsers] = useState<AdminProfileRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    getAdminProfiles(false, tab)
      .then(setUsers)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [tab]);

  const run = async (userId: string, fn: () => Promise<void>) => {
    setLoadingId(userId);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AdminLayout title="Gestión de usuarios">
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {users.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay usuarios en esta categoría.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => {
            const complete = isProfileComplete(u);
            const enrollmentComplete = isEnrollmentProfileComplete(u);
            const isSelf = u.id === user?.id;
            return (
              <li
                key={u.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-slate-400">
                          {u.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{u.display_name}</p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Registro: {new Date(u.created_at).toLocaleDateString('es-MX')}
                      </p>
                      {u.credentials && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {u.credentials} · Sede: {u.institution}
                          {u.academic_institution && u.academic_institution !== u.institution && (
                            <span className="text-xs text-slate-400"> (Egreso: {u.academic_institution})</span>
                          )}
                        </p>
                      )}
                      {u.cedula_profesional && (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">Cédula: <strong>{u.cedula_profesional}</strong></span>
                          {u.cedula_verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verificada SEP
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500">
                              No verificada
                            </span>
                          )}
                        </div>
                      )}
                      {u.cedula_data && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          🏛️ <span className="font-medium">{u.cedula_data.profesion || u.cedula_data.profession}</span> · {u.cedula_data.institucion || u.cedula_data.institution} ({u.cedula_data.anioRegistro || u.cedula_data.registrationYear})
                        </p>
                      )}
                      {u.residency_year && (
                        <p className="text-xs text-slate-500 mt-0.5">Nivel/Residencia: {u.residency_year}</p>
                      )}
                      {u.comefyr_member_id && (
                        <p className="text-xs text-blue-600 dark:text-cyan-400 mt-0.5 font-medium">Socio COMEFYR: {u.comefyr_member_id}</p>
                      )}
                      {u.specialty && <p className="text-xs text-slate-400">{u.specialty}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs"
                          >
                            {r}
                          </span>
                        ))}
                        {u.has_premium && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                            ✨ Premium
                          </span>
                        )}
                        {tab === 'enrollment_pending' && !enrollmentComplete && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Perfil incompleto
                          </span>
                        )}
                        {tab === 'contributors' && !complete && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Perfil incompleto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                      {tab === 'enrollment_pending' && (
                        <>
                          <button
                            type="button"
                            disabled={loadingId === u.id || !enrollmentComplete}
                            onClick={() => run(u.id, () => verifyPhysicianEnrollment(u.id))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
                          >
                            <Stethoscope className="w-4 h-4" /> Aprobar inscripción
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => rejectPhysicianEnrollment(u.id))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                          >
                            <XCircle className="w-4 h-4" /> Rechazar
                          </button>
                        </>
                      )}
                      {tab === 'enrolled' && (
                        <>
                          {!u.roles.includes('admin') && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {!u.roles.includes('contributor') && (
                                <button
                                  type="button"
                                  disabled={loadingId === u.id}
                                  onClick={() => run(u.id, () => grantRole(u.id, 'contributor' as AppRole))}
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 text-xs hover:bg-blue-50"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" /> Hacer Colaborador
                                </button>
                              )}
                              {!u.roles.includes('editor') && (
                                <button
                                  type="button"
                                  disabled={loadingId === u.id}
                                  onClick={() => run(u.id, () => grantRole(u.id, 'editor' as AppRole))}
                                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-violet-200 text-violet-600 text-xs hover:bg-violet-50"
                                >
                                  <PenLine className="w-3.5 h-3.5" /> Hacer Editor
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={loadingId === u.id}
                                onClick={() => run(u.id, () => grantRole(u.id, 'admin' as AppRole))}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-xs hover:bg-indigo-50"
                              >
                                <Shield className="w-3.5 h-3.5" /> Hacer Admin
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => {
                              if (!confirm('¿Revocar inscripción médica? Perderá acceso a evaluaciones.')) return;
                              run(u.id, () => revokePhysicianEnrollment(u.id));
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                          >
                            <UserX className="w-4 h-4" /> Revocar inscripción
                          </button>
                        </>
                      )}
                      {tab === 'contributors' && !u.verified_at && (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => run(u.id, () => verifyContributor(u.id))}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                        >
                          <UserCheck className="w-4 h-4" /> Verificar colaborador
                        </button>
                      )}
                      {tab === 'contributors' && u.verified_at && !u.roles.includes('admin') && (
                        <>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => grantRole(u.id, 'editor' as AppRole))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-violet-300 text-violet-600 text-sm"
                          >
                            <PenLine className="w-4 h-4" /> Hacer editor
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => grantRole(u.id, 'admin' as AppRole))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-indigo-300 text-indigo-600 text-sm"
                          >
                            <Shield className="w-4 h-4" /> Hacer admin
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => {
                              if (!confirm('¿Revocar acceso de colaborador?')) return;
                              run(u.id, () => revokeContributor(u.id));
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                          >
                            <UserX className="w-4 h-4" /> Revocar colaborador
                          </button>
                        </>
                      )}
                      
                      {!u.has_premium && tab !== 'enrollment_pending' && (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => {
                            const method = window.prompt('Método de pago (ej. stripe, manual, transferencia):', 'manual');
                            if (method === null) return;
                            const ref = window.prompt('Referencia/Folio de pago (opcional):', '');
                            run(u.id, () => grantPremiumAccess(u.id, method || 'manual', ref || undefined));
                          }}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition shadow-sm"
                        >
                          <Shield className="w-4 h-4" /> Otorgar Premium
                        </button>
                      )}

                      {u.has_premium && (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => {
                            if (!confirm('¿Revocar suscripción premium?')) return;
                            run(u.id, () => revokePremiumAccess(u.id));
                          }}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm transition"
                        >
                          <UserX className="w-4 h-4" /> Revocar Premium
                        </button>
                      )}
                    </div>
                  )}
                  {isSelf && <span className="text-xs text-slate-400 italic">Tu cuenta</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
}
