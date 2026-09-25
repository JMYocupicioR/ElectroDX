import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, FileText, Link2, Loader2, Trash2, Upload } from 'lucide-react';
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
}

export function AssignmentDeliveryEditor({
  assignmentId,
  studentId,
  canEdit,
}: AssignmentDeliveryEditorProps) {
  const [items, setItems] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [label, setLabel] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      setItems(await listAssignmentSubmissions(assignmentId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [assignmentId]);

  const onFile = async (file: File | undefined) => {
    if (!file || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const row = await uploadAssignmentFile(assignmentId, studentId, file);
      setItems((prev) => [...prev, row]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.');
    } finally {
      setBusy(false);
    }
  };

  const onLink = async (event: FormEvent) => {
    event.preventDefault();
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
      setItems((prev) => [...prev, row]);
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
      setItems((prev) => prev.filter((row) => row.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar la entrega.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Archivos y enlaces
      </p>
      {loading ? (
        <p className="text-xs text-slate-500 inline-flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando entregas…
        </p>
      ) : (
        <SubmissionList items={items} canRemove={canEdit && !busy} onRemove={onRemove} />
      )}

      {canEdit && (
        <>
          <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
            <Upload className="w-4 h-4" />
            <span>{busy ? 'Subiendo…' : 'Subir PDF o imagen (máx. 15 MB)'}</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,.pdf"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                void onFile(file);
              }}
            />
          </label>

          <form onSubmit={onLink} className="grid gap-2">
            <label className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" /> Enlace de Drive, OneDrive o Dropbox
            </label>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://drive.google.com/…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Nombre del archivo (opcional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="submit"
              disabled={busy || !link.trim()}
              className="justify-self-start px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold disabled:opacity-40"
            >
              Agregar enlace
            </button>
          </form>
        </>
      )}

      {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}
      {canEdit && items.length === 0 && !loading && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          Para entregar hace falta al menos un archivo o un enlace.
        </p>
      )}
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
            {item.kind === 'file' ? <FileText className="w-3.5 h-3.5 shrink-0" /> : <Link2 className="w-3.5 h-3.5 shrink-0" />}
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
