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
import { PresupuestoModal } from '@/components/proyectos/PresupuestoModal'
import { mockProjects } from '@/lib/mock-data'
import { useToast } from '@/components/ui/Toast'

const integrations = [
  { id: 'drive', label: 'Google Drive', icon: IconBrandGoogleDrive, color: '#4285F4' },
  { id: 'figma', label: 'Figma', icon: IconBrandFigma, color: '#F24E1E' },
  { id: 'dropbox', label: 'Dropbox', icon: IconBrandDropbox, color: '#0061FF' },
  { id: 'miro', label: 'Miro', icon: IconExternalLink, color: '#FFD02F' },
]

export default function ArchivosPage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const project = mockProjects.find(p => p.id === id)
  const [files, setFiles] = useState<ProjectFile[]>(mockFiles[id] || [])
  const [showUpload, setShowUpload] = useState(false)
  const [showPresupuesto, setShowPresupuesto] = useState(false)
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
    <div className="flex flex-col gap-6">
      {/* Presupuestos */}
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[19px] text-[#130D10]">Presupuestos</h2>
          <Button size="sm" variant="primary" onClick={() => setShowPresupuesto(true)}>
            <IconPlus size={13} /> Nuevo presupuesto
          </Button>
        </div>
        {budgets.length === 0 ? (
          <p className="text-[13px] text-[#A8A29A]">No hay presupuestos cargados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {budgets.map(f => (
              <div key={f.id} className="flex items-center gap-3 bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
                <IconFile size={17} className="text-[#8A847B]" stroke={1.6} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#130D10]">{f.name}</p>
                  <p className="text-[11px] text-[#A8A29A]">{formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}</p>
                </div>
                <Button size="sm" variant="ghost"><IconDownload size={13} /></Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Entregas */}
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[19px] text-[#130D10]">Entregas al cliente</h2>
          <Button size="sm" variant="secondary" onClick={() => { setUploadType('entrega'); setShowUpload(true) }}>
            <IconPlus size={13} /> Subir entrega
          </Button>
        </div>
        <p className="text-[12px] text-[#8A847B] mb-4">Los archivos se desbloquean automáticamente al cobrar el hito vinculado.</p>
        {deliveries.length === 0 ? (
          <p className="text-[13px] text-[#A8A29A]">No hay entregas cargadas.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {deliveries.map(f => {
              const linkedMilestone = milestones.find(m => m.id === f.linked_milestone_id)
              const isPaid = linkedMilestone?.status === 'cobrado'
              return (
                <div key={f.id} className="flex items-center gap-3 bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
                  <div className={`p-1.5 rounded-[10px] ${isPaid ? 'bg-[#E5F3EF]' : 'bg-[#FBF3D6]'}`}>
                    {isPaid ? <IconLockOpen size={14} className="text-[#00846F]" /> : <IconLock size={14} className="text-[#7A6410]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#130D10]">{f.name}</p>
                    <p className="text-[11px] text-[#A8A29A]">
                      {formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}
                      {linkedMilestone && ` · Vinculado a "${linkedMilestone.name}"`}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isPaid ? 'bg-[#E5F3EF] text-[#00846F]' : 'bg-[#FBF3D6] text-[#7A6410]'}`}>
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
      <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[19px] text-[#130D10]">Archivos del proyecto</h2>
          <Button size="sm" variant="secondary" onClick={() => { setUploadType('general'); setShowUpload(true) }}>
            <IconUpload size={13} /> Subir archivo
          </Button>
        </div>
        {/* Integration chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {integrations.map(integ => (
            <button
              key={integ.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#ECE8D6] text-[12px] font-medium text-[#6B655C] hover:border-[#FF5738] hover:text-[#130D10] transition-colors bg-white"
            >
              <integ.icon size={13} stroke={1.5} style={{ color: integ.color }} />
              Vincular {integ.label}
            </button>
          ))}
        </div>
        {general.length === 0 ? (
          <p className="text-[13px] text-[#A8A29A]">No hay archivos generales.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {general.map(f => (
              <div key={f.id} className="flex items-center gap-3 bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-3">
                <IconFile size={17} className="text-[#8A847B]" stroke={1.6} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#130D10]">{f.name}</p>
                  <p className="text-[11px] text-[#A8A29A]">{formatDate(f.uploaded_at)}{f.size && ` · ${f.size}`}</p>
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
          <div className="border-2 border-dashed border-[#ECE8D6] rounded-[14px] p-8 text-center">
            <IconUpload size={24} className="mx-auto text-[#A8A29A] mb-2" stroke={1.5} />
            <p className="text-sm text-[#6B655C]">Arrastrá tu archivo acá o</p>
            <Button variant="secondary" size="sm" className="mt-2">Seleccionar archivo</Button>
          </div>
        </div>
      </Modal>

      <PresupuestoModal
        open={showPresupuesto}
        onClose={() => setShowPresupuesto(false)}
        projectName={project?.name || ''}
        clientName={project?.client_name || ''}
        currency={project?.currency || 'ARS'}
        onSave={({ name }) => {
          const newFile: ProjectFile = {
            id: `f${Date.now()}`, project_id: id, name: `${name}.pdf`,
            type: 'presupuesto', uploaded_at: new Date().toISOString(),
          }
          setFiles(prev => [...prev, newFile])
          toast(`Presupuesto "${name}" guardado`)
        }}
      />
    </div>
  )
}
