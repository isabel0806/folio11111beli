'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NuevoClientePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        website: '',
        industry: '',
        city: '',
        state: '',
        description: '',
        income_bracket: 'mid',
        ideal_customer: '',
        brand_voice: '',
        main_message: '',
        never_say: '',
        status: 'onboarding',
        onboarding_status: 'pending',
      })
      .select('id, onboarding_token')
      .single()

    if (error || !data) {
      setError('Error al crear el cliente. Intentá de nuevo.')
      setSaving(false)
      return
    }

    router.push(`/dashboard/clientes/${data.id}`)
  }

  return (
    <div className="px-8 py-8 max-w-lg">
      <button onClick={() => router.back()} className="text-gray-500 text-sm hover:text-white transition-colors mb-6">
        ← Volver
      </button>

      <h1 className="text-xl font-semibold text-white mb-1">Nuevo cliente</h1>
      <p className="text-gray-500 text-sm mb-8">Ingresá el nombre para crear el perfil y generar el link de onboarding.</p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Nombre del cliente / negocio</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Ej: Miami Smiles"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || saving}
          className="w-full py-2.5 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-40"
        >
          {saving ? 'Creando...' : 'Crear cliente →'}
        </button>
      </div>
    </div>
  )
}
