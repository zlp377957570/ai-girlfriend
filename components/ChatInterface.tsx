'use client';

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  clearAll,
  getMessagesToMemorize,
  getRemainingMessages,
  loadMemories,
  loadMessages,
  saveMemories,
  saveMessages,
  shouldMemorize,
} from '@/lib/memory';
import { DEFAULT_PERSONA, loadPersona, savePersona } from '@/lib/persona';
import { MemoryEntry, Message, PersonaConfig } from '@/types';
import MemoryPanel from './MemoryPanel';
import MessageBubble from './MessageBubble';
import PersonaEditor from './PersonaEditor';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [persona, setPersona] = useState<PersonaConfig>(DEFAULT_PERSONA);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [showPersonaEditor, setShowPersonaEditor] = useState(false);
  const [toast, setToast] = useState('');

  const isMemorizingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初始化本地状态
  useEffect(() => {
    const savedMessages = loadMessages();
    const savedMemories = loadMemories();
    const savedPersona = loadPersona();

    setPersona(savedPersona);
    setMemories(savedMemories);

    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      return;
    }

    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `你好呀～我是${savedPersona.name} ${savedPersona.avatar} 我会记住我们说过的每一件事哦 💕 你今天怎么样？`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // 自动滚动
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 自动持久化消息
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const runMemorizeInBackground = async (snapshotMessages: Message[]) => {
    if (isMemorizingRef.current || !shouldMemorize(snapshotMessages)) {
      return;
    }

    isMemorizingRef.current = true;
    setIsMemorizing(true);

    try {
      const toMemorize = getMessagesToMemorize(snapshotMessages);
      const res = await fetch('/api/memorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toMemorize }),
      });

      if (!res.ok) {
        return;
      }

      const { memory } = (await res.json()) as { memory: MemoryEntry };
      setMemories((prev) => {
        const next = [...prev, memory];
        saveMemories(next);
        return next;
      });

      const removedIds = new Set(toMemorize.map((item) => item.id));
      setMessages((prev) => {
        const next = prev.filter((item) => !removedIds.has(item.id));
        saveMessages(next);
        return next;
      });
    } catch {
      // 静默处理记忆失败，避免打断聊天体验
    } finally {
      isMemorizingRef.current = false;
      setIsMemorizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 后台异步整理记忆，不阻塞消息发送
    void runMemorizeInBackground(currentMessages);

    setIsLoading(true);
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          memories,
          persona,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('请求失败');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((item) => (item.id === assistantMessage.id ? { ...item, content: fullText } : item))
        );
      }
    } catch {
      showToast('😢 请求失败，请检查 API Key 是否配置正确');
      setMessages((prev) => prev.filter((item) => item.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaSave = (newPersona: PersonaConfig) => {
    setPersona(newPersona);
    savePersona(newPersona);
    setShowPersonaEditor(false);
    showToast('已更新女友设定 💕');
  };

  const handleClearMemory = () => {
    clearAll();
    setMemories([]);
    setMessages([]);
    showToast('记忆已清空 🌸');
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/70 shadow-xl backdrop-blur">
      {toast && (
        <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm text-pink-600 shadow-md">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-pink-100 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-xl">
            {persona.avatar}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{persona.name}</div>
            {isMemorizing ? (
              <div className="text-xs text-pink-400">💭 正在整理记忆...</div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />在线
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowMemoryPanel(true);
              setShowPersonaEditor(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-lg transition hover:bg-pink-100"
            title="查看记忆"
          >
            💭
          </button>
          <button
            onClick={() => {
              setShowPersonaEditor(true);
              setShowMemoryPanel(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-lg transition hover:bg-purple-100"
            title="定制女友"
          >
            ✨
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} avatar={persona.avatar} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator avatar={persona.avatar} />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-pink-100 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`和${persona.name}说点什么...`}
            rows={1}
            className="max-h-24 flex-1 resize-none overflow-y-auto rounded-2xl border border-pink-200 bg-white/80 px-4 py-2.5 text-sm transition focus:border-pink-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md transition hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showMemoryPanel && (
        <MemoryPanel
          memories={memories}
          persona={persona}
          onClear={handleClearMemory}
          onClose={() => setShowMemoryPanel(false)}
        />
      )}

      {showPersonaEditor && (
        <PersonaEditor
          persona={persona}
          onSave={handlePersonaSave}
          onClose={() => setShowPersonaEditor(false)}
        />
      )}
    </div>
  );
}
