/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
