import { useEffect, useMemo } from 'react';
import { useTasksStore } from '../../store/tasksStore';
import TaskRow from './TaskRow';
import SkeletonLoader from '../ui/SkeletonLoader';

const filters = [
  { label: 'Todas', value: 'all' },
  { label: 'Urgentes', value: 'urgent' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Completadas', value: 'completed' },
];

const bucketLabels = {
  today: 'Hoy',
  week: 'Esta semana',
  completed: 'Completadas',
};

export default function TasksPanel() {
  const { data: tasks, filter, setFilter, toggleTask, fetchTasks, loading } = useTasksStore();

  useEffect(() => {
    if (!tasks.length) {
      fetchTasks();
    }
  }, [fetchTasks, tasks.length]);

  const groupedTasks = useMemo(() => {
      const visibleTasks = tasks.filter((task) => {
      if (filter === 'all') {
        return true;
      }
      if (filter === 'urgent') {
          return task.priority === 'urgent';
      }
      if (filter === 'week') {
          return task.status !== 'done';
      }
        return task.status === 'done';
    });

    const today = new Date('2026-07-23T12:00:00.000Z');

    return ['today', 'week', 'completed']
      .map((bucket) => ({
        bucket,
        tasks: visibleTasks.filter((task) => {
          if (bucket === 'completed') {
            return task.status === 'done';
          }

          const dueDate = new Date(task.due_date);
          return task.status !== 'done' && (bucket === 'today' ? dueDate.toDateString() === today.toDateString() : dueDate >= today);
        }),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [filter, tasks]);

  if (loading && !tasks.length) {
    return <SkeletonLoader variant="tasks" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-0 transition-colors duration-200">
      <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 pb-2 pt-4 sm:px-5">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 sm:text-sm ${filter === item.value ? 'bg-accent-bg text-accent-text' : 'text-text-secondary hover:bg-surface-1 hover:text-text-primary'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-2 sm:px-5">
        <div className="flex flex-col gap-5">
          {groupedTasks.map((group) => (
            <section key={group.bucket} className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted sm:text-[11px]">{bucketLabels[group.bucket]}</p>
              <div className="flex flex-col gap-2">
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={{
                    ...task,
                    title: task.title,
                    subtitle: task.subtitle,
                    status: task.status,
                    priority: task.priority,
                    dueLabel: task.status === 'done' ? 'Entregado' : new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(task.due_date)).replace('.', ''),
                    completed: task.status === 'done',
                  }} onToggle={toggleTask} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}