'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'

export default function DebugPage() {
  const { admin, isAuthenticated, isLoading, login, logout } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        token: localStorage.getItem('admin_token'),
        data: localStorage.getItem('admin_data')
      })
    }
  }, [])

  const handleTestLogin = async () => {
    console.log('Testando login...')
    const success = await login('admin@babydiary.com', 'admin123')
    console.log('Resultado do login:', success)
  }

  const handleLogout = () => {
    console.log('Fazendo logout...')
    logout()
  }

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_data')
      setLocalStorageData({
        token: null,
        data: null
      })
      console.log('LocalStorage limpo')
    }
  }

  const handleTestAuth = async () => {
    try {
      console.log('Testando autenticação...')
      const result = await adminApi.testAuth()
      setTestResult({ success: true, data: result })
      console.log('Teste de autenticação bem-sucedido:', result)
    } catch (error) {
      setTestResult({ success: false, error })
      console.error('Erro no teste de autenticação:', error)
    }
  }

  const handleTestDashboard = async () => {
    try {
      console.log('Testando dashboard...')
      const result = await adminApi.getDashboard()
      setTestResult({ success: true, data: result })
      console.log('Teste do dashboard bem-sucedido:', result)
    } catch (error) {
      setTestResult({ success: false, error })
      console.error('Erro no teste do dashboard:', error)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug de Autenticação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado da Autenticação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Loading: {isLoading ? 'true' : 'false'}</div>
              <div>Autenticado: {isAuthenticated ? 'true' : 'false'}</div>
              <div>Admin: {admin ? `${admin.name} (${admin.email})` : 'null'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Token: {localStorageData?.token ? 'present' : 'missing'}</div>
              <div>Data: {localStorageData?.data ? 'present' : 'missing'}</div>
              {localStorageData?.token && (
                <div className="text-xs break-all">
                  Token: {localStorageData.token.substring(0, 50)}...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <Button onClick={handleTestLogin}>
              Testar Login
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button onClick={handleClearStorage} variant="destructive">
              Limpar Storage
            </Button>
            <Button onClick={handleTestAuth} variant="secondary">
              Testar Auth
            </Button>
            <Button onClick={handleTestDashboard} variant="secondary">
              Testar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="font-semibold">
                {testResult.success ? '✅ Sucesso' : '❌ Erro'}
              </div>
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              auth: {
                isLoading,
                isAuthenticated,
                admin
              },
              localStorage: localStorageData
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 