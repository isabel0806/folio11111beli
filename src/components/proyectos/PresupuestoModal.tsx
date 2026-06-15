'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { IconPlus, IconTrash, IconDownload } from '@tabler/icons-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Currency } from '@/lib/types'

interface LineItem {
  id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  iva: number
  honorarios?: boolean
}

interface PresupuestoModalProps {
  open: boolean
  onClose: () => void
  projectName: string
  clientName: string
  currency: Currency
  onSave: (budget: { name: string; items: LineItem[]; subtotal: number; iva: number; total: number; notes: string }) => void
}

const IVA_RATES = [21, 10.5, 0]

const defaultItem = (honorarios = false): LineItem => ({
  id: `li${Date.now()}`, description: '', quantity: 1, unit: 'und', unit_price: 0, iva: 21, honorarios,
})

export function PresupuestoModal({ open, onClose, projectName, clientName, currency, onSave }: PresupuestoModalProps) {
  const [name, setName] = useState(`Presupuesto ${projectName}`)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([defaultItem()])
  const [preview, setPreview] = useState(false)

  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unit_price, 0)
  const ivaTotal = items.reduce((acc, i) => acc + i.quantity * i.unit_price * (i.iva / 100), 0)
  const total = subtotal + ivaTotal

  const addItem = (honorarios = false) => setItems(prev => [...prev, defaultItem(honorarios)])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleSave = () => {
    onSave({ name, items, subtotal, iva: ivaTotal, total, notes })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={preview ? 'Vista previa del presupuesto' : 'Nuevo presupuesto'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {!preview
            ? <Button variant="secondary" onClick={() => setPreview(true)}>Vista previa</Button>
            : <Button variant="secondary" onClick={() => setPreview(false)}>Editar</Button>
          }
          <Button variant="primary" onClick={handleSave}>
            <IconDownload size={13} /> Guardar presupuesto
          </Button>
        </>
      }
    >
      {!preview ? (
        <div className="space-y-5">
          <Input label="Título del presupuesto" value={name} onChange={e => setName(e.target.value)} />

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#130D10]">Ítems</label>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => addItem(false)}><IconPlus size={12} /> Agregar ítem</Button>
                <Button size="sm" variant="ghost" onClick={() => addItem(true)}><IconPlus size={12} /> Honorarios</Button>
              </div>
            </div>
            <div className="border border-[#ECE8D6] rounded-[14px] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FBFAF3]">
                  <tr>
                    <th className="text-left text-[10px] font-semibold uppercase text-[#A8A29A] px-3 py-2">Descripción</th>
                    <th className="text-left text-[10px] font-semibold uppercase text-[#A8A29A] px-2 py-2 w-14">Cant.</th>
                    <th className="text-left text-[10px] font-semibold uppercase text-[#A8A29A] px-2 py-2 w-16">Unidad</th>
                    <th className="text-right text-[10px] font-semibold uppercase text-[#A8A29A] px-2 py-2 w-24">Precio unit.</th>
                    <th className="text-center text-[10px] font-semibold uppercase text-[#A8A29A] px-2 py-2 w-16">IVA</th>
                    <th className="text-right text-[10px] font-semibold uppercase text-[#A8A29A] px-3 py-2 w-28">Importe</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE0]">
                  {items.map(item => {
                    const importe = item.quantity * item.unit_price * (1 + item.iva / 100)
                    return (
                      <tr key={item.id} className={cn(item.honorarios && 'bg-[#FFF8F6]')}>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateItem(item.id, 'honorarios', !item.honorarios)}
                              title={item.honorarios ? 'Quitar honorarios' : 'Marcar como honorarios'}
                              className={cn(
                                'shrink-0 rounded-[5px] px-1.5 py-0.5 text-[8px] font-bold tracking-[0.04em] transition-colors',
                                item.honorarios
                                  ? 'bg-[#FFEDE9] text-[#C23A22]'
                                  : 'bg-[#F4F1E8] text-[#B7B1A4] hover:text-[#8A847B]'
                              )}
                            >
                              HON
                            </button>
                            <input
                              className="w-full text-sm text-[#130D10] bg-transparent border-0 outline-none focus:ring-1 focus:ring-[#F5D242] rounded px-1 py-0.5"
                              value={item.description}
                              onChange={e => updateItem(item.id, 'description', e.target.value)}
                              placeholder={item.honorarios ? 'Honorarios profesionales' : 'Descripción del ítem'}
                            />
                          </div>
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            className="w-12 text-sm text-center text-[#130D10] bg-transparent border-0 outline-none focus:ring-1 focus:ring-[#F5D242] rounded px-1 py-0.5"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                            min={0}
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <select
                            className="w-full text-xs text-[#6B655C] bg-transparent border-0 outline-none"
                            value={item.unit}
                            onChange={e => updateItem(item.id, 'unit', e.target.value)}
                          >
                            {['und', 'hr', 'm²', 'm³', 'ml', 'kg', 'gl', 'Global'].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-1.5">
                          <input
                            type="number"
                            className="w-full text-sm text-right text-[#130D10] bg-transparent border-0 outline-none focus:ring-1 focus:ring-[#F5D242] rounded px-1 py-0.5"
                            value={item.unit_price}
                            onChange={e => updateItem(item.id, 'unit_price', Number(e.target.value))}
                            min={0}
                          />
                        </td>
                        <td className="px-1 py-1.5">
                          <select
                            className="w-full text-xs text-center text-[#6B655C] bg-transparent border-0 outline-none"
                            value={item.iva}
                            onChange={e => updateItem(item.id, 'iva', Number(e.target.value))}
                          >
                            {IVA_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                          </select>
                        </td>
                        <td className={cn('px-2 py-1.5 text-right text-sm font-medium', item.honorarios ? 'text-[#C23A22]' : 'text-[#130D10]')}>
                          {formatCurrency(importe, currency)}
                        </td>
                        <td className="px-1 py-1.5">
                          {items.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="text-[#A8A29A] hover:text-[#C23A22] p-0.5">
                              <IconTrash size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t border-[#ECE8D6] bg-[#FFFCEF]">
                  <tr>
                    <td colSpan={5} className="px-3 py-1.5 text-[13px] text-right text-[#6B655C]">Subtotal (sin IVA)</td>
                    <td className="px-3 py-1.5 text-right text-[13px] font-medium text-[#130D10]">{formatCurrency(subtotal, currency)}</td>
                    <td />
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-1.5 text-[13px] text-right text-[#6B655C]">IVA</td>
                    <td className="px-3 py-1.5 text-right text-[13px] font-medium text-[#130D10]">{formatCurrency(ivaTotal, currency)}</td>
                    <td />
                  </tr>
                  <tr className="border-t border-[#ECE8D6]">
                    <td colSpan={5} className="px-3 py-2.5 text-sm font-semibold text-right text-[#130D10]">Total <span className="font-normal text-[#00846F] text-xs">IVA incluido</span></td>
                    <td className="px-3 py-2.5 text-right font-serif text-[18px] text-[#130D10]">{formatCurrency(total, currency)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <Textarea label="Notas / Condiciones" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condiciones de pago, validez del presupuesto, observaciones..." rows={3} />
        </div>
      ) : (
        /* Preview */
        <div className="bg-white border border-[#ECE8D6] rounded-[14px] p-6 font-sans">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-poppins text-[18px] font-semibold text-[#130D10] tracking-tight">folio</span>
              </div>
              <p className="text-xs text-[#A8A29A]">Estudio García</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#A8A29A]">Presupuesto N°</p>
              <p className="text-sm font-bold text-[#130D10]">{String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}</p>
              <p className="text-xs text-[#A8A29A] mt-1">{new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>

          <div className="border-t border-[#ECE8D6] pt-4 mb-4">
            <p className="text-[10px] font-semibold uppercase text-[#A8A29A] mb-1">Para</p>
            <p className="text-sm font-semibold text-[#130D10]">{clientName}</p>
            <p className="text-xs text-[#6B655C]">{projectName}</p>
          </div>

          <p className="text-sm font-semibold text-[#130D10] mb-3">{name}</p>

          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-[#ECE8D6]">
                <th className="text-left text-[10px] uppercase text-[#A8A29A] pb-2">Descripción</th>
                <th className="text-center text-[10px] uppercase text-[#A8A29A] pb-2 w-10">Cant.</th>
                <th className="text-center text-[10px] uppercase text-[#A8A29A] pb-2 w-10">Un.</th>
                <th className="text-right text-[10px] uppercase text-[#A8A29A] pb-2 w-20">P. Unit.</th>
                <th className="text-center text-[10px] uppercase text-[#A8A29A] pb-2 w-12">IVA</th>
                <th className="text-right text-[10px] uppercase text-[#A8A29A] pb-2 w-24">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE0]">
              {items.filter(i => i.description).map(item => {
                const importe = item.quantity * item.unit_price * (1 + item.iva / 100)
                return (
                  <tr key={item.id} className={cn(item.honorarios && 'bg-[#FFF8F6]')}>
                    <td className="py-2 text-[#130D10]">
                      <span className="flex items-center gap-1.5">
                        {item.honorarios && (
                          <span className="shrink-0 rounded-[4px] bg-[#FFEDE9] px-1.5 py-0.5 text-[8px] font-bold tracking-[0.04em] text-[#C23A22]">HONORARIOS</span>
                        )}
                        {item.description}
                      </span>
                    </td>
                    <td className="py-2 text-center text-[#6B655C]">{item.quantity}</td>
                    <td className="py-2 text-center text-[#6B655C]">{item.unit}</td>
                    <td className="py-2 text-right text-[#6B655C]">{formatCurrency(item.unit_price, currency)}</td>
                    <td className="py-2 text-center text-[#8A847B]">{item.iva}%</td>
                    <td className={cn('py-2 text-right font-medium', item.honorarios ? 'text-[#C23A22]' : 'text-[#130D10]')}>{formatCurrency(importe, currency)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex justify-end mb-4">
            <div className="w-64 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-[#6B655C]">
                <span>Subtotal (sin IVA)</span>
                <span className="font-medium text-[#130D10]">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B655C]">
                <span>IVA</span>
                <span className="font-medium text-[#130D10]">{formatCurrency(ivaTotal, currency)}</span>
              </div>
              <div className="mt-1 bg-[#FBF3D6] px-4 py-2 rounded-[14px] flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#7A6410] uppercase tracking-wide">Total</span>
                  <span className="text-[10px] text-[#00846F] font-semibold">IVA incluido</span>
                </div>
                <span className="font-serif text-[20px] text-[#130D10]">{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="border-t border-[#ECE8D6] pt-3">
              <p className="text-[10px] font-semibold uppercase text-[#A8A29A] mb-1">Notas y condiciones</p>
              <p className="text-xs text-[#6B655C] whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
