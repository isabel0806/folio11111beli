'use client'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { currentUser } from '@/lib/mock-data'
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react'
import { cn } from '@/lib/cn'
import {
  getStates, saveStates, slugify, STATE_COLORS,
  type ProjectState, type StateColor,
} from '@/lib/project-states'

export default function AjustesPage() {
  const [user, setUser] = useState(currentUser)
  const [saved, setSaved] = useState(false)

  // Customizable project states
  const [states, setStates] = useState<ProjectState[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState<StateColor>('coral')
  useEffect(() => { setStates(getStates()) }, [])

  const persist = (next: ProjectState[]) => { setStates(next); saveStates(next) }
  const addState = () => {
    const label = newLabel.trim()
    if (!label) return
    persist([...states, { id: slugify(label), label, color: newColor }])
    setNewLabel(''); setNewColor('coral')
  }
  const removeState = (id: string) => persist(states.filter(s => s.id !== id))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8">
      <PageHeader title="Ajustes" description="Configuración de tu cuenta y estudio" />
      <div className="max-w-2xl flex flex-col gap-6">
        {/* Profile */}
        <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
          <h2 className="font-serif text-[19px] text-[#130D10] mb-4">Tu perfil</h2>
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-[#130D10]">{user.name}</p>
              <p className="text-xs text-[#8A847B]">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Nombre completo" value={user.name} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} />
            <Input label="Email" type="email" value={user.email} onChange={e => setUser(u => ({ ...u, email: e.target.value }))} />
            <Input label="Profesión" value={user.profession} onChange={e => setUser(u => ({ ...u, profession: e.target.value }))} placeholder="Ej: Arquitecta, Diseñadora, etc." />
          </div>
        </section>

        {/* Payments */}
        <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
          <h2 className="font-serif text-[19px] text-[#130D10] mb-1">Datos de cobro</h2>
          <p className="text-xs text-[#8A847B] mb-4">Se usan en los mensajes de WhatsApp generados automáticamente</p>
          <div className="space-y-4">
            <Input
              label="CBU / Alias"
              value={user.cbu_alias || ''}
              onChange={e => setUser(u => ({ ...u, cbu_alias: e.target.value }))}
              placeholder="Ej: isabel.garcia.arq"
            />
            <div className="bg-white border border-[#ECE8D6] rounded-[14px] p-4">
              <p className="text-xs text-[#A8A29A]">Vista previa del mensaje:</p>
              <p className="text-sm text-[#130D10] mt-1.5">
                "Hola [Cliente], te recuerdo que el 30/04/2024 vence el pago de "Aprobación Básico" por $4.500. Podés transferir a: <strong>{user.cbu_alias || '[CBU/alias]'}</strong>. ¡Gracias!"
              </p>
            </div>
          </div>
        </section>

        {/* Studio */}
        <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
          <h2 className="font-serif text-[19px] text-[#130D10] mb-4">Estudio</h2>
          <div className="space-y-4">
            <Input label="Nombre del estudio" defaultValue="Estudio García" placeholder="Nombre visible para clientes" />
          </div>
        </section>

        {/* Project states */}
        <section className="bg-[#FBFAF3] border border-[#ECE8D6] rounded-[20px] p-6">
          <h2 className="font-serif text-[19px] text-[#130D10] mb-1">Estados de proyecto</h2>
          <p className="text-xs text-[#8A847B] mb-4">Personalizá los estados que usás en tus proyectos. Aparecen al cambiar el estado desde la ficha del proyecto.</p>

          <div className="flex flex-col gap-2 mb-4">
            {states.map(s => {
              const c = STATE_COLORS[s.color]
              return (
                <div key={s.id} className="flex items-center gap-3 bg-white border border-[#ECE8D6] rounded-[14px] px-4 py-2.5">
                  <span className={cn('flex items-center gap-1.5 rounded-full pl-2 pr-2.5 py-1 text-[11px] font-semibold', c.bg, c.text)}>
                    <span className="w-1.75 h-1.75 rounded-full" style={{ backgroundColor: c.dot }} />
                    {s.label}
                  </span>
                  <span className="text-[11px] text-[#A8A29A]">{c.label}</span>
                  <button
                    onClick={() => removeState(s.id)}
                    disabled={states.length <= 1}
                    title="Eliminar estado"
                    className="ml-auto p-1.5 rounded-full text-[#A8A29A] hover:text-[#C23A22] hover:bg-[#FFEDE9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <IconTrash size={15} stroke={1.7} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add new */}
          <div className="flex items-end gap-2 bg-white border border-dashed border-[#ECE8D6] rounded-[14px] p-3">
            <div className="grow">
              <label className="text-[11px] font-medium text-[#6B655C] mb-1 block">Nuevo estado</label>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addState()}
                placeholder="Ej: Esperando aprobación, En revisión…"
                className="w-full text-sm text-[#130D10] bg-[#FBFAF3] border border-[#ECE8D6] rounded-[10px] px-3 py-2 outline-none focus:ring-1 focus:ring-[#F5D242]"
              />
            </div>
            <div className="flex items-center gap-1 pb-0.5">
              {(Object.keys(STATE_COLORS) as StateColor[]).map(k => (
                <button
                  key={k}
                  onClick={() => setNewColor(k)}
                  title={STATE_COLORS[k].label}
                  className={cn('w-6 h-6 rounded-full flex items-center justify-center transition-transform', newColor === k && 'ring-2 ring-offset-1 ring-[#130D10] scale-110')}
                  style={{ backgroundColor: STATE_COLORS[k].dot }}
                >
                  {newColor === k && <IconCheck size={12} className="text-white" stroke={3} />}
                </button>
              ))}
            </div>
            <Button size="sm" variant="primary" onClick={addState}><IconPlus size={13} /> Agregar</Button>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            {saved ? <><IconCheck size={14} /> Guardado</> : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
