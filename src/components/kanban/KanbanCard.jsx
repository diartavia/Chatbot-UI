import { Draggable } from '@hello-pangea/dnd';

const columnLabels = {
  todo: 'Por hacer',
  inprogress: 'En progreso',
  done: 'Completado',
};

const columnColors = {
  todo: '#94a3b8',
  inprogress: '#f59e0b',
  done: '#22c55e',
};

function priorityLabel(priority) {
  if (priority === 'urgent') return 'Urgente';
  if (priority === 'low') return 'Baja';
  return 'Normal';
}

export default function KanbanCard({ card, index, columnId, isMobile, matchesFilters, onOpenCard, onRestoreCard, onMoveCardToColumn }) {
  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={isMobile}>
      {(provided, snapshot) => {
        const baseStyle = provided.draggableProps.style ?? {};
        const computedTransform = snapshot.isDragging
          ? `${baseStyle.transform ?? ''} rotate(2deg)`
          : baseStyle.transform;

        return (
          <article
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onOpenCard}
            className={`group rounded-3xl border border-border-soft bg-surface-0 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)] ${columnId === 'done' ? 'opacity-[0.65]' : ''} ${matchesFilters ? '' : 'opacity-30'} ${snapshot.isDragging ? 'shadow-[0_28px_70px_rgba(15,23,42,0.28)] ring-2 ring-accent-400/30' : ''}`}
            style={{
              ...baseStyle,
              transform: computedTransform,
              transition: snapshot.isDragging ? 'none' : 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
              backgroundColor: snapshot.isDragging ? 'rgba(255,255,255,0.98)' : baseStyle.backgroundColor,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: columnColors[columnId] ?? '#94a3b8' }} />
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold text-text-primary ${columnId === 'done' ? 'line-through decoration-text-muted/70' : ''}`}>{card.title}</div>
                {card.description ? <p className="mt-1 text-sm leading-6 text-text-secondary">{card.description}</p> : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {card.category ? (
                <span className="rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium text-text-secondary">{card.category}</span>
              ) : (
                <span className="rounded-full border border-dashed border-border-soft px-2.5 py-1 text-[11px] font-medium text-text-muted">Sin categoría</span>
              )}

              <span className="rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium text-text-secondary">{priorityLabel(card.priority)}</span>

              {card.due_date ? (
                <span className="ml-auto text-[11px] text-text-muted">{card.due_date}</span>
              ) : null}
            </div>

            {columnId === 'done' ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRestoreCard();
                  }}
                  className="rounded-full border border-border-soft px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
                >
                  Restaurar
                </button>
              </div>
            ) : null}

            {isMobile ? (
              <div className="mt-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Mover a</label>
                <select
                  value={columnId}
                  onChange={(event) => {
                    event.stopPropagation();
                    if (event.target.value === columnId) {
                      return;
                    }
                    onMoveCardToColumn(event.target.value);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-2 w-full rounded-2xl border border-border-soft bg-surface-1 px-3 py-2 text-sm text-text-primary outline-none"
                >
                  {Object.entries(columnLabels).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </article>
        );
      }}
    </Draggable>
  );
}
