'use client';

export function DotsLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
        <span>Loading</span>
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </div>
    </div>
  );
}