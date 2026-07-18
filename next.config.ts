import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    serverActions: {
      bodySizeLimit: "10mb",
    },
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
