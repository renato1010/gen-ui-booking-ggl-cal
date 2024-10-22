'use server';

import { ReactNode } from 'react';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { z } from 'zod';
import { generateId } from 'ai';
import { openai } from '@/lib/openai-model';
import { naturalLangDateParser, utcToLocaleTimeZone } from '@/utils/time-utils';
import { availableThirtyMinSpots, createEvent } from '@/utils/google-cal-utils';
import { DayAvailableTimes } from '@/components/day-available-times';
import { AvailableTimesSkeleton } from '@/components/day-available-time.skeleton';

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
  const history = getMutableAIState();

  const result = await streamUI({
    model: openai(),
    system:
      "You're a friendly booking agent, and your goal is to help users lock in appointments that work best for them.",
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
        generate: async function* ({ timeReference }) {
          yield <AvailableTimesSkeleton />;
          const { startDateTime: start, endDateTime: end } = naturalLangDateParser(timeReference);
          const startLocalTZ = utcToLocaleTimeZone(start);
          const endLocalTZ = utcToLocaleTimeZone(end);
          const { day, free: freeSpots } = await availableThirtyMinSpots(startLocalTZ, endLocalTZ);

          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Showing the available time intervals, so that the user can choose the most convenient one`
            }
          ]);

          return <DayAvailableTimes day={day} availableTimes={freeSpots} />;
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

export async function createGoogleCalEvent(startTime: string, endTime: string) {
  // create google calendar event with defaults
  try {
    const newEvent = await createEvent(startTime, endTime);
    const { creator } = newEvent;
    if (typeof creator?.email === 'undefined') {
      return {
        error: 'Error creating event'
      };
    }
    const { email } = creator;
    return { email };
  } catch (error) {
    return {
      error: `Error creating event: ${error}`
    };
  }
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
      id: generateId(),
      role: 'assistant',
      display: (
        <div className="max-w-sm rounded-lg p-3 bg-slate-600 text-primary-foreground">
          I&apos;m your friendly booking Agent, will help you lock in your appointment
        </div>
      )
    }
  ]
});
