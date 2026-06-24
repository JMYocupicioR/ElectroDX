import { Link } from 'react-router-dom';
import { Shield, BookOpen, CheckCircle, Users } from 'lucide-react';

export default function EditorialCommitteePage() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-indigo-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Comité editorial
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300">
        <p className="text-lg leading-relaxed">
          Esta plataforma es una biblioteca colaborativa de electromiografía y neurofisiología clínica,
          curada por especialistas verificados y moderada editorialmente antes de cualquier publicación.
        </p>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 not-prose">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-500" /> Proceso editorial
          </h2>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
            <li>El colaborador verificado propone texto y enlaces externos (Drive, YouTube, imágenes).</li>
            <li>Un administrador o editor revisa la propuesta con vista previa en tiempo real.</li>
            <li>Solo el contenido aprobado se publica; el material educativo base sigue siendo de acceso libre.</li>
            <li>Cada publicación conserva versión, fecha y autoría visible cuando corresponde.</li>
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 not-prose">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Criterios de calidad
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>• Información alineada con guías AANEM y literatura de referencia.</li>
            <li>• Multimedia solo mediante enlaces externos verificables.</li>
            <li>• Sin datos identificables de pacientes.</li>
            <li>• Material educativo; no sustituye el juicio clínico individual.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 not-prose bg-indigo-50/30 dark:bg-indigo-950/20">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-500" /> Colaboradores
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Médicos, electrofisiólogos y especialistas en electrodiagnóstico verificados por el equipo editorial.
          </p>
          <Link
            to="/especialistas"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ver especialistas verificados →
          </Link>
        </section>

        <p className="text-xs text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-6">
          Editor responsable: DeepLuxMed · Plataforma en desarrollo para acreditación institucional.
          Para reportar errores o proponer colaboración, inicia sesión como colaborador o contacta al administrador.
        </p>
      </div>
    </div>
  );
}
