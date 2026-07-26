import { IconMenu2 } from '@tabler/icons-react';

/**
 * @param {{ title: string, Icon: import('@tabler/icons-react').Icon, subtitle?: string, onMenuClick?: () => void }} props
 */
export default function Topbar({ title, Icon, subtitle = 'Google Calendar · Outlook · OAuth 2.0', onMenuClick }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border-soft bg-surface-1 px-4 transition-colors duration-200 sm:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú lateral"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary sm:hidden"
      >
        <IconMenu2 size={19} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2">
        <Icon size={16} className="hidden text-accent sm:block" />
        <span className="truncate text-sm font-medium text-text-primary sm:text-sm">{title}</span>
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <span className="text-[11px] text-text-secondary">{subtitle}</span>
        <span className="hidden h-3.5 w-px bg-border-soft sm:inline" />
        <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-medium text-success-text">conectado</span>
      </div>
    </header>
  );
}