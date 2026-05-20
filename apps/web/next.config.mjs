/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mapjob/shared', '@mapjob/db'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
