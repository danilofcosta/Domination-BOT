import type { NextConfig } from "next";

const allowedDevOrigins = process.env.NEXT_PUBLIC_URL   || undefined
const allowedDevOriginsList =allowedDevOrigins ? [allowedDevOrigins] : undefined
const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins:allowedDevOriginsList,
};

export default nextConfig;
