export default function BackgroundOrbs() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.5 0 0 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.5 0 0 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
