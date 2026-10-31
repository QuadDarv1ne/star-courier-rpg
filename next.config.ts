import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  // Next.js matches only the hostname of the Origin/Referer header here:
  // a scheme ("https://") or a port in an entry makes it never match.
  // `*` = exactly one label, `**` = one or more labels (only at the start).
  allowedDevOrigins: [
    // Preview platform: the app host plus any depth of space-z.ai subdomains.
    "star-courier.space-z.ai",
    "**.space-z.ai",
    // Hosts this machine answers on: VirtualBox host-only, Wi-Fi LAN, WSL switch.
    "192.168.56.1",
    "192.168.31.77",
    "172.30.0.1",
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
