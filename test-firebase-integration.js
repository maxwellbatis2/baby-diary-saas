const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let userToken = '';
let userId = '';

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

async function testFirebaseIntegration() {
  console.log('🧪 === TESTES DE INTEGRAÇÃO FIREBASE ===\n');

  // Login Admin
  const adminLogin = await testEndpoint('POST', '/api/auth/admin/login', {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logado');
  } else {
    console.log('❌ Falha no login admin');
    return;
  }

  // Login Usuário
  const userLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'teste@example.com',
    password: 'Teste123!'
  });
  
  if (userLogin.success) {
    userToken = userLogin.data.token;
    userId = userLogin.data.user.id;
    console.log('✅ Usuário logado');
  } else {
    console.log('❌ Falha no login usuário');
    return;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // Teste de registro de token
  console.log('\n📱 Registrando token de dispositivo...');
  const androidToken = `android_token_${Date.now()}`;
  
  const registerToken = await testEndpoint('POST', '/api/notifications/register-token', {
    token: androidToken,
    platform: 'android',
    deviceInfo: { model: 'Samsung Galaxy S21' }
  }, userHeaders);
  
  if (registerToken.success) {
    console.log('✅ Token registrado');
  } else {
    console.log('❌ Falha ao registrar token');
  }

  // Teste de envio de notificação
  console.log('\n📤 Enviando notificação...');
  const sendNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: userId,
    title: '🧪 Teste Firebase',
    body: 'Esta é uma notificação de teste do Firebase!',
    data: { type: 'test' }
  }, adminHeaders);
  
  if (sendNotification.success) {
    console.log('✅ Notificação enviada');
  } else {
    console.log('❌ Falha ao enviar notificação');
  }

  // Teste de histórico
  console.log('\n📚 Verificando histórico...');
  const history = await testEndpoint('GET', '/api/notifications/history', null, userHeaders);
  
  if (history.success) {
    console.log('✅ Histórico carregado');
    console.log(`   Total: ${history.data.data.pagination.total} notificações`);
  } else {
    console.log('❌ Falha ao carregar histórico');
  }

  // Teste de estatísticas
  console.log('\n📊 Verificando estatísticas...');
  const stats = await testEndpoint('GET', '/api/admin/notifications/stats', null, adminHeaders);
  
  if (stats.success) {
    console.log('✅ Estatísticas carregadas');
    console.log(`   Taxa de sucesso: ${stats.data.data.successRate.toFixed(2)}%`);
  } else {
    console.log('❌ Falha ao carregar estatísticas');
  }

  console.log('\n🎉 Testes concluídos!');
}

testFirebaseIntegration().catch(console.error); 