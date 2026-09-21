import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { GroupedSyllabusCourse } from '../../content/courseCatalog';
import type { Module } from '../../types/content';

interface DownloadSyllabusBrochureButtonProps {
  grouped: GroupedSyllabusCourse[];
  unassigned: Module[];
  disabled?: boolean;
  variant?: 'hero' | 'compact';
}

export function DownloadSyllabusBrochureButton({
  grouped,
  unassigned,
  disabled = false,
  variant = 'hero',
}: DownloadSyllabusBrochureButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setBusy(true);
    try {
      const { downloadSyllabusBrochure } = await import('../../pdf/syllabusBrochure/downloadSyllabusBrochure');
      await downloadSyllabusBrochure({ grouped, unassigned });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el PDF del temario.');
    } finally {
      setBusy(false);
    }
  };

  const compact = variant === 'compact';

  return (
    <div className={`flex flex-col ${compact ? 'items-stretch' : 'items-center'} gap-1.5`}>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label="Descargar temario completo en PDF"
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-cyan-400/30 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition'
            : 'inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-slate-900/25 dark:bg-slate-950 dark:hover:bg-slate-900 dark:border dark:border-cyan-400/30 dark:shadow-cyan-950/30 transition-all hover:scale-[1.02]'
        }
      >
        {busy ? (
          <Loader2 className={`${compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} animate-spin text-cyan-300`} />
        ) : (
          <Download className={`${compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-cyan-300`} />
        )}
        <span>{busy ? 'Generando PDF…' : compact ? 'Descargar PDF' : 'Descargar temario PDF'}</span>
        {!compact && (
          <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-300/90 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-md">
            PDF
          </span>
        )}
      </button>
      {error ? <p className="text-xs text-rose-500 dark:text-rose-400 max-w-sm text-center">{error}</p> : null}
    </div>
  );
}
