'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, KeyRound, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function LoginPage() {
  const router = useRouter()
  const login = useAppStore(state => state.login)
  const users = useAppStore(state => state.users)
  
  const [documento, setDocumento] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryDoc, setRecoveryDoc] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  
  const validateDocumento = (value: string) => {
    // Only numbers
    const onlyNumbers = value.replace(/\D/g, '')
    return onlyNumbers.slice(0, 10)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validations
    if (!documento.trim()) {
      setError('El documento es obligatorio.')
      return
    }
    
    if (documento.length < 8 || documento.length > 10) {
      setError('El documento debe tener entre 8 y 10 dígitos.')
      return
    }
    
    if (!password.trim()) {
      setError('La contraseña es obligatoria.')
      return
    }
    
    if (password.length < 8 || password.length > 20) {
      setError('La contraseña debe tener entre 8 y 20 caracteres.')
      return
    }
    
    setLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const result = login(documento, password)
    
    if (result.success) {
      const user = users.find(u => u.documento === documento)
      if (user) {
        switch (user.rol) {
          case 'Administrador':
            router.push('/admin')
            break
          case 'Funcionario':
            router.push('/funcionario')
            break
          case 'Guarda':
            router.push('/guarda')
            break
        }
      }
    } else {
      if (result.blocked) {
        setError(`Acceso bloqueado temporalmente. Intente nuevamente en ${result.remainingTime} minutos.`)
      } else {
        setError(result.error || 'Error al iniciar sesión.')
      }
    }
    
    setLoading(false)
  }
  
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecoveryError('')
    setRecoveryMessage('')
    
    const cleanDoc = validateDocumento(recoveryDoc)
    
    if (cleanDoc.length < 8 || cleanDoc.length > 10) {
      setRecoveryError('El documento debe tener entre 8 y 10 dígitos.')
      return
    }
    
    const userExists = users.some(u => u.documento === cleanDoc)
    
    if (userExists) {
      setRecoveryMessage('Se ha enviado un enlace de recuperación a su correo electrónico.')
    } else {
      setRecoveryError('El documento no se encuentra registrado.')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">DigiMinuta</h1>
          <p className="text-[#6B7280] text-sm">Sistema de Gestión de Ambientes</p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <label htmlFor="documento" className="text-sm font-medium text-[#111827]">
                Documento
              </label>
              <Input
                id="documento"
                type="text"
                inputMode="numeric"
                value={documento}
                onChange={(e) => setDocumento(validateDocumento(e.target.value))}
                placeholder="Ingrese su documento"
                className="h-11 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                autoComplete="off"
                data-form-type="other"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#111827]">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="h-11 pr-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  maxLength={20}
                  autoComplete="new-password"
                  data-form-type="other"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#16A34A] hover:text-[#15803D] hover:bg-[#F0FDF4]"
              onClick={() => {
                setShowRecovery(true)
                setRecoveryDoc('')
                setRecoveryMessage('')
                setRecoveryError('')
              }}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Olvidé mi contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Recovery Modal */}
      <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Recuperar Contraseña</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Ingrese su documento para recibir un enlace de recuperación.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecovery} className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              value={recoveryDoc}
              onChange={(e) => setRecoveryDoc(validateDocumento(e.target.value))}
              placeholder="Ingrese su documento"
              className="h-11 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              autoComplete="off"
            />
            
            {recoveryMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{recoveryMessage}</p>
              </div>
            )}
            
            {recoveryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{recoveryError}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-[#E5E7EB]"
                onClick={() => setShowRecovery(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white"
              >
                Enviar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
