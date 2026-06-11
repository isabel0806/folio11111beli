'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterTabs } from '@/components/layout/FilterTabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { IconPlus, IconCalendar } from '@tabler/icons-react'
import { mockProjects, mockMilestones } from '@/lib/mock-data'
import { formatDate, getProjectStatusColor, getProjectStatusLabel, getProjectTypeLabel } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/lib/types'
import Link from 'next/link'

const statusTabs = [
  { value: 'todos', label: 'Todos' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'en_pausa', label: 'En pausa' },
  { value: 'completado', label: 'Completados' },
]

export default function ProyectosPage() {
  const [filter, setFilter] = useState('todos')
  const [showNew, setShowNew] = useState(false)
  const [projects, setProjects] = useState(mockProjects)
  const [form, setForm] = useState({
    name: '', client_name: '', type: 'arquitectura', currency: 'ARS',
    pricing_mode: 'proyecto', total_amount: '', hourly_rate: '', start_date: '',
  })

  const filtered = filter === 'todos' ? projects : projects.filter(p => p.status === filter)

  const handleCreate = () => {
    if (!form.name || !form.client_name) return
    const newP: Project = {
      id: `p${Date.now()}`, studio_id: 's1', name: form.name,
      client_name: form.client_name, type: form.type as Project['type'],
      status: 'en_curso', currency: form.currency as 'ARS' | 'USD',
      pricing_mode: form.pricing_mode as Project['pricing_mode'],
      total_amount: form.total_amount ? Number(form.total_amount) : undefined,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
      start_date: form.start_date, created_at: new Date().toISOString(),
      progress: 0,
      cover_color: ['#E8D5B7', '#B7D5E8', '#D5E8B7', '#E8B7D5'][Math.floor(Math.random() * 4)],
    }
    setProjects(prev => [newP, ...prev])
    setShowNew(false)
    setForm({ name: '', client_name: '', type: 'arquitectura', currency: 'ARS', pricing_mode: 'proyecto', total_amount: '', hourly_rate: '', start_date: '' })
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Proyectos"
        description={`${projects.filter(p => p.status === 'en_curso').length} proyectos activos`}
        actions={<Button variant="primary" onClick={() => setShowNew(true)}><IconPlus size={14} /> Nuevo proyecto</Button>}
      />

      <div className="mb-5">
        <FilterTabs
          tabs={statusTabs.map(t => ({
            ...t,
            count: t.value === 'todos' ? projects.length : projects.filter(p => p.status === t.value).length
          }))}
          active={filter}
          onChange={setFilter}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(p => {
          const nextMilestone = (mockMilestones[p.id] || []).find(m => m.status === 'pendiente')
          return (
            <Link key={p.id} href={`/proyectos/${p.id}`}>
              <div className="bg-white border border-[#E5E5E3] rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-24 flex items-center justify-center text-3xl font-bold text-[#130D10]/30 relative" style={{ backgroundColor: p.cover_color }}>
                  {p.cover_image
                    ? <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                    : <span style={{ color: p.cover_color ? 'rgba(19,13,16,0.35)' : '#ccc' }}>{p.name[0]}</span>
                  }
                  <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-md font-medium ${getProjectStatusColor(p.status)}`}>
                    {getProjectStatusLabel(p.status)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#130D10] mb-0.5 group-hover:text-[#C9A800] transition-colors">{p.name}</h3>
                  <p className="text-xs text-[#6B6B6B] mb-3">{p.client_name} · {getProjectTypeLabel(p.type)}</p>
                  <ProgressBar value={p.progress || 0} showLabel className="mb-3" />
                  {nextMilestone ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B]">
                      <IconCalendar size={11} stroke={1.5} />
                      <span>Próx. cobro: {formatDate(nextMilestone.due_date)}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#9B9B9B]">Sin cobros pendientes</div>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <p className="text-[#9B9B9B] text-sm">No hay proyectos con este estado.</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowNew(true)}>
              <IconPlus size={14} /> Crear proyecto
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo proyecto"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreate}>Crear proyecto</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre del proyecto *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Casa Palermo" />
          </div>
          <div className="col-span-2">
            <Input label="Cliente *" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nombre del cliente" />
          </div>
          <Select
            label="Tipo de proyecto"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'arquitectura', label: 'Arquitectura' },
              { value: 'diseño_grafico', label: 'Diseño gráfico' },
              { value: 'event_planning', label: 'Event Planning' },
              { value: 'consultoria', label: 'Consultoría' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
          <Select
            label="Moneda"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            options={[{ value: 'ARS', label: 'ARS — Pesos' }, { value: 'USD', label: 'USD — Dólares' }]}
          />
          <div className="col-span-2">
            <Select
              label="Modalidad de precio"
              value={form.pricing_mode}
              onChange={e => setForm(f => ({ ...f, pricing_mode: e.target.value }))}
              options={[
                { value: 'proyecto', label: 'Por proyecto' },
                { value: 'hora', label: 'Por hora' },
                { value: 'ambos', label: 'Ambos' },
              ]}
            />
          </div>
          {(form.pricing_mode === 'proyecto' || form.pricing_mode === 'ambos') && (
            <Input
              label="Monto total del proyecto"
              type="number"
              value={form.total_amount}
              onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))}
              placeholder="0"
            />
          )}
          {(form.pricing_mode === 'hora' || form.pricing_mode === 'ambos') && (
            <Input
              label="Tarifa por hora"
              type="number"
              value={form.hourly_rate}
              onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))}
              placeholder="0"
            />
          )}
          <div className="col-span-2">
            <Input label="Fecha de inicio" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
