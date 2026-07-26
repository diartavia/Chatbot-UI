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

export async function loginWithGoogle() {
  if (useMocks) {
    return demoUser('google');
  }

  const response = await api.post('/api/auth/google/login');
  return response.data;
}

export async function loginWithOutlook() {
  if (useMocks) {
    return demoUser('outlook');
  }

  const response = await api.post('/api/auth/outlook/login');
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
  if (useMocks) {
    const token = window.localStorage.getItem('luma_token');
    if (!token) {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      throw error;
    }

    return { user: demoUser('google').user };
  }

  const response = await api.get('/api/auth/profile');
  return response.data;
}