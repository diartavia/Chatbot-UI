import { IconChevronLeft, IconChevronRight, IconPlus, IconLayoutGrid, IconList, IconClock } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useCalendarStore } from '../../store/calendarStore';
import {
  buildMonthCells,
  buildWeekDays,
  formatMiniMonthTitle,
  getCalendarTitle,
  getDateRangeEvents,
  getEventsBetween,
  isSameDay,
  minutesFromTimeString,
  startOfDay,
} from '../../store/calendarUtils';
import EventModal from './EventModal';

const hourLabels = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);

function CalendarHeader() {
  const { view, setView, currentDate, prevPeriod, nextPeriod, goToToday, openEditor } = useCalendarStore();

  return (
    <div className="flex flex-col gap-4 border-b border-surface-3 px-4 py-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Calendario</p>
          <h2 className="text-2xl font-semibold text-text-primary">{getCalendarTitle(view, currentDate)}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={goToToday} className="rounded-full border border-surface-3 px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-2">
            Hoy
          </button>
          <button type="button" onClick={() => openEditor()} className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-400">
            <IconPlus size={18} />
            Nuevo evento
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-surface-3 bg-surface-1 p-1 shadow-soft">
          {[
            { key: 'month', label: 'Mes', icon: IconLayoutGrid },
            { key: 'week', label: 'Semana', icon: IconList },
            { key: 'day', label: 'Día', icon: IconClock },
          ].map((option) => {
            const Icon = option.icon;
            const active = view === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setView(option.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-surface-0 text-text-primary shadow-soft' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Icon size={16} />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={prevPeriod} className="rounded-full border border-surface-3 p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary">
            <IconChevronLeft size={18} />
          </button>
          <button type="button" onClick={nextPeriod} className="rounded-full border border-surface-3 p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary">
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthView() {
  const { currentDate, events, setSelectedDate, openEditor } = useCalendarStore();
  const cells = useMemo(() => buildMonthCells(currentDate, events), [currentDate, events]);
  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="grid gap-3 p-4 lg:p-6">
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted">
        {weekdays.map((weekday) => (
          <div key={weekday} className="px-1 py-2">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.date.toISOString()}
            onClick={() => setSelectedDate(cell.date)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedDate(cell.date);
              }
            }}
            className={`group min-h-32 rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${cell.inCurrentMonth ? 'border-surface-3 bg-surface-1' : 'border-surface-4 bg-surface-2/50 text-text-muted'} ${cell.isToday ? 'ring-2 ring-accent-500/40' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${cell.isToday ? 'text-accent-500' : 'text-text-primary'}`}>{cell.date.getDate()}</span>
              {cell.events.length ? <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[11px] font-semibold text-accent-400">{cell.events.length}</span> : null}
            </div>

            <div className="mt-3 space-y-1">
              {cell.events.slice(0, 3).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    openEditor(cell.date, event);
                  }}
                  className="flex w-full items-center gap-2 rounded-2xl border border-transparent bg-surface-0 px-2 py-1 text-left text-xs text-text-primary transition hover:border-surface-3"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                  <span className="truncate">{event.title}</span>
                  </button>
                ))}
              {cell.events.length > 3 ? <div className="text-xs text-text-muted">+{cell.events.length - 3} más</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekOrDayView({ mode }) {
  const { currentDate, events, setSelectedDate, openEditor } = useCalendarStore();
  const days = useMemo(() => (mode === 'week' ? buildWeekDays(currentDate) : [startOfDay(currentDate)]), [currentDate, mode]);
  const gridColumns = mode === 'week' ? 'minmax(72px, 88px) repeat(7, minmax(0, 1fr))' : 'minmax(72px, 88px) minmax(0, 1fr)';

  return (
    <div className="overflow-auto p-4 lg:p-6">
      <div className="min-w-[760px] rounded-[28px] border border-surface-3 bg-surface-1">
        <div className="grid border-b border-surface-3 bg-surface-2/70" style={{ gridTemplateColumns: gridColumns }}>
          <div className="border-r border-surface-3 p-3 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Hora</div>
          {days.map((day) => (
            <button key={day.toISOString()} type="button" onClick={() => setSelectedDate(day)} className="p-3 text-left transition hover:bg-surface-0/60">
              <div className={`text-xs font-semibold uppercase tracking-[0.24em] ${isSameDay(day, new Date()) ? 'text-accent-500' : 'text-text-muted'}`}>
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className="text-lg font-semibold text-text-primary">{day.getDate()}</div>
            </button>
          ))}
        </div>

        <div className="max-h-[calc(100vh-22rem)] overflow-auto">
          {hourLabels.map((hourLabel, index) => (
            <div key={hourLabel} className="grid border-b border-surface-3 last:border-b-0" style={{ gridTemplateColumns: gridColumns }}>
              <div className="border-r border-surface-3 px-3 py-4 text-xs font-medium text-text-muted">{hourLabel}</div>
              {days.map((day) => {
                const dayEvents = getDateRangeEvents(events, day).filter((event) => {
                  const start = new Date(event.start);
                  return start.getHours() === index;
                });

                return (
                  <div key={`${day.toISOString()}-${hourLabel}`} className="relative min-h-20 border-r border-surface-3 last:border-r-0 p-2">
                    {dayEvents.map((event) => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      const durationMinutes = Math.max(30, (end.getTime() - start.getTime()) / 60000);
                      const topOffset = Math.max(0, minutesFromTimeString(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`));
                      const height = Math.max(56, durationMinutes * 1.2);

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEditor(day, event)}
                          className="absolute left-2 right-2 rounded-2xl border border-white/10 px-3 py-2 text-left shadow-soft transition hover:-translate-y-0.5"
                          style={{ top: `${(topOffset / 60) * 3}rem`, height: `${height}px`, backgroundColor: `${event.color}14`, color: '#1f2937' }}
                        >
                          <div className="text-sm font-semibold" style={{ color: event.color }}>{event.title}</div>
                          <div className="mt-1 text-xs text-text-muted">
                            {start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const { currentDate, selectedDate, setCurrentDate, setSelectedDate } = useCalendarStore();
  const cells = useMemo(() => buildMonthCells(currentDate, []), [currentDate]);

  return (
    <div className="rounded-[28px] border border-surface-3 bg-surface-1 p-4 shadow-soft">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-text-primary">{formatMiniMonthTitle(currentDate)}</h3>
        <button type="button" onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-accent-400 transition hover:text-accent-300">Ir a hoy</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((weekday) => (
          <div key={weekday} className="py-1">{weekday}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`rounded-xl px-2 py-2 text-xs font-medium transition ${cell.inCurrentMonth ? 'text-text-primary hover:bg-surface-2' : 'text-text-muted'} ${isSelected ? 'bg-accent-500 text-white shadow-soft hover:bg-accent-500' : ''}`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent() {
  const { selectedDate, currentDate, events, calendars, openEditor } = useCalendarStore();
  const focusDate = selectedDate || currentDate;
  const focusEvents = useMemo(() => getDateRangeEvents(events, focusDate), [events, focusDate]);
  const upcoming = useMemo(() => getEventsBetween(events, new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)), [events]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto border-l border-surface-3 bg-surface-2/40 p-4 lg:w-[360px] lg:p-5">
      <MiniCalendar />

      <div className="rounded-[28px] border border-surface-3 bg-surface-1 p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Día seleccionado</p>
            <h3 className="mt-1 text-lg font-semibold text-text-primary">{focusDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          </div>
          <button type="button" onClick={() => openEditor(focusDate)} className="rounded-full bg-accent-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-400">
            Crear
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {focusEvents.length ? focusEvents.map((event) => (
            <button key={event.id} type="button" onClick={() => openEditor(focusDate, event)} className="flex w-full items-center gap-3 rounded-2xl border border-surface-3 bg-surface-0 px-3 py-3 text-left transition hover:border-accent-400/40">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color }} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text-primary">{event.title}</div>
                <div className="text-xs text-text-muted">{new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </button>
          )) : <p className="rounded-2xl border border-dashed border-surface-3 px-3 py-4 text-sm text-text-muted">No hay eventos para esta fecha.</p>}
        </div>
      </div>

      <div className="rounded-[28px] border border-surface-3 bg-surface-1 p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Próximos 7 días</p>
        <div className="mt-3 space-y-2">
          {upcoming.length ? upcoming.map((event) => (
            <button key={event.id} type="button" onClick={() => openEditor(new Date(event.start), event)} className="flex w-full items-center justify-between rounded-2xl border border-surface-3 px-3 py-3 text-left transition hover:bg-surface-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text-primary">{event.title}</div>
                <div className="text-xs text-text-muted">{new Date(event.start).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              </div>
              <div className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ backgroundColor: `${event.color}14`, color: event.color }}>
                {new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          )) : <p className="text-sm text-text-muted">Sin eventos próximos.</p>}
        </div>
      </div>

      <div className="rounded-[28px] border border-surface-3 bg-surface-1 p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Calendarios conectados</p>
        <div className="mt-3 space-y-2">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="flex items-center gap-3 rounded-2xl border border-surface-3 px-3 py-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: calendar.color }} />
              <div>
                <div className="text-sm font-semibold text-text-primary">{calendar.label}</div>
                <div className="text-xs text-text-muted">{calendar.connected ? 'Conectado' : 'Desconectado'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarPanel() {
  const { view, fetchEvents, loading, error, currentDate } = useCalendarStore();

  useEffect(() => {
    fetchEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
  }, [currentDate, fetchEvents]);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-w-0 flex-1 overflow-auto">
        <CalendarHeader />
        {loading ? <div className="p-6 text-sm text-text-muted">Cargando calendario...</div> : null}
        {error ? <div className="mx-6 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
        {!loading && !error ? view === 'month' ? <MonthView /> : <WeekOrDayView mode={view} /> : null}
      </div>

      <div className="hidden lg:block">
        <SidebarContent />
      </div>

      <EventModal />
    </div>
  );
}
