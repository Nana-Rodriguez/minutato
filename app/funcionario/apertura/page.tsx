'use client'

import { useState, useMemo } from 'react'
import { DoorOpen, Loader2, Calendar, User, FileText, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { availableFloors, EventType } from '@/lib/data'

const eventTypes: EventType[] = ['Formación', 'Evento', 'Reunión', 'Actividad']

export default function AperturaPage() {
  const { currentUser, environments, requests, addRequest, updateEnvironment } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState<string>('')
  const [selectedEnv, setSelectedEnv] = useState<string>('')
  const [eventType, setEventType] = useState<EventType>('Formación')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Check if user has active request
  const hasActiveRequest = useMemo(() => {
    if (!currentUser) return false
    return requests.some(r => 
      r.funcionarioId === currentUser.id && 
      ['PENDIENTE', 'APROBADA'].includes(r.estado) &&
      r.tipo === 'APERTURA'
    )
  }, [requests, currentUser])
  
  // Get available environments for selected floor
  const availableEnvs = useMemo(() => {
    if (!selectedFloor) return []
    return environments.filter(e => 
      e.piso.toString() === selectedFloor && 
      e.estado === 'DISPONIBLE'
    )
  }, [environments, selectedFloor])
  
  const now = new Date()
  const formattedDate = now.toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const formattedTime = now.toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  const resetForm = () => {
    setSelectedFloor('')
    setSelectedEnv('')
    setEventType('Formación')
    setError('')
    setSuccess(false)
  }
  
  const handleSubmit = async () => {
    setError('')
    
    if (!selectedFloor) {
      setError('Debe seleccionar un piso.')
      return
    }
    
    if (!selectedEnv) {
      setError('Debe seleccionar un ambiente.')
      return
    }
    
    if (!currentUser) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Create request
    addRequest({
      tipo: 'APERTURA',
      estado: 'PENDIENTE',
      funcionarioId: currentUser.id,
      ambienteId: parseInt(selectedEnv),
      tipoEvento: eventType,
      fechaApertura: new Date().toISOString(),
    })
    
    // Update environment status
    updateEnvironment(parseInt(selectedEnv), { estado: 'PENDIENTE_APERTURA' })
    
    setLoading(false)
    setSuccess(true)
  }
  
  if (!currentUser) return null
  
  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md border-0 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => !hasActiveRequest && setShowForm(true)}>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <DoorOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Nueva Solicitud</h3>
            <p className="text-sm text-[#6B7280]">
              {hasActiveRequest 
                ? 'Ya tiene una solicitud activa'
                : 'Solicitar apertura de ambiente'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#16A34A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Fecha Actual</h3>
            <p className="text-sm text-[#6B7280] capitalize">{formattedDate}</p>
            <p className="text-sm font-medium text-[#16A34A]">{formattedTime}</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-[#16A34A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">Ambientes Disponibles</h3>
            <p className="text-3xl font-bold text-[#16A34A]">
              {environments.filter(e => e.estado === 'DISPONIBLE').length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Request Warning */}
      {hasActiveRequest && (
        <Card className="shadow-md border-0 border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-700">
              <strong>Aviso:</strong> Usted ya tiene una solicitud de apertura activa. No puede crear otra hasta que la actual sea procesada o finalizada.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Request Form Modal */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) resetForm() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827] flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-[#16A34A]" />
              Solicitud de Apertura
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Complete los datos para solicitar la apertura de un ambiente
            </DialogDescription>
          </DialogHeader>
          
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DoorOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Solicitud Enviada</h3>
                <p className="text-sm text-green-700">
                  Su solicitud de apertura ha sido registrada exitosamente. Un guarda la revisará pronto.
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
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <div>
                  <p className="text-xs text-[#6B7280]">Fecha</p>
                  <p className="text-sm font-medium text-[#111827] capitalize">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Hora</p>
                  <p className="text-sm font-medium text-[#111827]">{formattedTime}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <div>
                  <p className="text-xs text-[#6B7280]">Nombres</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.nombres}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Apellidos</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.apellidos}</p>
                </div>
              </div>
              
              <div className="p-3 bg-[#F0FDF4] rounded-lg">
                <p className="text-xs text-[#6B7280]">Documento</p>
                <p className="text-sm font-medium text-[#111827]">{currentUser.documento}</p>
              </div>
              
              {/* Editable fields */}
              <div>
                <label className="text-sm font-medium text-[#111827]">Tipo de Evento</label>
                <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-[#111827]">Piso</label>
                <Select value={selectedFloor} onValueChange={(v) => { setSelectedFloor(v); setSelectedEnv('') }}>
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
                <Select value={selectedEnv} onValueChange={setSelectedEnv} disabled={!selectedFloor}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue placeholder={availableEnvs.length === 0 && selectedFloor ? 'No hay ambientes disponibles' : 'Seleccione un ambiente'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEnvs.map(env => (
                      <SelectItem key={env.id} value={env.id.toString()}>
                        {env.numeroAmbiente} - {env.tipoCoordinacion} (Cap. {env.capacidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
