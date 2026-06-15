// Lightweight client-side store so a budget armed in the builder can be read
// by the public client view (which opens in a separate tab). No backend here —
// we persist to localStorage keyed by project id.

export interface StoredBudgetItem {
  detail: string
  qty: number
  unit: string
  price: number
  iva: number
  honorarios?: boolean
}

export interface StoredBudget {
  name: string
  items: StoredBudgetItem[]
  notes?: string
  savedAt: string
}

const key = (projectId: string) => `folio:budget:${projectId}`

export function saveBudget(projectId: string, budget: StoredBudget) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(projectId), JSON.stringify(budget))
  } catch {
    // ignore quota / private-mode errors — presentation app
  }
}

export function getBudget(projectId: string): StoredBudget | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key(projectId))
    return raw ? (JSON.parse(raw) as StoredBudget) : null
  } catch {
    return null
  }
}
