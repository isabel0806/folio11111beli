import type { Metadata } from 'next'
import { Inter, Libre_Baskerville, Poppins } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Folio — Project Sellers',
  description: 'Gestión de proyectos para profesionales independientes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full ${inter.variable} ${libreBaskerville.variable} ${poppins.variable}`}>
      <body className="h-full flex">
        <ToastProvider>
          <Sidebar />
          <main className="flex-1 ml-[248px] min-h-screen bg-[#FFFEF0] overflow-y-auto">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}
