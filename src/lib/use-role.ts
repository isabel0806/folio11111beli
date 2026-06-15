'use client'
import { useCallback, useEffect, useState } from 'react'

// Role-based access — prototype. Without a backend this only *hides* gated
// views/data (it doesn't truly block); it's enough to show the model. The
// active role is stored client-side and broadcast so every component re-renders.

export type Role = 'admin' | 'pm' | 'junior'

export const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: 'admin', label: 'Admin · Dueño', desc: 'Ve todo: finanzas, márgenes, equipo y todos los proyectos.' },
  { id: 'pm', label: 'Arquitecto · PM', desc: 'Sus proyectos y las finanzas de cada uno, sin márgenes globales.' },
  { id: 'junior', label: 'Colaborador · Junior', desc: 'Solo los proyectos asignados, sin finanzas ni honorarios.' },
]

export type Capability =
  | 'finanzasGlobal'
  | 'cronogramaMaestro'
  | 'projectFinanzas'
  | 'allProjects'
  | 'estudio'

const MATRIX: Record<Role, Record<Capability, boolean>> = {
  admin: { finanzasGlobal: true, cronogramaMaestro: true, projectFinanzas: true, allProjects: true, estudio: true },
  pm: { finanzasGlobal: false, cronogramaMaestro: false, projectFinanzas: true, allProjects: false, estudio: true },
  junior: { finanzasGlobal: false, cronogramaMaestro: false, projectFinanzas: false, allProjects: false, estudio: true },
}

export const can = (role: Role, cap: Capability) => MATRIX[role][cap]

// Projects a non-admin user "has assigned" (mock). Admins see everything.
export const ASSIGNED_PROJECT_IDS = ['p1', 'p3', 'p4']

// Specific people you can impersonate ("Ver como Lucía"). When impersonating,
// the role drives capabilities and per-project visibility uses their granular
// permissions (see project-access).
export interface Person { name: string; role: Role }
export const STUDIO_PEOPLE: Person[] = [
  { name: 'Lucía Fernández', role: 'pm' },
  { name: 'Martín Sosa', role: 'junior' },
  { name: 'Diego Pérez', role: 'junior' },
]

const KEY = 'folio:role'
const KEY_PERSON = 'folio:person'
const EVT = 'folio-role-change'

export function getRole(): Role {
  if (typeof window === 'undefined') return 'admin'
  try {
    const r = window.localStorage.getItem(KEY) as Role | null
    return r === 'admin' || r === 'pm' || r === 'junior' ? r : 'admin'
  } catch {
    return 'admin'
  }
}

export function getPerson(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(KEY_PERSON) || null } catch { return null }
}

export function useRole() {
  const [role, setRoleState] = useState<Role>('admin')
  const [person, setPersonState] = useState<string | null>(null)

  useEffect(() => {
    setRoleState(getRole()); setPersonState(getPerson())
    const handler = () => { setRoleState(getRole()); setPersonState(getPerson()) }
    window.addEventListener(EVT, handler)
    return () => window.removeEventListener(EVT, handler)
  }, [])

  const setRole = useCallback((r: Role) => {
    try { window.localStorage.setItem(KEY, r); window.localStorage.removeItem(KEY_PERSON) } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVT))
  }, [])

  const setPerson = useCallback((p: Person) => {
    try { window.localStorage.setItem(KEY, p.role); window.localStorage.setItem(KEY_PERSON, p.name) } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVT))
  }, [])

  return { role, person, setRole, setPerson, can: (cap: Capability) => can(role, cap) }
}
