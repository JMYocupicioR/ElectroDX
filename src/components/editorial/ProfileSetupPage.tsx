import { useState, useEffect } from 'react';
import { User, Upload, Save, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { isEnrollmentProfileComplete } from '../../utils/adminUtils';

export default function ProfileSetupPage() {
  const {
    profile,
    updateProfile,
    uploadAvatar,
    isVerifiedContributor,
    enrollmentStatus,
    isEnrolledPhysician,
  } = useAuth();
  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '',
    credentials: profile?.credentials ?? '',
    institution: profile?.institution ?? '',
    specialty: profile?.specialty ?? '',
    cedula_profesional: profile?.cedula_profesional ?? '',
    bio: profile?.bio ?? '',
    is_public: profile?.is_public ?? true,
  });
  const [confirmedProfessional, setConfirmedProfessional] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? '',
      credentials: profile.credentials ?? '',
      institution: profile.institution ?? '',
      specialty: profile.specialty ?? '',
      cedula_profesional: profile.cedula_profesional ?? '',
      bio: profile.bio ?? '',
      is_public: profile.is_public ?? true,
    });
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedProfessional) {
      setError('Debes confirmar que eres profesional de la salud.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const result = await updateProfile(form);
    setSaving(false);
    if (result.error) setError(result.error);
    else if (isEnrollmentProfileComplete(form)) {
      setMessage('Perfil guardado. Tu solicitud de inscripción médica está en revisión.');
    } else {
      setMessage('Perfil guardado. Completa todos los campos obligatorios para solicitar inscripción.');
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const result = await uploadAvatar(file);
    if (result.error) setError(result.error);
    else setMessage('Foto de perfil actualizada.');
  };

  const enrollmentBanner = () => {
    if (isEnrolledPhysician) {
      return (
        <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            {isVerifiedContributor
              ? 'Perfil verificado como colaborador. Tienes acceso a evaluaciones y propuestas de contenido.'
              : 'Inscripción médica aprobada. Puedes acceder a las evaluaciones de cada tema.'}
          </span>
        </div>
      );
    }
    if (enrollmentStatus === 'pending') {
      return (
        <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Tu solicitud de inscripción está en revisión. Te avisaremos cuando un administrador la apruebe.</span>
        </div>
      );
    }
    if (enrollmentStatus === 'rejected') {
      return (
        <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Tu solicitud fue rechazada. Actualiza tu perfil y contacta al administrador si crees que es un error.</span>
        </div>
      );
    }
    return (
      <p className="text-sm text-slate-500 mb-8">
        Completa tu perfil profesional para solicitar inscripción médica y acceder a las evaluaciones.
      </p>
    );
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mi perfil profesional</h1>
      {enrollmentBanner()}

      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
            <Upload className="w-4 h-4" />
            Subir foto (máx. 512 KB)
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatar} />
          </label>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {[
            ['display_name', 'Nombre para mostrar', 'Dr. Juan Pérez', true],
            ['credentials', 'Credenciales', 'MD, Electrofisiólogo', true],
            ['institution', 'Institución', 'Hospital General de México', true],
            ['specialty', 'Especialidad', 'Neurofisiología clínica', false],
            ['cedula_profesional', 'Cédula profesional', '12345678', true],
          ].map(([key, label, placeholder, required]) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
              <input
                required={required}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Biografía breve</span>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            />
            Mostrar mi perfil públicamente en la lista de especialistas
          </label>

          <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={confirmedProfessional}
              onChange={(e) => setConfirmedProfessional(e.target.checked)}
              className="mt-1"
            />
            Confirmo ser profesional de la salud y que la información proporcionada es verídica.
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
