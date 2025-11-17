import type { Metadata } from 'next'
import { Fredoka } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Learniverse - Plataforma Educativa Gamificada',
  description: 'Plataforma educativa con avatares 3D para enseñanza de Matemática',
  keywords: ['educación', 'matemáticas', 'gamificación', '3D', 'aprendizaje'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={fredoka.variable}>
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
