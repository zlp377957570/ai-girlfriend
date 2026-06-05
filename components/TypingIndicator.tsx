interface TypingIndicatorProps {
  avatar: string;
}

export default function TypingIndicator({ avatar }: TypingIndicatorProps) {
  return (
    <div className="message-enter flex items-start gap-2">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm">
        {avatar}
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border-l-4 border-pink-300 bg-white px-4 py-3 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" />
        <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
