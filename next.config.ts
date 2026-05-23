import type { NextConfig } from "next";

const buildTime = new Date().toLocaleString("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
