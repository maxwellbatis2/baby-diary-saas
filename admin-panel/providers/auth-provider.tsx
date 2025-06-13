'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useRouter } from 'next/navigation'

interface Admin {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

interface AuthContextType {
  admin: Admin | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Usar o hook personalizado para localStorage
  const [storedToken, setStoredToken, removeStoredToken, isTokenLoaded] = useLocalStorage<string | null>('admin_token', null)
  const [storedAdmin, setStoredAdmin, removeStoredAdmin, isAdminLoaded] = useLocalStorage<Admin | null>('admin_data', null)

  useEffect(() => {
    console.log('AuthProvider useEffect:', {
      isTokenLoaded,
      isAdminLoaded,
      storedToken: !!storedToken,
      storedAdmin: !!storedAdmin
    })
    
    // Aguardar o localStorage carregar
    if (isTokenLoaded && isAdminLoaded) {
      if (storedToken && storedAdmin) {
        console.log('Restaurando dados do localStorage:', storedAdmin)
        setAdmin(storedAdmin)
      } else {
        console.log('Nenhum dado de autenticação encontrado no localStorage')
      }
      setIsLoading(false)
    }
  }, [isTokenLoaded, isAdminLoaded, storedToken, storedAdmin])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentando fazer login com:', email)
      const response = await adminApi.login(email, password)
      console.log('Resposta do login:', response)
      
      if (response.success) {
        const { token, user: adminData } = response.data
        console.log('Login bem-sucedido, salvando dados:', adminData)
        
        // Salvar no localStorage
        setStoredToken(token)
        setStoredAdmin(adminData)
        
        // Atualizar estado local
        setAdmin(adminData)
        
        // Redirecionar usando Next.js router (sem reload)
        router.push('/admin')
        
        return true
      }
      console.log('Login falhou:', response)
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  }

  const logout = () => {
    console.log('Fazendo logout')
    removeStoredToken()
    removeStoredAdmin()
    setAdmin(null)
    router.push('/login')
  }

  const value: AuthContextType = {
    admin,
    isLoading,
    login,
    logout,
    isAuthenticated: !!admin,
  }

  console.log('AuthProvider render:', {
    admin: !!admin,
    isLoading,
    isAuthenticated: !!admin
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 