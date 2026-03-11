import './globals.css' // Importante para que Tailwind funcione
import { Inter } from 'next/font/google'

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
      <body className={inter.className}>
        {/* Aquí es donde Next.js inyecta el contenido de tus páginas (page.tsx) */}
        {children}
      </body>
    </html>
  )
}