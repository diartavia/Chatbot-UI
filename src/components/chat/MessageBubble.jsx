/**
 * @param {{ role: 'assistant' | 'user', children: import('react').ReactNode }} props
 */
export default function MessageBubble({ role, children }) {
  const isUser = role === 'user';

  return (
    <div className={`flex max-w-[78%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 transition-colors duration-200 ${isUser ? 'border-transparent bg-accent text-white' : 'border-border-soft bg-surface-1 text-text-primary'}`}>
        {children}
      </div>
    </div>
  );
}