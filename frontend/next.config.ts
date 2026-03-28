import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /** Monorepo: repo root has another package-lock.json — point Turbopack at the real workspace root */
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
