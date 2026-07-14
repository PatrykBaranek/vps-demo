'use client';

import { useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';

interface PerArticleSummaryProps {
  item: {
    title?: string;
    contentSnippet?: string;
    link?: string;
  };
}

export function PerArticleSummary({ item }: PerArticleSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (summary || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: [{
            title: item.title,
            contentSnippet: item.contentSnippet,
          }]
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch summary');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSummary(prev => prev + decoder.decode(value));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (!isOpen && !summary) fetchSummary();
        }}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        title="Get AI summary"
      >
        <MessageSquareText className="w-4 h-4 text-gray-500 hover:text-gray-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0e17]/95 rounded-2xl border border-[#00f5ff]/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#00f5ff]/10">
              <h3 className="text-sm font-bold text-[#00f5ff] tracking-wider" style={{ textShadow: '0 0 7px #00f5ff' }}>AI SUMMARY</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {loading && (
                <div className="text-gray-400 text-sm">Generating summary...</div>
              )}
              {error && (
                <div className="text-red-400 text-sm">Error: {error}</div>
              )}
              {!loading && !error && (
                <div className="prose prose-invert prose-sm">
                  <h4 className="text-white">{item.title}</h4>
                  <p className="text-gray-300">{summary || 'No summary available.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}