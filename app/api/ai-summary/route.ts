import { streamText, createTextStreamResponse, toTextStream } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { encode } from 'gpt-tokenizer';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'X-OpenRouter-Title': 'YourApp',
    'HTTP-Referer': 'https://yourapp.com',
  },
});

const languageInstructions: Record<string, string> = {
  en: 'Write the summary in English.',
  pl: 'Write the summary in Polish (Polski).',
  de: 'Write the summary in German (Deutsch).',
};

const MAX_INPUT_TOKENS = 2048;
const SYSTEM_OVERHEAD = 256;

export async function POST(req: Request) {
  const { items, language } = await req.json() as {
    items: Array<{ title?: string; contentSnippet?: string }>;
    language?: string;
  };

  // Token-aware truncation: items are already sorted newest-first from the RSS fetch,
  // so iterating in-order naturally keeps the most recent articles.
  const itemTexts: string[] = [];
  let totalTokens = 0;
  const budget = MAX_INPUT_TOKENS - SYSTEM_OVERHEAD;

  for (const it of items) {
    const text = `Title: ${it.title}\n${it.contentSnippet ? `${it.contentSnippet}\n` : ''}`;
    const tokens = encode(text).length;
    if (totalTokens + tokens > budget && itemTexts.length > 0) break;
    itemTexts.push(text);
    totalTokens += tokens;
  }

  const prompt = itemTexts.join('\n\n');

  const langInstruction = languageInstructions[language ?? 'pl'] ?? languageInstructions.pl;

  const response = streamText({
    model: openrouter.chat('openrouter/free'),
    system: [
      'You are a professional news editor.',
      'Summarize the provided RSS feed articles into a concise briefing grouped by theme.',
      'Use markdown with bold section headers and bullet points.',
      'Write in a neutral, editorial tone.',
      'Do not address the reader. Do not include greetings, sign-offs, offers to help, or meta-commentary about the summary.',
      langInstruction,
      'Output only the summary itself — nothing before or after it.',
    ].join(' '),
    prompt,
  });

  return createTextStreamResponse({
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    stream: toTextStream({ stream: response.stream }),
  });
}
