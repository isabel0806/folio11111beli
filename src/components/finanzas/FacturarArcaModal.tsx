'use client'
import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Currency } from '@/lib/types'
import { IconReceipt2, IconShieldCheck, IconDownload, IconCopy, IconCheck } from '@tabler/icons-react'

export interface Factura {
  tipo: 'A' | 'B' | 'C'
  ptoVenta: string
  numero: string
  cae: string
  fecha: string
  vtoCae: string
  neto: number
  iva: number
  total: number
}

interface Target {
  id: string
  name: string
  projectName: string
  clientName: string
  amount: number
  currency: Currency
}

const ivaConditions = [
  { value: 'RI', label: 'Responsable Inscripto', tipo: 'A' as const },
  { value: 'MT', label: 'Monotributo', tipo: 'B' as const },
  { value: 'CF', label: 'Consumidor Final', tipo: 'B' as const },
  { value: 'EX', label: 'Exento', tipo: 'B' as const },
]

const pad = (n: number, len: number) => String(n).padStart(len, '0')

export function FacturarArcaModal({
  target, onClose, onIssue,
}: {
  target: Target | null
  onClose: () => void
  onIssue: (milestoneId: string, factura: Factura) => void
}) {
  const { toast } = useToast()
  const [tipo, setTipo] = useState<'A' | 'B' | 'C'>('B')
  const [ptoVenta, setPtoVenta] = useState('0001')
  const [condicion, setCondicion] = useState('CF')
  const [cuit, setCuit] = useState('')
  const [concepto, setConcepto] = useState('Servicios profesionales de arquitectura')
  const [issued, setIssued] = useState<Factura | null>(null)

  // milestone.amount is treated as total (IVA incluido)
  const breakdown = useMemo(() => {
    const total = target?.amount || 0
    const neto = Math.round(total / 1.21)
    return { total, neto, iva: total - neto }
  }, [target])

  const close = () => {
    onClose()
    // reset for next time (after the close transition fires)
    setTimeout(() => { setIssued(null); setTipo('B'); setCondicion('CF'); setCuit(''); setPtoVenta('0001') }, 0)
  }

  const emitir = () => {
    if (!target) return
    const now = new Date()
    const vto = new Date(now.getTime() + 10 * 86400000)
    const seq = 1200 + Math.floor(Math.random() * 8000)
    const cae = `${pad(Math.floor(Math.random() * 9_0000_0000_0000) + 1_0000_0000_0000, 14)}`
    const factura: Factura = {
      tipo, ptoVenta,
      numero: `${ptoVenta}-${pad(seq, 8)}`,
      cae,
      fecha: now.toLocaleDateString('es-AR'),
      vtoCae: vto.toLocaleDateString('es-AR'),
      neto: breakdown.neto, iva: breakdown.iva, total: breakdown.total,
    }
    setIssued(factura)
    onIssue(target.id, factura)
  }

  const onCondicion = (v: string) => {
    setCondicion(v)
    const match = ivaConditions.find(c => c.value === v)
    if (match) setTipo(match.tipo)
  }

  return (
    <Modal
      open={!!target}
      onClose={close}
      title={issued ? 'Factura emitida' : 'Facturar con ARCA'}
      footer={
        issued ? (
          <>
            <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(issued.cae); toast('CAE copiado') }}>
              <IconCopy size={13} /> Copiar CAE
            </Button>
            <Button variant="primary" onClick={() => { toast('Comprobante descargado'); close() }}>
              <IconDownload size={13} /> Descargar comprobante
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button variant="primary" onClick={emitir}>
              <IconReceipt2 size={14} /> Emitir factura
            </Button>
          </>
        )
      }
    >
      {!target ? null : !issued ? (
        <div className="space-y-5">
          {/* Concept summary */}
          <div className="rounded-[14px] bg-[#FBFAF3] border border-[#ECE8D6] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A8A29A] mb-1">Comprobante por</p>
            <p className="text-sm font-semibold text-[#130D10]">{target.name}</p>
            <p className="text-xs text-[#8A847B]">{target.projectName} · {target.clientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Condición IVA del receptor" value={condicion} onChange={e => onCondicion(e.target.value)}
              options={ivaConditions.map(c => ({ value: c.value, label: c.label }))} />
            <Select label="Tipo de comprobante" value={tipo} onChange={e => setTipo(e.target.value as 'A' | 'B' | 'C')}
              options={[
                { value: 'A', label: 'Factura A' },
                { value: 'B', label: 'Factura B' },
                { value: 'C', label: 'Factura C' },
              ]} />
            <Input label="Punto de venta" value={ptoVenta} onChange={e => setPtoVenta(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0001" />
            <Input label={condicion === 'CF' ? 'DNI / CUIT del cliente' : 'CUIT del cliente'} value={cuit} onChange={e => setCuit(e.target.value)} placeholder="30-12345678-9" />
          </div>

          <Input label="Concepto" value={concepto} onChange={e => setConcepto(e.target.value)} />

          {/* Amount breakdown */}
          <div className="rounded-[14px] border border-[#ECE8D6] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-[#6B655C]">Neto gravado</span>
              <span className="text-sm font-medium text-[#130D10]">{formatCurrency(breakdown.neto, target.currency)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#F2EFE2]">
              <span className="text-sm text-[#6B655C]">IVA 21%</span>
              <span className="text-sm font-medium text-[#130D10]">{formatCurrency(breakdown.iva, target.currency)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#ECE8D6] bg-[#FFFCEF]">
              <span className="text-sm font-semibold text-[#130D10]">Total</span>
              <span className="font-serif text-[18px] text-[#130D10]">{formatCurrency(breakdown.total, target.currency)}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#A8A29A] leading-[1.5]">
            Se generará una factura electrónica y ARCA devolverá el CAE (Código de Autorización Electrónica). Demo: el comprobante no se envía a los servidores de ARCA.
          </p>
        </div>
      ) : (
        /* Issued state */
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[14px] bg-[#E4F1EC] border border-[#C7E6DC] p-4">
            <span className="flex items-center justify-center shrink-0 rounded-full bg-[#00846F] size-10">
              <IconShieldCheck size={20} className="text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#00846F]">Factura {issued.tipo} autorizada por ARCA</p>
              <p className="text-xs text-[#3E8A7C]">Comprobante {issued.numero} · {issued.fecha}</p>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#ECE8D6] overflow-hidden">
            {[
              ['Tipo', `Factura ${issued.tipo}`],
              ['N° de comprobante', issued.numero],
              ['CAE', issued.cae],
              ['Vto. del CAE', issued.vtoCae],
              ['Total', formatCurrency(issued.total, target.currency)],
            ].map(([k, v], i) => (
              <div key={k} className={cn('flex items-center justify-between px-4 py-2.5', i > 0 && 'border-t border-[#F2EFE2]')}>
                <span className="text-xs text-[#8A847B]">{k}</span>
                <span className={cn('text-sm text-[#130D10]', k === 'CAE' && 'font-mono tracking-tight')}>{v}</span>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 text-[12px] text-[#00846F]">
            <IconCheck size={14} /> El hito quedó marcado como facturado.
          </p>
        </div>
      )}
    </Modal>
  )
}
