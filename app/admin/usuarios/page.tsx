'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Eye, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { statusColors, User, UserRole, ContractType, UserStatus } from '@/lib/data'

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useAppStore()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documento: '',
    correo: '',
    telefono: '',
    rol: 'Funcionario' as UserRole,
    tipoContrato: 'Planta' as ContractType,
    estado: 'ACTIVO' as UserStatus,
  })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = 
        user.nombres.toLowerCase().includes(search.toLowerCase()) ||
        user.apellidos.toLowerCase().includes(search.toLowerCase()) ||
        user.documento.includes(search) ||
        user.correo.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || user.rol === roleFilter
      const matchStatus = statusFilter === 'all' || user.estado === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])
  
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, currentPage])
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  
  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      documento: '',
      correo: '',
      telefono: '',
      rol: 'Funcionario',
      tipoContrato: 'Planta',
      estado: 'ACTIVO',
    })
    setFormError('')
    setSelectedUser(null)
  }
  
  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }
  
  const openEditForm = (user: User) => {
    setSelectedUser(user)
    setFormData({
      nombres: user.nombres,
      apellidos: user.apellidos,
      documento: user.documento,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol,
      tipoContrato: user.tipoContrato,
      estado: user.estado,
    })
    setFormError('')
    setShowForm(true)
  }
  
  const validateForm = () => {
    if (!formData.nombres.trim()) return 'Los nombres son obligatorios.'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres)) return 'Los nombres solo pueden contener letras.'
    if (!formData.apellidos.trim()) return 'Los apellidos son obligatorios.'
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos)) return 'Los apellidos solo pueden contener letras.'
    if (!formData.documento.trim()) return 'El documento es obligatorio.'
    if (!/^\d{8,10}$/.test(formData.documento)) return 'El documento debe tener entre 8 y 10 dígitos.'
    if (!formData.correo.trim()) return 'El correo es obligatorio.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) return 'El correo no es válido.'
    if (!formData.telefono.trim()) return 'El teléfono es obligatorio.'
    if (!/^\d{7,10}$/.test(formData.telefono)) return 'El teléfono debe tener entre 7 y 10 dígitos.'
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
    
    if (selectedUser) {
      updateUser(selectedUser.id, formData)
    } else {
      const result = addUser(formData)
      if (!result.success) {
        setFormError(result.error || 'Error al crear usuario.')
        setLoading(false)
        return
      }
    }
    
    setLoading(false)
    setShowForm(false)
    resetForm()
  }
  
  const handleDelete = async () => {
    if (!selectedUser) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    deleteUser(selectedUser.id)
    setLoading(false)
    setShowDeleteConfirm(false)
    setSelectedUser(null)
  }
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-[#111827]">Gestión de Usuarios</CardTitle>
            <Button 
              onClick={openCreateForm}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Buscar por nombre, documento o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Guarda">Guarda</SelectItem>
                <SelectItem value="Funcionario">Funcionario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-[#E5E7EB]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Nombres</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Apellidos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Documento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden lg:table-cell">Correo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] hidden md:table-cell">Rol</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#E5E7EB] hover:bg-[#F0FDF4] transition-colors">
                    <td className="py-3 px-4 text-sm text-[#111827]">{user.id}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{user.nombres}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{user.apellidos}</td>
                    <td className="py-3 px-4 text-sm text-[#111827]">{user.documento}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden lg:table-cell">{user.correo}</td>
                    <td className="py-3 px-4 text-sm text-[#111827] hidden md:table-cell">{user.rol}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[user.estado]}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => { setSelectedUser(user); setShowDetail(true) }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#16A34A] hover:bg-[#DCFCE7]"
                          onClick={() => openEditForm(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true) }}
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
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
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
              {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#111827]">Nombres</label>
                <Input
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ingrese nombres"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Apellidos</label>
                <Input
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ingrese apellidos"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Documento</label>
                <Input
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ingrese documento"
                  disabled={!!selectedUser}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Correo</label>
                <Input
                  type="email"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ingrese correo"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Teléfono</label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
                  placeholder="Ingrese teléfono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Rol</label>
                <Select value={formData.rol} onValueChange={(v) => setFormData({ ...formData, rol: v as UserRole })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Guarda">Guarda</SelectItem>
                    <SelectItem value="Funcionario">Funcionario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Tipo de Contrato</label>
                <Select value={formData.tipoContrato} onValueChange={(v) => setFormData({ ...formData, tipoContrato: v as ContractType })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planta">Planta</SelectItem>
                    <SelectItem value="Contratista">Contratista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#111827]">Estado</label>
                <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as UserStatus })}>
                  <SelectTrigger className="mt-1 border-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
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
                {selectedUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Detalle de Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
                    {selectedUser.nombres[0]}{selectedUser.apellidos[0]}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Nombres</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.nombres}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Apellidos</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.apellidos}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Documento</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.documento}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Correo</p>
                  <p className="text-sm font-medium text-[#111827] truncate">{selectedUser.correo}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Teléfono</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.telefono}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Rol</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.rol}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Contrato</p>
                  <p className="text-sm font-medium text-[#111827]">{selectedUser.tipoContrato}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-lg">
                  <p className="text-xs text-[#6B7280]">Estado</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selectedUser.estado]}`}>
                    {selectedUser.estado}
                  </span>
                </div>
              </div>
              <Button onClick={() => setShowDetail(false)} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              ¿Está seguro de que desea eliminar al usuario {selectedUser?.nombres} {selectedUser?.apellidos}? Esta acción no se puede deshacer.
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
