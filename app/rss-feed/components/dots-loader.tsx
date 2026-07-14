'use client';

export function DotsLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      {/* Scan line decoration */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse"
            style={{ animationDelay: `${i * 200}ms`, opacity: 0.3 + i * 0.15 }}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-[#00f5ff] text-xs font-bold tracking-[0.3em] uppercase">
          CONNECTING
        </span>
        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00f5ff] rounded-full"
            style={{
              animation: 'progress-fill 2s ease-in-out infinite',
              boxShadow: '0 0 8px #00f5ff',
            }}
          />
        </div>
        <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase mt-1">
          Establishing local link
        </span>
      </div>
    </div>
  );
}
