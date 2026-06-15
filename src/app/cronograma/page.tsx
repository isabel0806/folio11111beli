'use client'
import { useState } from 'react'
import { IconFilter, IconFileDownload } from '@tabler/icons-react'
import { cn } from '@/lib/cn'

type GroupKey = 'obra' | 'proyecto' | 'iniciar'

interface MasterRow {
  name: string
  client: string
  type: string
  left: number
  width: number
  style: 'fill' | 'outline' | 'dashed'
  // fill
  fillPct?: number
  track?: string
  fill?: string
  fillText?: string
  // outline / dashed
  label?: string
  bg?: string
  border?: string
  text?: string
}

interface MasterGroup {
  key: GroupKey
  label: string
  dot: string
  text: string
  rows: MasterRow[]
}

const groups: MasterGroup[] = [
  {
    key: 'obra',
    label: 'EN OBRA',
    dot: '#00846F',
    text: 'text-[#00846F]',
    rows: [
      { name: 'Casa Palermo', client: 'Familia Rodríguez · Vivienda', type: 'Vivienda', left: 12.5, width: 87.5, style: 'fill', fillPct: 65, track: 'bg-[#FFD9D1]', fill: 'bg-[#FF5738]', fillText: 'text-[#FFFEF0]' },
      { name: 'Edificio Nordelta', client: 'Inversora del Plata · Comercial', type: 'Comercial', left: 0, width: 87.5, style: 'fill', fillPct: 48, track: 'bg-[#DCEAF8]', fill: 'bg-[#7FB0E8]', fillText: 'text-white' },
      { name: 'Local Scalabrini', client: 'Grupo Lumen · Reforma', type: 'Reforma', left: 25, width: 37.5, style: 'fill', fillPct: 90, track: 'bg-[#EFEDC9]', fill: 'bg-[#D5D25D]', fillText: 'text-[#5E5C25]' },
    ],
  },
  {
    key: 'proyecto',
    label: 'EN PROYECTO',
    dot: '#7FB0E8',
    text: 'text-[#3F6FA3]',
    rows: [
      { name: 'Oficinas Catalinas', client: 'Estudio Vidal · Corporativo', type: 'Corporativo', left: 37.5, width: 62.5, style: 'outline', label: 'Proyecto ejecutivo', bg: 'bg-[#E4F1EC]', border: 'border-[#00846F]', text: 'text-[#00846F]' },
      { name: 'Casa Tigre', client: 'Familia Méndez · Vivienda', type: 'Vivienda', left: 50, width: 50, style: 'outline', label: 'Anteproyecto', bg: 'bg-[#FFEDE9]', border: 'border-[#FF5738]', text: 'text-[#C23A22]' },
      { name: 'Reforma Belgrano', client: 'Café Mirta · Reforma', type: 'Reforma', left: 50, width: 25, style: 'outline', label: 'Proyecto', bg: 'bg-[#F7F6E2]', border: 'border-[#D5D25D]', text: 'text-[#7E7B2E]' },
    ],
  },
  {
    key: 'iniciar',
    label: 'POR INICIAR',
    dot: '#C9C5B8',
    text: 'text-[#8A847B]',
    rows: [
      { name: 'Vivienda San Isidro', client: 'Familia Costa · Vivienda', type: 'Vivienda', left: 62.5, width: 37.5, style: 'dashed', label: 'Inicio previsto', bg: 'bg-[#FBFAF3]', border: 'border-[#E08C7C]', text: 'text-[#B08379]' },
      { name: 'Showroom Palermo', client: 'Marca Vesta · Comercial', type: 'Comercial', left: 75, width: 25, style: 'dashed', label: 'Inicio previsto', bg: 'bg-[#FBFAF3]', border: 'border-[#A9C4E2]', text: 'text-[#7E97B3]' },
    ],
  },
]

const quarters = ['Q1·25', 'Q2·25', 'Q3·25', 'Q4·25', 'Q1·26', 'Q2·26', 'Q3·26', 'Q4·26']
const gridlines = [12.5, 25, 37.5, 50, 62.5, 87.5]
const todayPct = 75

const zoomLevels = ['Mes', 'Trimestre', 'Semestre', 'Año'] as const
const rubroFilters = ['Todos los rubros', 'En obra', 'En proyecto'] as const

const legendItems = [
  { label: 'Vivienda', color: 'bg-[#FF5738]' },
  { label: 'Comercial', color: 'bg-[#7FB0E8]' },
  { label: 'Corporativo', color: 'bg-[#00846F]' },
  { label: 'Reforma', color: 'bg-[#D5D25D]' },
]

export default function CronogramaMaestroPage() {
  const [zoom, setZoom] = useState<typeof zoomLevels[number]>('Trimestre')
  const [rubro, setRubro] = useState<typeof rubroFilters[number]>('Todos los rubros')

  const totalProjects = groups.reduce((a, g) => a + g.rows.length, 0)

  return (
    <div className="flex flex-col pt-10 px-11 pb-12 gap-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#8A847B]">Estudio</span>
          <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0" aria-hidden>
            <path d="M9 6l6 6-6 6" fill="none" stroke="#C9C5B8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-semibold text-[#130D10]">Cronograma maestro</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 rounded-[10px] py-2 px-4 bg-white border border-[#ECE9DA] text-[13px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">
            <IconFilter size={15} stroke={1.9} className="text-[#8A847B]" /> Filtrar
          </button>
          <button className="flex items-center gap-2 rounded-[10px] py-2 px-4 bg-white border border-[#ECE9DA] text-[13px] font-medium text-[#6B655C] hover:bg-[#FBFAF3] transition-colors">
            <IconFileDownload size={15} stroke={1.9} className="text-[#8A847B]" /> Exportar
          </button>
        </div>
      </div>

      {/* Title + rubro pills */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[34px] leading-[1.1] text-[#130D10]">Cronograma maestro</h1>
          <p className="text-[15px] text-[#8A847B]">
            {totalProjects} proyectos activos · línea de tiempo de todo el estudio
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rubroFilters.map((r) => {
            const active = rubro === r
            return (
              <button
                key={r}
                onClick={() => setRubro(r)}
                className={cn(
                  'flex items-center rounded-full py-1.5 px-3.25 gap-1.75 border transition-colors',
                  active
                    ? 'bg-[#FFEDE9] border-[#FF5738]'
                    : 'border-[#ECE9DA] hover:bg-[#FBFAF3]'
                )}
              >
                {active && <span className="rounded-sm shrink-0 bg-[#FF5738] size-2" />}
                <span className={cn('text-[13px]', active ? 'font-semibold text-[#C23A22]' : 'font-medium text-[#8A847B]')}>
                  {r}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gantt maestro card */}
      <div className="flex flex-col rounded-[20px] p-6 bg-white border border-[#ECE9DA]">
        {/* Toolbar */}
        <div className="flex items-center justify-between pb-4.5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#130D10]">Proyectos del estudio</h2>
            <span className="text-[13px] text-[#8A847B]">· {totalProjects} proyectos · 2025–2026</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center rounded-full p-0.75 gap-0.5 bg-[#F4F1E3]">
              {zoomLevels.map((z) => {
                const active = zoom === z
                return (
                  <button
                    key={z}
                    onClick={() => setZoom(z)}
                    className={cn(
                      'rounded-full py-1.5 px-3.25 text-xs transition-all',
                      active
                        ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-semibold text-[#130D10]'
                        : 'font-medium text-[#8A847B]'
                    )}
                  >
                    {z}
                  </button>
                )
              })}
            </div>
            <span className="text-xs font-semibold text-[#FF5738]">| Hoy · jun 2026</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center pb-4 gap-4.5">
          {legendItems.map((l) => (
            <div key={l.label} className="flex items-center gap-1.75">
              <span className={cn('w-2.25 h-2.25 rounded-[3px] shrink-0', l.color)} />
              <span className="text-xs text-[#6B655C]">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.75">
            <span className="w-4 h-2.25 rounded-[3px] shrink-0 border-[1.5px] border-dashed border-[#C9C5B8]" />
            <span className="text-xs text-[#6B655C]">Por iniciar</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex">
          {/* Left: project list */}
          <div className="flex flex-col w-62 shrink-0">
            <div className="flex items-center h-10 shrink-0">
              <span className="text-[11px] font-semibold tracking-[0.06em] text-[#A8A29A]">PROYECTO · CLIENTE</span>
            </div>
            {groups.map((g) => (
              <div key={g.key} className="flex flex-col">
                <div className="flex items-center h-8.5 gap-2 shrink-0">
                  <span className="w-2.25 h-2.25 rounded-[5px] shrink-0" style={{ backgroundColor: g.dot }} />
                  <span className={cn('text-xs font-bold tracking-[0.04em]', g.text)}>{g.label}</span>
                </div>
                {g.rows.map((r) => (
                  <div key={r.name} className="flex flex-col justify-center h-11.5 shrink-0">
                    <span className="text-sm font-medium leading-[1.3] text-[#130D10]">{r.name}</span>
                    <span className="text-xs text-[#9A958B]">{r.client}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Right: timeline */}
          <div className="flex flex-col grow basis-0 relative">
            {/* Quarter header */}
            <div className="flex h-10 relative shrink-0">
              {quarters.map((q) => (
                <div key={q} className="flex items-center w-[12.5%] pl-2">
                  <span className="text-[11px] font-semibold text-[#A8A29A]">{q}</span>
                </div>
              ))}
            </div>

            {/* Gridlines + today */}
            <div className="absolute inset-0">
              {gridlines.map((g) => (
                <div key={g} className="w-px absolute bg-[#F0EDE0] inset-y-0" style={{ left: `${g}%` }} />
              ))}
              <div className="w-0.5 absolute bg-[#FF5738] inset-y-0" style={{ left: `${todayPct}%` }} />
            </div>

            {/* Rows */}
            {groups.map((g) => (
              <div key={g.key} className="flex flex-col">
                <div className="h-8.5 relative shrink-0" />
                {g.rows.map((r) => (
                  <div key={r.name} className="h-11.5 relative shrink-0">
                    {r.style === 'fill' ? (
                      <div
                        className={cn('top-3 h-5.5 rounded-[7px] overflow-clip absolute', r.track)}
                        style={{ left: `${r.left}%`, width: `${r.width}%` }}
                      >
                        <div className={cn('left-0 rounded-[7px] absolute inset-y-0', r.fill)} style={{ width: `${r.fillPct}%` }} />
                        <span className={cn('top-0.75 left-2.5 absolute text-[11px] font-semibold', r.fillText)}>
                          {r.fillPct}%
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'top-3 h-5.5 flex items-center rounded-[7px] pl-2.5 absolute border-[1.5px]',
                          r.bg, r.border,
                          r.style === 'dashed' ? 'border-dashed' : 'border-solid'
                        )}
                        style={{ left: `${r.left}%`, width: `${r.width}%` }}
                      >
                        <span className={cn('text-[11px]', r.style === 'dashed' ? 'font-medium' : 'font-semibold', r.text)}>
                          {r.label}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
