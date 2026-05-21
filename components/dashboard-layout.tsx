'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, Building2, Box, BarChart3, LogOut, Menu, X, 
  ChevronLeft, FileText, DoorOpen, ClipboardList, History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface SidebarItem {
  label: string
  href: string
  icon: React.ElementType
}

interface DashboardLayoutProps {
  children: React.ReactNode
  items: SidebarItem[]
  title: string
}

export function DashboardLayout({ children, items, title }: DashboardLayoutProps) {
  const pathname = usePathname()
  const currentUser = useAppStore(state => state.currentUser)
  const logout = useAppStore(state => state.logout)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#111827]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#111827]">DigiMinuta</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-[#DCFCE7] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#16A34A]" />
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-gradient-to-b from-[#16A34A] to-[#15803D] transition-all duration-300 z-50",
          sidebarOpen ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-white text-lg">DigiMinuta</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-white hover:bg-white/20"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>
        </div>
        
        {/* User Info */}
        {currentUser && sidebarOpen && (
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-medium text-sm truncate">
                  {currentUser.nombres.split(' ')[0]} {currentUser.apellidos.split(' ')[0]}
                </p>
                <p className="text-white/70 text-xs truncate">{currentUser.rol}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive 
                    ? "bg-white text-[#16A34A] font-medium shadow-md" 
                    : "text-white hover:bg-white/20"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        
        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-white hover:bg-white/20 transition-all"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-[#E5E7EB] items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-[#111827]">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">
              {currentUser?.nombres} {currentUser?.apellidos}
            </span>
            <div className="w-10 h-10 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#16A34A]" />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

// Export icons for use in navigation items
export const NavIcons = {
  User,
  Building2,
  Box,
  BarChart3,
  LogOut,
  DoorOpen,
  ClipboardList,
  History
}
