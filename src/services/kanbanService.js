import api from './api';

export async function getCards() {
  const response = await api.get('/api/kanban/cards');
  return response.data;
}

export async function createCard(card) {
  const response = await api.post('/api/kanban/cards', card);
  return response.data;
}

export async function updateCard(id, data) {
  const response = await api.put(`/api/kanban/cards/${id}`, data);
  return response.data;
}

export async function deleteCard(id) {
  const response = await api.delete(`/api/kanban/cards/${id}`);
  return response.data;
}