import { DragDropContext } from '@hello-pangea/dnd';
import { useEffect, useMemo, useState } from 'react';
import KanbanColumn from './KanbanColumn';
import CardModal from './CardModal';
import SkeletonLoader from '../ui/SkeletonLoader';
import { useKanbanStore } from '../../store/kanbanStore';

const mobileColumns = ['todo', 'inprogress', 'done'];

export default function KanbanPanel() {
  const columns = useKanbanStore((state) => state.columns);
  const columnOrder = useKanbanStore((state) => state.columnOrder);
  const cards = useKanbanStore((state) => state.cards);
  const searchQuery = useKanbanStore((state) => state.searchQuery);
  const categoryFilter = useKanbanStore((state) => state.categoryFilter);
  const loading = useKanbanStore((state) => state.loading);
  const moveCard = useKanbanStore((state) => state.moveCard);
  const addCard = useKanbanStore((state) => state.addCard);
  const openCardModal = useKanbanStore((state) => state.openCardModal);
  const setSearchQuery = useKanbanStore((state) => state.setSearchQuery);
  const setCategoryFilter = useKanbanStore((state) => state.setCategoryFilter);
  const categoryOptions = useKanbanStore((state) => state.categoryOptions);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [activeMobileColumn, setActiveMobileColumn] = useState(0);
  const [quickAddColumnId, setQuickAddColumnId] = useState(null);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeMobileColumn >= columnOrder.length) {
      setActiveMobileColumn(0);
    }
  }, [activeMobileColumn, columnOrder.length]);

  const visibleColumnIds = useMemo(() => columnOrder.filter((columnId) => columns[columnId]), [columnOrder, columns]);

  const handleQuickAddStart = (columnId) => {
    setQuickAddColumnId(columnId);
    setQuickAddTitle('');
  };

  const handleQuickAddCancel = () => {
    setQuickAddColumnId(null);
    setQuickAddTitle('');
  };

  const handleQuickAddSubmit = (columnId) => {
    const title = quickAddTitle.trim();
    if (!title) {
      return;
    }

    addCard(columnId, {
      title,
      category: '',
      description: '',
      due_date: '',
      priority: 'normal',
    });

    handleQuickAddCancel();
  };

  const handleDragEnd = (result) => {
    if (isMobile) {
      return;
    }

    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    moveCard(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
  };

  const isFiltered = (card) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || card.title.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === 'all' || card.category === categoryFilter;
    return matchesSearch && matchesCategory;
  };

  const getCardsForColumn = (columnId) => {
    const column = columns[columnId];
    if (!column) {
      return [];
    }

    return column.cardIds.map((cardId) => cards[cardId]).filter(Boolean);
  };

  if (loading && !Object.keys(cards).length) {
    return <SkeletonLoader variant="kanban" />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-0 transition-colors duration-200">
        <div className="border-b border-border-soft bg-surface-0 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Tablero</p>
                <h2 className="text-2xl font-semibold text-text-primary">Kanban</h2>
              </div>
              <button
                type="button"
                onClick={() => addCard('todo', { title: 'Nueva tarea', description: '', category: '', due_date: '', priority: 'normal' })}
                className="rounded-full border border-border-soft px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-1 hover:text-text-primary"
              >
                Crear card
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-1 px-4 py-3">
                <span className="text-sm text-text-muted">Buscar</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por título"
                  className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-1 px-4 py-3">
                <span className="text-sm text-text-muted">Categoría</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none"
                >
                  <option value="all">Todas</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {isMobile ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex gap-2 overflow-x-auto border-b border-border-soft px-4 py-3 sm:hidden">
              {visibleColumnIds.map((columnId, index) => {
                const column = columns[columnId];
                return (
                  <button
                    key={columnId}
                    type="button"
                    onClick={() => setActiveMobileColumn(index)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${activeMobileColumn === index ? 'bg-accent-bg text-accent-text' : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'}`}
                  >
                    {column.title}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-4 sm:hidden">
              {visibleColumnIds[activeMobileColumn] ? (
                <KanbanColumn
                  column={columns[visibleColumnIds[activeMobileColumn]]}
                  cards={getCardsForColumn(visibleColumnIds[activeMobileColumn])}
                  isMobile={true}
                  isQuickAddOpen={quickAddColumnId === visibleColumnIds[activeMobileColumn]}
                  quickAddTitle={quickAddTitle}
                  onStartQuickAdd={handleQuickAddStart}
                  onQuickAddChange={setQuickAddTitle}
                  onQuickAddSubmit={handleQuickAddSubmit}
                  onQuickAddCancel={handleQuickAddCancel}
                  onOpenCard={openCardModal}
                  onRestoreCard={(cardId) => moveCard(cardId, 'done', 'todo', 0, columns.todo.cardIds.length)}
                  onMoveCardToColumn={(cardId, sourceColumnId, targetColumnId, cardIndex) => moveCard(cardId, sourceColumnId, targetColumnId, cardIndex, columns[targetColumnId].cardIds.length)}
                  matchesFilters={isFiltered}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-x-auto p-4 sm:p-5 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-hidden">
            {visibleColumnIds.map((columnId) => (
              <div key={columnId} className="min-w-[280px] flex-1 lg:min-w-0">
                <KanbanColumn
                  column={columns[columnId]}
                  cards={getCardsForColumn(columnId)}
                  isMobile={false}
                  isQuickAddOpen={quickAddColumnId === columnId}
                  quickAddTitle={quickAddTitle}
                  onStartQuickAdd={handleQuickAddStart}
                  onQuickAddChange={setQuickAddTitle}
                  onQuickAddSubmit={handleQuickAddSubmit}
                  onQuickAddCancel={handleQuickAddCancel}
                  onOpenCard={openCardModal}
                  onRestoreCard={(cardId) => moveCard(cardId, 'done', 'todo', 0, columns.todo.cardIds.length)}
                  onMoveCardToColumn={(cardId, sourceColumnId, targetColumnId, cardIndex) => moveCard(cardId, sourceColumnId, targetColumnId, cardIndex, columns[targetColumnId].cardIds.length)}
                  matchesFilters={isFiltered}
                />
              </div>
            ))}
          </div>
        )}

        <CardModal />
      </div>
    </DragDropContext>
  );
}
