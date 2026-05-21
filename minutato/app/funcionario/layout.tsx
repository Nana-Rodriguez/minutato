'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout, NavIcons } from '@/components/dashboard-layout'
import { useAppStore } from '@/lib/store'
import { User, DoorOpen, DoorClosed, History } from 'lucide-react'

const funcionarioNavItems = [
  { label: 'Perfil', href: '/funcionario', icon: User },
  { label: 'Solicitud de Apertura', href: '/funcionario/apertura', icon: DoorOpen },
  { label: 'Solicitud de Cierre', href: '/funcionario/cierre', icon: DoorClosed },
  { label: 'Historial', href: '/funcionario/historial', icon: History },
]

export default function FuncionarioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const currentUser = useAppStore(state => state.currentUser)
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
    } else if (currentUser.rol !== 'Funcionario') {
      router.push('/')
    }
  }, [currentUser, router])
  
  if (!currentUser || currentUser.rol !== 'Funcionario') {
    return null
  }
  
  return (
    <DashboardLayout items={funcionarioNavItems} title="Panel Funcionario">
      {children}
    </DashboardLayout>
  )
}
