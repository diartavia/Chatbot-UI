import { create } from 'zustand';
import { createTask as createTaskService, deleteTask as deleteTaskService, getTasks, updateTask as updateTaskService } from '../services/tasksService';

const seedTasks = [
  { id: 1, title: 'Preparar resumen para el parcial de IA', subtitle: 'Inteligencia Artificial · Personal', status: 'todo', due_date: '2026-07-23T18:00:00.000Z', priority: 'urgent', category: 'IA' },
  { id: 2, title: 'Parcial de Inteligencia Artificial', subtitle: 'Examen · Presencial', status: 'todo', due_date: '2026-07-23T18:00:00.000Z', priority: 'urgent', category: 'Examen' },
  { id: 3, title: 'Avance 2 — arquitectura del sistema', subtitle: 'Proyecto grupal · 6 integrantes', status: 'inprogress', due_date: '2026-07-24T23:59:00.000Z', priority: 'normal', category: 'Proyecto' },
  { id: 4, title: 'Laboratorio Base de Datos #3', subtitle: 'Afinamiento de Bases de Datos', status: 'todo', due_date: '2026-07-25T23:59:00.000Z', priority: 'normal', category: 'Base de Datos' },
  { id: 5, title: 'Avance 1 — plan de trabajo', subtitle: 'Proyecto · Entregado', status: 'done', due_date: '2026-07-18T12:00:00.000Z', priority: 'low', category: 'Proyecto' },
  { id: 6, title: 'Diagrama de flujo del chatbot', subtitle: 'Proyecto · Entregado', status: 'done', due_date: '2026-07-19T12:00:00.000Z', priority: 'low', category: 'Proyecto' },
];

const normalizeTask = (task, index) => ({
  id: task.id ?? index + 1,
  ...task,
});

const sameDay = (left, right) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return leftDate.toDateString() === rightDate.toDateString();
};

const formatTaskLabel = (task) => {
  if (task.status === 'done') {
    return 'Entregado';
  }

  const date = new Date(task.due_date);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  return formatter.format(date).replace('.', '');
};

export const useTasksStore = create((set, get) => ({
  filter: 'all',
  data: [],
  loading: false,
  error: null,
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = (await getTasks()).map(normalizeTask);
      set({ data: tasks, loading: false });
      return tasks;
    } catch (error) {
      const fallbackError = error?.response?.data?.detail ?? error?.message ?? 'No se pudieron cargar las tareas.';
      set({ loading: false, data: seedTasks, error: fallbackError });
      return seedTasks;
    }
  },
  createTask: async (task) => {
    try {
      const created = normalizeTask(await createTaskService(task), get().data.length);
      set((state) => ({ data: [...state.data, created] }));
      return created;
    } catch (error) {
      const created = normalizeTask({ id: Date.now(), ...task }, get().data.length);
      set((state) => ({ data: [...state.data, created], error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo crear la tarea.' }));
      return created;
    }
  },
  updateTask: async (id, data) => {
    try {
      const updated = normalizeTask(await updateTaskService(id, data), id);
      set((state) => ({ data: state.data.map((task) => (task.id === id ? { ...task, ...updated } : task)) }));
      return updated;
    } catch (error) {
      const updated = normalizeTask({ id, ...data }, id);
      set((state) => ({ data: state.data.map((task) => (task.id === id ? { ...task, ...updated } : task)), error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo actualizar la tarea.' }));
      return updated;
    }
  },
  deleteTask: async (id) => {
    try {
      await deleteTaskService(id);
      set((state) => ({ data: state.data.filter((task) => task.id !== id) }));
    } catch (error) {
      set((state) => ({ data: state.data.filter((task) => task.id !== id), error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo eliminar la tarea.' }));
    }
  },
  setFilter: (filter) => set({ filter }),
  toggleTask: async (id) => {
    const currentTask = get().data.find((task) => task.id === id);
    if (!currentTask) {
      return;
    }

    const nextStatus = currentTask.status === 'done' ? 'todo' : 'done';
    const payload = { ...currentTask, status: nextStatus };
    await get().updateTask(id, payload);
  },
  formatTaskLabel,
  isTaskToday: (task) => sameDay(task.due_date, new Date()),
}));