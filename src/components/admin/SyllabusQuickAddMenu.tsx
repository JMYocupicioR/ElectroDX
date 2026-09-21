import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FileText,
  Link as LinkIcon,
  PenLine,
  Plus,
  Video,
} from 'lucide-react';

export type SyllabusQuickAddAction =
  | 'topic'
  | 'subtopic'
  | 'document'
  | 'link'
  | 'live-class'
  | 'quiz'
  | 'edit';

interface SyllabusQuickAddMenuProps {
  label?: string;
  actions: { id: SyllabusQuickAddAction; label: string }[];
  onAction: (action: SyllabusQuickAddAction) => void;
}

const ICONS: Record<SyllabusQuickAddAction, typeof Plus> = {
  topic: BookOpen,
  subtopic: Plus,
  document: FileText,
  link: LinkIcon,
  'live-class': Video,
  quiz: ClipboardList,
  edit: PenLine,
};

export function SyllabusQuickAddMenu({ label = 'Agregar', actions, onAction }: SyllabusQuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (
        menuRef.current?.contains(event.target as Node) ||
        buttonRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = 220;
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      const estimatedHeight = actions.length * 36 + 12;
      const openUp = rect.bottom + estimatedHeight > window.innerHeight - 12;
      const top = openUp ? Math.max(8, rect.top - estimatedHeight - 6) : rect.bottom + 6;
      setCoords({ top, left });
    }
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        onClick={toggle}
        className="inline-flex items-center justify-center min-h-[32px] min-w-[32px] px-1.5 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      {open && coords && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[90] w-[220px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1"
        >
          {actions.map((action) => {
            const Icon = ICONS[action.id];
            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen(false);
                  onAction(action.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
