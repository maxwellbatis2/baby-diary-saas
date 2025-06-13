'use client'

import { useAuth } from '@/providers/auth-provider'
import { useEffect, useState } from 'react'

export default function TestAuthPage() {
  const { admin, isAuthenticated, isLoading } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        token: localStorage.getItem('admin_token'),
        data: localStorage.getItem('admin_data')
      })
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Autenticação</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Estado do AuthProvider:</h2>
          <pre className="mt-2 text-sm">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              admin: admin ? {
                id: admin.id,
                name: admin.name,
                email: admin.email
              } : null
            }, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">LocalStorage:</h2>
          <pre className="mt-2 text-sm">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">URL Atual:</h2>
          <p className="mt-2 text-sm">
            {typeof window !== 'undefined' ? window.location.href : 'SSR'}
          </p>
        </div>
      </div>
    </div>
  )
} 