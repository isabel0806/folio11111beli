'use client'
import { useParams } from 'next/navigation'
import { mockTeam, mockProviders } from '@/lib/mock-data'
import { IconPlus, IconMail, IconPhone, IconShieldLock } from '@tabler/icons-react'
import { cn } from '@/lib/cn'
import { useRole } from '@/lib/use-role'
import { MemberAccessControl } from '@/components/proyectos/MemberAccessControl'
import type { AccessLevel } from '@/lib/project-access'

export default function EquipoPage() {
  const { id } = useParams() as { id: string }
  const { role } = useRole()
  const isAdmin = role === 'admin'
  const team = mockTeam[id] || []
  const providers = mockProviders[id] || []
  // Default access by their tag: the "Responsable" gets full, the rest operativo.
  const defaultAccess = (tag: string): AccessLevel => (tag.toLowerCase().includes('responsable') ? 'full' : 'operativo')

  return (
    <div className="flex flex-col gap-7">
      {/* Equipo del proyecto */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-serif text-[19px] text-[#130D10]">Equipo del proyecto</h2>
            <p className="text-[13px] text-[#8A847B] mt-0.5">
              {team.length} personas asignadas
              {isAdmin
                ? ' · tocá el acceso de cada persona para controlar qué ve en este proyecto'
                : ' · el nivel de acceso lo gestiona un administrador'}
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-full py-2 px-3.5 bg-white border border-[#ECE8D6] text-[13px] font-semibold text-[#130D10] hover:bg-[#FBFAF3] transition-colors">
            <IconPlus size={15} stroke={2} /> Invitar persona
          </button>
        </div>

        {isAdmin && (
          <div className="flex items-start gap-2.5 mb-4 px-4 py-3 rounded-[14px] bg-[#EAF2FB] border border-[#CFE0F3]">
            <IconShieldLock size={16} className="text-[#3F6FA3] shrink-0 mt-0.5" stroke={1.8} />
            <p className="text-[12.5px] text-[#3F6FA3] leading-snug">
              Como administrador podés definir el acceso de cada persona a <span className="font-semibold">este proyecto</span>: completo (con finanzas), operativo (sin finanzas) o sin acceso.
            </p>
          </div>
        )}
        <div className="grid grid-cols-4 gap-4">
          {team.map(m => (
            <div key={m.id} className="flex flex-col gap-3.5 rounded-[18px] p-5.5 bg-white border border-[#ECE8D6]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0 rounded-full size-12 text-base font-semibold" style={{ backgroundColor: m.avatar_color, color: m.avatar_text }}>
                  {m.initials}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[15px] font-semibold text-[#130D10] truncate">{m.name}</span>
                  <span className="text-[13px] text-[#8A847B] truncate">{m.role}</span>
                </div>
              </div>
              <MemberAccessControl projectId={id} memberId={m.id} fallback={defaultAccess(m.tag_label)} editable={isAdmin} />
              <div className="h-px bg-[#F2EFE2]" />
              <div className="flex items-center gap-2">
                {m.contact_type === 'email'
                  ? <IconMail size={15} stroke={1.8} className="text-[#A8A29A] shrink-0" />
                  : <IconPhone size={15} stroke={1.8} className="text-[#A8A29A] shrink-0" />}
                <span className="text-[13px] text-[#6B655C] truncate">{m.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proveedores e industriales */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-serif text-[19px] text-[#130D10]">Proveedores e industriales</h2>
            <p className="text-[13px] text-[#8A847B] mt-0.5">{providers.length} proveedores</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-full py-2 px-3.5 bg-white border border-[#ECE8D6] text-[13px] font-semibold text-[#130D10] hover:bg-[#FBFAF3] transition-colors">
            <IconPlus size={15} stroke={2} /> Agregar proveedor
          </button>
        </div>
        <div className="flex flex-col rounded-[18px] overflow-hidden bg-white border border-[#ECE8D6]">
          <div className="flex items-center py-3 px-6 bg-[#FBFAF3] border-b border-[#F2EFE2]">
            <span className="grow basis-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">Proveedor</span>
            <span className="w-50 shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">Rubro</span>
            <span className="w-45 shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">Contacto</span>
            <span className="w-32 shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">Estado</span>
          </div>
          {providers.map((p, i) => (
            <div key={p.id} className={cn('flex items-center py-3.5 px-6', i < providers.length - 1 && 'border-b border-[#F2EFE2]')}>
              <div className="grow basis-0 flex items-center gap-3 min-w-0">
                <div className={cn('flex items-center justify-center w-9.5 h-9.5 shrink-0 rounded-[10px] font-serif text-[15px]', p.icon_bg, p.icon_text)}>
                  {p.initial}
                </div>
                <span className="text-sm font-semibold text-[#130D10] truncate">{p.name}</span>
              </div>
              <span className="w-50 shrink-0 text-[13px] text-[#6B655C]">{p.rubro}</span>
              <span className="w-45 shrink-0 text-[13px] text-[#6B655C] truncate">{p.contact}</span>
              <div className="w-32 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.status_dot }} />
                  <span className={cn('text-[13px] font-medium', p.status_text)}>{p.status_label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
