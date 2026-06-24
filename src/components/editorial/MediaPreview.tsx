import { Play, ImageIcon } from 'lucide-react';
import type { RevisionPayload } from '../../types/database';
import {
  getVideoEmbedSrc,
  parseVideoUrl,
  resolveExternalVideos,
} from '../../utils/mediaValidation';

export function MediaPreview({ payload }: { payload: RevisionPayload }) {
  const externalVideos = resolveExternalVideos(payload);
  const images = payload.imageUrls ?? [];
  const playableVideos = externalVideos.filter((v) => parseVideoUrl(v.url));

  if (!playableVideos.length && !images.length) return null;

  return (
    <div className="space-y-6 mt-6">
      {images.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 mb-3">
            <ImageIcon className="w-3.5 h-3.5" /> Imágenes ({images.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img, i) => (
              <figure key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={img.src} alt={img.alt} className="w-full h-48 object-contain bg-slate-50 dark:bg-slate-800" />
                {img.caption && (
                  <figcaption className="px-3 py-2 text-xs text-slate-500">{img.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {playableVideos.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
            <Play className="w-3.5 h-3.5" /> Videos externos ({playableVideos.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {playableVideos.map((v, i) => {
              const parsed = parseVideoUrl(v.url)!;
              return (
                <div key={i} className="rounded-xl overflow-hidden border border-emerald-200/50">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={getVideoEmbedSrc(parsed)}
                      className="absolute inset-0 w-full h-full"
                      title={v.title}
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="px-3 py-2 text-xs text-slate-600">{v.title}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
