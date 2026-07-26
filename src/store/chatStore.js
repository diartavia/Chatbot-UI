import { create } from 'zustand';
import { deleteMessage, getConversation, sendMessage as sendChatMessage, updateMessage } from '../services/chatService';

const fallbackReply = 'No pude conectar con el backend; dejé tu mensaje registrado localmente.';

const normalizeMessage = (message, index) => ({
  id: message.id ?? index + 1,
  timestamp: message.timestamp ?? new Date().toISOString(),
  ...message,
});

export const useChatStore = create((set, get) => ({
  data: [],
  loading: false,
  error: null,
  typing: false,
  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      const messages = (await getConversation()).map(normalizeMessage);
      set({ data: messages, loading: false });
      return messages;
    } catch (error) {
      set({ loading: false, error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo cargar el chat.' });
      return [];
    }
  },
  createMessage: async (message) => {
    const normalized = normalizeMessage(message, get().data.length);
    set((state) => ({ data: [...state.data, normalized] }));
    return normalized;
  },
  updateMessage: async (id, data) => {
    try {
      const updated = normalizeMessage(await updateMessage(id, data), id);
      set((state) => ({ data: state.data.map((message) => (message.id === id ? { ...message, ...updated } : message)) }));
      return updated;
    } catch (error) {
      set({ error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo actualizar el mensaje.' });
      throw error;
    }
  },
  deleteMessage: async (id) => {
    try {
      await deleteMessage(id);
      set((state) => ({ data: state.data.filter((message) => message.id !== id) }));
    } catch (error) {
      set({ error: error?.response?.data?.detail ?? error?.message ?? 'No se pudo borrar el mensaje.' });
      throw error;
    }
  },
  sendMessage: async (content) => {
    const message = content.trim();
    if (!message) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const baseConversation = [...get().data, userMessage];
    set({ data: baseConversation, error: null, typing: true });

    try {
      const response = await sendChatMessage(message, baseConversation);
      const assistantMessage = normalizeMessage(
        Array.isArray(response) ? response[response.length - 1] : response?.reply ? { role: 'assistant', content: response.reply } : response,
        baseConversation.length + 1,
      );
      set({ data: [...baseConversation, assistantMessage], typing: false, loading: false });
    } catch (error) {
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error?.response?.data?.detail ?? fallbackReply,
        timestamp: new Date().toISOString(),
      };
      set({ data: [...baseConversation, assistantMessage], typing: false, loading: false, error: error?.response?.data?.detail ?? error?.message ?? fallbackReply });
    }
  },
}));