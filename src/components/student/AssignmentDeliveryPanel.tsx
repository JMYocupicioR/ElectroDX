import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ExternalLink, FileText, Image as ImageIcon, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import {
  addAssignmentLink,
  listAssignmentSubmissions,
  removeAssignmentSubmission,
  signedSubmissionUrl,
  uploadAssignmentFile,
  type AssignmentSubmission,
} from '../../services/assignmentSubmissionService';
import { normalizeSubmissionUrl, submissionLinkError } from '../../utils/submissionLinks';

export interface AssignmentDeliveryEditorHandle {
  flushPendingLink: () => Promise<boolean>;
}

interface AssignmentDeliveryEditorProps {
  assignmentId: string;
  studentId: string;
  canEdit: boolean;
  onItemsChange?: (count: number) => void;
}

export const AssignmentDeliveryEditor = forwardRef<AssignmentDeliveryEditorHandle, AssignmentDeliveryEditorProps>(
  function AssignmentDeliveryEditor(
    { assignmentId, studentId, canEdit, onItemsChange },
    ref
  ) {
    const [items, setItems] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [link, setLink] = useState('');
    const [label, setLabel] = useState('');

    const setNextItems = (next: AssignmentSubmission[]) => {
      setItems(next);
      onItemsChange?.(next.length);
    };

    useImperativeHandle(ref, () => ({
      async flushPendingLink() {
        const trimmed = link.trim();
        if (!trimmed || !canEdit) return false;
        const normalized = normalizeSubmissionUrl(trimmed);
        const validation = submissionLinkError(normalized);
        if (validation) return false;
        try {
          const row = await addAssignmentLink(assignmentId, normalized, label);
          setNextItems([...items, row]);
          setLink('');
          setLabel('');
          return true;
        } catch (err) {
          console.error('[AssignmentDeliveryEditor] Error al auto-guardar enlace:', err);
          return false;
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      listAssignmentSubmissions(assignmentId)
        .then((rows) => {
          if (cancelled) return;
          setItems(rows);
          onItemsChange?.(rows.length);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'No se pudieron cargar las entregas.');
          onItemsChange?.(0);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [assignmentId]);

    const files = items.filter((item) => item.kind === 'file');
    const links = items.filter((item) => item.kind === 'link');

    const onFiles = async (files: File[]) => {
      if (!files || files.length === 0 || !canEdit) return;
      setBusy(true);
      setError(null);
      try {
        let currentItems = [...items];
        for (const file of files) {
          const item = await uploadAssignmentFile(assignmentId, studentId, file);
          currentItems = [...currentItems, item];
          setNextItems(currentItems);
        }
      } catch (err) {
        console.error('[AssignmentDeliveryPanel] Error al subir archivo:', err);
        setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.');
      } finally {
        setBusy(false);
      }
    };

    const onAddLink = async () => {
      if (!canEdit) return;
      const normalized = normalizeSubmissionUrl(link);
      const validation = submissionLinkError(normalized);
      if (validation) {
        setError(validation);
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const row = await addAssignmentLink(assignmentId, normalized, label);
        setNextItems([...items, row]);
        setLink('');
        setLabel('');
      } catch (err) {
        console.error('[AssignmentDeliveryPanel] Error al guardar enlace:', err);
        setError(err instanceof Error ? err.message : 'No se pudo guardar el enlace.');
      } finally {
        setBusy(false);
      }
    };

    const onRemove = async (item: AssignmentSubmission) => {
      if (!canEdit) return;
      setBusy(true);
      setError(null);
      try {
        await removeAssignmentSubmission(item);
        setNextItems(items.filter((row) => row.id !== item.id));
      } catch (err) {
        console.error('[AssignmentDeliveryPanel] Error al eliminar entrega:', err);
        setError(err instanceof Error ? err.message : 'No se pudo quitar la entrega.');
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Archivos adjuntos
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">PDF, Word (.doc, .docx) o imagen. Máximo 15 MB cada uno.</p>
          </div>
          {loading ? (
            <p className="text-xs text-slate-500 inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando archivos…
            </p>
          ) : (
            <SubmissionList items={files} canRemove={canEdit && !busy} onRemove={onRemove} />
          )}
          {busy && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>Subiendo documento al servidor…</span>
            </div>
          )}
          {canEdit && (
            <label className="flex flex-col items-center justify-center gap-1 px-3 py-5 rounded-2xl border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-xs font-semibold text-blue-800 dark:text-blue-200 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40">
              <Upload className="w-5 h-5" />
              <span>{busy ? 'Subiendo…' : 'Elegir PDF, Word o imagen'}</span>
              <input
                type="file"
                multiple
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                disabled={busy}
                onChange={(event) => {
                  const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
                  event.target.value = '';
                  if (selectedFiles.length > 0) {
                    void onFiles(selectedFiles);
                  }
                }}
              />
            </label>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-600" />
              Enlaces (Drive, OneDrive, Dropbox, etc.)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Si tu reporte o archivo está en Google Drive, OneDrive o Dropbox, pega el enlace aquí.
            </p>
          </div>
          <SubmissionList items={links} canRemove={canEdit && !busy} onRemove={onRemove} />
          {canEdit && (
            <div className="grid gap-2">
              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void onAddLink();
                  }
                }}
                placeholder="https://drive.google.com/… o pega cualquier enlace"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void onAddLink();
                  }
                }}
                placeholder="Nombre o descripción del documento (opcional)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="button"
                disabled={busy || !link.trim()}
                onClick={() => void onAddLink()}
                className="justify-self-start px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 transition shadow-sm"
              >
                + Agregar enlace
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            <p className="font-semibold">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

export function AssignmentSubmissionReview({ assignmentId }: { assignmentId: string }) {
  const [items, setItems] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listAssignmentSubmissions(assignmentId)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando entregas y archivos adjuntos…
      </div>
    );
  }
  if (items.length === 0) return null;
  return (
    <div className="space-y-2 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-cyan-300 flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5" />
        Archivos y enlaces entregados por el alumno ({items.length})
      </p>
      <SubmissionList items={items} canRemove={false} />
    </div>
  );
}

function SubmissionList({
  items,
  canRemove,
  onRemove,
}: {
  items: AssignmentSubmission[];
  canRemove: boolean;
  onRemove?: (item: AssignmentSubmission) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs"
        >
          <span className="inline-flex items-center gap-2.5 min-w-0 flex-1">
            {item.kind === 'link' ? (
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Link2 className="w-4 h-4" />
              </span>
            ) : item.mime_type?.startsWith('image/') ? (
              <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <span className="truncate font-bold text-slate-800 dark:text-slate-100 block">
                {item.link_label || item.file_name || item.link_url}
              </span>
              {item.kind === 'link' && item.link_label && (
                <span className="truncate text-[10px] text-slate-400 font-mono block">
                  {item.link_url}
                </span>
              )}
            </div>
          </span>
          <span className="inline-flex items-center gap-1.5 shrink-0">
            <OpenSubmission item={item} />
            {canRemove && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                aria-label="Quitar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OpenSubmission({ item }: { item: AssignmentSubmission }) {
  const [opening, setOpening] = useState(false);

  const open = async () => {
    if (item.kind === 'link' && item.link_url) {
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!item.storage_path) return;
    setOpening(true);
    try {
      const url = await signedSubmissionUrl(item.storage_path);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void open()}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
    >
      {opening ? 'Abriendo…' : item.kind === 'link' ? 'Abrir enlace' : 'Abrir archivo'}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}
