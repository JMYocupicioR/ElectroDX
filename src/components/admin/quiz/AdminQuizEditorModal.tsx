import { useEffect, useState } from 'react';
import { X, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { AdminQuizCatalog } from './AdminQuizCatalog';
import { AdminQuizEditor } from './AdminQuizEditor';

export interface AdminQuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
  initialModuleId?: string;
  onSaved?: () => void;
}

export function AdminQuizEditorModal({
  isOpen,
  onClose,
  initialTopicId,
  initialModuleId,
  onSaved,
}: AdminQuizEditorModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId ?? null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(initialModuleId);

  // Sync state whenever modal opens or initialTopicId changes
  useEffect(() => {
    setSelectedTopicId(initialTopicId ?? null);
    setSelectedModuleId(initialModuleId);
  }, [initialTopicId, initialModuleId, isOpen]);

  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-editor-modal-title"
    >
      <div className="relative w-full max-w-6xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {selectedTopicId ? (
              <button
                type="button"
                onClick={() => setSelectedTopicId(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Volver a temas con y sin quiz</span>
                <span className="sm:hidden">Temas</span>
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="quiz-editor-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
                >
                  {selectedTopicId ? 'Editor de Quiz del Tema' : 'Temas del Diplomado: Con y Sin Quiz'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Modal Rápido
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {selectedTopicId
                  ? 'Redacta viñetas clínicas, perlas COMEFYR y publica en vivo'
                  : 'Filtra temas con y sin evaluación, y edita o agrega cuestionarios con un clic'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-950/40">
          {selectedTopicId ? (
            <AdminQuizEditor
              key={`${selectedModuleId ?? ''}:${selectedTopicId}`}
              initialTopicId={selectedTopicId}
              initialModuleId={selectedModuleId}
              onBackToCatalog={() => setSelectedTopicId(null)}
              onSaved={onSaved}
              isModal={true}
            />
          ) : (
            <AdminQuizCatalog
              onSelectTopic={(topicId, moduleId) => {
                setSelectedTopicId(topicId);
                setSelectedModuleId(moduleId);
              }}
              isModal={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
