import { intervalPromptTemplate } from '@/utils/prompts';
import { ChatAnthropicSingleton } from '@/lib/anthropic-model';
import { utcToLocaleTimeZone } from '@/utils/time-utils';
import { JsonOutputParser } from '@langchain/core/output_parsers';

const model = ChatAnthropicSingleton.getInstance();
export type DateTimeIntervalLC = { start: string | null; end: string | null };
const outputParser = new JsonOutputParser<DateTimeIntervalLC>();

export async function extractDateTimeInterval(query: string) {
  const response = await intervalPromptTemplate
    .pipe(model)
    .pipe(outputParser)
    .invoke({
      userQuery: query,
      currentTimeStamp: utcToLocaleTimeZone(new Date().toISOString())
    });
  return response;
}
