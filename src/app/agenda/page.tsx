'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { IconPlus, IconChevronLeft, IconChevronRight, IconCalendar, IconClock } from '@tabler/icons-react'
import { mockCalendarEvents, mockMilestones, mockTasks, mockProjects } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent, EventType } from '@/lib/types'
import { cn } from '@/lib/cn'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const eventColors: Record<EventType, string> = {
  reunion: 'bg-blue-100 text-blue-800 border-blue-200',
  entrega: 'bg-purple-100 text-purple-800 border-purple-200',
  hito: 'bg-[#FFF9D6] text-[#C9A800] border-[#F5D242]',
  custom: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function AgendaPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState<'mes' | 'semana' | 'dia'>('mes')
  const [showNew, setShowNew] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([
    ...mockCalendarEvents,
    // Inject milestones as calendar events
    ...Object.entries(mockMilestones).flatMap(([pid, ms]) =>
      ms.filter(m => m.status !== 'cobrado').map(m => ({
        id: `ev-m-${m.id}`,
        studio_id: 's1',
        project_id: pid,
        project_name: mockProjects.find(p => p.id === pid)?.name || '',
        title: `💰 ${m.name}`,
        start: m.due_date + 'T09:00',
        end: m.due_date + 'T09:30',
        type: 'hito' as EventType,
      }))
    ),
    // Tasks
    ...Object.entries(mockTasks).flatMap(([pid, ts]) =>
      ts.filter(t => t.due_date && t.status !== 'completado').map(t => ({
        id: `ev-t-${t.id}`,
        studio_id: 's1',
        project_id: pid,
        project_name: mockProjects.find(p => p.id === pid)?.name || '',
        title: `📋 ${t.title}`,
        start: t.due_date! + 'T10:00',
        end: t.due_date! + 'T10:30',
        type: 'entrega' as EventType,
      }))
    ),
  ])
  const [form, setForm] = useState({ title: '', start: '', end: '', type: 'custom', project_id: '' })

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.start.startsWith(dateStr))
  }

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const handleAdd = () => {
    if (!form.title || !form.start) return
    setEvents(prev => [...prev, {
      id: `ev${Date.now()}`, studio_id: 's1', title: form.title,
      start: form.start, end: form.end || form.start,
      type: form.type as EventType, project_id: form.project_id || undefined,
      project_name: mockProjects.find(p => p.id === form.project_id)?.name,
    }])
    setShowNew(false)
    setForm({ title: '', start: '', end: '', type: 'custom', project_id: '' })
  }

  const upcomingEvents = events
    .filter(e => new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 8)

  return (
    <div className="p-8">
      <PageHeader
        title="Agenda"
        actions={
          <>
            <div className="flex items-center p-1 bg-white border border-[#E5E5E3] rounded-lg gap-0.5">
              {(['mes', 'semana', 'dia'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-3 py-1.5 text-sm rounded-md transition-colors capitalize',
                    view === v ? 'bg-[#F5D242] text-[#130D10] font-medium' : 'text-[#6B6B6B] hover:text-[#130D10]'
                  )}>
                  {v === 'dia' ? 'Día' : v === 'mes' ? 'Mes' : 'Semana'}
                </button>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
              <IconPlus size={13} /> Nuevo evento
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-5">
        {/* Calendar */}
        <div className="col-span-3 bg-white border border-[#E5E5E3] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E3]">
            <button onClick={prev} className="p-1.5 rounded-lg hover:bg-[#F9F9F8] text-[#6B6B6B]"><IconChevronLeft size={16} /></button>
            <h2 className="text-sm font-semibold text-[#130D10]">{MONTHS[month]} {year}</h2>
            <button onClick={next} className="p-1.5 rounded-lg hover:bg-[#F9F9F8] text-[#6B6B6B]"><IconChevronRight size={16} /></button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E5E3]">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold uppercase text-[#9B9B9B] py-2.5">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 border-b border-r border-[#F0F0EE]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getEventsForDay(day)
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              return (
                <div key={day} className={cn('h-24 border-b border-r border-[#F0F0EE] p-1.5', isToday && 'bg-[#FFFEF5]')}>
                  <span className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                    isToday ? 'bg-[#F5D242] text-[#130D10]' : 'text-[#6B6B6B]'
                  )}>{day}</span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className={cn('text-[9px] px-1.5 py-0.5 rounded truncate border', eventColors[ev.type])}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-[#9B9B9B] px-1">+{dayEvents.length - 2} más</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming events sidebar */}
        <div className="bg-white border border-[#E5E5E3] rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9B9B9B] mb-3">Próximos eventos</h3>
          <div className="space-y-3">
            {upcomingEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2">
                <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                  ev.type === 'hito' ? 'bg-[#F5D242]' : ev.type === 'reunion' ? 'bg-blue-400' : ev.type === 'entrega' ? 'bg-purple-400' : 'bg-gray-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#130D10] truncate">{ev.title}</p>
                  <p className="text-[10px] text-[#9B9B9B]">
                    {formatDate(ev.start.split('T')[0])}
                    {ev.project_name && ` · ${ev.project_name}`}
                  </p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-xs text-[#9B9B9B]">Sin eventos próximos.</p>}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-[#E5E5E3] space-y-1.5">
            <p className="text-[10px] font-semibold uppercase text-[#9B9B9B] mb-2">Referencias</p>
            {[
              { label: 'Hito de cobro', color: 'bg-[#F5D242]' },
              { label: 'Reunión', color: 'bg-blue-400' },
              { label: 'Entrega', color: 'bg-purple-400' },
              { label: 'Custom', color: 'bg-gray-400' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', l.color)} />
                <span className="text-[10px] text-[#6B6B6B]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo evento"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAdd}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Reunión con cliente" />
          <Select label="Tipo" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'reunion', label: 'Reunión' }, { value: 'entrega', label: 'Entrega' },
              { value: 'hito', label: 'Hito' }, { value: 'custom', label: 'Evento custom' },
            ]}
          />
          <Select label="Proyecto (opcional)" value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
            options={[{ value: '', label: '— Sin proyecto —' }, ...mockProjects.map(p => ({ value: p.id, label: p.name }))]}
          />
          <Input label="Fecha y hora de inicio *" type="datetime-local" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
          <Input label="Fecha y hora de fin" type="datetime-local" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
