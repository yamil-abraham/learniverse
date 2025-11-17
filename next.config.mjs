/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Mantener type checking habilitado
    ignoreBuildErrors: false,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Turbopack config (required for Next.js 15+)
  turbopack: {},
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
