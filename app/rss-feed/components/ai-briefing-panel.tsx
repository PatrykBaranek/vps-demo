'use client';

import React from 'react';
import { AIResponse } from './ai-response';

interface AIBriefingPanelProps {
  items: Array<{ title?: string; contentSnippet?: string }>;
}

export function AIBriefingPanel({ items }: Readonly<AIBriefingPanelProps>) {
  const [open, setOpen] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/ai-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
          signal: controller.signal,
          cache: 'force-cache',
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          setOutput((prev) => prev + decoder.decode(value));
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message ?? 'Unexpected error');
        }
      } finally {
        setIsStreaming(false);
      }
    })();

    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pb-4 z-50">
      <div
        className={[
          'rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl shadow-black/60',
          'transition-all duration-300 ease-in-out overflow-hidden',
          open ? 'max-h-[60vh]' : 'max-h-[52px]',
        ].join(' ')}
      >
        {/* Toggle bar */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 h-[52px] hover:bg-white/[0.04] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isStreaming ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium text-white">AI Summary of articles</span>
          </div>
          <svg
            className={[
              'w-4 h-4 text-gray-500 transition-transform duration-300 group-hover:text-gray-300',
              open ? 'rotate-180' : '',
            ].join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Content */}
        <div
          className="overflow-y-auto px-5 pb-5"
          style={{ maxHeight: 'calc(60vh - 52px)' }}
        >
          {error
            ? <p className="text-red-400 text-sm">Error: {error}</p>
            : <AIResponse summary={output} isStreaming={isStreaming} />
          }
        </div>
      </div>
    </div>
  );
}
