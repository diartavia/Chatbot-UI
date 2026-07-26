/**
 * @param {{ checked: boolean, onChange: (checked: boolean) => void, label: string }} props
 */
export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`inline-flex min-h-11 w-full items-center justify-between rounded-2xl border border-border-soft px-4 py-3 text-left transition-colors duration-200 ${checked ? 'bg-accent-bg text-accent-text' : 'bg-surface-2 text-text-primary hover:bg-surface-1'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? 'bg-accent' : 'bg-border-soft'}`}>
        <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}