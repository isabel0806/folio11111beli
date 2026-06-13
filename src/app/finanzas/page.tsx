'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import {
  IconBrandWhatsapp, IconCheck, IconReceipt, IconAlertTriangle,
  IconTrendingUp, IconTrendingDown, IconClock, IconChevronDown,
  IconAdjustments, IconSearch
} from '@tabler/icons-react'
import { mockMilestones, mockCosts, mockProjects, currentUser } from '@/lib/mock-data'
import {
  formatCurrency, formatDate, getMilestoneStatusColor, getMilestoneStatusLabel,
  generateWhatsAppMessage, getCostCategoryLabel, getDaysUntil
} from '@/lib/utils'
import type { MilestoneStatus } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import Link from 'next/link'

type TabKey = 'cobrar' | 'costos'
type FilterKey = 'todos' | 'pendiente' | 'cobrado' | 'vencido'

export default function FinanzasPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<TabKey>('cobrar')
  const [filter, setFilter] = useState<FilterKey>('todos')
  const [search, setSearch] = useState('')
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)
  const [confirmPaid, setConfirmPaid] = useState<typeof enrichedMilestones[0] | null>(null)

  const enrichedMilestones = Object.entries(mockMilestones).flatMap(([pid, ms]) => {
    const project = mockProjects.find(p => p.id === pid)!
    return ms.map(m => ({ ...m, project }))
  })
  const [milestones, setMilestones] = useState(enrichedMilestones)

  const allCosts = Object.entries(mockCosts).flatMap(([pid, cs]) => {
    const project = mockProjects.find(p => p.id === pid)
    return cs.map(c => ({ ...c, project_name: project?.name || '' }))
  })

  // Summary numbers
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const pendiente = milestones.filter(m => m.status === 'pendiente').reduce((a, m) => a + m.amount, 0)
  const vencido = milestones.filter(m => m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
  const totalCostos = allCosts.reduce((a, c) => a + c.amount, 0)
  const totalIngresos = cobrado
  const neto = totalIngresos - totalCostos

  // Filtered milestones
  const filtered = milestones
    .filter(m => filter === 'todos' || m.status === filter)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.project.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const handleMarkPaid = () => {
    if (!confirmPaid) return
    setMilestones(prev => prev.map(m => m.id === confirmPaid.id ? { ...m, status: 'cobrado' as MilestoneStatus, paid_at: new Date().toISOString() } : m))
    toast(`✓ "${confirmPaid.name}" marcado como cobrado`)
    setConfirmPaid(null)
  }

  const filteredCosts = allCosts.filter(c =>
    !search || c.description.toLowerCase().includes(search.toLowerCase()) ||
    (c.provider_name || '').toLowerCase().includes(search.toLowerCase())
  )

  // Tab counts
  const tabCounts = {
    todos: milestones.length,
    pendiente: milestones.filter(m => m.status === 'pendiente').length,
    cobrado: milestones.filter(m => m.status === 'cobrado').length,
    vencido: milestones.filter(m => m.status === 'vencido').length,
  }

  return (
    <div className="p-8">
      <PageHeader title="Finanzas" description="Resumen financiero de tu estudio" />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          {
            label: 'Cobrado', value: formatCurrency(cobrado), sub: `${milestones.filter(m => m.status === 'cobrado').length} hitos`,
            color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
            icon: <IconCheck size={14} stroke={2} className="text-green-600" />,
          },
          {
            label: 'Por cobrar', value: formatCurrency(pendiente), sub: `${milestones.filter(m => m.status === 'pendiente').length} hitos`,
            color: 'text-[#C9A800]', bg: 'bg-[#FFFBEB]', border: 'border-[#F5D242]/40',
            icon: <IconClock size={14} stroke={1.5} className="text-[#C9A800]" />,
          },
          {
            label: 'Vencido', value: formatCurrency(vencido), sub: `${milestones.filter(m => m.status === 'vencido').length} hitos`,
            color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
            icon: <IconAlertTriangle size={14} stroke={1.5} className="text-red-600" />,
          },
          {
            label: 'Neto (cobrado − costos)', value: formatCurrency(neto), sub: `${formatCurrency(totalCostos)} en costos`,
            color: neto >= 0 ? 'text-[#130D10]' : 'text-red-600', bg: 'bg-white', border: 'border-[#E5E5E3]',
            icon: neto >= 0 ? <IconTrendingUp size={14} stroke={1.5} className="text-[#130D10]" /> : <IconTrendingDown size={14} stroke={1.5} className="text-red-600" />,
          },
        ].map(card => (
          <div key={card.label} className={cn('border rounded-2xl p-4', card.bg, card.border)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9B9B9B]">{card.label}</span>
              <span className="p-1.5 bg-white/60 rounded-lg">{card.icon}</span>
            </div>
            <p className={cn('text-xl font-bold mb-0.5', card.color)}>{card.value}</p>
            <p className="text-[10px] text-[#9B9B9B]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Cash flow bar */}
      {(cobrado + pendiente + vencido) > 0 && (
        <div className="bg-white border border-[#E5E5E3] rounded-2xl p-5 mb-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#130D10]">Flujo de fondos</h3>
            <span className="text-xs text-[#9B9B9B]">Total esperado: {formatCurrency(cobrado + pendiente + vencido)}</span>
          </div>
          <div className="h-4 bg-[#F0F0EE] rounded-full overflow-hidden flex gap-0.5">
            {cobrado > 0 && (
              <div className="h-full bg-green-400 rounded-l-full transition-all" style={{ width: `${(cobrado / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
            {vencido > 0 && (
              <div className="h-full bg-red-400 transition-all" style={{ width: `${(vencido / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
            {pendiente > 0 && (
              <div className="h-full bg-[#F5D242] rounded-r-full transition-all" style={{ width: `${(pendiente / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
          </div>
          <div className="flex gap-5 mt-2">
            {[
              { label: 'Cobrado', color: 'bg-green-400', value: cobrado },
              { label: 'Vencido', color: 'bg-red-400', value: vencido },
              { label: 'Por cobrar', color: 'bg-[#F5D242]', value: pendiente },
            ].filter(l => l.value > 0).map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                <span className={cn('w-2.5 h-2.5 rounded-sm', l.color)} />
                {l.label} · {formatCurrency(l.value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Per-project breakdown */}
      <div className="bg-white border border-[#E5E5E3] rounded-2xl p-5 mb-7">
        <h3 className="text-sm font-semibold text-[#130D10] mb-4">Por proyecto</h3>
        <div className="space-y-3">
          {mockProjects.map(p => {
            const pMs = milestones.filter(m => m.project.id === p.id)
            const pCobrado = pMs.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
            const pPendiente = pMs.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
            const pTotal = pCobrado + pPendiente
            if (pTotal === 0) return null
            return (
              <div key={p.id} className="flex items-center gap-4">
                <Link href={`/proyectos/${p.id}/finanzas`} className="flex items-center gap-2 w-40 shrink-0 hover:text-[#F5D242] transition-colors">
                  <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: p.cover_color }} />
                  <span className="text-sm text-[#130D10] truncate">{p.name}</span>
                </Link>
                <div className="flex-1">
                  <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-400 transition-all" style={{ width: `${pTotal > 0 ? (pCobrado / pTotal) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="text-right w-36 shrink-0">
                  <span className="text-xs text-green-600 font-medium">{formatCurrency(pCobrado, p.currency)}</span>
                  {pPendiente > 0 && <span className="text-xs text-[#9B9B9B]"> / {formatCurrency(pPendiente, p.currency)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-white border border-[#E5E5E3] rounded-xl p-1">
          {([['cobrar', 'Facturas a cobrar'], ['costos', 'Costos y gastos']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                tab === k ? 'bg-[#130D10] text-white' : 'text-[#6B6B6B] hover:text-[#130D10]'
              )}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
          <input
            className="pl-8 pr-3 py-2 text-sm border border-[#E5E5E3] rounded-lg bg-white w-48 focus:outline-none focus:ring-1 focus:ring-[#F5D242]"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {tab === 'cobrar' && (
        <>
          {/* Filter pills */}
          <div className="flex gap-2 mb-4">
            {([
              ['todos', 'Todos'], ['vencido', '🔴 Vencidos'], ['pendiente', '🟡 Pendientes'], ['cobrado', '🟢 Cobrados'],
            ] as const).map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full border transition-colors',
                  filter === k ? 'bg-[#130D10] text-white border-[#130D10]' : 'bg-white text-[#6B6B6B] border-[#E5E5E3] hover:border-[#130D10]'
                )}>
                {label}
                <span className="ml-1.5 opacity-60">{tabCounts[k]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(m => {
              const days = getDaysUntil(m.due_date)
              const isOverdue = m.status === 'vencido'
              const isUrgent = m.status === 'pendiente' && days !== null && days <= 7
              return (
                <div key={m.id} className={cn(
                  'flex items-center gap-4 bg-white border rounded-xl px-4 py-3.5 transition-all',
                  isOverdue ? 'border-red-100 bg-red-50/50' :
                  isUrgent ? 'border-[#F5D242]/40 bg-[#FFFBEB]/50' :
                  'border-[#E5E5E3]'
                )}>
                  {/* Project dot */}
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.project.cover_color }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#130D10]">{m.name}</span>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full', getMilestoneStatusColor(m.status))}>
                        {getMilestoneStatusLabel(m.status)}
                      </span>
                    </div>
                    <p className="text-xs text-[#9B9B9B]">
                      {m.project.name} · {m.project.client_name}
                      <span className="mx-1">·</span>
                      {isOverdue
                        ? <span className="text-red-600">Venció el {formatDate(m.due_date)}</span>
                        : `Vence ${formatDate(m.due_date)}`}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className="text-base font-bold text-[#130D10] shrink-0">
                    {formatCurrency(m.amount, m.project.currency)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {m.status !== 'cobrado' && (
                      <>
                        <button
                          title="Generar mensaje WhatsApp"
                          onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                            m.project.client_name, m.name, m.due_date, m.amount,
                            m.project.currency, currentUser.cbu_alias || ''
                          ))}
                          className="flex items-center gap-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <IconBrandWhatsapp size={13} /> WA
                        </button>
                        <button
                          title="Marcar cobrado"
                          onClick={() => setConfirmPaid(m)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[#130D10] bg-[#F5D242] hover:bg-[#f0ca30] px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <IconCheck size={13} /> Cobrar
                        </button>
                      </>
                    )}
                    {m.status === 'cobrado' && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg">
                        <IconCheck size={13} /> Cobrado
                      </span>
                    )}
                    <button disabled title="ARCA — Próximamente" className="p-1.5 rounded-lg text-[#D5D5D3] cursor-not-allowed">
                      <IconReceipt size={15} stroke={1.5} />
                    </button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center bg-white border border-dashed border-[#E5E5E3] rounded-2xl">
                <p className="text-sm text-[#9B9B9B]">No hay hitos con este estado.</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'costos' && (
        <div className="space-y-2">
          {filteredCosts.map(c => (
            <div key={c.id} className="flex items-center gap-4 bg-white border border-[#E5E5E3] rounded-xl px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#130D10]">{c.description}</p>
                <p className="text-xs text-[#9B9B9B]">
                  {c.project_name}
                  {c.provider_name && <> · {c.provider_name}</>}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0F0EE] text-[#6B6B6B]">
                {getCostCategoryLabel(c.category)}
              </span>
              <span className="text-sm font-bold text-[#130D10]">{formatCurrency(c.amount)}</span>
            </div>
          ))}
          {filteredCosts.length === 0 && (
            <div className="py-12 text-center bg-white border border-dashed border-[#E5E5E3] rounded-2xl">
              <p className="text-sm text-[#9B9B9B]">No hay costos registrados.</p>
            </div>
          )}

          {/* Historial de precios placeholder */}
          <div className="mt-4 bg-white border border-dashed border-[#E5E5E3] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#130D10] mb-0.5">Historial de precios</h3>
                <p className="text-xs text-[#9B9B9B]">¿Cuánto costó algo similar antes? Próximamente podrás buscar en proyectos pasados para benchmarkear tus presupuestos.</p>
              </div>
              <span className="shrink-0 text-xs bg-[#F0F0EE] text-[#9B9B9B] px-2.5 py-1 rounded-full">Próximamente</span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp modal */}
      <Modal open={!!whatsappMsg} onClose={() => setWhatsappMsg(null)} title="Mensaje listo para enviar"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWhatsappMsg(null)}>Cerrar</Button>
            <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(whatsappMsg || ''); toast('Copiado') }}>Copiar</Button>
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

      <Modal open={!!confirmPaid} onClose={() => setConfirmPaid(null)} title="Confirmar cobro"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmPaid(null)}>Cancelar</Button>
            <Button variant="primary" onClick={handleMarkPaid}>Confirmar</Button>
          </>
        }
      >
        {confirmPaid && (
          <div className="space-y-3">
            <p className="text-sm text-[#6B6B6B]">
              Confirmás que recibiste el pago de <strong className="text-[#130D10]">"{confirmPaid.name}"</strong>{' '}
              ({confirmPaid.project.name}) por{' '}
              <strong className="text-[#130D10]">{formatCurrency(confirmPaid.amount, confirmPaid.project.currency)}</strong>?
            </p>
            <p className="text-xs text-[#9B9B9B]">Se registrará la fecha de hoy como fecha de cobro.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
