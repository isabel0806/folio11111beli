import { IconLock } from '@tabler/icons-react'

export function AccessDenied({ area = 'esta sección' }: { area?: string }) {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto mt-24 flex flex-col items-center text-center gap-3 rounded-[20px] border border-[#ECE8D6] bg-[#FBFAF3] p-10">
        <span className="flex items-center justify-center rounded-full bg-[#F2EFE2] size-14">
          <IconLock size={24} className="text-[#8A847B]" stroke={1.7} />
        </span>
        <h2 className="font-serif text-[22px] text-[#130D10]">Sin acceso</h2>
        <p className="text-[13.5px] text-[#6B655C] leading-relaxed">
          Tu rol no tiene permiso para ver {area}. Pedile a un administrador del estudio que te dé acceso, o cambiá de rol desde el menú de usuario.
        </p>
      </div>
    </div>
  )
}
