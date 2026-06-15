'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { IconChevronDown, IconCheck, IconLock } from '@tabler/icons-react'
import { ACCESS_LEVELS, accessMeta, getAccess, setAccess, type AccessLevel } from '@/lib/project-access'

export function MemberAccessControl({
  projectId, memberId, fallback, editable,
}: {
  projectId: string
  memberId: string
  fallback: AccessLevel
  editable: boolean
}) {
  const [level, setLevel] = useState<AccessLevel>(fallback)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLevel(getAccess(projectId, memberId, fallback)) }, [projectId, memberId, fallback])
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const m = accessMeta(level)

  const choose = (l: AccessLevel) => {
    setLevel(l)
    setAccess(projectId, memberId, l)
    setOpen(false)
  }

  if (!editable) {
    return (
      <span className={cn('flex items-center self-start rounded-full py-1 px-2.5 gap-1.5', m.bg)}>
        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: m.dot }} />
        <span className={cn('text-[11px] font-semibold', m.text)}>{m.label}</span>
      </span>
    )
  }

  return (
    <div className="relative self-start" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('flex items-center rounded-full py-1 pl-2.5 pr-2 gap-1.5 transition-colors hover:brightness-95', m.bg)}
      >
        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: m.dot }} />
        <span className={cn('text-[11px] font-semibold', m.text)}>{m.label}</span>
        <IconChevronDown size={12} stroke={2} className={cn('opacity-60', m.text)} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-60 rounded-[14px] border border-[#ECE8D6] bg-white shadow-[0_8px_24px_rgba(19,13,16,0.10)] p-1.5">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A] flex items-center gap-1.5">
            <IconLock size={11} stroke={1.8} /> Acceso a este proyecto
          </p>
          {ACCESS_LEVELS.map(a => (
            <button
              key={a.id}
              onClick={() => choose(a.id)}
              className="flex items-start gap-2.5 w-full rounded-[10px] px-2.5 py-2 text-left hover:bg-[#FBFAF3] transition-colors"
            >
              <span className="size-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: a.dot }} />
              <span className="grow min-w-0">
                <span className="block text-[13px] font-medium text-[#130D10]">{a.label}</span>
                <span className="block text-[11px] text-[#A8A29A] leading-snug">{a.desc}</span>
              </span>
              {a.id === level && <IconCheck size={14} className="text-[#00846F] shrink-0 mt-0.5" stroke={2.4} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
