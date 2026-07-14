'use client';

import React from 'react';
import { AIResponse } from './ai-response';

interface AIBriefingPanelProps {
  items: Array<{ title?: string; contentSnippet?: string }>;
  language: 'en' | 'pl' | 'de';
}

const languageLabels: Record<string, string> = {
  en: 'English',
  pl: 'Polish',
  de: 'German',
};

export function AIBriefingPanel({ items, language }: Readonly<AIBriefingPanelProps>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const doFetch = React.useCallback(async (signal: AbortSignal) => {
    setOutput('');
    setIsStreaming(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, language }),
        signal,
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
  }, [items, language]);

  React.useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    doFetch(controller.signal);
    return () => controller.abort();
  }, [doFetch, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={[
          'transition-all duration-300 ease-out overflow-hidden',
          isOpen
            ? 'w-96 max-h-96 rounded-2xl bg-[#0a0e17]/95 backdrop-blur-xl border border-white/10 shadow-2xl'
            : 'w-12 h-12 rounded-full bg-[#0a0e17]/90 backdrop-blur-xl border border-white/10 shadow-lg hover:border-white/20 hover:shadow-xl hover:scale-105',
        ].join(' ')}
      >
        {isOpen ? (
          /* Expanded card */
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 ${isStreaming ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-semibold text-white/80">AI Summary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase">{languageLabels[language]}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/30 hover:text-white/70 transition-colors ml-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5 mx-4" />

            {/* Content */}
            <div className="overflow-y-auto px-4 py-3 max-h-80">
              <div className="transition-opacity duration-200 delay-100 opacity-100">
                {error
                  ? <p className="text-red-400 text-sm">Error: {error}</p>
                  : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                          {languageLabels[language]}
                        </span>
                        {isStreaming && (
                          <span className="text-[10px] text-white/20 font-mono">Streaming...</span>
                        )}
                      </div>
                      <AIResponse summary={output} isStreaming={isStreaming} />
                    </>
                  )
                }
              </div>
            </div>
          </div>
        ) : (
          /* FAB circle */
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-full flex items-center justify-center cursor-pointer"
            title="Open AI Summary"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
