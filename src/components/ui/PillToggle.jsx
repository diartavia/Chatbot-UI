/**
 * @param {{ options: Array<{ label: string, value: string }>, value: string, onChange: (value: string) => void, className?: string, ariaLabel?: string, size?: 'sm' | 'lg' }} props
 */
export default function PillToggle({ options, value, onChange, className = '', ariaLabel, size = 'sm' }) {
  const sizeClasses = size === 'lg' ? 'px-4 py-2.5 text-sm' : 'px-3 py-1 text-[11px]';

  return (
    <div className={`inline-flex overflow-hidden rounded-full border border-border-soft bg-surface-1 ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`font-medium transition-colors duration-200 ${sizeClasses} ${value === option.value ? 'bg-accent text-white' : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}