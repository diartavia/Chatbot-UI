import { http, HttpResponse } from 'msw';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const conversation = [
  { id: 1, role: 'assistant', content: 'Hola Diego, revisé tus pendientes de la semana y ya detecté los puntos más urgentes.', timestamp: '2026-07-23T08:00:00.000Z' },
  { id: 2, role: 'user', content: 'Necesito un plan para el parcial de IA y el avance del proyecto.', timestamp: '2026-07-23T08:01:00.000Z' },
  { id: 3, role: 'assistant', content: 'Perfecto. Te separo bloques de estudio y te ordeno el avance por prioridad.', timestamp: '2026-07-23T08:02:00.000Z' },
  { id: 4, role: 'user', content: 'También quiero dejar libre el jueves para no chocar con el lab.', timestamp: '2026-07-23T08:03:00.000Z' },
];

const tasks = [
  { id: 1, title: 'Preparar resumen para el parcial de IA', subtitle: 'Inteligencia Artificial · Personal', status: 'todo', due_date: '2026-07-23T18:00:00.000Z', priority: 'urgent', category: 'IA' },
  { id: 2, title: 'Parcial de Inteligencia Artificial', subtitle: 'Examen · Presencial', status: 'todo', due_date: '2026-07-23T18:00:00.000Z', priority: 'urgent', category: 'Examen' },
  { id: 3, title: 'Avance 2 — arquitectura del sistema', subtitle: 'Proyecto grupal · 6 integrantes', status: 'inprogress', due_date: '2026-07-24T23:59:00.000Z', priority: 'normal', category: 'Proyecto' },
  { id: 4, title: 'Laboratorio Base de Datos #3', subtitle: 'Afinamiento de Bases de Datos', status: 'todo', due_date: '2026-07-25T23:59:00.000Z', priority: 'normal', category: 'Base de Datos' },
  { id: 5, title: 'Avance 1 — plan de trabajo', subtitle: 'Proyecto · Entregado', status: 'done', due_date: '2026-07-18T12:00:00.000Z', priority: 'low', category: 'Proyecto' },
  { id: 6, title: 'Diagrama de flujo del chatbot', subtitle: 'Proyecto · Entregado', status: 'done', due_date: '2026-07-19T12:00:00.000Z', priority: 'low', category: 'Proyecto' },
];

const events = [
  { id: 1, title: 'Estudio parcial IA', start: '2026-07-23T19:00:00.000Z', end: '2026-07-23T21:00:00.000Z', calendar: 'google', color: '#4f72e8' },
  { id: 2, title: 'Avance 2 — revisión', start: '2026-07-23T21:00:00.000Z', end: '2026-07-23T22:00:00.000Z', calendar: 'outlook', color: '#d97706' },
  { id: 3, title: 'Parcial de IA', start: '2026-07-22T18:00:00.000Z', end: '2026-07-22T19:30:00.000Z', calendar: 'google', color: '#dc2626' },
  { id: 4, title: 'Avance 2', start: '2026-07-24T23:59:00.000Z', end: '2026-07-25T00:30:00.000Z', calendar: 'outlook', color: '#d97706' },
];

const kanbanCards = [
  { id: 1, title: 'Leer capítulo 7 — Redes Neuronales', category: 'IA', due_date: '2026-07-26T12:00:00.000Z', column: 'todo' },
  { id: 2, title: 'Preparar preguntas para el parcial', category: 'IA', due_date: null, column: 'todo' },
  { id: 3, title: 'Revisar APIs de Google Calendar', category: 'Proyecto', due_date: null, column: 'todo' },
  { id: 4, title: 'Avance 2 — arquitectura del sistema', category: 'Proyecto', due_date: '2026-07-24T23:59:00.000Z', column: 'inprogress' },
  { id: 5, title: 'Parcial de Inteligencia Artificial', category: 'Examen', due_date: '2026-07-23T18:00:00.000Z', column: 'inprogress' },
  { id: 6, title: 'Avance 1 — plan de trabajo', category: 'Proyecto', due_date: null, column: 'done' },
];

const calendars = [
  { id: 'google', label: 'Google Calendar', connected: true, color: '#4285f4' },
  { id: 'outlook', label: 'Outlook ULACIT', connected: true, color: '#0078d4' },
];

export const handlers = [
  http.get('http://localhost:8000/api/chat', async () => {
    await delay();
    return HttpResponse.json(conversation);
  }),
  http.post('http://localhost:8000/api/chat', async ({ request }) => {
    await delay();
    const body = await request.json();
    const message = body?.message ?? '';
    return HttpResponse.json({ role: 'assistant', content: `Procesé tu mensaje: ${message}.`, timestamp: new Date().toISOString() });
  }),
  http.put('http://localhost:8000/api/chat/:id', async ({ params, request }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), ...(await request.json()) });
  }),
  http.delete('http://localhost:8000/api/chat/:id', async ({ params }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), deleted: true });
  }),
  http.get('http://localhost:8000/api/tasks', async () => {
    await delay();
    return HttpResponse.json(tasks);
  }),
  http.post('http://localhost:8000/api/tasks', async ({ request }) => {
    await delay();
    return HttpResponse.json({ id: Date.now(), ...(await request.json()) });
  }),
  http.put('http://localhost:8000/api/tasks/:id', async ({ params, request }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), ...(await request.json()) });
  }),
  http.delete('http://localhost:8000/api/tasks/:id', async ({ params }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), deleted: true });
  }),
  http.get('http://localhost:8000/api/events', async () => {
    await delay();
    return HttpResponse.json({ events, calendars });
  }),
  http.post('http://localhost:8000/api/events', async ({ request }) => {
    await delay();
    return HttpResponse.json({ id: Date.now(), ...(await request.json()) });
  }),
  http.put('http://localhost:8000/api/events/:id', async ({ params, request }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), ...(await request.json()) });
  }),
  http.delete('http://localhost:8000/api/events/:id', async ({ params }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), deleted: true });
  }),
  http.get('http://localhost:8000/api/kanban/cards', async () => {
    await delay();
    return HttpResponse.json(kanbanCards);
  }),
  http.post('http://localhost:8000/api/kanban/cards', async ({ request }) => {
    await delay();
    return HttpResponse.json({ id: Date.now(), ...(await request.json()) });
  }),
  http.put('http://localhost:8000/api/kanban/cards/:id', async ({ params, request }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), ...(await request.json()) });
  }),
  http.delete('http://localhost:8000/api/kanban/cards/:id', async ({ params }) => {
    await delay();
    return HttpResponse.json({ id: Number(params.id), deleted: true });
  }),
  http.post('http://localhost:8000/api/auth/google/login', async () => {
    await delay();
    return HttpResponse.json({ token: 'mock-google-token', user: { name: 'Diego Artavia', email: 'diego@example.com', provider: 'google' } });
  }),
  http.post('http://localhost:8000/api/auth/outlook/login', async () => {
    await delay();
    return HttpResponse.json({ token: 'mock-outlook-token', user: { name: 'Diego Artavia', email: 'diego@example.com', provider: 'outlook' } });
  }),
  http.post('http://localhost:8000/api/auth/logout', async () => {
    await delay();
    return HttpResponse.json({ ok: true });
  }),
  http.get('http://localhost:8000/api/auth/profile', async ({ request }) => {
    await delay();
    const auth = request.headers.get('authorization');
    if (!auth) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({ user: { name: 'Diego Artavia', email: 'diego@example.com', provider: 'google' } });
  }),
];