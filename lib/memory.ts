import { MemoryEntry, Message } from '@/types';

const MESSAGES_KEY = 'aigf_messages';
const MEMORIES_KEY = 'aigf_memories';
const MEMORY_TRIGGER = 10;

export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // 忽略浏览器存储异常
  }
}

export function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMemories(memories: MemoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  } catch {
    // 忽略浏览器存储异常
  }
}

export function loadMemories(): MemoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function shouldMemorize(messages: Message[]): boolean {
  return messages.length >= MEMORY_TRIGGER;
}

export function getMessagesToMemorize(messages: Message[]): Message[] {
  return messages.slice(0, MEMORY_TRIGGER);
}

export function getRemainingMessages(messages: Message[]): Message[] {
  return messages.slice(MEMORY_TRIGGER);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(MEMORIES_KEY);
  } catch {
    // 忽略浏览器存储异常
  }
}

export function formatMemoriesForPrompt(memories: MemoryEntry[]): string {
  if (!memories.length) return '';

  const lines = memories
    .map((memory) => {
      const keywordLine = memory.keywords.join(' / ');
      const highlights = memory.highlights.map((item) => `• ${item}`).join('\n');
      return `【${memory.dateLabel}】\n摘要：${memory.summary}\n关键词：${keywordLine}\n细节：\n${highlights}`;
    })
    .join('\n\n');

  return `=== 你珍贵的长期记忆（请自然融入对话）===\n\n${lines}\n\n=================================`;
}
