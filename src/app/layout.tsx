import './globals.css'
import { Inter } from 'next/font/google'
import { PWARegister } from '@/components/PWARegister'
import { Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Meme Fábrica - Control de Producción',
  description: 'Sistema de inteligencia artificial para gestión textil',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meme Fábrica',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#080b10] flex h-screen overflow-hidden`}>
        <PWARegister />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}