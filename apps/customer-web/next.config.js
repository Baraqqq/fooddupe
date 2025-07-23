/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@fooddupe/types'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
  // Remove async rewrites for now - can cause layout issues
};

module.exports = nextConfig;