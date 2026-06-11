'use client'
import { MetricCard } from '@/components/ui/MetricCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  IconCurrencyDollar, IconClock, IconFolderOpen, IconCheckbox,
  IconCalendar, IconCheck, IconChevronRight
} from '@tabler/icons-react'
import { mockProjects, mockMilestones, mockTasks, mockCalendarEvents, currentUser } from '@/lib/mock-data'
import { formatCurrency, formatDate, getGreeting, getProjectStatusColor, getProjectStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

export default function InicioPage() {
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const allMilestones = Object.values(mockMilestones).flat()
  const pendingAmount = allMilestones.filter(m => m.status === 'pendiente').reduce((acc, m) => acc + m.amount, 0)

  const sevenDays = new Date()
  sevenDays.setDate(sevenDays.getDate() + 7)
  const upcomingCount = allMilestones.filter(m => m.status === 'pendiente' && new Date(m.due_date) <= sevenDays).length

  const activeProjects = mockProjects.filter(p => p.status === 'en_curso')
  const allTasks = Object.values(mockTasks).flat()
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTasks = allTasks.filter(t => t.due_date === todayStr && t.status !== 'completado')

  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set())
  const todayEvents = mockCalendarEvents.filter(e => e.start.startsWith(todayStr))

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#130D10]">
          {getGreeting()}, {currentUser.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-[#6B6B6B] mt-1 capitalize">{today}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-7">
        <MetricCard label="Cobros pendientes" value={formatCurrency(pendingAmount)} description="Este mes" color="red" icon={<IconCurrencyDollar size={16} stroke={1.5} />} />
        <MetricCard label="Próximos vencimientos" value={upcomingCount} description="Vencen en 7 días" color="yellow" icon={<IconClock size={16} stroke={1.5} />} />
        <MetricCard label="Proyectos activos" value={activeProjects.length} description="En curso ahora" color="blue" icon={<IconFolderOpen size={16} stroke={1.5} />} />
        <MetricCard label="Tareas para hoy" value={todayTasks.length} description="Con vencimiento hoy" color="green" icon={<IconCheckbox size={16} stroke={1.5} />} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white border border-[#E5E5E3] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#130D10]">Proyectos activos</h2>
            <Link href="/proyectos" className="text-xs text-[#6B6B6B] hover:text-[#130D10] flex items-center gap-1">
              Ver todos <IconChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {activeProjects.map(p => {
              const nextMilestone = (mockMilestones[p.id] || []).find(m => m.status === 'pendiente')
              return (
                <Link key={p.id} href={`/proyectos/${p.id}`}>
                  <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#F9F9F8] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold text-[#130D10]" style={{ backgroundColor: p.cover_color }}>
                      {p.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#130D10] truncate">{p.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ml-2 shrink-0 ${getProjectStatusColor(p.status)}`}>
                          {getProjectStatusLabel(p.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ProgressBar value={p.progress || 0} showLabel className="flex-1" />
                        {nextMilestone && (
                          <span className="text-[10px] text-[#6B6B6B] shrink-0">Próx: {formatDate(nextMilestone.due_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white border border-[#E5E5E3] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#130D10]">Tareas del día</h2>
              <IconCheckbox size={14} className="text-[#9B9B9B]" stroke={1.5} />
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-xs text-[#9B9B9B] py-2">No hay tareas para hoy. 🎉</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-2">
                    <button
                      onClick={() => setCheckedTasks(prev => { const n = new Set(prev); n.has(task.id) ? n.delete(task.id) : n.add(task.id); return n })}
                      className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${checkedTasks.has(task.id) ? 'bg-[#F5D242] border-[#F5D242]' : 'border-[#E5E5E3]'}`}
                    >
                      {checkedTasks.has(task.id) && <IconCheck size={10} className="text-[#130D10]" />}
                    </button>
                    <div className={`flex-1 min-w-0 ${checkedTasks.has(task.id) ? 'opacity-50 line-through' : ''}`}>
                      <p className="text-xs text-[#130D10] truncate">{task.title}</p>
                      <p className="text-[10px] text-[#9B9B9B]">{mockProjects.find(p => p.id === task.project_id)?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#E5E5E3] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#130D10]">Agenda del día</h2>
              <IconCalendar size={14} className="text-[#9B9B9B]" stroke={1.5} />
            </div>
            {todayEvents.length === 0 ? (
              <p className="text-xs text-[#9B9B9B] py-2">Sin eventos para hoy.</p>
            ) : (
              <div className="space-y-2">
                {todayEvents.map(ev => (
                  <div key={ev.id} className="flex items-start gap-2 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F5D242] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-[#130D10]">{ev.title}</p>
                      <p className="text-[10px] text-[#9B9B9B]">
                        {new Date(ev.start).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        {ev.project_name && ` · ${ev.project_name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
