import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCards as getCardsRequest } from '../services/kanbanService';

const columnTemplates = [
  { id: 'todo', title: 'Por hacer', color: '#94a3b8' },
  { id: 'inprogress', title: 'En progreso', color: '#f59e0b' },
  { id: 'done', title: 'Completado', color: '#22c55e' },
];

const priorityOrder = { urgent: 0, normal: 1, low: 2 };

const seedCards = {
  'card-1': { id: 'card-1', title: 'Leer capítulo 7 — Redes Neuronales', description: 'Repasar conceptos clave para el parcial.', category: 'IA', due_date: '2026-07-26', priority: 'urgent', columnId: 'todo' },
  'card-2': { id: 'card-2', title: 'Preparar preguntas para el parcial', description: '', category: 'IA', due_date: '', priority: 'normal', columnId: 'todo' },
  'card-3': { id: 'card-3', title: 'Revisar APIs de Google Calendar', description: '', category: 'Proyecto', due_date: '', priority: 'normal', columnId: 'todo' },
  'card-4': { id: 'card-4', title: 'Avance 2 — arquitectura del sistema', description: 'Validar la estructura del backend y la UI.', category: 'Proyecto', due_date: '2026-07-24', priority: 'normal', columnId: 'inprogress' },
  'card-5': { id: 'card-5', title: 'Parcial de Inteligencia Artificial', description: 'Examen presencial.', category: 'Examen', due_date: '2026-07-23', priority: 'urgent', columnId: 'inprogress' },
  'card-6': { id: 'card-6', title: 'Avance 1 — plan de trabajo', description: '', category: 'Proyecto', due_date: '2026-07-18', priority: 'low', columnId: 'done' },
  'card-7': { id: 'card-7', title: 'Diagrama de flujo del chatbot', description: '', category: 'Proyecto', due_date: '2026-07-19', priority: 'low', columnId: 'done' },
  'card-8': { id: 'card-8', title: 'Revisión de entregables', description: '', category: 'Personal', due_date: '', priority: 'low', columnId: 'done' },
};

const seedColumns = {
  todo: { id: 'todo', title: 'Por hacer', cardIds: ['card-1', 'card-2', 'card-3'] },
  inprogress: { id: 'inprogress', title: 'En progreso', cardIds: ['card-4', 'card-5'] },
  done: { id: 'done', title: 'Completado', cardIds: ['card-6', 'card-7', 'card-8'] },
};

const seedState = {
  columns: seedColumns,
  columnOrder: ['todo', 'inprogress', 'done'],
  cards: seedCards,
};

const categoryOptions = ['IA', 'Proyecto', 'Examen', 'Personal'];

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function cloneBoard(board) {
  return {
    columns: JSON.parse(JSON.stringify(board.columns)),
    columnOrder: [...board.columnOrder],
    cards: JSON.parse(JSON.stringify(board.cards)),
  };
}

function normalizePriority(priority) {
  return priority === 'urgent' || priority === 'low' ? priority : 'normal';
}

function normalizeColumnId(columnId, fallback = 'todo') {
  return ['todo', 'inprogress', 'done'].includes(columnId) ? columnId : fallback;
}

function sortColumnCardIds(cardIds, cards) {
  return [...cardIds].sort((leftId, rightId) => {
    const left = cards[leftId];
    const right = cards[rightId];
    const leftPriority = priorityOrder[left?.priority ?? 'normal'];
    const rightPriority = priorityOrder[right?.priority ?? 'normal'];
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return (left?.title ?? '').localeCompare(right?.title ?? '', 'es');
  });
}

function buildBoardFromCards(cardsInput) {
  const columns = {
    todo: { id: 'todo', title: 'Por hacer', cardIds: [] },
    inprogress: { id: 'inprogress', title: 'En progreso', cardIds: [] },
    done: { id: 'done', title: 'Completado', cardIds: [] },
  };
  const cards = {};

  cardsInput.forEach((card, index) => {
    const id = typeof card.id === 'string' ? card.id : `card-${card.id ?? index + 1}`;
    const columnId = normalizeColumnId(card.columnId ?? card.column ?? card.status);
    const normalizedCard = {
      id,
      title: card.title ?? 'Nueva tarea',
      description: card.description ?? card.subtitle ?? '',
      category: card.category ?? '',
      due_date: card.due_date ?? card.dueDate ?? '',
      priority: normalizePriority(card.priority),
      columnId,
    };

    cards[id] = normalizedCard;
    columns[columnId].cardIds.push(id);
  });

  Object.values(columns).forEach((column) => {
    column.cardIds = sortColumnCardIds(column.cardIds, cards);
  });

  return {
    columns,
    columnOrder: ['todo', 'inprogress', 'done'],
    cards,
  };
}

function boardFromServiceResponse(response) {
  if (Array.isArray(response)) {
    return buildBoardFromCards(response);
  }

  if (response && response.columns && response.cards && response.columnOrder) {
    const nextColumns = cloneBoard(response).columns;
    const nextCards = { ...response.cards };
    Object.values(nextCards).forEach((card) => {
      card.columnId = normalizeColumnId(card.columnId);
    });
    return {
      columns: nextColumns,
      columnOrder: [...response.columnOrder],
      cards: nextCards,
    };
  }

  return cloneBoard(seedState);
}

function generateColumnId(title, existingColumns) {
  const base = title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'column';

  let candidate = base;
  let suffix = 2;
  while (existingColumns[candidate]) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function toDateInput(value) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
}

function buildDraft(card) {
  return {
    id: card.id,
    title: card.title ?? '',
    description: card.description ?? '',
    category: card.category ?? '',
    due_date: toDateInput(card.due_date),
    priority: normalizePriority(card.priority),
    columnId: normalizeColumnId(card.columnId),
  };
}

function commitDraft(state, draftCard) {
  const currentCard = state.cards[draftCard.id];
  if (!currentCard) {
    return state;
  }

  const nextCard = {
    ...currentCard,
    title: draftCard.title.trim() || 'Nueva tarea',
    description: draftCard.description ?? '',
    category: draftCard.category ?? '',
    due_date: draftCard.due_date ?? '',
    priority: normalizePriority(draftCard.priority),
    columnId: normalizeColumnId(draftCard.columnId, currentCard.columnId),
  };

  const nextState = cloneBoard(state);
  const previousColumnId = currentCard.columnId;
  const nextColumnId = nextCard.columnId;

  nextState.cards[nextCard.id] = nextCard;

  if (previousColumnId !== nextColumnId) {
    nextState.columns[previousColumnId].cardIds = nextState.columns[previousColumnId].cardIds.filter((id) => id !== nextCard.id);
    nextState.columns[nextColumnId].cardIds = [...nextState.columns[nextColumnId].cardIds, nextCard.id];
  }

  return nextState;
}

export const useKanbanStore = create(
  persist(
    (set, get) => ({
      ...cloneBoard(seedState),
      loading: false,
      error: null,
      searchQuery: '',
      categoryFilter: 'all',
      activeCardId: null,
      draftCard: null,
      isCardModalOpen: false,
      fetchCards: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getCardsRequest();
          const board = boardFromServiceResponse(response);
          set({ ...board, loading: false, error: null });
          return board.cards;
        } catch (error) {
          set({ loading: false, error: error?.response?.data?.detail ?? error?.message ?? 'No se pudieron cargar las tarjetas.' });
          return get().cards;
        }
      },
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
      moveCard: (cardId, sourceColId, destColId, sourceIndex, destIndex) =>
        set((state) => {
          const sourceColumn = state.columns[sourceColId];
          const destinationColumn = state.columns[destColId];

          if (!sourceColumn || !destinationColumn) {
            return state;
          }

          if (sourceColId === destColId && sourceIndex === destIndex) {
            return state;
          }

          const nextState = cloneBoard(state);
          const nextSourceIds = [...nextState.columns[sourceColId].cardIds];
          const nextDestinationIds = sourceColId === destColId ? nextSourceIds : [...nextState.columns[destColId].cardIds];

          const sourcePosition = nextSourceIds.indexOf(cardId);
          if (sourcePosition !== -1) {
            nextSourceIds.splice(sourcePosition, 1);
          }

          if (sourceColId === destColId) {
            const insertIndex = Math.max(0, Math.min(destIndex, nextSourceIds.length));
            nextSourceIds.splice(insertIndex, 0, cardId);
            nextState.columns[sourceColId].cardIds = nextSourceIds;
          } else {
            const insertIndex = Math.max(0, Math.min(destIndex ?? nextDestinationIds.length, nextDestinationIds.length));
            nextDestinationIds.splice(insertIndex, 0, cardId);
            nextState.columns[sourceColId].cardIds = nextSourceIds;
            nextState.columns[destColId].cardIds = nextDestinationIds;
          }

          nextState.cards[cardId] = {
            ...nextState.cards[cardId],
            columnId: destColId,
          };

          return nextState;
        }),
      addCard: (columnId, card) =>
        set((state) => {
          if (!state.columns[columnId]) {
            return state;
          }

          const id = card.id ?? makeId('card');
          const nextCard = {
            id,
            title: card.title ?? 'Nueva tarea',
            description: card.description ?? '',
            category: card.category ?? '',
            due_date: toDateInput(card.due_date ?? card.dueDate ?? ''),
            priority: normalizePriority(card.priority),
            columnId,
          };

          return {
            ...state,
            cards: { ...state.cards, [id]: nextCard },
            columns: {
              ...state.columns,
              [columnId]: {
                ...state.columns[columnId],
                cardIds: [...state.columns[columnId].cardIds, id],
              },
            },
          };
        }),
      updateCard: (cardId, data) =>
        set((state) => {
          const currentCard = state.cards[cardId];
          if (!currentCard) {
            return state;
          }

          const nextColumnId = normalizeColumnId(data.columnId ?? currentCard.columnId, currentCard.columnId);
          const previousColumnId = currentCard.columnId;
          const nextCard = {
            ...currentCard,
            ...data,
            priority: normalizePriority(data.priority ?? currentCard.priority),
            columnId: nextColumnId,
          };

          const nextState = cloneBoard(state);
          nextState.cards[cardId] = nextCard;

          if (previousColumnId !== nextColumnId) {
            nextState.columns[previousColumnId].cardIds = nextState.columns[previousColumnId].cardIds.filter((id) => id !== cardId);
            nextState.columns[nextColumnId].cardIds = [...nextState.columns[nextColumnId].cardIds, cardId];
          }

          return nextState;
        }),
      deleteCard: (cardId) =>
        set((state) => {
          const currentCard = state.cards[cardId];
          if (!currentCard) {
            return state;
          }

          const nextState = cloneBoard(state);
          delete nextState.cards[cardId];
          nextState.columns[currentCard.columnId].cardIds = nextState.columns[currentCard.columnId].cardIds.filter((id) => id !== cardId);

          if (state.activeCardId === cardId) {
            nextState.activeCardId = null;
            nextState.draftCard = null;
            nextState.isCardModalOpen = false;
          }

          return nextState;
        }),
      addColumn: (title) =>
        set((state) => {
          const id = generateColumnId(title, state.columns);
          return {
            ...state,
            columns: {
              ...state.columns,
              [id]: { id, title: title.trim(), cardIds: [] },
            },
            columnOrder: [...state.columnOrder, id],
          };
        }),
      openCardModal: (cardId) => {
        const card = get().cards[cardId];
        if (!card) {
          return;
        }

        set({ activeCardId: cardId, draftCard: buildDraft(card), isCardModalOpen: true });
      },
      updateDraftCard: (data) =>
        set((state) => ({
          draftCard: state.draftCard ? { ...state.draftCard, ...data } : state.draftCard,
        })),
      saveDraftCard: () => {
        const { activeCardId, draftCard } = get();
        if (!activeCardId || !draftCard) {
          return;
        }

        set((state) => commitDraft(state, draftCard));
      },
      closeCardModal: (save = true) => {
        if (save) {
          get().saveDraftCard();
        }

        set({ activeCardId: null, draftCard: null, isCardModalOpen: false });
      },
      deleteActiveCard: () => {
        const { activeCardId } = get();
        if (activeCardId) {
          get().deleteCard(activeCardId);
        }
      },
      restoreCard: (cardId) => {
        const card = get().cards[cardId];
        if (!card) {
          return;
        }

        get().updateCard(cardId, { columnId: 'todo' });
      },
      setModalCard: (cardId) => get().openCardModal(cardId),
      setDraftField: (field, value) => set((state) => ({ draftCard: state.draftCard ? { ...state.draftCard, [field]: value } : state.draftCard })),
      resetFilters: () => set({ searchQuery: '', categoryFilter: 'all' }),
      categoryOptions,
    }),
    {
      name: 'luma-kanban-board',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        columns: state.columns,
        columnOrder: state.columnOrder,
        cards: state.cards,
        searchQuery: state.searchQuery,
        categoryFilter: state.categoryFilter,
      }),
    },
  ),
);
