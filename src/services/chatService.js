import api from './api';

export async function sendMessage(message, conversationHistory) {
  const response = await api.post('/api/chat', {
    message,
    history: conversationHistory,
  });

  return response.data;
}

export async function getConversation() {
  const response = await api.get('/api/chat');
  return response.data;
}

export async function updateMessage(id, data) {
  const response = await api.put(`/api/chat/${id}`, data);
  return response.data;
}

export async function deleteMessage(id) {
  const response = await api.delete(`/api/chat/${id}`);
  return response.data;
}