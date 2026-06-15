'use client'
import { use, useState } from 'react'
import { mockProjects, mockMilestones, currentUser } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'

function Wordmark() {
  return (
    <div className="flex items-center gap-2.25">
      <div className="w-5.5 h-7.5 relative shrink-0">
        <div className="left-0 top-0 w-2.75 h-7.5 rounded-sm absolute bg-[#7FB0E8]" />
        <div className="left-2.75 top-0 w-2 h-3.5 absolute bg-[#D5D25D] rounded-r-lg" />
        <div className="left-2.75 top-3.75 w-1.75 h-2.75 rounded-tr-[7px] rounded-br-[7px] absolute bg-[#FF5738]" />
      </div>
      <span className="font-poppins font-semibold text-[#130D10] text-[22px] leading-7">folio</span>
    </div>
  )
}

interface Step {
  title: string
  desc: string
  state: 'done' | 'current' | 'next'
}

const steps: Step[] = [
  { title: 'Diseño inicial', desc: 'Definimos la distribución y el concepto de tu casa.', state: 'done' },
  { title: 'Planos aprobados', desc: 'Los planos básicos quedaron listos y aprobados.', state: 'done' },
  { title: 'En obra · estás acá', desc: 'Estamos construyendo. Te vamos compartiendo los avances.', state: 'current' },
  { title: 'Entrega final', desc: 'Terminación y entrega de tu casa lista para habitar.', state: 'next' },
]

export default function PortalClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = mockProjects.find(p => p.id === id)
  const name = project?.name || 'Casa Palermo'
  const client = project?.client_name || 'Familia Rodríguez'
  const currency = project?.currency || 'USD'
  const progress = project?.progress ?? 65

  // Next payment from the project milestones
  const ms = mockMilestones[id] || []
  const nextMs = ms.find(m => m.status === 'pendiente') || ms.find(m => m.status === 'vencido')
  const payAmount = nextMs ? formatCurrency(nextMs.amount, currency) : 'USD 4.500'
  const payDetail = nextMs
    ? `${nextMs.name} · vence el ${formatDate(nextMs.due_date)}`
    : 'Entrega de los planos ejecutivos · vence el 20 de junio'
  const alias = currentUser.cbu_alias || 'isabel.garcia.arq'

  // Interactions (local — this is the client-facing demo)
  const [approval, setApproval] = useState<'idle' | 'approved' | 'changing' | 'change-sent'>('idle')
  const [changeMsg, setChangeMsg] = useState('')
  const [payOpen, setPayOpen] = useState(false)
  const [paid, setPaid] = useState(false)

  const waLink = `https://wa.me/?text=${encodeURIComponent(`Hola Isabel! Te escribo por ${name}.`)}`

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFEF0]">
      {/* Topbar */}
      <div className="flex items-center justify-between w-full py-5.5 px-10 border-b border-[#ECE9DA] bg-[#FFFEF0]">
        <Wordmark />
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7.5 h-7.5 rounded-full shrink-0 bg-[#00846F]">
            <span className="font-bold text-[#FFFEF0] text-[11px]">IG</span>
          </div>
          <span className="text-[13px] text-[#6B655C]">Proyecto compartido por Isabel García</span>
        </div>
      </div>

      {/* Page */}
      <div className="flex flex-col w-full max-w-[760px] mx-auto px-5 pt-10 pb-14 gap-4.5">
        {/* Hero */}
        <div className="flex flex-col rounded-[26px] py-8.5 px-9 overflow-clip gap-5.5 relative bg-[#7FB0E8]">
          <div className="flex flex-col gap-2.5">
            <span className="tracking-[0.04em] uppercase font-semibold text-[#1C3F63] text-[13px]">Tu proyecto</span>
            <h1 className="font-serif font-bold text-[#130D10] text-[42px] leading-[105%]">{name}</h1>
            <p className="text-[#234B72] text-sm">Reforma integral · {client} · Comenzó en enero 2024</p>
          </div>
          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-col grow basis-0 gap-2.25">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#130D10] text-[13px]">Avance general</span>
                <span className="font-medium text-[#234B72] text-[13px]">Vamos muy bien</span>
              </div>
              <div className="flex w-full h-2.75 rounded-full overflow-clip shrink-0 bg-white/40">
                <div className="h-2.75 rounded-full bg-[#130D10]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="font-serif font-bold text-[#130D10] text-[48px] leading-[90%]">{progress}%</span>
          </div>
          <svg width="150" height="150" viewBox="0 0 24 24" className="absolute -top-5 -right-2.5" aria-hidden>
            <path d="M12 0 C12 6 6 12 0 12 C6 12 12 18 12 24 C12 18 18 12 24 12 C18 12 12 6 12 0Z" fill="#FFFEF0" />
          </svg>
        </div>

        {/* Etapas */}
        <div className="flex flex-col rounded-[20px] py-6.5 px-7 gap-4 bg-white border border-[#ECE9DA]">
          <h2 className="font-serif font-bold text-[#130D10] text-[19px]">Cómo viene tu obra</h2>
          <div className="flex flex-col gap-0.5">
            {steps.map((s, i) => {
              const isLast = i === steps.length - 1
              return (
                <div key={s.title} className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center shrink-0">
                    {s.state === 'done' && (
                      <div className="flex items-center justify-center w-6.5 h-6.5 rounded-full shrink-0 bg-[#00846F]">
                        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
                          <path d="M20 6L9 17l-5-5" fill="none" stroke="#FFFEF0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    {s.state === 'current' && (
                      <div className="w-6.5 h-6.5 rounded-full shrink-0 bg-[#FF5738] border-[3px] border-[#FFD9CF]" />
                    )}
                    {s.state === 'next' && (
                      <div className="w-6.5 h-6.5 rounded-full shrink-0 bg-white border-2 border-[#E6E2D2]" />
                    )}
                    {!isLast && <div className="w-0.5 h-7.5 shrink-0" style={{ backgroundColor: s.state === 'done' ? '#00846F' : '#E6E2D2' }} />}
                  </div>
                  <div className={`flex flex-col gap-px ${isLast ? '' : 'pb-3.5'}`}>
                    <span className={
                      s.state === 'current'
                        ? 'font-bold text-[#130D10] text-sm'
                        : s.state === 'next'
                          ? 'font-semibold text-[#A8A29A] text-sm'
                          : 'font-semibold text-[#130D10] text-sm'
                    }>
                      {s.title}
                    </span>
                    <span className={`text-[12.5px] ${s.state === 'next' ? 'text-[#BDB8AE]' : 'text-[#8A847B]'}`}>{s.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aprobación */}
        <div className="flex flex-col rounded-[20px] py-6.5 px-7 overflow-clip gap-4.5 relative bg-[#F5D242]">
          <div className="flex items-center gap-2.25">
            <div className="flex items-center justify-center w-7.5 h-7.5 rounded-full shrink-0 bg-[#130D10]">
              {approval === 'approved' || approval === 'change-sent' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20 6L9 17l-5-5" fill="none" stroke="#F5D242" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" fill="none" stroke="#F5D242" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="tracking-[0.06em] uppercase font-bold text-[#7A6410] text-xs">
              {approval === 'approved' ? 'Aprobado · ¡gracias!' : approval === 'change-sent' ? 'Comentario enviado' : 'Pendiente tu aprobación'}
            </span>
          </div>

          {approval === 'approved' ? (
            <div className="flex flex-col gap-1.25">
              <h3 className="font-serif font-bold text-[#130D10] text-[22px] leading-7">¡Listo! Aprobaste los planos</h3>
              <p className="text-[#5C4F12] text-[13.5px]">Le avisamos a Isabel y arrancamos con esta etapa de obra. Te vamos compartiendo los avances por acá.</p>
            </div>
          ) : approval === 'change-sent' ? (
            <div className="flex flex-col gap-1.25">
              <h3 className="font-serif font-bold text-[#130D10] text-[22px] leading-7">Recibimos tu comentario</h3>
              <p className="text-[#5C4F12] text-[13.5px]">Isabel lo va a revisar y te escribe para coordinar los cambios. ¡Gracias!</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.25">
                <h3 className="font-serif font-bold text-[#130D10] text-[22px] leading-7">Revisá los planos del proyecto ejecutivo</h3>
                <p className="text-[#5C4F12] text-[13.5px]">Cuando los apruebes, arrancamos con esta etapa de obra. Si querés cambiar algo, escribime y lo vemos.</p>
              </div>

              {approval === 'changing' ? (
                <div className="flex flex-col gap-2.5">
                  <textarea
                    autoFocus
                    value={changeMsg}
                    onChange={e => setChangeMsg(e.target.value)}
                    placeholder="Contame qué te gustaría cambiar…"
                    rows={3}
                    className="w-full resize-none rounded-[14px] bg-[#FFFEF0] border border-[#E2C94A] px-4 py-3 text-sm text-[#130D10] placeholder:text-[#A89A4E] outline-none focus:ring-2 focus:ring-[#130D10]/15"
                  />
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setApproval('change-sent')}
                      disabled={!changeMsg.trim()}
                      className="flex items-center rounded-full py-3 px-5.5 gap-2 bg-[#130D10] text-[#FFFEF0] text-sm font-semibold hover:bg-[#2A2025] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Enviar comentario
                    </button>
                    <button onClick={() => setApproval('idle')} className="rounded-full py-3 px-5.5 bg-[#FFFEF0] border border-[#E2C94A] text-[#130D10] text-sm font-semibold hover:bg-white transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setApproval('approved')} className="flex items-center rounded-full py-3 px-5.5 gap-2 bg-[#130D10] hover:bg-[#2A2025] transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                      <path d="M20 6L9 17l-5-5" fill="none" stroke="#FFFEF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-semibold text-[#FFFEF0] text-sm">Aprobar planos</span>
                  </button>
                  <button onClick={() => setApproval('changing')} className="flex items-center rounded-full py-3 px-5.5 gap-2 bg-[#FFFEF0] border border-[#E2C94A] hover:bg-white transition-colors">
                    <span className="font-semibold text-[#130D10] text-sm">Pedir un cambio</span>
                  </button>
                </div>
              )}
            </>
          )}

          <svg width="120" height="120" viewBox="0 0 24 24" className="absolute -bottom-5.5 -right-2.5 pointer-events-none" aria-hidden>
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" fill="#130D10" />
          </svg>
        </div>

        {/* Pago */}
        <div className="flex flex-col rounded-[20px] py-6 px-7 gap-4 bg-white border border-[#ECE9DA]">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center shrink-0 rounded-[14px] size-12 ${paid ? 'bg-[#E4F1EC]' : 'bg-[#FFEDE9]'}`}>
                {paid ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="#00846F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="#FF5738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 10h20" fill="none" stroke="#FF5738" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-0.75">
                <span className="tracking-[0.04em] uppercase font-semibold text-[#A8A29A] text-xs">{paid ? 'Pago informado' : 'Próximo pago'}</span>
                <span className="font-serif font-bold text-[#130D10] text-[21px] leading-6">{payAmount}</span>
                <span className="text-[#8A847B] text-[13px]">{paid ? '¡Gracias! Isabel confirma la acreditación y seguimos.' : payDetail}</span>
              </div>
            </div>
            {!paid && (
              <button onClick={() => setPayOpen(o => !o)} className="flex items-center shrink-0 rounded-full py-3.5 px-6.5 gap-2 bg-[#FF5738] hover:bg-[#C23A22] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="#FFFEF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 10h20" fill="none" stroke="#FFFEF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-semibold text-[#FFFEF0] text-sm">Pagar ahora</span>
              </button>
            )}
            {paid && (
              <span className="flex items-center shrink-0 gap-1.5 rounded-full py-2.5 px-4 bg-[#E4F1EC] text-[#00846F] text-sm font-semibold">
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path d="M20 6L9 17l-5-5" fill="none" stroke="#00846F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Informado
              </span>
            )}
          </div>

          {payOpen && !paid && (
            <div className="flex flex-col gap-3 pt-4 border-t border-[#F2EFE2]">
              <p className="text-[13px] text-[#6B655C]">Transferí a este alias y después tocá <span className="font-semibold text-[#130D10]">"Ya transferí"</span>. Isabel confirma la acreditación.</p>
              <div className="flex items-center justify-between rounded-[14px] bg-[#FBFAF3] border border-[#ECE9DA] px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="tracking-[0.04em] uppercase font-semibold text-[#A8A29A] text-[10px]">Alias</span>
                  <span className="font-semibold text-[#130D10] text-[15px]">{alias}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(alias)}
                  className="rounded-full py-2 px-3.5 bg-white border border-[#ECE9DA] text-[#6B655C] text-[13px] font-semibold hover:bg-[#FBFAF3] transition-colors"
                >
                  Copiar alias
                </button>
              </div>
              <div className="flex items-center justify-between rounded-[14px] bg-[#FBFAF3] border border-[#ECE9DA] px-4 py-3">
                <span className="tracking-[0.04em] uppercase font-semibold text-[#A8A29A] text-[10px]">Importe</span>
                <span className="font-serif font-bold text-[#130D10] text-[17px]">{payAmount}</span>
              </div>
              <button
                onClick={() => { setPaid(true); setPayOpen(false) }}
                className="self-start flex items-center rounded-full py-3 px-5.5 gap-2 bg-[#00846F] hover:bg-[#006B5A] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M20 6L9 17l-5-5" fill="none" stroke="#FFFEF0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span className="font-semibold text-[#FFFEF0] text-sm">Ya transferí</span>
              </button>
            </div>
          )}
        </div>

        {/* Descargas */}
        <div className="flex flex-col rounded-[20px] py-6.5 px-7 gap-3.5 bg-white border border-[#ECE9DA]">
          <h2 className="font-serif font-bold text-[#130D10] text-[19px]">Para descargar</h2>
          <div className="flex items-center py-3.25 gap-3.5 border-t border-[#F2EFE2]">
            <div className="flex items-center justify-center shrink-0 rounded-[11px] bg-[#E4F1EC] size-10">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M14 3v4a1 1 0 001 1h4" fill="none" stroke="#00846F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" fill="none" stroke="#00846F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col grow basis-0 min-w-0 gap-0.5">
              <span className="font-semibold text-[#130D10] text-[14.5px]">Planos del anteproyecto</span>
              <span className="text-[#A8A29A] text-xs">PDF · 8.1 MB · disponible</span>
            </div>
            <button className="flex items-center shrink-0 rounded-full py-2.25 px-4 gap-1.75 bg-[#00846F] hover:bg-[#006B5A] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 3v12M7 11l5 4 5-4M5 21h14" fill="none" stroke="#FFFEF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-semibold text-[#FFFEF0] text-[13px]">Descargar</span>
            </button>
          </div>
          <div className="flex items-center pt-3.25 pb-0.5 gap-3.5 border-t border-[#F2EFE2]">
            <div className="flex items-center justify-center shrink-0 rounded-[11px] bg-[#F4F1E3] size-10">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="#BDB8AE" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="#BDB8AE" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col grow basis-0 min-w-0 gap-0.5">
              <span className="font-semibold text-[#A8A29A] text-[14.5px]">Planos ejecutivos</span>
              <span className="text-[#BDB8AE] text-xs">Se desbloquean cuando abones el próximo pago</span>
            </div>
            <div className="flex items-center shrink-0 rounded-full py-2.25 px-3.75 gap-1.5 bg-[#F4F1E3]">
              <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="#A8A29A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="#A8A29A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-semibold text-[#8A847B] text-[13px]">Bloqueado</span>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="flex items-center justify-between rounded-[20px] py-6 px-7 gap-5 bg-[#130D10]">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif font-bold text-[#FFFEF0] text-[19px]">¿Tenés alguna duda?</h2>
            <p className="text-[#B8B2A8] text-[13.5px]">Escribime cuando quieras, te respondo a la brevedad.</p>
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center shrink-0 rounded-full py-3.25 px-6 gap-2.25 bg-[#25D366] hover:bg-[#1FB855] transition-colors">
            <svg width="17" height="17" viewBox="0 0 448 512" aria-hidden>
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l119.7-31.4c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-69.2-156.5zM223.9 438.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-71 18.6 19-69.3-4.4-7.2c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.5-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-65.9-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.5-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.7 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" fill="#FFFFFF" />
            </svg>
            <span className="font-semibold text-white text-sm">Escribir a Isabel</span>
          </a>
        </div>
      </div>
    </div>
  )
}
