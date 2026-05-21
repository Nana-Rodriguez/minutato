'use client'

import { useState } from 'react'
import { User, Mail, Phone, FileText, Briefcase, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { statusColors } from '@/lib/data'

export default function AdminProfilePage() {
  const currentUser = useAppStore(state => state.currentUser)
  const [showModal, setShowModal] = useState(false)
  
  if (!currentUser) return null
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <CardTitle className="text-[#111827] flex items-center gap-2">
            <User className="w-5 h-5 text-[#16A34A]" />
            Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <User className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Nombres</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.nombres}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <User className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Apellidos</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.apellidos}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <FileText className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Documento</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.documento}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Mail className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Correo</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.correo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Phone className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Teléfono</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.telefono}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Shield className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Rol</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.rol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <Briefcase className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Tipo de Contrato</p>
                  <p className="text-sm font-medium text-[#111827]">{currentUser.tipoContrato}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] rounded-lg">
                <div className="w-5 h-5 rounded-full bg-[#16A34A]" />
                <div>
                  <p className="text-xs text-[#6B7280]">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[currentUser.estado]}`}>
                    {currentUser.estado}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
