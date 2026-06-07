import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the ngrok tunnel host to load dev resources (HMR, fonts, JS chunks)
  // so the app works correctly when accessed through the tunnel during testing.
  allowedDevOrigins: ['swirl-stuffing-untoasted.ngrok-free.dev'],
};

export default nextConfig;
