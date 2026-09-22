import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Award,
  Stethoscope,
  GraduationCap,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Shield,
  FileCheck,
  Plus,
  X,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { postLoginPath } from '../../utils/postLoginPath';
import { isSupabaseConfigured } from '../../lib/supabase';
import { verifyCedula, type CedulaVerificationResult } from '../../services/cedulaService';
import { BrandLogo } from '../brand/BrandLogo';
import { BRAND } from '../../config/brand';

// Sedes hospitalarias de referencia comunes en México (con programas de Rehabilitación y Neurofisiología)
const POPULAR_HOSPITALS = [
  'T1: "Ignacio García Téllez" IMSS Mérida',
  'Instituto Nacional de Rehabilitación (INR)',
  'CMN Siglo XXI - IMSS',
  'CMN La Raza - IMSS',
  'CMN de Occidente - IMSS Guadalajara',
  'UMAE 25 IMSS Monterrey',
  'Instituto Nacional de Neurología y Neurocirugía (INNN)',
  'Hospital General de México Dr. Eduardo Liceaga',
  'CMN 20 de Noviembre - ISSSTE',
  'HRAEPY - Península de Yucatán',
  'Hospital Infantil de México Federico Gómez',
  'Hospital Juárez de México',
  'Hospital Civil de Guadalajara "Fray Antonio Alcalde"',
  'Hospital Universitario "Dr. José Eleuterio González" UANL',
  'Hospital Central Militar (SEDENA)',
  'Hospital Regional de Alta Especialidad del Bajío (HRAEB)',
  'Hospital Metropolitano Bernardo Sepúlveda',
  'Centro Médico ABC',
  'Hospital Español de México',
  'Hospital Médica Sur',
  'Centro Médico Lic. Adolfo López Mateos (Toluca)',
];

const MEDICAL_CATEGORIES = [
  {
    id: 'resident',
    title: 'Médico Residente de Rehabilitación',
    description: 'En formación activa de la especialidad (R1 a R4)',
    icon: GraduationCap,
  },
  {
    id: 'specialist_rehab',
    title: 'Especialista en Medicina de Rehabilitación',
    description: 'Médico certificado o adscrito en medicina física y rehabilitación',
    icon: Stethoscope,
  },
  {
    id: 'neurophysiologist',
    title: 'Neurofisiólogo Clínico / Cursista',
    description: 'Especialista o fellow enfocado en electrodiagnóstico avanzado',
    icon: Sparkles,
  },
  {
    id: 'other_doctor',
    title: 'Médico Especialista Afín',
    description: 'Neurología, Ortopedia, Medicina del Trabajo o cursista libre',
    icon: Building2,
  },
];

export default function RegisterPage() {
  const { signUpStudent, user, isAdmin, isEditor, roles } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') ?? undefined;

  // Pasos: 1 = Cuenta & Datos, 2 = Sede & Nivel, 3 = Acreditación COMEFYR, 4 = Éxito
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [category, setCategory] = useState('resident');
  const [residencyYear, setResidencyYear] = useState('R2');
  const [institution, setInstitution] = useState('');
  const [academicInstitution, setAcademicInstitution] = useState('');
  const institutionInputRef = useRef<HTMLInputElement>(null);
  const academicInputRef = useRef<HTMLInputElement>(null);
  const [cedula, setCedula] = useState('');
  const [comefyrId, setComefyrId] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Estados de verificación de Cédula Profesional SEP
  const [cedulaInput, setCedulaInput] = useState('');
  const [verifyingCedula, setVerifyingCedula] = useState(false);
  const [cedulaVerificationResult, setCedulaVerificationResult] = useState<CedulaVerificationResult | null>(null);
  const [cedulaVerificationError, setCedulaVerificationError] = useState<string | null>(null);
  const [cedulaVerified, setCedulaVerified] = useState(false);
  const [cedulaData, setCedulaData] = useState<any>(null);

  const handleVerifyCedula = async (overrideCedula?: string) => {
    const rawToCheck = overrideCedula ?? (cedulaInput || cedula);
    const clean = rawToCheck.replace(/\D/g, '').trim();

    if (!clean) {
      setCedulaVerificationError('Por favor ingresa un número de cédula válido (6 a 8 dígitos).');
      return;
    }

    if (clean.length < 5 || clean.length > 10) {
      setCedulaVerificationError('La cédula profesional debe contener entre 6 y 8 dígitos.');
      return;
    }

    setCedulaVerificationError(null);
    setVerifyingCedula(true);

    try {
      const res = await verifyCedula(clean);
      if (res.found) {
        setCedulaVerificationResult(res);
        setCedulaVerified(true);
        setCedulaData(res.rawData || res);
        setCedula(clean);
        setCedulaInput(clean);

        // Llenar automáticamente el nombre legal obtenido de la SEP
        if (res.fullName) {
          setFullName(`Dr(a). ${res.fullName}`);
        }

        // Sugerir categoría formativa según la cédula obtenida
        if (res.suggestedCategory) {
          setCategory(res.suggestedCategory);
        }

        // Autocompletar la institución académica de egreso obtenida de la SEP (sin sobreescribir la sede hospitalaria)
        if (res.institution) {
          setAcademicInstitution(res.institution);
        }
      } else {
        setCedulaVerificationResult(null);
        setCedulaVerified(false);
        setCedulaVerificationError(res.error || 'No se encontró registro para esta cédula en el padrón de la SEP.');
      }
    } catch (err: any) {
      setCedulaVerificationResult(null);
      setCedulaVerified(false);
      setCedulaVerificationError(err?.message || 'Error al conectar con el Registro Nacional de Profesionistas.');
    } finally {
      setVerifyingCedula(false);
    }
  };

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  // Si ya está logueado, redirigir
  if (user) {
    if (nextPath && nextPath.startsWith('/')) {
      navigate(nextPath, { replace: true });
    } else {
      navigate(
        postLoginPath({
          next: nextPath,
          isAdmin,
          isEditor,
          isContributor: roles.includes('contributor'),
        }),
        { replace: true }
      );
    }
  }

  // Validación de fuerza de contraseña
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 a 4
  }, [password]);

  const canProceedStep1 = fullName.trim().length >= 3 && email.includes('@') && password.length >= 8;
  const canProceedStep2 = institution.trim().length >= 3;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);

    const fullSpecialty =
      category === 'resident'
        ? `Residente de Medicina de Rehabilitación (${residencyYear})`
        : category === 'specialist_rehab'
        ? 'Especialista en Medicina de Rehabilitación'
        : category === 'neurophysiologist'
        ? 'Neurofisiología Clínica / Electrodiagnóstico'
        : 'Médico Especialista';

    const credentials =
      category === 'resident'
        ? `Médico Residente ${residencyYear}`
        : 'Médico Especialista';

    const result = await signUpStudent({
      email,
      password,
      fullName,
      credentials,
      institution,
      academicInstitution,
      specialty: fullSpecialty,
      residencyYear: category === 'resident' ? residencyYear : 'Especialista',
      cedulaProfesional: cedula || undefined,
      comefyrMemberId: comefyrId || undefined,
      cedulaVerified,
      cedulaData: cedulaData || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNeedsEmailVerification(true);
    }

    setStep(4);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="pt-28 px-4 max-w-lg mx-auto text-center">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
          <p className="font-semibold">Supabase no está configurado</p>
          <p className="text-sm mt-1">Verifica las credenciales en el archivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Luces de fondo y atmósfera médica de alta tecnología */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Columna Izquierda: Credencial Digital & Identidad Institucional */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

          <div>
            {/* Header de la Tarjeta */}
            <div className="flex items-center justify-between mb-6">
              <BrandLogo variant="compact" size="sm" showAccreditation={false} />
              <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-semibold uppercase tracking-wider">
                Registro Alumnos
              </div>
            </div>

            {/* Aval Oficial COMEFYR */}
            {BRAND.enableAccreditation && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>Avalado por COMEFYR</span>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
              Formación Médica de Posgrado en Electrodiagnóstico
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Acceso a casos clínicos de EMG, simuladores de neuroconducción, evaluaciones por módulo y constancia académica con valor curricular.
            </p>

            {/* Credencial Digital Interactiva en Tiempo Real */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-700/60 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl" />
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase">
                    Credencial Digital Estudiante
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Activo
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Médico en Formación</p>
                  <p className="text-white font-bold text-base truncate">
                    {fullName.trim() || 'Dr(a). Nombre del Alumno'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Nivel / Rol</p>
                    <p className="text-slate-300 font-medium">
                      {category === 'resident' ? `Residente ${residencyYear}` : 'Especialista / Cursista'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">{BRAND.enableAccreditation ? 'Aval Académico' : 'Programa'}</p>
                    <p className="text-cyan-400 font-medium truncate">
                      {BRAND.enableAccreditation ? (comefyrId ? `COMEFYR: ${comefyrId}` : 'COMEFYR México') : 'Posgrado EDX'}
                    </p>
                  </div>
                </div>

                {institution && (
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Sede Hospitalaria</p>
                    <p className="text-slate-300 text-xs truncate">{institution}</p>
                  </div>
                )}

                {academicInstitution && (
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Universidad de Egreso</p>
                    <p className="text-cyan-400/90 text-xs truncate">{academicInstitution}</p>
                  </div>
                )}

                {cedulaVerified && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Cédula SEP #{cedula} Verificada</span>
                    </div>
                    {cedulaVerificationResult?.profession && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {cedulaVerificationResult.profession}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enlace a Login para usuarios existentes */}
          <div className="pt-6 mt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>¿Ya estás registrado?</span>
            <Link
              to="/auth/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              Iniciar sesión <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Wizard de Registro Médico */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl shadow-2xl flex flex-col justify-between">
          <div>
            {/* Indicador de Pasos Progresivo */}
            {step < 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                  <span className={step >= 1 ? 'text-cyan-400' : ''}>1. Datos de Cuenta</span>
                  <span className={step >= 2 ? 'text-cyan-400' : ''}>2. Formación Hospitalaria</span>
                  <span className={step >= 3 ? 'text-cyan-400' : ''}>3. Acreditación</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ─── PASO 1: Identidad & Credenciales de Acceso ─── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">Crea tu cuenta de Estudiante</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Ingresa tu nombre médico completo y credenciales de acceso seguras.
                    </p>
                  </div>

                  {/* ─── Validación Oficial SEP México (Cédula Profesional) ─── */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">
                            Validación Oficial SEP México
                          </p>
                          <p className="text-[11px] text-cyan-300 font-medium">
                            Registro Nacional de Profesionistas
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600 font-bold uppercase tracking-wider">
                        Opcional
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      Si ya tienes cédula profesional, puedes validarla ahora para autocompletar tu cuenta. No es necesaria para registrarte: puedes omitirla y añadirla después en tu perfil.
                    </p>

                    {/* Input y Botón de Consulta */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FileCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={cedulaInput}
                          onChange={(e) => {
                            setCedulaInput(e.target.value);
                            setCedulaVerificationError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleVerifyCedula();
                            }
                          }}
                          placeholder="ej. 1234567 (6 a 8 dígitos)"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVerifyCedula()}
                        disabled={verifyingCedula || !cedulaInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition whitespace-nowrap cursor-pointer"
                      >
                        {verifyingCedula ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Consultando SEP...</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5" />
                            <span>Verificar Cédula</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error o no encontrado */}
                    {cedulaVerificationError && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p>{cedulaVerificationError}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ¿En trámite o residente R1? No te preocupes, puedes llenar tus datos manualmente en los campos de abajo.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tarjeta de Verificación Exitosa */}
                    {cedulaVerified && cedulaVerificationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs space-y-2 shadow-lg"
                      >
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                          <span className="flex items-center gap-1.5 font-bold text-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cédula Verificada Oficialmente
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-200 font-mono font-bold">
                            Cédula #{cedula}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-semibold text-emerald-400/80">Profesional Registrado(a)</p>
                          <p className="text-white font-bold text-sm">
                            {cedulaVerificationResult.fullName}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                          <div>
                            <span className="text-emerald-400/80 font-medium">Título Oficial:</span>{' '}
                            <strong className="text-white">{cedulaVerificationResult.profession}</strong>
                          </div>
                          <div>
                            <span className="text-emerald-400/80 font-medium">Institución de Egreso:</span>{' '}
                            <strong className="text-white">{cedulaVerificationResult.institution}</strong>
                          </div>
                          {cedulaVerificationResult.registrationYear && (
                            <div>
                              <span className="text-emerald-400/80 font-medium">Año de Expedición:</span>{' '}
                              <strong className="text-white">{cedulaVerificationResult.registrationYear}</strong>
                            </div>
                          )}
                          {cedulaVerificationResult.type && (
                            <div>
                              <span className="text-emerald-400/80 font-medium">Tipo de Cédula:</span>{' '}
                              <strong className="text-white">{cedulaVerificationResult.type}</strong>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" /> Nombre y credenciales autocompletados con éxito.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <form
                    autoComplete="on"
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (canProceedStep1) setStep(2);
                    }}
                  >
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nombre completo con título profesional *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="ej. Dr. Juan Pablo Morales Ruiz"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Correo electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu_correo@hospital.com.mx"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Recomendamos usar tu correo habitual o institucional donde recibes constancias.
                    </p>
                  </div>

                  {/* Contraseña Segura */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres, números y mayúsculas"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Barra de fortaleza */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1.5 h-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-colors ${
                                passwordStrength >= level
                                  ? passwordStrength === 4
                                    ? 'bg-emerald-500'
                                    : passwordStrength >= 2
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {passwordStrength < 2 && 'Contraseña débil'}
                          {passwordStrength >= 2 && passwordStrength < 4 && 'Contraseña media'}
                          {passwordStrength === 4 && 'Contraseña excelente'}
                        </p>
                      </div>
                    )}
                  </div>
                  </form>
                </motion.div>
              )}

              {/* ─── PASO 2: Formación Clínica & Hospitalaria ─── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">Formación y Sede Hospitalaria</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Permite personalizar los casos clínicos y registrar tu avance académico.
                    </p>
                  </div>

                  {/* Categoría de Usuario Médico */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Selecciona tu perfil formativo *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {MEDICAL_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                              isSelected
                                ? 'bg-blue-600/15 border-cyan-500/80 shadow-md shadow-cyan-500/5'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl mt-0.5 ${
                                isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {cat.title}
                              </p>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de año de residencia (si aplica) */}
                  {category === 'resident' && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">Año de Residencia Médica</p>
                        <p className="text-[11px] text-slate-400">Selecciona tu grado actual en el curso</p>
                      </div>
                      <div className="flex gap-1.5">
                        {['R1', 'R2', 'R3', 'R4'].map((year) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => setResidencyYear(year)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                              residencyYear === year
                                ? 'bg-cyan-500 text-slate-950 shadow'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sede Hospitalaria */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Sede Hospitalaria (Hospital / Clínica) *
                      </label>
                      {institution && (
                        <button
                          type="button"
                          onClick={() => setInstitution('')}
                          className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                          title="Limpiar sede"
                        >
                          <X className="w-3 h-3" /> Limpiar
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        ref={institutionInputRef}
                        type="text"
                        required
                        list="popular-hospitals-list"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder={'ej. T1: "Ignacio García Téllez" IMSS Mérida, INR, CMN Siglo XXI...'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>

                    {/* Datalist para autocompletado rápido al teclear */}
                    <datalist id="popular-hospitals-list">
                      {POPULAR_HOSPITALS.map((h) => (
                        <option key={h} value={h} />
                      ))}
                    </datalist>

                    {/* Sugerencias Rápidas compactas */}
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Sedes frecuentes (un solo clic):</span>
                        {institution && !POPULAR_HOSPITALS.includes(institution) && institution.trim().length >= 3 && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Sede personalizada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
                        {POPULAR_HOSPITALS.map((h) => {
                          const isSelected = institution === h;
                          return (
                            <button
                              key={h}
                              type="button"
                              onClick={() => {
                                setInstitution(isSelected ? '' : h);
                              }}
                              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] transition flex items-center gap-1.5 border cursor-pointer ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-semibold shadow-sm shadow-cyan-500/10'
                                  : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                              }`}
                              title={h}
                            >
                              {isSelected ? (
                                <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                              ) : (
                                <span className="text-slate-500 font-bold shrink-0">+</span>
                              )}
                              <span className="whitespace-nowrap">{h}</span>
                            </button>
                          );
                        })}

                        {/* Botón para enfocar e invitar a escribir una sede personalizada si no está en la lista */}
                        <button
                          type="button"
                          onClick={() => {
                            if (institutionInputRef.current) {
                              institutionInputRef.current.focus();
                              institutionInputRef.current.select();
                            }
                          }}
                          className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-dashed border-slate-700/80 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-slate-400" />
                          <span className="whitespace-nowrap">¿Otra sede? Escríbela aquí</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Institución Académica / Universidad de Egreso (SEPARADO) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Institución Académica / Universidad de Egreso
                      </label>
                      <div className="flex items-center gap-2">
                        {academicInstitution && cedulaVerified && (
                          <span className="text-[10px] text-cyan-400 font-medium bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Autocompletado SEP
                          </span>
                        )}
                        {academicInstitution && (
                          <button
                            type="button"
                            onClick={() => setAcademicInstitution('')}
                            className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                            title="Limpiar universidad"
                          >
                            <X className="w-3 h-3" /> Limpiar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        ref={academicInputRef}
                        type="text"
                        value={academicInstitution}
                        onChange={(e) => setAcademicInstitution(e.target.value)}
                        placeholder="ej. Universidad Nacional Autónoma de México (UNAM), UVM, IPN..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Universidad o facultad médica donde obtuviste tu título profesional o grado académico.
                    </p>
                  </div>

                  {/* Cédula Profesional con Verificación SEP */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Cédula profesional (Médico General o Especialista)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {cedulaVerified ? '✅ Verificada' : 'Opcional'}
                      </span>
                    </div>

                    {cedulaVerified ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              Cédula #{cedula} Verificada ante la SEP
                            </p>
                            <p className="text-[11px] text-emerald-300/90 truncate">
                              {cedulaVerificationResult?.profession || 'Título Profesional Registrado'} · {cedulaVerificationResult?.institution || ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCedulaVerified(false);
                            setCedulaVerificationResult(null);
                          }}
                          className="text-[11px] text-slate-400 hover:text-white underline ml-3 shrink-0 cursor-pointer"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <FileCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="text"
                              value={cedula}
                              onChange={(e) => {
                                setCedula(e.target.value);
                                setCedulaInput(e.target.value);
                                setCedulaVerificationError(null);
                              }}
                              placeholder="ej. 12345678 (6 a 8 dígitos)"
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-cyan-500 outline-none transition"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVerifyCedula(cedula)}
                            disabled={verifyingCedula || !cedula.trim()}
                            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            {verifyingCedula ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verificando...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-3.5 h-3.5" />
                                <span>Validar SEP</span>
                              </>
                            )}
                          </button>
                        </div>

                        {cedulaVerificationError && (
                          <p className="text-xs text-amber-400 mt-1">{cedulaVerificationError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── PASO 3: Acreditación COMEFYR & Confirmación ─── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {BRAND.enableAccreditation ? 'Acreditación Académica COMEFYR' : 'Acreditación y Datos de Posgrado'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {BRAND.enableAccreditation
                        ? 'El Colegio Mexicano de Medicina de Rehabilitación avala tu formación en esta plataforma.'
                        : 'Registro formal para emisión de constancias académicas y seguimiento curricular.'}
                    </p>
                  </div>

                  {/* Número de socio COMEFYR */}
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-cyan-400" />
                      <span className="font-bold text-white text-sm">
                        {BRAND.enableAccreditation
                          ? 'Número de Colegiado o Folio COMEFYR (Opcional)'
                          : 'Número de Colegiado o Registro Profesional (Opcional)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      {BRAND.enableAccreditation
                        ? 'Si cuentas con membresía o afiliación a COMEFYR, ingrésalo aquí para vincular tu certificación automáticamente.'
                        : 'Si cuentas con membresía o registro colegiado, ingrésalo aquí para vincular tu expediente.'}
                    </p>
                    <input
                      type="text"
                      value={comefyrId}
                      onChange={(e) => setComefyrId(e.target.value)}
                      placeholder="ej. CMR-9824"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-blue-400/40 text-white placeholder-slate-500 text-sm focus:border-cyan-400 outline-none transition"
                    />
                  </div>

                  {/* Resumen de Beneficios del Estudiante */}
                  <div className="space-y-2.5 pt-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Tu cuenta como Estudiante incluye:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Acceso completo a todos los módulos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Evaluaciones clínicas interactivas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Simulador y calculadoras de plexo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Historial personal en «Mi Progreso»</span>
                      </div>
                    </div>
                  </div>

                  {/* Aceptación de Términos */}
                  <label className="flex items-start gap-3 pt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      Confirmo que soy personal médico o residente en formación y acepto que el contenido de {BRAND.name} es exclusivo para fines de educación y consulta profesional médica.
                    </span>
                  </label>
                </motion.div>
              )}

              {/* ─── PASO 4: Pantalla de Bienvenida / Éxito ─── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    ¡Bienvenido(a) a {BRAND.name}!
                  </h3>

                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tu cuenta de estudiante ha sido dada de alta exitosamente para el{' '}
                    <strong className="text-white">{fullName}</strong> en{' '}
                    <strong className="text-cyan-400">{institution}</strong>
                    {academicInstitution && (
                      <> (Egreso: <strong className="text-indigo-300">{academicInstitution}</strong>)</>
                    )}.
                  </p>

                  <div className="flex justify-center">
                    {cedulaVerified ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Expediente guardado: Cédula #{cedula} Verificada ante la SEP</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Expediente guardado: Cédula no verificada (Podrás validarla después)</span>
                      </div>
                    )}
                  </div>

                  {needsEmailVerification ? (
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs max-w-md mx-auto">
                      <p className="font-semibold mb-1">Confirmación enviada por correo</p>
                      <p>
                        Hemos enviado un enlace de confirmación a <strong>{email}</strong>. Por favor verifica tu bandeja de entrada o continúa navegando.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-medium">
                      Sesión iniciada con permisos de Estudiante.
                    </p>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                    <button
                      type="button"
                      onClick={() => navigate('/modulo/fundamentals')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition"
                    >
                      Explorar Módulos de EMG
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition"
                    >
                      Ir a Mi Portal de Alumno
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botones de Navegación del Wizard (Pasos 1, 2, 3) */}
          {step < 4 && (
            <div className="pt-8 mt-6 border-t border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>
              ) : (
                <div />
              )}

              {step === 1 && (
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-blue-500/20"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-blue-500/20"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={loading || !acceptTerms}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition shadow-lg shadow-cyan-500/25"
                >
                  {loading ? 'Creando cuenta...' : 'Completar Registro Médico'}
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
