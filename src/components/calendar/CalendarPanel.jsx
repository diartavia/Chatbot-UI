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
  startOfDay,
} from '../../store/calendarUtils';
import EventModal from './EventModal';

const hourLabels = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);
const weekdayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const miniWeekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const hourRowHeight = 64;

function hexToRgba(hex, alpha = 0.14) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  if ([red, green, blue].some((component) => Number.isNaN(component))) {
    return hex;
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function CalendarHeader() {
  const { view, setView, currentDate, prevPeriod, nextPeriod, goToToday, openEditor } = useCalendarStore();

  return (
    <div className="border-b border-[0.5px] border-border-soft bg-surface-1 px-4 py-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-text-primary">{getCalendarTitle(view, currentDate)}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-[0.5px] border-border-soft bg-transparent p-0.5">
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
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${active ? 'border border-[0.5px] border-border-soft bg-surface-2 text-text-primary' : 'bg-transparent text-text-secondary hover:bg-surface-2/50 hover:text-text-primary'}`}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>

          <button type="button" onClick={prevPeriod} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[0.5px] border-border-soft text-text-secondary transition hover:bg-surface-2 hover:text-text-primary" aria-label="Periodo anterior">
            <IconChevronLeft size={16} />
          </button>
          <button type="button" onClick={nextPeriod} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[0.5px] border-border-soft text-text-secondary transition hover:bg-surface-2 hover:text-text-primary" aria-label="Periodo siguiente">
            <IconChevronRight size={16} />
          </button>

          <button type="button" onClick={goToToday} className="inline-flex h-8 items-center rounded-full border border-[0.5px] border-border-soft px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-2 hover:text-text-primary">
            Hoy
          </button>

          <button type="button" onClick={() => openEditor()} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-accent transition hover:bg-accent-bg/40">
            <IconPlus size={14} />
            Nuevo evento
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthView() {
  const { currentDate, events, setSelectedDate, openEditor } = useCalendarStore();
  const cells = useMemo(() => buildMonthCells(currentDate, events), [currentDate, events]);

  return (
    <div className="px-4 pb-4 pt-3 lg:px-6 lg:pb-6 lg:pt-4">
      <div className="grid grid-cols-7 border-b border-[0.5px] border-border-soft text-center">
        {weekdayLabels.map((weekday) => (
          <div key={weekday} className="px-2 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
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
            className={`group min-h-[112px] border-b border-[0.5px] border-border-soft px-2 py-2 text-left transition hover:bg-surface-2/55 focus:outline-none ${cell.inCurrentMonth ? 'bg-transparent' : 'bg-transparent'}`}
          >
            <div className="flex items-start justify-between gap-2">
              {cell.isToday ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[13px] font-medium text-white">
                  {cell.date.getDate()}
                </span>
              ) : (
                <span className={`text-[13px] font-medium ${cell.inCurrentMonth ? 'text-text-muted' : 'text-text-muted/30'}`}>
                  {cell.date.getDate()}
                </span>
              )}
            </div>

            <div className="mt-2 space-y-1">
              {cell.events.slice(0, 2).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    openEditor(cell.date, event);
                  }}
                  className="flex h-5 w-full items-center rounded px-1.5 text-left text-[11px] font-medium leading-5 transition hover:opacity-90"
                  style={{ backgroundColor: hexToRgba(event.color, 0.14), color: event.color }}
                >
                  <span className="truncate">{event.title}</span>
                </button>
              ))}
              {cell.events.length > 2 ? <div className="px-1 text-[10px] text-text-muted">+{cell.events.length - 2} más</div> : null}
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
  const gridColumns = mode === 'week' ? 'minmax(72px, 84px) repeat(7, minmax(0, 1fr))' : 'minmax(72px, 84px) minmax(0, 1fr)';
  const now = new Date();

  return (
    <div className="overflow-auto px-4 pb-4 pt-3 lg:px-6 lg:pb-6 lg:pt-4">
      <div className="min-w-[760px] overflow-hidden border border-[0.5px] border-border-soft bg-surface-1">
        <div className="grid border-b border-[0.5px] border-border-soft bg-transparent" style={{ gridTemplateColumns: gridColumns }}>
          <div className="px-3 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">Hora</div>
          {days.map((day) => (
            <button key={day.toISOString()} type="button" onClick={() => setSelectedDate(day)} className="flex flex-col items-center gap-1 px-3 py-3 text-center transition hover:bg-surface-2/50">
              <div className={`text-[11px] font-medium uppercase tracking-[0.18em] ${isSameDay(day, now) ? 'text-accent' : 'text-text-muted'}`}>
                {day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
              </div>
              {isSameDay(day, now) ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">{day.getDate()}</div>
              ) : (
                <div className="text-[14px] font-semibold text-text-primary">{day.getDate()}</div>
              )}
            </button>
          ))}
        </div>

        <div className="max-h-[calc(100vh-22rem)] overflow-auto">
          {hourLabels.map((hourLabel, index) => (
            <div key={hourLabel} className="grid border-b border-[0.5px] border-border-soft last:border-b-0" style={{ gridTemplateColumns: gridColumns }}>
              <div className="px-3 pt-2 text-[11px] font-medium text-text-muted">{hourLabel}</div>
              {days.map((day) => {
                const dayEvents = getDateRangeEvents(events, day).filter((event) => {
                  const start = new Date(event.start);
                  return start.getHours() === index;
                });
                const isCurrentHour = isSameDay(day, now) && now.getHours() === index;

                return (
                  <div key={`${day.toISOString()}-${hourLabel}`} className="relative min-h-[64px] border-r border-[0.5px] border-border-soft last:border-r-0 px-2 py-1">
                    {isCurrentHour ? (
                      <div className="absolute inset-x-2 z-10" style={{ top: `${(now.getMinutes() / 60) * hourRowHeight}px` }}>
                        <div className="absolute left-0 top-[-3px] h-2 w-2 rounded-full bg-accent" />
                        <div className="h-[1.5px] bg-accent" />
                      </div>
                    ) : null}

                    {dayEvents.map((event) => {
                      const start = new Date(event.start);
                      const end = new Date(event.end);
                      const durationMinutes = Math.max(30, (end.getTime() - start.getTime()) / 60000);
                      const height = Math.max(32, durationMinutes * 0.72);

                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEditor(day, event)}
                          className="absolute left-2 right-2 rounded-md border border-transparent px-2 py-1 text-left text-[12px] shadow-none transition hover:opacity-90"
                          style={{ top: `${(start.getMinutes() / 60) * hourRowHeight}px`, height: `${height}px`, backgroundColor: hexToRgba(event.color, 0.14), color: event.color }}
                        >
                          <div className="truncate font-medium">{event.title}</div>
                          <div className="mt-0.5 text-[11px] text-text-muted">
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
    <div className="rounded-2xl border border-[0.5px] border-border-soft bg-transparent p-3">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-text-primary">{formatMiniMonthTitle(currentDate)}</h3>
        <button type="button" onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-accent transition hover:opacity-80">Ir a hoy</button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
        {miniWeekdayLabels.map((weekday) => (
          <div key={weekday} className="py-1">{weekday}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7">
        {cells.map((cell) => {
          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(cell.date)}
              className={`aspect-square rounded-full text-xs font-medium transition ${cell.inCurrentMonth ? 'text-text-primary hover:bg-surface-2/60' : 'text-text-muted/50'} ${isSelected ? 'bg-accent text-white hover:bg-accent' : ''}`}
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
    <div className="flex h-full flex-col gap-4 overflow-auto border-l border-[0.5px] border-border-soft bg-surface-1 p-4 lg:w-[360px] lg:p-5">
      <MiniCalendar />

      <div className="rounded-2xl border border-[0.5px] border-border-soft bg-transparent p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Día seleccionado</p>
            <h3 className="mt-1 text-lg font-semibold text-text-primary">{focusDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          </div>
          <button type="button" onClick={() => openEditor(focusDate)} className="rounded-full px-2 py-1 text-xs font-semibold text-accent transition hover:bg-accent-bg/40">
            Crear
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {focusEvents.length ? focusEvents.map((event) => (
            <button key={event.id} type="button" onClick={() => openEditor(focusDate, event)} className="flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-2/50">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text-primary">{event.title}</div>
                <div className="text-xs text-text-muted">{new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </button>
          )) : <p className="px-1 py-2 text-sm text-text-muted">No hay eventos para esta fecha.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-[0.5px] border-border-soft bg-transparent p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Próximos 7 días</p>
        <div className="mt-3 space-y-2">
          {upcoming.length ? upcoming.map((event) => (
            <button key={event.id} type="button" onClick={() => openEditor(new Date(event.start), event)} className="flex w-full items-center justify-between rounded-xl px-1.5 py-2 text-left transition hover:bg-surface-2/50">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-text-primary">{event.title}</div>
                <div className="text-xs text-text-muted">{new Date(event.start).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
              </div>
              <div className="text-[12px] font-medium" style={{ color: event.color }}>
                {new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          )) : <p className="text-sm text-text-muted">Sin eventos próximos.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-[0.5px] border-border-soft bg-transparent p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Calendarios conectados</p>
        <div className="mt-3 space-y-2">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="flex items-center gap-3 rounded-xl px-1.5 py-2">
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
