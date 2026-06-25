import Script from "next/script";
import { adConfig } from "@/lib/ads";

export function GoogleAdsense() {
  if (!adConfig.enabled || !adConfig.publisherId) return null;

  return (
    <Script
      id="adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
