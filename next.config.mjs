/** @type {import('next').NextConfig} */
const nextConfig = {
  // The editor's GitHub sign-in runs on 127.0.0.1 during local setup.
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    deviceSizes: [320, 480, 640, 960, 1440, 1920, 2560],
    imageSizes: [160],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8a5603baa7c14b72b81d23aa7715704e.r2.dev',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'media.artistgrant.co.uk',
        pathname: '/media/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/apply', destination: '/', permanent: true },
      { source: '/previouswinners/2024grant-ntd96', destination: '/previouswinners/2024', permanent: true },
      { source: '/previouswinners/2023grant', destination: '/previouswinners/2023', permanent: true },
      { source: '/previouswinners/2022grant-8clt8', destination: '/previouswinners/2022', permanent: true },
      { source: '/previouswinners/2021grant-sbbp8', destination: '/previouswinners/2021', permanent: true },
    ]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
}

export default nextConfig
