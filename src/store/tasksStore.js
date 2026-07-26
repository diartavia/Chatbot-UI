import { create } from 'zustand';
import { createTask as createTaskService, deleteTask as deleteTaskService, getTasks, updateTask as updateTaskService } from '../services/tasksService';

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
      set({ loading: false, error: error?.response?.data?.detail ?? error?.message ?? 'No se pudieron cargar las tareas.' });
      return [];
    }
  },
  createTask: async (task) => {
    try {
      const created = normalizeTask(await createTaskService(task), get().data.length);
      set((state) => ({ data: [...state.data, created] }));
      return created;
    } catch (error) {
      set({ error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo crear la tarea.' });
      throw error;
    }
  },
  updateTask: async (id, data) => {
    try {
      const updated = normalizeTask(await updateTaskService(id, data), id);
      set((state) => ({ data: state.data.map((task) => (task.id === id ? { ...task, ...updated } : task)) }));
      return updated;
    } catch (error) {
      set({ error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo actualizar la tarea.' });
      throw error;
    }
  },
  deleteTask: async (id) => {
    try {
      await deleteTaskService(id);
      set((state) => ({ data: state.data.filter((task) => task.id !== id) }));
    } catch (error) {
      set({ error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo eliminar la tarea.' });
      throw error;
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