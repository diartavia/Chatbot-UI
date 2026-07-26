import { IconCalendar, IconCheckbox, IconColumns, IconMessage, IconSparkles } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle as authLoginWithGoogle, loginWithOutlook as authLoginWithOutlook } from '../services/authService';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.664 32.657 29.307 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.96 3.042l5.657-5.657C34.043 6.053 29.368 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.96 3.042l5.657-5.657C34.043 6.053 29.368 4 24 4c-7.629 0-14.272 4.31-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.268 0 9.85-1.788 13.114-4.862l-6.05-4.977C29.024 35.353 26.655 36 24 36c-5.286 0-9.628-3.316-11.286-7.946l-6.522 5.024C9.558 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.019 2.716-2.966 4.851-5.239 6.161l.003-.002 6.05 4.977C35.7 37.988 44 32 44 24c0-1.341-.138-2.651-.389-3.917z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, setSession } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = async (provider) => {
    const session = provider === 'google' ? await authLoginWithGoogle() : await authLoginWithOutlook();
    if (session) {
      if (session.token) {
        window.localStorage.setItem('luma_token', session.token);
      }
      setSession(session);
      navigate('/chat', { replace: true });
    }
  };

  return (
    <div className="welcome-entrance flex min-h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-b from-surface-0 to-surface-1 px-4 text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-white shadow-soft sm:h-[72px] sm:w-[72px]">
              <IconSparkles size={48} />
            </div>
            <h1 className="text-[36px] font-bold tracking-[-0.04em] text-text-primary sm:text-[44px]">Luma</h1>
          </div>

          <p className="mt-5 text-xl font-medium text-text-primary sm:text-3xl">Tu organizador universitario inteligente</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Conectá tu calendario, gestioná tus tareas y dejá que la IA te ayude a nunca perderte una entrega.
          </p>

          <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <button type="button" className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90" onClick={() => handleLogin('google')}>
              <GoogleLogo />
              Empezar con Google
            </button>
            <button type="button" className="inline-flex min-h-12 flex-1 items-center justify-center gap-3 rounded-2xl border border-border-soft bg-surface-2 px-6 py-3 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-surface-1" onClick={() => handleLogin('outlook')}>
              <MicrosoftLogo />
              Continuar con Microsoft
            </button>
          </div>

          <p className="mt-4 text-[11px] text-text-muted sm:text-sm">Solo para estudiantes de ULACIT · OAuth 2.0 seguro</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="animate-[fadeUp_.55s_ease-both] rounded-3xl border border-border-soft bg-surface-2/80 p-4 text-left shadow-soft backdrop-blur-sm">
            <IconCalendar size={22} className="text-accent" />
            <h2 className="mt-3 text-base font-semibold text-text-primary">Calendario inteligente</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Conectá Google Calendar y Outlook en un solo lugar</p>
          </article>
          <article className="animate-[fadeUp_.7s_ease-both] rounded-3xl border border-border-soft bg-surface-2/80 p-4 text-left shadow-soft backdrop-blur-sm">
            <IconSparkles size={22} className="text-accent" />
            <h2 className="mt-3 text-base font-semibold text-text-primary">IA conversacional</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Hablale en lenguaje natural para gestionar tus compromisos</p>
          </article>
          <article className="animate-[fadeUp_.85s_ease-both] rounded-3xl border border-border-soft bg-surface-2/80 p-4 text-left shadow-soft backdrop-blur-sm">
            <IconCheckbox size={22} className="text-accent" />
            <h2 className="mt-3 text-base font-semibold text-text-primary">Sin olvidados</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Recordatorios proactivos antes de que se te acumule todo</p>
          </article>
        </section>
      </div>
    </div>
  );
}