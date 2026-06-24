import { Link } from 'react-router-dom';
import { Crown, Mail, Settings, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  ENROLLMENT_META,
  getPermissionSummary,
  ROLE_META,
} from '../../utils/roleLabels';

export default function AccountPage() {
  const {
    user,
    profile,
    roles,
    isAdmin,
    isEditor,
    canProposeContent,
    isEnrolledPhysician,
    enrollmentStatus,
    bootstrapAvailable,
    claimBootstrapAdmin,
  } = useAuth();

  const permissions = getPermissionSummary({
    roles,
    verifiedAt: profile?.verified_at ?? null,
    enrollmentStatus,
    canProposeContent,
    isEnrolledPhysician,
    isAdmin,
  });

  const handleClaim = async () => {
    const result = await claimBootstrapAdmin();
    if (result.error) alert(result.error);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Roles, permisos y acceso a la plataforma</p>
        </div>
        <Link
          to="/cuenta/ajustes"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Settings className="w-4 h-4" />
          Ajustes
        </Link>
      </div>

      {bootstrapAvailable && !isAdmin && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">Activar administrador</p>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80 mt-1">
                Eres el primer usuario. Activa tu rol de administrador para gestionar roles de los demás médicos.
              </p>
              <button
                type="button"
                onClick={handleClaim}
                className="mt-3 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
              >
                Activar administrador
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.display_name ?? 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {profile?.display_name ?? 'Sin nombre'}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            {profile?.credentials && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {profile.credentials}
                {profile.institution ? ` · ${profile.institution}` : ''}
              </p>
            )}
          </div>
        </div>
        <Link
          to="/colaborador/perfil"
          className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
        >
          <User className="w-4 h-4" />
          Editar perfil profesional
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          Roles asignados
        </h2>
        {roles.length ? (
          <ul className="space-y-3">
            {roles.map((role) => (
              <li key={role} className="flex items-start gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ROLE_META[role].badgeClass}`}>
                  {ROLE_META[role].label}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400">{ROLE_META[role].description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            Aún no tienes roles. Un administrador puede asignarte colaborador, editor o administrador.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Estado de inscripción</h2>
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${ENROLLMENT_META[enrollmentStatus].badgeClass}`}>
          {ENROLLMENT_META[enrollmentStatus].label}
        </span>
        {profile?.verified_at && (
          <p className="text-sm text-slate-500 mt-3">
            Colaborador verificado el {new Date(profile.verified_at).toLocaleDateString('es-MX')}
          </p>
        )}
        {profile?.enrollment_verified_at && (
          <p className="text-sm text-slate-500 mt-1">
            Inscripción aprobada el {new Date(profile.enrollment_verified_at).toLocaleDateString('es-MX')}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-5">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Permisos activos</h2>
        <ul className="space-y-2">
          {permissions.map((p) => (
            <li key={p} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {p}
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <Stat label="Admin" value={isAdmin} />
          <Stat label="Editor" value={isEditor} />
          <Stat label="Propone contenido" value={canProposeContent} />
          <Stat label="Médico inscrito" value={isEnrolledPhysician} />
        </dl>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`font-medium ${value ? 'text-emerald-600' : 'text-slate-500'}`}>
        {value ? 'Sí' : 'No'}
      </dd>
    </div>
  );
}
