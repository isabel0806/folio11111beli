'use client'
import { use, useEffect, useState } from 'react'
import { mockProjects } from '@/lib/mock-data'
import { getBudget, decodeBudget, type StoredBudgetItem } from '@/lib/budget-store'

type BudgetItem = StoredBudgetItem

const exampleItems: BudgetItem[] = [
  { detail: 'Demolición y retiro de escombros', qty: 1, unit: 'Global', price: 400000, iva: 21 },
  { detail: 'Contrapiso y carpeta de nivelación', qty: 100, unit: 'm²', price: 10000, iva: 21 },
  { detail: 'Colocación de pisos', qty: 100, unit: 'm²', price: 15000, iva: 21 },
  { detail: 'Pintura interior completa', qty: 300, unit: 'm²', price: 3000, iva: 21 },
  { detail: 'Honorarios profesionales', qty: 1, unit: 'Global', price: 1200000, iva: 21, honorarios: true },
]

const fmt = (n: number) => '$ ' + n.toLocaleString('es-AR')

export default function PresupuestoPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find(p => p.id === id)
  const projectName = project?.name || 'Casa Palermo'
  const client = project?.client_name || 'Familia Rodríguez'

  // Read the budget armed in the builder (stored client-side). Falls back to the
  // example items when nothing has been saved for this project yet.
  const [items, setItems] = useState<BudgetItem[]>(exampleItems)
  useEffect(() => {
    // 1) data embedded in the share link, 2) this browser's saved budget, 3) example
    const d = new URLSearchParams(window.location.search).get('d')
    const stored = (d && decodeBudget(d)) || getBudget(id)
    if (stored && stored.items.length) setItems(stored.items)
  }, [id])

  const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0)
  const ivaTotal = items.reduce((a, it) => a + it.qty * it.price * (it.iva / 100), 0)
  const total = subtotal + ivaTotal

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFEF0]">
      {/* Public bar */}
      <div className="flex items-center justify-between w-full py-4.5 px-10 bg-[#FFFEF0] border-b border-[#E0DCCE]">
        <div className="flex items-center gap-3.25">
          <div className="flex items-center justify-center shrink-0 rounded-[11px] bg-[#130D10] size-10">
            <span className="font-serif text-[#FFFEF0] text-lg">G</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-[#130D10] text-sm">Estudio García</span>
            <span className="text-[#8A847B] text-xs">Presupuesto P-2026-014</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center rounded-full py-2.5 px-4 gap-2 bg-[#FFFEF0] border border-[#D6D1C2] hover:bg-white transition-colors">
            <span className="font-semibold text-[#6B655C] text-[13px]">Pedir cambios</span>
          </button>
          <button className="flex items-center rounded-full py-2.75 px-4.5 gap-2 bg-[#FFFEF0] border-[1.5px] border-[#00846F] hover:bg-[#F4FAF8] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M20 6L9 17l-5-5" fill="none" stroke="#00846F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-[#00846F] text-sm">Aprobar presupuesto</span>
          </button>
          <button className="flex items-center rounded-full py-2.75 px-4.5 gap-2 bg-[#FF5738] hover:bg-[#C23A22] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="#FFFEF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10l5 5 5-5" fill="none" stroke="#FFFEF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 15V3" fill="none" stroke="#FFFEF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-[#FFFEF0] text-sm">Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex justify-center px-5 py-10">
        <div className="flex flex-col w-full max-w-[860px] rounded-[20px] overflow-clip shadow-[0_24px_60px_rgba(19,13,16,0.12)] bg-white">
          {/* Header */}
          <div className="flex flex-col pt-12 pb-8 gap-7 px-13">
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-1.5">
                <h1 className="font-serif text-[#130D10] text-[26px] leading-8">Estudio García</h1>
                <span className="text-[#8A847B] text-[13px]">Arquitectura &amp; dirección de obra</span>
                <span className="text-[#8A847B] text-[13px]">hola@estudiogarcia.com · +54 11 4567 1200</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="tracking-[0.12em] font-bold text-[#FF5738] text-xs">PRESUPUESTO</span>
                <span className="font-serif text-[#130D10] text-xl">P-2026-014</span>
                <span className="text-[#8A847B] text-xs">Emitido 15 jun 2026 · Válido hasta 15 jul 2026</span>
              </div>
            </div>
            <div className="h-px shrink-0 bg-[#F2EFE2]" />
            <div className="flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="tracking-[0.06em] font-semibold text-[#A8A29A] text-[11px]">PARA</span>
                <span className="font-semibold text-[#130D10] text-[15px]">{client}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="tracking-[0.06em] font-semibold text-[#A8A29A] text-[11px]">PROYECTO</span>
                <span className="font-semibold text-[#130D10] text-[15px]">{projectName} · Vivienda unifamiliar</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col px-14">
            {/* Head */}
            <div className="flex items-center py-2.75 px-4 border-b border-[#ECE9DA]">
              <div className="grow basis-0 tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">DETALLE</div>
              <div className="w-12 shrink-0 text-center tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">CANT.</div>
              <div className="w-18 shrink-0 text-center tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">UNIDAD</div>
              <div className="w-26 shrink-0 text-right tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">P. UNITARIO</div>
              <div className="w-13 shrink-0 text-center tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">IVA</div>
              <div className="w-29 shrink-0 text-right tracking-[0.08em] font-semibold text-[#A8A29A] text-[10px]">IMPORTE</div>
            </div>
            {items.map((it) => {
              const importe = it.qty * it.price * (1 + it.iva / 100)
              return (
                <div
                  key={it.detail}
                  className={`flex items-center p-4 border-b border-[#F2EFE2] ${it.honorarios ? 'bg-[#FFF8F6]' : ''}`}
                >
                  <div className="grow basis-0 flex items-center gap-2.5 min-w-0">
                    {it.honorarios && (
                      <span className="flex items-center rounded-[5px] py-0.75 px-2 bg-[#FFEDE9] tracking-[0.06em] font-bold text-[#C23A22] text-[9px]">
                        HONORARIOS
                      </span>
                    )}
                    <span className="text-[#130D10] text-[15px]">{it.detail}</span>
                  </div>
                  <div className="w-12 shrink-0 text-center text-[#6B655C] text-sm">{it.qty}</div>
                  <div className="w-18 shrink-0 text-center text-[#6B655C] text-sm">{it.unit}</div>
                  <div className="w-26 shrink-0 text-right text-[#6B655C] text-sm">{fmt(it.price)}</div>
                  <div className="w-13 shrink-0 text-center text-[#8A847B] text-[13px]">{it.iva}%</div>
                  <div className={`w-29 shrink-0 text-right text-[15px] ${it.honorarios ? 'font-bold text-[#C23A22]' : 'font-semibold text-[#130D10]'}`}>
                    {fmt(importe)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-5 pb-2 px-13">
            <div className="flex flex-col w-85 shrink-0">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#6B655C] text-sm">Subtotal (sin IVA)</span>
                <span className="font-semibold text-[#130D10] text-sm">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#6B655C] text-sm">IVA (21%)</span>
                <span className="font-semibold text-[#130D10] text-sm">{fmt(ivaTotal)}</span>
              </div>
              <div className="h-px mt-1.5 shrink-0 bg-[#ECE9DA]" />
              <div className="flex items-end justify-between pt-3.5 pb-1.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[#130D10] text-sm">Total</span>
                  <span className="font-semibold text-[#00846F] text-xs">IVA incluido</span>
                </div>
                <span className="font-serif text-[#130D10] text-[28px] leading-none">{fmt(total)}</span>
              </div>
              <div className="flex items-center justify-between mt-2 rounded-[10px] py-2 px-3 bg-[#FBFAF3]">
                <span className="text-[#8A847B] text-xs">Total sin IVA</span>
                <span className="font-semibold text-[#6B655C] text-[13px]">{fmt(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Condiciones */}
          <div className="flex flex-col pt-5 pb-2 gap-2.25 px-13">
            <span className="tracking-[0.06em] font-bold text-[#A8A29A] text-xs">CONDICIONES</span>
            <div className="flex flex-col gap-1.5 text-[13px] leading-[160%] text-[#6B655C]">
              <span>· Anticipo del 30% para iniciar el anteproyecto.</span>
              <span>· Saldo en certificaciones mensuales según avance de obra.</span>
              <span>· Presupuesto válido por 30 días. Valores expresados en pesos argentinos.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 py-5.5 px-13 bg-[#FBFAF3] border-t border-[#F2EFE2]">
            <div className="flex items-center gap-2">
              <span className="text-[#A8A29A] text-xs">Hecho con</span>
              <span className="font-poppins font-semibold text-[#130D10] text-sm">folio</span>
            </div>
            <span className="text-[#A8A29A] text-xs">Este documento se generó automáticamente y puede descargarse en PDF.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
