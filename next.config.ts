import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Allow the ngrok tunnel host to load dev resources (HMR, fonts, JS chunks)
  // so the app works correctly when accessed through the tunnel during testing.
  allowedDevOrigins: ['swirl-stuffing-untoasted.ngrok-free.dev'],
  // Silence the "webpack config present, no turbopack config" error —
  // next-pwa adds a webpack plugin; turbopack: {} tells Next.js we're
  // intentionally running Turbopack and the webpack config is from a plugin.
  turbopack: {},
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
