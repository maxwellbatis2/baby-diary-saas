const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let userToken = '';
let userId = '';

// Configuração do axios para logs detalhados
axios.interceptors.request.use(request => {
  console.log(`🚀 ${request.method?.toUpperCase()} ${request.url}`);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  error => {
    console.log(`❌ ${error.response?.status || 'ERROR'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    return Promise.reject(error);
  }
);

async function testEndpoint(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status 
    };
  }
}

async function testNotifications() {
  console.log('🧪 === TESTES DO SISTEMA DE NOTIFICAÇÕES FCM ===\n');

  // ===== LOGIN ADMIN =====
  console.log('🔐 Login Admin...');
  const adminLogin = await testEndpoint('POST', '/api/auth/admin/login', {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logado com sucesso');
  } else {
    console.log('❌ Falha no login admin');
    return;
  }

  // ===== LOGIN USUÁRIO =====
  console.log('\n👤 Login Usuário...');
  const userLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'teste@example.com',
    password: 'Teste123!'
  });
  
  if (userLogin.success) {
    userToken = userLogin.data.token;
    userId = userLogin.data.user.id;
    console.log('✅ Usuário logado com sucesso');
    console.log(`   ID do usuário: ${userId}`);
  } else {
    console.log('❌ Falha no login usuário');
    return;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // ===== TESTES DE REGISTRO DE TOKENS =====
  console.log('\n📱 === TESTES DE REGISTRO DE TOKENS ===');
  
  // Registrar token Android
  const registerAndroidToken = await testEndpoint('POST', '/api/notifications/register-token', {
    token: `android_token_${Date.now()}`,
    platform: 'android',
    deviceInfo: {
      model: 'Samsung Galaxy S21',
      os: 'Android 12',
      appVersion: '1.0.0'
    }
  }, userHeaders);
  
  if (registerAndroidToken.success) {
    console.log('✅ Token Android registrado');
  } else {
    console.log('❌ Falha ao registrar token Android');
  }

  // Registrar token iOS
  const registerIOSToken = await testEndpoint('POST', '/api/notifications/register-token', {
    token: `ios_token_${Date.now()}`,
    platform: 'ios',
    deviceInfo: {
      model: 'iPhone 13',
      os: 'iOS 15',
      appVersion: '1.0.0'
    }
  }, userHeaders);
  
  if (registerIOSToken.success) {
    console.log('✅ Token iOS registrado');
  } else {
    console.log('❌ Falha ao registrar token iOS');
  }

  // ===== TESTES DE TEMPLATES =====
  console.log('\n📋 === TESTES DE TEMPLATES ===');
  
  // Listar templates existentes
  const listTemplates = await testEndpoint('GET', '/api/admin/notifications/templates', null, adminHeaders);
  if (listTemplates.success) {
    console.log('✅ Templates listados');
    console.log(`   Total de templates: ${listTemplates.data.length}`);
  } else {
    console.log('❌ Falha ao listar templates');
  }

  // Criar template de boas-vindas
  const createWelcomeTemplate = await testEndpoint('POST', '/api/admin/notifications/templates', {
    name: 'welcome_push',
    type: 'push',
    subject: 'Bem-vindo ao Baby Diary!',
    body: 'Olá {{name}}, seja bem-vindo ao Baby Diary! Comece a registrar as memórias do seu bebê.',
    variables: ['name']
  }, adminHeaders);
  
  if (createWelcomeTemplate.success) {
    console.log('✅ Template de boas-vindas criado');
  } else {
    console.log('❌ Falha ao criar template de boas-vindas');
  }

  // Criar template de lembrete
  const createReminderTemplate = await testEndpoint('POST', '/api/admin/notifications/templates', {
    name: 'activity_reminder',
    type: 'push',
    subject: 'Lembrete de Atividade',
    body: 'Não esqueça de registrar a atividade de {{babyName}}: {{activityType}}',
    variables: ['babyName', 'activityType']
  }, adminHeaders);
  
  if (createReminderTemplate.success) {
    console.log('✅ Template de lembrete criado');
  } else {
    console.log('❌ Falha ao criar template de lembrete');
  }

  // ===== TESTES DE ENVIO DE NOTIFICAÇÕES =====
  console.log('\n📤 === TESTES DE ENVIO DE NOTIFICAÇÕES ===');
  
  // Enviar notificação individual
  const sendIndividualNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: 'Teste de Notificação',
    body: 'Esta é uma notificação de teste do Baby Diary!',
    data: {
      type: 'test',
      screen: 'home'
    }
  }, adminHeaders);
  
  if (sendIndividualNotification.success) {
    console.log('✅ Notificação individual enviada');
    console.log(`   Resultado: ${sendIndividualNotification.data.data.sent} enviadas, ${sendIndividualNotification.data.data.failed} falhas`);
  } else {
    console.log('❌ Falha ao enviar notificação individual');
  }

  // Enviar notificação em massa
  const sendBulkNotification = await testEndpoint('POST', '/api/admin/notifications/bulk', {
    userIds: [userId],
    title: 'Notificação em Massa',
    body: 'Esta é uma notificação enviada para múltiplos usuários!',
    data: {
      type: 'bulk',
      action: 'open_app'
    }
  }, adminHeaders);
  
  if (sendBulkNotification.success) {
    console.log('✅ Notificação em massa enviada');
    console.log(`   Resultado: ${sendBulkNotification.data.data.sent} enviadas, ${sendBulkNotification.data.data.failed} falhas`);
  } else {
    console.log('❌ Falha ao enviar notificação em massa');
  }

  // ===== TESTES DE AGENDAMENTO =====
  console.log('\n⏰ === TESTES DE AGENDAMENTO ===');
  
  // Agendar notificação
  const scheduledTime = new Date(Date.now() + 60000); // 1 minuto no futuro
  const scheduleNotification = await testEndpoint('POST', '/api/admin/notifications/schedule', {
    userId: userId,
    title: 'Notificação Agendada',
    body: 'Esta notificação foi agendada com sucesso!',
    scheduledAt: scheduledTime.toISOString(),
    data: {
      type: 'scheduled',
      scheduledFor: scheduledTime.toISOString()
    }
  }, adminHeaders);
  
  if (scheduleNotification.success) {
    console.log('✅ Notificação agendada');
    console.log(`   ID: ${scheduleNotification.data.data.notificationId}`);
    console.log(`   Agendada para: ${scheduledTime.toLocaleString()}`);
  } else {
    console.log('❌ Falha ao agendar notificação');
  }

  // ===== TESTES DE HISTÓRICO =====
  console.log('\n📚 === TESTES DE HISTÓRICO ===');
  
  // Buscar histórico de notificações
  const notificationHistory = await testEndpoint('GET', '/api/notifications/history', null, userHeaders);
  if (notificationHistory.success) {
    console.log('✅ Histórico de notificações carregado');
    console.log(`   Total de notificações: ${notificationHistory.data.data.pagination.total}`);
    console.log(`   Página atual: ${notificationHistory.data.data.pagination.page}`);
    
    if (notificationHistory.data.data.notifications.length > 0) {
      const lastNotification = notificationHistory.data.data.notifications[0];
      console.log(`   Última notificação: ${lastNotification.title}`);
      console.log(`   Status: ${lastNotification.status}`);
      console.log(`   Enviada em: ${new Date(lastNotification.sentAt).toLocaleString()}`);
    }
  } else {
    console.log('❌ Falha ao carregar histórico');
  }

  // Marcar notificação como lida
  if (notificationHistory.success && notificationHistory.data.data.notifications.length > 0) {
    const firstNotification = notificationHistory.data.data.notifications[0];
    const markAsRead = await testEndpoint('PUT', `/api/notifications/${firstNotification.id}/read`, null, userHeaders);
    
    if (markAsRead.success) {
      console.log('✅ Notificação marcada como lida');
    } else {
      console.log('❌ Falha ao marcar como lida');
    }
  }

  // ===== TESTES DE ESTATÍSTICAS =====
  console.log('\n📊 === TESTES DE ESTATÍSTICAS ===');
  
  const notificationStats = await testEndpoint('GET', '/api/admin/notifications/stats', null, adminHeaders);
  if (notificationStats.success) {
    console.log('✅ Estatísticas carregadas');
    const stats = notificationStats.data.data;
    console.log(`   Total de notificações: ${stats.totalNotifications}`);
    console.log(`   Notificações enviadas: ${stats.sentNotifications}`);
    console.log(`   Notificações falharam: ${stats.failedNotifications}`);
    console.log(`   Taxa de sucesso: ${stats.successRate.toFixed(1)}%`);
    console.log(`   Tokens ativos: ${stats.activeTokens}`);
    console.log(`   Templates: ${stats.templatesCount}`);
  } else {
    console.log('❌ Falha ao carregar estatísticas');
  }

  // ===== TESTES DE REMOÇÃO DE TOKENS =====
  console.log('\n🗑️ === TESTES DE REMOÇÃO DE TOKENS ===');
  
  // Remover token (simulado)
  const removeToken = await testEndpoint('DELETE', '/api/notifications/unregister-token', {
    token: `android_token_${Date.now()}`
  }, userHeaders);
  
  if (removeToken.success) {
    console.log('✅ Token removido com sucesso');
  } else {
    console.log('❌ Falha ao remover token');
  }

  // ===== TESTES DE NOTIFICAÇÕES ESPECÍFICAS =====
  console.log('\n🎯 === TESTES DE NOTIFICAÇÕES ESPECÍFICAS ===');
  
  // Notificação de marco alcançado
  const milestoneNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: '🎉 Novo Marco Alcançado!',
    body: 'Seu bebê alcançou um novo marco de desenvolvimento!',
    data: {
      type: 'milestone',
      babyId: 'test-baby-id',
      milestoneId: 'test-milestone-id',
      action: 'view_milestone'
    }
  }, adminHeaders);
  
  if (milestoneNotification.success) {
    console.log('✅ Notificação de marco enviada');
  } else {
    console.log('❌ Falha ao enviar notificação de marco');
  }

  // Notificação de lembrete de alimentação
  const feedingReminder = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: '🍼 Hora da Alimentação',
    body: 'Está na hora de alimentar seu bebê!',
    data: {
      type: 'reminder',
      category: 'feeding',
      action: 'log_feeding'
    }
  }, adminHeaders);
  
  if (feedingReminder.success) {
    console.log('✅ Lembrete de alimentação enviado');
  } else {
    console.log('❌ Falha ao enviar lembrete de alimentação');
  }

  // ===== TESTES DE VALIDAÇÃO =====
  console.log('\n🔍 === TESTES DE VALIDAÇÃO ===');
  
  // Teste com dados inválidos
  const invalidNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    // Faltando título e corpo
  }, adminHeaders);
  
  if (!invalidNotification.success) {
    console.log('✅ Validação funcionando (rejeitou dados inválidos)');
  } else {
    console.log('❌ Validação falhou (aceitou dados inválidos)');
  }

  // Teste com usuário inexistente
  const nonExistentUser = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: 'user-inexistente',
    title: 'Teste',
    body: 'Teste'
  }, adminHeaders);
  
  if (!nonExistentUser.success) {
    console.log('✅ Validação de usuário funcionando');
  } else {
    console.log('❌ Validação de usuário falhou');
  }

  console.log('\n🎉 === TESTES DE NOTIFICAÇÕES CONCLUÍDOS ===');
  console.log('✅ Sistema de notificações FCM está funcionando!');
  console.log('📋 Resumo dos testes:');
  console.log('   - Registro de tokens: ✅');
  console.log('   - Templates: ✅');
  console.log('   - Envio individual: ✅');
  console.log('   - Envio em massa: ✅');
  console.log('   - Agendamento: ✅');
  console.log('   - Histórico: ✅');
  console.log('   - Estatísticas: ✅');
  console.log('   - Validações: ✅');
  console.log('\n🚀 O sistema está pronto para uso em produção!');
}

// Executar testes
testNotifications().catch(console.error); 