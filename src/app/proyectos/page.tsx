'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import {
  IconPlus, IconLayoutGrid, IconList, IconBell, IconSearch,
  IconHome2, IconBuildingStore, IconBuildingSkyscraper, IconBriefcase,
  IconFolder, IconCheck, IconChevronRight,
} from '@tabler/icons-react'
import { mockProjects, mockMilestones } from '@/lib/mock-data'
import {
  formatCurrency, getProjectStatusLabel, getProjectTypeLabel, getDaysUntil
} from '@/lib/utils'
import type { Project, ProjectStatus } from '@/lib/types'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { useRole, ASSIGNED_PROJECT_IDS } from '@/lib/use-role'
import { mockTeam } from '@/lib/mock-data'
import { getAreas, ALL_AREAS, OPERATIVO_AREAS } from '@/lib/project-access'
import { resolveState, STATE_COLORS } from '@/lib/project-states'

type ColorMode = 'tipo' | 'estado' | 'salud'
const TYPE_COVER: Record<string, string> = {
  arquitectura: '#7FB0E8', diseño_grafico: '#FFABCF', event_planning: '#D5D25D', consultoria: '#00846F', otro: '#C4BFB4',
}
function coverFor(project: Project, mode: ColorMode, index: number): string {
  if (mode === 'tipo') return TYPE_COVER[project.type] || coverColors[index % coverColors.length]
  if (mode === 'estado') return STATE_COLORS[resolveState(project.status).color].dot
  const ms = mockMilestones[project.id] || []
  if (ms.some(m => m.status === 'vencido')) return '#FF5738'
  if (ms.some(m => { const d = getDaysUntil(m.due_date); return m.status === 'pendiente' && d !== null && d <= 7 })) return '#F5D242'
  return '#00846F'
}

// Si se impersona una persona: ¿ve finanzas de este proyecto? null = no aplica.
function personFinanzas(projectId: string, person: string | null): boolean | null {
  if (!person) return null
  const m = (mockTeam[projectId] || []).find(x => x.name === person)
  if (!m) return false
  const def = m.tag_label.toLowerCase().includes('responsable') ? ALL_AREAS : OPERATIVO_AREAS
  return getAreas(projectId, m.id, def).includes('finanzas')
}

type ViewMode = 'grid' | 'list'
type FilterStatus = 'todos' | ProjectStatus

const coverColors = ['#7FB0E8', '#FFABCF', '#D5D25D', '#00846F', '#FF5738', '#F5D242']

const typeIcon: Record<string, typeof IconHome2> = {
  arquitectura: IconHome2,
  diseño_grafico: IconBuildingStore,
  event_planning: IconBuildingSkyscraper,
  consultoria: IconBriefcase,
  otro: IconFolder,
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2c.3 3.8 2.2 5.7 6 6-3.8.3-5.7 2.2-6 6-.3-3.8-2.2-5.7-6-6 3.8-.3 5.7-2.2 6-6z" />
    </svg>
  )
}

export default function ProyectosPage() {
  const [filter, setFilter] = useState<FilterStatus>('todos')
  const [view, setView] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [projects, setProjects] = useState(mockProjects)
  const [colorMode, setColorMode] = useState<ColorMode>('tipo')
  const { can, person } = useRole()
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

  const visibleProjects = person
    ? projects.filter(p => (mockTeam[p.id] || []).some(m => m.name === person))
    : can('allProjects') ? projects : projects.filter(p => ASSIGNED_PROJECT_IDS.includes(p.id))

  const filtered = visibleProjects
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
      cover_color: coverColors[Math.floor(Math.random() * coverColors.length)],
    }
    setProjects(prev => [newP, ...prev])
    setShowNew(false)
    setForm({ name: '', client_name: '', type: 'arquitectura', currency: 'ARS', pricing_mode: 'proyecto', total_amount: '', hourly_rate: '', start_date: '' })
  }

  const activeCount = visibleProjects.filter(p => p.status === 'en_curso').length

  return (
    <div className="px-12 py-10 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-serif text-[44px] leading-[1.05] text-[#130D10] flex items-center gap-3">
            Proyectos
            <Sparkle className="w-5 h-5 text-[#FF5738]" />
          </h1>
          <p className="text-[15px] text-[#6B655C] mt-2">
            Tenés <span className="font-semibold text-[#130D10]">{activeCount} activo{activeCount !== 1 ? 's' : ''}</span> · {visibleProjects.length} en total.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button aria-label="Notificaciones" className="w-11 h-11 rounded-full border border-[#ECE8D6] bg-white flex items-center justify-center hover:bg-[#FBFAF3] transition-colors">
            <IconBell size={18} className="text-[#5C564E]" stroke={1.6} />
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-[#130D10] text-white text-sm font-semibold pl-4 pr-5 py-3 rounded-full hover:bg-[#2A2227] transition-colors">
            <IconPlus size={16} stroke={2.2} /> Nuevo proyecto
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => {
            const count = f.value === 'todos' ? visibleProjects.length : visibleProjects.filter(p => p.status === f.value).length
            const active = filter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'flex items-center gap-2 pl-4 pr-3.5 py-2 text-[13px] rounded-full border transition-colors',
                  active
                    ? 'bg-[#130D10] text-white border-[#130D10] font-semibold'
                    : 'bg-white text-[#5C564E] border-[#ECE8D6] hover:border-[#D8D3C6] font-medium'
                )}
              >
                {f.label}
                <span className={cn('text-[11px] font-semibold', active ? 'text-white/60' : 'text-[#A8A29A]')}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Color mode */}
          <div className="flex items-center gap-0.5 bg-white border border-[#ECE8D6] rounded-full p-1">
            <span className="text-[11px] text-[#A8A29A] pl-2 pr-1">Color</span>
            {([['tipo', 'Tipo'], ['estado', 'Estado'], ['salud', 'Salud']] as [ColorMode, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setColorMode(k)}
                className={cn('px-2.5 py-1 text-[12px] rounded-full transition-colors',
                  colorMode === k ? 'bg-[#130D10] text-white font-semibold' : 'text-[#8A847B] hover:text-[#130D10]'
                )}>
                {label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <IconSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
            <input
              className="pl-10 pr-4 py-2.5 text-[13px] border border-[#ECE8D6] rounded-full bg-[#FBFAF3] w-44 placeholder:text-[#A8A29A] focus:outline-none focus:ring-1 focus:ring-[#FF5738] focus:border-[#FF5738]"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-[#ECE8D6] rounded-full p-1">
            <button aria-label="Vista en cuadrícula" onClick={() => setView('grid')} className={cn('p-2 rounded-full transition-colors', view === 'grid' ? 'bg-[#F5D242] text-[#130D10]' : 'text-[#A8A29A] hover:text-[#130D10]')}>
              <IconLayoutGrid size={16} />
            </button>
            <button aria-label="Vista en lista" onClick={() => setView('list')} className={cn('p-2 rounded-full transition-colors', view === 'list' ? 'bg-[#F5D242] text-[#130D10]' : 'text-[#A8A29A] hover:text-[#130D10]')}>
              <IconList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-3 gap-5">
          {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} colorMode={colorMode} />)}
          {filtered.length === 0 && <EmptyState onNew={() => setShowNew(true)} />}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="bg-white border border-[#ECE8D6] rounded-2xl overflow-hidden">
          {filtered.map((p, i) => <ProjectListRow key={p.id} project={p} index={i} colorMode={colorMode} />)}
          {filtered.length === 0 && <div className="py-16"><EmptyState onNew={() => setShowNew(true)} /></div>}
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
              { value: 'arquitectura', label: 'Arquitectura' },
              { value: 'diseño_grafico', label: 'Diseño gráfico' },
              { value: 'event_planning', label: 'Event Planning' },
              { value: 'consultoria', label: 'Consultoría' },
              { value: 'otro', label: 'Otro' },
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

function StatusBadge({ project }: { project: Project }) {
  const ms = mockMilestones[project.id] || []
  const overdue = ms.some(m => m.status === 'vencido')
  const next = ms.find(m => m.status === 'pendiente')
  const days = next ? getDaysUntil(next.due_date) : null

  if (project.status === 'completado')
    return <span className="flex items-center gap-1 bg-white text-[#00846F] text-[11px] font-semibold px-2.5 py-1 rounded-full"><IconCheck size={12} stroke={2.5} /> Completado</span>
  if (overdue)
    return <span className="bg-[#130D10] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">Vencido</span>
  if (project.status === 'en_pausa')
    return <span className="bg-white text-[#6B655C] text-[11px] font-semibold px-2.5 py-1 rounded-full">En pausa</span>
  if (days !== null && days <= 7)
    return <span className="bg-[#FF5738] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">{days <= 0 ? 'Vence hoy' : `Vence en ${days}d`}</span>
  return <span className="bg-white text-[#6B655C] text-[11px] font-semibold px-2.5 py-1 rounded-full">{getProjectStatusLabel(project.status)}</span>
}

function ProjectCard({ project, index, colorMode }: { project: Project; index: number; colorMode: ColorMode }) {
  const { can, person } = useRole()
  const pf = personFinanzas(project.id, person)
  const showMoney = pf === null ? can('projectFinanzas') : pf
  const cover = coverFor(project, colorMode, index)
  const Icon = typeIcon[project.type] || IconFolder
  const ms = mockMilestones[project.id] || []
  const next = ms.find(m => m.status === 'pendiente')
  const cobrado = ms.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const total = project.total_amount || 0
  const cobradoPct = total > 0 ? Math.min(100, (cobrado / total) * 100) : (project.progress ?? 0)
  const done = project.status === 'completado'
  const etapa = done ? 'Entregado' : next?.name ?? 'En curso'
  const progress = project.progress ?? 0

  return (
    <Link href={`/proyectos/${project.id}`}>
      <div className="bg-white border border-black/[0.06] rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(19,13,16,0.05)] hover:shadow-[0_8px_24px_rgba(19,13,16,0.10)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* Cover */}
        <div className="h-[120px] relative flex items-start justify-between p-4" style={{ backgroundColor: cover }}>
          <span className="flex items-center gap-1.5 bg-white text-[#130D10] text-[11px] font-semibold pl-2 pr-2.5 py-1 rounded-full">
            <Icon size={13} stroke={1.8} /> {getProjectTypeLabel(project.type)}
          </span>
          <StatusBadge project={project} />
          <Sparkle className="absolute right-4 bottom-3 w-7 h-7 text-white/85" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-[21px] leading-tight text-[#130D10] truncate">{project.name}</h3>
          <p className="text-[13px] text-[#8A847B] mb-3.5 truncate">{project.client_name}</p>

          <div className="flex items-baseline justify-between mb-2.5">
            {showMoney ? (
              <>
                <p className="font-serif text-[27px] leading-none text-[#130D10]">{formatCurrency(cobrado, project.currency)}</p>
                <span className="text-[12px] text-[#A8A29A]">{done ? 'cobrado' : `de ${formatCurrency(total, project.currency).replace(/^\D+/, '')}`}</span>
              </>
            ) : (
              <>
                <p className="font-serif text-[27px] leading-none text-[#130D10]">{progress}%</p>
                <span className="text-[12px] text-[#A8A29A]">de avance</span>
              </>
            )}
          </div>
          <div className="h-2 bg-[#F0EDE0] rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#00846F] rounded-full transition-all" style={{ width: `${showMoney ? cobradoPct : progress}%` }} />
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-[#F2EFE2]">
            <p className="text-[12px] text-[#6B655C] truncate">Etapa: <span className="font-medium text-[#130D10]">{etapa}</span></p>
            <p className="font-serif text-[18px] text-[#130D10] shrink-0">{progress}%</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ProjectListRow({ project, index, colorMode }: { project: Project; index: number; colorMode: ColorMode }) {
  const { can, person } = useRole()
  const pf = personFinanzas(project.id, person)
  const showMoney = pf === null ? can('projectFinanzas') : pf
  const cover = coverFor(project, colorMode, index)
  const Icon = typeIcon[project.type] || IconFolder
  const ms = mockMilestones[project.id] || []
  const cobrado = ms.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const total = project.total_amount || 0
  const cobradoPct = total > 0 ? Math.min(100, (cobrado / total) * 100) : (project.progress ?? 0)
  const progress = project.progress ?? 0

  return (
    <Link href={`/proyectos/${project.id}`}>
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#F2EFE2] last:border-0 hover:bg-[#FBFAF3] transition-colors">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: cover }}>
          <Icon size={19} className="text-white" stroke={1.8} />
        </div>
        <div className="w-[200px] shrink-0">
          <p className="text-[14px] font-semibold text-[#130D10] truncate">{project.name}</p>
          <p className="text-[12px] text-[#8A847B] truncate">{project.client_name}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-2 bg-[#F0EDE0] rounded-full overflow-hidden max-w-[220px]">
            <div className="h-full bg-[#00846F] rounded-full" style={{ width: `${showMoney ? cobradoPct : progress}%` }} />
          </div>
        </div>
        <p className="text-[13px] font-medium text-[#130D10] w-[120px] text-right shrink-0">{showMoney ? formatCurrency(total || cobrado, project.currency) : `${progress}%`}</p>
        <div className="w-[110px] flex justify-end shrink-0"><StatusBadgeNeutral project={project} /></div>
        <IconChevronRight size={16} className="text-[#C4BFB4] shrink-0" />
      </div>
    </Link>
  )
}

function StatusBadgeNeutral({ project }: { project: Project }) {
  const ms = mockMilestones[project.id] || []
  const overdue = ms.some(m => m.status === 'vencido')
  if (project.status === 'completado')
    return <span className="bg-[#E5F3EF] text-[#00846F] text-[11px] font-semibold px-2.5 py-1 rounded-full">Completado</span>
  if (overdue)
    return <span className="bg-[#FFE3DC] text-[#C23A22] text-[11px] font-semibold px-2.5 py-1 rounded-full">Vencido</span>
  if (project.status === 'en_pausa')
    return <span className="bg-[#F2EFE2] text-[#6B655C] text-[11px] font-semibold px-2.5 py-1 rounded-full">En pausa</span>
  return <span className="bg-[#FBEFC0] text-[#7A6410] text-[11px] font-semibold px-2.5 py-1 rounded-full">En curso</span>
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="col-span-3 py-20 flex flex-col items-center gap-3 text-center">
      <div className="w-16 h-16 bg-[#F2EFE2] rounded-2xl flex items-center justify-center">
        <IconFolder size={28} className="text-[#A8A29A]" stroke={1.5} />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[#130D10]">No hay proyectos</p>
        <p className="text-[13px] text-[#8A847B] mt-0.5">Creá tu primer proyecto para empezar</p>
      </div>
      <button onClick={onNew} className="flex items-center gap-2 bg-[#130D10] text-white text-sm font-semibold pl-4 pr-5 py-2.5 rounded-full hover:bg-[#2A2227] transition-colors mt-1">
        <IconPlus size={15} stroke={2.2} /> Nuevo proyecto
      </button>
    </div>
  )
}
