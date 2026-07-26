import { NavLink } from 'react-router-dom';
import {
  IconCalendar,
  IconColumns,
  IconDroplet,
  IconListCheck,
  IconMessage,
  IconSettings,
  IconSparkles,
  IconSun,
} from '@tabler/icons-react';
import Avatar from '../ui/Avatar';
import PillToggle from '../ui/PillToggle';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/chat', label: 'Chat', icon: IconMessage },
  { to: '/calendar', label: 'Calendario', icon: IconCalendar },
  { to: '/tasks', label: 'Tareas', icon: IconListCheck },
  { to: '/kanban', label: 'Kanban', icon: IconColumns },
];

const recents = [
  '¿Cuándo es el parcial de IA?',
  'Bloque de estudio para hoy',
  'Avance 2 — ayuda con arquitectura',
  '¿Qué tengo esta semana?',
  'Recordatorio para el jueves',
  'Lab de base de datos #3',
];

export default function Sidebar() {
  const { theme, accent, setTheme, setAccent, isSidebarOpen, setSidebarOpen } = useThemeStore();
  const navigate = useNavigate();

  const closeIfMobile = () => {
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  const goToSettings = () => {
    navigate('/settings');
    closeIfMobile();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-[220px] -translate-x-full flex-col border-r border-border-soft bg-surface-1 transition-transform duration-300 sm:relative sm:z-auto sm:translate-x-0 sm:flex sm:w-16 md:w-16 lg:w-[220px] ${isSidebarOpen ? 'translate-x-0' : ''}`}
      onClick={() => {
        if (window.innerWidth < 640) {
          setSidebarOpen(false);
        }
      }}
    >
      <div className="flex flex-col gap-3 px-3 pb-2 pt-3 md:px-2 lg:px-3">
        <div className="flex items-center gap-2 px-1 pb-2 md:justify-center md:px-0 lg:justify-start lg:px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-soft">
            <IconSparkles size={16} stroke={2.1} />
          </div>
          <span className="text-[16px] font-bold tracking-[-0.02em] text-text-primary md:hidden lg:inline">Luma</span>
        </div>

        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-border-soft bg-surface-2 px-3 py-2 text-left text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary md:justify-center md:px-0 lg:justify-start lg:px-3"
        >
          <IconSparkles size={15} />
          <span className="md:hidden lg:inline">Nuevo chat</span>
        </button>

        <p className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted md:hidden lg:block">Navegación</p>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeIfMobile}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-200 md:justify-center md:px-0 lg:justify-start lg:px-3 ${
                    isActive ? 'bg-accent-bg text-accent-text font-medium' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`
                }
              >
                <Icon size={15} />
                <span className="md:hidden lg:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="my-1 border-t border-border-soft md:hidden lg:block" />
        <p className="px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted md:hidden lg:block">Recientes</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 md:hidden lg:block">
        <div className="flex flex-col gap-1">
          {recents.map((item) => (
            <button
              key={item}
              type="button"
              className="truncate rounded-xl px-3 py-2 text-left text-xs text-text-secondary transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-soft px-3 py-3 md:px-2 lg:px-3">
        <div className="mb-2 flex min-h-11 items-center gap-2 rounded-xl px-1 py-1 md:justify-center lg:justify-start">
          <IconSun size={15} className="text-text-secondary" />
          <span className="flex-1 text-xs text-text-secondary md:hidden lg:inline">Modo</span>
          <PillToggle
            ariaLabel="Modo de tema"
            value={theme}
            onChange={setTheme}
            options={[
              { label: 'Claro', value: 'light' },
              { label: 'Oscuro', value: 'dark' },
            ]}
          />
        </div>

        <div className="mb-2 flex min-h-11 items-center gap-2 rounded-xl px-1 py-1 md:justify-center lg:justify-start">
          <IconDroplet size={15} className="text-text-secondary" />
          <span className="flex-1 text-xs text-text-secondary md:hidden lg:inline">Color</span>
          <PillToggle
            ariaLabel="Color de acento"
            value={accent}
            onChange={setAccent}
            options={[
              { label: 'Frío', value: 'cool' },
              { label: 'Cálido', value: 'warm' },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={goToSettings}
          className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-text-secondary transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary md:justify-center md:px-0 lg:justify-start lg:px-3"
        >
          <IconSettings size={15} />
          <span className="md:hidden lg:inline">Ajustes</span>
        </button>

        <div className="mt-2 flex items-center gap-3 border-t border-border-soft px-1 pt-3 md:justify-center lg:justify-start">
          <Avatar name="Diego Artavia" />
          <div className="min-w-0 md:hidden lg:block">
            <p className="truncate text-xs font-medium text-text-primary">Diego Artavia</p>
            <p className="text-[11px] text-text-muted">ULACIT</p>
          </div>
        </div>
      </div>
    </aside>
  );
}