'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, admin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', { 
      isAuthenticated, 
      isLoading, 
      admin: !!admin,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    })
    
    // Só redirecionar se não estiver carregando E não estiver autenticado
    if (!isLoading && !isAuthenticated) {
      console.log('Usuário não autenticado, redirecionando para /login')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, admin])

  console.log('ProtectedRoute render:', { 
    isAuthenticated, 
    isLoading, 
    admin: !!admin,
    shouldRender: !isLoading && isAuthenticated
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando autenticação...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: usuário não autenticado, não renderizando conteúdo')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecionando para login...</div>
      </div>
    )
  }

  console.log('ProtectedRoute: usuário autenticado, renderizando conteúdo')
  return <>{children}</>
} 