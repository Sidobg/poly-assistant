import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Poly Assistant — Radici Yarn',
  description: 'Assistente AI per il reparto Polimerizzazione di Radici Yarn',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white`}>{children}</body>
    </html>
  )
}
