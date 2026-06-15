'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 1 | 2 | 3 | 4

interface FormData {
  // Step 1: Business
  name: string
  website: string
  industry: string
  city: string
  state: string
  description: string
  // Step 2: Audience
  age_min: number
  age_max: number
  gender_target: 'all' | 'male' | 'female'
  income_bracket: 'low' | 'mid' | 'high' | 'luxury'
  ideal_customer: string
  // Step 3: Brand
  brand_voice: string
  main_message: string
  never_say: string
  instagram_handle: string
  facebook_page: string
  // Step 4: Competition
  competitor_urls: string
  keywords: string
  inspiration_urls: string
}

const initialForm: FormData = {
  name: '', website: '', industry: '', city: '', state: '', description: '',
  age_min: 18, age_max: 65, gender_target: 'all', income_bracket: 'mid', ideal_customer: '',
  brand_voice: '', main_message: '', never_say: '', instagram_handle: '', facebook_page: '',
  competitor_urls: '', keywords: '', inspiration_urls: '',
}

export default function OnboardingPage() {
  const { token } = useParams<{ token: string }>()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function loadClient() {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, onboarding_status')
        .eq('onboarding_token', token)
        .single()

      if (error || !data) {
        setError('Este link no es válido o ya expiró.')
      } else if (data.onboarding_status === 'submitted') {
        setDone(true)
      } else {
        setClientId(data.id)
        if (data.name) setForm(f => ({ ...f, name: data.name }))
      }
      setLoading(false)
    }
    if (token) loadClient()
  }, [token])

  function update(field: keyof FormData, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!clientId) return
    setSubmitting(true)

    const payload = {
      name: form.name,
      website: form.website,
      industry: form.industry,
      city: form.city,
      state: form.state,
      description: form.description,
      age_min: form.age_min,
      age_max: form.age_max,
      gender_target: form.gender_target,
      income_bracket: form.income_bracket,
      ideal_customer: form.ideal_customer,
      brand_voice: form.brand_voice,
      main_message: form.main_message,
      never_say: form.never_say,
      instagram_handle: form.instagram_handle,
      facebook_page: form.facebook_page,
      competitor_urls: form.competitor_urls.split('\n').map(s => s.trim()).filter(Boolean),
      keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean),
      inspiration_urls: form.inspiration_urls.split('\n').map(s => s.trim()).filter(Boolean),
      onboarding_status: 'submitted',
      submitted_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', clientId)

    if (error) {
      setError('Hubo un error al guardar. Intentá de nuevo.')
      setSubmitting(false)
    } else {
      setDone(true)
    }
  }

  if (loading) return <Screen><p className="text-gray-400">Cargando...</p></Screen>
  if (error) return <Screen><p className="text-red-400">{error}</p></Screen>
  if (done) return (
    <Screen>
      <div className="text-center space-y-3">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-semibold text-white">¡Listo!</h2>
        <p className="text-gray-400">Recibimos tu información. Nos ponemos en contacto pronto.</p>
      </div>
    </Screen>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold tracking-tight text-lg">150 Marketing</span>
        <span className="text-sm text-gray-500">Paso {step} de 4</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">

          {step === 1 && (
            <Section title="Tu negocio" subtitle="Contanos sobre tu empresa">
              <Field label="Nombre del negocio *">
                <Input value={form.name} onChange={v => update('name', v)} placeholder="Ej: Miami Smiles" />
              </Field>
              <Field label="Sitio web *">
                <Input value={form.website} onChange={v => update('website', v)} placeholder="https://tuempresa.com" />
              </Field>
              <Field label="Industria *">
                <Input value={form.industry} onChange={v => update('industry', v)} placeholder="Ej: Odontología, Retail, Restaurante" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad *">
                  <Input value={form.city} onChange={v => update('city', v)} placeholder="Miami" />
                </Field>
                <Field label="Estado *">
                  <Input value={form.state} onChange={v => update('state', v)} placeholder="FL" />
                </Field>
              </div>
              <Field label="Descripción del negocio *">
                <Textarea value={form.description} onChange={v => update('description', v)} placeholder="¿Qué hacés? ¿Qué te hace único?" rows={4} />
              </Field>
            </Section>
          )}

          {step === 2 && (
            <Section title="Tu audiencia" subtitle="¿A quién le hablamos?">
              <Field label="Rango de edad">
                <div className="flex items-center gap-3">
                  <Input type="number" value={String(form.age_min)} onChange={v => update('age_min', Number(v))} placeholder="18" />
                  <span className="text-gray-500">—</span>
                  <Input type="number" value={String(form.age_max)} onChange={v => update('age_max', Number(v))} placeholder="65" />
                </div>
              </Field>
              <Field label="Género">
                <Select value={form.gender_target} onChange={v => update('gender_target', v)} options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                ]} />
              </Field>
              <Field label="Poder adquisitivo">
                <Select value={form.income_bracket} onChange={v => update('income_bracket', v)} options={[
                  { value: 'low', label: 'Bajo' },
                  { value: 'mid', label: 'Medio' },
                  { value: 'high', label: 'Alto' },
                  { value: 'luxury', label: 'Lujo' },
                ]} />
              </Field>
              <Field label="¿Cómo es tu cliente ideal? *">
                <Textarea value={form.ideal_customer} onChange={v => update('ideal_customer', v)} placeholder="Describí a tu cliente ideal: qué hace, qué le preocupa, qué busca..." rows={4} />
              </Field>
            </Section>
          )}

          {step === 3 && (
            <Section title="Marca y voz" subtitle="¿Cómo habla tu marca?">
              <Field label="Voz de la marca *">
                <Textarea value={form.brand_voice} onChange={v => update('brand_voice', v)} placeholder="Ej: Profesional pero cercana, directa, con humor sutil..." rows={3} />
              </Field>
              <Field label="Mensaje principal *">
                <Textarea value={form.main_message} onChange={v => update('main_message', v)} placeholder="¿Cuál es el mensaje central que querés que tu audiencia recuerde?" rows={3} />
              </Field>
              <Field label="¿Qué NO debe decir tu marca? *">
                <Textarea value={form.never_say} onChange={v => update('never_say', v)} placeholder="Palabras, frases o temas que querés evitar..." rows={3} />
              </Field>
              <Field label="Instagram">
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-white/5 border border-white/10 border-r-0 rounded-l-lg text-gray-500 text-sm">@</span>
                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-r-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50"
                    value={form.instagram_handle}
                    onChange={e => update('instagram_handle', e.target.value)}
                    placeholder="tuempresa"
                  />
                </div>
              </Field>
              <Field label="Facebook">
                <Input value={form.facebook_page} onChange={v => update('facebook_page', v)} placeholder="facebook.com/tuempresa" />
              </Field>
            </Section>
          )}

          {step === 4 && (
            <Section title="Competencia" subtitle="¿Con quién competís?">
              <Field label="URLs de competidores" hint="Un link por línea">
                <Textarea value={form.competitor_urls} onChange={v => update('competitor_urls', v)} placeholder={"https://competidor1.com\nhttps://competidor2.com"} rows={4} />
              </Field>
              <Field label="Palabras clave de tu negocio" hint="Separadas por comas">
                <Input value={form.keywords} onChange={v => update('keywords', v)} placeholder="dentista miami, blanqueamiento dental, ortodoncia" />
              </Field>
              <Field label="Inspiración" hint="Marcas o cuentas que te gustan — un link por línea">
                <Textarea value={form.inspiration_urls} onChange={v => update('inspiration_urls', v)} placeholder={"https://instagram.com/marca1\nhttps://marca2.com"} rows={3} />
              </Field>
            </Section>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => (s - 1) as Step)}
                className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Atrás
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                onClick={() => setStep(s => (s + 1) as Step)}
                className="px-6 py-2.5 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Layout helpers ──────────────────────────────────────────

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      {children}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
    />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400/50 transition-colors"
    >
      {options.map(o => <option key={o.value} value={o.value} className="bg-[#1a1a1a]">{o.label}</option>)}
    </select>
  )
}
