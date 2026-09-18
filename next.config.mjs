/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker runner stage (standalone server.js).
  output: "standalone",
  experimental: {
    // Cap build workers: default = host CPU count, which OOMs small VPS
    // boxes during `next build` ("pthread_create: Resource temporarily
    // unavailable" in "Collecting page data").
    cpus: 2,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      if (config.cache && typeof config.cache === "object") {
        config.cache.maxMemoryGenerations = 1;
      }
    }
    return config;
  },
};

export default nextConfig;
