'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import { generateId } from 'ai';
import { openai } from '@/lib/openai-model';
import { naturalLangDateParser, utcToLocaleTimeZone } from '@/utils/time-utils';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function bookingGoogleCalendar(input: string): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai(),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [...messages, { role: 'assistant', content }]);
      }

      return <div>{content}</div>;
    },
    tools: {
      showBookingOptions: {
        description:
          'Obtain free time spots so users can choose the best option to set their appointment',
        parameters: z.object({
          timeReference: z.string().describe(`
            A natural language date reference in the future(example: 'tomorrow morning', 'next monday at 3PM', 'in 2 weeks').
            Text always must be in English.
            `)
        }),
        generate: async ({ timeReference }) => {
          const { startDateTime: start, endDateTime: end } = naturalLangDateParser(timeReference);
          const startLocalTZ = utcToLocaleTimeZone(start);
          const endLocalTZ = utcToLocaleTimeZone(end);
          console.log({ timeReference, start, end, startLocalTZ, endLocalTZ });

          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Showing the available time intervals, so that the user can choose the most convenient one`
            }
          ]);

          return (
            <div>
              <p>Start:{start}</p>
              <p className="text-red-800 font-bold">Start (Local Timezone):{startLocalTZ}</p>
              <p>End:{end}</p>
              <p className="text-red-800 font-bold">End (Local Timezone):{endLocalTZ}</p>
            </div>
          );
        }
      }
    }
  });

  return {
    id: generateId(),
    role: 'assistant',
    display: result.value
  };
}

export const AI = createAI<
  ServerMessage[],
  ClientMessage[],
  { bookingGoogleCalendar: typeof bookingGoogleCalendar }
>({
  actions: {
    bookingGoogleCalendar
  },
  initialAIState: [],
  initialUIState: [
    {
      id: '0',
      role: 'assistant',
      display: 'Hi, I can help you booking an appointment, so when is a good time for you?'
    }
  ]
});
