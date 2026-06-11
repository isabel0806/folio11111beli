'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { mockFiles, mockMilestones } from '@/lib/mock-data'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  IconPlus, IconUpload, IconDownload, IconFile, IconLock, IconLockOpen,
  IconBrandFigma, IconBrandGoogleDrive, IconBrandDropbox, IconExternalLink
} from '@tabler/icons-react'
import { formatDate } from '@/lib/utils'
import type { ProjectFile } from '@/lib/types'

const integrations = [
  { id: 'drive', label: 'Google Drive', icon: IconBrandGoogleDrive, color: '#4285F4' },
  { id: 'figma', label: 'Figma', icon: IconBrandFigma, color: '#F24E1E' },
  { id: 'dropbox', label: 'Dropbox', icon: IconBrandDropbox, color: '#0061FF' },
  { id: 'miro', label: 'Miro', icon: IconExternalLink, color: '#FFD02F' },
]

export default function ArchivosPage() {
  const { id } = useParams() as { id: string }
  const [files, setFiles] = useState<ProjectFile[]>(mockFiles[id] || [])
  const [showUpload, setShowUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'presupuesto' | 'entrega' | 'general'>('general')
  const [form, setForm] = useState({ name: '', linked_milestone_id: '' })
  const milestones = mockMilestones[id] || []

  const budgets = files.filter(f => f.type === 'presupuesto')
  const deliveries = files.filter(f => f.type === 'entrega')
  const general = files.filter(f => f.type === 'general')

  const handleUpload = () => {
    if (!form.name) return
    const newFile: ProjectFile = {
      id: `f${Date.now()}`, project_id: id, name: form.name, type: uploadType,
      uploaded_at: new Date().toISOString(),
      linked_milestone_id: form.linked_milestone_id || undefined,
      status: uploadType === 'entrega' && form.linked_milestone_id ? 'esperando_pago' : undefined,
    }
    setFiles(prev => [...prev, newFile])
    setShowUpload(false)
    setForm({ name: '', linked_milestone_id: '' })
  }

  return (
    <div className="space-y-6">
      {/* Presupuestos */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Presupuestos</h2>
          <Button size="sm" variant="secondary" onClick={() => { setUploadType('presupuesto'); setShowUpload(true) }}>
            <IconPlus size={13} /> Nuevo presupuesto
          </Button>
        </div>
        {budgets.length === 0 ? (
          <p className="text-xs text-[#9B9B9B]">No hay presupuestos cargados.</p>
        ) : (
          <div className="divide-y divide-[#F0F0EE]">
            {budgets.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-2.5">
                <IconFile size={16} className="text-[#6B6B6B]" stroke={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#130D10]">{f.name}</p>
                  <p className="text-[10px] text-[#9B9B9B]">{formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}</p>
                </div>
                <Button size="sm" variant="ghost"><IconDownload size={13} /></Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Entregas */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Entregas al cliente</h2>
          <Button size="sm" variant="secondary" onClick={() => { setUploadType('entrega'); setShowUpload(true) }}>
            <IconPlus size={13} /> Subir entrega
          </Button>
        </div>
        <p className="text-xs text-[#9B9B9B] mb-3">Los archivos se desbloquean automáticamente al cobrar el hito vinculado.</p>
        {deliveries.length === 0 ? (
          <p className="text-xs text-[#9B9B9B]">No hay entregas cargadas.</p>
        ) : (
          <div className="divide-y divide-[#F0F0EE]">
            {deliveries.map(f => {
              const linkedMilestone = milestones.find(m => m.id === f.linked_milestone_id)
              const isPaid = linkedMilestone?.status === 'cobrado'
              return (
                <div key={f.id} className="flex items-center gap-3 py-2.5">
                  <div className={`p-1.5 rounded-lg ${isPaid ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    {isPaid ? <IconLockOpen size={14} className="text-green-600" /> : <IconLock size={14} className="text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#130D10]">{f.name}</p>
                    <p className="text-[10px] text-[#9B9B9B]">
                      {formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}
                      {linkedMilestone && ` · Vinculado a "${linkedMilestone.name}"`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isPaid ? 'Disponible' : 'Esperando pago'}
                  </span>
                  {isPaid && <Button size="sm" variant="ghost"><IconDownload size={13} /></Button>}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Archivos del proyecto */}
      <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#130D10]">Archivos del proyecto</h2>
          <Button size="sm" variant="secondary" onClick={() => { setUploadType('general'); setShowUpload(true) }}>
            <IconUpload size={13} /> Subir archivo
          </Button>
        </div>
        {/* Integration chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {integrations.map(integ => (
            <button
              key={integ.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E3] text-xs text-[#6B6B6B] hover:border-[#F5D242] transition-colors bg-white"
            >
              <integ.icon size={13} stroke={1.5} style={{ color: integ.color }} />
              Vincular {integ.label}
            </button>
          ))}
        </div>
        {general.length === 0 ? (
          <p className="text-xs text-[#9B9B9B]">No hay archivos generales.</p>
        ) : (
          <div className="divide-y divide-[#F0F0EE]">
            {general.map(f => (
              <div key={f.id} className="flex items-center gap-3 py-2.5">
                <IconFile size={16} className="text-[#6B6B6B]" stroke={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#130D10]">{f.name}</p>
                  <p className="text-[10px] text-[#9B9B9B]">{formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}</p>
                </div>
                <Button size="sm" variant="ghost"><IconDownload size={13} /></Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title={uploadType === 'presupuesto' ? 'Nuevo presupuesto' : uploadType === 'entrega' ? 'Subir entrega' : 'Subir archivo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpload}>Subir</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del archivo *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Planos ejecutivos v3.pdf"
          />
          {uploadType === 'entrega' && milestones.length > 0 && (
            <Select
              label="Vincular a hito de cobro"
              value={form.linked_milestone_id}
              onChange={e => setForm(f => ({ ...f, linked_milestone_id: e.target.value }))}
              options={[
                { value: '', label: '— Sin vincular —' },
                ...milestones.map(m => ({ value: m.id, label: m.name }))
              ]}
            />
          )}
          <div className="border-2 border-dashed border-[#E5E5E3] rounded-xl p-8 text-center">
            <IconUpload size={24} className="mx-auto text-[#9B9B9B] mb-2" stroke={1.5} />
            <p className="text-sm text-[#6B6B6B]">Arrastrá tu archivo acá o</p>
            <Button variant="secondary" size="sm" className="mt-2">Seleccionar archivo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
