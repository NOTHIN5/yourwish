import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/start-text-editor',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
