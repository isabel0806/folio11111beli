import type { Project, Task, PaymentMilestone, CostItem, Contact, CalendarEvent, ProjectFile, ProjectPhase, ProjectMember } from './types'

export const currentUser = {
  id: 'u1',
  name: 'Isabel García',
  email: 'isabel@thegiftcardcafe.com',
  profession: 'Arquitecta',
  cbu_alias: 'isabel.garcia.arq',
}

export const mockProjects: Project[] = [
  {
    id: 'p1',
    studio_id: 's1',
    name: 'Casa Palermo',
    client_name: 'Familia Rodríguez',
    client_email: 'rodriguez@email.com',
    type: 'arquitectura',
    status: 'en_curso',
    currency: 'USD',
    pricing_mode: 'proyecto',
    total_amount: 18000,
    cover_color: '#E8D5B7',
    start_date: mo(-6),
    created_at: mo(-6),
    progress: 65,
  },
  {
    id: 'p2',
    studio_id: 's1',
    name: 'Branding Café Del Centro',
    client_name: 'Martín López',
    type: 'diseño_grafico',
    status: 'en_curso',
    currency: 'ARS',
    pricing_mode: 'proyecto',
    total_amount: 800000,
    cover_color: '#B7D5E8',
    start_date: mo(-5),
    created_at: mo(-5),
    progress: 85,
  },
  {
    id: 'p3',
    studio_id: 's1',
    name: 'Evento Corporativo TechBA',
    client_name: 'TechBA S.A.',
    type: 'event_planning',
    status: 'en_pausa',
    currency: 'USD',
    pricing_mode: 'proyecto',
    total_amount: 5000,
    cover_color: '#D5E8B7',
    start_date: mo(-7),
    created_at: mo(-7),
    progress: 20,
  },
  {
    id: 'p4',
    studio_id: 's1',
    name: 'Consultoría Estratégica Pyme',
    client_name: 'Consultora Norte',
    type: 'consultoria',
    status: 'completado',
    currency: 'ARS',
    pricing_mode: 'hora',
    hourly_rate: 15000,
    cover_color: '#E8B7D5',
    start_date: mo(-8),
    created_at: mo(-8),
    progress: 100,
  },
]

export const mockPhases: Record<string, ProjectPhase[]> = {
  p1: [
    { id: 'ph1', project_id: 'p1', name: 'Anteproyecto', color: '#6366F1', order: 1, start_date: '2024-01-15', end_date: '2024-02-28' },
    { id: 'ph2', project_id: 'p1', name: 'Básico', color: '#F59E0B', order: 2, start_date: '2024-03-01', end_date: '2024-04-30' },
    { id: 'ph3', project_id: 'p1', name: 'Ejecutivo', color: '#10B981', order: 3, start_date: '2024-05-01', end_date: '2024-07-31' },
    { id: 'ph4', project_id: 'p1', name: 'Obra', color: '#EF4444', order: 4, start_date: '2024-08-01', end_date: '2024-12-31' },
  ],
  p2: [
    { id: 'ph5', project_id: 'p2', name: 'Research', color: '#6366F1', order: 1, start_date: '2024-02-01', end_date: '2024-02-15' },
    { id: 'ph6', project_id: 'p2', name: 'Diseño', color: '#F59E0B', order: 2, start_date: '2024-02-16', end_date: '2024-03-15' },
    { id: 'ph7', project_id: 'p2', name: 'Entrega', color: '#10B981', order: 3, start_date: '2024-03-16', end_date: '2024-03-31' },
  ],
}

export const mockTasks: Record<string, Task[]> = {
  p1: [
    { id: 't1', project_id: 'p1', phase_id: 'ph1', title: 'Relevamiento del terreno', description: 'Medir y documentar el terreno en detalle', status: 'completado', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(-6, 20), is_client_visible: true, created_at: mo(-6) },
    { id: 't2', project_id: 'p1', phase_id: 'ph1', title: 'Planos preliminares', status: 'completado', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(-4, 15), is_client_visible: true, created_at: mo(-6) },
    { id: 't3', project_id: 'p1', phase_id: 'ph2', title: 'Memoria descriptiva', status: 'en_progreso', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(0, 25), is_client_visible: false, created_at: mo(-2) },
    { id: 't4', project_id: 'p1', phase_id: 'ph2', title: 'Planos de ejecución', status: 'todo', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(1, 10), is_client_visible: true, created_at: mo(-2) },
    { id: 't5', project_id: 'p1', phase_id: 'ph3', title: 'Cómputo y presupuesto', status: 'todo', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(2, 5), is_client_visible: false, created_at: mo(-1) },
  ],
  p2: [
    { id: 't6', project_id: 'p2', phase_id: 'ph5', title: 'Brief del cliente', status: 'completado', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(-5, 10), is_client_visible: false, created_at: mo(-5) },
    { id: 't7', project_id: 'p2', phase_id: 'ph5', title: 'Análisis de competencia', status: 'completado', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(-4, 20), is_client_visible: false, created_at: mo(-5) },
    { id: 't8', project_id: 'p2', phase_id: 'ph6', title: 'Propuestas de logo', status: 'completado', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(-3, 28), is_client_visible: true, created_at: mo(-4) },
    { id: 't9', project_id: 'p2', phase_id: 'ph6', title: 'Manual de marca', status: 'en_progreso', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(0, 20), is_client_visible: true, created_at: mo(-3) },
    { id: 't10', project_id: 'p2', phase_id: 'ph7', title: 'Presentación final al cliente', status: 'todo', assigned_to: 'u1', assigned_name: 'Isabel García', due_date: mo(1, 5), is_client_visible: true, created_at: mo(-1) },
  ],
}

// Dates relative to today so the monthly chart always has data
function mo(offset: number, day = 15) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset, day)
  return d.toISOString().split('T')[0]
}

export const mockMilestones: Record<string, PaymentMilestone[]> = {
  p1: [
    { id: 'm1', project_id: 'p1', name: 'Anticipo', due_date: mo(-6, 10), amount: 3000, status: 'cobrado', paid_at: mo(-6, 10), arca_flagged: false },
    { id: 'm2', project_id: 'p1', name: 'Entrega Anteproyecto', due_date: mo(-4, 28), amount: 3000, status: 'cobrado', paid_at: mo(-4, 28), arca_flagged: false },
    { id: 'm3', project_id: 'p1', name: 'Aprobación Básico', due_date: mo(-2, 20), amount: 4500, status: 'cobrado', paid_at: mo(-2, 22), arca_flagged: false },
    { id: 'm4', project_id: 'p1', name: 'Entrega Ejecutivo', due_date: mo(0, 20), amount: 4500, status: 'pendiente', arca_flagged: false },
    { id: 'm10', project_id: 'p1', name: 'Saldo final', due_date: mo(2, 15), amount: 3000, status: 'futuro', arca_flagged: false },
  ],
  p2: [
    { id: 'm5', project_id: 'p2', name: 'Anticipo 50%', due_date: mo(-5, 5), amount: 400000, status: 'cobrado', paid_at: mo(-5, 6), arca_flagged: false },
    { id: 'm11', project_id: 'p2', name: 'Avance 25%', due_date: mo(-3, 15), amount: 200000, status: 'cobrado', paid_at: mo(-3, 16), arca_flagged: false },
    { id: 'm6', project_id: 'p2', name: 'Saldo 25%', due_date: mo(-1, 30), amount: 200000, status: 'vencido', arca_flagged: false },
  ],
  p3: [
    { id: 'm7', project_id: 'p3', name: 'Reserva', due_date: mo(-7, 15), amount: 1000, status: 'cobrado', paid_at: mo(-7, 15), arca_flagged: false },
    { id: 'm8', project_id: 'p3', name: 'Segundo pago', due_date: mo(-3, 1), amount: 2000, status: 'cobrado', paid_at: mo(-3, 3), arca_flagged: false },
    { id: 'm9', project_id: 'p3', name: 'Saldo final', due_date: mo(1, 10), amount: 2000, status: 'pendiente', arca_flagged: false },
  ],
  p4: [
    { id: 'm12', project_id: 'p4', name: 'Pago consultoría', due_date: mo(-6, 20), amount: 150000, status: 'cobrado', paid_at: mo(-6, 20), arca_flagged: false },
    { id: 'm13', project_id: 'p4', name: 'Cierre proyecto', due_date: mo(-5, 15), amount: 150000, status: 'cobrado', paid_at: mo(-5, 17), arca_flagged: false },
  ],
}

export const mockCosts: Record<string, CostItem[]> = {
  p1: [
    { id: 'c1', project_id: 'p1', description: 'Impresión planos A1', provider_name: 'Imprenta Palermo', category: 'proveedor', amount: 15000, created_at: mo(-4, 10) },
    { id: 'c2', project_id: 'p1', description: 'Materiales maqueta', provider_name: 'Arteplas', category: 'gasto', amount: 8000, created_at: mo(-4, 15) },
    { id: 'c3', project_id: 'p1', description: 'Alquiler andamios', provider_name: 'AlquiAndamios SRL', category: 'maquinaria', amount: 45000, created_at: mo(-2, 10) },
    { id: 'c6', project_id: 'p1', description: 'Visado municipal', provider_name: 'Gestoría Central', category: 'gasto', amount: 22000, created_at: mo(-1, 5) },
  ],
  p2: [
    { id: 'c4', project_id: 'p2', description: 'Licencia Figma anual', category: 'gasto', amount: 25000, created_at: mo(-5, 1) },
    { id: 'c5', project_id: 'p2', description: 'Tipografías comerciales', category: 'gasto', amount: 12000, created_at: mo(-3, 20) },
  ],
  p3: [
    { id: 'c7', project_id: 'p3', description: 'Equipos audiovisuales', provider_name: 'AV Rental BA', category: 'maquinaria', amount: 80000, created_at: mo(-3, 8) },
  ],
}

export const mockContacts: Contact[] = [
  { id: 'con1', studio_id: 's1', name: 'Imprenta Palermo', category: 'proveedor', phone: '+5491155551234', email: 'ventas@imprentapalermo.com', address: 'Av. Santa Fe 3200, CABA', rating: 4, created_at: '2024-01-01', projects: ['Casa Palermo'] },
  { id: 'con2', studio_id: 's1', name: 'AlquiAndamios SRL', category: 'industrial', phone: '+5491155559876', address: 'Ing. Budge, GBA Sur', rating: 5, created_at: '2024-02-01', projects: ['Casa Palermo'] },
  { id: 'con3', studio_id: 's1', name: 'Familia Rodríguez', category: 'cliente', email: 'rodriguez@email.com', phone: '+5491144443333', rating: 5, created_at: '2024-01-15', projects: ['Casa Palermo'] },
  { id: 'con4', studio_id: 's1', name: 'Martín López', category: 'cliente', email: 'martin@cafedelcentro.com', phone: '+5491166667777', rating: 4, created_at: '2024-02-01', projects: ['Branding Café Del Centro'] },
  { id: 'con5', studio_id: 's1', name: 'Arteplas', category: 'proveedor', phone: '+5491177778888', address: 'Palermo, CABA', rating: 3, created_at: '2024-02-15', projects: ['Casa Palermo'] },
]

export const mockFiles: Record<string, ProjectFile[]> = {
  p1: [
    { id: 'f1', project_id: 'p1', name: 'Presupuesto v1.pdf', type: 'presupuesto', uploaded_at: '2024-01-20', size: '2.4 MB' },
    { id: 'f2', project_id: 'p1', name: 'Presupuesto v2.pdf', type: 'presupuesto', uploaded_at: '2024-02-01', size: '2.8 MB' },
    { id: 'f3', project_id: 'p1', name: 'Planos Anteproyecto.pdf', type: 'entrega', uploaded_at: '2024-02-28', linked_milestone_id: 'm2', status: 'disponible', size: '8.1 MB' },
    { id: 'f4', project_id: 'p1', name: 'Planos Básico.pdf', type: 'entrega', linked_milestone_id: 'm3', status: 'esperando_pago', uploaded_at: '2024-04-01', size: '12.3 MB' },
  ],
  p2: [
    { id: 'f5', project_id: 'p2', name: 'Brief Café Del Centro.pdf', type: 'general', uploaded_at: '2024-02-02', size: '1.1 MB' },
    { id: 'f6', project_id: 'p2', name: 'Propuestas Logo.pdf', type: 'entrega', linked_milestone_id: 'm6', status: 'esperando_pago', uploaded_at: '2024-03-01', size: '4.5 MB' },
  ],
}

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'e1', studio_id: 's1', project_id: 'p1', project_name: 'Casa Palermo', title: 'Reunión con Rodríguez', start: '2024-04-15T10:00', end: '2024-04-15T11:00', type: 'reunion' },
  { id: 'e2', studio_id: 's1', project_id: 'p1', project_name: 'Casa Palermo', title: 'Vencimiento: Aprobación Básico', start: '2024-04-30T09:00', end: '2024-04-30T09:30', type: 'hito' },
  { id: 'e3', studio_id: 's1', project_id: 'p2', project_name: 'Café Del Centro', title: 'Entrega: Propuestas Logo', start: '2024-02-28T18:00', end: '2024-02-28T18:30', type: 'entrega' },
  { id: 'e4', studio_id: 's1', title: 'Visita obra Palermo', project_id: 'p1', project_name: 'Casa Palermo', start: '2024-04-20T08:00', end: '2024-04-20T10:00', type: 'reunion' },
]
