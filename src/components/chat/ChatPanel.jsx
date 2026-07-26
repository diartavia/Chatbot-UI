import { useEffect } from 'react';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChatStore } from '../../store/chatStore';
import { IconSparkles } from '@tabler/icons-react';
import SkeletonLoader from '../ui/SkeletonLoader';

export default function ChatPanel() {
  const messages = useChatStore((state) => state.data);
  const loading = useChatStore((state) => state.loading);
  const typing = useChatStore((state) => state.typing);
  const fetchMessages = useChatStore((state) => state.fetchMessages);

  useEffect(() => {
    if (!messages.length) {
      fetchMessages();
    }
  }, [fetchMessages, messages.length]);

  if (loading && !messages.length) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-0 transition-colors duration-200">
        <SkeletonLoader variant="chat" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-0 transition-colors duration-200">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex w-full max-w-none flex-col gap-4 lg:max-w-[800px]">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'assistant' ? (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                  <IconSparkles size={15} />
                </div>
              ) : (
                <Avatar name="Diego Artavia" className="mt-0.5" />
              )}

              <MessageBubble role={message.role}>{message.content}</MessageBubble>
            </div>
          ))}

          {typing ? (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                <IconSparkles size={15} />
              </div>
              <div className="rounded-2xl border border-border-soft bg-surface-1 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-text-muted" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-text-muted [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-text-muted [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ChatInput />
    </div>
  );
}