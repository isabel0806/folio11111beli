import type { MilestoneStatus, ProjectStatus, TaskStatus, ContactCategory, CostCategory } from './types'

export function formatCurrency(amount: number, currency: 'ARS' | 'USD' = 'ARS'): string {
  if (currency === 'USD') {
    return `USD ${amount.toLocaleString('es-AR')}`
  }
  return `$${amount.toLocaleString('es-AR')}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export function getDaysUntil(date: string): number {
  const now = new Date()
  const target = new Date(date)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getMilestoneStatusLabel(status: MilestoneStatus): string {
  const labels: Record<MilestoneStatus, string> = {
    pendiente: 'Pendiente',
    cobrado: 'Cobrado',
    vencido: 'Vencido',
    futuro: 'Futuro',
  }
  return labels[status]
}

export function getMilestoneStatusColor(status: MilestoneStatus): string {
  const colors: Record<MilestoneStatus, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    cobrado: 'bg-green-100 text-green-800',
    vencido: 'bg-red-100 text-red-800',
    futuro: 'bg-gray-100 text-gray-600',
  }
  return colors[status]
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    en_curso: 'En curso',
    en_pausa: 'En pausa',
    completado: 'Completado',
    borrador: 'Borrador',
  }
  return labels[status]
}

export function getProjectStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    en_curso: 'bg-blue-100 text-blue-800',
    en_pausa: 'bg-orange-100 text-orange-800',
    completado: 'bg-green-100 text-green-800',
    borrador: 'bg-gray-100 text-gray-600',
  }
  return colors[status]
}

export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: 'Por hacer',
    en_progreso: 'En progreso',
    completado: 'Completado',
  }
  return labels[status]
}

export function getContactCategoryLabel(cat: ContactCategory): string {
  const labels: Record<ContactCategory, string> = {
    industrial: 'Industrial',
    proveedor: 'Proveedor',
    colaborador: 'Colaborador',
    cliente: 'Cliente',
  }
  return labels[cat]
}

export function getCostCategoryLabel(cat: CostCategory): string {
  const labels: Record<CostCategory, string> = {
    proveedor: 'Proveedor',
    gasto: 'Gasto',
    maquinaria: 'Maquinaria',
  }
  return labels[cat]
}

export function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    arquitectura: 'Arquitectura',
    diseño_grafico: 'Diseño gráfico',
    event_planning: 'Event Planning',
    consultoria: 'Consultoría',
    otro: 'Otro',
  }
  return labels[type] || type
}

export function generateWhatsAppMessage(
  clientName: string,
  milestoneName: string,
  dueDate: string,
  amount: number,
  currency: 'ARS' | 'USD',
  cbuAlias: string
): string {
  const formattedDate = formatDate(dueDate)
  const formattedAmount = formatCurrency(amount, currency)
  return `Hola ${clientName}, te recuerdo que el ${formattedDate} vence el pago de "${milestoneName}" por ${formattedAmount}. Podés transferir a: ${cbuAlias}. ¡Gracias!`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}
