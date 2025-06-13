'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { adminApi, type GamificationRule } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Star,
  Target,
  Zap,
  Calendar,
  Award,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export default function GamificationPage() {
  const [rules, setRules] = useState<GamificationRule[]>([])
  const [filteredRules, setFilteredRules] = useState<GamificationRule[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRule, setSelectedRule] = useState<GamificationRule | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0,
    condition: '',
    category: 'daily',
    isActive: true,
  })

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    filterRules()
  }, [rules, searchTerm])

  const loadRules = async () => {
    try {
      const response = await adminApi.getGamificationRules()
      console.log('Resposta da API getGamificationRules:', response)
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setRules(response.data)
        console.log(`Carregadas ${response.data.length} regras de gamificação`)
      } else {
        console.error('Resposta inválida da API:', response)
        setRules([])
      }
    } catch (error) {
      console.error('Erro ao carregar regras de gamificação:', error)
      setRules([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterRules = () => {
    if (!Array.isArray(rules)) {
      setFilteredRules([])
      return
    }
    
    const filtered = rules.filter(rule =>
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.condition?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredRules(filtered)
  }

  const handleCreateRule = async () => {
    try {
      const response = await adminApi.createGamificationRule(formData)
      if (response.success) {
        console.log('Regra criada com sucesso:', response.data)
        loadRules()
        setIsCreateModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao criar regra:', error)
    }
  }

  const handleUpdateRule = async () => {
    if (!selectedRule) return
    
    try {
      const response = await adminApi.updateGamificationRule(selectedRule.id, formData)
      if (response.success) {
        console.log('Regra atualizada com sucesso:', response.data)
        loadRules()
        setIsEditModalOpen(false)
        setSelectedRule(null)
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao atualizar regra:', error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return
    
    try {
      const response = await adminApi.deleteGamificationRule(ruleId)
      if (response.success) {
        console.log('Regra excluída com sucesso')
        loadRules()
      }
    } catch (error) {
      console.error('Erro ao excluir regra:', error)
    }
  }

  const handleEditRule = (rule: GamificationRule) => {
    setSelectedRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description,
      points: rule.points,
      condition: rule.condition,
      category: rule.category || 'daily',
      isActive: rule.isActive,
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      points: 0,
      condition: '',
      category: 'daily',
      isActive: true,
    })
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Garantir que rules seja sempre um array antes de calcular stats
  const safeRules = Array.isArray(rules) ? rules : []
  
  const stats = {
    total: safeRules.length,
    active: safeRules.filter(r => r.isActive).length,
    inactive: safeRules.filter(r => !r.isActive).length,
    totalPoints: safeRules.reduce((sum, r) => sum + r.points, 0),
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return <Calendar className="h-4 w-4" />
      case 'milestone': return <Target className="h-4 w-4" />
      case 'special': return <Star className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'text-blue-600 bg-blue-100'
      case 'milestone': return 'text-green-600 bg-green-100'
      case 'special': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando regras de gamificação...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gamificação</h1>
          <p className="text-muted-foreground">
            Gerencie as regras de gamificação e recompensas
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Inativas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
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
                placeholder="Buscar por nome, descrição ou condição..."
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

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Gamificação</CardTitle>
          <CardDescription>
            {filteredRules.length} regras encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Regra</th>
                  <th className="text-left p-4 font-medium">Categoria</th>
                  <th className="text-left p-4 font-medium">Pontos</th>
                  <th className="text-left p-4 font-medium">Condição</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Criada em</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rule.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(rule.category || 'daily')}`}>
                        {getCategoryIcon(rule.category || 'daily')}
                        <span className="ml-1 capitalize">{rule.category || 'daily'}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-yellow-600 mr-1" />
                        <span className="font-medium">{rule.points}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {rule.condition}
                      </code>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rule.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(rule.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Criar Nova Regra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Login Diário"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da regra..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pontos</label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Condição</label>
                <Input
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Ex: daily_login"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="daily">Diária</option>
                  <option value="milestone">Marco</option>
                  <option value="special">Especial</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label className="text-sm font-medium">Regra Ativa</label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateRule} className="flex-1">
                  Criar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editar Regra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Login Diário"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da regra..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pontos</label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Condição</label>
                <Input
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="Ex: daily_login"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="daily">Diária</option>
                  <option value="milestone">Marco</option>
                  <option value="special">Especial</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label className="text-sm font-medium">Regra Ativa</label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateRule} className="flex-1">
                  Atualizar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedRule(null)
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 