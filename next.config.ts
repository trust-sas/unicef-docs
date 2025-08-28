import type { NextConfig } from 'next'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const remotePatterns = [NEXT_PUBLIC_SERVER_URL].map((item) => {
  const url = new URL(item)

  return {
    hostname: url.hostname,
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
  }
})

const nextConfig: NextConfig = {
  allowedDevOrigins: ['18.223.27.93', 'localhost:3010'],
  images: {
    remotePatterns: [...remotePatterns],
  },
  reactStrictMode: true,
}

export default nextConfig
