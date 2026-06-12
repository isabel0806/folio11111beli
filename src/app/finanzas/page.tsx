'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterTabs } from '@/components/layout/FilterTabs'
import { MetricCard } from '@/components/ui/MetricCard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import {
  IconCurrencyDollar, IconTrendingUp, IconTrendingDown, IconPercentage,
  IconBrandWhatsapp, IconCheck, IconReceipt, IconSearch
} from '@tabler/icons-react'
import { mockMilestones, mockCosts, mockProjects, currentUser } from '@/lib/mock-data'
import {
  formatCurrency, formatDate, getMilestoneStatusColor, getMilestoneStatusLabel,
  generateWhatsAppMessage, getCostCategoryLabel
} from '@/lib/utils'
import type { MilestoneStatus, PaymentMilestone } from '@/lib/types'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

export default function FinanzasPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState('cobrar')
  const [filter, setFilter] = useState('todos')
  const [period, setPeriod] = useState('mes')
  const [milestones, setMilestones] = useState(() =>
    Object.entries(mockMilestones).flatMap(([pid, ms]) =>
      ms.map(m => ({ ...m, project_name: mockProjects.find(p => p.id === pid)?.name || '' }))
    )
  )
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)
  const [confirmPaid, setConfirmPaid] = useState<typeof milestones[0] | null>(null)

  const allCosts = Object.entries(mockCosts).flatMap(([pid, cs]) =>
    cs.map(c => ({ ...c, project_name: mockProjects.find(p => p.id === pid)?.name || '' }))
  )

  const totalIngresos = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const totalCostos = allCosts.reduce((a, c) => a + c.amount, 0)
  const totalNeto = totalIngresos - totalCostos
  const margen = totalIngresos > 0 ? Math.round((totalNeto / totalIngresos) * 100) : 0

  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const porCobrar = milestones.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
  const totalEsperado = cobrado + porCobrar

  const filteredMilestones = filter === 'todos' ? milestones : milestones.filter(m => m.status === filter)
  const [searchCost, setSearchCost] = useState('')
  const filteredCosts = allCosts.filter(c =>
    !searchCost || c.description.toLowerCase().includes(searchCost.toLowerCase()) ||
    (c.provider_name || '').toLowerCase().includes(searchCost.toLowerCase())
  )

  const handleMarkPaid = () => {
    if (!confirmPaid) return
    setMilestones(prev => prev.map(m => m.id === confirmPaid.id ? { ...m, status: 'cobrado' as MilestoneStatus, paid_at: new Date().toISOString() } : m))
    toast(`✓ "${confirmPaid.name}" marcado como cobrado`)
    setConfirmPaid(null)
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Finanzas"
        description="Visión global de tu negocio"
        actions={
          <Select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            options={[{ value: 'mes', label: 'Este mes' }, { value: 'trimestre', label: 'Este trimestre' }, { value: 'año', label: 'Este año' }]}
          />
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Ingresos" value={formatCurrency(totalIngresos)} color="blue" icon={<IconTrendingUp size={16} stroke={1.5} />} />
        <MetricCard label="Costos" value={formatCurrency(totalCostos)} color="red" icon={<IconTrendingDown size={16} stroke={1.5} />} />
        <MetricCard label="Neto" value={formatCurrency(totalNeto)} color="green" icon={<IconCurrencyDollar size={16} stroke={1.5} />} />
        <MetricCard label="Margen" value={`${margen}%`} color="yellow" icon={<IconPercentage size={16} stroke={1.5} />} />
      </div>

      {/* Progress bar cobrado vs por cobrar */}
      {totalEsperado > 0 && (
        <div className="bg-white border border-[#E5E5E3] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#130D10]">Ingresos del período</h3>
            <span className="text-xs text-[#6B6B6B]">{formatCurrency(cobrado)} cobrado de {formatCurrency(totalEsperado)} esperado</span>
          </div>
          <div className="h-3 bg-[#F0F0EE] rounded-full overflow-hidden flex">
            <div className="h-full bg-green-400 transition-all" style={{ width: `${(cobrado / totalEsperado) * 100}%` }} />
            <div className="h-full bg-[#F5D242] transition-all" style={{ width: `${(porCobrar / totalEsperado) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-[#6B6B6B]"><span className="w-2 h-2 rounded-full bg-green-400" />Cobrado</span>
            <span className="flex items-center gap-1.5 text-xs text-[#6B6B6B]"><span className="w-2 h-2 rounded-full bg-[#F5D242]" />Por cobrar</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[#E5E5E3]">
        {[{ k: 'cobrar', label: 'Facturas a cobrar' }, { k: 'costos', label: 'Costos y gastos' }].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.k ? 'border-[#F5D242] text-[#130D10]' : 'border-transparent text-[#6B6B6B] hover:text-[#130D10]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cobrar' && (
        <>
          <div className="mb-4">
            <FilterTabs
              tabs={[
                { value: 'todos', label: 'Todos', count: milestones.length },
                { value: 'pendiente', label: 'Pendientes', count: milestones.filter(m => m.status === 'pendiente').length },
                { value: 'cobrado', label: 'Cobrados', count: milestones.filter(m => m.status === 'cobrado').length },
                { value: 'vencido', label: 'Vencidos', count: milestones.filter(m => m.status === 'vencido').length },
              ]}
              active={filter}
              onChange={setFilter}
            />
          </div>
          <div className="bg-white border border-[#E5E5E3] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E3] bg-[#F9F9F8]">
                  {['Proyecto', 'Hito', 'Vencimiento', 'Monto', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EE]">
                {filteredMilestones.map(m => (
                  <tr key={m.id} className="hover:bg-[#F9F9F8]">
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{m.project_name}</td>
                    <td className="px-4 py-3 text-sm text-[#130D10] font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{formatDate(m.due_date)}</td>
                    <td className="px-4 py-3 text-sm text-[#130D10]">{formatCurrency(m.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md ${getMilestoneStatusColor(m.status)}`}>
                        {getMilestoneStatusLabel(m.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {m.status !== 'cobrado' && (
                          <>
                            <button
                              title="WhatsApp"
                              onClick={() => {
                                const project = mockProjects.find(p => p.name === m.project_name)
                                setWhatsappMsg(generateWhatsAppMessage(
                                  project?.client_name || '', m.name, m.due_date, m.amount,
                                  project?.currency || 'ARS', currentUser.cbu_alias || ''
                                ))
                              }}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            >
                              <IconBrandWhatsapp size={14} />
                            </button>
                            <button
                              title="Marcar cobrado"
                              onClick={() => setConfirmPaid(m)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-[#6B6B6B] hover:text-green-600 transition-colors"
                            >
                              <IconCheck size={14} />
                            </button>
                          </>
                        )}
                        <button disabled title="ARCA — Próximamente" className="p-1.5 rounded-lg text-[#DADADA] cursor-not-allowed">
                          <IconReceipt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'costos' && (
        <>
          <div className="mb-4">
            <div className="relative">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
              <input
                className="pl-8 pr-4 py-2 text-sm border border-[#E5E5E3] rounded-lg bg-white w-64 focus:outline-none focus:ring-1 focus:ring-[#F5D242]"
                placeholder="Buscar costos..."
                value={searchCost}
                onChange={e => setSearchCost(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-white border border-[#E5E5E3] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E3] bg-[#F9F9F8]">
                  {['Proyecto', 'Descripción', 'Proveedor', 'Categoría', 'Monto'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EE]">
                {filteredCosts.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9F9F8]">
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{c.project_name}</td>
                    <td className="px-4 py-3 text-sm text-[#130D10]">{c.description}</td>
                    <td className="px-4 py-3 text-sm text-[#6B6B6B]">{c.provider_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{getCostCategoryLabel(c.category)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#130D10]">{formatCurrency(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Historial de precios (fase 2) */}
          <div className="mt-6 bg-white border border-[#E5E5E3] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#130D10]">Historial de precios</h3>
              <span className="text-xs bg-[#F0F0EE] text-[#9B9B9B] px-2 py-0.5 rounded-md">Próximamente</span>
            </div>
            <p className="text-xs text-[#9B9B9B]">¿Cuánto costó algo similar antes? Buscá en el historial de proyectos pasados para usar como benchmark.</p>
          </div>
        </>
      )}

      <Modal
        open={!!whatsappMsg}
        onClose={() => setWhatsappMsg(null)}
        title="Mensaje de cobro — WhatsApp"
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

      <Modal
        open={!!confirmPaid}
        onClose={() => setConfirmPaid(null)}
        title="Confirmar cobro"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmPaid(null)}>Cancelar</Button>
            <Button variant="primary" onClick={handleMarkPaid}>Confirmar cobro</Button>
          </>
        }
      >
        {confirmPaid && (
          <p className="text-sm text-[#6B6B6B]">
            ¿Confirmás el cobro de <strong className="text-[#130D10]">"{confirmPaid.name}"</strong> ({confirmPaid.project_name}) por <strong className="text-[#130D10]">{formatCurrency(confirmPaid.amount)}</strong>?
          </p>
        )}
      </Modal>
    </div>
  )
}
