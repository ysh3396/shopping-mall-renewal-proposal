import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "placehold.co" },
      { hostname: "cdn.imweb.me" },
      { hostname: "via.placeholder.com" },
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
