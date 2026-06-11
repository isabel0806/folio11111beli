import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Folio — Project Sellers',
  description: 'Gestión de proyectos para profesionales independientes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex">
        <Sidebar />
        <main className="flex-1 ml-[220px] min-h-screen bg-[#F9F9F8] overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
