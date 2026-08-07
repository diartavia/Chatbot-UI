import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const demoUser = (provider) => ({
  token: `mock-${provider}-token`,
  user: {
    name: 'Diego Artavia',
    email: 'diego.artavia@ulacit.ac.cr',
    provider,
  },
});

function base64UrlToBase64(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  return normalized + (padding ? '='.repeat(4 - padding) : '');
}

export function decodeAuthToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  if (token.startsWith('mock-google-token')) {
    return demoUser('google').user;
  }

  if (token.startsWith('mock-outlook-token')) {
    return demoUser('outlook').user;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadJson = window.atob(base64UrlToBase64(parts[1]));
    const payload = JSON.parse(payloadJson);
    return {
      name: payload.name ?? payload.email ?? 'Diego Artavia',
      email: payload.email ?? 'diego.artavia@ulacit.ac.cr',
      provider: payload.provider ?? 'google',
      calendar_connected: Boolean(payload.calendar_connected),
      user_key: payload.sub ?? payload.google_sub ?? payload.email ?? null,
    };
  } catch {
    return null;
  }
}

export async function loginWithGoogle() {
  if (useMocks) {
    return demoUser('google');
  }

  window.location.assign(`${api.defaults.baseURL}/api/auth/google`);
  return null;
}

export async function loginWithOutlook() {
  if (useMocks) {
    return demoUser('outlook');
  }

  return demoUser('outlook');
}

export async function disconnectGoogleCalendar() {
  if (useMocks) {
    return { ok: true };
  }

  const response = await api.post('/api/auth/google/disconnect');
  return response.data;
}

export async function logout() {
  if (useMocks) {
    return { ok: true };
  }

  const response = await api.post('/api/auth/logout');
  return response.data;
}

export async function getProfile() {
  const token = window.localStorage.getItem('luma_token');
  if (!token) {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    throw error;
  }

  const user = decodeAuthToken(token);
  if (user) {
    return { user };
  }

  if (useMocks) {
    return { user: demoUser('google').user };
  }

  const error = new Error('No se pudo leer la sesión.');
  error.response = { status: 401 };
  throw error;
}

export async function getGoogleCalendarStatus() {
  if (useMocks) {
    const token = window.localStorage.getItem('luma_token');
    const user = decodeAuthToken(token);
    return {
      connected: Boolean(token),
      email: user?.email ?? null,
      user_key: user?.user_key ?? user?.email ?? null,
    };
  }

  const response = await api.get('/api/auth/google/status');
  return response.data;
}

export async function getUserPreferences() {
  if (useMocks) {
    return {
      reminders_enabled: true,
      overload_alerts_enabled: false,
      advance_days: 2,
    };
  }

  const response = await api.get('/api/user/preferences');
  return response.data;
}

export async function updateUserPreferences(preferences) {
  if (useMocks) {
    return preferences;
  }

  const response = await api.patch('/api/user/preferences', preferences);
  return response.data;
}