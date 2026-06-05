import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '小雨 - 你的AI女友 💕',
  description: '一个有长期记忆的AI聊天女友，她会记住你们的每一段故事',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
