import { useEffect, useState } from 'react';
import { DEFAULT_PERSONA, PERSONA_PRESETS } from '@/lib/persona';
import { PersonaConfig } from '@/types';

interface PersonaEditorProps {
  persona: PersonaConfig;
  onSave: (persona: PersonaConfig) => void;
  onClose: () => void;
}

const AVATARS = ['👧', '🌟', '👑', '🐱', '🎓', '💝', '🌙', '🦋', '🌺', '💫'];

export default function PersonaEditor({ persona, onSave, onClose }: PersonaEditorProps) {
  const [draft, setDraft] = useState<PersonaConfig>(persona);

  useEffect(() => {
    setDraft(persona);
  }, [persona]);

  const applyPreset = (presetId: string) => {
    const preset = PERSONA_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setDraft((prev) => ({
      ...prev,
      avatar: preset.avatar,
      personality: preset.personality,
      speakingStyle: preset.speakingStyle,
      interests: preset.interests,
      preset: preset.id,
    }));
  };

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 translate-x-0">
      <div className="flex items-center justify-between border-b border-pink-100 px-4 py-4">
        <h2 className="font-semibold text-gray-800">✨ 定制你的女友</h2>
        <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100" aria-label="关闭性格编辑器">
          ✕
        </button>
      </div>

      <div className="h-[calc(100%-140px)] overflow-y-auto px-4 py-4 space-y-5">
        <section>
          <h3 className="mb-2 text-sm font-medium text-gray-700">预设模板</h3>
          <div className="grid grid-cols-2 gap-2">
            {PERSONA_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`rounded-xl border p-2 text-left text-xs transition ${
                  draft.preset === preset.id
                    ? 'border-2 border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}
              >
                <div className="font-medium text-gray-800">
                  {preset.avatar} {preset.label}
                </div>
                <div className="mt-1 text-gray-500">{preset.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">基本信息</h3>
          <input
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="她叫什么名字？"
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, avatar: emoji }))}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                  draft.avatar === emoji ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-gray-100 hover:bg-pink-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">详细定制</h3>
          <textarea
            value={draft.personality}
            onChange={(e) => setDraft((prev) => ({ ...prev, personality: e.target.value, preset: 'custom' }))}
            placeholder="她的性格是怎样的？"
            rows={3}
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          <textarea
            value={draft.speakingStyle}
            onChange={(e) => setDraft((prev) => ({ ...prev, speakingStyle: e.target.value, preset: 'custom' }))}
            placeholder="她会怎么和你说话？"
            rows={3}
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          <input
            value={draft.interests}
            onChange={(e) => setDraft((prev) => ({ ...prev, interests: e.target.value, preset: 'custom' }))}
            placeholder="她喜欢什么？"
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-pink-100 bg-white p-4 space-y-2">
        <button
          type="button"
          onClick={() => onSave({ ...draft, name: draft.name.trim() || DEFAULT_PERSONA.name })}
          className="w-full rounded-lg bg-gradient-to-r from-pink-400 to-purple-500 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          保存并应用
        </button>
        <button
          type="button"
          onClick={() => setDraft(DEFAULT_PERSONA)}
          className="w-full py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          重置默认
        </button>
      </div>
    </div>
  );
}
