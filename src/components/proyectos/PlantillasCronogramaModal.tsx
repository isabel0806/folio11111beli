'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  IconHome, IconBuildingSkyscraper, IconBuildingStore, IconLayoutGrid,
  IconCheck, IconInfoCircle,
} from '@tabler/icons-react'

interface Template {
  id: string
  name: string
  meta: string
  icon: typeof IconHome
  blank?: boolean
  segs: { w: number; c: string }[]
}

const templates: Template[] = [
  {
    id: 'vivienda', name: 'Vivienda unifamiliar', meta: '5 fases · 11 etapas · ~14 meses', icon: IconHome,
    segs: [{ w: 18, c: '#FF5738' }, { w: 18, c: '#7FB0E8' }, { w: 18, c: '#D5D25D' }, { w: 36, c: '#00846F' }, { w: 10, c: '#F5D242' }],
  },
  {
    id: 'edificio', name: 'Edificio en altura', meta: '6 fases · 18 etapas · ~28 meses', icon: IconBuildingSkyscraper,
    segs: [{ w: 15, c: '#FF5738' }, { w: 23, c: '#7FB0E8' }, { w: 15, c: '#D5D25D' }, { w: 39, c: '#00846F' }, { w: 8, c: '#F5D242' }],
  },
  {
    id: 'local', name: 'Local comercial / interiorismo', meta: '4 fases · 8 etapas · ~6 meses', icon: IconBuildingStore,
    segs: [{ w: 25, c: '#FF5738' }, { w: 25, c: '#7FB0E8' }, { w: 38, c: '#00846F' }, { w: 12, c: '#F5D242' }],
  },
  {
    id: 'blanco', name: 'Empezar en blanco', meta: 'Sin etapas · armás las fases a mano', icon: IconLayoutGrid, blank: true,
    segs: [{ w: 33, c: '#E0DCCE' }, { w: 33, c: '#E0DCCE' }, { w: 33, c: '#E0DCCE' }],
  },
]

export function PlantillasCronogramaModal({
  open, onClose, projectName, onApply,
}: {
  open: boolean
  onClose: () => void
  projectName: string
  onApply: (templateName: string) => void
}) {
  const [selected, setSelected] = useState('vivienda')
  const current = templates.find(t => t.id === selected)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo cronograma"
      size="lg"
      footer={
        <>
          <span className="mr-auto flex items-center gap-1.5 text-[12px] text-[#8A847B]">
            <IconInfoCircle size={15} stroke={1.7} className="text-[#A8A29A]" />
            {current?.blank
              ? <>Vas a empezar de cero en <span className="font-medium text-[#6B655C]">{projectName}</span>.</>
              : <>Vas a aplicarla a <span className="font-medium text-[#6B655C]">{projectName}</span>. Después la podés ajustar.</>}
          </span>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { onApply(current?.name || ''); onClose() }}>
            <IconCheck size={14} /> {current?.blank ? 'Empezar en blanco' : 'Usar plantilla'}
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-[#8A847B] mb-4 -mt-1">Arrancá desde una plantilla del estudio o empezá en blanco.</p>
      <div className="grid grid-cols-2 gap-3">
        {templates.map(t => {
          const Icon = t.icon
          const active = selected === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                'flex flex-col gap-3 text-left rounded-[16px] border p-4 transition-colors',
                active ? 'border-[#FF5738] bg-[#FFF8F6]' : 'border-[#ECE8D6] bg-white hover:border-[#D8D2C2]'
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('flex items-center justify-center rounded-[11px] size-10', active ? 'bg-[#FFEDE9]' : 'bg-[#FBFAF3]')}>
                  <Icon size={20} stroke={1.6} className={active ? 'text-[#C23A22]' : 'text-[#8A847B]'} />
                </span>
                <span className={cn(
                  'flex items-center justify-center rounded-full size-[22px] border-2 transition-colors',
                  active ? 'bg-[#FF5738] border-[#FF5738]' : 'border-[#D8D2C2]'
                )}>
                  {active && <IconCheck size={13} className="text-white" stroke={3} />}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-[#130D10] text-[15px]">{t.name}</span>
                <span className="text-[12.5px] text-[#8A847B]">{t.meta}</span>
              </div>
              <div className="flex w-full h-2 rounded-full overflow-clip gap-0.5">
                {t.segs.map((s, i) => (
                  <span key={i} className="h-2 rounded-[2px]" style={{ width: `${s.w}%`, backgroundColor: s.c }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
