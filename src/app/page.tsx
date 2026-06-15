'use client'
import {
  IconAlertTriangle, IconClock, IconCheck, IconChevronRight,
  IconBrandWhatsapp, IconArrowRight, IconBell, IconPlus,
  IconCurrencyDollar, IconHome2, IconBuildingStore, IconBuildingSkyscraper,
} from '@tabler/icons-react'
import { mockProjects, mockMilestones, mockTasks, currentUser } from '@/lib/mock-data'
import {
  formatCurrency, formatDate, getGreeting, getDaysUntil, generateWhatsAppMessage
} from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { useRole } from '@/lib/use-role'

// Editorial accent palette, one per active project (blue · pink · olive · green)
const tints = [
  { soft: '#EAF2FB', solid: '#7FB0E8', text: '#3F6FA3' },
  { soft: '#FDECF3', solid: '#FFABCF', text: '#B14E7C' },
  { soft: '#F6F5E2', solid: '#D5D25D', text: '#7E7B2E' },
  { soft: '#E5F3EF', solid: '#00846F', text: '#00846F' },
]

const typeIcon: Record<string, typeof IconHome2> = {
  arquitectura: IconHome2,
  diseño_grafico: IconBuildingStore,
  event_planning: IconBuildingSkyscraper,
  consultoria: IconBuildingSkyscraper,
  otro: IconBuildingSkyscraper,
}

export default function InicioPage() {
  const { toast } = useToast()
  const { can } = useRole()
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

  const pendingMs = allMilestones.filter(m => m.status === 'pendiente' || m.status === 'vencido')
  const pendingTotal = pendingMs.reduce((a, m) => a + m.amount, 0)

  const firstOverdue = overdue[0]
  const firstSoon = dueSoon[0]
  const attentionCount = (firstOverdue ? 1 : 0) + (firstSoon ? 1 : 0)

  return (
    <div className="px-12 py-10 max-w-[1200px]">
      {/* ───── Topbar ───── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#A8A29A] mb-2">{today}</p>
          <h1 className="font-serif text-[44px] leading-[1.05] text-[#130D10] flex items-center gap-3">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF5738" aria-hidden>
              <path d="M12 2c.3 3.8 2.2 5.7 6 6-3.8.3-5.7 2.2-6 6-.3-3.8-2.2-5.7-6-6 3.8-.3 5.7-2.2 6-6z" />
            </svg>
          </h1>
          <p className="text-[15px] text-[#6B655C] mt-2">
            Hoy tenés{' '}
            <span className="font-semibold text-[#C23A22]">{overdue.length} pago{overdue.length !== 1 ? 's' : ''} vencido{overdue.length !== 1 ? 's' : ''}</span>{' '}
            y <span className="font-semibold text-[#130D10]">{todayTasks.length} tareas pendientes</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button aria-label="Notificaciones" className="w-11 h-11 rounded-full border border-[#ECE8D6] bg-white flex items-center justify-center hover:bg-[#FBFAF3] transition-colors">
            <IconBell size={18} className="text-[#5C564E]" stroke={1.6} />
          </button>
          <Link href="/proyectos" className="flex items-center gap-2 bg-[#130D10] text-white text-sm font-semibold pl-4 pr-5 py-3 rounded-full hover:bg-[#2A2227] transition-colors">
            <IconPlus size={16} stroke={2.2} /> Nuevo proyecto
          </Link>
        </div>
      </div>

      {/* ───── Requiere tu atención ───── */}
      {attentionCount > 0 && (
        <section className="mb-9">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8A847B]">Requiere tu atención</h2>
            <span className="w-5 h-5 rounded-full bg-[#FF5738] text-white text-[11px] font-bold flex items-center justify-center">{attentionCount}</span>
          </div>
          <div className="flex gap-4">
            {firstOverdue && (
              <div className="flex-1 rounded-[18px] bg-[#FF5738] px-4 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 self-start bg-white/20 rounded-full pl-2 pr-2.5 py-0.5 mb-2 w-fit">
                    <IconAlertTriangle size={11} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Pago vencido</span>
                  </div>
                  <p className="text-[15px] font-semibold text-white leading-tight truncate">{firstOverdue.project?.name}</p>
                  <p className="text-[12px] text-white/80 mt-0.5 truncate">{firstOverdue.name} · Venció el {formatDate(firstOverdue.due_date)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-serif text-[26px] leading-none text-white">{formatCurrency(firstOverdue.amount, firstOverdue.project?.currency)}</p>
                  <button
                    onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                      firstOverdue.project?.client_name || '', firstOverdue.name, firstOverdue.due_date,
                      firstOverdue.amount, firstOverdue.project?.currency || 'ARS', currentUser.cbu_alias || ''
                    ))}
                    className="flex items-center gap-1.5 bg-white text-[#130D10] text-[12px] font-semibold pl-3 pr-3.5 py-2 rounded-full hover:bg-white/90 transition-colors"
                  >
                    <IconBrandWhatsapp size={14} className="text-[#00846F]" /> Enviar recordatorio
                  </button>
                </div>
              </div>
            )}
            {firstSoon && (() => {
              const days = getDaysUntil(firstSoon.due_date)
              return (
                <div className="flex-1 rounded-[18px] bg-[#F5D242] px-4 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 self-start bg-[#130D10]/10 rounded-full pl-2 pr-2.5 py-0.5 mb-2 w-fit">
                      <IconClock size={11} className="text-[#7A6410]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6410]">
                        {days === 0 ? 'Vence hoy' : `Vence en ${days} día${days > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-[#130D10] leading-tight truncate">{firstSoon.project?.name}</p>
                    <p className="text-[12px] text-[#7A6410] mt-0.5 truncate">{firstSoon.name} · {formatDate(firstSoon.due_date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-serif text-[26px] leading-none text-[#130D10]">{formatCurrency(firstSoon.amount, firstSoon.project?.currency)}</p>
                    <button
                      onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                        firstSoon.project?.client_name || '', firstSoon.name, firstSoon.due_date,
                        firstSoon.amount, firstSoon.project?.currency || 'ARS', currentUser.cbu_alias || ''
                      ))}
                      className="flex items-center gap-1.5 bg-[#130D10] text-white text-[12px] font-semibold pl-3 pr-3.5 py-2 rounded-full hover:bg-[#2A2227] transition-colors"
                    >
                      <IconBrandWhatsapp size={14} /> Enviar recordatorio
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </section>
      )}

      {/* ───── Grid ───── */}
      <div className="grid grid-cols-[1fr_360px] gap-7">
        {/* Left column */}
        <div className="space-y-8">
          {/* Proyectos activos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[26px] text-[#130D10]">Proyectos activos</h2>
              <Link href="/proyectos" className="text-[13px] text-[#8A847B] hover:text-[#130D10] flex items-center gap-1.5 transition-colors">
                Ver todos <IconArrowRight size={13} />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {activeProjects.map((p, i) => {
                const tint = tints[i % tints.length]
                const Icon = typeIcon[p.type] || IconBuildingSkyscraper
                const ms = mockMilestones[p.id] || []
                const nextMs = ms.find(m => m.status === 'pendiente')
                const overdueMs = ms.some(m => m.status === 'vencido')
                const daysToNext = nextMs ? getDaysUntil(nextMs.due_date) : null
                const segments = 6
                const filled = Math.round(((p.progress ?? 0) / 100) * segments)
                return (
                  <Link key={p.id} href={`/proyectos/${p.id}`}>
                    <div
                      className="flex items-center gap-4 rounded-[18px] px-4 py-4 border border-black/[0.06] shadow-[0_1px_3px_rgba(19,13,16,0.05)] transition-all hover:shadow-[0_3px_10px_rgba(19,13,16,0.08)]"
                      style={{ backgroundColor: tint.soft }}
                    >
                      <div className="w-11 h-11 rounded-[13px] flex items-center justify-center shrink-0" style={{ backgroundColor: tint.solid }}>
                        <Icon size={21} className="text-white" stroke={1.8} />
                      </div>
                      <div className="w-[150px] shrink-0">
                        <p className="text-[15px] font-semibold text-[#130D10] truncate">{p.name}</p>
                        <p className="text-[12px] text-[#8A847B] truncate">{p.client_name}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#6B655C] mb-1.5 truncate">
                          Etapa: <span className="font-medium text-[#130D10]">{nextMs?.name ?? 'En cierre'}</span>
                        </p>
                        <div className="flex gap-1">
                          {Array.from({ length: segments }).map((_, s) => (
                            <span
                              key={s}
                              className="h-1.5 flex-1 rounded-full"
                              style={{ backgroundColor: s < filled ? '#00846F' : 'rgba(19,13,16,0.10)' }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="w-[110px] text-right shrink-0">
                        <span
                          className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={
                            overdueMs
                              ? { backgroundColor: '#FFE3DC', color: '#C23A22' }
                              : daysToNext !== null && daysToNext <= 7
                              ? { backgroundColor: '#FBEFC0', color: '#7A6410' }
                              : { backgroundColor: 'rgba(19,13,16,0.06)', color: '#6B655C' }
                          }
                        >
                          {overdueMs ? 'Vencido' : daysToNext !== null ? `Vence en ${daysToNext}d` : 'En pausa'}
                        </span>
                        <p className="text-[12px] text-[#6B655C] mt-1.5">{formatCurrency(p.total_amount ?? 0, p.currency)}</p>
                      </div>
                      <IconChevronRight size={15} className="text-[#C4BFB4] shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Tareas para hoy */}
          {todayTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-[26px] text-[#130D10]">Tareas para hoy</h2>
                <span className="text-[13px] text-[#8A847B]">{todayTasks.length - checkedTasks.size} pendientes</span>
              </div>
              <div className="bg-white border border-[#ECE8D6] rounded-[18px] divide-y divide-[#F2EFE2]">
                {todayTasks.map(task => {
                  const checked = checkedTasks.has(task.id)
                  return (
                    <div key={task.id} className="flex items-center gap-3.5 px-5 py-4">
                      <button
                        onClick={() => setCheckedTasks(prev => {
                          const n = new Set(prev)
                          if (n.has(task.id)) n.delete(task.id); else n.add(task.id)
                          return n
                        })}
                        className={cn(
                          'w-[22px] h-[22px] rounded-md border-2 shrink-0 flex items-center justify-center transition-all',
                          checked ? 'bg-[#00846F] border-[#00846F]' : 'border-[#D8D3C6] hover:border-[#00846F]'
                        )}
                      >
                        {checked && <IconCheck size={13} className="text-white" stroke={3} />}
                      </button>
                      <div className={cn('flex-1 min-w-0', checked && 'opacity-45')}>
                        <p className={cn('text-[14px] text-[#130D10]', checked && 'line-through')}>{task.title}</p>
                        <p className="text-[12px] text-[#8A847B]">{mockProjects.find(p => p.id === task.project_id)?.name}</p>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                        style={checked
                          ? { backgroundColor: '#E5F3EF', color: '#00846F' }
                          : { backgroundColor: '#FBEFC0', color: '#7A6410' }}
                      >
                        {checked ? 'Hecho' : 'En progreso'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Por cobrar — dark card (solo roles con finanzas) */}
          {can('finanzasGlobal') && (
            <div className="rounded-[22px] bg-[#130D10] px-6 pt-6 pb-6 overflow-hidden relative">
              <div className="absolute -right-8 -top-6 w-28 h-28 rounded-full bg-[#F5D242]/20" />
              <div className="absolute right-10 bottom-6 w-16 h-16 rounded-full bg-[#FF5738]/20" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7FB0E8] mb-2 relative">Por cobrar</p>
              <p className="font-serif text-[42px] leading-none text-white mb-1.5 relative">{formatCurrency(pendingTotal)}</p>
              <p className="text-[13px] text-[#A8A29A] mb-5 relative">en {pendingMs.length} hitos pendientes</p>
              <Link href="/finanzas" className="relative block">
                <button className="w-full flex items-center justify-center gap-2 bg-[#F5D242] text-[#130D10] text-sm font-semibold py-3 rounded-full hover:bg-[#f0ca30] transition-colors">
                  <IconCurrencyDollar size={16} /> Ver finanzas
                </button>
              </Link>
            </div>
          )}

          {/* Próximos eventos */}
          <div className="bg-white border border-[#ECE8D6] rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A847B]">Próximos eventos</p>
              <Link href="/agenda" className="text-[11px] text-[#A8A29A] hover:text-[#130D10]">Ver agenda</Link>
            </div>
            <div className="space-y-3.5">
              {allMilestones
                .filter(m => m.status === 'pendiente')
                .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                .slice(0, 3)
                .map(m => {
                  const days = getDaysUntil(m.due_date)
                  const d = new Date(m.due_date)
                  const urgent = days <= 0
                  const soon = days > 0 && days <= 7
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[11px] flex flex-col items-center justify-center shrink-0"
                        style={{ backgroundColor: urgent ? '#FFE3DC' : soon ? '#FBEFC0' : '#F2EFE2' }}
                      >
                        <span className="text-[8px] font-bold uppercase leading-none" style={{ color: urgent ? '#C23A22' : soon ? '#7A6410' : '#8A847B' }}>
                          {d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()}
                        </span>
                        <span className="font-serif text-[16px] leading-none mt-0.5" style={{ color: urgent ? '#C23A22' : '#130D10' }}>
                          {d.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#130D10] truncate">{m.name}</p>
                        <p className="text-[11px] text-[#8A847B] truncate">{m.project?.name} · {formatCurrency(m.amount, m.project?.currency)}</p>
                      </div>
                    </div>
                  )
                })}
              {allMilestones.filter(m => m.status === 'pendiente').length === 0 && (
                <p className="text-[12px] text-[#A8A29A] py-2">Sin eventos próximos.</p>
              )}
            </div>
          </div>

          {/* Stats 2×2 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Proyectos activos', value: activeProjects.length, bg: '#EAF2FB', text: '#3F6FA3' },
              { label: 'Tareas para hoy', value: todayTasks.length, bg: '#F6F5E2', text: '#7E7B2E' },
              { label: 'Pago vencido', value: overdue.length, bg: '#FF5738', text: '#FFFFFF' },
              { label: 'Por vencer', value: dueSoon.length, bg: '#FFABCF', text: '#7A2E50' },
            ].map(s => (
              <div key={s.label} className="rounded-[18px] p-4" style={{ backgroundColor: s.bg }}>
                <p className="font-serif text-[34px] leading-none" style={{ color: s.text }}>{s.value}</p>
                <p className="text-[12px] mt-2 font-medium" style={{ color: s.text, opacity: s.text === '#FFFFFF' ? 0.9 : 0.85 }}>{s.label}</p>
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
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-xl p-4">
          <p className="text-sm text-[#130D10] whitespace-pre-wrap">{whatsappMsg}</p>
        </div>
      </Modal>
    </div>
  )
}
