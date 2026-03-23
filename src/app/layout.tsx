import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Poly Assistant — Radici Yarn',
  description: 'Assistente AI per il reparto Polimerizzazione di Radici Yarn',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={dmSans.className} style={{ backgroundColor: '#0f1117', color: '#e8eaf0' }}>
        {children}
      </body>
    </html>
  )
}
