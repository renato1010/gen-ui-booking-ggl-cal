import { Resource } from 'sst';
import { createOpenAI, OpenAIProviderSettings } from '@ai-sdk/openai';

type OpenAIProviderRestOptions = Omit<OpenAIProviderSettings, 'apiKey'>;
const openaiProviderInstance = (restOptions?: OpenAIProviderRestOptions) => {
  const apiKey = Resource.OpenAISecret.value;
  return createOpenAI({
    apiKey,
    ...restOptions
  });
};

export const openai = (model: string = 'gpt-4o') => openaiProviderInstance({})(model);
