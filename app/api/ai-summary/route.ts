import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Configure OpenRouter as the LLM provider.
// Ensure you have an OPENROUTER_API_KEY environment variable set.
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  // Optional identification headers for OpenRouter.
  // Use the `headers` field to set custom headers such as X-OpenRouter-Title and HTTP-Referer.
  headers: {
    'X-OpenRouter-Title': 'YourApp',
    'HTTP-Referer': 'https://yourapp.com',
    // Add any additional custom headers here.
  },
});

export async function POST(req: Request) {
  const { items } = await req.json() as {
    items: Array<{ title?: string; contentSnippet?: string }>;
  };

  const prompt = items
    .map((it) => `Title: ${it.title}\n${it.contentSnippet ? `${it.contentSnippet}\n` : ''}`)
    .join('\n\n');

  const result = streamText({
    // Use the requested model from OpenRouter. Adjust the model ID as needed.
    // Example model: 'google/gemma-4-31b-it:free'
    // Use a chat model ID supported by OpenRouter. For example, OpenAI's GPT-4o.
    model: openrouter.chat('openrouter/free'),
    system: [
      'You are a professional news editor.',
      'Summarize the provided RSS feed articles into a concise briefing grouped by theme.',
      'Use markdown with bold section headers and bullet points.',
      'Write in a neutral, editorial tone.',
      'Do not address the reader. Do not include greetings, sign-offs, offers to help, or meta-commentary about the summary.',
      'Output only the summary itself — nothing before or after it.',
    ].join(' '),
    prompt,
  });

  return result.toTextStreamResponse();
}
