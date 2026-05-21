'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout, NavIcons } from '@/components/dashboard-layout'
import { useAppStore } from '@/lib/store'

const adminNavItems = [
  { label: 'Perfil', href: '/admin', icon: NavIcons.User },
  { label: 'Usuarios', href: '/admin/usuarios', icon: NavIcons.User },
  { label: 'Ambientes', href: '/admin/ambientes', icon: NavIcons.Building2 },
  { label: 'Recursos', href: '/admin/recursos', icon: NavIcons.Box },
  { label: 'Reportes', href: '/admin/reportes', icon: NavIcons.BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const currentUser = useAppStore(state => state.currentUser)
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
    } else if (currentUser.rol !== 'Administrador') {
      router.push('/')
    }
  }, [currentUser, router])
  
  if (!currentUser || currentUser.rol !== 'Administrador') {
    return null
  }
  
  return (
    <DashboardLayout items={adminNavItems} title="Panel Administrador">
      {children}
    </DashboardLayout>
  )
}
