import { useState } from 'react';
import { IconBrandGoogle, IconBrandWindows, IconCircleCheck, IconCloud, IconDeviceDesktop, IconLogout, IconSettings, IconSun } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import PillToggle from '../components/ui/PillToggle';
import Switch from '../components/ui/Switch';
import { useThemeStore } from '../store/themeStore';
import { useCalendarStore } from '../store/calendarStore';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle, loginWithOutlook, logout as authLogout } from '../services/authService';

function CalendarConnectionRow({ calendar, onConnect, onDisconnect }) {
  const ProviderIcon = calendar.id === 'google' ? IconBrandGoogle : IconBrandWindows;

  return (
    <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-border-soft bg-surface-2 px-4 py-3">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: calendar.color, opacity: calendar.connected ? 1 : 0.45 }} />
      <ProviderIcon size={18} className="text-text-secondary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{calendar.label}</p>
        <p className="text-[11px] text-text-secondary">{calendar.connected ? 'Conectado' : 'Desconectado'}</p>
      </div>
      <button
        type="button"
        onClick={calendar.connected ? onDisconnect : onConnect}
        className={`min-h-11 rounded-2xl border px-4 py-2 text-sm font-medium transition-colors duration-200 ${calendar.connected ? 'border-danger/30 text-danger hover:bg-danger-bg' : 'border-border-soft text-text-primary hover:bg-surface-1'}`}
      >
        {calendar.connected ? 'Desconectar' : 'Conectar'}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const { theme, accent, setTheme, setAccent } = useThemeStore();
  const { calendars, setCalendarConnection } = useCalendarStore();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [busyWeeksEnabled, setBusyWeeksEnabled] = useState(false);
  const [advance, setAdvance] = useState('2d');

  const previewAccentClass = accent === 'warm' ? 'bg-warning-bg text-warning-text' : 'bg-accent-bg text-accent-text';

  const handleProviderConnect = async (provider) => {
    const session = provider === 'google' ? await loginWithGoogle() : await loginWithOutlook();
    if (session?.token) {
      window.localStorage.setItem('luma_token', session.token);
    }
    setCalendarConnection(provider, true);
  };

  const handleDisconnect = (provider) => {
    setCalendarConnection(provider, false);
  };

  const handleLogout = async () => {
    await authLogout();
    clearSession();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface-0 px-4 py-5 text-text-primary sm:px-6">
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
                  <Avatar name={user?.name ?? 'Diego Artavia'} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{user?.name ?? 'Diego Artavia'}</p>
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
            {calendars.map((calendar) => (
              <CalendarConnectionRow
                key={calendar.id}
                calendar={calendar}
                onConnect={() => handleProviderConnect(calendar.id)}
                onDisconnect={() => handleDisconnect(calendar.id)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border-soft bg-surface-1 p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <IconSun size={16} className="text-accent" />
            Notificaciones
          </div>
          <div className="mt-4 space-y-3">
            <Switch checked={remindersEnabled} onChange={setRemindersEnabled} label="Recordatorios antes de entregas" />
            <Switch checked={busyWeeksEnabled} onChange={setBusyWeeksEnabled} label="Alertas de semanas cargadas" />
            <label className="flex min-h-11 items-center justify-between rounded-2xl border border-border-soft bg-surface-2 px-4 py-3 text-sm text-text-primary">
              <span>Con cuánta anticipación</span>
              <select value={advance} onChange={(event) => setAdvance(event.target.value)} className="bg-transparent text-sm text-text-primary outline-none">
                <option value="1d">1 día</option>
                <option value="2d">2 días</option>
                <option value="7d">1 semana</option>
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
            <Avatar name={user?.name ?? 'Diego Artavia'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user?.name ?? 'Diego Artavia'}</p>
              <p className="truncate text-[11px] text-text-secondary">{user?.email ?? 'diego.artavia@ulacit.ac.cr'}</p>
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