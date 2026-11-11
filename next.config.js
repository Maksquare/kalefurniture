/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  images: {
    unoptimized: true,
  },

  productionBrowserSourceMaps: false,

  experimental: {
    webpackMemoryOptimizations: true,

    serverActions: {
      allowedOrigins: [
        'kalefurnitures.com',
        '*.kalefurnitures.com',
        'localhost:3000',
        'localhost:3001',
      ],
    },
  },
};

module.exports = nextConfig;