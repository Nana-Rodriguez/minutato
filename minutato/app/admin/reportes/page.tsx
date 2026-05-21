'use client'

import { useState, useMemo } from 'react'
import { BarChart3, Users, Building2, Box, ClipboardList, Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { availableFloors } from '@/lib/data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const COLORS = ['#16A34A', '#15803D', '#22C55E', '#4ADE80', '#86EFAC', '#DCFCE7']

export default function ReportsPage() {
  const { users, environments, resources, requests } = useAppStore()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Statistics
  const totalUsers = users.length
  const totalEnvironments = environments.length
  const totalResources = resources.length
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const requestsThisMonth = requests.filter(r => {
    const date = new Date(r.fechaApertura)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length
  
  // Users by role
  const usersByRole = useMemo(() => {
    const roles = ['Administrador', 'Guarda', 'Funcionario']
    return roles.map(role => ({
      name: role,
      value: users.filter(u => u.rol === role).length
    }))
  }, [users])
  
  // Environments by status
  const envsByStatus = useMemo(() => {
    const statuses = ['DISPONIBLE', 'ABIERTO', 'EN_MANTENIMIENTO', 'PENDIENTE_APERTURA', 'PENDIENTE_CIERRE']
    return statuses.map(status => ({
      name: status.replace('_', ' '),
      value: environments.filter(e => e.estado === status).length
    })).filter(s => s.value > 0)
  }, [environments])
  
  // Resources by status
  const resourcesByStatus = useMemo(() => {
    const statuses = ['DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'DADO_DE_BAJA']
    return statuses.map(status => ({
      name: status.replace('_', ' '),
      value: resources.filter(r => r.estado === status).length
    })).filter(s => s.value > 0)
  }, [resources])
  
  // Resources by environment
  const resourcesByEnv = useMemo(() => {
    const envs = environments.filter(e => {
      const envResources = resources.filter(r => r.ambienteId === e.id)
      return envResources.length > 0
    })
    return envs.map(env => ({
      name: `Piso ${env.piso} - ${env.numeroAmbiente}`,
      recursos: resources.filter(r => r.ambienteId === env.id).length
    })).slice(0, 10)
  }, [environments, resources])
  
  const handleExportPDF = () => {
    alert('Funcionalidad de exportar PDF en desarrollo')
  }
  
  const handleExportExcel = () => {
    alert('Funcionalidad de exportar Excel en desarrollo')
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border-0 bg-gradient-to-br from-[#16A34A] to-[#15803D]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Usuarios</p>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-[#22C55E] to-[#16A34A]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Ambientes</p>
                <p className="text-3xl font-bold text-white">{totalEnvironments}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-[#4ADE80] to-[#22C55E]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Recursos</p>
                <p className="text-3xl font-bold text-white">{totalResources}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Box className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-[#86EFAC] to-[#4ADE80]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#15803D]/80 text-sm">Solicitudes del Mes</p>
                <p className="text-3xl font-bold text-[#15803D]">{requestsThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-[#15803D]/20 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-[#15803D]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="shadow-md border-0">
        <CardHeader className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-[#111827] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16A34A]" />
              Filtros de Reportes
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                className="border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-[#111827]">Fecha Desde</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">Fecha Hasta</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 border-[#E5E7EB] focus:border-[#16A34A] focus:ring-[#16A34A]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">Piso</label>
              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="mt-1 border-[#E5E7EB]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pisos</SelectItem>
                  {availableFloors.map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>Piso {floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827]">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1 border-[#E5E7EB]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                  <SelectItem value="ASIGNADO">Asignado</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card className="shadow-md border-0">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-[#111827] text-lg">Usuarios por Rol</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Environments by Status */}
        <Card className="shadow-md border-0">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-[#111827] text-lg">Ambientes por Estado</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={envsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {envsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Resources by Status */}
        <Card className="shadow-md border-0">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-[#111827] text-lg">Recursos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourcesByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Resources by Environment */}
        <Card className="shadow-md border-0">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-[#111827] text-lg">Recursos por Ambiente</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourcesByEnv} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 10 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="recursos" fill="#15803D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
