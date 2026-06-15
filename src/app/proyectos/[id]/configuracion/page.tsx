'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockProjects } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { IconPlus, IconMail, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react'
import type { ProjectMember, MemberRole } from '@/lib/types'

export default function ConfiguracionPage() {
  const { id } = useParams() as { id: string }
  const project = mockProjects.find(p => p.id === id)
  const [members, setMembers] = useState<ProjectMember[]>([
    { id: 'pm1', project_id: id, user_id: 'u1', role: 'admin', name: 'Isabel García', email: 'isabel@thegiftcardcafe.com' },
  ])
  const [showInvite, setShowInvite] = useState(false)
  const [clientPortalActive, setClientPortalActive] = useState(false)
  const [clientEmail, setClientEmail] = useState(project?.client_email || '')
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'editor' })

  if (!project) return null

  const roleLabels: Record<MemberRole, string> = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }
  const roleColors: Record<MemberRole, string> = { admin: 'bg-[#FBF3D6] text-[#7A6410]', editor: 'bg-[#EAF2FB] text-[#3F6FA3]', viewer: 'bg-[#F2EFE2] text-[#6B655C]' }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Project info */}
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <h2 className="font-serif text-[19px] text-[#130D10] mb-4">Información del proyecto</h2>
        <div className="space-y-4">
          <Input label="Nombre del proyecto" defaultValue={project.name} />
          <Select
            label="Tipo de proyecto"
            defaultValue={project.type}
            options={[
              { value: 'arquitectura', label: 'Arquitectura' },
              { value: 'diseño_grafico', label: 'Diseño gráfico' },
              { value: 'event_planning', label: 'Event Planning' },
              { value: 'consultoria', label: 'Consultoría' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Moneda"
              defaultValue={project.currency}
              options={[{ value: 'ARS', label: 'ARS — Pesos' }, { value: 'USD', label: 'USD — Dólares' }]}
            />
            <Select
              label="Modalidad de precio"
              defaultValue={project.pricing_mode}
              options={[
                { value: 'proyecto', label: 'Por proyecto' },
                { value: 'hora', label: 'Por hora' },
                { value: 'ambos', label: 'Ambos' },
              ]}
            />
          </div>
          {(project.pricing_mode === 'proyecto' || project.pricing_mode === 'ambos') && (
            <Input label="Monto total" type="number" defaultValue={project.total_amount?.toString()} />
          )}
          {(project.pricing_mode === 'hora' || project.pricing_mode === 'ambos') && (
            <Input label="Tarifa por hora" type="number" defaultValue={project.hourly_rate?.toString()} />
          )}
          <Button variant="primary">Guardar cambios</Button>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[19px] text-[#130D10]">Equipo del proyecto</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowInvite(true)}>
            <IconPlus size={13} /> Invitar colaborador
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2.5 px-3 rounded-[14px] bg-white border border-[#ECE8D6]">
              <Avatar name={m.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#130D10]">{m.name}</p>
                <p className="text-[11px] text-[#A8A29A]">{m.email}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColors[m.role]}`}>{roleLabels[m.role]}</span>
              {m.role !== 'admin' && (
                <button className="p-1.5 text-[#A8A29A] hover:text-[#C23A22] transition-colors">
                  <IconTrash size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Client portal */}
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-[19px] text-[#130D10]">Portal del cliente</h2>
            <p className="text-xs text-[#8A847B] mt-1">El cliente puede ver el avance del proyecto en modo solo lectura</p>
          </div>
          <button onClick={() => setClientPortalActive(v => !v)} className="text-[#C4BFB4]">
            {clientPortalActive
              ? <IconToggleRight size={28} className="text-[#00846F]" />
              : <IconToggleLeft size={28} />
            }
          </button>
        </div>
        {clientPortalActive && (
          <div className="space-y-4 pt-4 border-t border-[#ECE8D6]">
            <Input
              label="Email del cliente"
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="cliente@email.com"
            />
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm">
                <IconMail size={13} /> Enviar invitación
              </Button>
              <span className="text-xs text-[#A8A29A]">Último acceso: nunca</span>
            </div>
          </div>
        )}
      </section>

      {/* Invite modal */}
      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invitar colaborador"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => {
              if (!inviteForm.email) return
              setMembers(prev => [...prev, {
                id: `pm${Date.now()}`, project_id: id, user_id: `u${Date.now()}`,
                role: inviteForm.role as MemberRole, name: inviteForm.email.split('@')[0], email: inviteForm.email,
              }])
              setShowInvite(false)
              setInviteForm({ email: '', role: 'editor' })
            }}>Invitar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Email *" type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="colaborador@email.com" />
          <Select
            label="Rol"
            value={inviteForm.role}
            onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
            options={[{ value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }]}
          />
        </div>
      </Modal>
    </div>
  )
}
