'use client';

import { generateId, type Message } from 'ai';
import { useChat } from 'ai/react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DayAvailableTimes } from './day-available-times';
import { AvailableTimesSkeleton } from './day-available-time.skeleton';
import ErrorCard from './error-card';

const initialMessages: Message[] = [
  {
    id: generateId(),
    role: 'user',
    content: "I'm your friendly booking Agent, will help you lock in your appointment"
  }
];
export function ChatInterfaceUI({ api = '/api/chat' }: { api?: string }) {
  const { messages, input, setInput, handleSubmit, error, reload } = useChat({
    initialMessages,
    api
  });
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <ScrollArea className="flex-grow p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`my-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-lg p-3 ${
                message.role === 'user' ? 'bg-slate-600 text-primary-foreground' : 'bg-neutral-50'
              }`}
            >
              {message.role === 'user' ? message.content : null}
              {message.toolInvocations?.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;
                if (state === 'result') {
                  if (toolName === 'showBookingOptions') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        <DayAvailableTimes {...result} />
                      </div>
                    );
                  }
                } else {
                  return (
                    <div key={toolCallId}>
                      {toolName === 'showBookingOptions' ? <AvailableTimesSkeleton /> : null}
                    </div>
                  );
                }
              }) ?? null}
            </div>
          </div>
        ))}
        {error && <ErrorCard reload={reload} />}
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow"
          />
          <Button type="submit">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
