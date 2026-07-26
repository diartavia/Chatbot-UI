import { Droppable } from '@hello-pangea/dnd';
import { useEffect, useRef } from 'react';
import KanbanCard from './KanbanCard';

const columnDotColors = {
  todo: '#94a3b8',
  inprogress: '#f59e0b',
  done: '#22c55e',
};

function QuickAddInput({ columnId, value, onChange, onSubmit, onCancel }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onSubmit(columnId);
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
        }
      }}
      placeholder="Nombre de la tarea..."
      className="w-full rounded-2xl border border-dashed border-accent-400/40 bg-surface-0 px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-400"
    />
  );
}

export default function KanbanColumn({
  column,
  cards,
  isMobile,
  isQuickAddOpen,
  quickAddTitle,
  onStartQuickAdd,
  onQuickAddChange,
  onQuickAddSubmit,
  onQuickAddCancel,
  onOpenCard,
  onRestoreCard,
  onMoveCardToColumn,
  matchesFilters,
}) {
  return (
    <Droppable droppableId={column.id} isDropDisabled={isMobile}>
      {(provided, snapshot) => (
        <section
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex h-full min-h-0 flex-col rounded-[28px] border transition-colors duration-200 ${snapshot.isDraggingOver ? 'border-accent-400/40 bg-accent-500/5' : 'border-border-soft bg-surface-1'} ${isMobile ? 'min-w-0' : 'min-w-[280px]'}`}
        >
          <header className="flex items-center gap-3 border-b border-border-soft px-4 py-4">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: columnDotColors[column.id] ?? '#94a3b8' }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-text-primary">{column.title}</h3>
                <span className="text-sm text-text-muted">({cards.length})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStartQuickAdd(column.id)}
              className="grid h-8 w-8 place-items-center rounded-full border border-border-soft text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
              aria-label={`Agregar card en ${column.title}`}
            >
              +
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {isQuickAddOpen ? (
              <QuickAddInput
                columnId={column.id}
                value={quickAddTitle}
                onChange={onQuickAddChange}
                onSubmit={onQuickAddSubmit}
                onCancel={onQuickAddCancel}
              />
            ) : null}

            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                columnId={column.id}
                isMobile={isMobile}
                matchesFilters={matchesFilters(card)}
                onOpenCard={() => onOpenCard(card.id)}
                onRestoreCard={() => onRestoreCard(card.id)}
                onMoveCardToColumn={(targetColumnId) => onMoveCardToColumn(card.id, column.id, targetColumnId, index)}
              />
            ))}

            {provided.placeholder}
          </div>
        </section>
      )}
    </Droppable>
  );
}
