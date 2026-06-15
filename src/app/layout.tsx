import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '150 Marketing',
  description: 'Marketing automation platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
