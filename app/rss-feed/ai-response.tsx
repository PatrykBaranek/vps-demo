import React from "react";
import ReactMarkdown from "react-markdown";

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold text-white mt-4 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-200 mt-3 mb-1">{children}</h3>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
  li: ({ children }) => (
    <li className="flex gap-2 text-gray-300 text-sm">
      <span className="text-gray-500 shrink-0 mt-0.5">•</span>
      <span>{children}</span>
    </li>
  ),
  p: ({ children }) => <p className="text-gray-300 text-sm leading-relaxed mb-2">{children}</p>,
};

export interface AIResponseProps {
  summary: string;
  isStreaming?: boolean;
}

export function AIResponse({ summary, isStreaming }: Readonly<AIResponseProps>) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown components={mdComponents}>
        {summary}
      </ReactMarkdown>
      {isStreaming && <span className="inline-block w-[1.5px] h-3.5 bg-gray-400 animate-pulse ml-0.5 rounded-sm" />}
    </div>
  );
}
