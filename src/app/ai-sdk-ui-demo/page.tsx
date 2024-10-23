'use client';

import { ChatInterfaceUI } from '@/components/chat-interface-ui';

// Allow streaming responses upt to 30 seconds
export const maxDuration = 30;

export default function ChatPageUI() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-2">
          <h1 className="text-2xl font-bold text-center">
            Generative UI: Booking Google Calendar Demo
          </h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <ChatInterfaceUI />
      </main>
    </div>
  );
}
