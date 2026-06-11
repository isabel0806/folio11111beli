export type ProjectStatus = 'en_curso' | 'en_pausa' | 'completado' | 'borrador'
export type ProjectType = 'arquitectura' | 'diseño_grafico' | 'event_planning' | 'consultoria' | 'otro'
export type PricingMode = 'proyecto' | 'hora' | 'ambos'
export type MilestoneStatus = 'pendiente' | 'cobrado' | 'vencido' | 'futuro'
export type TaskStatus = 'todo' | 'en_progreso' | 'completado'
export type MemberRole = 'admin' | 'editor' | 'viewer'
export type ContactCategory = 'industrial' | 'proveedor' | 'colaborador' | 'cliente'
export type CostCategory = 'proveedor' | 'gasto' | 'maquinaria'
export type EventType = 'reunion' | 'entrega' | 'hito' | 'custom'
export type Currency = 'ARS' | 'USD'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  profession: string
  cbu_alias?: string
}

export interface Studio {
  id: string
  owner_id: string
  name: string
  plan: 'solo' | 'studio'
}

export interface Project {
  id: string
  studio_id: string
  name: string
  client_name: string
  client_email?: string
  type: ProjectType
  status: ProjectStatus
  currency: Currency
  pricing_mode: PricingMode
  total_amount?: number
  hourly_rate?: number
  cover_image?: string
  cover_color?: string
  start_date?: string
  created_at: string
  progress?: number
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: MemberRole
  name: string
  email: string
  avatar?: string
}

export interface ProjectPhase {
  id: string
  project_id: string
  name: string
  color: string
  order: number
  start_date?: string
  end_date?: string
}

export interface Task {
  id: string
  project_id: string
  phase_id?: string
  title: string
  description?: string
  status: TaskStatus
  assigned_to?: string
  assigned_name?: string
  due_date?: string
  is_client_visible: boolean
  created_at: string
  subtasks?: Subtask[]
  has_attachments?: boolean
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
}

export interface PaymentMilestone {
  id: string
  project_id: string
  name: string
  due_date: string
  amount: number
  status: MilestoneStatus
  paid_at?: string
  arca_flagged: boolean
  linked_file_id?: string
}

export interface CostItem {
  id: string
  project_id: string
  description: string
  provider_id?: string
  provider_name?: string
  category: CostCategory
  amount: number
  created_at: string
}

export interface Contact {
  id: string
  studio_id: string
  name: string
  category: ContactCategory
  phone?: string
  email?: string
  address?: string
  notes?: string
  rating?: number
  created_at: string
  projects?: string[]
}

export interface ProjectContact {
  id: string
  project_id: string
  contact_id: string
}

export interface ProjectFile {
  id: string
  project_id: string
  name: string
  type: 'presupuesto' | 'entrega' | 'general'
  url?: string
  integration_source?: 'drive' | 'figma' | 'dropbox' | 'miro'
  linked_milestone_id?: string
  uploaded_at: string
  size?: string
  status?: 'esperando_pago' | 'disponible'
}

export interface CalendarEvent {
  id: string
  studio_id: string
  project_id?: string
  project_name?: string
  title: string
  start: string
  end: string
  type: EventType
}
