import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      { source: '/de/ueber-mich', destination: '/de/about' },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@swc/helpers/_/_interop_require_default': require.resolve('@swc/helpers/cjs/_interop_require_default.cjs'),
      '@swc/helpers/_/_interop_require_wildcard': require.resolve('@swc/helpers/cjs/_interop_require_wildcard.cjs'),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'headless-wpnext-blog.local',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'fs26-back.felixseeger.de',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'fs26-back.felixseeger.de',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
