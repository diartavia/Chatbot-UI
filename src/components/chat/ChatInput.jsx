import { useState } from 'react';
import { IconSend } from '@tabler/icons-react';
import { useChatStore } from '../../store/chatStore';

export default function ChatInput() {
  const { sendMessage, typing, loading } = useChatStore();
  const [value, setValue] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = value.trim();
    if (!message) {
      return;
    }

    await sendMessage(message);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-none px-4 pb-4 pt-3 sm:px-6 lg:max-w-[800px]">
      <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-border-soft bg-surface-1 px-3 py-3 transition-colors duration-200 sm:px-4">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type="text"
          placeholder="Escribí algo, como 'recordame el parcial del viernes'..."
          className="min-w-0 flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted sm:text-sm"
        />
        <button
          type="submit"
          disabled={typing || loading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Enviar mensaje"
        >
          <IconSend size={16} />
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-text-muted sm:text-[11px]">Luma · II Cuatrimestre 2026 · ULACIT</p>
    </form>
  );
}