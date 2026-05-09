/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'i.ytimg.com',
      'lamviet.net',
      'media.doanhnghiepvn.vn',
      'vinmec-prod.s3.amazonaws.com',
      'bepmina.vn',
      'image-us.eva.vn',
      'cooponline.vn',
      'picsum.photos',
    ],
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
      {
        source: '/api/recipes/:path*',
        destination: 'http://localhost:3003/api/recipes/:path*',
      },
    ];
  },
}

export default nextConfig
