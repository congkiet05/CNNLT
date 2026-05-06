/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy local: chuyển /api/* đến đúng service khi chạy local
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3001/api/auth/:path*',
      },
      {
        source: '/api/ingredients/:path*',
        destination: 'http://localhost:3002/api/ingredients/:path*',
      },
    ];
  },
}

export default nextConfig
