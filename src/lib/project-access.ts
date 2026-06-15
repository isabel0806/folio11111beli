// Per-project, per-person permissions controlled by the project owner / admin.
// Each member gets a set of allowed "areas" (sections) of the project.
// Stored client-side (no backend yet) keyed by project + member.

export interface AreaDef { id: string; label: string; desc: string }

export const PROJECT_AREAS: AreaDef[] = [
  { id: 'archivos', label: 'Archivos y entregas', desc: 'Presupuestos finales, entregas y archivos del proyecto' },
  { id: 'control', label: 'Cronograma y tareas', desc: 'Tablero de tareas y línea de tiempo de obra' },
  { id: 'presupuesto', label: 'Presupuesto y honorarios', desc: 'Detalle de honorarios, IVA y certificaciones' },
  { id: 'finanzas', label: 'Finanzas del proyecto', desc: 'Cobros, costos, horas y márgenes' },
  { id: 'bitacora', label: 'Bitácora de obra', desc: 'Registro diario de avances en obra' },
  { id: 'documentacion', label: 'Documentación / planos', desc: 'Biblioteca de planos, renders y actas' },
  { id: 'equipo', label: 'Equipo y proveedores', desc: 'Personas del proyecto y proveedores' },
]

export const ALL_AREAS = PROJECT_AREAS.map(a => a.id)
// "Operativo": todo menos lo financiero
export const OPERATIVO_AREAS = ['archivos', 'control', 'bitacora', 'documentacion', 'equipo']

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x))

export function summarize(areas: string[]): { label: string; tone: 'full' | 'operativo' | 'none' | 'custom' } {
  if (areas.length === 0) return { label: 'Sin acceso', tone: 'none' }
  if (sameSet(areas, ALL_AREAS)) return { label: 'Acceso completo', tone: 'full' }
  if (sameSet(areas, OPERATIVO_AREAS)) return { label: 'Operativo', tone: 'operativo' }
  return { label: `Personalizado · ${areas.length} de ${ALL_AREAS.length}`, tone: 'custom' }
}

export const TONE_STYLE: Record<'full' | 'operativo' | 'none' | 'custom', { dot: string; bg: string; text: string }> = {
  full: { dot: '#00846F', bg: 'bg-[#E4F1EC]', text: 'text-[#00846F]' },
  operativo: { dot: '#7FB0E8', bg: 'bg-[#EAF2FB]', text: 'text-[#3F6FA3]' },
  custom: { dot: '#9B7FD4', bg: 'bg-[#F1ECF8]', text: 'text-[#6B4FA0]' },
  none: { dot: '#C4BFB4', bg: 'bg-[#F2EFE2]', text: 'text-[#8A847B]' },
}

const key = (projectId: string, memberId: string) => `folio:perms:${projectId}:${memberId}`

export function getAreas(projectId: string, memberId: string, fallback: string[]): string[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key(projectId, memberId))
    const parsed = raw ? (JSON.parse(raw) as string[]) : null
    return Array.isArray(parsed) ? parsed.filter(a => ALL_AREAS.includes(a)) : fallback
  } catch {
    return fallback
  }
}

export function setAreas(projectId: string, memberId: string, areas: string[]) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key(projectId, memberId), JSON.stringify(areas)) } catch { /* ignore */ }
}
