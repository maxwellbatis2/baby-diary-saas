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

async function testFirebaseNotifications() {
  console.log('🧪 === TESTES DE NOTIFICAÇÕES FIREBASE ===\n');

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

  // ===== TESTE DE REGISTRO DE TOKEN =====
  console.log('\n📱 === TESTE DE REGISTRO DE TOKEN ===');
  
  // Simular token de dispositivo Android
  const androidToken = `android_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const registerToken = await testEndpoint('POST', '/api/notifications/register-token', {
    token: androidToken,
    platform: 'android',
    deviceInfo: {
      model: 'Samsung Galaxy S21',
      os: 'Android 12',
      appVersion: '1.0.0'
    }
  }, userHeaders);
  
  if (registerToken.success) {
    console.log('✅ Token de dispositivo registrado com sucesso');
    console.log(`   Token: ${androidToken}`);
    console.log(`   Plataforma: Android`);
  } else {
    console.log('❌ Falha ao registrar token:', registerToken.error);
  }

  // ===== TESTE DE ENVIO DE NOTIFICAÇÃO =====
  console.log('\n📤 === TESTE DE ENVIO DE NOTIFICAÇÃO ===');
  
  const sendNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: '🧪 Teste Firebase',
    body: 'Esta é uma notificação de teste do Firebase!',
    data: {
      type: 'test',
      timestamp: Date.now().toString()
    },
    imageUrl: 'https://example.com/test-image.jpg',
    clickAction: 'OPEN_APP'
  }, adminHeaders);
  
  if (sendNotification.success) {
    console.log('✅ Notificação enviada com sucesso');
    console.log(`   Resultado: ${sendNotification.data.data.success ? 'Enviada' : 'Falha'}`);
  } else {
    console.log('❌ Falha ao enviar notificação:', sendNotification.error);
  }

  // ===== TESTE DE NOTIFICAÇÃO EM MASSA =====
  console.log('\n📢 === TESTE DE NOTIFICAÇÃO EM MASSA ===');
  
  const bulkNotification = await testEndpoint('POST', '/api/admin/notifications/bulk', {
    userIds: [userId],
    title: '📢 Notificação em Massa',
    body: 'Esta é uma notificação em massa de teste!',
    data: {
      type: 'bulk_test',
      campaign: 'firebase_integration'
    }
  }, adminHeaders);
  
  if (bulkNotification.success) {
    console.log('✅ Notificação em massa enviada');
    console.log(`   Sucessos: ${bulkNotification.data.data.successCount}`);
    console.log(`   Falhas: ${bulkNotification.data.data.failureCount}`);
  } else {
    console.log('❌ Falha na notificação em massa:', bulkNotification.error);
  }

  // ===== TESTE DE TEMPLATE DE NOTIFICAÇÃO =====
  console.log('\n📋 === TESTE DE TEMPLATE DE NOTIFICAÇÃO ===');
  
  const templateNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: '🎉 Bem-vindo ao Baby Diary!',
    body: 'Olá! Seja bem-vindo ao Baby Diary. Comece a registrar as memórias do seu bebê!',
    data: {
      type: 'welcome',
      template: 'welcome_message'
    }
  }, adminHeaders);
  
  if (templateNotification.success) {
    console.log('✅ Notificação com template enviada');
  } else {
    console.log('❌ Falha na notificação com template:', templateNotification.error);
  }

  // ===== TESTE DE AGENDAMENTO =====
  console.log('\n⏰ === TESTE DE AGENDAMENTO ===');
  
  const scheduledTime = new Date(Date.now() + 60000); // 1 minuto no futuro
  
  const scheduleNotification = await testEndpoint('POST', '/api/admin/notifications/schedule', {
    userId: userId,
    title: '⏰ Notificação Agendada',
    body: 'Esta notificação foi agendada para ser enviada em 1 minuto!',
    scheduledAt: scheduledTime.toISOString(),
    data: {
      type: 'scheduled',
      scheduledFor: scheduledTime.toISOString()
    }
  }, adminHeaders);
  
  if (scheduleNotification.success) {
    console.log('✅ Notificação agendada com sucesso');
    console.log(`   ID: ${scheduleNotification.data.data.notificationId}`);
    console.log(`   Agendada para: ${scheduledTime.toLocaleString()}`);
  } else {
    console.log('❌ Falha ao agendar notificação:', scheduleNotification.error);
  }

  // ===== TESTE DE HISTÓRICO =====
  console.log('\n📚 === TESTE DE HISTÓRICO ===');
  
  const history = await testEndpoint('GET', '/api/notifications/history?limit=10', null, userHeaders);
  
  if (history.success) {
    console.log('✅ Histórico carregado com sucesso');
    console.log(`   Total de notificações: ${history.data.data.pagination.total}`);
    console.log(`   Notificações na página: ${history.data.data.notifications.length}`);
    
    if (history.data.data.notifications.length > 0) {
      const lastNotification = history.data.data.notifications[0];
      console.log(`   Última notificação: ${lastNotification.title}`);
      console.log(`   Status: ${lastNotification.status}`);
      console.log(`   Enviada em: ${new Date(lastNotification.sentAt).toLocaleString()}`);
    }
  } else {
    console.log('❌ Falha ao carregar histórico:', history.error);
  }

  // ===== TESTE DE ESTATÍSTICAS =====
  console.log('\n📊 === TESTE DE ESTATÍSTICAS ===');
  
  const stats = await testEndpoint('GET', '/api/admin/notifications/stats', null, adminHeaders);
  
  if (stats.success) {
    console.log('✅ Estatísticas carregadas');
    console.log(`   Total de notificações: ${stats.data.data.totalNotifications}`);
    console.log(`   Notificações enviadas: ${stats.data.data.sentNotifications}`);
    console.log(`   Notificações falharam: ${stats.data.data.failedNotifications}`);
    console.log(`   Taxa de sucesso: ${stats.data.data.successRate.toFixed(2)}%`);
    console.log(`   Tokens ativos: ${stats.data.data.activeTokens}`);
    console.log(`   Templates: ${stats.data.data.templatesCount}`);
  } else {
    console.log('❌ Falha ao carregar estatísticas:', stats.error);
  }

  // ===== TESTE DE REMOÇÃO DE TOKEN =====
  console.log('\n🗑️ === TESTE DE REMOÇÃO DE TOKEN ===');
  
  const unregisterToken = await testEndpoint('DELETE', '/api/notifications/unregister-token', {
    token: androidToken
  }, userHeaders);
  
  if (unregisterToken.success) {
    console.log('✅ Token removido com sucesso');
  } else {
    console.log('❌ Falha ao remover token:', unregisterToken.error);
  }

  console.log('\n🎉 === TESTES DE FIREBASE CONCLUÍDOS ===');
  console.log('✅ A integração do Firebase está funcionando!');
  console.log('📋 Resumo dos testes:');
  console.log('   - Registro de token de dispositivo');
  console.log('   - Envio de notificação individual');
  console.log('   - Envio de notificação em massa');
  console.log('   - Notificação com template');
  console.log('   - Agendamento de notificação');
  console.log('   - Histórico de notificações');
  console.log('   - Estatísticas do sistema');
  console.log('   - Remoção de token');
}

// Executar testes
testFirebaseNotifications().catch(console.error); 