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

// Self-contained share link: the whole budget travels inside the URL (base64),
// so the public view works on any device without a backend.
export function encodeBudget(budget: StoredBudget): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(budget))))
  } catch {
    return ''
  }
}

export function decodeBudget(encoded: string): StoredBudget | null {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(decodeURIComponent(escape(window.atob(encoded)))) as StoredBudget
  } catch {
    return null
  }
}
