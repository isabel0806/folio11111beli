'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { FilterTabs } from '@/components/layout/FilterTabs'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import {
  IconPlus, IconSearch, IconStar, IconStarFilled, IconPhone, IconMail,
  IconMapPin, IconX, IconLayoutKanban, IconList
} from '@tabler/icons-react'
import { mockContacts, mockTasks, mockPhases, mockProjects } from '@/lib/mock-data'
import { getContactCategoryLabel, formatDate } from '@/lib/utils'
import type { Contact, ContactCategory, Task, TaskStatus } from '@/lib/types'
import { cn } from '@/lib/cn'

const statusCols: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Por hacer' },
  { status: 'en_progreso', label: 'En progreso' },
  { status: 'completado', label: 'Completado' },
]

export default function EstudioPage() {
  const [section, setSection] = useState<'control' | 'directorio' | 'equipo'>('control')
  const [view, setView] = useState<'kanban' | 'lista'>('kanban')
  const [catFilter, setCatFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState(mockContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showNewContact, setShowNewContact] = useState(false)
  const [cForm, setCForm] = useState({ name: '', category: 'proveedor', phone: '', email: '', address: '', notes: '' })

  const allTasks = Object.entries(mockTasks).flatMap(([pid, ts]) =>
    ts.map(t => ({ ...t, project_name: mockProjects.find(p => p.id === pid)?.name || '' }))
  )
  const phases = Object.values(mockPhases).flat()

  const getPhase = (phaseId?: string) => phases.find(p => p.id === phaseId)

  const filteredContacts = contacts.filter(c => {
    const matchCat = catFilter === 'todos' || c.category === catFilter
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleAddContact = () => {
    if (!cForm.name) return
    setContacts(prev => [...prev, {
      id: `con${Date.now()}`, studio_id: 's1', name: cForm.name,
      category: cForm.category as ContactCategory, phone: cForm.phone || undefined,
      email: cForm.email || undefined, address: cForm.address || undefined,
      notes: cForm.notes || undefined, created_at: new Date().toISOString(),
    }])
    setShowNewContact(false)
    setCForm({ name: '', category: 'proveedor', phone: '', email: '', address: '', notes: '' })
  }

  const categoryColors: Record<ContactCategory, string> = {
    industrial: 'bg-[#F6F5E2] text-[#7E7B2E]',
    proveedor: 'bg-[#EAF2FB] text-[#3F6FA3]',
    colaborador: 'bg-[#FDECF3] text-[#B14E7C]',
    cliente: 'bg-[#E5F3EF] text-[#00846F]',
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Estudio"
        description="Visión global cross-proyecto"
        actions={
          <div className="flex items-center p-1 bg-white border border-[#ECE8D6] rounded-full gap-0.5">
            {[{ k: 'control', label: 'Control' }, { k: 'directorio', label: 'Directorio' }, { k: 'equipo', label: 'Equipo' }].map(s => (
              <button
                key={s.k}
                onClick={() => setSection(s.k as typeof section)}
                className={cn(
                  'px-3.5 py-1.5 text-sm rounded-full transition-colors',
                  section === s.k ? 'bg-[#F5D242] text-[#130D10] font-semibold' : 'text-[#8A847B] hover:text-[#130D10]'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      />

      {section === 'control' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center p-1 bg-white border border-[#ECE8D6] rounded-full gap-0.5">
              {[{ k: 'kanban', icon: IconLayoutKanban, label: 'Kanban' }, { k: 'lista', icon: IconList, label: 'Lista' }].map(({ k, icon: Icon, label }) => (
                <button key={k} onClick={() => setView(k as typeof view)}
                  className={cn('flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-colors',
                    view === k ? 'bg-[#F5D242] text-[#130D10] font-semibold' : 'text-[#8A847B] hover:text-[#130D10]'
                  )}>
                  <Icon size={13} stroke={1.5} /> {label}
                </button>
              ))}
            </div>
          </div>

          {view === 'kanban' && (
            <div className="grid grid-cols-3 gap-4">
              {statusCols.map(col => {
                const colTasks = allTasks.filter(t => t.status === col.status)
                return (
                  <div key={col.status} className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[18px] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">{col.label}</h3>
                      <span className="text-xs bg-[#F2EFE2] text-[#6B655C] px-2 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map(task => {
                        const phase = getPhase(task.phase_id)
                        return (
                          <div key={task.id} className="bg-white border border-[#ECE8D6] rounded-[14px] p-3">
                            {phase && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-1.5 inline-block" style={{ backgroundColor: phase.color + '20', color: phase.color }}>
                                {phase.name}
                              </span>
                            )}
                            <p className="text-sm text-[#130D10] font-medium">{task.title}</p>
                            <p className="text-[10px] text-[#A8A29A] mt-1">{(task as any).project_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#A8A29A] mt-1">
                              {task.due_date && <span>{formatDate(task.due_date)}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'lista' && (
            <div className="bg-white border border-[#ECE8D6] rounded-[18px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#ECE8D6] bg-[#FBFAF3]">
                    {['Tarea', 'Proyecto', 'Fase', 'Asignado', 'Vencimiento', 'Estado'].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8A29A] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE0]">
                  {allTasks.map(task => {
                    const phase = getPhase(task.phase_id)
                    const statusColors: Record<TaskStatus, string> = { todo: 'bg-[#F2EFE2] text-[#6B655C]', en_progreso: 'bg-[#EAF2FB] text-[#3F6FA3]', completado: 'bg-[#E5F3EF] text-[#00846F]' }
                    const statusLabels: Record<TaskStatus, string> = { todo: 'Por hacer', en_progreso: 'En progreso', completado: 'Completado' }
                    return (
                      <tr key={task.id} className="hover:bg-[#FBFAF3]">
                        <td className="px-4 py-3 text-sm text-[#130D10]">{task.title}</td>
                        <td className="px-4 py-3 text-xs text-[#8A847B]">{(task as any).project_name}</td>
                        <td className="px-4 py-3">
                          {phase && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: phase.color + '20', color: phase.color }}>{phase.name}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#8A847B]">{task.assigned_name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-[#8A847B]">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>{statusLabels[task.status]}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {section === 'directorio' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <div className="relative">
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
                <input className="pl-8 pr-4 py-2 text-sm border border-[#ECE8D6] rounded-full bg-white w-56 focus:outline-none focus:ring-1 focus:ring-[#F5D242]" placeholder="Buscar contacto..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <FilterTabs
                tabs={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'industrial', label: 'Industrial' },
                  { value: 'proveedor', label: 'Proveedor' },
                  { value: 'colaborador', label: 'Colaborador' },
                  { value: 'cliente', label: 'Cliente' },
                ]}
                active={catFilter}
                onChange={setCatFilter}
              />
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowNewContact(true)}>
              <IconPlus size={13} /> Nuevo contacto
            </Button>
          </div>

          <div className="bg-white border border-[#ECE8D6] rounded-[18px] overflow-hidden">
            <div className="divide-y divide-[#F0EDE0]">
              {filteredContacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#FBFAF3] cursor-pointer" onClick={() => setSelectedContact(c)}>
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#130D10]">{c.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[c.category]}`}>{getContactCategoryLabel(c.category)}</span>
                    </div>
                    <p className="text-[10px] text-[#A8A29A] mt-0.5">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>
                  </div>
                  {c.rating && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        s <= (c.rating || 0)
                          ? <IconStarFilled key={s} size={11} className="text-[#F5D242]" />
                          : <IconStar key={s} size={11} className="text-[#D8D2C2]" />
                      ))}
                    </div>
                  )}
                  {c.projects && c.projects.length > 0 && (
                    <span className="text-[10px] text-[#A8A29A] shrink-0">{c.projects.length} proyecto{c.projects.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[#A8A29A]">No se encontraron contactos.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {section === 'equipo' && (
        <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[19px] text-[#130D10]">Equipo del estudio</h2>
            <Button size="sm" variant="primary"><IconPlus size={13} /> Invitar colaborador</Button>
          </div>
          <div className="flex flex-col gap-2">
            {[{ name: 'Isabel García', role: 'Propietario', projects: mockProjects.map(p => p.name) }].map(m => (
              <div key={m.name} className="flex items-center gap-3 py-2.5 px-3 rounded-[14px] bg-white border border-[#ECE8D6]">
                <Avatar name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#130D10]">{m.name}</p>
                  <p className="text-xs text-[#8A847B]">{m.role}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {m.projects.slice(0, 2).map(p => (
                    <span key={p} className="text-[10px] bg-[#F2EFE2] text-[#6B655C] px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                  {m.projects.length > 2 && <span className="text-[10px] bg-[#F2EFE2] text-[#6B655C] px-2 py-0.5 rounded-full">+{m.projects.length - 2}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact detail panel */}
      {selectedContact && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setSelectedContact(null)}>
          <div className="flex-1 bg-black/20" />
          <div className="w-96 bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#ECE8D6] flex items-center justify-between">
              <h3 className="font-serif text-[19px] text-[#130D10]">{selectedContact.name}</h3>
              <button onClick={() => setSelectedContact(null)} className="text-[#8A847B] hover:text-[#130D10] p-1 rounded-full hover:bg-[#FBFAF3]"><IconX size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedContact.name} size="lg" />
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[selectedContact.category]}`}>
                  {getContactCategoryLabel(selectedContact.category)}
                </span>
              </div>
              <div className="space-y-3">
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconPhone size={14} className="text-[#A8A29A]" stroke={1.5} />
                    {selectedContact.phone}
                  </div>
                )}
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconMail size={14} className="text-[#A8A29A]" stroke={1.5} />
                    {selectedContact.email}
                  </div>
                )}
                {selectedContact.address && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconMapPin size={14} className="text-[#A8A29A]" stroke={1.5} />
                    {selectedContact.address}
                  </div>
                )}
              </div>
              {selectedContact.rating && (
                <div>
                  <p className="text-xs text-[#A8A29A] mb-1.5">Calificación</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      s <= (selectedContact.rating || 0)
                        ? <IconStarFilled key={s} size={16} className="text-[#F5D242]" />
                        : <IconStar key={s} size={16} className="text-[#D8D2C2]" />
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.projects && selectedContact.projects.length > 0 && (
                <div>
                  <p className="text-xs text-[#A8A29A] mb-1.5">Proyectos</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContact.projects.map(p => (
                      <span key={p} className="text-xs bg-[#F2EFE2] text-[#6B655C] px-2 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.notes && (
                <div>
                  <p className="text-xs text-[#A8A29A] mb-1.5">Notas</p>
                  <p className="text-sm text-[#130D10]">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New contact modal */}
      <Modal
        open={showNewContact}
        onClose={() => setShowNewContact(false)}
        title="Nuevo contacto"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewContact(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddContact}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre *" value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del contacto" />
          <Select label="Categoría" value={cForm.category} onChange={e => setCForm(f => ({ ...f, category: e.target.value }))}
            options={[
              { value: 'industrial', label: 'Industrial' }, { value: 'proveedor', label: 'Proveedor' },
              { value: 'colaborador', label: 'Colaborador' }, { value: 'cliente', label: 'Cliente' },
            ]}
          />
          <Input label="Teléfono" value={cForm.phone} onChange={e => setCForm(f => ({ ...f, phone: e.target.value }))} placeholder="+5491155551234" />
          <Input label="Email" type="email" value={cForm.email} onChange={e => setCForm(f => ({ ...f, email: e.target.value }))} placeholder="email@ejemplo.com" />
          <Input label="Dirección" value={cForm.address} onChange={e => setCForm(f => ({ ...f, address: e.target.value }))} placeholder="Calle y número, ciudad" />
          <Textarea label="Notas" value={cForm.notes} onChange={e => setCForm(f => ({ ...f, notes: e.target.value }))} placeholder="Referencias, observaciones..." />
        </div>
      </Modal>
    </div>
  )
}
