import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_PUBLIC_URL   || undefined
const allowedDevOriginsList =allowedDevOrigins ? [allowedDevOrigins] : undefined
const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['67f5-45-187-23-140.ngrok-free.app'] ,
};

export default nextConfig;
