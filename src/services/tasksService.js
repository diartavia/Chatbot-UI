import api from './api';

export async function getTasks() {
  const response = await api.get('/api/tasks');
  return response.data;
}

export async function createTask(task) {
  const response = await api.post('/api/tasks', task);
  return response.data;
}

export async function updateTask(id, data) {
  const response = await api.put(`/api/tasks/${id}`, data);
  return response.data;
}

export async function deleteTask(id) {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
}