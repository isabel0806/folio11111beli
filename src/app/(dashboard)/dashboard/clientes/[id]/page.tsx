import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CopyToken } from './CopyToken'

async function getClient(id: string) {
  const { data } = await supabase.from('clients').select('*').eq('id', id).single()
  return data
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) notFound()

  const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/onboarding/${client.onboarding_token}`

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/clientes" className="text-gray-500 text-sm hover:text-white transition-colors">
          ← Clientes
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-semibold text-lg">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{client.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{client.industry} · {client.city}, {client.state}</p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      {/* Onboarding link */}
      <div className={`rounded-xl border p-4 mb-6 ${client.onboarding_status === 'submitted' ? 'border-green-400/20 bg-green-400/5' : 'border-yellow-400/20 bg-yellow-400/5'}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white">Link de onboarding</p>
          <span className={`text-xs px-2.5 py-1 rounded-full ${client.onboarding_status === 'submitted' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
            {client.onboarding_status === 'submitted' ? '✓ Completado' : 'Pendiente'}
          </span>
        </div>
        <CopyToken url={onboardingUrl} />
      </div>

      {/* Info sections */}
      {client.onboarding_status === 'submitted' && (
        <div className="space-y-4">
          <Section title="Negocio">
            <Row label="Sitio web" value={client.website} />
            <Row label="Industria" value={client.industry} />
            <Row label="Ubicación" value={`${client.city}, ${client.state}`} />
            <Row label="Descripción" value={client.description} />
          </Section>

          <Section title="Audiencia">
            <Row label="Edad" value={`${client.age_min} - ${client.age_max} años`} />
            <Row label="Género" value={client.gender_target} />
            <Row label="Poder adquisitivo" value={client.income_bracket} />
            <Row label="Cliente ideal" value={client.ideal_customer} />
          </Section>

          <Section title="Marca">
            <Row label="Voz" value={client.brand_voice} />
            <Row label="Mensaje principal" value={client.main_message} />
            <Row label="No decir" value={client.never_say} />
            {client.instagram_handle && <Row label="Instagram" value={`@${client.instagram_handle}`} />}
            {client.facebook_page && <Row label="Facebook" value={client.facebook_page} />}
          </Section>

          <Section title="Competencia">
            {client.competitor_urls?.length > 0 && <Row label="Competidores" value={client.competitor_urls.join(', ')} />}
            {client.keywords?.length > 0 && <Row label="Keywords" value={client.keywords.join(', ')} />}
            {client.inspiration_urls?.length > 0 && <Row label="Inspiración" value={client.inspiration_urls.join(', ')} />}
          </Section>
        </div>
      )}

      {client.onboarding_status !== 'submitted' && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-sm">El cliente todavía no completó el formulario de onboarding.</p>
          <p className="text-xs mt-1">Mandales el link de arriba.</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    onboarding: 'text-yellow-400 bg-yellow-400/10',
    active: 'text-green-400 bg-green-400/10',
    paused: 'text-gray-400 bg-white/5',
    cancelled: 'text-red-400 bg-red-400/10',
  }
  const labels: Record<string, string> = {
    onboarding: 'Onboarding', active: 'Activo', paused: 'Pausado', cancelled: 'Cancelado',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ${map[status] ?? 'text-gray-400 bg-white/5'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="px-5 py-3 flex gap-4">
      <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-200 flex-1">{value}</span>
    </div>
  )
}
