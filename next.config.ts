import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const r2PublicHost = (() => {
  const configured = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!configured) return '*.r2.dev';
  try {
    return new URL(configured).hostname;
  } catch {
    return '*.r2.dev';
  }
})();

const r2EndpointHost = (() => {
  const configured = process.env.R2_ENDPOINT;
  if (!configured) return '*.r2.cloudflarestorage.com';
  try {
    return new URL(configured).hostname;
  } catch {
    return '*.r2.cloudflarestorage.com';
  }
})();

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: blob: https://${r2PublicHost} https://images.unsplash.com https://*.tile.openstreetmap.org`,
  // FIX: Added R2 public host and R2 endpoint host to allow direct browser uploads
  `connect-src 'self' https://*.tile.openstreetmap.org https://${r2PublicHost} https://${r2EndpointHost}`,
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  eslint: {
    // FIX: Removed duplicate module.exports block below — this is the only place
    // eslint config should live. The module.exports block was overriding the entire
    // nextConfig at runtime, silently discarding CSP headers, image patterns,
    // serverActions allowedOrigins, and more.
    ignoreDuringBuilds: true,
  },

  // Security Headers applied to all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
    ];
  },

  // Whitelist external image domains for Next/Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: r2PublicHost,
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
    ],
  },

  // Protect Server Actions from CSRF attacks in production
  experimental: {
    serverActions: {
      allowedOrigins: isDev
        ? ['localhost:3000', '127.0.0.1:3000', 'bodim.lk', 'www.bodim.lk']
        : ['bodim.lk', 'www.bodim.lk'],
    },
  },
};

export default nextConfig;