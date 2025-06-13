'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { adminApi, type Plan } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  DollarSign,
  Users,
  Star,
  Zap,
  Shield,
  Download,
  Headphones,
  Eye,
  EyeOff,
  Brain,
  Smartphone,
  Award,
} from 'lucide-react'

interface CreatePlanModalProps {
  onClose: () => void
  onSubmit: (data: Partial<Plan>) => void
}

interface EditPlanModalProps {
  plan: Plan
  onClose: () => void
  onSubmit: (planId: string, data: Partial<Plan>) => void
}

// Componente Modal de Criação de Plano
function CreatePlanModal({ onClose, onSubmit }: CreatePlanModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [yearlyPrice, setYearlyPrice] = useState<number | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [userLimit, setUserLimit] = useState(0)
  const [memoryLimit, setMemoryLimit] = useState<number | null>(null)
  const [photoQuality, setPhotoQuality] = useState('standard')
  const [familySharing, setFamilySharing] = useState(0)
  const [exportFeatures, setExportFeatures] = useState(false)
  const [prioritySupport, setPrioritySupport] = useState(false)
  const [aiFeatures, setAiFeatures] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [stripePriceId, setStripePriceId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      price,
      yearlyPrice: yearlyPrice ?? undefined,
      features,
      userLimit,
      memoryLimit: memoryLimit ?? undefined,
      photoQuality,
      familySharing,
      exportFeatures,
      prioritySupport,
      aiFeatures,
      offlineMode,
      stripePriceId,
      isActive: true, // Novos planos são criados como ativos por padrão
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Criar Novo Plano</CardTitle>
          <CardDescription>Preencha os detalhes para um novo plano de assinatura.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Plano</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço Mensal (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="yearlyPrice">Preço Anual (R$) (Opcional)</Label>
                <Input
                  id="yearlyPrice"
                  type="number"
                  step="0.01"
                  value={yearlyPrice || ''}
                  onChange={(e) => setYearlyPrice(parseFloat(e.target.value) || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="features">Funcionalidades (separadas por vírgula)</Label>
              <Textarea
                id="features"
                value={features.join(',')}
                onChange={(e) => setFeatures(e.target.value.split(',').map(f => f.trim()))}
                placeholder="Ex: 1 bebê, Memórias ilimitadas, Suporte prioritário"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userLimit">Limite de Bebês</Label>
                <Input
                  id="userLimit"
                  type="number"
                  value={userLimit}
                  onChange={(e) => setUserLimit(parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="memoryLimit">Limite de Memórias/Mês (0 para ilimitado)</Label>
                <Input
                  id="memoryLimit"
                  type="number"
                  value={memoryLimit || ''}
                  onChange={(e) => setMemoryLimit(parseInt(e.target.value) || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="photoQuality">Qualidade da Foto</Label>
              <Input
                id="photoQuality"
                value={photoQuality}
                onChange={(e) => setPhotoQuality(e.target.value)}
                placeholder="Ex: standard, high"
              />
            </div>
            <div>
              <Label htmlFor="familySharing">Compartilhamento Familiar (Nº de membros)</Label>
              <Input
                id="familySharing"
                type="number"
                value={familySharing}
                onChange={(e) => setFamilySharing(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="stripePriceId">Stripe Price ID</Label>
              <Input
                id="stripePriceId"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                placeholder="price_xxxxxxxxxxxx"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="aiFeatures"
                checked={aiFeatures}
                onCheckedChange={setAiFeatures}
              />
              <Label htmlFor="aiFeatures">Recursos de IA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="offlineMode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
              <Label htmlFor="offlineMode">Modo Offline</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="prioritySupport"
                checked={prioritySupport}
                onCheckedChange={setPrioritySupport}
              />
              <Label htmlFor="prioritySupport">Suporte Prioritário</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Plano
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente Modal de Edição de Plano
function EditPlanModal({ plan, onClose, onSubmit }: EditPlanModalProps) {
  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(plan.price)
  const [yearlyPrice, setYearlyPrice] = useState<number | null>(plan.yearlyPrice ?? null)
  const [features, setFeatures] = useState(plan.features)
  const [userLimit, setUserLimit] = useState(plan.userLimit)
  const [memoryLimit, setMemoryLimit] = useState<number | null>(plan.memoryLimit ?? null)
  const [photoQuality, setPhotoQuality] = useState(plan.photoQuality ?? '')
  const [familySharing, setFamilySharing] = useState(plan.familySharing ?? 0)
  const [exportFeatures, setExportFeatures] = useState(plan.exportFeatures ?? false)
  const [prioritySupport, setPrioritySupport] = useState(plan.prioritySupport ?? false)
  const [aiFeatures, setAiFeatures] = useState(plan.aiFeatures ?? false)
  const [offlineMode, setOfflineMode] = useState(plan.offlineMode ?? false)
  const [stripePriceId, setStripePriceId] = useState(plan.stripePriceId ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(plan.id, {
      name,
      price,
      yearlyPrice: yearlyPrice ?? undefined,
      features,
      userLimit,
      memoryLimit: memoryLimit ?? undefined,
      photoQuality,
      familySharing,
      exportFeatures,
      prioritySupport,
      aiFeatures,
      offlineMode,
      stripePriceId,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Editar Plano</CardTitle>
          <CardDescription>Ajuste os detalhes do plano "{plan.name}".</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Plano</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Preço Mensal (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-yearlyPrice">Preço Anual (R$) (Opcional)</Label>
                <Input
                  id="edit-yearlyPrice"
                  type="number"
                  step="0.01"
                  value={yearlyPrice || ''}
                  onChange={(e) => setYearlyPrice(parseFloat(e.target.value) || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-features">Funcionalidades (separadas por vírgula)</Label>
              <Textarea
                id="edit-features"
                value={features.join(',')}
                onChange={(e) => setFeatures(e.target.value.split(',').map(f => f.trim()))}
                placeholder="Ex: 1 bebê, Memórias ilimitadas, Suporte prioritário"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-userLimit">Limite de Bebês</Label>
                <Input
                  id="edit-userLimit"
                  type="number"
                  value={userLimit}
                  onChange={(e) => setUserLimit(parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-memoryLimit">Limite de Memórias/Mês (0 para ilimitado)</Label>
                <Input
                  id="edit-memoryLimit"
                  type="number"
                  value={memoryLimit || ''}
                  onChange={(e) => setMemoryLimit(parseInt(e.target.value) || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-photoQuality">Qualidade da Foto</Label>
              <Input
                id="edit-photoQuality"
                value={photoQuality}
                onChange={(e) => setPhotoQuality(e.target.value)}
                placeholder="Ex: standard, high"
              />
            </div>
            <div>
              <Label htmlFor="edit-familySharing">Compartilhamento Familiar (Nº de membros)</Label>
              <Input
                id="edit-familySharing"
                type="number"
                value={familySharing}
                onChange={(e) => setFamilySharing(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="edit-stripePriceId">Stripe Price ID</Label>
              <Input
                id="edit-stripePriceId"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                placeholder="price_xxxxxxxxxxxx"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-aiFeatures"
                checked={aiFeatures}
                onCheckedChange={setAiFeatures}
              />
              <Label htmlFor="edit-aiFeatures">Recursos de IA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-offlineMode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
              <Label htmlFor="edit-offlineMode">Modo Offline</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-prioritySupport"
                checked={prioritySupport}
                onCheckedChange={setPrioritySupport}
              />
              <Label htmlFor="edit-prioritySupport">Suporte Prioritário</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function PricingCardAdmin({
  plan,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
}) {
  const isFree = plan.price === 0;
  const periodDisplay = plan.yearlyPrice !== null && plan.price > 0 ? '/ano' : '/mês';

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'assistente ia': return <Brain className="h-5 w-5 text-purple-500" />;
      case 'exportação de dados': return <Download className="h-5 w-5 text-orange-500" />;
      case 'compartilhamento familiar': return <Users className="h-5 w-5 text-blue-500" />;
      case 'modo offline': return <Smartphone className="h-5 w-5 text-gray-500" />;
      case 'suporte prioritário': return <Headphones className="h-5 w-5 text-red-500" />;
      case 'todos os recursos': return <Award className="h-5 w-5 text-yellow-500" />;
      default: return <Check className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <Card className="relative overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="text-center pb-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              checked={plan.isActive}
              onCheckedChange={(checked) => onToggleStatus(plan.id, checked)}
              id={`status-switch-${plan.id}`}
            />
            <Label htmlFor={`status-switch-${plan.id}`}>
              {plan.isActive ? 'Ativo' : 'Inativo'}
            </Label>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-primary">
            {isFree ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
          </span>
          {!isFree && (
            <span className="text-lg text-muted-foreground">
              {plan.yearlyPrice ? `R$ ${plan.yearlyPrice.toFixed(2).replace('.', ',')} ${periodDisplay}` : periodDisplay}
            </span>
          )}
        </div>
        {/* <CardDescription className="mt-2">{plan.description || ''}</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-4">
        <h3 className="text-lg font-semibold mb-3">Funcionalidades:</h3>
        <ul className="space-y-2 text-md flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              {getFeatureIcon(feature)}
              <span>{feature}</span>
            </li>
          ))}

          {plan.userLimit !== null && (
            <li className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Limite de Bebês: {plan.userLimit === 999 ? 'Ilimitado' : plan.userLimit}</span>
            </li>
          )}
          {plan.memoryLimit !== null && (
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Memórias: {plan.memoryLimit === 99999 ? 'Ilimitadas' : `${plan.memoryLimit} por mês`}</span>
            </li>
          )}
          {plan.photoQuality && (
            <li className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-500" />
              <span>Qualidade da Foto: {plan.photoQuality}</span>
            </li>
          )}
          {(plan.familySharing ?? 0) > 0 && (
            <li className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span>Compartilhamento Familiar: {(plan.familySharing ?? 0) === 999 ? 'Ilimitado' : `${plan.familySharing ?? 0} membros`}</span>
            </li>
          )}
          {plan.exportFeatures && (
            <li className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-500" />
              <span>Exportação de Dados</span>
            </li>
          )}
          {plan.prioritySupport && (
            <li className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-pink-500" />
              <span>Suporte Prioritário</span>
            </li>
          )}
          {plan.aiFeatures && (
            <li className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-500" />
              <span>Recursos de IA</span>
            </li>
          )}
          {plan.offlineMode && (
            <li className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-zinc-500" />
              <span>Modo Offline</span>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          <Edit className="h-4 w-4 mr-2" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(plan.id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    filterPlans()
  }, [plans, searchTerm])

  const loadPlans = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getPlans()
      console.log('Resposta da API getPlans:', response)
      
      if (response.success && Array.isArray(response.data)) {
        setPlans(response.data)
      } else {
        console.error('Resposta inválida da API:', response)
        setPlans([])
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      setPlans([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterPlans = () => {
    if (!Array.isArray(plans)) {
      setFilteredPlans([])
      return
    }
    
    const filtered = plans.filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.features.some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredPlans(filtered)
  }

  const handleCreatePlan = async (planData: Partial<Plan>) => {
    try {
      await adminApi.createPlan(planData as any) // `as any` temporário, ajustar tipagem da API
      loadPlans()
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar plano:', error)
    }
  }

  const handleUpdatePlan = async (planId: string, planData: Partial<Plan>) => {
    try {
      await adminApi.updatePlan(planId, planData)
      loadPlans()
      setIsEditModalOpen(false)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await adminApi.deletePlan(planId)
        loadPlans()
      } catch (error) {
        console.error('Erro ao excluir plano:', error)
      }
    }
  }

  const handleTogglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      await adminApi.updatePlanStatus(planId, isActive)
      loadPlans()
    } catch (error) {
      console.error('Erro ao atualizar status do plano:', error)
    }
  }

  // Garantir que plans seja sempre um array antes de calcular stats
  const safePlans = Array.isArray(plans) ? plans : []
  
  const stats = {
    total: safePlans.length,
    active: safePlans.filter(p => p.isActive).length,
    inactive: safePlans.filter(p => !p.isActive).length,
    paid: safePlans.filter(p => p.price > 0).length,
    free: safePlans.filter(p => p.price === 0).length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando planos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planos</h1>
          <p className="text-muted-foreground">
            Gerencie os planos de assinatura do Baby Diary
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gratuitos</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.free}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {/* <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> Filtrar
        </Button> */}
      </div>

      {/* Plan List (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <PricingCardAdmin
            key={plan.id}
            plan={plan}
            onEdit={setSelectedPlanAndOpenEditModal}
            onDelete={handleDeletePlan}
            onToggleStatus={handleTogglePlanStatus}
          />
        ))}
      </div>

      {isCreateModalOpen && (
        <CreatePlanModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePlan}
        />
      )}

      {isEditModalOpen && selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdatePlan}
        />
      )}
    </div>
  )

  function setSelectedPlanAndOpenEditModal(plan: Plan) {
    setSelectedPlan(plan)
    setIsEditModalOpen(true)
  }
} 