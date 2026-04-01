import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // TODO: 프로덕션 배포 시 제거 (로컬 NAT64 환경에서 private IP 차단 이슈)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chetppkxjsekjecnzbpp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
