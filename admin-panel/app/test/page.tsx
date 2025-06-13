'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'

export default function TestPage() {
  const { admin, isAuthenticated, isLoading } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    // Verificar localStorage
    const token = localStorage.getItem('admin_token')
    const adminData = localStorage.getItem('admin_data')
    
    setLocalStorageData({
      token: token ? token.substring(0, 20) + '...' : null,
      adminData: adminData ? JSON.parse(adminData) : null,
      hasToken: !!token,
      hasAdminData: !!adminData
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Página de Teste - Autenticação</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Estado do AuthProvider:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
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

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">LocalStorage:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Ações:</h2>
          <div className="space-y-2">
            <button 
              onClick={() => {
                const token = localStorage.getItem('admin_token')
                const adminData = localStorage.getItem('admin_data')
                console.log('Token:', token)
                console.log('Admin Data:', adminData)
                alert(`Token: ${!!token}\nAdmin Data: ${!!adminData}`)
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Verificar localStorage no console
            </button>
            
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            >
              Limpar localStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 