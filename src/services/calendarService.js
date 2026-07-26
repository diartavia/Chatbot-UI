import api from './api';

export async function getEvents(month, year) {
  const response = await api.get('/api/events', {
    params: { month, year },
  });

  return response.data;
}

export async function createEvent(event) {
  const response = await api.post('/api/events', event);
  return response.data;
}

export async function updateEvent(id, data) {
  const response = await api.put(`/api/events/${id}`, data);
  return response.data;
}

export async function deleteEvent(id) {
  const response = await api.delete(`/api/events/${id}`);
  return response.data;
}