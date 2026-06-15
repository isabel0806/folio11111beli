'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  IconSearch, IconUpload, IconRuler2, IconPhoto, IconFileText, IconBuildingEstate,
  IconFile, IconCheck, IconClock, IconDownload, IconDotsVertical,
} from '@tabler/icons-react'

type FolderKey = 'planos' | 'renders' | 'actas' | 'municipio'
type Approval = 'aprobado' | 'pendiente' | 'na'

const folders: { key: FolderKey; name: string; count: number; icon: typeof IconRuler2; color: string; bg: string }[] = [
  { key: 'planos', name: 'Planos', count: 18, icon: IconRuler2, color: '#3F6FA3', bg: 'bg-[#EAF2FC]' },
  { key: 'renders', name: 'Renders', count: 9, icon: IconPhoto, color: '#6B4FA0', bg: 'bg-[#F1ECF8]' },
  { key: 'actas', name: 'Actas y contratos', count: 6, icon: IconFileText, color: '#00846F', bg: 'bg-[#E4F1EC]' },
  { key: 'municipio', name: 'Municipio', count: 4, icon: IconBuildingEstate, color: '#B8762A', bg: 'bg-[#FBF3D6]' },
]

interface Doc { name: string; folder: FolderKey; version: string; approval: Approval; updated: string; size: string }

const docs: Doc[] = [
  { name: 'Planta baja — ejecutivo.dwg', folder: 'planos', version: 'v4', approval: 'aprobado', updated: 'hace 2 h', size: '8.4 MB' },
  { name: 'Vista frente — render diurno.jpg', folder: 'renders', version: 'v2', approval: 'pendiente', updated: 'ayer', size: '14.2 MB' },
  { name: 'Acta de inicio de obra.pdf', folder: 'actas', version: 'v1', approval: 'na', updated: 'hace 3 días', size: '420 KB' },
  { name: 'Planos de instalación eléctrica.dwg', folder: 'planos', version: 'v3', approval: 'aprobado', updated: 'hace 4 días', size: '6.1 MB' },
  { name: 'Permiso de obra — municipalidad.pdf', folder: 'municipio', version: 'v2', approval: 'na', updated: 'hace 1 sem', size: '1.1 MB' },
  { name: 'Render living — propuesta final.jpg', folder: 'renders', version: 'v3', approval: 'pendiente', updated: 'hace 1 sem', size: '11.8 MB' },
  { name: 'Contrato de honorarios.pdf', folder: 'actas', version: 'v1', approval: 'aprobado', updated: 'hace 2 sem', size: '380 KB' },
]

const filters: { key: 'todos' | FolderKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'planos', label: 'Planos' },
  { key: 'renders', label: 'Renders' },
  { key: 'actas', label: 'Actas y contratos' },
]

const approvalStyle: Record<Approval, { label: string; cls: string; icon?: typeof IconCheck }> = {
  aprobado: { label: 'Aprobado', cls: 'bg-[#E4F1EC] text-[#00846F]', icon: IconCheck },
  pendiente: { label: 'Pendiente', cls: 'bg-[#FBF3D6] text-[#7A6410]', icon: IconClock },
  na: { label: 'No aplica', cls: 'bg-[#F2EFE2] text-[#8A847B]' },
}

const fileIcon = (folder: FolderKey) =>
  folder === 'planos' ? IconRuler2 : folder === 'renders' ? IconPhoto : folder === 'municipio' ? IconBuildingEstate : IconFileText

export default function DocumentacionPage() {
  const [filter, setFilter] = useState<'todos' | FolderKey>('todos')
  const [search, setSearch] = useState('')

  const visible = docs
    .filter(d => filter === 'todos' || d.folder === filter)
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))

  const totalFiles = folders.reduce((a, f) => a + f.count, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3.5 py-1.5 text-[13px] rounded-full border transition-colors',
                filter === f.key ? 'bg-[#130D10] text-white border-[#130D10] font-semibold' : 'bg-white text-[#6B655C] border-[#ECE8D6] hover:border-[#130D10] font-medium'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29A]" />
            <input
              className="pl-9 pr-3 py-2 text-sm border border-[#ECE8D6] rounded-full bg-white w-44 focus:outline-none focus:ring-1 focus:ring-[#F5D242]"
              placeholder="Buscar archivo"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" variant="primary"><IconUpload size={13} /> Subir archivo</Button>
        </div>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-4 gap-4">
        {folders.map(f => {
          const Icon = f.icon
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(active ? 'todos' : f.key)}
              className={cn(
                'flex items-center gap-3.5 rounded-[18px] border p-4 text-left transition-colors',
                active ? 'border-[#130D10] bg-white' : 'border-[#ECE8D6] bg-[#FBFAF3] hover:border-[#D8D2C2]'
              )}
            >
              <span className={cn('flex items-center justify-center shrink-0 rounded-[12px] size-[42px]', f.bg)}>
                <Icon size={20} stroke={1.7} style={{ color: f.color }} />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-[#130D10] text-[15px]">{f.name}</span>
                <span className="text-[12.5px] text-[#8A847B]">{f.count} archivos</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Recent files */}
      <div className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-serif text-[19px] text-[#130D10]">
            {filter === 'todos' ? 'Archivos recientes' : folders.find(f => f.key === filter)?.name}
          </h2>
          <span className="text-xs text-[#A8A29A]">{totalFiles} archivos · 1.2 GB</span>
        </div>

        {/* Column head */}
        <div className="flex items-center px-3 pb-2.5 border-b border-[#ECE8D6]">
          <span className="grow basis-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Archivo</span>
          <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Versión</span>
          <span className="w-36 shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Aprobación cliente</span>
          <span className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Actualizado</span>
          <span className="w-16 shrink-0" />
        </div>

        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#A8A29A]">No hay archivos para este filtro.</p>
        ) : (
          <div className="divide-y divide-[#F0EDE0]">
            {visible.map(d => {
              const Icon = fileIcon(d.folder)
              const folder = folders.find(f => f.key === d.folder)!
              const ap = approvalStyle[d.approval]
              const ApIcon = ap.icon
              return (
                <div key={d.name} className="flex items-center px-3 py-3 group">
                  <div className="grow basis-0 flex items-center gap-3 min-w-0">
                    <span className={cn('flex items-center justify-center shrink-0 rounded-[10px] size-10', folder.bg)}>
                      <Icon size={18} stroke={1.6} style={{ color: folder.color }} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-medium text-[#130D10] truncate">{d.name}</span>
                      <span className="text-[11px] text-[#A8A29A]">{folder.name} · {d.size}</span>
                    </div>
                  </div>
                  <div className="w-20 shrink-0">
                    <span className="inline-flex items-center rounded-[6px] bg-[#F2EFE2] px-2 py-0.5 text-[11px] font-semibold text-[#6B655C]">{d.version}</span>
                  </div>
                  <div className="w-36 shrink-0">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', ap.cls)}>
                      {ApIcon && <ApIcon size={11} stroke={2.2} />}{ap.label}
                    </span>
                  </div>
                  <span className="w-28 shrink-0 text-[12.5px] text-[#8A847B]">{d.updated}</span>
                  <div className="w-16 shrink-0 flex items-center justify-end gap-0.5 text-[#A8A29A]">
                    <button title="Descargar" className="p-1.5 rounded-full hover:bg-white hover:text-[#130D10] transition-colors"><IconDownload size={15} stroke={1.6} /></button>
                    <button title="Más" className="p-1.5 rounded-full hover:bg-white hover:text-[#130D10] transition-colors"><IconDotsVertical size={15} stroke={1.6} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
