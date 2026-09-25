import { useEffect, useState } from 'react';
import { ExternalLink, FileText, Image as ImageIcon, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import {
  addAssignmentLink,
  listAssignmentSubmissions,
  removeAssignmentSubmission,
  signedSubmissionUrl,
  uploadAssignmentFile,
  type AssignmentSubmission,
} from '../../services/assignmentSubmissionService';
import { submissionLinkError } from '../../utils/submissionLinks';

interface AssignmentDeliveryEditorProps {
  assignmentId: string;
  studentId: string;
  canEdit: boolean;
  onItemsChange?: (count: number) => void;
}

export function AssignmentDeliveryEditor({
  assignmentId,
  studentId,
  canEdit,
  onItemsChange,
}: AssignmentDeliveryEditorProps) {
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

  const onFiles = async (fileList: FileList | null) => {
    if (!fileList || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const next = [...items];
      for (const file of Array.from(fileList)) {
        next.push(await uploadAssignmentFile(assignmentId, studentId, file));
      }
      setNextItems(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.');
    } finally {
      setBusy(false);
    }
  };

  const onAddLink = async () => {
    if (!canEdit) return;
    const validation = submissionLinkError(link);
    if (validation) {
      setError(validation);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const row = await addAssignmentLink(assignmentId, link, label);
      setNextItems([...items, row]);
      setLink('');
      setLabel('');
    } catch (err) {
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
            Archivos
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
                const list = event.target.files;
                event.target.value = '';
                void onFiles(list);
              }}
            />
          </label>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-600" />
            Enlace (opcional)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Si el trabajo está en Drive, OneDrive, Dropbox o Box, pega el enlace aquí.
          </p>
        </div>
        <SubmissionList items={links} canRemove={canEdit && !busy} onRemove={onRemove} />
        {canEdit && (
          <div className="grid gap-2">
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://drive.google.com/…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Nombre del documento (opcional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              disabled={busy || !link.trim()}
              onClick={() => void onAddLink()}
              className="justify-self-start px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-40"
            >
              Agregar enlace
            </button>
          </div>
        )}
      </section>

      {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}
    </div>
  );
}

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

  if (loading) return <p className="text-xs text-slate-500">Cargando archivos del alumno…</p>;
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Entrega del alumno</p>
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
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            {item.kind === 'link' ? (
              <Link2 className="w-3.5 h-3.5 shrink-0" />
            ) : item.mime_type?.startsWith('image/') ? (
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{item.file_name || item.link_label || item.link_url}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <OpenSubmission item={item} />
            {canRemove && onRemove && (
              <button type="button" onClick={() => onRemove(item)} className="p-1 text-rose-600" aria-label="Quitar">
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
    <button type="button" onClick={() => void open()} className="inline-flex items-center gap-1 font-semibold text-blue-600">
      {opening ? 'Abriendo…' : 'Abrir'}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}
