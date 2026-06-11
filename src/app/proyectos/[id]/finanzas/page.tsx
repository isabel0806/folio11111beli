'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockMilestones, mockCosts, mockProjects, mockContacts, currentUser } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { MetricCard } from '@/components/ui/MetricCard'
import {
  IconPlus, IconBrandWhatsapp, IconCheck, IconReceipt,
  IconUser, IconCurrencyDollar, IconBuildingStore
} from '@tabler/icons-react'
import {
  formatCurrency, formatDate, getMilestoneStatusColor, getMilestoneStatusLabel,
  generateWhatsAppMessage, getCostCategoryLabel, getContactCategoryLabel
} from '@/lib/utils'
import type { PaymentMilestone, CostItem, Contact, MilestoneStatus, CostCategory } from '@/lib/types'

export default function FinanzasProyectoPage() {
  const { id } = useParams() as { id: string }
  const project = mockProjects.find(p => p.id === id)!
  const [milestones, setMilestones] = useState<PaymentMilestone[]>(mockMilestones[id] || [])
  const [costs, setCosts] = useState<CostItem[]>(mockCosts[id] || [])
  const [contacts, setContacts] = useState<Contact[]>(
    mockContacts.filter(c => c.projects?.some(pn => pn === project?.name))
  )

  const [showMilestone, setShowMilestone] = useState(false)
  const [showCost, setShowCost] = useState(false)
  const [showProvider, setShowProvider] = useState(false)
  const [whatsappMsg, setWhatsappMsg] = useState<string | null>(null)
  const [confirmPaid, setConfirmPaid] = useState<PaymentMilestone | null>(null)

  const [mForm, setMForm] = useState({ name: '', due_date: '', amount: '' })
  const [cForm, setCForm] = useState({ description: '', provider_name: '', category: 'gasto', amount: '' })
  const [pForm, setPForm] = useState({ name: '', category: 'proveedor', phone: '', email: '', address: '' })

  const totalProject = project?.total_amount || 0
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const pendiente = milestones.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)

  const handleMarkPaid = () => {
    if (!confirmPaid) return
    setMilestones(prev => prev.map(m => m.id === confirmPaid.id ? { ...m, status: 'cobrado', paid_at: new Date().toISOString() } : m))
    setConfirmPaid(null)
  }

  const handleAddMilestone = () => {
    if (!mForm.name || !mForm.due_date || !mForm.amount) return
    const m: PaymentMilestone = {
      id: `m${Date.now()}`, project_id: id, name: mForm.name,
      due_date: mForm.due_date, amount: Number(mForm.amount),
      status: 'futuro', arca_flagged: false,
    }
    setMilestones(prev => [...prev, m])
    setShowMilestone(false)
    setMForm({ name: '', due_date: '', amount: '' })
  }

  const handleAddCost = () => {
    if (!cForm.description || !cForm.amount) return
    const c: CostItem = {
      id: `c${Date.now()}`, project_id: id, description: cForm.description,
      provider_name: cForm.provider_name || undefined, category: cForm.category as CostCategory,
      amount: Number(cForm.amount), created_at: new Date().toISOString(),
    }
    setCosts(prev => [...prev, c])
    setShowCost(false)
    setCForm({ description: '', provider_name: '', category: 'gasto', amount: '' })
  }

  const handleAddProvider = () => {
    if (!pForm.name) return
    const c: Contact = {
      id: `con${Date.now()}`, studio_id: 's1', name: pForm.name,
      category: pForm.category as Contact['category'],
      phone: pForm.phone || undefined, email: pForm.email || undefined,
      address: pForm.address || undefined,
      created_at: new Date().toISOString(), projects: [project?.name || ''],
    }
    setContacts(prev => [...prev, c])
    setShowProvider(false)
    setPForm({ name: '', category: 'proveedor', phone: '', email: '', address: '' })
  }

  const currency = project?.currency || 'ARS'

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total proyecto" value={formatCurrency(totalProject, currency)} color="blue" icon={<IconCurrencyDollar size={16} stroke={1.5} />} />
        <MetricCard label="Cobrado" value={formatCurrency(cobrado, currency)} color="green" icon={<IconCheck size={16} stroke={1.5} />} />
        <MetricCard label="Pendiente" value={formatCurrency(pendiente, currency)} color="red" icon={<IconCurrencyDollar size={16} stroke={1.5} />} />
      </div>

      {/* Milestones */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Hitos de cobro</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowMilestone(true)}>
            <IconPlus size={13} /> Agregar hito
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E3]">
              {['Hito', 'Vencimiento', 'Monto', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EE]">
            {milestones.map(m => (
              <tr key={m.id} className="hover:bg-[#F9F9F8]">
                <td className="py-3 pr-4 text-sm text-[#130D10] font-medium">{m.name}</td>
                <td className="py-3 pr-4 text-sm text-[#6B6B6B]">{formatDate(m.due_date)}</td>
                <td className="py-3 pr-4 text-sm text-[#130D10]">{formatCurrency(m.amount, currency)}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-md ${getMilestoneStatusColor(m.status)}`}>
                    {getMilestoneStatusLabel(m.status)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    {m.status !== 'cobrado' && (
                      <>
                        <button
                          title="Generar mensaje WhatsApp"
                          onClick={() => setWhatsappMsg(generateWhatsAppMessage(
                            project?.client_name || '', m.name, m.due_date, m.amount, currency, currentUser.cbu_alias || ''
                          ))}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                        >
                          <IconBrandWhatsapp size={15} stroke={1.5} />
                        </button>
                        <button
                          title="Marcar como cobrado"
                          onClick={() => setConfirmPaid(m)}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-[#6B6B6B] hover:text-green-600 transition-colors"
                        >
                          <IconCheck size={15} stroke={1.5} />
                        </button>
                      </>
                    )}
                    <button
                      title="Facturar por ARCA (próximamente)"
                      disabled
                      className="p-1.5 rounded-lg text-[#DADADA] cursor-not-allowed"
                    >
                      <IconReceipt size={15} stroke={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Costs */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Costos del proyecto</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowCost(true)}>
            <IconPlus size={13} /> Agregar costo
          </Button>
        </div>
        {costs.length === 0 ? (
          <p className="text-xs text-[#9B9B9B]">No hay costos cargados.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E3]">
                {['Descripción', 'Proveedor', 'Categoría', 'Monto'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0EE]">
              {costs.map(c => (
                <tr key={c.id} className="hover:bg-[#F9F9F8]">
                  <td className="py-3 pr-4 text-sm text-[#130D10]">{c.description}</td>
                  <td className="py-3 pr-4 text-sm text-[#6B6B6B]">{c.provider_name || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{getCostCategoryLabel(c.category)}</span>
                  </td>
                  <td className="py-3 text-sm text-[#130D10]">{formatCurrency(c.amount, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Providers */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Proveedores del proyecto</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowProvider(true)}>
            <IconPlus size={13} /> Agregar proveedor
          </Button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-xs text-[#9B9B9B]">Sin proveedores asignados.</p>
        ) : (
          <div className="space-y-2">
            {contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#F9F9F8]">
                <div className="w-8 h-8 rounded-full bg-[#F0F0EE] flex items-center justify-center text-xs font-bold text-[#130D10]">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#130D10]">{c.name}</p>
                  <p className="text-[10px] text-[#9B9B9B]">{getContactCategoryLabel(c.category)}{c.phone && ` · ${c.phone}`}</p>
                </div>
                <span className="text-[10px] text-[#9B9B9B] border border-[#E5E5E3] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <IconBuildingStore size={10} /> Directorio
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WhatsApp modal */}
      <Modal
        open={!!whatsappMsg}
        onClose={() => setWhatsappMsg(null)}
        title="Mensaje de cobro — WhatsApp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWhatsappMsg(null)}>Cerrar</Button>
            <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(whatsappMsg || '') }}>Copiar mensaje</Button>
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

      {/* Confirm paid */}
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
            ¿Confirmás que cobras el hito <strong className="text-[#130D10]">"{confirmPaid.name}"</strong> por <strong className="text-[#130D10]">{formatCurrency(confirmPaid.amount, currency)}</strong>?
          </p>
        )}
      </Modal>

      {/* Add milestone */}
      <Modal open={showMilestone} onClose={() => setShowMilestone(false)} title="Agregar hito de cobro"
        footer={<><Button variant="secondary" onClick={() => setShowMilestone(false)}>Cancelar</Button><Button variant="primary" onClick={handleAddMilestone}>Agregar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nombre del hito *" value={mForm.name} onChange={e => setMForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Entrega planos ejecutivos" />
          <Input label="Fecha de vencimiento *" type="date" value={mForm.due_date} onChange={e => setMForm(f => ({ ...f, due_date: e.target.value }))} />
          <Input label="Monto *" type="number" value={mForm.amount} onChange={e => setMForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
        </div>
      </Modal>

      {/* Add cost */}
      <Modal open={showCost} onClose={() => setShowCost(false)} title="Agregar costo"
        footer={<><Button variant="secondary" onClick={() => setShowCost(false)}>Cancelar</Button><Button variant="primary" onClick={handleAddCost}>Agregar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Descripción *" value={cForm.description} onChange={e => setCForm(f => ({ ...f, description: e.target.value }))} placeholder="Ej: Impresión planos" />
          <Input label="Proveedor" value={cForm.provider_name} onChange={e => setCForm(f => ({ ...f, provider_name: e.target.value }))} placeholder="Nombre del proveedor" />
          <Select label="Categoría" value={cForm.category} onChange={e => setCForm(f => ({ ...f, category: e.target.value }))}
            options={[{ value: 'proveedor', label: 'Proveedor' }, { value: 'gasto', label: 'Gasto' }, { value: 'maquinaria', label: 'Maquinaria' }]}
          />
          <Input label="Monto *" type="number" value={cForm.amount} onChange={e => setCForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
        </div>
      </Modal>

      {/* Add provider */}
      <Modal open={showProvider} onClose={() => setShowProvider(false)} title="Agregar proveedor"
        footer={<><Button variant="secondary" onClick={() => setShowProvider(false)}>Cancelar</Button><Button variant="primary" onClick={handleAddProvider}>Agregar</Button></>}
      >
        <div className="space-y-4">
          <Input label="Nombre *" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Imprenta Palermo" />
          <Select label="Categoría" value={pForm.category} onChange={e => setPForm(f => ({ ...f, category: e.target.value }))}
            options={[
              { value: 'industrial', label: 'Industrial' }, { value: 'proveedor', label: 'Proveedor' },
              { value: 'colaborador', label: 'Colaborador' }, { value: 'cliente', label: 'Cliente' },
            ]}
          />
          <Input label="Teléfono" value={pForm.phone} onChange={e => setPForm(f => ({ ...f, phone: e.target.value }))} placeholder="+5491155551234" />
          <Input label="Email" type="email" value={pForm.email} onChange={e => setPForm(f => ({ ...f, email: e.target.value }))} placeholder="email@ejemplo.com" />
          <Input label="Dirección" value={pForm.address} onChange={e => setPForm(f => ({ ...f, address: e.target.value }))} placeholder="Av. Santa Fe 1234, CABA" />
        </div>
      </Modal>
    </div>
  )
}
