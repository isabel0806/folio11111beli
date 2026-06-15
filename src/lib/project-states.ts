// Customizable project states. The studio can rename/add/remove states from
// Ajustes; the list persists client-side (localStorage) since there's no backend.

export type StateColor = 'blue' | 'yellow' | 'green' | 'coral' | 'olive' | 'pink' | 'purple' | 'neutral'

export const STATE_COLORS: Record<StateColor, { label: string; dot: string; bg: string; text: string }> = {
  blue: { label: 'Azul', dot: '#7FB0E8', bg: 'bg-[#EAF2FB]', text: 'text-[#3F6FA3]' },
  yellow: { label: 'Amarillo', dot: '#F5D242', bg: 'bg-[#FBF3D6]', text: 'text-[#7A6410]' },
  green: { label: 'Verde', dot: '#00846F', bg: 'bg-[#E5F3EF]', text: 'text-[#00846F]' },
  coral: { label: 'Coral', dot: '#FF5738', bg: 'bg-[#FFEDE9]', text: 'text-[#C23A22]' },
  olive: { label: 'Oliva', dot: '#D5D25D', bg: 'bg-[#F7F6E2]', text: 'text-[#7E7B2E]' },
  pink: { label: 'Rosa', dot: '#FFABCF', bg: 'bg-[#FDECF3]', text: 'text-[#B14E7C]' },
  purple: { label: 'Violeta', dot: '#9B7FD4', bg: 'bg-[#F1ECF8]', text: 'text-[#6B4FA0]' },
  neutral: { label: 'Gris', dot: '#8A847B', bg: 'bg-[#F2EFE2]', text: 'text-[#6B655C]' },
}

export interface ProjectState {
  id: string
  label: string
  color: StateColor
}

export const DEFAULT_STATES: ProjectState[] = [
  { id: 'en_curso', label: 'En curso', color: 'blue' },
  { id: 'en_pausa', label: 'En pausa', color: 'yellow' },
  { id: 'completado', label: 'Completado', color: 'green' },
  { id: 'borrador', label: 'Borrador', color: 'neutral' },
]

const KEY = 'folio:project-states'

export function getStates(): ProjectState[] {
  if (typeof window === 'undefined') return DEFAULT_STATES
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as ProjectState[]) : null
    return parsed && parsed.length ? parsed : DEFAULT_STATES
  } catch {
    return DEFAULT_STATES
  }
}

export function saveStates(states: ProjectState[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(states))
  } catch {
    // ignore
  }
}

// Resolve a status id to a state; falls back gracefully for unknown ids.
export function resolveState(id: string, states: ProjectState[] = getStates()): ProjectState {
  return (
    states.find(s => s.id === id) ||
    DEFAULT_STATES.find(s => s.id === id) || {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
      color: 'neutral' as StateColor,
    }
  )
}

export const slugify = (label: string) =>
  label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `estado_${Date.now()}`
