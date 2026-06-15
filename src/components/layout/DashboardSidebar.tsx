'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Inicio', href: '/dashboard', icon: '⌂' },
  { label: 'Clientes', href: '/dashboard/clientes', icon: '◎' },
  { label: 'Campañas', href: '/dashboard/campanas', icon: '◈' },
  { label: 'Contenido', href: '/dashboard/contenido', icon: '◇' },
  { label: 'Reportes', href: '/dashboard/reportes', icon: '◉' },
]

export function DashboardSidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[200px] bg-[#0A0A0A] border-r border-white/8 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <span className="text-white font-semibold text-sm tracking-tight">150 Marketing</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-yellow-400/10 text-yellow-400'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8">
        <p className="text-xs text-gray-600">isabel@thegiftcardcafe.com</p>
      </div>
    </aside>
  )
}
