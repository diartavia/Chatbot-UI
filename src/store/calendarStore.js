import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { addDays, addMonths, addWeeks, dateStringFromDate, dateTimeFromParts, parseEventDate, startOfDay } from './calendarUtils';

const julyEvents = [
  {
    id: 1,
    title: 'Planificación semanal',
    description: 'Ordenar entregas y bloquear bloques de estudio.',
    start: '2026-07-20T09:00:00.000Z',
    end: '2026-07-20T10:00:00.000Z',
    calendar: 'google',
    color: '#4f72e8',
    location: 'Oficina',
  },
  {
    id: 2,
    title: 'Tutoría de IA',
    description: 'Resolver dudas del parcial con el grupo.',
    start: '2026-07-20T16:00:00.000Z',
    end: '2026-07-20T17:30:00.000Z',
    calendar: 'outlook',
    color: '#d97706',
    location: 'Sala 3',
  },
  {
    id: 3,
    title: 'Revisión de proyecto',
    description: 'Validar arquitectura y pendientes del sprint.',
    start: '2026-07-21T11:00:00.000Z',
    end: '2026-07-21T12:00:00.000Z',
    calendar: 'google',
    color: '#4f72e8',
    location: 'Meet',
  },
  {
    id: 4,
    title: 'Parcial de IA',
    description: 'Examen presencial.',
    start: '2026-07-22T18:00:00.000Z',
    end: '2026-07-22T19:30:00.000Z',
    calendar: 'google',
    color: '#dc2626',
    location: 'Aula 204',
  },
  {
    id: 5,
    title: 'Estudio profundo',
    description: 'Repaso de redes neuronales y ejercicios.',
    start: '2026-07-23T19:00:00.000Z',
    end: '2026-07-23T21:00:00.000Z',
    calendar: 'google',
    color: '#4f72e8',
    location: 'Casa',
  },
  {
    id: 6,
    title: 'Revisión de avance 2',
    description: 'Feedback final antes de entregar.',
    start: '2026-07-23T21:00:00.000Z',
    end: '2026-07-23T22:00:00.000Z',
    calendar: 'outlook',
    color: '#d97706',
    location: 'Sala 1',
  },
  {
    id: 7,
    title: 'Llamada con el equipo',
    description: 'Ajustar tareas del viernes.',
    start: '2026-07-24T08:30:00.000Z',
    end: '2026-07-24T09:00:00.000Z',
    calendar: 'outlook',
    color: '#d97706',
    location: 'Video llamada',
  },
  {
    id: 8,
    title: 'Laboratorio BD',
    description: 'Práctica guiada de consultas.',
    start: '2026-07-24T13:00:00.000Z',
    end: '2026-07-24T15:00:00.000Z',
    calendar: 'google',
    color: '#4f72e8',
    location: 'Lab 2',
  },
  {
    id: 9,
    title: 'Bloque libre',
    description: 'Espacio reservado para pendientes.',
    start: '2026-07-25T10:00:00.000Z',
    end: '2026-07-25T12:00:00.000Z',
    calendar: 'google',
    color: '#10b981',
    location: 'Casa',
  },
  {
    id: 10,
    title: 'Cierre semanal',
    description: 'Revisar avances y preparar el siguiente ciclo.',
    start: '2026-07-26T17:00:00.000Z',
    end: '2026-07-26T18:00:00.000Z',
    calendar: 'outlook',
    color: '#d97706',
    location: 'Oficina',
  },
];

const connectedCalendars = [
  { id: 'google', label: 'Google Calendar', connected: true, color: '#4285f4' },
  { id: 'outlook', label: 'Outlook ULACIT', connected: true, color: '#0078d4' },
];

const normalizeEvent = (event) => ({
  ...event,
  start: parseEventDate(event.start).toISOString(),
  end: parseEventDate(event.end).toISOString(),
});

const sortEvents = (events) => [...events].sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());

const buildDefaultDraft = (baseDate = new Date()) => {
  const start = startOfDay(baseDate);
  start.setHours(9, 0, 0, 0);
  const end = addDays(start, 0);
  end.setHours(10, 0, 0, 0);

  return {
    title: '',
    description: '',
    calendar: 'google',
    color: '#4f72e8',
    location: '',
    startDate: dateStringFromDate(start),
    startTime: '09:00',
    endDate: dateStringFromDate(end),
    endTime: '10:00',
  };
};

export const useCalendarStore = create(
  persist(
    (set, get) => ({
      currentDate: new Date('2026-07-23T00:00:00.000Z'),
      view: 'month',
      selectedDate: new Date('2026-07-23T00:00:00.000Z'),
      events: julyEvents,
      calendars: connectedCalendars,
      loading: false,
      error: null,
      draftEvent: null,
      editorOpen: false,
      setView: (view) => set({ view }),
      setCurrentDate: (date) => set({ currentDate: startOfDay(date) }),
      setSelectedDate: (date) => set({ selectedDate: date ? startOfDay(date) : null }),
      goToToday: () => set({ currentDate: startOfDay(new Date()), selectedDate: startOfDay(new Date()) }),
      nextPeriod: () => {
        const { currentDate, view } = get();
        const nextDate = view === 'month' ? addMonths(currentDate, 1) : view === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1);
        set({ currentDate: nextDate });
      },
      prevPeriod: () => {
        const { currentDate, view } = get();
        const nextDate = view === 'month' ? addMonths(currentDate, -1) : view === 'week' ? addWeeks(currentDate, -1) : addDays(currentDate, -1);
        set({ currentDate: nextDate });
      },
      openEditor: (date = get().selectedDate || get().currentDate, event = null) => {
        const baseDate = date ? new Date(date) : new Date();
        const draft = event
          ? {
              id: event.id,
              title: event.title,
              description: event.description ?? '',
              calendar: event.calendar ?? 'google',
              color: event.color ?? '#4f72e8',
              location: event.location ?? '',
              startDate: dateStringFromDate(new Date(event.start)),
              startTime: `${String(new Date(event.start).getHours()).padStart(2, '0')}:${String(new Date(event.start).getMinutes()).padStart(2, '0')}`,
              endDate: dateStringFromDate(new Date(event.end)),
              endTime: `${String(new Date(event.end).getHours()).padStart(2, '0')}:${String(new Date(event.end).getMinutes()).padStart(2, '0')}`,
            }
          : buildDefaultDraft(baseDate);

        set({ draftEvent: draft, editorOpen: true, selectedDate: startOfDay(baseDate) });
      },
      closeEditor: () => set({ draftEvent: null, editorOpen: false }),
      setDraftField: (field, value) => set((state) => ({ draftEvent: state.draftEvent ? { ...state.draftEvent, [field]: value } : state.draftEvent })),
      addEvent: (payload) =>
        set((state) => {
          const nextEvent = normalizeEvent({
            id: Date.now(),
            ...payload,
          });

          return { events: sortEvents([...state.events, nextEvent]), error: null };
        }),
      updateEvent: (id, payload) =>
        set((state) => ({
          events: sortEvents(
            state.events.map((event) =>
              event.id === id
                ? normalizeEvent({
                    ...event,
                    ...payload,
                    id: event.id,
                  })
                : event,
            ),
          ),
          error: null,
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          error: null,
        })),
      fetchEvents: async () => {
        set({ loading: true, error: null });
        try {
          set({ events: sortEvents(julyEvents), calendars: connectedCalendars, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'No se pudo cargar el calendario.', loading: false });
        }
      },
      saveDraftEvent: () => {
        const { draftEvent, addEvent, updateEvent, closeEditor } = get();

        if (!draftEvent) {
          return;
        }

        const payload = {
          title: draftEvent.title.trim(),
          description: draftEvent.description.trim(),
          calendar: draftEvent.calendar,
          color: draftEvent.color,
          location: draftEvent.location.trim(),
          start: dateTimeFromParts(draftEvent.startDate, draftEvent.startTime).toISOString(),
          end: dateTimeFromParts(draftEvent.endDate, draftEvent.endTime).toISOString(),
        };

        if (draftEvent.id) {
          updateEvent(draftEvent.id, payload);
        } else {
          addEvent(payload);
        }

        closeEditor();
      },
    }),
    {
      name: 'luma-calendar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentDate: state.currentDate.toISOString(),
        view: state.view,
        selectedDate: state.selectedDate ? state.selectedDate.toISOString() : null,
        events: state.events,
        calendars: state.calendars,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.currentDate = state.currentDate ? new Date(state.currentDate) : new Date('2026-07-23T00:00:00.000Z');
        state.selectedDate = state.selectedDate ? new Date(state.selectedDate) : null;
        state.events = sortEvents((state.events || julyEvents).map(normalizeEvent));
        state.calendars = state.calendars || connectedCalendars;
      },
    },
  ),
);
