/** @type {import('next').NextConfig} */
const backendUrl = process.env.INTERNAL_API_URL || "http://backend:8080";

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "images.unsplash.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
