import { useEffect, useMemo, useState } from 'react';
import { useKanbanStore } from '../../store/kanbanStore';

const priorityOptions = [
  { id: 'urgent', label: 'Urgente' },
  { id: 'normal', label: 'Normal' },
  { id: 'low', label: 'Baja' },
];

const categoryOptions = ['', 'IA', 'Proyecto', 'Examen', 'Personal'];

function formatDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

export default function CardModal() {
  const columns = useKanbanStore((state) => state.columns);
  const columnOrder = useKanbanStore((state) => state.columnOrder);
  const draftCard = useKanbanStore((state) => state.draftCard);
  const isCardModalOpen = useKanbanStore((state) => state.isCardModalOpen);
  const closeCardModal = useKanbanStore((state) => state.closeCardModal);
  const deleteActiveCard = useKanbanStore((state) => state.deleteActiveCard);
  const updateDraftCard = useKanbanStore((state) => state.updateDraftCard);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);

  useEffect(() => {
    if (!isCardModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCardModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCardModal, isCardModalOpen]);

  useEffect(() => {
    setEditingTitle(false);
    setEditingCategory(false);
  }, [draftCard?.id]);

  const currentColumnTitle = useMemo(() => {
    if (!draftCard?.columnId) {
      return 'Por hacer';
    }

    return columns[draftCard.columnId]?.title ?? 'Por hacer';
  }, [columns, draftCard?.columnId]);

  if (!isCardModalOpen || !draftCard) {
    return null;
  }

  const handleDelete = () => {
    const confirmed = window.confirm('¿Eliminar esta card?');
    if (!confirmed) {
      return;
    }

    deleteActiveCard();
    closeCardModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm" onClick={() => closeCardModal(true)}>
      <div
        className="w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-surface-1 shadow-[0_30px_100px_rgba(15,23,42,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-soft px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Card</p>
            {!editingTitle ? (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="mt-1 text-left text-2xl font-semibold text-text-primary"
              >
                {draftCard.title || 'Sin título'}
              </button>
            ) : (
              <input
                autoFocus
                value={draftCard.title}
                onChange={(event) => updateDraftCard({ title: event.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setEditingTitle(false);
                  }
                }}
                className="mt-1 w-full rounded-2xl border border-border-soft bg-surface-0 px-4 py-3 text-2xl font-semibold text-text-primary outline-none focus:border-accent-400"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => closeCardModal(true)}
            className="rounded-full border border-border-soft px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-border-soft bg-surface-0 p-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-secondary">Descripción</span>
                <textarea
                  value={draftCard.description}
                  onChange={(event) => updateDraftCard({ description: event.target.value })}
                  className="min-h-32 w-full rounded-2xl border border-border-soft bg-surface-1 px-4 py-3 text-text-primary outline-none placeholder:text-text-muted focus:border-accent-400"
                  placeholder="Agregá detalles si querés"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-border-soft bg-surface-0 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-text-secondary">Categoría</span>
                {!editingCategory ? (
                  <button
                    type="button"
                    onClick={() => setEditingCategory(true)}
                    className="rounded-full border border-border-soft px-3 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-2"
                  >
                    {draftCard.category || 'Sin categoría'}
                  </button>
                ) : (
                  <select
                    autoFocus
                    value={draftCard.category}
                    onChange={(event) => {
                      updateDraftCard({ category: event.target.value });
                      setEditingCategory(false);
                    }}
                    onBlur={() => setEditingCategory(false)}
                    className="rounded-2xl border border-border-soft bg-surface-1 px-3 py-2 text-sm text-text-primary outline-none"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category || 'empty'} value={category}>
                        {category || 'Sin categoría'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border-soft bg-surface-0 p-4">
              <p className="text-sm font-medium text-text-secondary">Prioridad</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateDraftCard({ priority: option.id })}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${draftCard.priority === option.id ? 'bg-accent-bg text-accent-text' : 'border border-border-soft text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border-soft bg-surface-0 p-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Fecha de entrega</span>
              <input
                type="date"
                value={formatDateInput(draftCard.due_date)}
                onChange={(event) => updateDraftCard({ due_date: event.target.value })}
                className="w-full rounded-2xl border border-border-soft bg-surface-1 px-4 py-3 text-text-primary outline-none focus:border-accent-400"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Columna</span>
              <select
                value={draftCard.columnId}
                onChange={(event) => updateDraftCard({ columnId: event.target.value })}
                className="w-full rounded-2xl border border-border-soft bg-surface-1 px-4 py-3 text-text-primary outline-none"
              >
                {columnOrder.map((columnId) => (
                  <option key={columnId} value={columnId}>
                    {columns[columnId]?.title ?? columnId}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-border-soft bg-surface-1 p-4 text-sm text-text-secondary">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Vista previa</span>
              <div className="mt-2 font-medium text-text-primary">{currentColumnTitle}</div>
              <div className="mt-1">La tarjeta se guarda automáticamente al cerrar este modal.</div>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
            >
              Eliminar card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
