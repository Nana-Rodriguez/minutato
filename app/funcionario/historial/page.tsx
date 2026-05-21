'use client'

import { useState, useMemo } from 'react'
import { History, Eye, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { statusColors, Request } from '@/lib/data'

export default function HistorialPage() {
  const { currentUser, environments, requests } = useAppStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Get all requests for current user
  const userRequests = useMemo(() => {
    if (!currentUser) return []
    return requests.filter(r => r.funcionarioId === currentUser.id)
      .map(r => {
        const env = environments.find(e => e.id === r.ambienteId)
        return { ...r, environment: env }
      })
      .sort((a, b) => new Date(b.fechaApertura).getTime() - new Date(a.fechaApertura).getTime())
  }, [requests, environments, currentUser])
  
  const filteredRequests = useMemo(() => {
    return userRequests.filter(r => {
      const matchSearch = 
        r.environment?.numeroAmbiente?.toLowerCase().includes(search.toLowerCase()) ||
        r.tipoEvento?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.estado === statusFilter
      return matchSearch && matchStatus
    })
  }, [userRequests, search, statusFilter])
  
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredRequests.slice(start, start + itemsPerPage)
  }, [filteredRequests, currentPage])
  
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  
  if (!currentUser) return null
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <CardTitle className="text-[#111827] flex items-center gap-2">
            <History className="w-5 h-5 text-[#16A34A]" />
            Historial de Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por ambiente o tipo de evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="APROBADA">Aprobada</SelectItem>
                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Table */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-[#6B7280]">No hay solicitudes en el historial</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Fecha Apertura</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden md:table-cell">Fecha Cierre</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Piso</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Ambiente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Tipo Evento</th>
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
                        <td className="py-3 px-4 text-sm text-[#111827] hidden md:table-cell">
                          {request.fechaCierre 
                            ? new Date(request.fechaCierre).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{request.environment?.piso}</td>
                        <td className="py-3 px-4 text-sm text-[#111827]">{request.environment?.numeroAmbiente}</td>
                        <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">{request.tipoEvento || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.estado]}`}>
                            {request.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                            onClick={() => { setSelectedRequest(request); setShowDetail(true) }}
                          >
                            <Eye className="w-4 h-4" />
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
      
      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Detalle de Solicitud</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Tipo</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedRequest.tipo}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedRequest.estado]}`}>
                    {selectedRequest.estado}
                  </span>
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
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Fecha Apertura</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date(selectedRequest.fechaApertura).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Fecha Cierre</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedRequest.fechaCierre 
                      ? new Date(selectedRequest.fechaCierre).toLocaleString('es-CO')
                      : '-'}
                  </p>
                </div>
                {selectedRequest.tipoEvento && (
                  <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                    <p className="text-xs text-[#6B7280]">Tipo de Evento</p>
                    <p className="text-sm font-medium text-[#111827]">{selectedRequest.tipoEvento}</p>
                  </div>
                )}
                {selectedRequest.novedades && (
                  <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                    <p className="text-xs text-[#6B7280]">Novedades</p>
                    <p className="text-sm font-medium text-[#111827]">{selectedRequest.novedades}</p>
                  </div>
                )}
                {selectedRequest.observaciones && (
                  <div className="p-3 bg-[#F0FDF4] rounded-lg col-span-2">
                    <p className="text-xs text-[#6B7280]">Observaciones del Guarda</p>
                    <p className="text-sm font-medium text-[#111827]">{selectedRequest.observaciones}</p>
                  </div>
                )}
              </div>
              <Button onClick={() => setShowDetail(false)} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
