'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Send, Users, Bell, FileText, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  failedNotifications: number;
  successRate: number;
  activeTokens: number;
  templatesCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function NotificationsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  // Estados para envio de notificação
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    clickAction: '',
    scheduledAt: '',
    useTemplate: false,
    templateId: ''
  });

  // Estados para template
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'push' as 'push' | 'email' | 'sms',
    subject: '',
    body: '',
    variables: [] as string[],
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, templatesRes, usersRes] = await Promise.all([
        api.get('/api/admin/notifications/stats'),
        api.get('/api/admin/notifications/templates'),
        api.get('/api/admin/users')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (templatesRes.data.success) setTemplates(templatesRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data.users);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      if (selectedUsers.length === 0) {
        toast.error('Selecione pelo menos um usuário');
        return;
      }

      if (!notificationData.title || !notificationData.body) {
        toast.error('Preencha título e corpo da notificação');
        return;
      }

      const payload = {
        userIds: selectedUsers,
        title: notificationData.title,
        body: notificationData.body,
        data: {
          clickAction: notificationData.clickAction
        }
      };

      const response = await api.post('/api/admin/notifications/bulk', payload);

      if (response.data.success) {
        toast.success(`Notificação enviada para ${response.data.data.sent} usuários`);
        setShowSendModal(false);
        setSelectedUsers([]);
        setNotificationData({
          title: '',
          body: '',
          imageUrl: '',
          clickAction: '',
          scheduledAt: '',
          useTemplate: false,
          templateId: ''
        });
        loadData(); // Recarregar estatísticas
      } else {
        toast.error('Erro ao enviar notificação');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateData.name || !templateData.subject || !templateData.body) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const payload = {
        name: templateData.name,
        type: templateData.type,
        subject: templateData.subject,
        body: templateData.body,
        variables: templateData.variables,
        isActive: templateData.isActive
      };

      let response;
      if (editingTemplate) {
        response = await api.put(`/api/admin/notifications/templates/${editingTemplate.id}`, payload);
      } else {
        response = await api.post('/api/admin/notifications/templates', payload);
      }

      if (response.data.success) {
        toast.success(editingTemplate ? 'Template atualizado' : 'Template criado');
        setShowTemplateModal(false);
        setEditingTemplate(null);
        setTemplateData({
          name: '',
          type: 'push',
          subject: '',
          body: '',
          variables: [],
          isActive: true
        });
        loadData();
      } else {
        toast.error('Erro ao salvar template');
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      isActive: template.isActive
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const response = await api.delete(`/api/admin/notifications/templates/${templateId}`);
      if (response.data.success) {
        toast.success('Template excluído');
        loadData();
      } else {
        toast.error('Erro ao excluir template');
      }
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações Push</h1>
          <p className="text-muted-foreground">
            Gerencie notificações push e templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSendModal(true)}>
            <Send className="w-4 h-4 mr-2" />
            Enviar Notificação
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotifications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.sentNotifications} sucessos, {stats.failedNotifications} falhas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Notificações entregues com sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTokens}</div>
              <p className="text-xs text-muted-foreground">
                Dispositivos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templatesCount}</div>
              <p className="text-xs text-muted-foreground">
                Templates disponíveis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo Principal */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="send">Enviar Notificação</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Notificação</CardTitle>
              <CardDescription>
                Gerencie templates para notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Assunto:</strong> {template.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Corpo:</strong> {template.body.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Notificação</CardTitle>
              <CardDescription>
                Envie notificações push para usuários específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título da notificação"
                  />
                </div>

                <div>
                  <Label htmlFor="body">Corpo</Label>
                  <Textarea
                    id="body"
                    value={notificationData.body}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Corpo da notificação"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="clickAction">Ação ao Clicar (opcional)</Label>
                  <Input
                    id="clickAction"
                    value={notificationData.clickAction}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, clickAction: e.target.value }))}
                    placeholder="screen_name"
                  />
                </div>

                <div>
                  <Label>Selecionar Usuários</Label>
                  <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" onClick={selectAllUsers}>
                      Selecionar Todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpar Seleção
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                          selectedUsers.includes(user.id) ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => {}}
                          className="pointer-events-none"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length} usuário(s) selecionado(s)
                  </p>
                  <Button 
                    onClick={handleSendNotification}
                    disabled={selectedUsers.length === 0 || !notificationData.title || !notificationData.body}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Notificação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Nome do Template</Label>
                <Input
                  id="templateName"
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="welcome_push"
                />
              </div>

              <div>
                <Label htmlFor="templateType">Tipo</Label>
                <Select
                  value={templateData.type}
                  onValueChange={(value: 'push' | 'email' | 'sms') => 
                    setTemplateData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="templateSubject">Assunto</Label>
                <Input
                  id="templateSubject"
                  value={templateData.subject}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Assunto da notificação"
                />
              </div>

              <div>
                <Label htmlFor="templateBody">Corpo</Label>
                <Textarea
                  id="templateBody"
                  value={templateData.body}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Corpo da notificação (use {{variavel}} para variáveis)"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="templateActive"
                  checked={templateData.isActive}
                  onCheckedChange={(checked) => setTemplateData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="templateActive">Template ativo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setShowTemplateModal(false);
                setEditingTemplate(null);
                setTemplateData({
                  name: '',
                  type: 'push',
                  subject: '',
                  body: '',
                  variables: [],
                  isActive: true
                });
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Atualizar' : 'Criar'} Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
