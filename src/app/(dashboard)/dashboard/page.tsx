import { supabase } from '@/lib/supabase'

async function getStats() {
  const [{ count: totalClients }, { count: pendingContent }, { count: activeClients }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('content_pieces').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])
  return { totalClients, pendingContent, activeClients }
}

export default async function DashboardHome() {
  const stats = await getStats()

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="text-xl font-semibold text-white mb-1">Bienvenida, Isabel</h1>
      <p className="text-gray-500 text-sm mb-8">Resumen de tu operación</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="Clientes totales" value={stats.totalClients ?? 0} />
        <Stat label="Clientes activos" value={stats.activeClients ?? 0} />
        <Stat label="Contenido para revisar" value={stats.pendingContent ?? 0} highlight />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Action href="/dashboard/clientes/nuevo" label="+ Agregar cliente" />
          <Action href="/dashboard/contenido?status=pending_approval" label="Revisar contenido pendiente" />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${highlight && value > 0 ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-white/8 bg-white/3'}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${highlight && value > 0 ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="block px-4 py-3 rounded-lg border border-white/8 bg-white/3 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-colors">
      {label}
    </a>
  )
}
