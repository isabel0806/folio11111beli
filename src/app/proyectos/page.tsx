'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import {
  IconPlus, IconLayoutGrid, IconList, IconDots,
  IconCalendar, IconCurrencyDollar, IconAlertTriangle,
  IconCheck, IconChevronRight, IconSearch
} from '@tabler/icons-react'
import { mockProjects, mockMilestones } from '@/lib/mock-data'
import {
  formatCurrency, formatDate, getProjectStatusColor,
  getProjectStatusLabel, getProjectTypeLabel, getDaysUntil
} from '@/lib/utils'
import type { Project, ProjectStatus } from '@/lib/types'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'todos' | ProjectStatus

const typeIcons: Record<string, string> = {
  arquitectura: '🏛', diseño_grafico: '🎨', event_planning: '🎪', consultoria: '💼', otro: '📁',
}

export default function ProyectosPage() {
  const [filter, setFilter] = useState<FilterStatus>('todos')
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [projects, setProjects] = useState(mockProjects)
  const [form, setForm] = useState({
    name: '', client_name: '', type: 'arquitectura', currency: 'ARS',
    pricing_mode: 'proyecto', total_amount: '', hourly_rate: '', start_date: '',
  })

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'en_curso', label: 'En curso' },
    { value: 'en_pausa', label: 'En pausa' },
    { value: 'completado', label: 'Completados' },
    { value: 'borrador', label: 'Borradores' },
  ]

  const filtered = projects
    .filter(p => filter === 'todos' || p.status === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase()))

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
      cover_color: ['#E8D5B7', '#B7D5E8', '#D5E8B7', '#E8B7D5', '#D5D5E8'][Math.floor(Math.random() * 5)],
    }
    setProjects(prev => [newP, ...prev])
    setShowNew(false)
    setForm({ name: '', client_name: '', type: 'arquitectura', currency: 'ARS', pricing_mode: 'proyecto', total_amount: '', hourly_rate: '', start_date: '' })
  }

  const activeCount = projects.filter(p => p.status === 'en_curso').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-[#130D10]">Proyectos</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            {activeCount} activo{activeCount !== 1 ? 's' : ''} · {projects.length} en total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>
          <IconPlus size={14} /> Nuevo proyecto
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-white border border-[#E5E5E3] rounded-lg p-1">
            {filters.map(f => {
              const count = f.value === 'todos' ? projects.length : projects.filter(p => p.status === f.value).length
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    filter === f.value
                      ? 'bg-[#130D10] text-white font-medium'
                      : 'text-[#6B6B6B] hover:text-[#130D10]'
                  )}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                      filter === f.value ? 'bg-white/20 text-white' : 'bg-[#F0F0EE] text-[#9B9B9B]'
                    )}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              className="pl-8 pr-3 py-2 text-sm border border-[#E5E5E3] rounded-lg bg-white w-48 focus:outline-none focus:ring-1 focus:ring-[#F5D242] focus:border-[#F5D242]"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white border border-[#E5E5E3] rounded-lg p-1">
          <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-[#F5D242] text-[#130D10]' : 'text-[#9B9B9B] hover:text-[#130D10]')}>
            <IconLayoutGrid size={15} />
          </button>
          <button onClick={() => setView('list')} className={cn('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-[#F5D242] text-[#130D10]' : 'text-[#9B9B9B] hover:text-[#130D10]')}>
            <IconList size={15} />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          {filtered.length === 0 && <EmptyState onNew={() => setShowNew(true)} />}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="bg-white border border-[#E5E5E3] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_140px_140px_120px_100px] gap-0">
            {/* Header */}
            <div className="contents">
              {['', 'Proyecto', 'Cliente', 'Financiero', 'Avance', 'Estado'].map(h => (
                <div key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] border-b border-[#E5E5E3] bg-[#F9F9F8]">
                  {h}
                </div>
              ))}
            </div>
            {/* Rows */}
            {filtered.map(p => <ProjectListRow key={p.id} project={p} />)}
          </div>
          {filtered.length === 0 && <EmptyState onNew={() => setShowNew(true)} />}
        </div>
      )}

      {/* New project modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Nuevo proyecto"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreate} disabled={!form.name || !form.client_name}>
              Crear proyecto
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre del proyecto *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Casa Palermo" />
          </div>
          <div className="col-span-2">
            <Input label="Cliente *" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nombre del cliente o empresa" />
          </div>
          <Select label="Tipo" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'arquitectura', label: '🏛 Arquitectura' },
              { value: 'diseño_grafico', label: '🎨 Diseño gráfico' },
              { value: 'event_planning', label: '🎪 Event Planning' },
              { value: 'consultoria', label: '💼 Consultoría' },
              { value: 'otro', label: '📁 Otro' },
            ]}
          />
          <Select label="Moneda" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            options={[{ value: 'ARS', label: 'ARS — Pesos' }, { value: 'USD', label: 'USD — Dólares' }]}
          />
          <div className="col-span-2">
            <Select label="Modalidad de precio" value={form.pricing_mode} onChange={e => setForm(f => ({ ...f, pricing_mode: e.target.value }))}
              options={[{ value: 'proyecto', label: 'Por proyecto (monto fijo)' }, { value: 'hora', label: 'Por hora' }, { value: 'ambos', label: 'Mixto' }]}
            />
          </div>
          {(form.pricing_mode === 'proyecto' || form.pricing_mode === 'ambos') && (
            <Input label="Honorarios totales" type="number" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="0" />
          )}
          {(form.pricing_mode === 'hora' || form.pricing_mode === 'ambos') && (
            <Input label="Tarifa/hora" type="number" value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))} placeholder="0" />
          )}
          <div className="col-span-2">
            <Input label="Fecha de inicio" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const milestones = mockMilestones[project.id] || []
  const nextMilestone = milestones.find(m => m.status === 'pendiente')
  const overdue = milestones.filter(m => m.status === 'vencido').length
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const total = project.total_amount || 0
  const cobradoPct = total > 0 ? (cobrado / total) * 100 : 0

  const daysToNext = nextMilestone ? getDaysUntil(nextMilestone.due_date) : null

  return (
    <Link href={`/proyectos/${project.id}`}>
      <div className="bg-white border border-[#E5E5E3] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
        {/* Cover */}
        <div className="h-28 relative flex items-end p-4" style={{ backgroundColor: project.cover_color }}>
          {/* Type emoji top left */}
          <span className="absolute top-3 left-4 text-2xl opacity-60">{typeIcons[project.type]}</span>

          {/* Overdue alert */}
          {overdue > 0 && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              <IconAlertTriangle size={10} /> {overdue} vencido{overdue > 1 ? 's' : ''}
            </span>
          )}

          {/* Status badge bottom right */}
          <div className="ml-auto">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getProjectStatusColor(project.status))}>
              {getProjectStatusLabel(project.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-[#130D10] mb-0.5 group-hover:text-[#130D10] truncate">{project.name}</h3>
          <p className="text-xs text-[#9B9B9B] mb-3 truncate">{project.client_name}</p>

          {/* Financial bar */}
          {total > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-[#9B9B9B] mb-1">
                <span>{formatCurrency(cobrado, project.currency)} cobrado</span>
                <span>{formatCurrency(total, project.currency)} total</span>
              </div>
              <div className="h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${cobradoPct}%` }} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F0F0EE]">
            <div className="flex items-center gap-1.5 text-[10px] text-[#9B9B9B]">
              <div className="w-5 h-5 bg-[#F0F0EE] rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#6B6B6B]">{project.progress}%</span>
              </div>
              completado
            </div>

            {nextMilestone && daysToNext !== null && (
              <div className={cn(
                'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full',
                daysToNext < 0 ? 'bg-red-50 text-red-600' :
                daysToNext <= 7 ? 'bg-[#FFF9D6] text-[#C9A800]' :
                'text-[#9B9B9B]'
              )}>
                <IconCalendar size={10} stroke={1.5} />
                {daysToNext < 0 ? `Vencido hace ${Math.abs(daysToNext)}d` :
                 daysToNext === 0 ? 'Vence hoy' :
                 `${daysToNext}d para cobrar`}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ProjectListRow({ project }: { project: Project }) {
  const milestones = mockMilestones[project.id] || []
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const pendiente = milestones.filter(m => m.status === 'pendiente' || m.status === 'vencido').reduce((a, m) => a + m.amount, 0)
  const overdue = milestones.filter(m => m.status === 'vencido').length

  return (
    <Link href={`/proyectos/${project.id}`} className="contents">
      <div className="flex items-center justify-center px-4 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: project.cover_color }}>
          {typeIcons[project.type]}
        </div>
      </div>
      <div className="flex items-center px-0 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <div>
          <p className="text-sm font-semibold text-[#130D10]">{project.name}</p>
          <p className="text-xs text-[#9B9B9B]">{getProjectTypeLabel(project.type)}</p>
        </div>
        {overdue > 0 && (
          <span className="ml-2 flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
            <IconAlertTriangle size={9} /> {overdue}
          </span>
        )}
      </div>
      <div className="flex items-center px-4 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <p className="text-sm text-[#6B6B6B] truncate">{project.client_name}</p>
      </div>
      <div className="flex items-center px-4 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <div>
          {cobrado > 0 && <p className="text-xs text-green-600 font-medium">{formatCurrency(cobrado, project.currency)} cobrado</p>}
          {pendiente > 0 && <p className="text-xs text-[#C9A800]">{formatCurrency(pendiente, project.currency)} pendiente</p>}
          {cobrado === 0 && pendiente === 0 && <p className="text-xs text-[#9B9B9B]">Sin hitos</p>}
        </div>
      </div>
      <div className="flex items-center px-4 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <div className="w-full">
          <div className="flex justify-between text-[10px] text-[#9B9B9B] mb-1">
            <span>{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
            <div className="h-full bg-[#F5D242] rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>
      <div className="flex items-center px-4 py-4 border-b border-[#F0F0EE] hover:bg-[#F9F9F8] transition-colors">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getProjectStatusColor(project.status))}>
          {getProjectStatusLabel(project.status)}
        </span>
      </div>
    </Link>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="col-span-3 py-20 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 bg-[#F0F0EE] rounded-2xl flex items-center justify-center text-2xl">📁</div>
      <div>
        <p className="text-sm font-medium text-[#130D10]">No hay proyectos</p>
        <p className="text-xs text-[#9B9B9B] mt-0.5">Creá tu primer proyecto para empezar</p>
      </div>
      <Button variant="primary" onClick={onNew}><IconPlus size={13} /> Nuevo proyecto</Button>
    </div>
  )
}
