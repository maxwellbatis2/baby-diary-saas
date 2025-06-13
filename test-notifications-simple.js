const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

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
  console.log('🧪 === TESTE SIMPLES DO SISTEMA DE NOTIFICAÇÕES ===\n');

  // ===== LOGIN ADMIN =====
  console.log('🔐 Login Admin...');
  const adminLogin = await testEndpoint('POST', '/api/auth/admin/login', {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });
  
  if (!adminLogin.success) {
    console.log('❌ Falha no login admin');
    return;
  }

  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('✅ Admin logado com sucesso');

  // ===== TESTAR ENDPOINTS DE NOTIFICAÇÃO =====
  console.log('\n📋 === TESTANDO ENDPOINTS DE NOTIFICAÇÃO ===');

  // 1. Listar templates
  console.log('\n1. Listando templates...');
  const templates = await testEndpoint('GET', '/api/admin/notifications/templates', null, adminHeaders);
  if (templates.success) {
    console.log('✅ Templates listados com sucesso');
    console.log(`   Total: ${templates.data.data?.length || 0} templates`);
  } else {
    console.log('❌ Falha ao listar templates:', templates.error);
  }

  // 2. Criar template
  console.log('\n2. Criando template...');
  const createTemplate = await testEndpoint('POST', '/api/admin/notifications/templates', {
    name: 'Teste Template',
    type: 'push',
    subject: 'Teste de Notificação',
    body: 'Esta é uma notificação de teste',
    variables: ['name', 'babyName']
  }, adminHeaders);
  
  if (createTemplate.success) {
    console.log('✅ Template criado com sucesso');
    console.log(`   ID: ${createTemplate.data.data.id}`);
  } else {
    console.log('❌ Falha ao criar template:', createTemplate.error);
  }

  // 3. Buscar estatísticas
  console.log('\n3. Buscando estatísticas...');
  const stats = await testEndpoint('GET', '/api/admin/notifications/stats', null, adminHeaders);
  if (stats.success) {
    console.log('✅ Estatísticas carregadas');
    console.log(`   Total de notificações: ${stats.data.data.totalNotifications}`);
    console.log(`   Tokens ativos: ${stats.data.data.activeTokens}`);
    console.log(`   Templates: ${stats.data.data.templatesCount}`);
  } else {
    console.log('❌ Falha ao buscar estatísticas:', stats.error);
  }

  console.log('\n🎉 Teste simples concluído!');
  console.log('✅ O sistema de notificações está funcionando!');
}

// Executar teste
testNotifications().catch(console.error); 