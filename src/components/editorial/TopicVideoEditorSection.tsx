import { useState } from 'react';
import {
  Video,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  type ExternalVideoInput,
  detectVideoPlatform,
  toCanonicalVideoUrl,
} from '../../utils/mediaValidation';

interface TopicVideoEditorSectionProps {
  title?: string;
  items: ExternalVideoInput[];
  onChange: (items: ExternalVideoInput[]) => void;
}

export function TopicVideoEditorSection({
  title = 'Videos externos de la lección',
  items,
  onChange,
}: TopicVideoEditorSectionProps) {
  const [showDriveGuide, setShowDriveGuide] = useState(false);

  const addVideo = () => {
    onChange([...items, { title: '', url: '' }]);
  };

  const removeVideo = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const updateVideo = (index: number, key: keyof ExternalVideoInput, value: string | number | undefined) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const handleUrlBlur = (index: number, rawValue: string) => {
    if (!rawValue.trim()) return;
    const canonical = toCanonicalVideoUrl(rawValue.trim());
    if (canonical !== rawValue) {
      updateVideo(index, 'url', canonical);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              {items.length} {items.length === 1 ? 'video' : 'videos'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Integra grabaciones explicativas de Google Drive, YouTube, Vimeo o Loom con URL completa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDriveGuide(!showDriveGuide)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guía Drive</span>
          </button>
          <button
            type="button"
            onClick={addVideo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar video</span>
          </button>
        </div>
      </div>

      {/* Guía rápida para enlaces de Google Drive */}
      {showDriveGuide && (
        <div className="mb-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">¿Cómo compartir un video desde Google Drive?</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-300">
                <li>En Google Drive, haz clic derecho en el video y selecciona <strong>Compartir</strong>.</li>
                <li>En <em>Acceso general</em>, cámbialo a <strong>Cualquier persona con el enlace</strong> (Lector).</li>
                <li>Copia el enlace y pégalo completo aquí (ej. <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">https://drive.google.com/file/d/.../view</code>).</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Lista de videos */}
      {items.length === 0 ? (
        <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <Play className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No hay videos agregados todavía para este tema.
          </p>
          <button
            type="button"
            onClick={addVideo}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar primer video
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((video, idx) => {
            const platform = detectVideoPlatform(video.url);

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="grid gap-3 sm:grid-cols-12 items-start">
                  {/* Campo de título */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Título o descripción del video *
                    </label>
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => updateVideo(idx, 'title', e.target.value)}
                      placeholder="Ej. Breve historia de la EMG"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Campo de URL completa */}
                  <div className="sm:col-span-5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        URL completa del video *
                      </label>
                      {/* Badge de plataforma detectada */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${platform.badgeBg} ${platform.badgeText} ${platform.badgeBorder}`}
                      >
                        {platform.isPlayable ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                        )}
                        {platform.label}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={video.url}
                      onChange={(e) => updateVideo(idx, 'url', e.target.value)}
                      onBlur={(e) => handleUrlBlur(idx, e.target.value)}
                      placeholder="https://drive.google.com/file/d/... o https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
                    />
                  </div>

                  {/* Duración en minutos para trazabilidad (10 min vs 90 min) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Duración (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={video.durationSeconds ? Math.round(video.durationSeconds / 60) : ''}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value, 10);
                        updateVideo(
                          idx,
                          'durationSeconds',
                          Number.isFinite(mins) && mins > 0 ? mins * 60 : undefined
                        );
                      }}
                      placeholder="Ej. 10 o 90"
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Botón quitar */}
                  <div className="sm:col-span-1 sm:pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Eliminar este video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Barra de validación y testeo */}
                {video.url.trim() && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      {platform.isPlayable ? (
                        <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 font-medium text-[11px]">
                          ✓ Enlace reconocido y listo para reproducir en clase
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 text-[11px]">
                          ⚠️ Formato no reconocido. Usa enlace de Drive, YouTube, Vimeo o Loom.
                        </span>
                      )}
                    </div>

                    <a
                      href={video.url.startsWith('http') ? video.url : `https://${video.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Probar enlace</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

