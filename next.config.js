/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: { cpus: 1, webpackMemoryOptimizations: true, webpackBuildWorker: false },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
