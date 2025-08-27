/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  serverExternalPackages: ['selenium-webdriver', 'puppeteer'],
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },

  // Webpack configuration for external packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('selenium-webdriver', 'puppeteer')
    }
    return config
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Images configuration
  images: {
    unoptimized: true,
  },
}

export default nextConfig
