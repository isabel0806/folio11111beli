'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockBitacora } from '@/lib/mock-data'
import { IconPlus, IconPhoto, IconFileText } from '@tabler/icons-react'
import { cn } from '@/lib/cn'
import type { BitacoraType } from '@/lib/mock-data'

const typeConfig: Record<BitacoraType, { label: string; dot: string; badgeDot: string; badgeBg: string; badgeText: string; dotBorder: string }> = {
  visita: { label: 'Visita de obra', dot: '#FF5738', badgeDot: '#FF5738', badgeBg: 'bg-[#FFEDE9]', badgeText: 'text-[#C23A22]', dotBorder: '#FFEFE9' },
  parte: { label: 'Parte de obra', dot: '#7FB0E8', badgeDot: '#7FB0E8', badgeBg: 'bg-[#EAF1FA]', badgeText: 'text-[#3F6FA3]', dotBorder: '#EAF1FA' },
  observacion: { label: 'Observación', dot: '#FFABCF', badgeDot: '#E06FA0', badgeBg: 'bg-[#FDEAF1]', badgeText: 'text-[#B14E7C]', dotBorder: '#FDEAF1' },
}

const photoThumbs = ['bg-[#E4F1EC]', 'bg-[#FFEDE9]', 'bg-[#EAF1FA]']
const photoIconColor = ['#00846F', '#FF5738', '#7FB0E8']

const filters: { k: 'todas' | BitacoraType; label: string }[] = [
  { k: 'todas', label: 'Todas' },
  { k: 'visita', label: 'Visitas de obra' },
  { k: 'parte', label: 'Partes de obra' },
  { k: 'observacion', label: 'Observaciones' },
]

export default function BitacoraPage() {
  const { id } = useParams() as { id: string }
  const entries = mockBitacora[id] || []
  const [filter, setFilter] = useState<'todas' | BitacoraType>('todas')

  const visible = filter === 'todas' ? entries : entries.filter(e => e.type === filter)

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(f => {
            const active = filter === f.k
            return (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={cn(
                  'rounded-full py-1.5 px-3.5 text-[13px] border transition-colors',
                  active
                    ? 'bg-[#FFEDE9] border-[#FF5738] font-semibold text-[#C23A22]'
                    : 'border-[#ECE8D6] font-medium text-[#8A847B] hover:text-[#130D10]'
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <button className="flex items-center gap-2 rounded-full py-2.5 px-4.5 bg-[#FF5738] hover:bg-[#C23A22] text-[#FFFEF0] text-sm font-semibold transition-colors shrink-0">
          <IconPlus size={16} stroke={2.2} /> Nueva entrada
        </button>
      </div>

      {/* Feed */}
      {visible.length === 0 ? (
        <p className="text-sm text-[#A8A29A]">No hay entradas para este filtro.</p>
      ) : (
        <div className="flex flex-col">
          {visible.map((entry, i) => {
            const tc = typeConfig[entry.type]
            const isLast = i === visible.length - 1
            return (
              <div key={entry.id} className="flex gap-6">
                {/* Date column */}
                <div className="flex flex-col items-center w-16 shrink-0 pt-1 gap-2">
                  <div className="flex flex-col items-center">
                    <span className="font-serif text-[28px] leading-none text-[#130D10]">{entry.day}</span>
                    <span className="text-[11px] font-semibold tracking-[0.08em] text-[#8A847B]">{entry.month}</span>
                  </div>
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border-[3px]"
                    style={{ backgroundColor: tc.dot, borderColor: tc.dotBorder }}
                  />
                  {!isLast && <span className="w-0.5 grow min-h-10 bg-[#ECE9DA]" />}
                </div>

                {/* Card */}
                <div className="flex flex-col grow basis-0 mb-6 rounded-[18px] py-5.5 px-6 gap-4 bg-white border border-[#ECE8D6]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9.5 h-9.5 shrink-0 rounded-full text-[13px] font-semibold" style={{ backgroundColor: entry.avatar_color, color: entry.avatar_text }}>
                        {entry.initials}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-[#130D10]">{entry.author}</span>
                        <span className="text-xs text-[#8A847B]">{entry.role} · {entry.time}</span>
                      </div>
                    </div>
                    <div className={cn('flex items-center rounded-full py-1 px-3 gap-1.5', tc.badgeBg)}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tc.badgeDot }} />
                      <span className={cn('text-xs font-semibold', tc.badgeText)}>{tc.label}</span>
                    </div>
                  </div>

                  <p className="text-[14px] leading-[1.6] text-[#4A453F]">{entry.text}</p>

                  {entry.photos && (
                    <div className="flex gap-2.5">
                      {photoThumbs.map((bg, idx) => (
                        <div key={idx} className={cn('w-30 h-21 flex items-center justify-center rounded-xl shrink-0', bg)}>
                          <IconPhoto size={22} stroke={1.6} style={{ color: photoIconColor[idx] }} />
                        </div>
                      ))}
                      {entry.photos > 3 && (
                        <div className="w-30 h-21 flex flex-col items-center justify-center rounded-xl gap-0.5 shrink-0 bg-[#F4F1E3] border border-dashed border-[#D6D1C2]">
                          <span className="font-serif text-base text-[#8A847B]">+{entry.photos - 3}</span>
                          <span className="text-[10px] text-[#A8A29A]">fotos</span>
                        </div>
                      )}
                    </div>
                  )}

                  {entry.attachment && (
                    <div className="flex items-center self-start rounded-[11px] py-2 px-3.5 gap-2.5 bg-[#FBFAF3] border border-[#ECE8D6]">
                      <IconFileText size={18} stroke={1.8} className="text-[#3F6FA3]" />
                      <span className="text-[13px] font-medium text-[#130D10]">{entry.attachment.name}</span>
                      <span className="text-xs text-[#A8A29A]">{entry.attachment.size}</span>
                    </div>
                  )}

                  <div className="flex items-center pt-0.5 gap-2 flex-wrap">
                    {entry.tags.map(tag => (
                      <span key={tag} className="rounded-full py-1 px-2.75 bg-[#F4F1E3] text-[11px] font-medium text-[#6B655C]">{tag}</span>
                    ))}
                    {entry.requires_response && (
                      <span className="flex items-center rounded-full py-1 px-2.75 gap-1.5 bg-[#FFF6D9]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5D242]" />
                        <span className="text-[11px] font-semibold text-[#8A7220]">Requiere respuesta</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
