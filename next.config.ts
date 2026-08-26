import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "**.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    inlineCss: true,
serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source:
            "/uploads/vehicles/:filename",
          destination:
            "/api/vehicle-images/:filename",
        },
      ],
    };
  },
};

export default nextConfig;
