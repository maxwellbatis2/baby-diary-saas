'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  Users, 
  Baby, 
  Activity, 
  BookOpen, 
  Target, 
  CreditCard, 
  DollarSign,
  BarChart3,
  Calendar,
  RefreshCw,
  Eye,
  Download,
  Filter
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface AnalyticsData {
  overview?: any
  engagement?: any
  subscriptions?: any
  activities?: any
}

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function MetricCard({ title, value, description, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ChartCardProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [overview, engagement, subscriptions, activities] = await Promise.all([
        fetch(`http://localhost:3000/api/admin/analytics/overview?period=${period}`, { headers }),
        fetch(`http://localhost:3000/api/admin/analytics/engagement?period=${period}`, { headers }),
        fetch(`http://localhost:3000/api/admin/analytics/subscriptions?period=${period}`, { headers }),
        fetch(`http://localhost:3000/api/admin/analytics/activities?period=${period}`, { headers })
      ])

      const analyticsData: AnalyticsData = {}

      if (overview.ok) {
        const overviewData = await overview.json()
        analyticsData.overview = overviewData.data
      }

      if (engagement.ok) {
        const engagementData = await engagement.json()
        analyticsData.engagement = engagementData.data
      }

      if (subscriptions.ok) {
        const subscriptionsData = await subscriptions.json()
        analyticsData.subscriptions = subscriptionsData.data
      }

      if (activities.ok) {
        const activitiesData = await activities.json()
        analyticsData.activities = activitiesData.data
      }

      setData(analyticsData)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [period])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  // Preparar dados para gráficos
  const prepareActivitiesChartData = () => {
    if (!data.activities?.activitiesByType) return []
    return data.activities.activitiesByType.map((activity: any) => ({
      name: activity.type,
      value: activity._count.type
    }))
  }

  const prepareSubscriptionsChartData = () => {
    if (!data.subscriptions?.planDetails) return []
    return data.subscriptions.planDetails.map((plan: any) => ({
      name: plan.planName,
      value: plan.count,
      revenue: plan.revenue
    }))
  }

  const prepareDailyActivitiesData = () => {
    if (!data.activities?.dailyActivities) return []
    return data.activities.dailyActivities.map((day: any) => ({
      date: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      activities: day.count
    }))
  }

  const prepareBadgesChartData = () => {
    if (!data.engagement?.topBadges) return []
    return data.engagement.topBadges.map((badge: any) => ({
      name: badge.name,
      value: badge.count
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas e insights do seu Baby Diary
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {data.overview && (
            <>
              {/* Métricas Principais */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total de Usuários"
                  value={formatNumber(data.overview.users?.total || 0)}
                  description={`${data.overview.users?.new || 0} novos no período`}
                  icon={Users}
                  trend={{
                    value: parseFloat(data.overview.users?.growthRate || '0'),
                    isPositive: parseFloat(data.overview.users?.growthRate || '0') > 0
                  }}
                />
                <MetricCard
                  title="Total de Bebês"
                  value={formatNumber(data.overview.babies?.total || 0)}
                  description={`${data.overview.babies?.new || 0} novos no período`}
                  icon={Baby}
                />
                <MetricCard
                  title="Atividades"
                  value={formatNumber(data.overview.activities?.total || 0)}
                  description={`${data.overview.activities?.new || 0} novas no período`}
                  icon={Activity}
                  trend={{
                    value: parseFloat(data.overview.activities?.growthRate || '0'),
                    isPositive: parseFloat(data.overview.activities?.growthRate || '0') > 0
                  }}
                />
                <MetricCard
                  title="Receita Total"
                  value={formatCurrency(data.overview.revenue?.total || 0)}
                  description="Receita mensal"
                  icon={DollarSign}
                />
              </div>

              {/* Gráfico de Crescimento */}
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                  title="Crescimento de Usuários"
                  description="Evolução do número de usuários ao longo do tempo"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { name: 'Usuários', value: data.overview.users?.total || 0 },
                      { name: 'Bebês', value: data.overview.babies?.total || 0 },
                      { name: 'Atividades', value: data.overview.activities?.total || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Distribuição de Conteúdo"
                  description="Proporção de diferentes tipos de conteúdo"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Memórias', value: data.overview.memories?.total || 0 },
                          { name: 'Marcos', value: data.overview.milestones?.total || 0 },
                          { name: 'Atividades', value: data.overview.activities?.total || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Métricas Secundárias */}
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  title="Memórias"
                  value={formatNumber(data.overview.memories?.total || 0)}
                  description={`${data.overview.memories?.new || 0} novas no período`}
                  icon={BookOpen}
                />
                <MetricCard
                  title="Marcos"
                  value={formatNumber(data.overview.milestones?.total || 0)}
                  description={`${data.overview.milestones?.new || 0} novos no período`}
                  icon={Target}
                />
                <MetricCard
                  title="Assinaturas Ativas"
                  value={formatNumber(data.overview.subscriptions?.active || 0)}
                  description={`${data.overview.subscriptions?.canceled || 0} canceladas`}
                  icon={CreditCard}
                />
              </div>

              {/* Taxa de Churn */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Churn</CardTitle>
                  <CardDescription>
                    Percentual de usuários que cancelaram no período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">
                    {data.overview.subscriptions?.churnRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {data.overview.subscriptions?.canceled || 0} cancelamentos em {data.overview.period}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {data.engagement && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  title="Usuários Ativos"
                  value={formatNumber(data.engagement.activeUsers || 0)}
                  description="Usuários ativos no período"
                  icon={Users}
                />
                <MetricCard
                  title="Usuários com Atividades"
                  value={formatNumber(data.engagement.usersWithActivities || 0)}
                  description="Usuários que registraram atividades"
                  icon={Activity}
                />
                <MetricCard
                  title="Taxa de Engajamento"
                  value={formatPercentage(parseFloat(data.engagement.engagementRate || '0'))}
                  description="Percentual de usuários engajados"
                  icon={TrendingUp}
                />
              </div>

              {/* Gráficos de Engajamento */}
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                  title="Atividades por Tipo"
                  description="Distribuição de atividades registradas"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.engagement.activitiesByType?.map((activity: any) => ({
                      name: activity.type,
                      value: activity._count.type
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Badges Mais Conquistados"
                  description="Badges mais populares entre os usuários"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareBadgesChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Lista de Badges */}
              <ChartCard
                title="Detalhes dos Badges"
                description="Lista completa dos badges mais conquistados"
              >
                <div className="space-y-3">
                  {data.engagement.topBadges?.map((badge: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="font-medium">{badge.name}</span>
                      </div>
                      <Badge variant="secondary">{badge.count} usuários</Badge>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </>
          )}
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {data.subscriptions && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Assinaturas Ativas"
                  value={formatNumber(data.subscriptions.activeSubscriptions || 0)}
                  description="Total de assinaturas ativas"
                  icon={CreditCard}
                />
                <MetricCard
                  title="Novas Assinaturas"
                  value={formatNumber(data.subscriptions.newSubscriptions || 0)}
                  description="Assinaturas criadas no período"
                  icon={TrendingUp}
                />
                <MetricCard
                  title="Cancelamentos"
                  value={formatNumber(data.subscriptions.canceledSubscriptions || 0)}
                  description="Assinaturas canceladas no período"
                  icon={CreditCard}
                />
                <MetricCard
                  title="Receita Total"
                  value={formatCurrency(data.subscriptions.totalRevenue || 0)}
                  description="Receita gerada pelas assinaturas"
                  icon={DollarSign}
                />
              </div>

              {/* Taxa de Churn e Crescimento */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Churn</CardTitle>
                    <CardDescription>Percentual de cancelamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">
                      {data.subscriptions.churnRate}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Crescimento</CardTitle>
                    <CardDescription>Crescimento líquido de assinaturas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">
                      {data.subscriptions.growthRate}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos de Assinaturas */}
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                  title="Assinaturas por Plano"
                  description="Distribuição de assinaturas ativas por plano"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareSubscriptionsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      <Bar dataKey="value" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Receita por Plano"
                  description="Receita gerada por cada plano"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareSubscriptionsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Lista Detalhada de Planos */}
              <ChartCard
                title="Detalhes dos Planos"
                description="Informações detalhadas sobre cada plano"
              >
                <div className="space-y-4">
                  {data.subscriptions.planDetails?.map((plan: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{plan.planName}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(plan.planPrice)}/mês por assinatura
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-lg">{plan.count} assinaturas</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(plan.revenue)} total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </>
          )}
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          {data.activities && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  title="Total de Atividades"
                  value={formatNumber(data.activities.totalActivities || 0)}
                  description="Atividades registradas no período"
                  icon={Activity}
                />
                <MetricCard
                  title="Usuários Únicos"
                  value={formatNumber(data.activities.uniqueUsersCount || 0)}
                  description="Usuários que registraram atividades"
                  icon={Users}
                />
                <MetricCard
                  title="Média por Usuário"
                  value={data.activities.avgActivitiesPerUser || 0}
                  description="Atividades por usuário"
                  icon={BarChart3}
                />
              </div>

              {/* Gráficos de Atividades */}
              <div className="grid gap-6 md:grid-cols-2">
                <ChartCard
                  title="Atividades por Tipo"
                  description="Distribuição de atividades por categoria"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareActivitiesChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                  title="Atividades Diárias (Últimos 7 dias)"
                  description="Volume de atividades por dia"
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prepareDailyActivitiesData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                      <Line type="monotone" dataKey="activities" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Usuários Mais Ativos */}
              <ChartCard
                title="Usuários Mais Ativos"
                description="Top 10 usuários com mais atividades"
              >
                <div className="space-y-3">
                  {data.activities.mostActiveUsers?.slice(0, 10).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-muted-foreground">{user.userEmail}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">{user.activityCount} atividades</Badge>
                    </div>
                  ))}
                </div>
              </ChartCard>

              {/* Lista de Atividades por Tipo */}
              <ChartCard
                title="Detalhes das Atividades por Tipo"
                description="Lista completa de atividades por categoria"
              >
                <div className="space-y-3">
                  {data.activities.activitiesByType?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                      <span className="font-medium">{activity._count.type} atividades</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 