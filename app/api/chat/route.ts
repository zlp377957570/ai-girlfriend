import { NextRequest } from 'next/server';
import { streamChat } from '@/lib/claude';
import { formatMemoriesForPrompt } from '@/lib/memory';
import { buildSystemPrompt } from '@/lib/persona';
import { MemoryEntry, Message, PersonaConfig } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages, memories, persona }: {
      messages: Message[];
      memories: MemoryEntry[];
      persona: PersonaConfig;
    } = await req.json();

    if (!Array.isArray(messages) || !Array.isArray(memories) || !persona) {
      return new Response(JSON.stringify({ error: '参数错误' }), { status: 400 });
    }

    const memoryPrompt = formatMemoriesForPrompt(memories);
    const systemPrompt = buildSystemPrompt(persona) + (memoryPrompt ? `\n\n${memoryPrompt}` : '');

    const readable = await streamChat(systemPrompt, messages);
    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new Response(JSON.stringify({ error: '请求失败' }), { status: 500 });
  }
}
