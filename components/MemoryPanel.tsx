import { MemoryEntry, PersonaConfig } from '@/types';

interface MemoryPanelProps {
  memories: MemoryEntry[];
  persona: PersonaConfig;
  onClear: () => void;
  onClose: () => void;
}

export default function MemoryPanel({ memories, persona, onClear, onClose }: MemoryPanelProps) {
  return (
    <div className="fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 translate-x-0">
      <div className="flex items-center justify-between border-b border-pink-100 px-4 py-4">
        <h2 className="font-semibold text-gray-800">💭 {persona.name} 的记忆</h2>
        <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100" aria-label="关闭记忆面板">
          ✕
        </button>
      </div>

      <div className="h-[calc(100%-120px)] overflow-y-auto px-4 py-4 space-y-4">
        {memories.length === 0 ? (
          <p className="text-sm text-gray-400">还没有记忆哦，多聊聊吧 💕</p>
        ) : (
          memories
            .slice()
            .reverse()
            .map((memory) => (
              <div key={memory.id} className="rounded-xl border border-pink-100 bg-pink-50/40 p-3">
                <div className="text-sm font-semibold text-pink-500">{memory.dateLabel}</div>
                <p className="mt-2 text-sm text-gray-700">{memory.summary}</p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {memory.keywords.map((keyword, index) => (
                    <span
                      key={`${memory.id}-kw-${index}`}
                      className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-600">
                  {memory.highlights.map((highlight, index) => (
                    <li key={`${memory.id}-hl-${index}`}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-pink-100 bg-white p-4">
        <button
          onClick={() => {
            if (window.confirm('确定要清空所有记忆吗？这无法恢复哦 😢')) {
              onClear();
            }
          }}
          className="w-full rounded-lg bg-red-50 py-2 text-sm text-red-500 hover:bg-red-100"
        >
          清空所有记忆
        </button>
      </div>
    </div>
  );
}
