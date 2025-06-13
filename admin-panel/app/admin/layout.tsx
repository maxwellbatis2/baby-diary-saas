import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('AdminLayout render')
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 