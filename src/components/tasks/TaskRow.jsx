import Badge from '../ui/Badge';

const badgeVariantByStatus = {
  urgent: 'danger',
  done: 'success',
};

/**
 * @param {{ task: { id: number, title: string, subtitle: string, dueLabel: string, completed: boolean, status: keyof typeof badgeVariantByStatus }, onToggle: (id: number) => void }} props
 */
export default function TaskRow({ task, onToggle }) {
  const badgeVariant = task.completed ? 'success' : task.priority === 'urgent' ? 'danger' : 'warning';

  return (
    <div className="flex min-h-11 flex-col gap-3 rounded-2xl border border-border-soft bg-surface-1 px-4 py-3 transition-colors duration-200 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={`Marcar ${task.title}`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200 sm:h-4.5 sm:w-4.5 ${task.completed ? 'border-success bg-success text-white' : 'border-border-soft bg-transparent'}`}
      >
        {task.completed ? <span className="text-[10px] leading-none">✓</span> : null}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] sm:text-sm ${task.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</p>
        <p className="mt-1 truncate text-[10px] text-text-secondary sm:text-[11px]">{task.subtitle}</p>
      </div>

      <Badge variant={badgeVariant} className="self-start sm:ml-auto sm:self-auto">
        {task.dueLabel}
      </Badge>
    </div>
  );
}