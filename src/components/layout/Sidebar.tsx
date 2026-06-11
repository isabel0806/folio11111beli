'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconHome, IconFolderOpen, IconBuildingSkyscraper,
  IconCurrencyDollar, IconCalendar, IconSettings,
  IconChevronRight
} from '@tabler/icons-react'
import { Avatar } from '@/components/ui/Avatar'
import { currentUser } from '@/lib/mock-data'
import { cn } from '@/lib/cn'

const nav = [
  {
    group: 'PRINCIPAL',
    items: [
      { href: '/', label: 'Inicio', icon: IconHome },
      { href: '/proyectos', label: 'Proyectos', icon: IconFolderOpen },
    ],
  },
  {
    group: 'ESTUDIO',
    items: [
      { href: '/estudio', label: 'Estudio', icon: IconBuildingSkyscraper },
    ],
  },
  {
    group: 'GESTIÓN',
    items: [
      { href: '/finanzas', label: 'Finanzas', icon: IconCurrencyDollar },
      { href: '/agenda', label: 'Agenda', icon: IconCalendar },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[220px] shrink-0 h-screen bg-white border-r border-[#E5E5E3] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E5E3]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#F5D242] rounded-lg flex items-center justify-center">
            <span className="text-[10px] font-black text-[#130D10]">F</span>
          </div>
          <span className="text-base font-bold text-[#130D10] tracking-tight">FOLIO</span>
        </div>
        <p className="text-[10px] text-[#9B9B9B] mt-1 ml-9">Project Sellers</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {nav.map((section) => (
          <div key={section.group} className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#ADADAD] px-2 mb-1">
              {section.group}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors mb-0.5',
                    isActive(href)
                      ? 'bg-[#FFF9D6] text-[#130D10] font-medium border-l-2 border-[#F5D242] rounded-l-none pl-[6px]'
                      : 'text-[#4B4B4B] hover:bg-[#F9F9F8]'
                  )}
                >
                  <Icon size={16} stroke={1.5} />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#E5E5E3] px-3 py-3">
        <Link href="/ajustes">
          <div className={cn(
            'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm mb-1 transition-colors',
            isActive('/ajustes') ? 'bg-[#FFF9D6] text-[#130D10] font-medium' : 'text-[#4B4B4B] hover:bg-[#F9F9F8]'
          )}>
            <IconSettings size={16} stroke={1.5} />
            Ajustes
          </div>
        </Link>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F9F9F8] cursor-pointer group">
          <Avatar name={currentUser.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#130D10] truncate">{currentUser.name}</p>
            <p className="text-[10px] text-[#9B9B9B]">{currentUser.profession}</p>
          </div>
          <IconChevronRight size={12} className="text-[#ADADAD] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </aside>
  )
}
