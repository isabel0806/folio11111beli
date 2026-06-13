'use client'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { mockProjects, mockMilestones, mockTasks } from '@/lib/mock-data'
import { getProjectStatusColor, getProjectStatusLabel, getProjectTypeLabel, formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import {
  IconChevronRight, IconFolder, IconLayoutKanban, IconCurrencyDollar,
  IconSettings, IconArrowLeft, IconAlertCircle, IconCalendarTime,
  IconRocket, IconBolt
} from '@tabler/icons-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

const tabs = [
  {
    href: 'archivos',
    label: 'Archivos',
    icon: IconFolder,
    getBadge: (id: string) => null,
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
    href: 'configuracion',
    label: 'Config.',
    icon: IconSettings,
    getBadge: () => null,
  },
]

const badgeStyles = {
  red: 'bg-red-500 text-white',
  yellow: 'bg-[#F5D242] text-[#130D10]',
  blue: 'bg-blue-500 text-white',
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams() as { id: string }
  const pathname = usePathname()
  const project = mockProjects.find(p => p.id === id)

  if (!project) return <div className="p-8 text-[#6B6B6B]">Proyecto no encontrado.</div>

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
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E5E3] sticky top-0 z-20">
        {/* Breadcrumb + status */}
        <div className="px-8 pt-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link href="/proyectos" className="flex items-center gap-1 text-xs text-[#9B9B9B] hover:text-[#130D10] transition-colors">
                <IconArrowLeft size={13} /> Proyectos
              </Link>
              <span className="text-[#E5E5E3]">/</span>
              <span className="text-xs font-medium text-[#130D10]">{project.name}</span>
              {overdueMilestones.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                  <IconAlertCircle size={11} /> {overdueMilestones.length} vencido{overdueMilestones.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              {nextMilestone && (
                <Link href={`/proyectos/${id}/finanzas`}>
                  <Button size="sm" variant="primary">
                    <IconBolt size={13} /> Cobrar {formatCurrency(nextMilestone.amount, project.currency)}
                  </Button>
                </Link>
              )}
              <Link href={`/proyectos/${id}/control`}>
                <Button size="sm" variant="secondary">
                  <IconRocket size={13} /> Nueva tarea
                </Button>
              </Link>
            </div>
          </div>

          {/* Project identity + financial bar */}
          <div className="flex items-start gap-5 mb-5">
            {/* Cover */}
            <div
              className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-2xl font-black"
              style={{ backgroundColor: project.cover_color, color: 'rgba(19,13,16,0.3)' }}
            >
              {project.name[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-[#130D10] truncate">{project.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getProjectStatusColor(project.status)}`}>
                  {getProjectStatusLabel(project.status)}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mb-3">
                {project.client_name}
                <span className="mx-1.5 text-[#D5D5D3]">·</span>
                {getProjectTypeLabel(project.type)}
                {project.start_date && (
                  <>
                    <span className="mx-1.5 text-[#D5D5D3]">·</span>
                    Desde {formatDate(project.start_date)}
                  </>
                )}
              </p>

              {/* Financial progress bar */}
              {total > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-[#F0F0EE] rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-400 transition-all" style={{ width: `${cobradoPct}%` }} />
                      <div className="h-full bg-[#F5D242] transition-all" style={{ width: `${pendientePct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-[#130D10] shrink-0">{project.progress}% completado</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B]">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      {formatCurrency(cobrado, project.currency)} cobrado
                    </span>
                    {pendiente > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[#6B6B6B]">
                        <span className="w-2 h-2 rounded-full bg-[#F5D242] inline-block" />
                        {formatCurrency(pendiente, project.currency)} por cobrar
                      </span>
                    )}
                    {nextMilestone && (
                      <span className="flex items-center gap-1 text-[10px] text-[#9B9B9B]">
                        <IconCalendarTime size={11} stroke={1.5} />
                        Próx: {formatDate(nextMilestone.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.href
              const badge = tab.getBadge(id)
              const Icon = tab.icon
              return (
                <Link key={tab.href} href={`/proyectos/${id}/${tab.href}`}>
                  <div className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border border-b-0 transition-all relative',
                    isActive
                      ? 'bg-[#F9F9F8] border-[#E5E5E3] text-[#130D10]'
                      : 'bg-transparent border-transparent text-[#6B6B6B] hover:text-[#130D10] hover:bg-[#F9F9F8]/50'
                  )}>
                    <Icon size={14} stroke={1.5} />
                    {tab.label}
                    {badge && (
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center', badgeStyles[badge.color])}>
                        {badge.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#F5D242] rounded-full" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 bg-[#F9F9F8]">
        {children}
      </div>
    </div>
  )
}
