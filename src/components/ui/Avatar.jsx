/**
 * @param {{ name: string, className?: string }} props
 */
export default function Avatar({ name, className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pro-bg text-[11px] font-medium text-pro-text ${className}`}>
      {initials}
    </div>
  );
}