'use client'
import {
  IconAlertTriangle, IconClock, IconCheck, IconChevronRight,
  IconCalendar, IconBrandWhatsapp, IconArrowRight, IconBolt,
  IconFolderOpen, IconCurrencyDollar
} from '@tabler/icons-react'
import { mockProjects, mockMilestones, mockTasks, mockCalendarEvents, currentUser } from '@/lib/mock-data'
import {
  formatCurrency, formatDate, getGreeting, getProjectStatusColor,
  getProjectStatusLabel, getMilestoneStatusColor, getDaysUntil, generateWhatsAppMessage
} from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

const typeIcons: Record<string, string> = {
  arquitectura: '🏛', diseño_grafico: '🎨', event_planning: '🎪', consultoria: '💼', otro: '📁',
}

export default function InicioPage() {
  const { toast } = useToast()
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayStr = new Date().toISOString().split('T')[0]

  const allMilestones = Object.entries(mockMilestones).flatMap(([pid, ms]) =>
    ms.map(m => ({ ...m, project: mockProjects.find(p => p.id === pid)! }))
  )
  const overdue = allMilestones.filter(m => m.status === 'vencido')
  const dueSoon = allMilestones.filter(m => {
    if (m.status !== 'pendiente') return false
    const d = getDaysUntil(m.due_date)
    return d >= 0 && d <= 7
  })
  const activeProjects = mockProjects.filter(p => p.status === 'en_curso')
  const allTasks = Object.values(mockTasks).flat()
  const todayTasks = allTasks.filter(t => t.due_date === todayStr && t.status !== 'completado')
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set())
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)

  const pendingTotal = allMilestones
    .filter(m => m.status === 'pendiente' || m.status === 'vencido')
    .reduce((a, m) => a + m.amount, 0)

  const hasAlerts = overdue.length > 0 || dueSoon.length > 0

  return (
    <div className="p-8 max-w-5xl">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-[#9B9B9B] capitalize mb-1">{today}</p>
        <h1 className="text-2xl font-bold text-[#130D10]">
          {getGreeting()}, {currentUser.name.split(' ')[0]}
        </h1>
      </div>

      {/* ALERTS — lo urgente primero */}
      {hasAlerts && (
        <div className="mb-7 space-y-2">
          {overdue.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div className="p-1.5 bg-red-100 rounded-lg shrink-0">
                <IconAlertTriangle size={14} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900">
                  Pago vencido — <span className="font-bold">{m.name}</span>
                </p>
                <p className="text-xs text-red-600">
                  {m.project?.name} · Venció el {formatDate(m.due_date)} · {formatCurrency(m.amount, m.project?.currency)}
                </p>
              </div>
              <button
                onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                  m.project?.client_name || '', m.name, m.due_date,
                  m.amount, m.project?.currency || 'ARS', currentUser.cbu_alias || ''
                ))}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <IconBrandWhatsapp size={13} /> Cobrar
              </button>
            </div>
          ))}
          {dueSoon.map(m => {
            const days = getDaysUntil(m.due_date)
            return (
              <div key={m.id} className="flex items-center gap-3 bg-[#FFFBEB] border border-[#F5D242]/40 rounded-xl px-4 py-3">
                <div className="p-1.5 bg-[#FFF9D6] rounded-lg shrink-0">
                  <IconClock size={14} className="text-[#C9A800]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#130D10]">
                    {days === 0 ? 'Vence hoy' : `Vence en ${days} día${days > 1 ? 's' : ''}`} — <span className="font-bold">{m.name}</span>
                  </p>
                  <p className="text-xs text-[#9B9B9B]">
                    {m.project?.name} · {formatDate(m.due_date)} · {formatCurrency(m.amount, m.project?.currency)}
                  </p>
                </div>
                <button
                  onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                    m.project?.client_name || '', m.name, m.due_date,
                    m.amount, m.project?.currency || 'ARS', currentUser.cbu_alias || ''
                  ))}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#130D10] bg-[#F5D242] hover:bg-[#f0ca30] px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  <IconBolt size={13} /> Recordar
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Projects */}
        <div className="col-span-2 space-y-5">
          {/* Active projects */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#130D10] flex items-center gap-2">
                <IconFolderOpen size={15} className="text-[#9B9B9B]" stroke={1.5} />
                Proyectos activos
              </h2>
              <Link href="/proyectos" className="text-xs text-[#9B9B9B] hover:text-[#130D10] flex items-center gap-1 transition-colors">
                Ver todos <IconArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2">
              {activeProjects.map(p => {
                const ms = mockMilestones[p.id] || []
                const cobrado = ms.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
                const total = p.total_amount || 0
                const cobradoPct = total > 0 ? (cobrado / total) * 100 : 0
                const nextMs = ms.find(m => m.status === 'pendiente')
                const overdueMs = ms.filter(m => m.status === 'vencido').length
                const daysToNext = nextMs ? getDaysUntil(nextMs.due_date) : null

                return (
                  <Link key={p.id} href={`/proyectos/${p.id}`}>
                    <div className="flex items-center gap-4 bg-white border border-[#E5E5E3] rounded-xl px-4 py-3.5 hover:border-[#F5D242]/60 hover:shadow-sm transition-all group">
                      {/* Cover dot */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: p.cover_color, opacity: 0.9 }}
                      >
                        {typeIcons[p.type]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#130D10] truncate">{p.name}</span>
                          {overdueMs > 0 && (
                            <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                              <IconAlertTriangle size={9} /> {overdueMs} vencido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9B9B9B]">{p.client_name}</p>
                      </div>

                      {/* Progress */}
                      <div className="w-32 shrink-0">
                        {total > 0 ? (
                          <>
                            <div className="flex justify-between text-[10px] text-[#9B9B9B] mb-1">
                              <span>{formatCurrency(cobrado, p.currency)}</span>
                              <span>{Math.round(cobradoPct)}%</span>
                            </div>
                            <div className="h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${cobradoPct}%` }} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-[10px] text-[#9B9B9B] mb-1">
                              <span>Avance</span>
                              <span>{p.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                              <div className="h-full bg-[#F5D242] rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Next milestone */}
                      <div className="w-28 text-right shrink-0">
                        {daysToNext !== null && (
                          <div className={cn(
                            'text-[10px] px-2 py-1 rounded-lg',
                            daysToNext < 0 ? 'bg-red-50 text-red-600' :
                            daysToNext <= 7 ? 'bg-[#FFF9D6] text-[#C9A800]' :
                            'text-[#9B9B9B]'
                          )}>
                            {daysToNext < 0 ? `Vencido` :
                             daysToNext === 0 ? 'Vence hoy' :
                             `${daysToNext}d`}
                            <div className="font-medium truncate">{formatCurrency(nextMs!.amount, p.currency)}</div>
                          </div>
                        )}
                      </div>

                      <IconChevronRight size={13} className="text-[#D5D5D3] group-hover:text-[#9B9B9B] shrink-0 transition-colors" />
                    </div>
                  </Link>
                )
              })}
              {activeProjects.length === 0 && (
                <div className="bg-white border border-dashed border-[#E5E5E3] rounded-xl px-4 py-8 text-center">
                  <p className="text-sm text-[#9B9B9B]">No hay proyectos activos</p>
                  <Link href="/proyectos">
                    <Button variant="primary" size="sm" className="mt-3"><IconFolderOpen size={13} /> Crear proyecto</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Tasks today */}
          {todayTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#130D10]">Tareas para hoy</h2>
                <span className="text-xs text-[#9B9B9B]">{todayTasks.length - checkedTasks.size} pendientes</span>
              </div>
              <div className="bg-white border border-[#E5E5E3] rounded-xl divide-y divide-[#F0F0EE]">
                {todayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => setCheckedTasks(prev => {
                        const n = new Set(prev)
                        n.has(task.id) ? n.delete(task.id) : n.add(task.id)
                        return n
                      })}
                      className={cn(
                        'w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all',
                        checkedTasks.has(task.id) ? 'bg-[#F5D242] border-[#F5D242]' : 'border-[#E5E5E3] hover:border-[#F5D242]'
                      )}
                    >
                      {checkedTasks.has(task.id) && <IconCheck size={11} className="text-[#130D10]" />}
                    </button>
                    <div className={cn('flex-1 min-w-0', checkedTasks.has(task.id) && 'opacity-40 line-through')}>
                      <p className="text-sm text-[#130D10]">{task.title}</p>
                      <p className="text-[10px] text-[#9B9B9B]">
                        {mockProjects.find(p => p.id === task.project_id)?.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: summary */}
        <div className="space-y-4">
          {/* Financial snapshot */}
          <div className="bg-white border border-[#E5E5E3] rounded-xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9B9B] mb-3">Por cobrar</p>
            <p className="text-2xl font-bold text-[#130D10] mb-1">{formatCurrency(pendingTotal)}</p>
            <p className="text-xs text-[#9B9B9B] mb-4">en {allMilestones.filter(m => m.status === 'pendiente' || m.status === 'vencido').length} hitos</p>
            <Link href="/finanzas">
              <Button variant="primary" size="sm" className="w-full justify-center">
                <IconCurrencyDollar size={13} /> Ver finanzas
              </Button>
            </Link>
          </div>

          {/* Calendar preview */}
          <div className="bg-white border border-[#E5E5E3] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9B9B]">Próximos eventos</p>
              <Link href="/agenda" className="text-[10px] text-[#9B9B9B] hover:text-[#130D10]">Ver agenda</Link>
            </div>
            <div className="space-y-2.5">
              {allMilestones
                .filter(m => m.status === 'pendiente')
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .slice(0, 4)
                .map(m => {
                  const days = getDaysUntil(m.due_date)
                  return (
                    <div key={m.id} className="flex items-start gap-2.5">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex flex-col items-center justify-center shrink-0',
                        days <= 0 ? 'bg-red-100' : days <= 7 ? 'bg-[#FFF9D6]' : 'bg-[#F0F0EE]'
                      )}>
                        <span className={cn('text-[8px] font-bold leading-none', days <= 0 ? 'text-red-600' : days <= 7 ? 'text-[#C9A800]' : 'text-[#9B9B9B]')}>
                          {new Date(m.due_date).toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className={cn('text-xs font-black leading-none', days <= 0 ? 'text-red-600' : days <= 7 ? 'text-[#C9A800]' : 'text-[#130D10]')}>
                          {new Date(m.due_date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#130D10] truncate">{m.name}</p>
                        <p className="text-[10px] text-[#9B9B9B]">{m.project?.name} · {formatCurrency(m.amount, m.project?.currency)}</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Activos', value: activeProjects.length, icon: '📂' },
              { label: 'Tareas hoy', value: todayTasks.length, icon: '✅' },
              { label: 'Vencidos', value: overdue.length, icon: '⚠️', alert: overdue.length > 0 },
              { label: 'Por vencer', value: dueSoon.length, icon: '⏰', warn: dueSoon.length > 0 },
            ].map(s => (
              <div
                key={s.label}
                className={cn(
                  'bg-white border rounded-xl p-3 text-center',
                  s.alert ? 'border-red-200 bg-red-50' : s.warn ? 'border-[#F5D242]/40 bg-[#FFFBEB]' : 'border-[#E5E5E3]'
                )}
              >
                <p className="text-base mb-0.5">{s.icon}</p>
                <p className={cn('text-lg font-bold', s.alert ? 'text-red-600' : s.warn ? 'text-[#C9A800]' : 'text-[#130D10]')}>
                  {s.value}
                </p>
                <p className="text-[10px] text-[#9B9B9B]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp modal */}
      <Modal
        open={!!whatsappMsg}
        onClose={() => setWhatsappMsg(null)}
        title="Mensaje listo para enviar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWhatsappMsg(null)}>Cerrar</Button>
            <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(whatsappMsg || ''); toast('Mensaje copiado') }}>Copiar</Button>
            <Button variant="primary" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg || '')}`, '_blank'); setWhatsappMsg(null) }}>
              <IconBrandWhatsapp size={14} /> Abrir WhatsApp
            </Button>
          </>
        }
      >
        <div className="bg-[#F9F9F8] border border-[#E5E5E3] rounded-xl p-4">
          <p className="text-sm text-[#130D10] whitespace-pre-wrap">{whatsappMsg}</p>
        </div>
      </Modal>
    </div>
  )
}
