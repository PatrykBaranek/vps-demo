export const adConfig = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "",
  enabled: process.env.NODE_ENV === "production",
} as const;
