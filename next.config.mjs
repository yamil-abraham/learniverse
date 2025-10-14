/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Deshabilitar durante el build en Vercel (conflicto con next@14 y eslint-config-next@15)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mantener type checking habilitado
    ignoreBuildErrors: false,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
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
