/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output if needed for deployment
  // output: 'standalone',
  // Reduce memory pressure from webpack filesystem cache (fixes PackFileCacheStrategy OOM)
  webpack: (config, { dev }) => {
    if (dev) {
      // Keep filesystem cache but avoid large pack allocation failures
      if (config.cache && typeof config.cache === "object") {
        // Let Next manage cache; ensure memory limit hint
        config.cache.maxMemoryGenerations = 1;
      }
    }
    return config;
  },
};

export default nextConfig;
