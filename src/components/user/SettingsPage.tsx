import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Moon, Sun, KeyRound, Check, Eye, EyeOff, Users, Scale, BookOpen, GraduationCap, Home } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuth } from '../../contexts/AuthProvider';

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  const { updatePassword } = useAuth();

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword.length < 8) {
      setPassError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    setSavingPass(true);
    const result = await updatePassword(newPassword);
    setSavingPass(false);

    if (result.error) {
      setPassError(result.error);
    } else {
      setPassSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPassSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <Link
        to="/cuenta"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mi cuenta
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ajustes</h1>
      <p className="text-sm text-slate-500 mb-8">Preferencias de la aplicación y seguridad</p>

      {/* Preferencias de interfaz */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
        Preferencias Generales
      </h2>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 divide-y divide-slate-100 dark:divide-slate-800 mb-8 shadow-sm">
        <SettingRow
          icon={isDarkMode ? Sun : Moon}
          title="Tema"
          description={isDarkMode ? 'Modo oscuro activo' : 'Modo claro activo'}
          action={
            <button
              type="button"
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cambiar a {isDarkMode ? 'claro' : 'oscuro'}
            </button>
          }
        />
        <SettingRow
          icon={Globe}
          title="Idioma del curso"
          description="Español (predeterminado)"
          action={
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Español
            </span>
          }
        />
      </section>

      {/* Seguridad de la cuenta */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
        Seguridad de la Cuenta
      </h2>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Contraseña de acceso</p>
              <p className="text-sm text-slate-500">Actualiza tu contraseña para mantener tu cuenta protegida</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordChange(!showPasswordChange);
              setPassError(null);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            {showPasswordChange ? 'Cancelar' : 'Cambiar'}
          </button>
        </div>

        {showPasswordChange && (
          <form onSubmit={handlePasswordSubmit} className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {passError && (
              <p className="text-xs text-red-500 font-medium">{passError}</p>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>¡Contraseña actualizada exitosamente!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={savingPass}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition disabled:opacity-50"
            >
              {savingPass ? 'Guardando...' : 'Guardar Nueva Contraseña'}
            </button>
          </form>
        )}
      </section>

      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
        Acerca del programa
      </h2>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
        <LinkRow to="/" icon={Home} title="Página de inicio" description="Sitio público de ElectroDx" />
        <LinkRow to="/cursos" icon={GraduationCap} title="Oferta de cursos" description="Principiante, intermedio y avanzado" />
        <LinkRow to="/temario" icon={BookOpen} title="Temario público" description="Resumen del programa para consulta" />
        <LinkRow to="/especialistas" icon={Users} title="Directorio de especialistas" description="Colaboradores y docentes del programa" />
        <LinkRow to="/comite-editorial" icon={Scale} title="Comité editorial" description="Dirección académica y aval del contenido" />
      </section>
    </div>
  );
}

function LinkRow({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: typeof Sun;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-blue-600 dark:text-cyan-400">Ver</span>
    </Link>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Sun;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
