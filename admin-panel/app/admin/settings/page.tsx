'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Database, 
  CreditCard, 
  Cloud, 
  Brain,
  Shield,
  HardDrive,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  Download,
  Trash2,
  TestTube,
  Server,
  Globe,
  Lock,
  Bell,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  app: {
    name: string
    version: string
    environment: string
    port: number
  }
  database: {
    provider: string
    status: string
  }
  integrations: {
    stripe: {
      enabled: boolean
      mode: string
    }
    cloudinary: {
      enabled: boolean
    }
    groq: {
      enabled: boolean
    }
  }
  statistics: {
    totalUsers: number
    totalPlans: number
    totalAdmins: number
  }
}

interface IntegrationTest {
  stripe: { status: string; message: string }
  cloudinary: { status: string; message: string }
  groq: { status: string; message: string }
  database: { status: string; message: string }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingIntegrations, setTestingIntegrations] = useState(false)
  const [integrationResults, setIntegrationResults] = useState<IntegrationTest | null>(null)
  const [backupLoading, setBackupLoading] = useState(false)
  const [cacheLoading, setCacheLoading] = useState(false)

  const loadSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const response = await fetch('http://localhost:3000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: Partial<SystemSettings>) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const response = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: newSettings })
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso')
        await loadSettings()
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const testIntegrations = async () => {
    setTestingIntegrations(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const response = await fetch('http://localhost:3000/api/admin/settings/test-integrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIntegrationResults(data.data)
        toast.success('Testes de integração concluídos')
      } else {
        toast.error('Erro ao testar integrações')
      }
    } catch (error) {
      console.error('Erro ao testar integrações:', error)
      toast.error('Erro ao testar integrações')
    } finally {
      setTestingIntegrations(false)
    }
  }

  const performBackup = async () => {
    setBackupLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const response = await fetch('http://localhost:3000/api/admin/settings/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Backup realizado com sucesso')
        console.log('Backup info:', data.data)
      } else {
        toast.error('Erro ao realizar backup')
      }
    } catch (error) {
      console.error('Erro ao realizar backup:', error)
      toast.error('Erro ao realizar backup')
    } finally {
      setBackupLoading(false)
    }
  }

  const clearCache = async () => {
    setCacheLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return

      const response = await fetch('http://localhost:3000/api/admin/settings/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Cache limpo com sucesso')
      } else {
        toast.error('Erro ao limpar cache')
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
      toast.error('Erro ao limpar cache')
    } finally {
      setCacheLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      default:
        return 'text-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema e integrações
          </p>
        </div>
        <Button onClick={loadSettings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        {/* Sistema Tab */}
        <TabsContent value="system" className="space-y-6">
          {settings && (
            <>
              {/* Informações do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Informações do Sistema
                  </CardTitle>
                  <CardDescription>
                    Detalhes sobre a aplicação e ambiente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nome da Aplicação</Label>
                      <p className="text-sm text-muted-foreground">{settings.app.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Versão</Label>
                      <p className="text-sm text-muted-foreground">{settings.app.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Ambiente</Label>
                      <Badge variant={settings.app.environment === 'production' ? 'default' : 'secondary'}>
                        {settings.app.environment}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Porta</Label>
                      <p className="text-sm text-muted-foreground">{settings.app.port}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banco de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Banco de Dados
                  </CardTitle>
                  <CardDescription>
                    Status da conexão com o banco de dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Provedor</Label>
                      <p className="text-sm text-muted-foreground">{settings.database.provider}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {settings.database.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Estatísticas do Sistema
                  </CardTitle>
                  <CardDescription>
                    Métricas gerais da aplicação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{settings.statistics.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Usuários</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{settings.statistics.totalPlans}</div>
                      <div className="text-sm text-muted-foreground">Planos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{settings.statistics.totalAdmins}</div>
                      <div className="text-sm text-muted-foreground">Administradores</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Integrações Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {settings && (
            <>
              {/* Stripe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe (Pagamentos)
                  </CardTitle>
                  <CardDescription>
                    Configurações de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={settings.integrations.stripe.enabled ? 'default' : 'secondary'}>
                        {settings.integrations.stripe.enabled ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Modo</Label>
                      <Badge variant="outline">{settings.integrations.stripe.mode}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cloudinary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Cloudinary (Upload)
                  </CardTitle>
                  <CardDescription>
                    Configurações de upload de imagens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={settings.integrations.cloudinary.enabled ? 'default' : 'secondary'}>
                      {settings.integrations.cloudinary.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Groq AI */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Groq (Inteligência Artificial)
                  </CardTitle>
                  <CardDescription>
                    Configurações de IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={settings.integrations.groq.enabled ? 'default' : 'secondary'}>
                      {settings.integrations.groq.enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Testar Integrações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Testar Integrações
                  </CardTitle>
                  <CardDescription>
                    Verificar se todas as integrações estão funcionando
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={testIntegrations} 
                    disabled={testingIntegrations}
                    className="w-full"
                  >
                    {testingIntegrations ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar Todas as Integrações
                      </>
                    )}
                  </Button>

                  {integrationResults && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Resultados dos Testes:</h4>
                      {Object.entries(integrationResults).map(([key, result]) => (
                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="capitalize">{key}</span>
                          </div>
                          <span className={`text-sm ${getStatusColor(result.status)}`}>
                            {result.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Segurança Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir 2FA para administradores
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Logs de Auditoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas as ações administrativas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limitar tentativas de login
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">HTTPS Obrigatório</Label>
                    <p className="text-sm text-muted-foreground">
                      Redirecionar HTTP para HTTPS
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações de Segurança
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
              <CardDescription>
                Configurar notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações por email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações push
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Alertas de Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar sobre problemas do sistema
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Relatórios Automáticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar relatórios semanais
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações de Notificações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          {/* Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Backup do Sistema
              </CardTitle>
              <CardDescription>
                Criar backup do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crie um backup completo do banco de dados para garantir a segurança dos dados.
              </p>
              <Button 
                onClick={performBackup} 
                disabled={backupLoading}
                className="w-full"
              >
                {backupLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Criando Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Criar Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Cache */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Gerenciamento de Cache
              </CardTitle>
              <CardDescription>
                Limpar cache do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Limpe o cache do sistema para liberar memória e melhorar a performance.
              </p>
              <Button 
                onClick={clearCache} 
                disabled={cacheLoading}
                variant="outline"
                className="w-full"
              >
                {cacheLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Limpando Cache...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Cache
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Modo Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Modo Manutenção
              </CardTitle>
              <CardDescription>
                Ativar modo de manutenção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Modo Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Bloquear acesso de usuários durante manutenção
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Mensagem de Manutenção</Label>
                <Textarea 
                  placeholder="Sistema em manutenção. Volte em breve!"
                  className="min-h-[100px]"
                />
              </div>

              <Button className="w-full" variant="destructive">
                Ativar Modo Manutenção
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 