'use client'

import { useState, useMemo } from 'react'
import { ClipboardList, Search, Eye, Check, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { statusColors, Request } from '@/lib/data'

export default function SolicitudesPage() {
  const { currentUser, users, environments, resources, requests, approveRequest, rejectRequest, finalizeRequest } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showManage, setShowManage] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [checklist, setChecklist] = useState<{ recursoId: number; estado: boolean }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Get pending requests
  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.estado === 'PENDIENTE')
      .map(r => {
        const env = environments.find(e => e.id === r.ambienteId)
        const func = users.find(u => u.id === r.funcionarioId)
        return { ...r, environment: env, funcionario: func }
      })
      .sort((a, b) => new Date(b.fechaApertura).getTime() - new Date(a.fechaApertura).getTime())
  }, [requests, environments, users])
  
  const filteredRequests = useMemo(() => {
    return pendingRequests.filter(r => {
      const matchSearch = 
        r.funcionario?.nombres.toLowerCase().includes(search.toLowerCase()) ||
        r.funcionario?.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        r.funcionario?.documento.includes(search) ||
        r.environment?.numeroAmbiente.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'all' || r.tipo === typeFilter
      return matchSearch && matchType
    })
  }, [pendingRequests, search, typeFilter])
  
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRequests.slice(start, start + itemsPerPage)
  }, [filteredRequests, currentPage])
  
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  
  // Get resources for selected environment
  const envResources = useMemo(() => {
    if (!selectedRequest) return []
    return resources.filter(r => r.ambienteId === selectedRequest.ambienteId)
  }, [resources, selectedRequest])
  
  const openManageModal = (request: Request) => {
    setSelectedRequest(request)
    setObservaciones('')
    setError('')
    // Initialize checklist with environment resources
    const envRes = resources.filter(r => r.ambienteId === request.ambienteId)
    setChecklist(envRes.map(r => ({ recursoId: r.id, estado: true })))
    setShowManage(true)
  }
  
  const hasIncompleteResources = checklist.some(c => !c.estado)
  
  const handleApprove = async () => {
    if (!selectedRequest || !currentUser) return
    
    if (hasIncompleteResources && !observaciones.trim()) {
      setError('Las observaciones son obligatorias cuando hay recursos incompletos.')
      return
    }
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (selectedRequest.tipo === 'APERTURA') {
      approveRequest(selectedRequest.id, currentUser.id, observaciones || undefined, checklist)
    } else {
      finalizeRequest(selectedRequest.id, currentUser.id, observaciones || undefined, checklist)
    }
    
    setLoading(false)
    setShowManage(false)
    setSelectedRequest(null)
  }
  
  const handleReject = async () => {
    if (!selectedRequest || !currentUser) return
    
    if (!observaciones.trim()) {
      setError('La justificación es obligatoria para rechazar.')
      return
    }
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    rejectRequest(selectedRequest.id, currentUser.id, observaciones)
    
    setLoading(false)
    setShowManage(false)
    setSelectedRequest(null)
  }
  
  const toggleChecklistItem = (recursoId: number) => {
    setChecklist(prev => 
      prev.map(c => c.recursoId === recursoId ? { ...c, estado: !c.estado } : c)
    )
  }
  
  if (!currentUser) return null
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <CardTitle className="text-[#111827] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#16A34A]" />
            Solicitudes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por funcionario, documento o ambiente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="APERTURA">Apertura</SelectItem>
                <SelectItem value="CIERRE">Cierre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Table */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-[#6B7280]">No hay solicitudes pendientes</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Funcionario</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden md:table-cell">Documento</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Piso</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ambiente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.map((request) => (
                      <tr key={request.id} className="border-b border-[#E5E7EB] hover:bg-[#F0FDF4] transition-colors">
                        <td className="py-3 px-4 text-sm text-[#111827]">
                          {new Date(request.fechaApertura).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827]">
                          {request.funcionario?.nombres} {request.funcionario?.apellidos}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827] hidden md:table-cell">
                          {request.funcionario?.documento}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.tipo === 'APERTURA' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {request.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">
                          {request.environment?.piso}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827]">
                          {request.environment?.numeroAmbiente}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.estado]}`}>
                            {request.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            onClick={() => openManageModal(request)}
                            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs"
                            size="sm"
                          >
                            Gestionar
                          </Button>
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
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredRequests.length)} de {filteredRequests.length}
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
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Manage Modal */}
      <Dialog open={showManage} onOpenChange={(open) => { setShowManage(open); if (!open) { setSelectedRequest(null); setObservaciones(''); setError('') } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">
              Gestionar Solicitud de {selectedRequest?.tipo}
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Revise la información y gestione la solicitud
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Request Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Funcionario</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {users.find(u => u.id === selectedRequest.funcionarioId)?.nombres} {users.find(u => u.id === selectedRequest.funcionarioId)?.apellidos}
                  </p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Documento</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {users.find(u => u.id === selectedRequest.funcionarioId)?.documento}
                  </p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Piso</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {environments.find(e => e.id === selectedRequest.ambienteId)?.piso}
                  </p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Ambiente</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {environments.find(e => e.id === selectedRequest.ambienteId)?.numeroAmbiente}
                  </p>
                </div>
              </div>
              
              {selectedRequest.tipoEvento && (
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Tipo de Evento</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedRequest.tipoEvento}</p>
                </div>
              )}
              
              {selectedRequest.novedades && (
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Novedades del Funcionario</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedRequest.novedades}</p>
                </div>
              )}
              
              {/* Resource Checklist */}
              <div>
                <p className="text-sm font-medium text-[#111827] mb-2">Checklist de Recursos del Ambiente</p>
                {envResources.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No hay recursos asignados a este ambiente</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-[#E5E7EB] rounded-lg p-3">
                    {envResources.map(resource => {
                      const checkItem = checklist.find(c => c.recursoId === resource.id)
                      return (
                        <div 
                          key={resource.id} 
                          className="flex items-center justify-between p-2 bg-[#F0FDF4] rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checkItem?.estado ?? true}
                              onCheckedChange={() => toggleChecklistItem(resource.id)}
                            />
                            <span className="text-sm text-[#111827]">
                              {resource.tipoRecurso} - {resource.marca} ({resource.serial})
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${checkItem?.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {checkItem?.estado ? 'Completo' : 'Incompleto'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Observations */}
              <div>
                <label className="text-sm font-medium text-[#111827]">
                  Observaciones {hasIncompleteResources && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder={hasIncompleteResources ? 'Obligatorio cuando hay recursos incompletos...' : 'Opcional...'}
                  className="mt-1 min-h-24 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManage(false)} 
                  className="flex-1 border-[#E5E7EB]"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                  Rechazar
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  {selectedRequest.tipo === 'APERTURA' ? 'Aprobar' : 'Finalizar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
