import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getClients() {
  const { data } = await supabase
    .from('clients')
    .select('id, name, industry, city, state, status, onboarding_status, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

const statusLabel: Record<string, string> = {
  onboarding: 'Onboarding',
  active: 'Activo',
  paused: 'Pausado',
  cancelled: 'Cancelado',
}

const statusColor: Record<string, string> = {
  onboarding: 'text-yellow-400 bg-yellow-400/10',
  active: 'text-green-400 bg-green-400/10',
  paused: 'text-gray-400 bg-white/5',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{clients.length} clientes</p>
        </div>
        <Link
          href="/dashboard/clientes/nuevo"
          className="px-4 py-2 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No hay clientes todavía.</p>
          <Link href="/dashboard/clientes/nuevo" className="text-yellow-400 text-sm mt-2 inline-block hover:underline">
            Agregar el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => (
            <Link
              key={client.id}
              href={`/dashboard/clientes/${client.id}`}
              className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-semibold text-sm">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">{client.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{client.industry} · {client.city}, {client.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {client.onboarding_status === 'pending' && (
                  <span className="text-xs text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full">Form pendiente</span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[client.status] ?? 'text-gray-400 bg-white/5'}`}>
                  {statusLabel[client.status] ?? client.status}
                </span>
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
