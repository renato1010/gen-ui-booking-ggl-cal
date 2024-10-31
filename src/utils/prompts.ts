import { PromptTemplate } from '@langchain/core/prompts';

const intervalPrompt = `
You are tasked with extracting date-time references from a user query and converting them into ISO format timestamps. Follow these steps carefully:

1. The current timestamp is provided to you as a reference point:
{currentTimeStamp}

2. You will receive a user query. Your task is to:
   a) Identify any date-time references in the query
   b) Calculate the corresponding start and end timestamps
   c) Format the response with start and end timestamps in ISO format

3. Analyze the following user query for any date-time references:
{userQuery}

4. If a date-time reference is found:
   a) Calculate the start timestamp based on the reference
   b) For specific time ranges (e.g., "this week", "next month"), calculate both start and end timestamps
   c) For point-in-time references (e.g., "next Monday", "tomorrow"), set the end timestamp to null
   d) If no clear end time is specified, set the end timestamp to null

5. If no date-time reference is found, set both start and end timestamps to null

6. Your full response must be only a JSON string like this:
{{"start": [ISO format start timestamp or null], "end": [ISO format end timestamp or null]}}

Take this examples as reference of query and the kind or response we need
Examples:

1. Query: "Schedule a meeting for next Monday"
   Response:
{{
   "start": "2023-05-22T00:00:00.000Z"
   "end": null
}}

2. Query: "Set me an appointment for today?"
   Response:
{{
   "start": "2023-05-15T00:00:00.000Z"
   "end": "2023-05-15T23:59:59.999Z"
}}

3. Query: "Book a meeting for Q2"
   Response:
{{
   "start": "2023-04-01T00:00:00.000Z"
   "end": "2023-06-30T23:59:59.999Z"
}}

4. Query: "What's the latest news?"
   Response:
{{
   "start": null
   "end": null
}}

Remember to use the provided current timestamp as your reference point for all calculations. Always return your response as JSON string s as shown in the examples.
`;

export const intervalPromptTemplate = PromptTemplate.fromTemplate(intervalPrompt);
