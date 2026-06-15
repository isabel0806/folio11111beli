'use client'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { mockProjects, mockMilestones, mockTasks } from '@/lib/mock-data'
import { getProjectStatusLabel, getProjectTypeLabel, formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import {
  IconFolder, IconLayoutKanban, IconCurrencyDollar,
  IconSettings, IconArrowLeft, IconAlertCircle, IconCalendarTime,
  IconPlus, IconBolt, IconReceipt2, IconNotebook, IconUsersGroup,
} from '@tabler/icons-react'
import { CompartirCliente } from '@/components/proyectos/CompartirCliente'

const tabs = [
  {
    href: 'archivos',
    label: 'Archivos',
    icon: IconFolder,
    getBadge: (_id: string) => null as { count: number; color: 'red' | 'yellow' | 'blue' } | null,
  },
  {
    href: 'control',
    label: 'Control',
    icon: IconLayoutKanban,
    getBadge: (id: string) => {
      const tasks = Object.values(mockTasks).flat().filter(t => t.project_id === id)
      const pending = tasks.filter(t => t.status !== 'completado').length
      return pending > 0 ? { count: pending, color: 'blue' as const } : null
    },
  },
  {
    href: 'presupuesto',
    label: 'Presupuesto',
    icon: IconReceipt2,
    getBadge: () => null as { count: number; color: 'red' | 'yellow' | 'blue' } | null,
  },
  {
    href: 'bitacora',
    label: 'Bitácora',
    icon: IconNotebook,
    getBadge: () => null as { count: number; color: 'red' | 'yellow' | 'blue' } | null,
  },
  {
    href: 'finanzas',
    label: 'Finanzas',
    icon: IconCurrencyDollar,
    getBadge: (id: string) => {
      const ms = mockMilestones[id] || []
      const overdue = ms.filter(m => m.status === 'vencido').length
      const pending = ms.filter(m => m.status === 'pendiente').length
      if (overdue > 0) return { count: overdue, color: 'red' as const }
      if (pending > 0) return { count: pending, color: 'yellow' as const }
      return null
    },
  },
  {
    href: 'equipo',
    label: 'Equipo',
    icon: IconUsersGroup,
    getBadge: () => null as { count: number; color: 'red' | 'yellow' | 'blue' } | null,
  },
  {
    href: 'configuracion',
    label: 'Config.',
    icon: IconSettings,
    getBadge: () => null as { count: number; color: 'red' | 'yellow' | 'blue' } | null,
  },
]

const badgeStyles = {
  red: 'bg-[#FF5738] text-white',
  yellow: 'bg-[#F5D242] text-[#130D10]',
  blue: 'bg-[#7FB0E8] text-[#13314F]',
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 1.5c.4 4.6 1.4 5.6 6 6-4.6.4-5.6 1.4-6 6-.4-4.6-1.4-5.6-6-6 4.6-.4 5.6-1.4 6-6Z" fill="currentColor" />
    </svg>
  )
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string }
  const pathname = usePathname()
  const project = mockProjects.find(p => p.id === id)

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF0]">
        <p className="text-[#8A847B]">Proyecto no encontrado.</p>
      </div>
    )
  }

  const activeTab = tabs.find(t => pathname.includes(t.href))?.href || 'archivos'
  const milestones = mockMilestones[id] || []
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const total = project.total_amount || 0
  const pendiente = milestones.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
  const nextMilestone = milestones.find(m => m.status === 'pendiente')
  const overdueMilestones = milestones.filter(m => m.status === 'vencido')
  const cobradoPct = total > 0 ? Math.round((cobrado / total) * 100) : 0
  const pendientePct = total > 0 ? Math.round((pendiente / total) * 100) : 0

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFEF0]">
      {/* Top bar */}
      <div className="bg-[#FFFEF0]/95 backdrop-blur-sm border-b border-[#ECE8D6] sticky top-0 z-20">
        <div className="px-8 pt-5 pb-0 max-w-[1080px]">
          {/* Breadcrumb + quick actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Link
                href="/proyectos"
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#A8A29A] hover:text-[#130D10] transition-colors"
              >
                <IconArrowLeft size={14} /> Proyectos
              </Link>
              <span className="text-[#D8D2C2]">/</span>
              <span className="text-[12px] font-semibold text-[#130D10]">{project.name}</span>
              {overdueMilestones.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#130D10] px-2.5 py-0.5 rounded-full">
                  <IconAlertCircle size={11} /> {overdueMilestones.length} vencido{overdueMilestones.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {nextMilestone && (
                <Link
                  href={`/proyectos/${id}/finanzas`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#130D10] text-white text-[13px] font-semibold hover:bg-[#2A2025] transition-colors"
                >
                  <IconBolt size={14} /> Cobrar {formatCurrency(nextMilestone.amount, project.currency)}
                </Link>
              )}
              <Link
                href={`/proyectos/${id}/control`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ECE8D6] text-[#130D10] text-[13px] font-semibold hover:bg-[#FBFAF3] transition-colors"
              >
                <IconPlus size={14} /> Nueva tarea
              </Link>
              <CompartirCliente id={id} name={project.name} />
            </div>
          </div>

          {/* Project identity + financial bar */}
          <div className="flex items-start gap-5 mb-6">
            <div
              className="w-[60px] h-[60px] rounded-[18px] shrink-0 flex items-center justify-center font-serif text-[26px]"
              style={{ backgroundColor: project.cover_color, color: 'rgba(19,13,16,0.32)' }}
            >
              {project.name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-serif text-[30px] leading-none text-[#130D10] truncate">{project.name}</h1>
                <Sparkle className="text-[#FF5738] shrink-0" />
                <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 bg-white border border-[#ECE8D6] text-[#5C564E]">
                  {getProjectStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-[13px] text-[#8A847B] mb-3.5">
                {project.client_name}
                <span className="mx-2 text-[#D8D2C2]">·</span>
                {getProjectTypeLabel(project.type)}
                {project.start_date && (
                  <>
                    <span className="mx-2 text-[#D8D2C2]">·</span>
                    Desde {formatDate(project.start_date)}
                  </>
                )}
              </p>

              {total > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="flex-1 h-2 bg-[#ECE9DA] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#00846F] transition-all" style={{ width: `${cobradoPct}%` }} />
                      <div className="h-full bg-[#F5D242] transition-all" style={{ width: `${pendientePct}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold text-[#130D10] shrink-0">{project.progress}% completado</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#6B655C]">
                      <span className="w-2 h-2 rounded-full bg-[#00846F] inline-block" />
                      {formatCurrency(cobrado, project.currency)} cobrado
                    </span>
                    {pendiente > 0 && (
                      <span className="flex items-center gap-1.5 text-[11px] text-[#6B655C]">
                        <span className="w-2 h-2 rounded-full bg-[#F5D242] inline-block" />
                        {formatCurrency(pendiente, project.currency)} por cobrar
                      </span>
                    )}
                    {nextMilestone && (
                      <span className="flex items-center gap-1.5 text-[11px] text-[#A8A29A]">
                        <IconCalendarTime size={12} stroke={1.6} />
                        Próx: {formatDate(nextMilestone.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            {tabs.map(tab => {
              const isActive = activeTab === tab.href
              const badge = tab.getBadge(id)
              const Icon = tab.icon
              return (
                <Link key={tab.href} href={`/proyectos/${id}/${tab.href}`}>
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-[14px] transition-all relative -mb-px',
                    isActive
                      ? 'bg-white border border-b-white border-[#ECE8D6] text-[#130D10]'
                      : 'text-[#8A847B] hover:text-[#130D10] hover:bg-[#FBFAF3] border border-transparent'
                  )}>
                    <Icon size={15} stroke={1.7} />
                    {tab.label}
                    {badge && (
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center', badgeStyles[badge.color])}>
                        {badge.count}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-7 bg-white border-t border-[#ECE8D6]">
        <div className="max-w-[1080px]">
          {children}
        </div>
      </div>
    </div>
  )
}
