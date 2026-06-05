import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  avatar: string;
}

export default function MessageBubble({ message, avatar }: MessageBubbleProps) {
  const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (message.role === 'user') {
    return (
      <div className="message-enter flex flex-col items-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-pink-400 to-purple-500 px-4 py-2.5 text-sm text-white shadow-sm whitespace-pre-wrap">
          {message.content}
        </div>
        <span className="mt-1 text-xs text-gray-400">{time}</span>
      </div>
    );
  }

  return (
    <div className="message-enter flex items-start gap-2">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm">
        {avatar}
      </div>
      <div className="flex max-w-[80%] flex-col items-start">
        <div className="rounded-2xl rounded-tl-sm border-l-4 border-pink-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm whitespace-pre-wrap">
          {message.content}
        </div>
        <span className="mt-1 text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}
