import { useEffect, useMemo, useRef, useState } from 'react';
import { IconBrandGoogle, IconBrandWindows, IconCircleCheck, IconCloud, IconDeviceDesktop, IconLogout, IconSettings, IconSun } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import PillToggle from '../components/ui/PillToggle';
import Switch from '../components/ui/Switch';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../context/AuthContext';
import {
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  getUserPreferences,
  loginWithGoogle,
  loginWithOutlook,
  logout as authLogout,
  updateUserPreferences,
} from '../services/authService';

const advanceOptions = [
  { label: '1 día', value: 1 },
  { label: '2 días', value: 2 },
  { label: '1 semana', value: 7 },
];

function CalendarConnectionRow({ calendar, onConnect, onDisconnect, loading = false, retry, disabled = false }) {
  const ProviderIcon = calendar.id === 'google' ? IconBrandGoogle : IconBrandWindows;

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-border-soft bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-surface-1" />
          <div className="h-4 w-4 rounded bg-surface-1" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-surface-1" />
            <div className="h-3 w-24 rounded bg-surface-1" />
          </div>
          <div className="h-10 w-28 rounded-2xl bg-surface-1" />
        </div>
      </div>
    );
  }

  if (calendar.id === 'google' && calendar.error) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-text-muted/50" />
          <ProviderIcon size={18} className="text-text-secondary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">{calendar.label}</p>
            <p className="text-[11px] text-text-secondary">No se pudo verificar el estado</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-2xl border border-border-soft px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-surface-1"
          >
            Reintentar
          </button>
        </div>
        <p className="mt-2 text-[11px] text-danger">{calendar.error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-border-soft bg-surface-2 px-4 py-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: calendar.connected ? calendar.color : '#94a3b8', opacity: calendar.connected ? 1 : 0.45 }} />
      <ProviderIcon size={18} className="text-text-secondary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{calendar.label}</p>
        <p className="text-[11px] text-text-secondary">{calendar.connected ? 'Conectado' : 'No conectado'}</p>
      </div>
      {calendar.id === 'google' ? (
        <button
          type="button"
          onClick={calendar.connected ? onDisconnect : onConnect}
          disabled={disabled}
          className={`min-h-11 rounded-2xl border px-4 py-2 text-sm font-medium transition-colors duration-200 ${calendar.connected ? 'border-danger/30 text-danger hover:bg-danger-bg' : 'border-border-soft text-text-primary hover:bg-surface-1'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {calendar.connected ? 'Desconectar' : 'Conectar'}
        </button>
      ) : (
        <button
          type="button"
          title="Próximamente"
          disabled
          className="min-h-11 cursor-not-allowed rounded-2xl border border-border-soft px-4 py-2 text-sm font-medium text-text-muted opacity-70"
        >
          Próximamente
        </button>
      )}
    </div>
  );
}

function NotificationToggleRow({ label, description, checked, disabled, onChange }) {
  return (
    <div className={`rounded-2xl border border-border-soft bg-surface-2 px-4 py-3 transition ${disabled ? 'opacity-50' : ''}`}>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
      <p className="mt-2 text-[11px] text-text-secondary">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const { theme, accent, setTheme, setAccent } = useThemeStore();

  const [googleConnection, setGoogleConnection] = useState({ connected: false, loading: true, error: '', email: null });
  const [preferences, setPreferences] = useState({ reminders_enabled: true, overload_alerts_enabled: false, advance_days: 2 });
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [googleDisconnecting, setGoogleDisconnecting] = useState(false);
  const [toast, setToast] = useState(null);
  const lastPreferencesRef = useRef(preferences);

  const previewAccentClass = accent === 'warm' ? 'bg-warning-bg text-warning-text' : 'bg-accent-bg text-accent-text';

  useEffect(() => {
    let active = true;

    const loadGoogleStatus = async () => {
      setGoogleConnection((state) => ({ ...state, loading: true, error: '' }));
      try {
        const status = await getGoogleCalendarStatus();
        if (!active) return;
        setGoogleConnection({
          connected: Boolean(status?.connected),
          loading: false,
          error: '',
          email: status?.email ?? null,
        });
      } catch (error) {
        if (!active) return;
        const message = error?.response?.status === 503 ? 'Servicio no disponible' : 'No se pudo verificar el estado';
        setGoogleConnection({ connected: false, loading: false, error: message, email: null });
      }
    };

    const loadPreferences = async () => {
      setPreferencesLoading(true);
      try {
        const data = await getUserPreferences();
        if (!active) return;
        const nextPreferences = {
          reminders_enabled: Boolean(data?.reminders_enabled),
          overload_alerts_enabled: Boolean(data?.overload_alerts_enabled),
          advance_days: Number(data?.advance_days ?? 2),
        };
        setPreferences(nextPreferences);
        lastPreferencesRef.current = nextPreferences;
      } catch (error) {
        if (!active) return;
        setToast({ type: 'error', message: error?.message ?? 'No se pudieron cargar las preferencias.' });
      } finally {
        if (active) {
          setPreferencesLoading(false);
        }
      }
    };

    loadGoogleStatus();
    loadPreferences();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (message) => setToast({ type: 'error', message });

  const persistPreferences = async (nextPreferences, previousPreferences) => {
    setPreferencesSaving(true);
    try {
      const saved = await updateUserPreferences(nextPreferences);
      const normalized = {
        reminders_enabled: Boolean(saved?.reminders_enabled),
        overload_alerts_enabled: Boolean(saved?.overload_alerts_enabled),
        advance_days: Number(saved?.advance_days ?? nextPreferences.advance_days),
      };
      setPreferences(normalized);
      lastPreferencesRef.current = normalized;
    } catch (error) {
      setPreferences(previousPreferences);
      showToast(error?.response?.data?.detail ?? error?.message ?? 'No se pudo guardar la preferencia.');
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    if (preferencesLoading || preferencesSaving) {
      return;
    }

    const previousPreferences = preferences;
    const nextPreferences = { ...preferences, [field]: value };
    setPreferences(nextPreferences);
    persistPreferences(nextPreferences, previousPreferences);
  };

  const handleGoogleConnect = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      showToast(error?.response?.data?.detail ?? error?.message ?? 'No se pudo iniciar la conexión con Google Calendar.');
    }
  };

  const refreshGoogleStatus = async () => {
    setGoogleConnection((state) => ({ ...state, loading: true, error: '' }));
    try {
      const status = await getGoogleCalendarStatus();
      setGoogleConnection({
        connected: Boolean(status?.connected),
        loading: false,
        error: '',
        email: status?.email ?? null,
      });
    } catch (error) {
      const message = error?.response?.status === 503 ? 'Servicio no disponible' : 'No se pudo verificar el estado';
      setGoogleConnection({ connected: false, loading: false, error: message, email: null });
    }
  };

  const handleGoogleDisconnect = async () => {
    const confirmed = window.confirm('¿Seguro? Esto eliminará el acceso al calendario.');
    if (!confirmed) {
      return;
    }

    setGoogleDisconnecting(true);
    try {
      await disconnectGoogleCalendar();
      setGoogleConnection({ connected: false, loading: false, error: '', email: null });
    } catch (error) {
      showToast(error?.response?.data?.detail ?? error?.message ?? 'No se pudo desconectar Google Calendar.');
    } finally {
      setGoogleDisconnecting(false);
    }
  };

  const handleLogout = async () => {
    void authLogout().catch(() => {});
    window.localStorage.removeItem('luma_token');
    clearSession();
    navigate('/welcome', { replace: true });
  };

  const calendarRows = useMemo(
    () => [
      { id: 'google', label: 'Google Calendar', connected: googleConnection.connected, color: '#4285f4', error: googleConnection.error },
      { id: 'outlook', label: 'Outlook ULACIT', connected: true, color: '#0078d4', mock: true },
    ],
    [googleConnection.connected, googleConnection.error],
  );

  const accountName = user?.name ?? 'Diego Artavia';
  const accountEmail = user?.email ?? 'diego.artavia@ulacit.ac.cr';

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface-0 px-4 py-5 text-text-primary sm:px-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger-text shadow-soft">
          {toast.message}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <IconSettings size={16} />
            <span className="text-sm font-medium">Ajustes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-text-primary">Personalizá tu experiencia en Luma</h1>
        </header>

        <section className="rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <IconDeviceDesktop size={16} className="text-accent" />
            Apariencia
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Tema</p>
                <p className="text-[11px] text-text-secondary">Elegí entre claro y oscuro</p>
              </div>
              <PillToggle
                size="lg"
                ariaLabel="Selector de tema"
                value={theme}
                onChange={setTheme}
                options={[
                  { label: 'Claro', value: 'light' },
                  { label: 'Oscuro', value: 'dark' },
                ]}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Color</p>
                <p className="text-[11px] text-text-secondary">Frío o cálido según tu estilo</p>
              </div>
              <PillToggle
                size="lg"
                ariaLabel="Selector de color"
                value={accent}
                onChange={setAccent}
                options={[
                  { label: 'Frío', value: 'cool' },
                  { label: 'Cálido', value: 'warm' },
                ]}
              />
            </div>

            <div className="rounded-3xl border border-border-soft bg-surface-2 p-4">
              <p className="mb-3 text-sm font-medium text-text-primary">Vista previa</p>
              <div className={`rounded-2xl border border-border-soft p-4 transition-colors duration-200 ${theme === 'dark' ? 'bg-surface-0' : 'bg-surface-1'}`}>
                <div className="flex items-center gap-3">
                  <Avatar name={accountName} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{accountName}</p>
                    <p className="text-[11px] text-text-secondary">Preview de la interfaz con el tema actual</p>
                  </div>
                  <span className={`ml-auto rounded-full px-3 py-1 text-[11px] font-medium ${previewAccentClass}`}>Luma</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <IconCloud size={16} className="text-accent" />
            Calendarios conectados
          </div>
          <div className="mt-4 space-y-3">
            {calendarRows.map((calendar) => (
              <CalendarConnectionRow
                key={calendar.id}
                calendar={calendar}
                loading={calendar.id === 'google' && googleConnection.loading}
                disabled={calendar.id === 'google' && googleDisconnecting}
                retry={refreshGoogleStatus}
                onConnect={handleGoogleConnect}
                onDisconnect={handleGoogleDisconnect}
              />
            ))}
          </div>
        </section>

        <section className={`rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft ${preferencesLoading ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <IconSun size={16} className="text-accent" />
            Notificaciones
          </div>
          <div className="mt-4 space-y-3">
            <NotificationToggleRow
              label="Recordatorios antes de entregas"
              description="Se sincroniza con el backend para mantener tus alertas activas."
              checked={preferences.reminders_enabled}
              disabled={preferencesLoading || preferencesSaving}
              onChange={(value) => handlePreferenceChange('reminders_enabled', value)}
            />
            <NotificationToggleRow
              label="Alertas de semanas cargadas"
              description="Recibe avisos cuando la semana esté demasiado llena."
              checked={preferences.overload_alerts_enabled}
              disabled={preferencesLoading || preferencesSaving}
              onChange={(value) => handlePreferenceChange('overload_alerts_enabled', value)}
            />
            <label className={`flex min-h-11 items-center justify-between rounded-2xl border border-border-soft bg-surface-2 px-4 py-3 text-sm text-text-primary transition-opacity duration-200 ${preferencesLoading || preferencesSaving ? 'opacity-50' : ''}`}>
              <span>Con cuánta anticipación</span>
              <select
                value={String(preferences.advance_days)}
                onChange={(event) => handlePreferenceChange('advance_days', Number(event.target.value))}
                disabled={preferencesLoading || preferencesSaving}
                className="bg-transparent text-sm text-text-primary outline-none disabled:cursor-not-allowed"
              >
                {advanceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <IconCircleCheck size={16} className="text-accent" />
            Cuenta
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border-soft bg-surface-2 p-4">
            <Avatar name={accountName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{accountName}</p>
              <p className="truncate text-[11px] text-text-secondary">{accountEmail}</p>
            </div>
            <button type="button" onClick={handleLogout} className="min-h-11 rounded-2xl border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors duration-200 hover:bg-danger-bg">
              <span className="inline-flex items-center gap-2"><IconLogout size={15} /> Cerrar sesión</span>
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft">
          <div className="space-y-2 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">Sobre Luma</p>
            <p>Luma v0.1.0 · Proyecto universitario · ULACIT · II Cuatrimestre 2026</p>
            <p>Desarrollado por: Keyci Campos, Diego Artavia, Sebastián Vargas, Carlos Campos, Julián Castro, Tomás Angulo</p>
          </div>
        </section>
      </div>
    </div>
  );
}
