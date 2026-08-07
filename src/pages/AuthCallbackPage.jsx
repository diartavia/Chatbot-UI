import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, clearSession } = useAuth();
  const [message, setMessage] = useState('Procesando acceso con Google...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      clearSession();
      setMessage('No se pudo completar el acceso con Google.');
      navigate('/welcome', { replace: true });
      return;
    }

    if (token) {
      setSession({ token });
      navigate('/chat', { replace: true });
      return;
    }

    setMessage('No se recibió un token válido.');
    navigate('/welcome', { replace: true });
  }, [clearSession, location.search, navigate, setSession]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-0 px-4 text-text-primary">
      <div className="max-w-md rounded-3xl border border-border-soft bg-surface-1 px-6 py-8 text-center shadow-soft">
        <p className="text-sm font-medium text-text-secondary">Autenticación</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-text-primary">{message}</h1>
      </div>
    </div>
  );
}