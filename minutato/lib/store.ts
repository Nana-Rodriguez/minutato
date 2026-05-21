'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  User, Environment, Resource, Request,
  initialUsers, initialEnvironments, initialResources, initialRequests,
  TEST_PASSWORD, UserStatus
} from './data'

interface LoginAttempt {
  documento: string
  attempts: number
  blockedUntil?: number
}

interface AppStore {
  // Auth
  currentUser: User | null
  loginAttempts: LoginAttempt[]
  
  // Data
  users: User[]
  environments: Environment[]
  resources: Resource[]
  requests: Request[]
  
  // Auth actions
  login: (documento: string, password: string) => { success: boolean; error?: string; blocked?: boolean; remainingTime?: number }
  logout: () => void
  
  // User actions
  addUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string }
  updateUser: (id: number, user: Partial<User>) => void
  deleteUser: (id: number) => void
  
  // Environment actions
  addEnvironment: (env: Omit<Environment, 'id'>) => void
  updateEnvironment: (id: number, env: Partial<Environment>) => void
  deleteEnvironment: (id: number) => void
  
  // Resource actions
  addResource: (resource: Omit<Resource, 'id'>) => { success: boolean; error?: string }
  updateResource: (id: number, resource: Partial<Resource>) => void
  deleteResource: (id: number) => void
  assignResources: (resourceIds: number[], ambienteId: number) => void
  
  // Request actions
  addRequest: (request: Omit<Request, 'id'>) => void
  updateRequest: (id: number, request: Partial<Request>) => void
  approveRequest: (id: number, guardaId: number, observaciones?: string, checklist?: { recursoId: number; estado: boolean }[]) => void
  rejectRequest: (id: number, guardaId: number, observaciones: string) => void
  finalizeRequest: (id: number, guardaId: number, observaciones?: string, checklist?: { recursoId: number; estado: boolean }[]) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      loginAttempts: [],
      users: initialUsers,
      environments: initialEnvironments,
      resources: initialResources,
      requests: initialRequests,
      
      login: (documento, password) => {
        const { users, loginAttempts } = get()
        const now = Date.now()
        
        // Check if blocked
        const attemptRecord = loginAttempts.find(a => a.documento === documento)
        if (attemptRecord?.blockedUntil && attemptRecord.blockedUntil > now) {
          const remainingTime = Math.ceil((attemptRecord.blockedUntil - now) / 1000 / 60)
          return { success: false, blocked: true, remainingTime }
        }
        
        // Find user
        const user = users.find(u => u.documento === documento)
        
        if (!user || password !== TEST_PASSWORD) {
          // Update attempts
          const newAttempts = [...loginAttempts]
          const existingIndex = newAttempts.findIndex(a => a.documento === documento)
          
          if (existingIndex >= 0) {
            newAttempts[existingIndex].attempts += 1
            if (newAttempts[existingIndex].attempts >= 3) {
              newAttempts[existingIndex].blockedUntil = now + 15 * 60 * 1000 // 15 minutes
              set({ loginAttempts: newAttempts })
              return { success: false, blocked: true, remainingTime: 15 }
            }
          } else {
            newAttempts.push({ documento, attempts: 1 })
          }
          
          set({ loginAttempts: newAttempts })
          return { success: false, error: 'Documento o contraseña incorrectos.' }
        }
        
        if (user.estado === 'BLOQUEADO') {
          return { success: false, error: 'Su cuenta está bloqueada. Contacte al administrador.' }
        }
        
        if (user.estado === 'INACTIVO') {
          return { success: false, error: 'Su cuenta está inactiva. Contacte al administrador.' }
        }
        
        // Reset attempts on successful login
        const newAttempts = loginAttempts.filter(a => a.documento !== documento)
        set({ currentUser: user, loginAttempts: newAttempts })
        return { success: true }
      },
      
      logout: () => set({ currentUser: null }),
      
      addUser: (userData) => {
        const { users } = get()
        // Check for duplicate documento
        if (users.some(u => u.documento === userData.documento)) {
          return { success: false, error: 'El documento ya está registrado.' }
        }
        // Check for duplicate correo
        if (users.some(u => u.correo === userData.correo)) {
          return { success: false, error: 'El correo ya está registrado.' }
        }
        
        const newUser: User = {
          ...userData,
          id: Math.max(...users.map(u => u.id)) + 1
        }
        set({ users: [...users, newUser] })
        return { success: true }
      },
      
      updateUser: (id, userData) => {
        const { users } = get()
        set({
          users: users.map(u => u.id === id ? { ...u, ...userData } : u)
        })
      },
      
      deleteUser: (id) => {
        const { users } = get()
        set({ users: users.filter(u => u.id !== id) })
      },
      
      addEnvironment: (envData) => {
        const { environments } = get()
        const newEnv: Environment = {
          ...envData,
          id: Math.max(...environments.map(e => e.id), 0) + 1
        }
        set({ environments: [...environments, newEnv] })
      },
      
      updateEnvironment: (id, envData) => {
        const { environments } = get()
        set({
          environments: environments.map(e => e.id === id ? { ...e, ...envData } : e)
        })
      },
      
      deleteEnvironment: (id) => {
        const { environments } = get()
        set({ environments: environments.filter(e => e.id !== id) })
      },
      
      addResource: (resourceData) => {
        const { resources } = get()
        // Check for duplicate serial
        if (resources.some(r => r.serial === resourceData.serial)) {
          return { success: false, error: 'El serial ya está registrado.' }
        }
        
        const newResource: Resource = {
          ...resourceData,
          id: Math.max(...resources.map(r => r.id), 0) + 1
        }
        set({ resources: [...resources, newResource] })
        return { success: true }
      },
      
      updateResource: (id, resourceData) => {
        const { resources } = get()
        set({
          resources: resources.map(r => r.id === id ? { ...r, ...resourceData } : r)
        })
      },
      
      deleteResource: (id) => {
        const { resources } = get()
        set({ resources: resources.filter(r => r.id !== id) })
      },
      
      assignResources: (resourceIds, ambienteId) => {
        const { resources } = get()
        set({
          resources: resources.map(r => 
            resourceIds.includes(r.id) 
              ? { ...r, ambienteId, estado: 'ASIGNADO' as const }
              : r
          )
        })
      },
      
      addRequest: (requestData) => {
        const { requests } = get()
        const newRequest: Request = {
          ...requestData,
          id: Math.max(...requests.map(r => r.id), 0) + 1
        }
        set({ requests: [...requests, newRequest] })
      },
      
      updateRequest: (id, requestData) => {
        const { requests } = get()
        set({
          requests: requests.map(r => r.id === id ? { ...r, ...requestData } : r)
        })
      },
      
      approveRequest: (id, guardaId, observaciones, checklist) => {
        const { requests, environments } = get()
        const request = requests.find(r => r.id === id)
        if (!request) return
        
        set({
          requests: requests.map(r => 
            r.id === id 
              ? { ...r, estado: 'APROBADA' as const, guardaId, observaciones, checklistRecursos: checklist }
              : r
          ),
          environments: environments.map(e =>
            e.id === request.ambienteId
              ? { ...e, estado: 'ABIERTO' as const }
              : e
          )
        })
      },
      
      rejectRequest: (id, guardaId, observaciones) => {
        const { requests, environments } = get()
        const request = requests.find(r => r.id === id)
        if (!request) return
        
        set({
          requests: requests.map(r => 
            r.id === id 
              ? { ...r, estado: 'RECHAZADA' as const, guardaId, observaciones }
              : r
          ),
          environments: environments.map(e =>
            e.id === request.ambienteId
              ? { ...e, estado: 'DISPONIBLE' as const }
              : e
          )
        })
      },
      
      finalizeRequest: (id, guardaId, observaciones, checklist) => {
        const { requests, environments } = get()
        const request = requests.find(r => r.id === id)
        if (!request) return
        
        set({
          requests: requests.map(r => 
            r.id === id 
              ? { ...r, estado: 'FINALIZADA' as const, guardaId, observaciones, checklistRecursos: checklist, fechaCierre: new Date().toISOString() }
              : r
          ),
          environments: environments.map(e =>
            e.id === request.ambienteId
              ? { ...e, estado: 'DISPONIBLE' as const }
              : e
          )
        })
      },
    }),
    {
      name: 'digiminuta-storage',
    }
  )
)
