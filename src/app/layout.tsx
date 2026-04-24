import './globals.css'
import { Inter } from 'next/font/google'
import { Sidebar } from '@/components/layout/Sidebar'
import { Children } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Meme Fábrica - Control de Producción',
  description: 'Sistema de inteligencia artificial para gestión textil',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#080b10] flex h-screen overflow-hidden`}>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}