'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  IconHome, IconFolderOpen, IconBuildingSkyscraper,
  IconCurrencyDollar, IconCalendar, IconSettings,
  IconChevronRight, IconTimeline, IconEye, IconCheck
} from '@tabler/icons-react'
import { currentUser } from '@/lib/mock-data'
import { cn } from '@/lib/cn'
import { useRole, ROLES, type Capability } from '@/lib/use-role'

const nav: { group: string; items: { href: string; label: string; icon: typeof IconHome; cap?: Capability }[] }[] = [
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
      { href: '/finanzas', label: 'Finanzas', icon: IconCurrencyDollar, cap: 'finanzasGlobal' },
      { href: '/agenda', label: 'Agenda', icon: IconCalendar },
      { href: '/cronograma', label: 'Cronograma', icon: IconTimeline, cap: 'cronogramaMaestro' },
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
  const { role, setRole, can } = useRole()
  const [roleMenu, setRoleMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeRole = ROLES.find(r => r.id === role) || ROLES[0]

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setRoleMenu(false) }
    if (roleMenu) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [roleMenu])

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
        {nav.map((section) => {
          const items = section.items.filter(it => !it.cap || can(it.cap))
          if (items.length === 0) return null
          return (
          <div key={section.group} className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B6B0A2] px-3 mb-2">
              {section.group}
            </p>
            {items.map(({ href, label, icon: Icon }) => {
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
          )
        })}
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
        <div className="relative" ref={menuRef}>
          {roleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-[14px] border border-[#ECE8D6] bg-white shadow-[0_8px_24px_rgba(19,13,16,0.12)] p-1.5 z-40">
              <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A] flex items-center gap-1.5">
                <IconEye size={12} stroke={1.8} /> Ver como
              </p>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setRoleMenu(false) }}
                  className="flex items-start gap-2.5 w-full rounded-[10px] px-2.5 py-2 text-left hover:bg-[#FBFAF3] transition-colors"
                >
                  <span className="grow min-w-0">
                    <span className="block text-[13px] font-medium text-[#130D10]">{r.label}</span>
                    <span className="block text-[11px] text-[#A8A29A] leading-snug">{r.desc}</span>
                  </span>
                  {r.id === role && <IconCheck size={14} className="text-[#00846F] shrink-0 mt-0.5" stroke={2.4} />}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setRoleMenu(o => !o)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] bg-[#FBFAF3] hover:bg-[#F4F1E3] transition-colors text-left"
          >
            <div className="w-[34px] h-[34px] rounded-full bg-[#00846F] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-white tracking-wide">
                {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#130D10] truncate leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-[#8A847B] truncate">{activeRole.label}</p>
            </div>
            <IconChevronRight size={14} className={cn('text-[#C4BFB4] shrink-0 transition-transform', roleMenu && '-rotate-90')} />
          </button>
        </div>
      </div>
    </aside>
  )
}
