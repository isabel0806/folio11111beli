'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockTasks, mockPhases, mockProjects } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import {
  IconPlus, IconLayoutKanban, IconList, IconTimeline,
  IconCalendar, IconUser, IconPaperclip, IconEye
} from '@tabler/icons-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Task, TaskStatus } from '@/lib/types'

const statusCols: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Por hacer' },
  { status: 'en_progreso', label: 'En progreso' },
  { status: 'completado', label: 'Completado' },
]

export default function ControlPage() {
  const { id } = useParams() as { id: string }
  const [view, setView] = useState<'kanban' | 'lista' | 'gantt'>('kanban')
  const [clientView, setClientView] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(mockTasks[id] || [])
  const phases = mockPhases[id] || []
  const [showNew, setShowNew] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: '', phase_id: '', status: 'todo' as TaskStatus, due_date: '', description: '' })

  const visibleTasks = clientView ? tasks.filter(t => t.is_client_visible) : tasks

  const getPhase = (phaseId?: string) => phases.find(p => p.id === phaseId)

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
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[18px] p-6">
          <p className="text-[12px] text-[#A8A29A] mb-4">Cronograma por fases</p>
          {phases.length === 0 ? (
            <p className="text-sm text-[#A8A29A]">No hay fases definidas para este proyecto.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {phases.map(phase => {
                if (!phase.start_date || !phase.end_date) return null
                const start = new Date(phase.start_date)
                const end = new Date(phase.end_date)
                const projectStart = new Date(phases[0].start_date!)
                const projectEnd = new Date(phases[phases.length - 1].end_date!)
                const total = projectEnd.getTime() - projectStart.getTime()
                const left = ((start.getTime() - projectStart.getTime()) / total) * 100
                const width = ((end.getTime() - start.getTime()) / total) * 100
                const phaseTasks = visibleTasks.filter(t => t.phase_id === phase.id)
                return (
                  <div key={phase.id}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium text-[#130D10] w-28 shrink-0">{phase.name}</span>
                      <div className="flex-1 h-7 bg-white rounded-[10px] relative overflow-hidden border border-[#ECE8D6]">
                        <div
                          className="absolute top-1 h-5 rounded-[8px] flex items-center px-2"
                          style={{ left: `${left}%`, width: `${width}%`, backgroundColor: phase.color + '40', borderLeft: `3px solid ${phase.color}` }}
                        >
                          <span className="text-[10px] font-semibold truncate" style={{ color: phase.color }}>
                            {formatDate(phase.start_date!)} → {formatDate(phase.end_date!)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#A8A29A] w-16 text-right">{phaseTasks.length} tareas</span>
                    </div>
                  </div>
                )
              })}
            </div>
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
    </div>
  )
}
