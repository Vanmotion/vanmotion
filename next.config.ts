import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/vehicles/:filename",
          destination:
            "/api/vehicle-images/:filename",
        },
      ],
    };
  },
};

export default nextConfig;