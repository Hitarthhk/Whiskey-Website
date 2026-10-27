/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the running dev server from overwriting production manifests.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  transpilePackages: ["three"],
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
