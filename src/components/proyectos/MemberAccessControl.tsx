'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { IconCheck, IconLock, IconAdjustmentsHorizontal } from '@tabler/icons-react'
import {
  PROJECT_AREAS, ALL_AREAS, OPERATIVO_AREAS, getAreas, setAreas, summarize, TONE_STYLE,
} from '@/lib/project-access'

export function MemberAccessControl({
  projectId, memberId, memberName, fallback, editable,
}: {
  projectId: string
  memberId: string
  memberName: string
  fallback: string[]
  editable: boolean
}) {
  const [areas, setAreasState] = useState<string[]>(fallback)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(fallback)

  useEffect(() => { setAreasState(getAreas(projectId, memberId, fallback)) }, [projectId, memberId, fallback])

  const s = summarize(areas)
  const tone = TONE_STYLE[s.tone]

  const openEditor = () => { setDraft(getAreas(projectId, memberId, fallback)); setOpen(true) }
  const toggle = (id: string) => setDraft(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id])
  const save = () => {
    const ordered = ALL_AREAS.filter(a => draft.includes(a))
    setAreas(projectId, memberId, ordered)
    setAreasState(ordered)
    setOpen(false)
  }

  const Badge = (
    <span className={cn('flex items-center self-start rounded-full py-1 pl-2.5 pr-2.5 gap-1.5', tone.bg)}>
      <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: tone.dot }} />
      <span className={cn('text-[11px] font-semibold', tone.text)}>{s.label}</span>
    </span>
  )

  if (!editable) return Badge

  return (
    <>
      <button onClick={openEditor} className={cn('flex items-center self-start rounded-full py-1 pl-2.5 pr-2 gap-1.5 transition-colors hover:brightness-95', tone.bg)}>
        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: tone.dot }} />
        <span className={cn('text-[11px] font-semibold', tone.text)}>{s.label}</span>
        <IconAdjustmentsHorizontal size={12} stroke={2} className={cn('opacity-70', tone.text)} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Permisos de ${memberName}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={save}><IconCheck size={14} /> Guardar permisos</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#6B655C]">Elegí qué puede ver esta persona <span className="font-semibold text-[#130D10]">en este proyecto</span>.</p>

          {/* Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A]">Atajos</span>
            <button onClick={() => setDraft(ALL_AREAS)} className="rounded-full border border-[#ECE8D6] px-3 py-1 text-[12px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">Todo</button>
            <button onClick={() => setDraft(OPERATIVO_AREAS)} className="rounded-full border border-[#ECE8D6] px-3 py-1 text-[12px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">Operativo</button>
            <button onClick={() => setDraft([])} className="rounded-full border border-[#ECE8D6] px-3 py-1 text-[12px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">Nada</button>
          </div>

          {/* Area toggles */}
          <div className="flex flex-col rounded-[14px] border border-[#ECE8D6] overflow-hidden">
            {PROJECT_AREAS.map((a, i) => {
              const on = draft.includes(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={cn('flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FBFAF3]', i > 0 && 'border-t border-[#F2EFE2]')}
                >
                  <span className="grow min-w-0">
                    <span className="block text-[14px] font-medium text-[#130D10]">{a.label}</span>
                    <span className="block text-[11.5px] text-[#A8A29A] leading-snug">{a.desc}</span>
                  </span>
                  <span className={cn('relative w-9 h-5 rounded-full shrink-0 transition-colors', on ? 'bg-[#00846F]' : 'bg-[#D8D2C2]')}>
                    <span className={cn('absolute top-0.5 size-4 rounded-full bg-white transition-all', on ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                </button>
              )
            })}
          </div>

          <p className="flex items-center gap-1.5 text-[11.5px] text-[#A8A29A]">
            <IconLock size={12} stroke={1.8} /> Config. del proyecto queda siempre solo para administradores.
          </p>
        </div>
      </Modal>
    </>
  )
}
