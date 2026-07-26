import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

/**
 * @param {{ message: string, onRetry: () => void }} props
 */
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-bg px-4 py-3 text-danger-text transition-colors duration-200 sm:mx-5">
      <IconAlertTriangle size={18} className="shrink-0" />
      <p className="min-w-0 flex-1 text-sm">{message}</p>
      <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium text-text-primary transition-colors duration-200 hover:bg-surface-1">
        <IconRefresh size={15} />
        Reintentar
      </button>
    </div>
  );
}