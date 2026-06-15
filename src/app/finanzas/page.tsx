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
import { FacturarArcaModal, type Factura } from '@/components/finanzas/FacturarArcaModal'
import { useRole } from '@/lib/use-role'
import { AccessDenied } from '@/components/layout/AccessDenied'

type TabKey = 'cobrar' | 'costos'
type FilterKey = 'todos' | 'pendiente' | 'cobrado' | 'vencido'

export default function FinanzasPage() {
  const { toast } = useToast()
  const { can } = useRole()
  const [tab, setTab] = useState<TabKey>('cobrar')
  const [filter, setFilter] = useState<FilterKey>('todos')
  const [search, setSearch] = useState('')
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)
  const [confirmPaid, setConfirmPaid] = useState<typeof enrichedMilestones[0] | null>(null)
  const [selectedMonthKey, setSelectedMonthKey] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  )
  const [facturas, setFacturas] = useState<Record<string, Factura>>({})
  const [facturando, setFacturando] = useState<typeof enrichedMilestones[0] | null>(null)
  const [priceSearch, setPriceSearch] = useState('')

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

  // Monthly history — last 8 months + next 2
  const monthlyData = (() => {
    const months: { key: string; label: string; cobrado: number; pendiente: number; costos: number; neto: number; isFuture: boolean }[] = []
    const now = new Date()
    for (let i = -7; i <= 2; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
      const isFuture = i > 0

      const mCobrado = milestones
        .filter(m => m.status === 'cobrado' && (m.paid_at || m.due_date).startsWith(key))
        .reduce((a, m) => a + m.amount, 0)

      const mPendiente = milestones
        .filter(m => (m.status === 'pendiente' || m.status === 'futuro') && m.due_date.startsWith(key))
        .reduce((a, m) => a + m.amount, 0)

      const mCostos = allCosts
        .filter(c => c.created_at.startsWith(key))
        .reduce((a, c) => a + c.amount, 0)

      months.push({ key, label, cobrado: mCobrado, pendiente: mPendiente, costos: mCostos, neto: mCobrado - mCostos, isFuture })
    }
    return months
  })()

  const maxMonthly = Math.max(...monthlyData.map(m => m.cobrado + m.pendiente + m.costos), 1)
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  // Monthly insights
  const pastMonths = monthlyData.filter(m => !m.isFuture)
  const realized = pastMonths.filter(m => m.cobrado > 0)
  const avgCobrado = realized.length ? Math.round(realized.reduce((a, m) => a + m.cobrado, 0) / realized.length) : 0
  const bestMonth = pastMonths.reduce((best, m) => (m.cobrado > best.cobrado ? m : best), pastMonths[0])
  const selIdx = monthlyData.findIndex(m => m.key === selectedMonthKey)
  const selMonth = monthlyData[selIdx] ?? monthlyData[monthlyData.length - 3]
  const prevMonth = selIdx > 0 ? monthlyData[selIdx - 1] : null
  // Per-selection delta — only meaningful for a closed (past, non-current) month
  const selClosed = !selMonth.isFuture && selMonth.key !== currentMonthKey
  const momDelta = prevMonth ? selMonth.cobrado - prevMonth.cobrado : 0
  const momPct = selClosed && prevMonth && prevMonth.cobrado > 0 ? Math.round((momDelta / prevMonth.cobrado) * 100) : null

  // Headline trend — last fully closed month vs the one before (stable, not tied to selection)
  const closedMonths = monthlyData.filter(m => !m.isFuture && m.key !== currentMonthKey)
  const lastClosed = closedMonths[closedMonths.length - 1]
  const prevClosed = closedMonths[closedMonths.length - 2]
  const trendDelta = lastClosed && prevClosed ? lastClosed.cobrado - prevClosed.cobrado : 0
  const trendPct = lastClosed && prevClosed && prevClosed.cobrado > 0 ? Math.round((trendDelta / prevClosed.cobrado) * 100) : null

  const fmtCompact = (n: number) =>
    n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.', ',') + 'M'
      : n >= 1_000 ? '$' + Math.round(n / 1000) + 'k'
        : '$' + n

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

  // Price history — benchmark a concept against costs across all projects
  const priceMatches = priceSearch.trim()
    ? allCosts
        .filter(c => c.description.toLowerCase().includes(priceSearch.trim().toLowerCase()))
        .sort((a, b) => a.amount - b.amount)
    : []
  const priceStats = priceMatches.length
    ? {
        avg: Math.round(priceMatches.reduce((a, c) => a + c.amount, 0) / priceMatches.length),
        min: priceMatches[0].amount,
        max: priceMatches[priceMatches.length - 1].amount,
      }
    : null

  // Tab counts
  const tabCounts = {
    todos: milestones.length,
    pendiente: milestones.filter(m => m.status === 'pendiente').length,
    cobrado: milestones.filter(m => m.status === 'cobrado').length,
    vencido: milestones.filter(m => m.status === 'vencido').length,
  }

  if (!can('finanzasGlobal')) return <AccessDenied area="las finanzas del estudio" />

  return (
    <div className="p-8">
      <PageHeader title="Finanzas" description="Resumen financiero de tu estudio" />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          {
            label: 'Cobrado', value: formatCurrency(cobrado), sub: `${milestones.filter(m => m.status === 'cobrado').length} hitos`,
            color: 'text-[#00846F]', bg: 'bg-[#FBFAF3]', border: 'border-[#ECE8D6]',
            icon: <IconCheck size={14} stroke={2} className="text-[#00846F]" />,
          },
          {
            label: 'Por cobrar', value: formatCurrency(pendiente), sub: `${milestones.filter(m => m.status === 'pendiente').length} hitos`,
            color: 'text-[#7A6410]', bg: 'bg-[#FBFAF3]', border: 'border-[#ECE8D6]',
            icon: <IconClock size={14} stroke={1.5} className="text-[#7A6410]" />,
          },
          {
            label: 'Vencido', value: formatCurrency(vencido), sub: `${milestones.filter(m => m.status === 'vencido').length} hitos`,
            color: 'text-[#C23A22]', bg: 'bg-[#FBFAF3]', border: 'border-[#ECE8D6]',
            icon: <IconAlertTriangle size={14} stroke={1.5} className="text-[#C23A22]" />,
          },
          {
            label: 'Neto (cobrado − costos)', value: formatCurrency(neto), sub: `${formatCurrency(totalCostos)} en costos`,
            color: neto >= 0 ? 'text-[#130D10]' : 'text-[#C23A22]', bg: 'bg-[#FBFAF3]', border: 'border-[#ECE8D6]',
            icon: neto >= 0 ? <IconTrendingUp size={14} stroke={1.5} className="text-[#130D10]" /> : <IconTrendingDown size={14} stroke={1.5} className="text-[#C23A22]" />,
          },
        ].map(card => (
          <div key={card.label} className={cn('border rounded-[18px] p-5', card.bg, card.border)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A8A29A]">{card.label}</span>
              <span className="p-1.5 bg-white rounded-full border border-[#ECE8D6]">{card.icon}</span>
            </div>
            <p className={cn('font-serif text-[27px] leading-none mb-1', card.color)}>{card.value}</p>
            <p className="text-[10px] text-[#A8A29A]">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Cash flow bar */}
      {(cobrado + pendiente + vencido) > 0 && (
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6 mb-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-[19px] text-[#130D10]">Flujo de fondos</h3>
            <span className="text-xs text-[#A8A29A]">Total esperado: {formatCurrency(cobrado + pendiente + vencido)}</span>
          </div>
          <div className="h-4 bg-[#ECE9DA] rounded-full overflow-hidden flex gap-0.5">
            {cobrado > 0 && (
              <div className="h-full bg-[#00846F] rounded-l-full transition-all" style={{ width: `${(cobrado / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
            {vencido > 0 && (
              <div className="h-full bg-[#FF5738] transition-all" style={{ width: `${(vencido / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
            {pendiente > 0 && (
              <div className="h-full bg-[#F5D242] rounded-r-full transition-all" style={{ width: `${(pendiente / (cobrado + pendiente + vencido)) * 100}%` }} />
            )}
          </div>
          <div className="flex gap-5 mt-2">
            {[
              { label: 'Cobrado', color: 'bg-[#00846F]', value: cobrado },
              { label: 'Vencido', color: 'bg-[#FF5738]', value: vencido },
              { label: 'Por cobrar', color: 'bg-[#F5D242]', value: pendiente },
            ].filter(l => l.value > 0).map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B655C]">
                <span className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                {l.label} · {formatCurrency(l.value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Per-project breakdown */}
      <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6 mb-7">
        <h3 className="font-serif text-[19px] text-[#130D10] mb-4">Por proyecto</h3>
        <div className="space-y-3">
          {mockProjects.map(p => {
            const pMs = milestones.filter(m => m.project.id === p.id)
            const pCobrado = pMs.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
            const pPendiente = pMs.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
            const pTotal = pCobrado + pPendiente
            if (pTotal === 0) return null
            return (
              <div key={p.id} className="flex items-center gap-4">
                <Link href={`/proyectos/${p.id}/finanzas`} className="flex items-center gap-2 w-40 shrink-0 hover:text-[#FF5738] transition-colors">
                  <div className="w-5 h-5 rounded-md shrink-0" style={{ backgroundColor: p.cover_color }} />
                  <span className="text-sm text-[#130D10] truncate">{p.name}</span>
                </Link>
                <div className="flex-1">
                  <div className="h-2 bg-[#ECE9DA] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#00846F] transition-all" style={{ width: `${pTotal > 0 ? (pCobrado / pTotal) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="text-right w-36 shrink-0">
                  <span className="text-xs text-[#00846F] font-medium">{formatCurrency(pCobrado, p.currency)}</span>
                  {pPendiente > 0 && <span className="text-xs text-[#A8A29A]"> / {formatCurrency(pPendiente, p.currency)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly history */}
      <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6 mb-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-serif text-[19px] text-[#130D10]">Historial mensual</h3>
            <p className="text-xs text-[#A8A29A] mt-0.5">Últimos 8 meses + próximos 2 · tocá un mes para ver el detalle</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#6B655C]"><span className="w-2.5 h-2.5 rounded-full bg-[#00846F] inline-block" />Cobrado</span>
            <span className="flex items-center gap-1.5 text-xs text-[#6B655C]"><span className="w-2.5 h-2.5 rounded-full bg-[#F5D242] inline-block" />Por cobrar</span>
            <span className="flex items-center gap-1.5 text-xs text-[#6B655C]"><span className="w-2.5 h-2.5 rounded-full bg-[#FFABCF] inline-block" />Costos</span>
          </div>
        </div>

        {/* Insight strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Promedio cobrado / mes</p>
            <p className="font-serif text-[20px] text-[#130D10] mt-0.5">{formatCurrency(avgCobrado)}</p>
          </div>
          <div className="bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Mejor mes</p>
            <p className="font-serif text-[20px] text-[#130D10] mt-0.5 capitalize">
              {bestMonth && bestMonth.cobrado > 0 ? <>{bestMonth.label} <span className="text-[13px] text-[#00846F]">· {formatCurrency(bestMonth.cobrado)}</span></> : '—'}
            </p>
          </div>
          <div className="bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">
              Variación último mes{lastClosed && prevClosed ? <span className="capitalize normal-case"> · {lastClosed.label} vs {prevClosed.label}</span> : ''}
            </p>
            <p className={cn('font-serif text-[20px] mt-0.5 flex items-center gap-1.5', trendDelta > 0 ? 'text-[#00846F]' : trendDelta < 0 ? 'text-[#C23A22]' : 'text-[#130D10]')}>
              {!lastClosed || !prevClosed ? '—' : (
                <>
                  {trendDelta > 0 ? <IconTrendingUp size={17} stroke={2} /> : trendDelta < 0 ? <IconTrendingDown size={17} stroke={2} /> : null}
                  {trendDelta >= 0 ? '+' : '−'}{formatCurrency(Math.abs(trendDelta))}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Chart: y-axis + plot */}
        <div className="flex gap-3">
          <div className="flex flex-col justify-between h-48 py-1 text-right text-[9px] text-[#A8A29A] w-11 shrink-0">
            {[1, 0.75, 0.5, 0.25, 0].map(f => <span key={f}>{fmtCompact(Math.round(maxMonthly * f))}</span>)}
          </div>
          <div className="flex-1">
            <div className="relative h-48">
              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map(f => (
                <div key={f} className="absolute inset-x-0 h-px bg-[#ECE9DA]" style={{ top: `${f * 100}%` }} />
              ))}
              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-2">
                {monthlyData.map(m => {
                  const isCurrentMonth = m.key === currentMonthKey
                  const isSelected = m.key === selectedMonthKey
                  const cobradoH = (m.cobrado / maxMonthly) * 100
                  const pendienteH = (m.pendiente / maxMonthly) * 100
                  const costosH = (m.costos / maxMonthly) * 100
                  const totalH = cobradoH + pendienteH
                  const hasData = m.cobrado > 0 || m.pendiente > 0 || m.costos > 0
                  return (
                    <button
                      key={m.key}
                      onClick={() => setSelectedMonthKey(m.key)}
                      className={cn(
                        'flex-1 h-full flex items-end gap-0.5 rounded-t-md transition-colors',
                        isSelected ? 'bg-[#F2EFE2]' : 'hover:bg-[#F4F1E3]'
                      )}
                      aria-label={`Ver ${m.label}`}
                    >
                      {/* Income bar (cobrado + pendiente stacked) */}
                      <div className="flex-1 flex flex-col justify-end h-full">
                        <div
                          className={cn('w-full rounded-t-md overflow-hidden transition-all duration-500', m.isFuture && 'opacity-45')}
                          style={{ height: `${Math.max(totalH, hasData ? 2 : 0)}%` }}
                        >
                          {m.pendiente > 0 && <div className="w-full bg-[#F5D242]" style={{ height: `${totalH > 0 ? (pendienteH / totalH) * 100 : 0}%` }} />}
                          {m.cobrado > 0 && <div className="w-full bg-[#00846F]" style={{ height: `${totalH > 0 ? (cobradoH / totalH) * 100 : 0}%` }} />}
                        </div>
                      </div>
                      {/* Costos bar */}
                      {m.costos > 0 && (
                        <div className="w-1.5 rounded-t-sm bg-[#FFABCF] transition-all duration-500 self-end" style={{ height: `${Math.max(costosH, 2)}%` }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Month labels */}
            <div className="flex gap-2 mt-2">
              {monthlyData.map(m => {
                const isCurrentMonth = m.key === currentMonthKey
                const isSelected = m.key === selectedMonthKey
                return (
                  <button key={m.key} onClick={() => setSelectedMonthKey(m.key)} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className={cn('text-[10px] capitalize transition-colors', isSelected ? 'font-bold text-[#130D10]' : isCurrentMonth ? 'font-semibold text-[#6B655C]' : 'text-[#A8A29A]')}>
                      {m.label}
                    </span>
                    {isCurrentMonth && <span className="w-1 h-1 rounded-full bg-[#FF5738]" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected month detail */}
        {selMonth && (
          <div className="mt-6 pt-5 border-t border-[#ECE9DA]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif text-[16px] text-[#130D10] capitalize">
                {selMonth.label}
                {selMonth.key === currentMonthKey && <span className="ml-2 text-[11px] font-sans font-semibold text-[#FF5738]">· este mes</span>}
                {selMonth.isFuture && <span className="ml-2 text-[11px] font-sans font-semibold text-[#A8A29A]">· proyectado</span>}
              </h4>
              {selClosed && prevMonth ? (
                <span className={cn('flex items-center gap-1 text-xs font-semibold', momDelta > 0 ? 'text-[#00846F]' : momDelta < 0 ? 'text-[#C23A22]' : 'text-[#A8A29A]')}>
                  {momDelta > 0 ? <IconTrendingUp size={13} /> : momDelta < 0 ? <IconTrendingDown size={13} /> : null}
                  {momDelta >= 0 ? '+' : ''}{formatCurrency(momDelta)} vs mes anterior
                </span>
              ) : (
                <span className="text-xs font-medium text-[#A8A29A]">{selMonth.isFuture ? 'Proyectado' : 'Mes en curso'}</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Cobrado', value: selMonth.cobrado, color: 'text-[#00846F]', dot: 'bg-[#00846F]' },
                { label: 'Por cobrar', value: selMonth.pendiente, color: 'text-[#7A6410]', dot: 'bg-[#F5D242]' },
                { label: 'Costos', value: selMonth.costos, color: 'text-[#B14E7C]', dot: 'bg-[#FFABCF]' },
                { label: 'Neto', value: selMonth.neto, color: selMonth.neto >= 0 ? 'text-[#130D10]' : 'text-[#C23A22]', dot: 'bg-[#130D10]' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-[#ECE8D6] rounded-[12px] px-3.5 py-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">
                    <span className={cn('w-2 h-2 rounded-full', s.dot)} />{s.label}
                  </span>
                  <p className={cn('font-serif text-[18px] mt-1', s.color)}>{formatCurrency(s.value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-0.5 bg-white border border-[#ECE8D6] rounded-full p-1">
          {([['cobrar', 'Facturas a cobrar'], ['costos', 'Costos y gastos']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn('px-4 py-1.5 text-sm rounded-full transition-colors',
                tab === k ? 'bg-[#130D10] text-white font-semibold' : 'text-[#8A847B] hover:text-[#130D10] font-medium'
              )}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
          <input
            className="pl-8 pr-3 py-2 text-sm border border-[#ECE8D6] rounded-full bg-white w-48 focus:outline-none focus:ring-1 focus:ring-[#F5D242]"
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
              ['todos', 'Todos', ''], ['vencido', 'Vencidos', 'bg-[#FF5738]'], ['pendiente', 'Pendientes', 'bg-[#F5D242]'], ['cobrado', 'Cobrados', 'bg-[#00846F]'],
            ] as const).map(([k, label, dot]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors',
                  filter === k ? 'bg-[#130D10] text-white border-[#130D10]' : 'bg-white text-[#6B655C] border-[#ECE8D6] hover:border-[#130D10]'
                )}>
                {dot && <span className={cn('w-2 h-2 rounded-full', dot)} />}
                {label}
                <span className="ml-0.5 opacity-60">{tabCounts[k]}</span>
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
                  'flex items-center gap-4 bg-white border rounded-[14px] px-4 py-3.5 transition-all',
                  isOverdue ? 'border-[#FAD9D0] bg-[#FFF6F3]' :
                  isUrgent ? 'border-[#F0E2A0] bg-[#FFFCEF]' :
                  'border-[#ECE8D6]'
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
                    <p className="text-xs text-[#A8A29A]">
                      {m.project.name} · {m.project.client_name}
                      <span className="mx-1">·</span>
                      {isOverdue
                        ? <span className="text-[#C23A22]">Venció el {formatDate(m.due_date)}</span>
                        : `Vence ${formatDate(m.due_date)}`}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className="font-serif text-[18px] text-[#130D10] shrink-0">
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
                          className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#00846F] hover:bg-[#006e5c] px-2.5 py-1.5 rounded-full transition-colors"
                        >
                          <IconBrandWhatsapp size={13} /> WA
                        </button>
                        <button
                          title="Marcar cobrado"
                          onClick={() => setConfirmPaid(m)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[#130D10] bg-[#F5D242] hover:bg-[#f0ca30] px-2.5 py-1.5 rounded-full transition-colors"
                        >
                          <IconCheck size={13} /> Cobrar
                        </button>
                      </>
                    )}
                    {m.status === 'cobrado' && (
                      <span className="flex items-center gap-1 text-xs text-[#00846F] bg-[#E5F3EF] px-2.5 py-1.5 rounded-full">
                        <IconCheck size={13} /> Cobrado
                      </span>
                    )}
                    {facturas[m.id] ? (
                      <span title={`CAE ${facturas[m.id].cae}`} className="flex items-center gap-1 text-xs font-medium text-[#3F6FA3] bg-[#EAF2FC] px-2.5 py-1.5 rounded-full">
                        <IconReceipt size={13} stroke={1.7} /> {facturas[m.id].tipo} {facturas[m.id].numero}
                      </span>
                    ) : (
                      <button
                        title="Facturar con ARCA"
                        onClick={() => setFacturando(m)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#3F6FA3] bg-white border border-[#CFE0F3] hover:bg-[#EAF2FC] px-2.5 py-1.5 rounded-full transition-colors"
                      >
                        <IconReceipt size={13} stroke={1.7} /> Facturar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center bg-[#FBFAF3] border border-dashed border-[#ECE8D6] rounded-[20px]">
                <p className="text-sm text-[#A8A29A]">No hay hitos con este estado.</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'costos' && (
        <div className="space-y-2">
          {filteredCosts.map(c => (
            <div key={c.id} className="flex items-center gap-4 bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#130D10]">{c.description}</p>
                <p className="text-xs text-[#A8A29A]">
                  {c.project_name}
                  {c.provider_name && <> · {c.provider_name}</>}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F2EFE2] text-[#6B655C]">
                {getCostCategoryLabel(c.category)}
              </span>
              <span className="font-serif text-[16px] text-[#130D10]">{formatCurrency(c.amount)}</span>
            </div>
          ))}
          {filteredCosts.length === 0 && (
            <div className="py-12 text-center bg-[#FBFAF3] border border-dashed border-[#ECE8D6] rounded-[20px]">
              <p className="text-sm text-[#A8A29A]">No hay costos registrados.</p>
            </div>
          )}

          {/* Historial de precios */}
          <div className="mt-4 bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-[19px] text-[#130D10] mb-0.5">Historial de precios</h3>
                <p className="text-xs text-[#A8A29A]">¿Cuánto costó algo similar antes? Buscá en los costos de todos tus proyectos para benchmarkear el próximo presupuesto.</p>
              </div>
              <div className="relative shrink-0">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
                <input
                  className="pl-9 pr-3 py-2 text-sm border border-[#ECE8D6] rounded-full bg-white w-56 focus:outline-none focus:ring-1 focus:ring-[#F5D242]"
                  placeholder="Ej: contrapiso, pintura…"
                  value={priceSearch}
                  onChange={e => setPriceSearch(e.target.value)}
                />
              </div>
            </div>

            {!priceSearch.trim() ? (
              <p className="text-[13px] text-[#A8A29A] py-2">Escribí un concepto para ver qué pagaste en proyectos anteriores.</p>
            ) : priceMatches.length === 0 ? (
              <p className="text-[13px] text-[#A8A29A] py-2">Sin coincidencias para "{priceSearch}".</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Mínimo', value: priceStats!.min, color: 'text-[#00846F]' },
                    { label: 'Promedio', value: priceStats!.avg, color: 'text-[#130D10]' },
                    { label: 'Máximo', value: priceStats!.max, color: 'text-[#C23A22]' },
                  ].map(s => (
                    <div key={s.label} className="bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">{s.label}</p>
                      <p className={cn('font-serif text-[19px] mt-0.5', s.color)}>{formatCurrency(s.value)}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A] mb-2">{priceMatches.length} coincidencia{priceMatches.length === 1 ? '' : 's'}</p>
                <div className="flex flex-col gap-1.5">
                  {priceMatches.map(c => (
                    <div key={c.id} className="flex items-center gap-4 bg-white border border-[#ECE8D6] rounded-[12px] px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#130D10] truncate">{c.description}</p>
                        <p className="text-[11px] text-[#A8A29A]">{c.project_name}{c.provider_name && ` · ${c.provider_name}`}</p>
                      </div>
                      <span className="font-serif text-[15px] text-[#130D10] shrink-0">{formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[14px] p-4">
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
            <p className="text-sm text-[#6B655C]">
              Confirmás que recibiste el pago de <strong className="text-[#130D10]">"{confirmPaid.name}"</strong>{' '}
              ({confirmPaid.project.name}) por{' '}
              <strong className="text-[#130D10]">{formatCurrency(confirmPaid.amount, confirmPaid.project.currency)}</strong>?
            </p>
            <p className="text-xs text-[#A8A29A]">Se registrará la fecha de hoy como fecha de cobro.</p>
          </div>
        )}
      </Modal>

      {/* ARCA invoicing */}
      <FacturarArcaModal
        target={facturando ? {
          id: facturando.id, name: facturando.name,
          projectName: facturando.project.name, clientName: facturando.project.client_name,
          amount: facturando.amount, currency: facturando.project.currency,
        } : null}
        onClose={() => setFacturando(null)}
        onIssue={(milestoneId, factura) => {
          setFacturas(prev => ({ ...prev, [milestoneId]: factura }))
          toast(`Factura ${factura.tipo} ${factura.numero} emitida`)
        }}
      />
    </div>
  )
}
