import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, CheckCircle, Users, CheckCircle2, Building2, Stethoscope, Scale } from 'lucide-react';
import { getCommitteeMembers } from '../../services/editorialService';
import type { Profile } from '../../types/database';

export default function EditorialCommitteePage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommitteeMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-3">
        <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Scale className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comité Editorial y Dirección Académica
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            ElectoDX Diplomado · Aval COMEFYR
          </p>
        </div>
      </div>

      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
        El Comité Editorial está conformado por un grupo selecto de médicos especialistas y docentes en electrodiagnóstico,
        responsables de la curaduría científica, rigor metodológico y validación de los temas y evaluaciones formativas.
      </p>

      {/* ─── Select Committee Members Showcase ─── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-500" />
          <span>Miembros del Comité Evaluador y Dirección</span>
        </h2>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Cargando miembros del comité…</p>
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-slate-500">Próximamente se publicará la lista oficial de miembros del comité.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-slate-900/60 dark:to-slate-900/60 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 overflow-hidden">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{p.display_name?.charAt(0)?.toUpperCase() || 'Dr'}</span>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {p.display_name}
                    </h3>
                    {p.cedula_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> SEP
                      </span>
                    )}
                  </div>

                  {p.credentials && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {p.credentials}
                    </p>
                  )}

                  {p.institution && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{p.institution}</span>
                    </p>
                  )}

                  {p.specialty && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{p.specialty}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial Process & Standards */}
      <div className="space-y-6 text-slate-600 dark:text-slate-300">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white/60 dark:bg-slate-900/30">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-500" /> Proceso y Criterios Editoriales
          </h2>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
            <li>El docente o colaborador verificado propone contenidos, perlas diagnósticas y casos clínicos.</li>
            <li>Un miembro del Comité Editorial o la Dirección revisa la propuesta con correlación electrodiagnóstica.</li>
            <li>Solo el material verificado y con estricto apego a estándares AANEM/COMEFYR es aprobado y publicado.</li>
            <li>Cada lección conserva registro de autoría, fecha de revisión y versión oficial.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white/60 dark:bg-slate-900/30">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Estándares de Calidad y Ética Médica
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Literatura de referencia internacional (Kimura, Preston & Shapiro, Dumitru, guías AANEM).</li>
            <li>• Anonimización estricta: sin datos sensibles o identificadores de pacientes en trazados o casos.</li>
            <li>• Enfoque en correlación neurofisiológica y juicio clínico integral.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 bg-indigo-50/30 dark:bg-indigo-950/20">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-500" /> Directorio de Especialistas
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Conoce a los electrofisiólogos y médicos adscritos verificados que colaboran activamente.
          </p>
          <Link
            to="/especialistas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ver especialistas verificados →
          </Link>
        </section>
      </div>
    </div>
  );
}
