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
    industrial: 'bg-orange-100 text-orange-700',
    proveedor: 'bg-blue-100 text-blue-700',
    colaborador: 'bg-purple-100 text-purple-700',
    cliente: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#130D10]">Estudio</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Visión global cross-proyecto</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E5E5E3] rounded-lg">
          {[{ k: 'control', label: 'Control' }, { k: 'directorio', label: 'Directorio' }, { k: 'equipo', label: 'Equipo' }].map(s => (
            <button
              key={s.k}
              onClick={() => setSection(s.k as typeof section)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-md transition-colors',
                section === s.k ? 'bg-[#F5D242] text-[#130D10] font-medium' : 'text-[#6B6B6B] hover:text-[#130D10]'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'control' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center p-1 bg-white border border-[#E5E5E3] rounded-lg gap-0.5">
              {[{ k: 'kanban', icon: IconLayoutKanban, label: 'Kanban' }, { k: 'lista', icon: IconList, label: 'Lista' }].map(({ k, icon: Icon, label }) => (
                <button key={k} onClick={() => setView(k as typeof view)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
                    view === k ? 'bg-[#F5D242] text-[#130D10] font-medium' : 'text-[#6B6B6B] hover:text-[#130D10]'
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
                  <div key={col.status} className="bg-white border border-[#E5E5E3] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9B9B9B]">{col.label}</h3>
                      <span className="text-xs bg-[#F0F0EE] text-[#6B6B6B] px-2 py-0.5 rounded-full">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map(task => {
                        const phase = getPhase(task.phase_id)
                        return (
                          <div key={task.id} className="bg-[#F9F9F8] border border-[#E5E5E3] rounded-lg p-3">
                            {phase && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md mb-1.5 inline-block" style={{ backgroundColor: phase.color + '20', color: phase.color }}>
                                {phase.name}
                              </span>
                            )}
                            <p className="text-sm text-[#130D10] font-medium">{task.title}</p>
                            <p className="text-[10px] text-[#9B9B9B] mt-1">{(task as any).project_name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-[#9B9B9B] mt-1">
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
            <div className="bg-white border border-[#E5E5E3] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E5E3] bg-[#F9F9F8]">
                    {['Tarea', 'Proyecto', 'Fase', 'Asignado', 'Vencimiento', 'Estado'].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#9B9B9B] px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0EE]">
                  {allTasks.map(task => {
                    const phase = getPhase(task.phase_id)
                    const statusColors: Record<TaskStatus, string> = { todo: 'bg-gray-100 text-gray-600', en_progreso: 'bg-blue-100 text-blue-700', completado: 'bg-green-100 text-green-700' }
                    const statusLabels: Record<TaskStatus, string> = { todo: 'Por hacer', en_progreso: 'En progreso', completado: 'Completado' }
                    return (
                      <tr key={task.id} className="hover:bg-[#F9F9F8]">
                        <td className="px-4 py-3 text-sm text-[#130D10]">{task.title}</td>
                        <td className="px-4 py-3 text-xs text-[#6B6B6B]">{(task as any).project_name}</td>
                        <td className="px-4 py-3">
                          {phase && <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: phase.color + '20', color: phase.color }}>{phase.name}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#6B6B6B]">{task.assigned_name || '—'}</td>
                        <td className="px-4 py-3 text-xs text-[#6B6B6B]">{task.due_date ? formatDate(task.due_date) : '—'}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-md ${statusColors[task.status]}`}>{statusLabels[task.status]}</span></td>
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
                <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
                <input className="pl-8 pr-4 py-2 text-sm border border-[#E5E5E3] rounded-lg bg-white w-56 focus:outline-none focus:ring-1 focus:ring-[#F5D242]" placeholder="Buscar contacto..." value={search} onChange={e => setSearch(e.target.value)} />
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

          <div className="bg-white border border-[#E5E5E3] rounded-xl overflow-hidden">
            <div className="divide-y divide-[#F0F0EE]">
              {filteredContacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9F9F8] cursor-pointer" onClick={() => setSelectedContact(c)}>
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#130D10]">{c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${categoryColors[c.category]}`}>{getContactCategoryLabel(c.category)}</span>
                    </div>
                    <p className="text-[10px] text-[#9B9B9B] mt-0.5">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>
                  </div>
                  {c.rating && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        s <= (c.rating || 0)
                          ? <IconStarFilled key={s} size={11} className="text-[#F5D242]" />
                          : <IconStar key={s} size={11} className="text-[#E5E5E3]" />
                      ))}
                    </div>
                  )}
                  {c.projects && c.projects.length > 0 && (
                    <span className="text-[10px] text-[#9B9B9B] shrink-0">{c.projects.length} proyecto{c.projects.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              ))}
              {filteredContacts.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[#9B9B9B]">No se encontraron contactos.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {section === 'equipo' && (
        <div className="bg-white border border-[#E5E5E3] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#130D10]">Equipo del estudio</h2>
            <Button size="sm" variant="primary"><IconPlus size={13} /> Invitar colaborador</Button>
          </div>
          <div className="divide-y divide-[#F0F0EE]">
            {[{ name: 'Isabel García', role: 'Propietario', projects: mockProjects.map(p => p.name) }].map(m => (
              <div key={m.name} className="flex items-center gap-3 py-3">
                <Avatar name={m.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#130D10]">{m.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{m.role}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {m.projects.slice(0, 2).map(p => (
                    <span key={p} className="text-[10px] bg-[#F0F0EE] text-[#6B6B6B] px-2 py-0.5 rounded-md">{p}</span>
                  ))}
                  {m.projects.length > 2 && <span className="text-[10px] bg-[#F0F0EE] text-[#6B6B6B] px-2 py-0.5 rounded-md">+{m.projects.length - 2}</span>}
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
            <div className="px-5 py-4 border-b border-[#E5E5E3] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#130D10]">{selectedContact.name}</h3>
              <button onClick={() => setSelectedContact(null)} className="text-[#6B6B6B] hover:text-[#130D10]"><IconX size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedContact.name} size="lg" />
                <span className={`text-xs px-2 py-0.5 rounded-md ${categoryColors[selectedContact.category]}`}>
                  {getContactCategoryLabel(selectedContact.category)}
                </span>
              </div>
              <div className="space-y-3">
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconPhone size={14} className="text-[#9B9B9B]" stroke={1.5} />
                    {selectedContact.phone}
                  </div>
                )}
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconMail size={14} className="text-[#9B9B9B]" stroke={1.5} />
                    {selectedContact.email}
                  </div>
                )}
                {selectedContact.address && (
                  <div className="flex items-center gap-2 text-sm text-[#130D10]">
                    <IconMapPin size={14} className="text-[#9B9B9B]" stroke={1.5} />
                    {selectedContact.address}
                  </div>
                )}
              </div>
              {selectedContact.rating && (
                <div>
                  <p className="text-xs text-[#9B9B9B] mb-1.5">Calificación</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      s <= (selectedContact.rating || 0)
                        ? <IconStarFilled key={s} size={16} className="text-[#F5D242]" />
                        : <IconStar key={s} size={16} className="text-[#E5E5E3]" />
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.projects && selectedContact.projects.length > 0 && (
                <div>
                  <p className="text-xs text-[#9B9B9B] mb-1.5">Proyectos</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContact.projects.map(p => (
                      <span key={p} className="text-xs bg-[#F0F0EE] text-[#6B6B6B] px-2 py-1 rounded-lg">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.notes && (
                <div>
                  <p className="text-xs text-[#9B9B9B] mb-1.5">Notas</p>
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
