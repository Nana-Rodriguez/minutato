// Types
export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'
export type UserRole = 'Administrador' | 'Guarda' | 'Funcionario'
export type ContractType = 'Planta' | 'Contratista'

export type EnvironmentStatus = 'DISPONIBLE' | 'PENDIENTE_APERTURA' | 'ABIERTO' | 'PENDIENTE_CIERRE' | 'EN_MANTENIMIENTO'

export type ResourceStatus = 'DISPONIBLE' | 'ASIGNADO' | 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA'
export type ResourceCategory = 'Mobiliario' | 'Hardware'
export type ResourceType = 'Portátil' | 'Computador' | 'Mouse' | 'Pad Mouse' | 'Mesa' | 'Silla' | 'Video Beam' | 'Televisor' | 'Tablero'

export type RequestStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FINALIZADA' | 'CANCELADA'
export type RequestType = 'APERTURA' | 'CIERRE'
export type EventType = 'Formación' | 'Evento' | 'Reunión' | 'Actividad'

export interface User {
  id: number
  nombres: string
  apellidos: string
  documento: string
  correo: string
  telefono: string
  rol: UserRole
  tipoContrato: ContractType
  estado: UserStatus
  foto?: string
}

export interface Environment {
  id: number
  piso: number
  numeroAmbiente: string
  capacidad: number
  estado: EnvironmentStatus
  tipoCoordinacion: string
  responsableId?: number
}

export interface Resource {
  id: number
  categoria: ResourceCategory
  tipoRecurso: ResourceType
  marca: string
  serial: string
  modelo: string
  fechaIngreso: string
  estado: ResourceStatus
  encargadoId?: number
  ambienteId?: number
}

export interface Request {
  id: number
  tipo: RequestType
  estado: RequestStatus
  funcionarioId: number
  ambienteId: number
  tipoEvento?: EventType
  fechaApertura: string
  fechaCierre?: string
  novedades?: string
  observaciones?: string
  guardaId?: number
  checklistRecursos?: { recursoId: number; estado: boolean }[]
}

// Initial test data (only in database, never shown in UI)
export const initialUsers: User[] = [
  {
    id: 1,
    nombres: 'Nicole Daniela',
    apellidos: 'Gonzalez Rodriguez',
    documento: '1234567890',
    correo: 'nicole.gonzalez@digiminuta.com',
    telefono: '3001234567',
    rol: 'Guarda',
    tipoContrato: 'Planta',
    estado: 'ACTIVO'
  },
  {
    id: 2,
    nombres: 'Alex Alfredo',
    apellidos: 'Quemba Lopez',
    documento: '0987654321',
    correo: 'alex.quemba@digiminuta.com',
    telefono: '3009876543',
    rol: 'Administrador',
    tipoContrato: 'Planta',
    estado: 'ACTIVO'
  },
  {
    id: 3,
    nombres: 'Valerie Nicolle',
    apellidos: 'Castro Bernal',
    documento: '1122334455',
    correo: 'valerie.castro@digiminuta.com',
    telefono: '3005551234',
    rol: 'Funcionario',
    tipoContrato: 'Contratista',
    estado: 'ACTIVO'
  }
]

export const initialEnvironments: Environment[] = [
  { id: 1, piso: 2, numeroAmbiente: '201', capacidad: 30, estado: 'DISPONIBLE', tipoCoordinacion: 'Sistemas' },
  { id: 2, piso: 2, numeroAmbiente: '202', capacidad: 25, estado: 'DISPONIBLE', tipoCoordinacion: 'Sistemas' },
  { id: 3, piso: 3, numeroAmbiente: '301', capacidad: 40, estado: 'ABIERTO', tipoCoordinacion: 'Administrativa', responsableId: 3 },
  { id: 4, piso: 3, numeroAmbiente: '302', capacidad: 20, estado: 'EN_MANTENIMIENTO', tipoCoordinacion: 'Administrativa' },
  { id: 5, piso: 7, numeroAmbiente: '701', capacidad: 50, estado: 'DISPONIBLE', tipoCoordinacion: 'Formación' },
  { id: 6, piso: 8, numeroAmbiente: '801', capacidad: 35, estado: 'DISPONIBLE', tipoCoordinacion: 'Capacitación' },
  { id: 7, piso: 9, numeroAmbiente: '901', capacidad: 45, estado: 'DISPONIBLE', tipoCoordinacion: 'Eventos' },
  { id: 8, piso: 10, numeroAmbiente: '1001', capacidad: 30, estado: 'DISPONIBLE', tipoCoordinacion: 'Reuniones' },
]

export const initialResources: Resource[] = [
  { id: 1, categoria: 'Hardware', tipoRecurso: 'Portátil', marca: 'Lenovo', serial: 'LNV001', modelo: 'ThinkPad X1', fechaIngreso: '2024-01-15', estado: 'ASIGNADO', ambienteId: 1 },
  { id: 2, categoria: 'Hardware', tipoRecurso: 'Computador', marca: 'HP', serial: 'HP002', modelo: 'ProDesk 400', fechaIngreso: '2024-02-20', estado: 'DISPONIBLE' },
  { id: 3, categoria: 'Hardware', tipoRecurso: 'Video Beam', marca: 'Epson', serial: 'EPS003', modelo: 'PowerLite', fechaIngreso: '2024-01-10', estado: 'ASIGNADO', ambienteId: 1 },
  { id: 4, categoria: 'Mobiliario', tipoRecurso: 'Mesa', marca: 'Office', serial: 'MSA004', modelo: 'Ejecutiva', fechaIngreso: '2023-12-01', estado: 'ASIGNADO', ambienteId: 1 },
  { id: 5, categoria: 'Mobiliario', tipoRecurso: 'Silla', marca: 'Ergonomic', serial: 'SLL005', modelo: 'Pro Chair', fechaIngreso: '2023-12-01', estado: 'ASIGNADO', ambienteId: 1 },
  { id: 6, categoria: 'Hardware', tipoRecurso: 'Televisor', marca: 'Samsung', serial: 'SAM006', modelo: 'Smart TV 55"', fechaIngreso: '2024-03-05', estado: 'DISPONIBLE' },
  { id: 7, categoria: 'Mobiliario', tipoRecurso: 'Tablero', marca: 'Board', serial: 'TBL007', modelo: 'Acrílico 2x1', fechaIngreso: '2024-01-20', estado: 'ASIGNADO', ambienteId: 3 },
  { id: 8, categoria: 'Hardware', tipoRecurso: 'Mouse', marca: 'Logitech', serial: 'LOG008', modelo: 'MX Master', fechaIngreso: '2024-04-10', estado: 'EN_MANTENIMIENTO' },
]

export const initialRequests: Request[] = [
  {
    id: 1,
    tipo: 'APERTURA',
    estado: 'APROBADA',
    funcionarioId: 3,
    ambienteId: 3,
    tipoEvento: 'Reunión',
    fechaApertura: '2024-12-01T08:00:00',
    guardaId: 1,
    checklistRecursos: [{ recursoId: 7, estado: true }]
  }
]

// Available floors
export const availableFloors = [2, 3, 7, 8, 9, 10, 11, 12, 14]

// Test password (only for validation, never shown)
export const TEST_PASSWORD = 'Digiminuta2026*'

// Status badge colors
export const statusColors = {
  // User status
  ACTIVO: 'bg-green-100 text-green-800',
  INACTIVO: 'bg-gray-100 text-gray-800',
  BLOQUEADO: 'bg-red-100 text-red-800',
  // Environment status
  DISPONIBLE: 'bg-green-100 text-green-800',
  PENDIENTE_APERTURA: 'bg-yellow-100 text-yellow-800',
  ABIERTO: 'bg-blue-100 text-blue-800',
  PENDIENTE_CIERRE: 'bg-orange-100 text-orange-800',
  EN_MANTENIMIENTO: 'bg-purple-100 text-purple-800',
  // Resource status
  ASIGNADO: 'bg-blue-100 text-blue-800',
  DADO_DE_BAJA: 'bg-red-100 text-red-800',
  // Request status
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  APROBADA: 'bg-green-100 text-green-800',
  RECHAZADA: 'bg-red-100 text-red-800',
  FINALIZADA: 'bg-gray-100 text-gray-800',
  CANCELADA: 'bg-gray-100 text-gray-800',
}
