"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { adConfig } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  className,
  style,
}: AdSlotProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!adConfig.enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [pathname, slot]);

  if (!adConfig.enabled) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 text-gray-500 font-mono text-sm p-4 ${className ?? ""}`}
        style={{ width: "100%", minHeight: "250px", ...style }}
      >
        <div className="text-center">
          <strong>Ad Placement</strong>
          <br />
          Slot: <span className="text-blue-600 font-bold">{slot}</span>
          <br />
          Format: {format}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style} key={pathname + slot}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client={adConfig.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
