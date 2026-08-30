import React from "react";
import ReactMarkdown from "react-markdown";

const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-3 mb-1 text-sm font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-2 mb-1 text-sm font-medium">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="my-1.5 flex flex-col gap-0.5">{children}</ul>,
  li: ({ children }) => (
    <li className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
      <span className="mt-0.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  ),
  p: ({ children }) => <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{children}</p>,
};

export interface AIResponseProps {
  summary: string;
  isStreaming?: boolean;
}

export function AIResponse({ summary, isStreaming }: Readonly<AIResponseProps>) {
  return (
    <div className="max-w-none">
      <ReactMarkdown components={mdComponents}>
        {summary}
      </ReactMarkdown>
      {isStreaming && <span className="shimmer text-xs text-muted-foreground">Streaming…</span>}
    </div>
  );
}
