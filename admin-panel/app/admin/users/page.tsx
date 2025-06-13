'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi, type User } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  CreditCard,
  Trophy,
  Key,
  Plus,
} from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      // Carregar todos os usuários sem paginação
      const response = await adminApi.getUsers({ limit: 1000 })
      console.log('Resposta da API getUsers:', response)
      
      if (response.success && response.data && response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users)
        console.log(`Carregados ${response.data.users.length} usuários de ${response.data.pagination?.total || 'N/A'} total`)
      } else {
        console.error('Resposta inválida da API:', response)
        setUsers([])
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([])
      return
    }
    
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, isActive)
      loadUsers() // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleResetGamification = async (userId: string) => {
    try {
      await adminApi.resetUserGamification(userId)
      loadUsers() // Recarregar lista
    } catch (error) {
      console.error('Erro ao resetar gamificação:', error)
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      const newPassword = Math.random().toString(36).slice(-8) // Senha aleatória
      await adminApi.resetUserPassword(userId, newPassword)
      alert(`Nova senha: ${newPassword}`)
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
    }
  }

  // Garantir que users seja sempre um array antes de calcular stats
  const safeUsers = Array.isArray(users) ? users : []
  
  const stats = {
    total: safeUsers.length,
    active: safeUsers.filter(u => u.isActive).length,
    inactive: safeUsers.filter(u => !u.isActive).length,
    withPlan: safeUsers.filter(u => u.planId).length,
  }

  // Debug info
  console.log('UsersPage - Stats:', stats)
  console.log('UsersPage - Total users loaded:', safeUsers.length)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando usuários...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários do Baby Diary
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Plano</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withPlan}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuários encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Usuário</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Plano</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Cadastro</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.babies?.length || 0} bebês
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      {user.plan ? (
                        <div>
                          <div className="font-medium">{user.plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(user.plan.price)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sem plano</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserStatus(user.id, !user.isActive)}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetGamification(user.id)}
                        >
                          <Trophy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 