import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md h-[90vh] min-h-[600px]">
        <ChatInterface />
      </div>
    </main>
  );
}
