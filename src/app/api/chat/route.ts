import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';
import { openai } from '@/lib/openai-model';
import { naturalLangDateParser, utcToLocaleTimeZone } from '@/utils/time-utils';
import { availableThirtyMinSpots } from '@/utils/google-cal-utils';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: openai(),
    system:
      "You're a friendly booking agent, and your goal is to help users lock in appointments that work best for them.",
    messages: coreMessages,
    tools: {
      showBookingOptions: {
        description:
          'Obtain available(free) time spots so users can choose the best option to set their appointment',
        parameters: z.object({
          timeReference: z.string().describe(`
              A natural language date reference in the future(example: 'tomorrow morning', 'next monday at 3PM', 'in 2 weeks').
              Text always must be in English.
              `)
        }),
        required: ['timeReference'],
        execute: async function ({ timeReference }) {
          console.log('timeReference', timeReference);
          const { startDateTime: start, endDateTime: end } = naturalLangDateParser(timeReference);
          const startLocalTZ = utcToLocaleTimeZone(start);
          const endLocalTZ = utcToLocaleTimeZone(end);
          const { day, free: availableTimes } = await availableThirtyMinSpots(
            startLocalTZ,
            endLocalTZ
          );
          const props = { day, availableTimes };
          return props;
        }
      }
    }
  });
  return result.toDataStreamResponse();
}
