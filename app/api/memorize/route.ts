import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractMemory } from '@/lib/claude';
import { MemoryEntry, Message } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const result = await extractMemory(messages);
    const now = new Date();
    const dateLabel = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    const memory: MemoryEntry = {
      id: uuidv4(),
      createdAt: Date.now(),
      dateLabel,
      summary: result.summary,
      keywords: result.keywords,
      highlights: result.highlights,
    };

    return NextResponse.json({ memory });
  } catch {
    return NextResponse.json({ error: '记忆整理失败' }, { status: 500 });
  }
}
