'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Building2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { statusColors, Environment, EnvironmentStatus, availableFloors } from '@/lib/data'

export default function EnvironmentsPage() {
  const { environments, users, resources, addEnvironment, updateEnvironment, deleteEnvironment } = useAppStore()
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAssignResponsable, setShowAssignResponsable] = useState(false)
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null)
  const [formData, setFormData] = useState({
    piso: 2,
    numeroAmbiente: '',
    capacidad: 20,
    estado: 'DISPONIBLE' as EnvironmentStatus,
    tipoCoordinacion: '',
    responsableId: undefined as number | undefined,
  })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const funcionarios = users.filter(u => u.rol === 'Funcionario' && u.estado === 'ACTIVO')
  
  const filteredEnvs = useMemo(() => {
    return environments.filter(env => {
      const matchSearch = 
        env.numeroAmbiente.toLowerCase().includes(search.toLowerCase()) ||
        env.tipoCoordinacion.toLowerCase().includes(search.toLowerCase())
      const matchFloor = floorFilter === 'all' || env.piso.toString() === floorFilter
      const matchStatus = statusFilter === 'all' || env.estado === statusFilter
      return matchSearch && matchFloor && matchStatus
    })
  }, [environments, search, floorFilter, statusFilter])
  
  const paginatedEnvs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEnvs.slice(start, start + itemsPerPage)
  }, [filteredEnvs, currentPage])
  
  const totalPages = Math.ceil(filteredEnvs.length / itemsPerPage)
  
  const getResponsable = (id?: number) => {
    if (!id) return '-'
    const user = users.find(u => u.id === id)
    return user ? `${user.nombres} ${user.apellidos}` : '-'
  }
  
  const getEnvResources = (envId: number) => {
    return resources.filter(r => r.ambienteId === envId)
  }
  
  const resetForm = () => {
    setFormData({
      piso: 2,
      numeroAmbiente: '',
      capacidad: 20,
      estado: 'DISPONIBLE',
      tipoCoordinacion: '',
      responsableId: undefined,
    })
    setFormError('')
    setSelectedEnv(null)
  }
  
  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }
  
  const openEditForm = (env: Environment) => {
    setSelectedEnv(env)
    setFormData({
      piso: env.piso,
      numeroAmbiente: env.numeroAmbiente,
      capacidad: env.capacidad,
      estado: env.estado,
      tipoCoordinacion: env.tipoCoordinacion,
      responsableId: env.responsableId,
    })
    setFormError('')
    setShowForm(true)
  }
  
  const validateForm = () => {
    if (!formData.numeroAmbiente.trim()) return 'El número de ambiente es obligatorio.'
    if (formData.capacidad < 1) return 'La capacidad debe ser mayor a 0.'
    if (!formData.tipoCoordinacion.trim()) return 'El tipo de coordinación es obligatorio.'
    return null
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    const error = validateForm()
    if (error) {
      setFormError(error)
      return
    }
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (selectedEnv) {
      updateEnvironment(selectedEnv.id, formData)
    } else {
      addEnvironment(formData)
    }
    
    setLoading(false)
    setShowForm(false)
    resetForm()
  }
  
  const handleAssignResponsable = async (responsableId: number) => {
    if (!selectedEnv) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    updateEnvironment(selectedEnv.id, { responsableId })
    setLoading(false)
    setShowAssignResponsable(false)
    setSelectedEnv(null)
  }
  
  const handleDelete = async () => {
    if (!selectedEnv) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    deleteEnvironment(selectedEnv.id)
    setLoading(false)
    setShowDeleteConfirm(false)
    setSelectedEnv(null)
  }
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-[#111827] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#16A34A]" />
              Gestión de Ambientes
            </CardTitle>
            <Button 
              onClick={openCreateForm}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Ambiente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por ambiente o coordinación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-full md:w-40 border-[#E5E7EB]">
                <SelectValue placeholder="Piso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pisos</SelectItem>
                {availableFloors.map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>Piso {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                <SelectItem value="ABIERTO">Abierto</SelectItem>
                <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Piso</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ambiente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden md:table-cell">Capacidad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Coordinación</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Responsable</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnvs.map((env) => (
                  <tr key={env.id} className="border-b border-[#E5E7EB] hover:bg-[#F0FDF4] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#111827]">{env.id}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{env.piso}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{env.numeroAmbiente}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden md:table-cell">{env.capacidad}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[env.estado]}`}>
                        {env.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">{env.tipoCoordinacion}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">{getResponsable(env.responsableId)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => { setSelectedEnv(env); setShowDetail(true) }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => openEditForm(env)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                          onClick={() => { setSelectedEnv(env); setShowAssignResponsable(true) }}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => { setSelectedEnv(env); setShowDeleteConfirm(true) }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[#6B7280]">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredEnvs.length)} de {filteredEnvs.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-[#E5E7EB]"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-[#E5E7EB]"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Modal */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">
              {selectedEnv ? 'Editar Ambiente' : 'Nuevo Ambiente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#111827]">Piso</label>
                <Select value={formData.piso.toString()} onValueChange={(v) => setFormData({ ...formData, piso: parseInt(v) })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFloors.map(floor => (
                      <SelectItem key={floor} value={floor.toString()}>Piso {floor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Número de Ambiente</label>
                <Input
                  value={formData.numeroAmbiente}
                  onChange={(e) => setFormData({ ...formData, numeroAmbiente: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ej: 201"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Capacidad</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Estado</label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as EnvironmentStatus })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                    <SelectItem value="ABIERTO">Abierto</SelectItem>
                    <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#111827]">Tipo de Coordinación</label>
                <Input
                  value={formData.tipoCoordinacion}
                  onChange={(e) => setFormData({ ...formData, tipoCoordinacion: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ej: Sistemas, Administrativa"
                />
              </div>
            </div>
            
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-[#E5E7EB]">
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#16A34A] hover:bg-[#15803D] text-white" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {selectedEnv ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Detalle de Ambiente</DialogTitle>
          </DialogHeader>
          {selectedEnv && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Piso</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedEnv.piso}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Ambiente</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedEnv.numeroAmbiente}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Capacidad</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedEnv.capacidad} personas</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedEnv.estado]}`}>
                    {selectedEnv.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                  <p className="text-xs text-[#6B7280]">Coordinación</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedEnv.tipoCoordinacion}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                  <p className="text-xs text-[#6B7280]">Responsable</p>
                  <p className="text-sm font-medium text-[#111827]">{getResponsable(selectedEnv.responsableId)}</p>
                </div>
              </div>
              
              {/* Resources */}
              <div>
                <p className="text-sm font-medium text-[#111827] mb-2">Recursos Asignados</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getEnvResources(selectedEnv.id).length === 0 ? (
                    <p className="text-sm text-[#6B7280]">No hay recursos asignados</p>
                  ) : (
                    getEnvResources(selectedEnv.id).map(resource => (
                      <div key={resource.id} className="p-2 bg-[#F0FDF4] rounded-lg flex justify-between items-center">
                        <span className="text-sm text-[#111827]">{resource.tipoRecurso} - {resource.marca}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[resource.estado]}`}>
                          {resource.estado}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <Button onClick={() => setShowDetail(false)} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Responsable Modal */}
      <Dialog open={showAssignResponsable} onOpenChange={setShowAssignResponsable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Asignar Responsable</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Seleccione un funcionario para asignar como responsable del ambiente {selectedEnv?.numeroAmbiente}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {funcionarios.map(func => (
              <button
                key={func.id}
                onClick={() => handleAssignResponsable(func.id)}
                className="w-full p-3 bg-[#F0FDF4] hover:bg-[#DCFCE7] rounded-lg flex items-center gap-3 transition-colors"
                disabled={loading}
              >
                <div className="w-10 h-10 bg-[#16A34A] rounded-full flex items-center justify-center text-white font-medium">
                  {func.nombres[0]}{func.apellidos[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#111827]">{func.nombres} {func.apellidos}</p>
                  <p className="text-xs text-[#6B7280]">{func.documento}</p>
                </div>
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => setShowAssignResponsable(false)} className="w-full border-[#E5E7EB]">
            Cancelar
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              ¿Está seguro de que desea eliminar el ambiente {selectedEnv?.numeroAmbiente}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-[#E5E7EB]">
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
