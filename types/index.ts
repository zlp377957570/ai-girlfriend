export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MemoryEntry {
  id: string;
  createdAt: number;
  dateLabel: string;
  summary: string;
  keywords: string[];
  highlights: string[];
}

export interface PersonaConfig {
  name: string;
  avatar: string;
  personality: string;
  speakingStyle: string;
  interests: string;
  preset: string;
}

export interface ChatState {
  messages: Message[];
  memories: MemoryEntry[];
  persona: PersonaConfig;
  isLoading: boolean;
  isMemorizing: boolean;
}
