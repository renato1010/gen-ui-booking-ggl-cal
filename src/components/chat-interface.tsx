'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActions, useUIState } from 'ai/rsc';
import { AI, ClientMessage } from '@/app/ai-sdk-rsc-demo/actions';
import { generateId } from 'ai';

// Allow streaming responses upt to 30 seconds
export const maxDuration = 30;

export default function ChatInterface() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { bookingGoogleCalendar } = useActions<typeof AI>();

  const handleSend = async () => {
    if (input.trim()) {
      setConversation((currentConversation: ClientMessage[]) => [
        ...currentConversation,
        { id: generateId(), role: 'user', display: input }
      ]);
      const message = await bookingGoogleCalendar(input);
      setConversation((currentConversation: ClientMessage[]) => [...currentConversation, message]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <ScrollArea className="flex-grow p-4 space-y-4">
        {conversation.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-lg p-4 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {message.display}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2"
        >
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
