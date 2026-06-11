'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { currentUser } from '@/lib/mock-data'
import { IconCheck } from '@tabler/icons-react'

export default function AjustesPage() {
  const [user, setUser] = useState(currentUser)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8">
      <PageHeader title="Ajustes" description="Configuración de tu cuenta y estudio" />
      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#130D10] mb-4">Tu perfil</h2>
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={user.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-[#130D10]">{user.name}</p>
              <p className="text-xs text-[#6B6B6B]">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <Input label="Nombre completo" value={user.name} onChange={e => setUser(u => ({ ...u, name: e.target.value }))} />
            <Input label="Email" type="email" value={user.email} onChange={e => setUser(u => ({ ...u, email: e.target.value }))} />
            <Input label="Profesión" value={user.profession} onChange={e => setUser(u => ({ ...u, profession: e.target.value }))} placeholder="Ej: Arquitecta, Diseñadora, etc." />
          </div>
        </section>

        {/* Payments */}
        <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#130D10] mb-1">Datos de cobro</h2>
          <p className="text-xs text-[#9B9B9B] mb-4">Se usan en los mensajes de WhatsApp generados automáticamente</p>
          <div className="space-y-4">
            <Input
              label="CBU / Alias"
              value={user.cbu_alias || ''}
              onChange={e => setUser(u => ({ ...u, cbu_alias: e.target.value }))}
              placeholder="Ej: isabel.garcia.arq"
            />
            <div className="bg-[#F9F9F8] border border-[#E5E5E3] rounded-xl p-3">
              <p className="text-xs text-[#9B9B9B]">Vista previa del mensaje:</p>
              <p className="text-sm text-[#130D10] mt-1">
                "Hola [Cliente], te recuerdo que el 30/04/2024 vence el pago de "Aprobación Básico" por $4.500. Podés transferir a: <strong>{user.cbu_alias || '[CBU/alias]'}</strong>. ¡Gracias!"
              </p>
            </div>
          </div>
        </section>

        {/* Studio */}
        <section className="bg-white border border-[#E5E5E3] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#130D10] mb-4">Estudio</h2>
          <div className="space-y-4">
            <Input label="Nombre del estudio" defaultValue="Estudio García" placeholder="Nombre visible para clientes" />
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
