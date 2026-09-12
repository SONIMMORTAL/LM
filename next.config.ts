import type { NextConfig } from "next";
import { VIDEO_TAPES } from "./src/lib/video-tapes";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Disabled due to Supabase auth lock issues in dev
  reactCompiler: true,
  compiler: {
    // Strip console.logs in production, but keep errors for debugging
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  async headers() {
    // Set here rather than in the proxy so these also cover static assets and
    // images, which the proxy matcher deliberately skips.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/forum',
        destination: '/vip',
        permanent: true,
      },
      {
        source: '/stoop',
        destination: '/vip',
        permanent: true,
      },
      // Video-only tapes used to have album pages; send old links and search
      // results straight to the tape on the big screen. Done here rather than
      // in the page so it's a real 308 — the root loading.tsx means a redirect
      // thrown mid-render goes out as a 200 with a client-side hop.
      ...VIDEO_TAPES.map((tape) => ({
        source: `/music/${tape.slug}`,
        destination: `/videos?v=${tape.youtubeId}`,
        permanent: true,
      })),
    ];
  },
  images: {
    // Next 16 requires every quality used by next/image to be declared here;
    // undeclared values fall back and log a warning.
    qualities: [70, 75, 80, 82, 85, 90],
    formats: ['image/avif', 'image/webp'],
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
