import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Crosshair } from 'lucide-react';
import { PumMorphologyLab } from '../simulator/pumLab/PumMorphologyLab';

export default function PumLabPage() {
  return (
    <main id="contenido-principal" className="mx-auto max-w-5xl space-y-5 px-3 pb-20 pt-20 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-400">
            <Crosshair className="h-3.5 w-3.5" />
            Módulo de aguja
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">Laboratorio de morfología del PUM</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Coloca inicio, fin y picos sobre un potencial sintético. La nota mira el sesgo de cursor, no el diagnóstico.
            Polaridad clínica: negativo hacia arriba.
          </p>
        </div>
        <Link
          to="/simuladores"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Simuladores
        </Link>
      </div>

      <PumMorphologyLab caseId="biceps-normal" mode="guided" />

      <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Los trazos son sintéticos. No uses este laboratorio para informar un estudio real ni para clasificar señal de un paciente.
      </p>
    </main>
  );
}
