import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_PUBLIC_URL   || undefined
const allowedDevOriginsList =allowedDevOrigins ? [allowedDevOrigins] : undefined
const nextConfig: NextConfig = {
  allowedDevOrigins:['f4e8-45-187-23-163.ngrok-free.app'],
};

export default nextConfig;
