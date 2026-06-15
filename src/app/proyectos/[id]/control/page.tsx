'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockTasks, mockPhases, mockProjects, mockMilestones } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import {
  IconPlus, IconLayoutKanban, IconList, IconTimeline,
  IconCalendar, IconUser, IconEye
} from '@tabler/icons-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Task, TaskStatus } from '@/lib/types'
import { PlantillasCronogramaModal } from '@/components/proyectos/PlantillasCronogramaModal'
import { useToast } from '@/components/ui/Toast'
import { IconLayoutGrid } from '@tabler/icons-react'

const statusCols: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Por hacer' },
  { status: 'en_progreso', label: 'En progreso' },
  { status: 'completado', label: 'Completado' },
]

export default function ControlPage() {
  const { id } = useParams() as { id: string }
  const [view, setView] = useState<'kanban' | 'lista' | 'gantt'>('kanban')
  const [clientView, setClientView] = useState(false)
  const [cronograma, setCronograma] = useState<'obra' | 'honorarios' | 'permisos'>('obra')
  const [zoom, setZoom] = useState<'dia' | 'semana' | 'mes' | 'trimestre'>('trimestre')
  const [tasks, setTasks] = useState<Task[]>(mockTasks[id] || [])
  const phases = mockPhases[id] || []
  const project = mockProjects.find(p => p.id === id)
  const currency = project?.currency || 'ARS'
  const milestones = mockMilestones[id] || []
  const [showNew, setShowNew] = useState(false)
  const [showPlantillas, setShowPlantillas] = useState(false)
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: '', phase_id: '', status: 'todo' as TaskStatus, due_date: '', description: '' })

  const visibleTasks = clientView ? tasks.filter(t => t.is_client_visible) : tasks

  const getPhase = (phaseId?: string) => phases.find(p => p.id === phaseId)

  // ---- Gantt timeline (quarter grid) ----
  const datedPhases = phases.filter(p => p.start_date && p.end_date)
  const phaseTimes = datedPhases.flatMap(p => [new Date(p.start_date!).getTime(), new Date(p.end_date!).getTime()])
  const rangeStart = phaseTimes.length ? Math.min(...phaseTimes) : Date.now()
  const rangeEnd = phaseTimes.length ? Math.max(...phaseTimes) : Date.now()
  const qStart = (() => { const d = new Date(rangeStart); return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1) })()
  const qEnd = (() => { const d = new Date(rangeEnd); return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0) })()
  const tlStart = qStart.getTime()
  const tlSpan = Math.max(1, qEnd.getTime() - tlStart)
  const quarters: { label: string }[] = []
  for (let c = new Date(qStart); c <= qEnd; c = new Date(c.getFullYear(), c.getMonth() + 3, 1)) {
    quarters.push({ label: `Q${Math.floor(c.getMonth() / 3) + 1}·${String(c.getFullYear()).slice(2)}` })
  }
  const pct = (d: string | number) => ((new Date(d).getTime() - tlStart) / tlSpan) * 100
  const now = new Date()
  const todayPct = ((now.getTime() - tlStart) / tlSpan) * 100
  const todayInRange = todayPct >= 0 && todayPct <= 100
  const todayLabel = `Hoy · ${now.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')} ${now.getFullYear()}`

  const localDate = (d: string) => new Date(d.length <= 10 ? d + 'T12:00:00' : d)
  const moShort = (d: string) => localDate(d).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  const yr2 = (d: string) => String(localDate(d).getFullYear()).slice(2)
  const darkText: Record<string, string> = {
    '#FF5738': '#B8431F', '#7FB0E8': '#3F6FA3', '#D5D25D': '#7E7B2E', '#00846F': '#00846F', '#F5D242': '#8A7220',
  }
  const barText: Record<string, string> = {
    '#FF5738': '#FFFEF0', '#7FB0E8': '#173B5C', '#D5D25D': '#43421A', '#00846F': '#FFFEF0', '#F5D242': '#8A7220',
  }

  interface GanttBar { left: number; width: number; color: string; label: string; textColor: string; dashed?: boolean }
  interface GanttRow { id: string; title: string; subtitle?: string; bar?: GanttBar }
  interface GanttGroup { id: string; name: string; color: string; rangeLabel?: string; rows: GanttRow[] }

  const buildObraGroups = (): GanttGroup[] => datedPhases.map(phase => {
    const phaseTasks = visibleTasks.filter(t => t.phase_id === phase.id)
    const pStart = new Date(phase.start_date!).getTime()
    const pEnd = new Date(phase.end_date!).getTime()
    const seg = (pEnd - pStart) / Math.max(1, phaseTasks.length)
    const isFuture = pStart > now.getTime()
    return {
      id: phase.id,
      name: phase.name,
      color: phase.color,
      rangeLabel: `${moShort(phase.start_date!)}–${moShort(phase.end_date!)} ${yr2(phase.end_date!)}`,
      rows: phaseTasks.map((t, i) => {
        const bStart = pStart + seg * i
        const bEnd = bStart + seg
        const dashed = isFuture || t.status === 'todo' && new Date(bStart) > now
        return {
          id: t.id,
          title: t.title,
          subtitle: t.assigned_name,
          bar: {
            left: ((bStart - tlStart) / tlSpan) * 100,
            width: Math.max(2.5, ((bEnd - bStart) / tlSpan) * 100),
            color: phase.color,
            label: t.title,
            textColor: dashed ? darkText[phase.color] || phase.color : barText[phase.color] || '#FFFEF0',
            dashed,
          },
        }
      }),
    }
  })

  const milestoneColor = (status: string) =>
    status === 'cobrado' ? '#00846F' : status === 'vencido' ? '#FF5738' : status === 'pendiente' ? '#F5D242' : '#C4BFB4'

  const buildHonorariosGroups = (): GanttGroup[] => [{
    id: 'hon', name: 'Honorarios y cobros', color: '#7FB0E8',
    rows: milestones.map(m => {
      const color = milestoneColor(m.status)
      return {
        id: m.id, title: m.name, subtitle: formatDate(m.due_date),
        bar: {
          left: pct(m.due_date) - 1, width: 7, color,
          label: formatCurrency(m.amount, currency),
          textColor: barText[color] || '#FFFEF0',
          dashed: m.status === 'futuro',
        },
      }
    }),
  }]

  const permisosData = [
    { id: 'pm1', title: 'Aviso de obra municipal', subtitle: 'Presentado', from: rangeStart, to: rangeStart + tlSpan * 0.12, color: '#00846F' },
    { id: 'pm2', title: 'Factibilidad de servicios', subtitle: 'En trámite', from: tlStart + tlSpan * 0.18, to: tlStart + tlSpan * 0.34, color: '#F5D242' },
    { id: 'pm3', title: 'Permiso de edificación', subtitle: 'Pendiente', from: tlStart + tlSpan * 0.40, to: tlStart + tlSpan * 0.62, color: '#7FB0E8' },
    { id: 'pm4', title: 'Final de obra', subtitle: 'Futuro', from: tlStart + tlSpan * 0.80, to: tlStart + tlSpan * 0.95, color: '#C4BFB4' },
  ]
  const buildPermisosGroups = (): GanttGroup[] => [{
    id: 'per', name: 'Permisos y trámites', color: '#00846F',
    rows: permisosData.map(p => ({
      id: p.id, title: p.title, subtitle: p.subtitle,
      bar: {
        left: ((p.from - tlStart) / tlSpan) * 100,
        width: ((p.to - p.from) / tlSpan) * 100,
        color: p.color, label: p.title,
        textColor: barText[p.color] || '#43421A',
        dashed: p.color === '#C4BFB4',
      },
    })),
  }]

  const ganttGroups = cronograma === 'obra' ? buildObraGroups()
    : cronograma === 'honorarios' ? buildHonorariosGroups()
    : buildPermisosGroups()

  const cronogramaPills = [
    { k: 'obra' as const, label: 'Cronograma de obra', dot: '#FF5738' },
    { k: 'honorarios' as const, label: 'Honorarios y cobros', dot: '#7FB0E8' },
    { k: 'permisos' as const, label: 'Permisos y trámites', dot: '#00846F' },
  ]
  const legendItems = cronograma === 'obra'
    ? datedPhases.map(p => ({ color: p.color, label: p.name }))
    : cronograma === 'honorarios'
      ? [
        { color: '#00846F', label: 'Cobrado' },
        { color: '#F5D242', label: 'Pendiente' },
        { color: '#FF5738', label: 'Vencido' },
        { color: '#C4BFB4', label: 'Futuro' },
      ]
      : [
        { color: '#00846F', label: 'Presentado' },
        { color: '#F5D242', label: 'En trámite' },
        { color: '#7FB0E8', label: 'Pendiente' },
        { color: '#C4BFB4', label: 'Futuro' },
      ]
  const zoomLevels: { k: typeof zoom; label: string }[] = [
    { k: 'dia', label: 'Día' }, { k: 'semana', label: 'Semana' }, { k: 'mes', label: 'Mes' }, { k: 'trimestre', label: 'Trimestre' },
  ]

  const handleCreate = () => {
    if (!form.title) return
    const newTask: Task = {
      id: `t${Date.now()}`, project_id: id, title: form.title,
      description: form.description, phase_id: form.phase_id || undefined,
      status: form.status, due_date: form.due_date || undefined,
      is_client_visible: false, created_at: new Date().toISOString(),
    }
    setTasks(prev => [...prev, newTask])
    setShowNew(false)
    setForm({ title: '', phase_id: '', status: 'todo', due_date: '', description: '' })
  }

  const moveTask = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-1 bg-white border border-[#ECE8D6] rounded-full gap-0.5">
            {[
              { k: 'kanban', icon: IconLayoutKanban, label: 'Kanban' },
              { k: 'lista', icon: IconList, label: 'Lista' },
              { k: 'gantt', icon: IconTimeline, label: 'Gantt' },
            ].map(({ k, icon: Icon, label }) => (
              <button
                key={k}
                onClick={() => setView(k as typeof view)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-colors',
                  view === k ? 'bg-[#F5D242] text-[#130D10] font-semibold' : 'text-[#8A847B] hover:text-[#130D10]'
                )}
              >
                <Icon size={13} stroke={1.5} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setClientView(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors',
              clientView ? 'bg-[#FBF3D6] border-[#F5D242] text-[#130D10]' : 'bg-white border-[#ECE8D6] text-[#8A847B] hover:text-[#130D10]'
            )}
          >
            <IconEye size={13} stroke={1.5} /> Vista cliente
          </button>
          <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
            <IconPlus size={13} /> Nueva tarea
          </Button>
        </div>
      </div>

      {clientView && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-[#FBF3D6] border border-[#F5D242] rounded-[14px] text-xs text-[#7A6410]">
          <IconEye size={14} stroke={1.6} /> Modo vista cliente — solo se muestran tareas marcadas como visibles para el cliente
        </div>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-3 gap-4">
          {statusCols.map(col => {
            const colTasks = visibleTasks.filter(t => t.status === col.status)
            return (
              <div key={col.status} className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[18px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8A29A]">{col.label}</h3>
                  <span className="text-xs font-semibold bg-[#ECE9DA] text-[#6B655C] px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {colTasks.map(task => {
                    const phase = getPhase(task.phase_id)
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-white border border-[#ECE8D6] rounded-[14px] p-3 cursor-pointer hover:shadow-[0_2px_8px_rgba(19,13,16,0.06)] transition-shadow"
                      >
                        {phase && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block" style={{ backgroundColor: phase.color + '24', color: phase.color }}>
                            {phase.name}
                          </span>
                        )}
                        <p className="text-sm text-[#130D10] font-medium mb-2">{task.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[#A8A29A]">
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <IconCalendar size={10} stroke={1.5} /> {formatDate(task.due_date)}
                            </span>
                          )}
                          {task.assigned_name && (
                            <span className="flex items-center gap-1">
                              <IconUser size={10} stroke={1.5} /> {task.assigned_name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => { setForm(f => ({ ...f, status: col.status })); setShowNew(true) }}
                    className="w-full py-2 text-xs font-medium text-[#A8A29A] hover:text-[#6B655C] border border-dashed border-[#D8D2C2] rounded-[12px] hover:border-[#C4BFB4] transition-colors"
                  >
                    + Agregar tarea
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'lista' && (
        <div className="bg-white border border-[#ECE8D6] rounded-[18px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ECE8D6] bg-[#FBFAF3]">
                <th className="text-left text-[11px] font-semibold text-[#A8A29A] px-4 py-3 uppercase tracking-[0.1em]">Tarea</th>
                <th className="text-left text-[11px] font-semibold text-[#A8A29A] px-4 py-3 uppercase tracking-[0.1em]">Fase</th>
                <th className="text-left text-[11px] font-semibold text-[#A8A29A] px-4 py-3 uppercase tracking-[0.1em]">Asignado</th>
                <th className="text-left text-[11px] font-semibold text-[#A8A29A] px-4 py-3 uppercase tracking-[0.1em]">Vencimiento</th>
                <th className="text-left text-[11px] font-semibold text-[#A8A29A] px-4 py-3 uppercase tracking-[0.1em]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE0]">
              {visibleTasks.map(task => {
                const phase = getPhase(task.phase_id)
                const statusColors: Record<TaskStatus, string> = {
                  todo: 'bg-[#F2EFE2] text-[#6B655C]',
                  en_progreso: 'bg-[#EAF2FB] text-[#3F6FA3]',
                  completado: 'bg-[#E5F3EF] text-[#00846F]',
                }
                const statusLabels: Record<TaskStatus, string> = {
                  todo: 'Por hacer', en_progreso: 'En progreso', completado: 'Completado'
                }
                return (
                  <tr key={task.id} className="hover:bg-[#FBFAF3] cursor-pointer transition-colors" onClick={() => setSelectedTask(task)}>
                    <td className="px-4 py-3 text-sm text-[#130D10] font-medium">{task.title}</td>
                    <td className="px-4 py-3">
                      {phase && (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: phase.color + '24', color: phase.color }}>
                          {phase.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8A847B]">{task.assigned_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#8A847B]">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[task.status]}`}>{statusLabels[task.status]}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'gantt' && (
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[18px] p-5">
          {datedPhases.length === 0 ? (
            <p className="text-sm text-[#A8A29A]">No hay fases con fechas definidas para este proyecto.</p>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-[18px]">
                <div className="flex items-center gap-2">
                  {cronogramaPills.map(p => {
                    const active = cronograma === p.k
                    return (
                      <button
                        key={p.k}
                        onClick={() => setCronograma(p.k)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full py-1.5 px-3.5 border text-[13px] transition-colors',
                          active
                            ? 'bg-[#FFEDE9] border-[#FF5738] font-semibold text-[#C23A22]'
                            : 'border-[#ECE9DA] font-medium text-[#8A847B] hover:text-[#130D10]'
                        )}
                        style={active ? { backgroundColor: p.dot + '1A', borderColor: p.dot, color: darkText[p.dot] } : undefined}
                      >
                        <span className="size-2 rounded-sm" style={{ backgroundColor: p.dot }} />
                        {p.label}
                      </button>
                    )
                  })}
                  <button className="flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-[#C9C5B8] text-[#A8A29A] hover:text-[#130D10] hover:border-[#8A847B] transition-colors">
                    <IconPlus size={13} stroke={1.6} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-0.75 gap-0.5 bg-[#F4F1E3] rounded-full">
                    {zoomLevels.map(z => (
                      <button
                        key={z.k}
                        onClick={() => setZoom(z.k)}
                        className={cn(
                          'py-1.5 px-3.5 rounded-full text-xs transition-colors',
                          zoom === z.k
                            ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-semibold text-[#130D10]'
                            : 'font-medium text-[#8A847B] hover:text-[#130D10]'
                        )}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowPlantillas(true)} className="flex items-center gap-1.5 rounded-full py-2 px-3.5 bg-white border border-[#ECE8D6] hover:border-[#8A847B] text-[#6B655C] text-xs font-semibold transition-colors">
                    <IconLayoutGrid size={13} stroke={1.7} /> Plantillas
                  </button>
                  <button className="flex items-center gap-1.5 rounded-full py-2 px-3.5 bg-[#FF5738] hover:bg-[#C23A22] text-[#FFFEF0] text-xs font-semibold transition-colors">
                    <IconPlus size={13} stroke={2} /> Nueva etapa
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center flex-wrap pt-3.5 pb-4 gap-4 border-t border-[#F2EFE2]">
                {legendItems.map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: l.color }} />
                    <span className="text-[#6B655C] text-xs">{l.label}</span>
                  </div>
                ))}
                {todayInRange && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-0.5 h-3.5 bg-[#FF5738]" />
                    <span className="font-semibold text-[#FF5738] text-xs">{todayLabel}</span>
                  </div>
                )}
              </div>

              {/* Gantt grid */}
              <div className="flex border border-[#ECE9DA] rounded-[12px] overflow-hidden bg-white">
                {/* Left: Etapas */}
                <div className="w-[248px] shrink-0 flex flex-col border-r border-[#ECE9DA]">
                  <div className="h-9.5 flex items-center pl-4 border-b border-[#ECE9DA]">
                    <span className="font-bold text-[#A8A29A] text-[10px] tracking-[0.05em] uppercase">
                      {cronograma === 'obra' ? 'Etapa · Proyecto' : cronograma === 'honorarios' ? 'Hito de cobro' : 'Trámite'}
                    </span>
                  </div>
                  {ganttGroups.map(g => (
                    <div key={g.id}>
                      <div
                        className="h-8 flex items-center justify-between pr-3.5 pl-4"
                        style={{ backgroundColor: g.color + '1A' }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="size-2 rounded-xs shrink-0" style={{ backgroundColor: g.color }} />
                          <span className="font-bold text-[11px] tracking-[0.03em] truncate" style={{ color: darkText[g.color] || g.color }}>
                            {g.name}
                          </span>
                        </div>
                        {g.rangeLabel && (
                          <span className="text-[10px] shrink-0" style={{ color: (darkText[g.color] || g.color) + 'B0' }}>
                            {g.rangeLabel}
                          </span>
                        )}
                      </div>
                      {g.rows.map(r => (
                        <div key={r.id} className="h-10 flex flex-col justify-center pl-4 pr-2 border-b border-[#F6F4EA]">
                          <p className="font-medium text-[#130D10] text-[13px] truncate">{r.title}</p>
                          {r.subtitle && <p className="text-[#A8A29A] text-[11px] truncate">{r.subtitle}</p>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Right: Timeline */}
                <div className="grow flex flex-col relative min-w-0">
                  {/* Gridlines */}
                  {quarters.slice(1).map((_, i) => (
                    <span
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-[#F2EFE2] pointer-events-none"
                      style={{ left: `${((i + 1) / quarters.length) * 100}%` }}
                    />
                  ))}
                  {todayInRange && (
                    <span className="absolute top-0 bottom-0 w-0.5 bg-[#FF5738] pointer-events-none z-10" style={{ left: `${todayPct}%` }} />
                  )}
                  {/* Header */}
                  <div className="h-9.5 flex border-b border-[#ECE9DA]">
                    {quarters.map((q, i) => (
                      <div key={i} className="grow flex items-center justify-center font-semibold text-[#8A847B] text-[10px]">
                        {q.label}
                      </div>
                    ))}
                  </div>
                  {/* Rows */}
                  {ganttGroups.map(g => (
                    <div key={g.id}>
                      <div className="h-8" style={{ backgroundColor: g.color + '0D' }} />
                      {g.rows.map(r => (
                        <div key={r.id} className="h-10 border-b border-[#F6F4EA] relative">
                          {r.bar && (
                            <div
                              className={cn(
                                'absolute top-2.25 h-5.5 rounded-[7px] flex items-center pl-2 pr-2 overflow-hidden',
                                r.bar.dashed && 'border-[1.5px] border-dashed'
                              )}
                              style={{
                                left: `${Math.max(0, r.bar.left)}%`,
                                width: `${Math.min(100 - Math.max(0, r.bar.left), r.bar.width)}%`,
                                backgroundColor: r.bar.dashed ? r.bar.color + '4D' : r.bar.color,
                                borderColor: r.bar.dashed ? r.bar.color : undefined,
                                color: r.bar.textColor,
                              }}
                            >
                              <span className="font-semibold text-[11px] truncate">{r.bar.label}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* New task modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nueva tarea"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreate}>Crear tarea</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Planos estructurales" />
          <Textarea label="Descripción" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalles opcionales..." />
          {phases.length > 0 && (
            <Select
              label="Fase"
              value={form.phase_id}
              onChange={e => setForm(f => ({ ...f, phase_id: e.target.value }))}
              options={[{ value: '', label: '— Sin fase —' }, ...phases.map(p => ({ value: p.id, label: p.name }))]}
            />
          )}
          <Select
            label="Estado"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
            options={[
              { value: 'todo', label: 'Por hacer' },
              { value: 'en_progreso', label: 'En progreso' },
              { value: 'completado', label: 'Completado' },
            ]}
          />
          <Input label="Fecha de vencimiento" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
        </div>
      </Modal>

      {/* Task detail modal */}
      {selectedTask && (
        <Modal
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={selectedTask.title}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Cerrar</Button>
              <Select
                value={selectedTask.status}
                onChange={e => {
                  const status = e.target.value as TaskStatus
                  moveTask(selectedTask.id, status)
                  setSelectedTask(t => t ? { ...t, status } : t)
                }}
                options={[
                  { value: 'todo', label: 'Por hacer' },
                  { value: 'en_progreso', label: 'En progreso' },
                  { value: 'completado', label: 'Completado' },
                ]}
              />
            </>
          }
        >
          <div className="space-y-3">
            {selectedTask.description && <p className="text-sm text-[#6B655C]">{selectedTask.description}</p>}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {selectedTask.due_date && (
                <div>
                  <span className="text-[#A8A29A] block mb-0.5">Vencimiento</span>
                  <span className="text-[#130D10]">{formatDate(selectedTask.due_date)}</span>
                </div>
              )}
              {selectedTask.assigned_name && (
                <div>
                  <span className="text-[#A8A29A] block mb-0.5">Asignado a</span>
                  <span className="text-[#130D10]">{selectedTask.assigned_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${selectedTask.is_client_visible ? 'bg-[#E5F3EF] text-[#00846F]' : 'bg-[#F2EFE2] text-[#6B655C]'}`}>
                {selectedTask.is_client_visible ? <><IconEye size={12} stroke={1.7} /> Visible para cliente</> : 'Solo interno'}
              </span>
            </div>
          </div>
        </Modal>
      )}

      <PlantillasCronogramaModal
        open={showPlantillas}
        onClose={() => setShowPlantillas(false)}
        projectName={project?.name || ''}
        onApply={(name) => toast(`Plantilla "${name}" aplicada al cronograma`)}
      />
    </div>
  )
}
