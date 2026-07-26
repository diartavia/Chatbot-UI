const spanishMonthsLong = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const spanishMonthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const spanishWeekdaysLong = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const spanishWeekdaysShort = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function cloneDate(date) {
  return new Date(date.getTime());
}

export function startOfDay(date) {
  const next = cloneDate(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfMonth(date) {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
}

export function endOfMonth(date) {
  const next = startOfMonth(date);
  next.setMonth(next.getMonth() + 1);
  next.setDate(0);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function addDays(date, days) {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

export function addMonths(date, months) {
  const next = cloneDate(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function startOfWeek(date) {
  const next = startOfDay(date);
  const day = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - day);
  return next;
}

export function endOfWeek(date) {
  return addDays(startOfWeek(date), 6);
}

export function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function formatMonthTitle(date) {
  return `${spanishMonthsLong[date.getMonth()].charAt(0).toUpperCase() + spanishMonthsLong[date.getMonth()].slice(1)} ${date.getFullYear()}`;
}

export function formatWeekTitle(date) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${spanishMonthsShort[end.getMonth()]} ${end.getFullYear()}`;
  }

  return `${start.getDate()} ${spanishMonthsShort[start.getMonth()]} – ${end.getDate()} ${spanishMonthsShort[end.getMonth()]} ${end.getFullYear()}`;
}

export function formatDayTitle(date) {
  const weekday = spanishWeekdaysLong[date.getDay()];
  const day = date.getDate();
  const month = spanishMonthsLong[date.getMonth()];
  const monthTitle = month.charAt(0).toUpperCase() + month.slice(1);
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} de ${month} de ${date.getFullYear()}`;
}

export function formatMiniMonthTitle(date) {
  return `${spanishMonthsLong[date.getMonth()].charAt(0).toUpperCase() + spanishMonthsLong[date.getMonth()].slice(1)} ${date.getFullYear()}`;
}

export function formatWeekdayShort(date) {
  return spanishWeekdaysShort[date.getDay()];
}

export function minutesFromTimeString(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function timeStringFromDate(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function dateTimeFromParts(dateString, timeString) {
  const date = new Date(`${dateString}T00:00:00`);
  const [hours, minutes] = timeString.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function dateStringFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseEventDate(value) {
  return value instanceof Date ? cloneDate(value) : new Date(value);
}

export function getDateRangeEvents(events, date) {
  return events.filter((event) => {
    const start = new Date(event.start);
    return isSameDay(start, date);
  }).sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());
}

export function getEventsBetween(events, start, end) {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    return eventStart >= start && eventStart <= end;
  }).sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());
}

export function buildMonthCells(date, events = []) {
  const firstOfMonth = startOfMonth(date);
  const lastOfMonth = endOfMonth(date);
  const leadingDays = (firstOfMonth.getDay() + 6) % 7;
  const cells = [];
  const startDate = addDays(firstOfMonth, -leadingDays);
  const current = cloneDate(startDate);

  for (let index = 0; index < 42; index += 1) {
    const cellDate = cloneDate(current);
    const cellEvents = events.filter((event) => isSameDay(new Date(event.start), cellDate)).sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());
    cells.push({
      date: cellDate,
      inCurrentMonth: cellDate.getMonth() === date.getMonth(),
      isToday: isSameDay(cellDate, new Date()),
      events: cellEvents,
    });
    current.setDate(current.getDate() + 1);
  }

  return cells;
}

export function buildWeekDays(date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getCalendarTitle(view, date) {
  if (view === 'week') {
    return formatWeekTitle(date);
  }

  if (view === 'day') {
    return formatDayTitle(date);
  }

  return formatMonthTitle(date);
}
