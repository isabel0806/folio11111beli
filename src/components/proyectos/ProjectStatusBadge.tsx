'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import { getStates, resolveState, STATE_COLORS, type ProjectState } from '@/lib/project-states'

export function ProjectStatusBadge({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [states, setStates] = useState<ProjectState[]>([])
  const [statusId, setStatusId] = useState(initialStatus)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const storeKey = `folio:project-status:${id}`

  useEffect(() => {
    setStates(getStates())
    try {
      const saved = window.localStorage.getItem(storeKey)
      if (saved) setStatusId(saved)
    } catch { /* ignore */ }
  }, [storeKey])

  const choose = (newId: string) => {
    setStatusId(newId)
    setOpen(false)
    try { window.localStorage.setItem(storeKey, newId) } catch { /* ignore */ }
  }
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const current = resolveState(statusId, states.length ? states : undefined)
  const c = STATE_COLORS[current.color]
  const list = states.length ? states : [current]

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-[11px] font-semibold transition-colors', c.bg, c.text)}
      >
        <span className="w-1.75 h-1.75 rounded-full" style={{ backgroundColor: c.dot }} />
        {current.label}
        <IconChevronDown size={12} stroke={2} className="opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-52 rounded-[14px] border border-[#ECE8D6] bg-white shadow-[0_8px_24px_rgba(19,13,16,0.10)] p-1.5">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8A29A]">Estado del proyecto</p>
          {list.map(s => {
            const sc = STATE_COLORS[s.color]
            const active = s.id === statusId
            return (
              <button
                key={s.id}
                onClick={() => choose(s.id)}
                className="flex items-center gap-2.5 w-full rounded-[10px] px-2.5 py-2 text-left hover:bg-[#FBFAF3] transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sc.dot }} />
                <span className="grow text-[13px] text-[#130D10]">{s.label}</span>
                {active && <IconCheck size={14} className="text-[#00846F] shrink-0" stroke={2.4} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
