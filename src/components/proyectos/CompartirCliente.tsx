'use client'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { IconShare2, IconLink, IconExternalLink, IconCopy, IconBrandWhatsapp } from '@tabler/icons-react'

export function CompartirCliente({ id, name }: { id: string; name: string }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const path = `/portal/${id}`
  const url = `${origin}${path}`
  const waText = encodeURIComponent(`Hola! Te comparto el avance de ${name} en Folio: ${url}`)

  const copy = () => {
    navigator.clipboard?.writeText(url)
      .then(() => toast('Link del portal copiado'))
      .catch(() => toast('No se pudo copiar el link'))
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ECE8D6] text-[#130D10] text-[13px] font-semibold hover:bg-[#FBFAF3] transition-colors"
      >
        <IconShare2 size={14} /> Compartir
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Compartir con el cliente"
        footer={<Button variant="secondary" onClick={() => setOpen(false)}>Cerrar</Button>}
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-[14px] bg-[#EAF2FC] border border-[#DCEAF8] p-4">
            <span className="flex items-center justify-center shrink-0 rounded-[10px] bg-[#7FB0E8] size-9">
              <IconLink size={17} className="text-[#173B5C]" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-[#173B5C]">Portal del cliente · solo lectura</p>
              <p className="text-[12px] text-[#3F6FA3] leading-[1.5]">
                Con este link {name ? <>de <span className="font-medium">{name}</span></> : 'del proyecto'}, el cliente ve el avance de obra, etapas, pagos y entregas. No necesita cuenta.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#130D10] mb-1.5 block">Link público</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={url}
                onFocus={e => e.currentTarget.select()}
                className="flex-1 min-w-0 text-[13px] text-[#6B655C] bg-[#FBFAF3] border border-[#ECE8D6] rounded-full px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#7FB0E8]"
              />
              <Button variant="primary" size="sm" onClick={copy}>
                <IconCopy size={13} /> Copiar
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] text-white text-[13px] font-semibold hover:bg-[#1FB855] transition-colors"
            >
              <IconBrandWhatsapp size={15} /> Enviar por WhatsApp
            </a>
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ECE8D6] text-[#130D10] text-[13px] font-semibold hover:bg-[#FBFAF3] transition-colors"
            >
              <IconExternalLink size={14} /> Abrir portal
            </a>
          </div>
        </div>
      </Modal>
    </>
  )
}
