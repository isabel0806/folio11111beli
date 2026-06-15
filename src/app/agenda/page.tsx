'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { IconPlus, IconChevronLeft, IconChevronRight, IconCalendar, IconClock, IconBell, IconAlertTriangle } from '@tabler/icons-react'
import { mockCalendarEvents, mockMilestones, mockProjects, mockTeam } from '@/lib/mock-data'
import { formatDate, formatCurrency } from '@/lib/utils'
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
  reunion: 'bg-[#EAF2FB] text-[#3F6FA3] border-[#CFE0F3]',
  entrega: 'bg-[#FDECF3] text-[#B14E7C] border-[#F6D3E2]',
  hito: 'bg-[#FBF3D6] text-[#7A6410] border-[#F0E2A0]',
  custom: 'bg-[#F6F5E2] text-[#7E7B2E] border-[#E6E3BE]',
}

// ── Week / Day timetable shared config ───────────────────────────────
const HOUR_PX = 48
const DAY_START = 8
const HOURS = Array.from({ length: 12 }, (_, i) => i + DAY_START) // 08:00 – 19:00

type SlotColor = 'blue' | 'olive' | 'coral' | 'green' | 'purple' | 'neutral'
const slotColors: Record<SlotColor, { bg: string; border: string; text: string; sub: string }> = {
  blue: { bg: 'bg-[#EAF2FC]', border: 'border-l-[#7FB0E8]', text: 'text-[#3F6FA3]', sub: 'text-[#5C7A9C]' },
  olive: { bg: 'bg-[#F7F6E2]', border: 'border-l-[#D5D25D]', text: 'text-[#7E7B2E]', sub: 'text-[#9A9658]' },
  coral: { bg: 'bg-[#FFEDE9]', border: 'border-l-[#FF5738]', text: 'text-[#C23A22]', sub: 'text-[#C77B6A]' },
  green: { bg: 'bg-[#E4F1EC]', border: 'border-l-[#00846F]', text: 'text-[#00846F]', sub: 'text-[#3E8A7C]' },
  purple: { bg: 'bg-[#F1ECF8]', border: 'border-l-[#9B7FD4]', text: 'text-[#6B4FA0]', sub: 'text-[#9385B8]' },
  neutral: { bg: 'bg-[#F4F1E8]', border: 'border-l-[#C9C5B8]', text: 'text-[#6B655C]', sub: 'text-[#A8A29A]' },
}
const toHours = (t: string) => { const [h, m] = t.split(':').map(Number); return h + m / 60 }
const slotTop = (start: string) => (toHours(start) - DAY_START) * HOUR_PX
const slotHeight = (start: string, end: string) => (toHours(end) - toHours(start)) * HOUR_PX

function TimetableNav({ title, year }: { title: string; year: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <h2 className="font-serif text-[22px] text-[#130D10]">{title}</h2>
        <span className="text-[15px] text-[#A8A29A]">{year}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center rounded-[9px] border border-[#ECE9DA] size-8 text-[#6B655C] hover:bg-[#FBFAF3] transition-colors"><IconChevronLeft size={15} /></button>
        <button className="flex items-center justify-center h-8 rounded-[9px] px-3.5 border border-[#ECE9DA] text-[13px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">Hoy</button>
        <button className="flex items-center justify-center rounded-[9px] border border-[#ECE9DA] size-8 text-[#6B655C] hover:bg-[#FBFAF3] transition-colors"><IconChevronRight size={15} /></button>
      </div>
    </div>
  )
}

function HourGutter() {
  return (
    <div className="w-14 shrink-0 flex flex-col">
      {HOURS.map(h => (
        <div key={h} className="h-12 pr-2.5 shrink-0 text-right text-[#A8A29A] text-[11px]">{String(h).padStart(2, '0')}:00</div>
      ))}
    </div>
  )
}

function HourGridlines() {
  return (
    <div className="absolute inset-0">
      {HOURS.map((h, i) => (
        <div key={h} className="h-px absolute inset-x-0" style={{ top: i * HOUR_PX, backgroundColor: i === 0 ? '#ECE9DA' : '#F2EFE2' }} />
      ))}
      <div className="h-px absolute inset-x-0 bg-[#ECE9DA]" style={{ top: HOURS.length * HOUR_PX }} />
    </div>
  )
}

const weekDays = [
  { dow: 'LUN', d: 8 }, { dow: 'MAR', d: 9 }, { dow: 'MIÉ', d: 10 }, { dow: 'JUE', d: 11 },
  { dow: 'VIE', d: 12 }, { dow: 'SÁB', d: 13, muted: true }, { dow: 'DOM', d: 14, today: true },
]
const weekEvents: { day: number; start: string; end: string; title: string; color: SlotColor; compact?: boolean }[] = [
  { day: 0, start: '10:00', end: '11:00', title: 'Reunión equipo', color: 'olive' },
  { day: 0, start: '15:00', end: '16:30', title: 'Visita obra Núñez', color: 'blue' },
  { day: 1, start: '09:00', end: '10:00', title: 'Entrega docs visado', color: 'olive' },
  { day: 1, start: '12:30', end: '13:10', title: 'Llamada aberturas', color: 'blue', compact: true },
  { day: 2, start: '11:00', end: '12:30', title: 'Relevamiento Belgrano', color: 'blue' },
  { day: 2, start: '17:00', end: '18:00', title: 'Vence factura Hormigonera', color: 'coral' },
  { day: 3, start: '09:00', end: '10:00', title: 'Relevamiento fotográfico', color: 'blue' },
  { day: 3, start: '16:00', end: '17:00', title: 'Reunión Rodríguez', color: 'blue' },
  { day: 4, start: '10:30', end: '12:00', title: 'Dirección de obra', color: 'green' },
  { day: 4, start: '14:00', end: '15:00', title: 'Entrega ejecutivo', color: 'purple' },
  { day: 6, start: '10:00', end: '11:30', title: 'Visita obra Palermo', color: 'blue' },
]

function WeekView() {
  return (
    <div className="bg-white border border-[#ECE9DA] rounded-[18px] p-5.5 flex flex-col gap-4">
      <TimetableNav title="8 – 14 jun" year="2026" />
      {/* Day header */}
      <div className="flex pb-2.5 border-b border-[#ECE9DA]">
        <div className="w-14 shrink-0" />
        {weekDays.map(d => (
          <div key={d.dow} className="grow basis-0 flex flex-col items-center gap-0.75">
            <span className={cn('tracking-[0.04em] font-semibold text-[11px]', d.today ? 'text-[#FF5738]' : d.muted ? 'text-[#B7B1A4]' : 'text-[#8A847B]')}>{d.dow}</span>
            {d.today ? (
              <span className="flex items-center justify-center rounded-full bg-[#FF5738] size-7 font-serif text-[#FFFEF0] text-base">{d.d}</span>
            ) : (
              <span className={cn('font-serif text-lg', d.muted ? 'text-[#9A958B]' : 'text-[#130D10]')}>{d.d}</span>
            )}
          </div>
        ))}
      </div>
      {/* Body */}
      <div className="flex pt-2">
        <HourGutter />
        <div className="grow basis-0 relative" style={{ height: HOURS.length * HOUR_PX }}>
          <HourGridlines />
          <div className="flex absolute inset-0">
            {weekDays.map((d, di) => (
              <div key={d.dow} className={cn('grow basis-0 relative', di > 0 && 'border-l border-[#F2EFE2]', d.muted && 'bg-[#FBFAF1]', d.today && 'bg-[#FFF7F4]')}>
                {weekEvents.filter(e => e.day === di).map((e, idx) => {
                  const c = slotColors[e.color]
                  return (
                    <div key={idx} className={cn('flex flex-col rounded-md py-1.25 px-2 overflow-clip gap-px absolute inset-x-1 border-l-[3px]', c.bg, c.border)}
                      style={{ top: slotTop(e.start), height: slotHeight(e.start, e.end) - 2 }}>
                      <span className={cn('font-bold text-[10px] leading-[1.3]', c.text)}>{e.compact ? `${e.start} · ${e.title}` : e.start}</span>
                      {!e.compact && <span className={cn('font-semibold text-[11px] leading-[1.3]', c.text)}>{e.title}</span>}
                    </div>
                  )
                })}
                {d.today && (
                  <>
                    <div className="h-0.5 absolute inset-x-0 bg-[#FF5738]" style={{ top: slotTop('12:30') }} />
                    <div className="rounded-full absolute bg-[#FF5738] size-2 -left-1" style={{ top: slotTop('12:30') - 4 }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const dayEvents: { start: string; end: string; title: string; subtitle?: string; color: SlotColor; compact?: boolean }[] = [
  { start: '08:30', end: '09:00', title: 'Café con el equipo · repaso del día', color: 'olive', compact: true },
  { start: '09:00', end: '10:30', title: 'Relevamiento fotográfico', subtitle: 'Casa Palermo · Palermo · con Isabel García', color: 'blue' },
  { start: '11:00', end: '12:00', title: 'Reunión con Familia Rodríguez', subtitle: 'Revisión de avances · videollamada', color: 'blue' },
  { start: '13:00', end: '14:00', title: 'Almuerzo', subtitle: 'Bloque personal', color: 'neutral' },
  { start: '15:00', end: '16:30', title: 'Dirección de obra — visita semanal', subtitle: 'Casa Palermo · con Constructora Belmonte', color: 'green' },
  { start: '17:00', end: '17:30', title: 'Llamada proveedor de aberturas', color: 'blue', compact: true },
  { start: '18:00', end: '18:55', title: 'Vence factura — Hormigonera del Sur', subtitle: 'USD 3.200 · pago a proveedor', color: 'coral' },
]
const dayPills = [
  { label: '3 reuniones y visitas', dot: '#7FB0E8', bg: 'bg-[#EAF2FC]', text: 'text-[#3F6FA3]' },
  { label: '1 dirección de obra', dot: '#00846F', bg: 'bg-[#E4F1EC]', text: 'text-[#00846F]' },
  { label: '1 vencimiento', dot: '#FF5738', bg: 'bg-[#FFEDE9]', text: 'text-[#C23A22]' },
]

function DayView() {
  return (
    <div className="bg-white border border-[#ECE9DA] rounded-[18px] p-5.5 flex flex-col gap-4">
      <TimetableNav title="Jueves 11" year="junio 2026" />
      {/* Summary pills */}
      <div className="flex items-center pb-3 gap-2 border-b border-[#ECE9DA]">
        <div className="w-14 shrink-0" />
        <div className="flex items-center flex-wrap gap-2">
          {dayPills.map(p => (
            <div key={p.label} className={cn('flex items-center rounded-full py-1.25 px-3 gap-1.5', p.bg)}>
              <span className="w-1.75 h-1.75 rounded-full shrink-0" style={{ backgroundColor: p.dot }} />
              <span className={cn('font-semibold text-xs', p.text)}>{p.label}</span>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[#A8A29A]">
          <IconClock size={13} stroke={1.8} />
          <span className="text-xs">6 h ocupadas</span>
        </div>
      </div>
      {/* Body */}
      <div className="flex pt-2">
        <HourGutter />
        <div className="grow basis-0 relative" style={{ height: HOURS.length * HOUR_PX }}>
          <HourGridlines />
          <div className="absolute inset-0">
            {dayEvents.map((e, idx) => {
              const c = slotColors[e.color]
              if (e.compact) {
                return (
                  <div key={idx} className={cn('flex items-center rounded-[7px] py-1 px-3 overflow-clip absolute inset-x-1.5 border-l-[3px]', c.bg, c.border)}
                    style={{ top: slotTop(e.start), height: slotHeight(e.start, e.end) - 2 }}>
                    <span className={cn('font-semibold text-[11px]', c.text)}>{e.start} · {e.title}</span>
                  </div>
                )
              }
              return (
                <div key={idx} className={cn('flex items-center rounded-lg py-2 px-3.5 overflow-clip gap-3.5 absolute inset-x-1.5 border-l-[3px]', c.bg, c.border)}
                  style={{ top: slotTop(e.start), height: slotHeight(e.start, e.end) - 2 }}>
                  <div className="flex flex-col w-16 shrink-0">
                    <span className={cn('font-bold text-sm', c.text)}>{e.start}</span>
                    <span className={cn('text-[11px]', c.sub)}>{e.end}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={cn('font-semibold text-[13px] leading-[1.3] truncate', c.text)}>{e.title}</span>
                    {e.subtitle && <span className={cn('text-[11px] leading-[1.3] truncate', c.sub)}>{e.subtitle}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState<'mes' | 'semana' | 'dia'>('mes')
  const [showNew, setShowNew] = useState(false)
  // La agenda es PERSONAL (estilo Google Calendar): solo tus eventos, no se
  // llena con hitos/tareas de proyectos. Los vencimientos van como notificación.
  const [events, setEvents] = useState<CalendarEvent[]>([...mockCalendarEvents])
  const [form, setForm] = useState({ title: '', start: '', end: '', type: 'custom', project_id: '' })

  // Vencimientos de proyectos → notificaciones (no ocupan tiempo en la agenda).
  const deadlines = Object.entries(mockMilestones)
    .flatMap(([pid, ms]) => ms
      .filter(m => m.status === 'pendiente' || m.status === 'vencido')
      .map(m => {
        const project = mockProjects.find(p => p.id === pid)
        const responsable = (mockTeam[pid] || []).find(t => t.tag_label.toLowerCase().includes('responsable'))
        return { id: m.id, name: m.name, due: m.due_date, amount: m.amount, currency: project?.currency, projectName: project?.name || '', overdue: m.status === 'vencido', responsable: responsable?.name }
      }))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 8)

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
            <div className="flex items-center p-1 bg-white border border-[#ECE8D6] rounded-full gap-0.5">
              {(['mes', 'semana', 'dia'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn('px-3.5 py-1.5 text-sm rounded-full transition-colors capitalize',
                    view === v ? 'bg-[#F5D242] text-[#130D10] font-semibold' : 'text-[#8A847B] hover:text-[#130D10]'
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
        <div className="col-span-3">
          {view === 'mes' && (
            <div className="bg-white border border-[#ECE8D6] rounded-[20px] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECE8D6]">
                <button onClick={prev} className="p-1.5 rounded-full hover:bg-[#FBFAF3] text-[#8A847B]"><IconChevronLeft size={16} /></button>
                <h2 className="font-serif text-[18px] text-[#130D10]">{MONTHS[month]} {year}</h2>
                <button onClick={next} className="p-1.5 rounded-full hover:bg-[#FBFAF3] text-[#8A847B]"><IconChevronRight size={16} /></button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-[#ECE8D6]">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A] py-2.5">{d}</div>
                ))}
              </div>
              {/* Days grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border-b border-r border-[#F0EDE0]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = getEventsForDay(day)
                  const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                  return (
                    <div key={day} className={cn('h-24 border-b border-r border-[#F0EDE0] p-1.5', isToday && 'bg-[#FFFCEF]')}>
                      <span className={cn(
                        'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1',
                        isToday ? 'bg-[#FF5738] text-white' : 'text-[#6B655C]'
                      )}>{day}</span>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div key={ev.id} className={cn('text-[9px] px-1.5 py-0.5 rounded-md truncate border', eventColors[ev.type])}>
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-[#A8A29A] px-1">+{dayEvents.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {view === 'semana' && <WeekView />}
          {view === 'dia' && <DayView />}
        </div>

        {/* Sidebar: tu agenda + vencimientos */}
        <div className="flex flex-col gap-5">
          {/* Próximos de TU agenda (eventos personales) */}
          <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8A29A] mb-3">Tu agenda · próximos</h3>
            <div className="space-y-3">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                    ev.type === 'reunion' ? 'bg-[#7FB0E8]' : ev.type === 'entrega' ? 'bg-[#FFABCF]' : 'bg-[#D5D25D]'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#130D10] truncate">{ev.title}</p>
                    <p className="text-[10px] text-[#A8A29A]">
                      {formatDate(ev.start.split('T')[0])}
                      {ev.project_name && ` · ${ev.project_name}`}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-xs text-[#A8A29A]">No tenés eventos próximos. Tu agenda es personal — sumá reuniones o bloques de tiempo.</p>}
            </div>
          </div>

          {/* Vencimientos de proyectos → notificaciones (no ocupan tiempo) */}
          <div className="bg-white border border-[#ECE8D6] rounded-[20px] p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <IconBell size={13} className="text-[#FF5738]" stroke={1.8} />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8A29A]">Vencimientos de proyectos</h3>
            </div>
            <p className="text-[10px] text-[#A8A29A] mb-3">Notificaciones — no ocupan tiempo en tu agenda</p>
            <div className="flex flex-col gap-2">
              {deadlines.map(d => (
                <div key={d.id} className={cn('flex items-start gap-2.5 rounded-[12px] px-3 py-2.5 border', d.overdue ? 'bg-[#FFF6F3] border-[#FAD9D0]' : 'bg-[#FBFAF3] border-[#F2EFE2]')}>
                  <span className={cn('flex items-center justify-center shrink-0 rounded-full size-6 mt-0.5', d.overdue ? 'bg-[#FFE3DC]' : 'bg-[#FBF3D6]')}>
                    {d.overdue ? <IconAlertTriangle size={12} className="text-[#C23A22]" stroke={2} /> : <IconClock size={12} className="text-[#7A6410]" stroke={2} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#130D10] truncate">{d.name}</p>
                      <span className="text-[11px] font-semibold text-[#130D10] shrink-0">{formatCurrency(d.amount, d.currency)}</span>
                    </div>
                    <p className="text-[10px] text-[#8A847B] truncate">{d.projectName}{d.responsable && ` · ${d.responsable}`}</p>
                    <p className={cn('text-[10px] font-medium', d.overdue ? 'text-[#C23A22]' : 'text-[#A8A29A]')}>
                      {d.overdue ? `Venció el ${formatDate(d.due)}` : `Vence ${formatDate(d.due)}`}
                    </p>
                  </div>
                </div>
              ))}
              {deadlines.length === 0 && <p className="text-xs text-[#A8A29A]">Sin vencimientos pendientes.</p>}
            </div>
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
