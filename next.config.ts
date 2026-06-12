import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disabled due to Supabase auth lock issues in dev
  reactCompiler: true,
  compiler: {
    // Strip console.logs in production, but keep errors for debugging
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
        pathname: '/**', // Allow all paths from this domain
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com', // Also adding printful just in case
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
