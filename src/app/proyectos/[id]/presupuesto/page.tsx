'use client'
import { useParams } from 'next/navigation'
import { mockProjects, mockMilestones, mockCertifications } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { IconPlus } from '@tabler/icons-react'
import type { PaymentMilestone } from '@/lib/types'

const stageDots = ['#FF5738', '#7FB0E8', '#D5D25D', '#00846F', '#F5D242']

const stageStatus: Record<PaymentMilestone['status'], { label: string; bg: string; text: string }> = {
  cobrado: { label: 'Cobrado', bg: 'bg-[#E4F1EC]', text: 'text-[#00846F]' },
  pendiente: { label: 'Por certificar', bg: 'bg-[#FFF3E0]', text: 'text-[#B8762A]' },
  vencido: { label: 'Vencido', bg: 'bg-[#FFE6DF]', text: 'text-[#C23A22]' },
  futuro: { label: 'Programado', bg: 'bg-[#F4F1E8]', text: 'text-[#8A847B]' },
}

const certStatus: Record<string, { label: string; cardBg: string; text: string; amountText: string }> = {
  aprobada: { label: 'Aprobada', cardBg: 'bg-[#E4F1EC]', text: 'text-[#00846F]', amountText: 'text-[#130D10]' },
  enviada: { label: 'Enviada', cardBg: 'bg-[#EAF2FC]', text: 'text-[#3F6FA3]', amountText: 'text-[#130D10]' },
  pendiente: { label: 'Pendiente', cardBg: 'bg-[#FBFAF3] border border-[#F2EFE2]', text: 'text-[#8A847B]', amountText: 'text-[#A8A29A]' },
}

export default function PresupuestoPage() {
  const { id } = useParams() as { id: string }
  const project = mockProjects.find(p => p.id === id)
  const currency = project?.currency || 'ARS'
  const milestones = mockMilestones[id] || []
  const certifications = mockCertifications[id] || []

  const total = project?.total_amount || milestones.reduce((a, m) => a + m.amount, 0)
  const cobrado = milestones.filter(m => m.status === 'cobrado').reduce((a, m) => a + m.amount, 0)
  const pendienteMs = milestones.filter(m => m.status === 'pendiente' || m.status === 'vencido')
  const pendiente = pendienteMs.reduce((a, m) => a + m.amount, 0)
  const cobradoPct = total > 0 ? Math.round((cobrado / total) * 100) : 0
  const nextMilestone = milestones.find(m => m.status === 'pendiente') || milestones.find(m => m.status === 'vencido')

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-2xl py-5 px-5.5 bg-[#FBFAF3] border border-[#ECE8D6]">
          <span className="text-[12.5px] text-[#8A847B]">Honorarios totales</span>
          <span className="font-serif text-[27px] leading-none text-[#130D10]">{formatCurrency(total, currency)}</span>
          <span className="text-xs text-[#A8A29A]">IVA incluido</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl py-5 px-5.5 bg-[#FBFAF3] border border-[#ECE8D6]">
          <span className="text-[12.5px] text-[#8A847B]">Cobrado</span>
          <span className="font-serif text-[27px] leading-none text-[#00846F]">{formatCurrency(cobrado, currency)}</span>
          <div className="flex items-center gap-2">
            <div className="grow h-1.5 rounded-[3px] overflow-hidden bg-[#E4F1EC]">
              <div className="h-1.5 rounded-[3px] bg-[#00846F]" style={{ width: `${cobradoPct}%` }} />
            </div>
            <span className="text-xs font-semibold text-[#00846F]">{cobradoPct}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl py-5 px-5.5 bg-[#FBFAF3] border border-[#ECE8D6]">
          <span className="text-[12.5px] text-[#8A847B]">Pendiente</span>
          <span className="font-serif text-[27px] leading-none text-[#130D10]">{formatCurrency(pendiente, currency)}</span>
          <span className="text-xs text-[#A8A29A]">{pendienteMs.length} etapa{pendienteMs.length === 1 ? '' : 's'} por cobrar</span>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl py-5 px-5.5 bg-[#FFEDE9] border border-[#FFD9D1]">
          <span className="text-[12.5px] text-[#C23A22]">Próximo cobro</span>
          <span className="font-serif text-[27px] leading-none text-[#130D10]">
            {nextMilestone ? formatCurrency(nextMilestone.amount, currency) : '—'}
          </span>
          <span className="text-xs font-semibold text-[#C23A22]">
            {nextMilestone ? `${nextMilestone.name} · ${formatDate(nextMilestone.due_date)}` : 'Sin cobros pendientes'}
          </span>
        </div>
      </div>

      {/* Cobros row */}
      <div className="flex items-start gap-4">
        {/* Etapas de cobro */}
        <div className="flex flex-col grow-[1.4] basis-0 rounded-[18px] p-6 bg-[#FBFAF3] border border-[#ECE8D6]">
          <div className="flex items-center justify-between pb-4">
            <h2 className="font-serif text-[19px] text-[#130D10]">Etapas de cobro</h2>
            <button className="flex items-center gap-1 text-[13px] font-semibold text-[#FF5738] hover:text-[#C23A22] transition-colors">
              <IconPlus size={13} stroke={2} /> Registrar cobro
            </button>
          </div>
          <div className="flex pb-2.5 px-2">
            <span className="grow-[2.4] basis-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#A8A29A]">Etapa</span>
            <span className="grow-[0.8] basis-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#A8A29A]">%</span>
            <span className="grow-[1.4] basis-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#A8A29A]">Monto</span>
            <span className="grow-[1.4] basis-0 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#A8A29A]">Estado</span>
          </div>
          {milestones.length === 0 ? (
            <p className="px-2 py-4 text-sm text-[#A8A29A] border-t border-[#F2EFE2]">No hay etapas de cobro cargadas.</p>
          ) : (
            milestones.map((m, i) => {
              const pct = total > 0 ? Math.round((m.amount / total) * 100) : 0
              const st = stageStatus[m.status]
              return (
                <div key={m.id} className="flex items-center py-3.5 px-2 border-t border-[#F2EFE2]">
                  <div className="grow-[2.4] basis-0 flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-[5px] shrink-0" style={{ backgroundColor: stageDots[i % stageDots.length] }} />
                    <span className="text-sm text-[#130D10] truncate">{m.name}</span>
                  </div>
                  <span className="grow-[0.8] basis-0 text-[13px] text-[#6B655C]">{pct}%</span>
                  <span className="grow-[1.4] basis-0 text-sm font-medium text-[#130D10]">{formatCurrency(m.amount, currency)}</span>
                  <div className="grow-[1.4] basis-0">
                    <span className={`inline-flex items-center rounded-full py-1 px-2.5 text-xs font-semibold ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Certificaciones de obra */}
        <div className="flex flex-col grow basis-0 rounded-[18px] p-6 gap-3.5 bg-[#FBFAF3] border border-[#ECE8D6]">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-[19px] text-[#130D10]">Certificaciones de obra</h2>
            <p className="text-[12.5px] text-[#8A847B]">Dirección de obra · avance mensual</p>
          </div>
          {certifications.length === 0 ? (
            <p className="text-sm text-[#A8A29A]">No hay certificaciones para este proyecto.</p>
          ) : (
            certifications.map(c => {
              const cs = certStatus[c.status]
              return (
                <div key={c.id} className={`flex items-center justify-between rounded-xl py-3.5 px-3.5 ${cs.cardBg}`}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-[#130D10]">{c.label}</span>
                    <span className="text-xs text-[#6B655C]">{c.advance}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-sm font-semibold ${cs.amountText}`}>{formatCurrency(c.amount, currency)}</span>
                    <span className={`text-[11px] font-semibold ${cs.text}`}>{cs.label}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
