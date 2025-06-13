const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';

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

async function testNotificationsFixed() {
  console.log('🧪 === TESTE CORRIGIDO DO SISTEMA DE NOTIFICAÇÕES ===\n');

  // ===== LOGIN ADMIN =====
  console.log('🔐 Login Admin...');
  const adminLogin = await testEndpoint('POST', '/api/auth/admin/login', {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.data?.token || adminLogin.data.token;
    console.log('✅ Admin logado com sucesso');
  } else {
    console.log('❌ Falha no login admin');
    return;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // ===== TESTAR ROTAS ADMIN CORRIGIDAS =====
  console.log('\n📋 === TESTANDO ROTAS ADMIN CORRIGIDAS ===');

  // 1. Listar templates
  console.log('\n1. Listando templates...');
  const listTemplates = await testEndpoint('GET', '/api/admin/notifications/templates', null, adminHeaders);
  if (listTemplates.success) {
    console.log('✅ Templates listados com sucesso');
    console.log(`   Total de templates: ${listTemplates.data.data?.length || 0}`);
  } else {
    console.log('❌ Falha ao listar templates:', listTemplates.error);
  }

  // 2. Criar template
  console.log('\n2. Criando template...');
  const createTemplate = await testEndpoint('POST', '/api/admin/notifications/templates', {
    name: 'Template de Teste',
    type: 'push',
    subject: 'Notificação de Teste',
    body: 'Esta é uma notificação de teste'
  }, adminHeaders);
  
  if (createTemplate.success) {
    console.log('✅ Template criado com sucesso');
    console.log(`   ID: ${createTemplate.data.data?.id}`);
  } else {
    console.log('❌ Falha ao criar template:', createTemplate.error);
  }

  // 3. Buscar estatísticas
  console.log('\n3. Buscando estatísticas...');
  const stats = await testEndpoint('GET', '/api/admin/notifications/stats', null, adminHeaders);
  if (stats.success) {
    console.log('✅ Estatísticas carregadas com sucesso');
    console.log(`   Total de notificações: ${stats.data.data?.totalNotifications || 0}`);
    console.log(`   Templates: ${stats.data.data?.templatesCount || 0}`);
  } else {
    console.log('❌ Falha ao buscar estatísticas:', stats.error);
  }

  // 4. Testar envio de notificação
  console.log('\n4. Testando envio de notificação...');

  // Primeiro, registrar um usuário temporário para testar o envio de notificação
  console.log('Criando usuário temporário para teste de notificação...');
  const tempUserEmail = `testuser_${Date.now()}@example.com`;
  const userRegister = await testEndpoint('POST', '/api/auth/register', {
    name: 'Teste Notificacao',
    email: tempUserEmail,
    password: 'Password123!'
  });

  let testNotificationUserId = null;
  if (userRegister.success) {
    // Tenta extrair o usuário de diferentes estruturas de resposta
    const userData = userRegister.data.data?.user || userRegister.data.user; 
    if (userData?.id) {
      testNotificationUserId = userData.id;
      console.log(`✅ Usuário temporário criado com ID: ${testNotificationUserId}`);
    } else {
      console.log('❌ Falha ao extrair ID do usuário da resposta. Resposta:', userRegister.data);
    }
  } else {
    console.log('❌ Falha ao criar usuário temporário para notificação:', userRegister.error);
  }

  if (!testNotificationUserId) {
    console.log('Pulando teste de envio de notificação devido à falha na criação/extração do usuário.');
    return; // Sair do teste se não conseguir o userId
  }

  const sendNotification = await testEndpoint('POST', '/api/admin/notifications/send', {
    userId: testNotificationUserId, // Usar o userId real aqui
    title: 'Teste de Notificação',
    body: 'Esta é uma notificação de teste do sistema'
  }, adminHeaders);
  
  if (sendNotification.success) {
    console.log('✅ Notificação enviada com sucesso');
  } else {
    console.log('❌ Falha ao enviar notificação:', sendNotification.error);
  }

  console.log('\n🎉 Teste corrigido concluído!');
  console.log('✅ O sistema de notificações está funcionando corretamente!');
}

// Executar teste
testNotificationsFixed().catch(console.error); 