'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconHome, IconFolderOpen, IconBuildingSkyscraper,
  IconCurrencyDollar, IconCalendar, IconSettings,
  IconChevronRight, IconTimeline
} from '@tabler/icons-react'
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
      { href: '/cronograma', label: 'Cronograma', icon: IconTimeline },
    ],
  },
]

function Isotipo() {
  // Folio brand mark (brandbook p.12): blue rounded vertical bar + olive
  // half-disc (top) and smaller coral half-disc (middle), flat sides facing
  // the bar with a small gap, evoking the "f" of folio.
  return (
    <svg width="25" height="30" viewBox="0 0 66 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="4" y="4" width="27" height="72" rx="3.5" fill="#7FB0E8" />
      <path d="M36 4 A28 17.5 0 0 1 36 39 Z" fill="#D5D25D" />
      <path d="M36 40.5 A15 11 0 0 1 36 62.5 Z" fill="#FF5738" />
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[248px] shrink-0 h-screen bg-white border-r border-[#ECE8D6] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-[22px] pt-[26px] pb-5">
        <div className="flex items-center gap-2.5">
          <Isotipo />
          <span className="font-poppins text-[26px] leading-none font-semibold tracking-[-0.02em] text-[#130D10]">
            folio
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3.5 py-2 overflow-y-auto">
        {nav.map((section) => (
          <div key={section.group} className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B6B0A2] px-3 mb-2">
              {section.group}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link key={href} href={href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-sm transition-colors mb-1',
                      active
                        ? 'bg-[#FF5738] text-white font-semibold'
                        : 'text-[#5C564E] hover:bg-[#FBFAF3] font-medium'
                    )}
                  >
                    <Icon size={18} stroke={active ? 2 : 1.6} />
                    {label}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3.5 pb-5">
        <Link href="/ajustes">
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-sm mb-2 transition-colors',
            isActive('/ajustes')
              ? 'bg-[#FF5738] text-white font-semibold'
              : 'text-[#5C564E] hover:bg-[#FBFAF3] font-medium'
          )}>
            <IconSettings size={18} stroke={1.6} />
            Ajustes
          </div>
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#FBFAF3] cursor-pointer group">
          <div className="w-[34px] h-[34px] rounded-full bg-[#00846F] flex items-center justify-center shrink-0">
            <span className="text-[12px] font-semibold text-white tracking-wide">
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#130D10] truncate leading-tight">{currentUser.name}</p>
            <p className="text-[11px] text-[#8A847B]">{currentUser.profession}</p>
          </div>
          <IconChevronRight size={14} className="text-[#C4BFB4] shrink-0" />
        </div>
      </div>
    </aside>
  )
}
