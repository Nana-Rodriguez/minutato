'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Loader2, Box, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { 
  statusColors, Resource, ResourceStatus, ResourceCategory, ResourceType, 
  availableFloors 
} from '@/lib/data'

const resourceTypes: ResourceType[] = ['Portátil', 'Computador', 'Mouse', 'Pad Mouse', 'Mesa', 'Silla', 'Video Beam', 'Televisor', 'Tablero']

export default function ResourcesPage() {
  const { resources, environments, users, addResource, updateResource, deleteResource, assignResources } = useAppStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedResources, setSelectedResources] = useState<number[]>([])
  const [assignFloor, setAssignFloor] = useState<string>('')
  const [assignEnv, setAssignEnv] = useState<string>('')
  const [formData, setFormData] = useState({
    categoria: 'Hardware' as ResourceCategory,
    tipoRecurso: 'Portátil' as ResourceType,
    marca: '',
    serial: '',
    modelo: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'DISPONIBLE' as ResourceStatus,
    encargadoId: undefined as number | undefined,
    ambienteId: undefined as number | undefined,
  })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchSearch = 
        resource.tipoRecurso.toLowerCase().includes(search.toLowerCase()) ||
        resource.marca.toLowerCase().includes(search.toLowerCase()) ||
        resource.serial.toLowerCase().includes(search.toLowerCase()) ||
        resource.modelo.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || resource.categoria === categoryFilter
      const matchStatus = statusFilter === 'all' || resource.estado === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
  }, [resources, search, categoryFilter, statusFilter])
  
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredResources.slice(start, start + itemsPerPage)
  }, [filteredResources, currentPage])
  
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  
  const floorEnvironments = useMemo(() => {
    if (!assignFloor) return []
    return environments.filter(e => e.piso.toString() === assignFloor)
  }, [environments, assignFloor])
  
  const getEncargado = (id?: number) => {
    if (!id) return '-'
    const user = users.find(u => u.id === id)
    return user ? `${user.nombres} ${user.apellidos}` : '-'
  }
  
  const getAmbiente = (id?: number) => {
    if (!id) return '-'
    const env = environments.find(e => e.id === id)
    return env ? `Piso ${env.piso} - ${env.numeroAmbiente}` : '-'
  }
  
  const resetForm = () => {
    setFormData({
      categoria: 'Hardware',
      tipoRecurso: 'Portátil',
      marca: '',
      serial: '',
      modelo: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      estado: 'DISPONIBLE',
      encargadoId: undefined,
      ambienteId: undefined,
    })
    setFormError('')
    setSelectedResource(null)
  }
  
  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }
  
  const openEditForm = (resource: Resource) => {
    setSelectedResource(resource)
    setFormData({
      categoria: resource.categoria,
      tipoRecurso: resource.tipoRecurso,
      marca: resource.marca,
      serial: resource.serial,
      modelo: resource.modelo,
      fechaIngreso: resource.fechaIngreso,
      estado: resource.estado,
      encargadoId: resource.encargadoId,
      ambienteId: resource.ambienteId,
    })
    setFormError('')
    setShowForm(true)
  }
  
  const validateForm = () => {
    if (!formData.marca.trim()) return 'La marca es obligatoria.'
    if (!formData.serial.trim()) return 'El serial es obligatorio.'
    if (!formData.modelo.trim()) return 'El modelo es obligatorio.'
    if (!formData.fechaIngreso) return 'La fecha de ingreso es obligatoria.'
    if (new Date(formData.fechaIngreso) > new Date()) return 'La fecha de ingreso no puede ser futura.'
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
    
    if (selectedResource) {
      updateResource(selectedResource.id, formData)
    } else {
      const result = addResource(formData)
      if (!result.success) {
        setFormError(result.error || 'Error al crear recurso.')
        setLoading(false)
        return
      }
    }
    
    setLoading(false)
    setShowForm(false)
    resetForm()
  }
  
  const handleDelete = async () => {
    if (!selectedResource) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    deleteResource(selectedResource.id)
    setLoading(false)
    setShowDeleteConfirm(false)
    setSelectedResource(null)
  }
  
  const toggleResourceSelection = (id: number) => {
    setSelectedResources(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }
  
  const handleAssign = async () => {
    if (!assignEnv || selectedResources.length === 0) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    assignResources(selectedResources, parseInt(assignEnv))
    setLoading(false)
    setShowAssign(false)
    setSelectedResources([])
    setAssignFloor('')
    setAssignEnv('')
  }
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-[#111827] flex items-center gap-2">
              <Box className="w-5 h-5 text-[#16A34A]" />
              Gestión de Recursos
            </CardTitle>
            <div className="flex gap-2">
              {selectedResources.length > 0 && (
                <Button 
                  onClick={() => setShowAssign(true)}
                  variant="outline"
                  className="border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Asignar ({selectedResources.length})
                </Button>
              )}
              <Button 
                onClick={openCreateForm}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Recurso
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por tipo, marca, serial o modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40 border-[#E5E7EB]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Mobiliario">Mobiliario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                <SelectItem value="ASIGNADO">Asignado</SelectItem>
                <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                <SelectItem value="DADO_DE_BAJA">Dado de Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="py-3 px-4 text-left">
                    <Checkbox
                      checked={selectedResources.length === paginatedResources.filter(r => r.estado === 'DISPONIBLE').length && selectedResources.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedResources(paginatedResources.filter(r => r.estado === 'DISPONIBLE').map(r => r.id))
                        } else {
                          setSelectedResources([])
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden md:table-cell">Marca</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Serial</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden xl:table-cell">Ambiente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResources.map((resource) => (
                  <tr key={resource.id} className="border-b border-[#E5E7EB] hover:bg-[#F0FDF4] transition-colors">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedResources.includes(resource.id)}
                        onCheckedChange={() => toggleResourceSelection(resource.id)}
                        disabled={resource.estado !== 'DISPONIBLE'}
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{resource.id}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{resource.tipoRecurso}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden md:table-cell">{resource.marca}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">{resource.serial}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[resource.estado]}`}>
                        {resource.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden xl:table-cell">{getAmbiente(resource.ambienteId)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => { setSelectedResource(resource); setShowDetail(true) }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => openEditForm(resource)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => { setSelectedResource(resource); setShowDeleteConfirm(true) }}
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
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredResources.length)} de {filteredResources.length}
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
              {selectedResource ? 'Editar Recurso' : 'Nuevo Recurso'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#111827]">Categoría</label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v as ResourceCategory })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Tipo de Recurso</label>
                <Select value={formData.tipoRecurso} onValueChange={(v) => setFormData({ ...formData, tipoRecurso: v as ResourceType })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Marca</label>
                <Input
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ej: Lenovo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Serial</label>
                <Input
                  value={formData.serial}
                  onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ej: ABC123"
                  disabled={!!selectedResource}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Modelo</label>
                <Input
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ej: ThinkPad X1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Fecha de Ingreso</label>
                <Input
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-[#111827]">Estado</label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as ResourceStatus })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                    <SelectItem value="ASIGNADO">Asignado</SelectItem>
                    <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                    <SelectItem value="DADO_DE_BAJA">Dado de Baja</SelectItem>
                  </SelectContent>
                </Select>
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
                {selectedResource ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Detalle de Recurso</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Categoría</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.categoria}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Tipo</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.tipoRecurso}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Marca</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.marca}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Serial</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.serial}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Modelo</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.modelo}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Fecha Ingreso</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedResource.fechaIngreso}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedResource.estado]}`}>
                    {selectedResource.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Encargado</p>
                  <p className="text-sm font-medium text-[#111827]">{getEncargado(selectedResource.encargadoId)}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                  <p className="text-xs text-[#6B7280]">Ambiente Asignado</p>
                  <p className="text-sm font-medium text-[#111827]">{getAmbiente(selectedResource.ambienteId)}</p>
                </div>
              </div>
              <Button onClick={() => setShowDetail(false)} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Assign Modal */}
      <Dialog open={showAssign} onOpenChange={(open) => { setShowAssign(open); if (!open) { setAssignFloor(''); setAssignEnv('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Asignar Recursos</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Seleccione el piso y ambiente para asignar {selectedResources.length} recurso(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#111827]">Piso</label>
              <Select value={assignFloor} onValueChange={(v) => { setAssignFloor(v); setAssignEnv('') }}>
                <SelectTrigger className="mt-1 border-[#E5E7EB]">
                  <SelectValue placeholder="Seleccione un piso" />
                </SelectTrigger>
                <SelectContent>
                  {availableFloors.map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>Piso {floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">Ambiente</label>
              <Select value={assignEnv} onValueChange={setAssignEnv} disabled={!assignFloor}>
                <SelectTrigger className="mt-1 border-[#E5E7EB]">
                  <SelectValue placeholder="Seleccione un ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {floorEnvironments.map(env => (
                    <SelectItem key={env.id} value={env.id.toString()}>{env.numeroAmbiente} - {env.tipoCoordinacion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAssign(false)} className="border-[#E5E7EB]">
                Cancelar
              </Button>
              <Button 
                onClick={handleAssign} 
                className="bg-[#16A34A] hover:bg-[#15803D] text-white" 
                disabled={loading || !assignEnv}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              ¿Está seguro de que desea eliminar el recurso {selectedResource?.tipoRecurso} ({selectedResource?.serial})? Esta acción no se puede deshacer.
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
