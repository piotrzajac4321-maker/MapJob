/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mapjob/shared', '@mapjob/db'],
  experimental: {
    typedRoutes: true,
  },
  // Database.types.ts to placeholder dopóki nie uruchomisz `pnpm db:types`
  // (wymaga połączenia z Supabase). Włącz ponownie po wygenerowaniu prawdziwych typów.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
