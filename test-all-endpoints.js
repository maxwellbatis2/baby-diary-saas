const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let userToken = '';
let userId = '';
let babyId = '';

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

async function runTests() {
  console.log('🧪 Iniciando testes completos do backend...\n');

  // ===== TESTES PÚBLICOS =====
  console.log('📋 === TESTES PÚBLICOS ===');
  
  // Health check
  const health = await testEndpoint('GET', '/health');
  console.log('Health Check:', health.success ? '✅' : '❌');

  // Landing page pública
  const landingPage = await testEndpoint('GET', '/api/public/landing-page');
  console.log('Landing Page Pública:', landingPage.success ? '✅' : '❌');

  // Planos públicos
  const publicPlans = await testEndpoint('GET', '/api/public/plans');
  console.log('Planos Públicos:', publicPlans.success ? '✅' : '❌');

  // ===== TESTES DE AUTENTICAÇÃO =====
  console.log('\n🔐 === TESTES DE AUTENTICAÇÃO ===');
  
  // Login admin
  const adminLogin = await testEndpoint('POST', '/api/auth/admin/login', {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('Login Admin: ✅');
  } else {
    console.log('Login Admin: ❌');
  }

  // Registro usuário
  const userRegister = await testEndpoint('POST', '/api/auth/register', {
    name: 'Teste Usuário',
    email: `teste${Date.now()}@example.com`,
    password: 'Teste123!'
  });
  
  if (userRegister.success) {
    userToken = userRegister.data.token;
    userId = userRegister.data.user.id;
    console.log('Registro Usuário: ✅');
  } else {
    console.log('Registro Usuário: ❌');
  }

  // Login usuário
  const userLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'teste@example.com',
    password: 'Teste123!'
  });
  
  if (userLogin.success) {
    userToken = userLogin.data.token;
    console.log('Login Usuário: ✅');
  } else {
    console.log('Login Usuário: ❌');
  }

  // ===== TESTES DO PAINEL ADMIN =====
  console.log('\n👨‍💼 === TESTES DO PAINEL ADMIN ===');
  
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Dashboard admin
  const adminDashboard = await testEndpoint('GET', '/api/admin/dashboard', null, adminHeaders);
  console.log('Dashboard Admin:', adminDashboard.success ? '✅' : '❌');

  // Listar usuários
  const adminUsers = await testEndpoint('GET', '/api/admin/users', null, adminHeaders);
  console.log('Listar Usuários:', adminUsers.success ? '✅' : '❌');

  // Listar planos
  const adminPlans = await testEndpoint('GET', '/api/admin/plans', null, adminHeaders);
  console.log('Listar Planos:', adminPlans.success ? '✅' : '❌');

  // Criar plano (com stripePriceId único)
  const createPlan = await testEndpoint('POST', '/api/admin/plans', {
    name: 'Plano Teste',
    price: 29.90,
    features: ['Feature 1', 'Feature 2'],
    userLimit: 5,
    stripePriceId: `price_test_${Date.now()}`
  }, adminHeaders);
  console.log('Criar Plano:', createPlan.success ? '✅' : '❌');

  // Listar regras de gamificação
  const gamificationRules = await testEndpoint('GET', '/api/admin/gamification-rules', null, adminHeaders);
  console.log('Listar Regras Gamificação:', gamificationRules.success ? '✅' : '❌');

  // Criar regra de gamificação
  const createRule = await testEndpoint('POST', '/api/admin/gamification-rules', {
    name: 'Login Diário',
    description: 'Faça login por 7 dias seguidos',
    points: 50,
    condition: 'login_streak_7'
  }, adminHeaders);
  console.log('Criar Regra Gamificação:', createRule.success ? '✅' : '❌');

  // Listar templates de notificação
  const notificationTemplates = await testEndpoint('GET', '/api/admin/notification-templates', null, adminHeaders);
  console.log('Listar Templates Notificação:', notificationTemplates.success ? '✅' : '❌');

  // Atualizar template de notificação
  const updateTemplate = await testEndpoint('PUT', '/api/admin/notification-templates/1', {
    subject: 'Bem-vindo ao Baby Diary!',
    body: 'Olá {{name}}, seja bem-vindo ao Baby Diary!'
  }, adminHeaders);
  console.log('Atualizar Template:', updateTemplate.success ? '✅' : '❌');

  // Buscar conteúdo da landing page
  const landingPageContent = await testEndpoint('GET', '/api/admin/landing-page', null, adminHeaders);
  console.log('Buscar Landing Page:', landingPageContent.success ? '✅' : '❌');

  // Atualizar conteúdo da landing page
  const updateLandingPage = await testEndpoint('PUT', '/api/admin/landing-page', {
    heroTitle: 'Baby Diary - Seu Diário Digital',
    heroSubtitle: 'Acompanhe o desenvolvimento do seu bebê',
    features: [
      { title: 'Diário Completo', description: 'Registre todas as atividades' },
      { title: 'Marcos Importantes', description: 'Nunca perca um momento especial' }
    ],
    faq: [
      { question: 'É gratuito?', answer: 'Sim, o plano básico é gratuito' }
    ]
  }, adminHeaders);
  console.log('Atualizar Landing Page:', updateLandingPage.success ? '✅' : '❌');

  // ===== TESTES DO USUÁRIO =====
  console.log('\n👤 === TESTES DO USUÁRIO ===');
  
  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // Perfil do usuário
  const userProfile = await testEndpoint('GET', '/api/users/me', null, userHeaders);
  console.log('Perfil Usuário:', userProfile.success ? '✅' : '❌');

  // Atualizar perfil
  const updateProfile = await testEndpoint('PUT', '/api/users/me', {
    name: 'Usuário Atualizado'
  }, userHeaders);
  console.log('Atualizar Perfil:', updateProfile.success ? '✅' : '❌');

  // Listar bebês
  const listBabies = await testEndpoint('GET', '/api/users/babies', null, userHeaders);
  console.log('Listar Bebês:', listBabies.success ? '✅' : '❌');

  // Criar bebê
  const createBaby = await testEndpoint('POST', '/api/users/babies', {
    name: 'Bebê Teste',
    birthDate: '2024-01-01',
    gender: 'MALE',
    weight: 3.5,
    height: 50
  }, userHeaders);
  
  if (createBaby.success) {
    babyId = createBaby.data.id;
    console.log('Criar Bebê: ✅');
  } else {
    console.log('Criar Bebê: ❌');
  }

  // Buscar bebê por ID
  if (babyId) {
    const getBaby = await testEndpoint('GET', `/api/users/babies/${babyId}`, null, userHeaders);
    console.log('Buscar Bebê por ID:', getBaby.success ? '✅' : '❌');
  }

  // Atualizar bebê
  if (babyId) {
    const updateBaby = await testEndpoint('PUT', `/api/users/babies/${babyId}`, {
      name: 'Bebê Atualizado'
    }, userHeaders);
    console.log('Atualizar Bebê:', updateBaby.success ? '✅' : '❌');
  }

  // Listar atividades
  if (babyId) {
    const listActivities = await testEndpoint('GET', `/api/users/babies/${babyId}/activities`, null, userHeaders);
    console.log('Listar Atividades:', listActivities.success ? '✅' : '❌');
  }

  // Criar atividade
  if (babyId) {
    const createActivity = await testEndpoint('POST', `/api/users/babies/${babyId}/activities`, {
      type: 'SLEEP',
      duration: 120,
      notes: 'Sono tranquilo'
    }, userHeaders);
    console.log('Criar Atividade:', createActivity.success ? '✅' : '❌');
  }

  // ===== TESTES DE UPLOAD =====
  console.log('\n📤 === TESTES DE UPLOAD ===');
  
  // Upload de imagem (mock)
  const uploadImage = await testEndpoint('POST', '/api/upload/image', {
    imageUrl: 'https://example.com/test-image.jpg'
  }, userHeaders);
  console.log('Upload Imagem:', uploadImage.success ? '✅' : '❌');

  // ===== TESTES DE PAGAMENTO =====
  console.log('\n💳 === TESTES DE PAGAMENTO ===');
  
  // Criar sessão de checkout
  const createCheckout = await testEndpoint('POST', '/api/payments/create-checkout-session', {
    planId: 'test-plan-id'
  }, userHeaders);
  console.log('Criar Checkout:', createCheckout.success ? '✅' : '❌');

  // ===== TESTES DE IA =====
  console.log('\n🤖 === TESTES DE IA ===');
  
  // Chat com IA
  const aiChat = await testEndpoint('POST', '/api/ai/chat', {
    message: 'Como posso melhorar o sono do meu bebê?',
    context: 'Bebê de 6 meses'
  }, userHeaders);
  console.log('Chat IA:', aiChat.success ? '✅' : '❌');

  // Análise de sono
  const sleepAnalysis = await testEndpoint('POST', '/api/ai/analyze-sleep', {
    babyId: babyId,
    days: 7
  }, userHeaders);
  console.log('Análise Sono:', sleepAnalysis.success ? '✅' : '❌');

  // ===== TESTES DE ANALYTICS =====
  console.log('\n📊 === TESTES DE ANALYTICS ===');
  
  // Analytics do usuário
  const userAnalytics = await testEndpoint('GET', '/api/analytics/user', null, userHeaders);
  console.log('Analytics Usuário:', userAnalytics.success ? '✅' : '❌');

  // Analytics do bebê
  if (babyId) {
    const babyAnalytics = await testEndpoint('GET', `/api/analytics/baby/${babyId}`, null, userHeaders);
    console.log('Analytics Bebê:', babyAnalytics.success ? '✅' : '❌');
  }

  // ===== TESTES DE STATUS =====
  console.log('\n🔄 === TESTES DE STATUS ===');
  
  // Ativar usuário
  const activateUser = await testEndpoint('PUT', `/api/admin/users/${userId}/activate`, null, adminHeaders);
  console.log('Ativar Usuário:', activateUser.success ? '✅' : '❌');

  // Desativar usuário
  const deactivateUser = await testEndpoint('PUT', `/api/admin/users/${userId}/deactivate`, null, adminHeaders);
  console.log('Desativar Usuário:', deactivateUser.success ? '✅' : '❌');

  // ===== TESTES DE RESET =====
  console.log('\n🔄 === TESTES DE RESET ===');
  
  // Reset de gamificação
  const resetGamification = await testEndpoint('POST', `/api/admin/users/${userId}/reset-gamification`, null, adminHeaders);
  console.log('Reset Gamificação:', resetGamification.success ? '✅' : '❌');

  // Reset de senha
  const resetPassword = await testEndpoint('POST', `/api/admin/users/${userId}/reset-password`, null, adminHeaders);
  console.log('Reset Senha:', resetPassword.success ? '✅' : '❌');

  console.log('\n🎉 Testes concluídos!');
}

// Executar testes
runTests().catch(console.error); 