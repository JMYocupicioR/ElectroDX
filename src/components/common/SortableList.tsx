import { type KeyboardEvent, type ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
}

export function SortableList<T>({ items, getId, onReorder, disabled, renderItem }: SortableListProps<T>) {
  const handleKeyMove = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      onReorder(index, index - 1);
    }
    if (event.key === 'ArrowDown' && index < items.length - 1) {
      event.preventDefault();
      onReorder(index, index + 1);
    }
  };

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={getId(item)}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            if (disabled) return;
            event.preventDefault();
            event.stopPropagation();
            const fromId = event.dataTransfer.getData('text/plain');
            const from = items.findIndex((entry) => getId(entry) === fromId);
            if (from < 0 || from === index) return;
            onReorder(from, index);
          }}
        >
          {renderItem(
            item,
            disabled ? null : (
              <button
                type="button"
                draggable
                aria-label="Reordenar. Arrastra o usa flechas arriba/abajo."
                title="Arrastra para reordenar"
                onClick={(event) => event.stopPropagation()}
                onDragStart={(event) => {
                  event.stopPropagation();
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', getId(item));
                  if (event.currentTarget.parentElement) {
                    event.currentTarget.parentElement.style.opacity = '0.55';
                  }
                }}
                onDragEnd={(event) => {
                  if (event.currentTarget.parentElement) {
                    event.currentTarget.parentElement.style.opacity = '1';
                  }
                }}
                onKeyDown={(event) => handleKeyMove(index, event)}
                className="flex-shrink-0 p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            ),
            index
          )}
        </div>
      ))}
    </div>
  );
}
