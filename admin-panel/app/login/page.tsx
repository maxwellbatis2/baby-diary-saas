'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/providers/auth-provider'
import { Baby, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    console.log('LoginPage useEffect:', { isAuthenticated, authLoading })
    if (!authLoading && isAuthenticated) {
      console.log('Usuário já autenticado, redirecionando para /admin')
      router.push('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    console.log('Tentando fazer login...')

    try {
      const success = await login(email, password)
      console.log('Resultado do login:', success)
      
      if (success) {
        // Verificar se o token foi salvo
        const token = localStorage.getItem('admin_token')
        const adminData = localStorage.getItem('admin_data')
        console.log('Token salvo no localStorage:', !!token)
        console.log('Admin data salvo no localStorage:', !!adminData)
        
        toast.success('Login realizado com sucesso!')
        console.log('Redirecionando para /admin após login bem-sucedido')
        
        // Usar router.push em vez de window.location.href para evitar reload
        router.push('/admin')
        return
      } else {
        toast.error('Email ou senha incorretos')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando autenticação...</div>
      </div>
    )
  }

  // Não mostrar a página de login se já estiver autenticado
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecionando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Baby className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Baby Diary</CardTitle>
          <CardDescription>
            Painel Administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@babydiary.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Credenciais padrão:
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              admin@babydiary.com / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 