import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';
import { openai } from '@/lib/openai-model';
import {
  getLocalDateTimeString,
} from '@/utils/time-utils';
import { availableThirtyMinSpots } from '@/utils/google-cal-utils';
import { extractDateTimeInterval } from '@/utils/langchain-chains';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: openai(),
    system: `
      You're a friendly booking agent, and your goal is to help users lock in appointments that work best for them. 
      Your task is extract any date-time reference from user input and pass it to the available tools.
      `,
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
          const { start, end } = await extractDateTimeInterval(timeReference);
          if (start === null) {
            throw new Error("Couldn't extract date-time interval");
          }
          // extractDateTimeInterval returns local times
          const startLocalTZ = getLocalDateTimeString(start, 'start');
          const endLocalTZ =
            typeof end === 'string'
              ? getLocalDateTimeString(end, 'end')
              : getLocalDateTimeString(start, 'end');
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
