const variantClasses = {
  accent: 'bg-accent-bg text-accent-text',
  success: 'bg-success-bg text-success-text',
  danger: 'bg-danger-bg text-danger-text',
  warning: 'bg-warning-bg text-warning-text',
  pro: 'bg-pro-bg text-pro-text',
};

/**
 * @param {{ variant?: keyof typeof variantClasses, children: import('react').ReactNode, className?: string }} props
 */
export default function Badge({ variant = 'accent', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium leading-none ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}