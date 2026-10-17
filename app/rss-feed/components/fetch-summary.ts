export type SummaryRequest =
  | { kind: 'briefing'; language: string; category: string }
  | { kind: 'article'; language: string; link: string };

// Requests a shared summary from `/api/ai-summary`. Stored summaries arrive
// in one piece; freshly generated ones stream in and are passed to `onChunk`
// as they arrive. Resolves with the full text.
export async function fetchSummary(
  request: SummaryRequest,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch('/api/ai-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullSummary = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // `stream: true` keeps multi-byte characters (ą, ł, ü…) intact when they
    // are split across chunks.
    const chunk = decoder.decode(value, { stream: true });
    fullSummary += chunk;
    onChunk(chunk);
  }

  return fullSummary;
}
