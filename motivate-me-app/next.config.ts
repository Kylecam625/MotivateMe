import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'child_process' and other Node.js modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        child_process: false,
        'node:child_process': false,
        'node:fs': false,
        'node:net': false,
        'node:path': false,
        'node:os': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:crypto': false,
        'node:events': false,
        'node:url': false,
        'node:querystring': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
      };
    }
    return config;
  },
};

export default nextConfig;
