import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

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

export async function POST(req: Request) {
  const { items, language } = await req.json() as {
    items: Array<{ title?: string; contentSnippet?: string }>;
    language?: string;
  };

  const prompt = items
    .map((it) => `Title: ${it.title}\n${it.contentSnippet ? `${it.contentSnippet}\n` : ''}`)
    .join('\n\n');

  const langInstruction = languageInstructions[language ?? 'pl'] ?? languageInstructions.pl;

  const result = streamText({
    model: openrouter.chat('tencent/hy3:free'),
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

  return result.toTextStreamResponse();
}
