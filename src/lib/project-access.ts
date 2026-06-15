// Per-project access level for each team member, controlled by the admin.
// Stored client-side (no backend yet) keyed by project + member.

export type AccessLevel = 'full' | 'operativo' | 'none'

export const ACCESS_LEVELS: { id: AccessLevel; label: string; desc: string; dot: string; bg: string; text: string }[] = [
  { id: 'full', label: 'Acceso completo', desc: 'Ve finanzas y honorarios del proyecto', dot: '#00846F', bg: 'bg-[#E4F1EC]', text: 'text-[#00846F]' },
  { id: 'operativo', label: 'Operativo', desc: 'Tareas, cronograma y archivos · sin finanzas', dot: '#7FB0E8', bg: 'bg-[#EAF2FB]', text: 'text-[#3F6FA3]' },
  { id: 'none', label: 'Sin acceso', desc: 'No ve este proyecto', dot: '#C4BFB4', bg: 'bg-[#F2EFE2]', text: 'text-[#8A847B]' },
]

export const accessMeta = (level: AccessLevel) => ACCESS_LEVELS.find(l => l.id === level) || ACCESS_LEVELS[1]

const key = (projectId: string, memberId: string) => `folio:access:${projectId}:${memberId}`

export function getAccess(projectId: string, memberId: string, fallback: AccessLevel): AccessLevel {
  if (typeof window === 'undefined') return fallback
  try {
    const v = window.localStorage.getItem(key(projectId, memberId)) as AccessLevel | null
    return v === 'full' || v === 'operativo' || v === 'none' ? v : fallback
  } catch {
    return fallback
  }
}

export function setAccess(projectId: string, memberId: string, level: AccessLevel) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key(projectId, memberId), level) } catch { /* ignore */ }
}
