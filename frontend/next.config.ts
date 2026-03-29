import type { NextConfig } from "next";
import path from "path";

/**
 * On Vercel only: parent folder has a second package-lock — avoids Turbopack picking the wrong root.
 * Do NOT set this locally: it makes resolution run from the API root, so `tailwindcss` (in frontend/node_modules) fails.
 */
const turbopack =
  process.env.VERCEL === "1"
    ? { root: path.resolve(process.cwd(), "..") }
    : undefined;

const nextConfig: NextConfig = {
  ...(turbopack ? { turbopack } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
