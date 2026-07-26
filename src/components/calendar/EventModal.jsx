import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { useCalendarStore } from '../../store/calendarStore';

const calendarOptions = [
  { id: 'google', label: 'Google Calendar', color: '#4f72e8' },
  { id: 'outlook', label: 'Outlook ULACIT', color: '#d97706' },
];

export default function EventModal() {
  const { editorOpen, draftEvent, closeEditor, setDraftField, saveDraftEvent, deleteEvent } = useCalendarStore();

  useEffect(() => {
    if (!editorOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeEditor();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeEditor, editorOpen]);

  if (!editorOpen || !draftEvent) {
    return null;
  }

  const removeEvent = () => {
    if (draftEvent.id) {
      deleteEvent(draftEvent.id);
    }
    closeEditor();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-surface-1 shadow-[0_30px_100px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-surface-3 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Evento</p>
            <h3 className="text-lg font-semibold text-text-primary">{draftEvent.id ? 'Editar evento' : 'Nuevo evento'}</h3>
          </div>
          <button type="button" className="rounded-full p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary" onClick={closeEditor}>
            <IconX size={20} />
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Título</span>
              <input
                value={draftEvent.title}
                onChange={(event) => setDraftField('title', event.target.value)}
                className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-500"
                placeholder="Reunión, clase, estudio..."
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Descripción</span>
              <textarea
                value={draftEvent.description}
                onChange={(event) => setDraftField('description', event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-surface-3 bg-surface-0 px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-500"
                placeholder="Notas, contexto o agenda"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-secondary">Ubicación</span>
              <input
                value={draftEvent.location}
                onChange={(event) => setDraftField('location', event.target.value)}
                className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-500"
                placeholder="Meet, aula, oficina..."
              />
            </label>
          </div>

          <div className="space-y-4 rounded-3xl border border-surface-3 bg-surface-2/70 p-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Calendario</span>
              <div className="grid gap-2">
                {calendarOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDraftField('calendar', option.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${draftEvent.calendar === option.id ? 'border-transparent bg-surface-0 text-text-primary shadow-soft' : 'border-surface-3 bg-transparent text-text-secondary hover:bg-surface-0/60'}`}
                  >
                    <span>{option.label}</span>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.color }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-secondary">Inicio</span>
                <input value={draftEvent.startDate} onChange={(event) => setDraftField('startDate', event.target.value)} type="date" className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-3 py-3 text-text-primary outline-none focus:border-accent-500" />
                <input value={draftEvent.startTime} onChange={(event) => setDraftField('startTime', event.target.value)} type="time" className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-3 py-3 text-text-primary outline-none focus:border-accent-500" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-text-secondary">Fin</span>
                <input value={draftEvent.endDate} onChange={(event) => setDraftField('endDate', event.target.value)} type="date" className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-3 py-3 text-text-primary outline-none focus:border-accent-500" />
                <input value={draftEvent.endTime} onChange={(event) => setDraftField('endTime', event.target.value)} type="time" className="w-full rounded-2xl border border-surface-3 bg-surface-0 px-3 py-3 text-text-primary outline-none focus:border-accent-500" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-3 px-6 py-4">
          <div className="text-sm text-text-secondary">Los cambios se guardan en el calendario local demo hasta conectar FastAPI.</div>
          <div className="flex items-center gap-3">
            {draftEvent.id ? (
              <button type="button" className="rounded-full border border-rose-400/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10" onClick={removeEvent}>
                Eliminar
              </button>
            ) : null}
            <button type="button" className="rounded-full border border-surface-3 px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-2" onClick={closeEditor}>
              Cancelar
            </button>
            <button type="button" className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-400" onClick={saveDraftEvent}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
