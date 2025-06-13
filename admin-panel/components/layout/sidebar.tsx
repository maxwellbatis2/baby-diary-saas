'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Bell,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Baby,
  Activity,
  Memory,
  Target,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Planos',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Gamificação',
    href: '/admin/gamification',
    icon: Trophy,
  },
  {
    title: 'Notificações',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Landing Page',
    href: '/admin/landing-page',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { admin, logout } = useAuth()

  return (
    <Card className="h-screen w-64 flex-shrink-0 border-r-0 rounded-none">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center space-x-2">
            <Baby className="h-8 w-8 text-primary" />
            <span className={cn(
              "font-bold text-lg transition-all",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              Baby Diary
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {admin && !isCollapsed && (
            <div className="mb-4">
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Sair"}
          </Button>
        </div>
      </div>
    </Card>
  )
} 