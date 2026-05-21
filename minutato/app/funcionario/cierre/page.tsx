'use client'

import { useState, useMemo } from 'react'
import { DoorClosed, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { statusColors } from '@/lib/data'

export default function CierrePage() {
  const { currentUser, environments, requests, addRequest, updateEnvironment } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null)
  const [novedades, setNovedades] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Get approved requests with open environments for current user
  const openRequests = useMemo(() => {
    if (!currentUser) return []
    return requests.filter(r => 
      r.funcionarioId === currentUser.id && 
      r.estado === 'APROBADA' &&
      r.tipo === 'APERTURA'
    ).map(r => {
      const env = environments.find(e => e.id === r.ambienteId)
      return { ...r, environment: env }
    }).filter(r => r.environment?.estado === 'ABIERTO')
  }, [requests, environments, currentUser])
  
  const getEnvInfo = (requestId: number) => {
    const req = openRequests.find(r => r.id === requestId)
    return req?.environment
  }
  
  const resetForm = () => {
    setSelectedRequest(null)
    setNovedades('')
    setError('')
    setSuccess(false)
  }
  
  const handleSubmit = async () => {
    setError('')
    
    if (!novedades.trim()) {
      setError('Las novedades son obligatorias.')
      return
    }
    
    if (!currentUser || !selectedRequest) return
    
    const request = openRequests.find(r => r.id === selectedRequest)
    if (!request) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Create close request
    addRequest({
      tipo: 'CIERRE',
      estado: 'PENDIENTE',
      funcionarioId: currentUser.id,
      ambienteId: request.ambienteId,
      fechaApertura: new Date().toISOString(),
      novedades: novedades,
    })
    
    // Update environment status
    updateEnvironment(request.ambienteId, { estado: 'PENDIENTE_CIERRE' })
    
    setLoading(false)
    setSuccess(true)
  }
  
  if (!currentUser) return null
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <CardTitle className="text-[#111827] flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-[#16A34A]" />
            Solicitud de Cierre
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {openRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[#6B7280]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">Sin Ambientes Abiertos</h3>
              <p className="text-sm text-[#6B7280]">
                No tiene ambientes abiertos para solicitar cierre.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280] mb-4">
                Seleccione un ambiente para solicitar su cierre:
              </p>
              
              {openRequests.map((request) => (
                <div 
                  key={request.id}
                  className="p-4 border border-[#E5E7EB] rounded-lg hover:border-[#16A34A] hover:bg-[#F0FDF4] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-[#6B7280]">Piso</p>
                        <p className="text-sm font-medium text-[#111827]">{request.environment?.piso}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Ambiente</p>
                        <p className="text-sm font-medium text-[#111827]">{request.environment?.numeroAmbiente}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Fecha Apertura</p>
                        <p className="text-sm font-medium text-[#111827]">
                          {new Date(request.fechaApertura).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Estado Ambiente</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.environment?.estado || 'DISPONIBLE']}`}>
                          {request.environment?.estado?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => { setSelectedRequest(request.id); setShowForm(true) }}
                      className="bg-[#16A34A] hover:bg-[#15803D] text-white"
                    >
                      <DoorClosed className="w-4 h-4 mr-2" />
                      Solicitar Cierre
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Close Request Modal */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827] flex items-center gap-2">
              <DoorClosed className="w-5 h-5 text-[#16A34A]" />
              Solicitud de Cierre
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Complete las novedades para solicitar el cierre del ambiente
            </DialogDescription>
          </DialogHeader>
          
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DoorClosed className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Solicitud Enviada</h3>
                <p className="text-sm text-green-700">
                  Su solicitud de cierre ha sido registrada exitosamente. Un guarda la revisará pronto.
                </p>
              </div>
              <Button 
                onClick={() => { setShowForm(false); resetForm() }} 
                className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedRequest && (
                <>
                  {/* Environment info */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                    <div>
                      <p className="text-xs text-[#6B7280]">Piso</p>
                      <p className="text-sm font-medium text-[#111827]">{getEnvInfo(selectedRequest)?.piso}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Ambiente</p>
                      <p className="text-sm font-medium text-[#111827]">{getEnvInfo(selectedRequest)?.numeroAmbiente}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-[#111827]">
                      Novedades <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={novedades}
                      onChange={(e) => setNovedades(e.target.value)}
                      placeholder="Describa las novedades o estado del ambiente..."
                      className="mt-1 min-h-32 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                    />
                  </div>
                </>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)} 
                  className="flex-1 border-[#E5E7EB]"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Enviar Solicitud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
