'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAppStore } from '@/lib/store'
import { User, ClipboardList, History } from 'lucide-react'

const guardaNavItems = [
  { label: 'Perfil', href: '/guarda', icon: User },
  { label: 'Solicitudes', href: '/guarda/solicitudes', icon: ClipboardList },
  { label: 'Historial', href: '/guarda/historial', icon: History },
]

export default function GuardaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const currentUser = useAppStore(state => state.currentUser)
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
    } else if (currentUser.rol !== 'Guarda') {
      router.push('/')
    }
  }, [currentUser, router])
  
  if (!currentUser || currentUser.rol !== 'Guarda') {
    return null
  }
  
  return (
    <DashboardLayout items={guardaNavItems} title="Panel Guarda">
      {children}
    </DashboardLayout>
  )
}
