import OpenAI from 'openai';
import { Message } from '@/types';

const getClient = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });

const getModel = () => process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

export async function streamChat(
  systemPrompt: string,
  messages: Message[]
): Promise<ReadableStream<Uint8Array>> {
  const client = getClient();
  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: getModel(),
    max_tokens: 1024,
    messages: chatMessages,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

export async function extractMemory(messages: Message[]): Promise<{
  summary: string;
  keywords: string[];
  highlights: string[];
}> {
  const client = getClient();
  const text = messages
    .map((message) => `${message.role === 'user' ? '用户' : 'AI'}：${message.content}`)
    .join('\n');

  const response = await client.chat.completions.create({
    model: getModel(),
    max_tokens: 512,
    messages: [
      {
        role: 'system',
        content:
          '你是记忆提取助手。从对话中提取关键记忆，只返回JSON，不要有其他文字。\n格式：{"summary":"...","keywords":["..."],"highlights":["..."]}\n要求：summary 200字内，keywords 3-8个，highlights 3-6条以"用户"或"他"开头的细节。',
      },
      { role: 'user', content: `请提取以下对话的记忆：\n\n${text}` },
    ],
  });

  const raw = response.choices[0]?.message?.content || '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('记忆提取失败');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    summary?: string;
    keywords?: string[];
    highlights?: string[];
  };

  return {
    summary: parsed.summary ?? '',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
  };
}
