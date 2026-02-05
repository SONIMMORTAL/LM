import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
