import React from "react";
import ReactMarkdown from "react-markdown";

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h1 className="text-base font-bold text-white mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-semibold text-white/90 mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-white/80 mt-2 mb-1">{children}</h3>,
  strong: ({ children }) => <strong className="text-white/90 font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="space-y-0.5 my-1.5">{children}</ul>,
  li: ({ children }) => (
    <li className="flex gap-2 text-white/60 text-xs leading-relaxed">
      <span className="text-white/20 shrink-0 mt-0.5">•</span>
      <span>{children}</span>
    </li>
  ),
  p: ({ children }) => <p className="text-white/60 text-xs leading-relaxed mb-2">{children}</p>,
};

export interface AIResponseProps {
  summary: string;
  isStreaming?: boolean;
}

export function AIResponse({ summary, isStreaming }: Readonly<AIResponseProps>) {
  return (
    <div className="prose prose-invert prose-xs max-w-none">
      <ReactMarkdown components={mdComponents}>
        {summary}
      </ReactMarkdown>
      {isStreaming && <span className="inline-block w-[2px] h-3.5 bg-blue-400 animate-pulse ml-0.5 rounded-sm" />}
    </div>
  );
}
