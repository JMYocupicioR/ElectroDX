import type { ReactNode } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AccessibleModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  headerSlot?: ReactNode;
}

export function AccessibleModal({ open, title, onClose, children, labelledBy, headerSlot }: AccessibleModalProps) {
  const ref = useFocusTrap(open);

  if (!open) return null;
  const titleId = labelledBy ?? 'accessible-modal-title';

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60"
        aria-label="Cerrar diálogo"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        {headerSlot}
        <h2
          id={titleId}
          tabIndex={-1}
          className="text-lg font-bold text-slate-900 dark:text-white mb-3 focus:outline-none"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
