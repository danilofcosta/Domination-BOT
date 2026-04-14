import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_PUBLIC_URL   || undefined
const allowedDevOriginsList =allowedDevOrigins ? [allowedDevOrigins] : undefined
const nextConfig: NextConfig = {
  allowedDevOrigins:allowedDevOriginsList,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
