'use client'
import Link from 'next/link'

interface IndexItem { n: string; label: string; href: string }
interface IndexCol { key: string; dot: string; bg: string; border: string; items: IndexItem[] }

const columns: IndexCol[] = [
  {
    key: 'NÚCLEO', dot: '#FF5738', bg: '#FF57381A', border: '#FF57384D',
    items: [
      { n: '01', label: 'Inicio', href: '/' },
      { n: '02', label: 'Proyectos', href: '/proyectos' },
      { n: '03', label: 'Detalle de proyecto', href: '/proyectos/p1' },
      { n: '04', label: 'Cronograma de obra', href: '/proyectos/p1/control' },
    ],
  },
  {
    key: 'GESTIÓN', dot: '#7FB0E8', bg: '#7FB0E81F', border: '#7FB0E852',
    items: [
      { n: '05', label: 'Finanzas', href: '/finanzas' },
      { n: '06', label: 'Estudio', href: '/estudio' },
      { n: '07', label: 'Ajustes', href: '/ajustes' },
    ],
  },
  {
    key: 'AGENDA', dot: '#00846F', bg: '#00846F24', border: '#00846F57',
    items: [
      { n: '08', label: 'Vista Mes', href: '/agenda' },
      { n: '09', label: 'Vista Semana', href: '/agenda' },
      { n: '10', label: 'Vista Día', href: '/agenda' },
    ],
  },
  {
    key: 'CLIENTE', dot: '#F5D242', bg: '#F5D24224', border: '#F5D24257',
    items: [
      { n: '11', label: 'Portal del cliente', href: '/portal/p1' },
      { n: '12', label: 'Presupuesto público', href: '/presupuesto/p1' },
    ],
  },
  {
    key: 'ESTUDIO', dot: '#FFABCF', bg: '#FFABCF21', border: '#FFABCF57',
    items: [
      { n: '13', label: 'Cronograma maestro', href: '/cronograma' },
      { n: '14', label: 'Nueva tarea', href: '/proyectos/p1/control' },
      { n: '15', label: 'Bitácora de obra', href: '/proyectos/p1/bitacora' },
    ],
  },
]

const stats = [
  { n: '16', label: 'pantallas diseñadas', color: 'text-[#FF5738]' },
  { n: '8', label: 'colores de marca', color: 'text-[#7FB0E8]' },
  { n: '2', label: 'tipografías · Libre + Inter', color: 'text-[#00846F]' },
  { n: '5', label: 'fases de obra modeladas', color: 'text-[#F5D242]' },
]

export default function PortadaPage() {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#130D10]">
      <div className="flex flex-col w-full max-w-[1296px] mx-auto px-12 py-12 gap-12">
        {/* Top */}
        <div className="flex flex-col gap-12">
          {/* Brand row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-[11px] shrink-0 bg-[#FF5738] size-10">
                <span className="font-poppins font-semibold text-[#FFFEF0] text-[22px]">F</span>
              </div>
              <span className="font-poppins font-semibold text-[#FFFEF0] text-2xl">Folio</span>
            </div>
            <div className="flex items-center rounded-[20px] py-2 px-4 gap-2.25 border border-[#FFFEF038]">
              <span className="rounded-sm shrink-0 bg-[#D5D25D] size-2" />
              <span className="font-medium text-[#B7B1A4] text-[13px]">Design system · v2</span>
            </div>
          </div>

          {/* Hero */}
          <div className="flex flex-col gap-6">
            <span className="tracking-[0.14em] font-semibold text-[#FF5738] text-sm">REINTERPRETACIÓN EDITORIAL</span>
            <h1 className="font-serif font-bold text-[#FFFEF0] text-[68px] leading-[104%] max-w-[1000px]">
              El sistema para estudios de arquitectura
            </h1>
            <p className="text-[19px] leading-[150%] max-w-[760px] text-[#B7B1A4]">
              Proyectos, honorarios, cronograma de obra y portal del cliente — con la voz de marca de Folio. 16 pantallas, un flujo completo de principio a fin.
            </p>
          </div>

          {/* Stat band */}
          <div className="flex pt-2 gap-3.5">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col grow basis-0 rounded-2xl py-5.5 px-6 gap-1.5 border border-[#FFFEF024]">
                <span className={`font-serif font-bold text-[38px] leading-[1.1] ${s.color}`}>{s.n}</span>
                <span className="text-[#B7B1A4] text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Index */}
        <div className="flex gap-4">
          {columns.map((col) => (
            <div
              key={col.key}
              className="flex flex-col grow basis-0 rounded-[18px] py-6 px-5.5 gap-4 border"
              style={{ backgroundColor: col.bg, borderColor: col.border }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.75 h-2.75 rounded-md shrink-0" style={{ backgroundColor: col.dot }} />
                <span className="tracking-[0.04em] font-bold text-[#FFFEF0] text-[13px]">{col.key}</span>
              </div>
              <div className="flex flex-col gap-2.25">
                {col.items.map((it) => (
                  <Link
                    key={it.n}
                    href={it.href}
                    className="text-[#D9D4CB] text-sm hover:text-[#FFFEF0] transition-colors"
                  >
                    {it.n} · {it.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
