import type { RevisionPayload } from '../../types/database';

const FIELDS: { key: keyof RevisionPayload; label: string }[] = [
  { key: 'title', label: 'Título' },
  { key: 'titleEn', label: 'Título (EN)' },
  { key: 'description', label: 'Descripción' },
  { key: 'content', label: 'Contenido' },
  { key: 'contentEn', label: 'Contenido (EN)' },
];

function formatValue(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (typeof value[0] === 'string') return value.join('\n');
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function changed(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
}

export function RevisionDiff({
  current,
  proposed,
}: {
  current: RevisionPayload;
  proposed: RevisionPayload;
}) {
  const diffs = FIELDS.filter(({ key }) => changed(current[key], proposed[key]));

  const mediaChanged =
    changed(current.videoUrls, proposed.videoUrls) ||
    changed(current.youtubeUrls, proposed.youtubeUrls) ||
    changed(current.vimeoUrls, proposed.vimeoUrls) ||
    changed(current.embedUrls, proposed.embedUrls) ||
    changed(current.imageUrls, proposed.imageUrls);

  if (diffs.length === 0 && !mediaChanged) {
    return (
      <p className="text-sm text-slate-500 italic">Sin cambios detectados respecto a la versión actual.</p>
    );
  }

  return (
    <div className="space-y-4">
      {diffs.map(({ key, label }) => (
        <div key={key} className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Actual · {label}
            </p>
            <pre className="text-xs whitespace-pre-wrap text-slate-600 dark:text-slate-300 font-sans">
              {formatValue(current[key])}
            </pre>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 p-3 bg-emerald-50/30 dark:bg-emerald-900/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">
              Propuesto · {label}
            </p>
            <pre className="text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-200 font-sans">
              {formatValue(proposed[key])}
            </pre>
          </div>
        </div>
      ))}

      {mediaChanged && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Media actual</p>
            <pre className="text-xs whitespace-pre-wrap font-sans">
              {formatValue({
                videoUrls: current.videoUrls,
                youtubeUrls: current.youtubeUrls,
                vimeoUrls: current.vimeoUrls,
                embedUrls: current.embedUrls,
                imageUrls: current.imageUrls,
              })}
            </pre>
          </div>
          <div className="rounded-xl border border-emerald-200 p-3">
            <p className="text-xs font-semibold uppercase text-emerald-600 mb-2">Media propuesta</p>
            <pre className="text-xs whitespace-pre-wrap font-sans">
              {formatValue({
                videoUrls: proposed.videoUrls,
                youtubeUrls: proposed.youtubeUrls,
                vimeoUrls: proposed.vimeoUrls,
                embedUrls: proposed.embedUrls,
                imageUrls: proposed.imageUrls,
              })}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
