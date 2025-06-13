const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';
let userToken = '';
let userId = '';
let planId = '';

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

async function testPlans() {
  console.log('🧪 === TESTES ESPECÍFICOS DE PLANOS ===\n');

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
    // Suporte para diferentes formatos de resposta
    const userData = userLogin.data.data?.user || userLogin.data.user;
    userToken = userLogin.data.data?.token || userLogin.data.token;
    userId = userData?.id;
    console.log('✅ Usuário logado com sucesso');
    console.log(`   ID do usuário: ${userId}`);
    console.log(`   Plano atual: ${userData?.plan?.name || 'Nenhum plano'}`);
  } else {
    console.log('❌ Falha no login usuário');
    return;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // ===== TESTES DE CRIAÇÃO DE PLANOS =====
  console.log('\n📋 === CRIAÇÃO DE PLANOS ===');
  
  // 1. Criar plano Básico
  const basicPlan = await testEndpoint('POST', '/api/admin/plans', {
    name: 'Básico',
    price: 0,
    features: ['1 bebê', '10 memórias por mês', 'Fotos em baixa resolução'],
    userLimit: 1,
    stripePriceId: `price_basic_${Date.now()}`
  }, adminHeaders);
  
  if (basicPlan.success) {
    console.log('✅ Plano Básico criado');
    console.log(`   ID: ${basicPlan.data.id}`);
    console.log(`   Preço: R$ ${basicPlan.data.price}`);
    console.log(`   Limite: ${basicPlan.data.userLimit} bebê(s)`);
  } else {
    console.log('❌ Falha ao criar plano Básico');
  }

  // 2. Criar plano Premium
  const premiumPlan = await testEndpoint('POST', '/api/admin/plans', {
    name: 'Premium',
    price: 19.90,
    features: ['Até 5 bebês', 'Memórias ilimitadas', 'Fotos em alta resolução', 'Suporte prioritário'],
    userLimit: 5,
    stripePriceId: `price_premium_${Date.now()}`
  }, adminHeaders);
  
  if (premiumPlan.success) {
    console.log('✅ Plano Premium criado');
    console.log(`   ID: ${premiumPlan.data.id}`);
    console.log(`   Preço: R$ ${premiumPlan.data.price}`);
    console.log(`   Limite: ${premiumPlan.data.userLimit} bebê(s)`);
    planId = premiumPlan.data.id; // Usar para testes
  } else {
    console.log('❌ Falha ao criar plano Premium');
  }

  // 3. Criar plano Família
  const familyPlan = await testEndpoint('POST', '/api/admin/plans', {
    name: 'Família',
    price: 29.90,
    features: ['Bebês ilimitados', 'Todas as funcionalidades', 'Suporte VIP 24/7', 'Álbuns impressos'],
    userLimit: 999,
    stripePriceId: `price_family_${Date.now()}`
  }, adminHeaders);
  
  if (familyPlan.success) {
    console.log('✅ Plano Família criado');
    console.log(`   ID: ${familyPlan.data.id}`);
    console.log(`   Preço: R$ ${familyPlan.data.price}`);
    console.log(`   Limite: ${familyPlan.data.userLimit} bebê(s)`);
  } else {
    console.log('❌ Falha ao criar plano Família');
  }

  // ===== TESTES DE LISTAGEM DE PLANOS =====
  console.log('\n📋 === LISTAGEM DE PLANOS ===');
  
  // Listar planos (admin)
  const adminPlans = await testEndpoint('GET', '/api/admin/plans', null, adminHeaders);
  if (adminPlans.success) {
    console.log('✅ Planos listados (admin)');
    console.log(`   Total de planos: ${adminPlans.data.length}`);
    adminPlans.data.forEach(plan => {
      console.log(`   - ${plan.name}: R$ ${plan.price} (${plan.userLimit} bebês)`);
    });
  } else {
    console.log('❌ Falha ao listar planos (admin)');
  }

  // Listar planos (público)
  const publicPlans = await testEndpoint('GET', '/api/public/plans');
  if (publicPlans.success) {
    console.log('✅ Planos listados (público)');
    console.log(`   Total de planos: ${publicPlans.data.length}`);
  } else {
    console.log('❌ Falha ao listar planos (público)');
  }

  // ===== TESTES DE ATRIBUIÇÃO DE PLANO =====
  console.log('\n👤 === ATRIBUIÇÃO DE PLANO AO USUÁRIO ===');
  
  // Atribuir plano Premium ao usuário
  const assignPlan = await testEndpoint('PUT', `/api/admin/users/${userId}/assign-plan`, {
    planId: planId
  }, adminHeaders);
  
  if (assignPlan.success) {
    console.log('✅ Plano atribuído ao usuário');
    console.log(`   Plano: ${assignPlan.data.plan.name}`);
    console.log(`   Limite: ${assignPlan.data.plan.userLimit} bebês`);
  } else {
    console.log('❌ Falha ao atribuir plano');
  }

  // Verificar perfil do usuário após atribuição
  const userProfile = await testEndpoint('GET', '/api/user/me', null, userHeaders);
  if (userProfile.success) {
    console.log('✅ Perfil do usuário atualizado');
    console.log(`   Nome: ${userProfile.data.name || userProfile.data.data?.name}`);
    const planData = userProfile.data.plan || userProfile.data.data?.plan;
    console.log(`   Plano: ${planData?.name || 'Nenhum plano'}`);
    console.log(`   Limite de bebês: ${planData?.userLimit || 0}`);
  } else {
    console.log('❌ Falha ao buscar perfil do usuário');
  }

  // ===== TESTES DE LIMITES DE PLANO =====
  console.log('\n🚫 === TESTES DE LIMITES DE PLANO ===');
  
  // Tentar criar bebês além do limite
  const currentPlan = userProfile.data.plan;
  const limit = currentPlan?.userLimit || 0;
  
  console.log(`   Limite atual: ${limit} bebês`);
  
  // Criar bebês até o limite
  for (let i = 1; i <= limit + 1; i++) {
    const createBaby = await testEndpoint('POST', '/api/users/babies', {
      name: `Bebê ${i}`,
      birthDate: '2024-01-01',
      gender: 'male'
    }, userHeaders);
    
    if (createBaby.success) {
      console.log(`   ✅ Bebê ${i} criado`);
    } else {
      console.log(`   ❌ Falha ao criar bebê ${i}: ${createBaby.error}`);
      break;
    }
  }

  // ===== TESTES DE UPGRADE DE PLANO =====
  console.log('\n⬆️ === TESTES DE UPGRADE DE PLANO ===');
  
  // Atribuir plano Família (upgrade)
  const upgradePlan = await testEndpoint('PUT', `/api/admin/users/${userId}/assign-plan`, {
    planId: familyPlan.data.id
  }, adminHeaders);
  
  if (upgradePlan.success) {
    console.log('✅ Upgrade de plano realizado');
    console.log(`   Novo plano: ${upgradePlan.data.plan.name}`);
    console.log(`   Novo limite: ${upgradePlan.data.plan.userLimit} bebês`);
  } else {
    console.log('❌ Falha no upgrade de plano');
  }

  // ===== TESTES DE DOWNGRADE DE PLANO =====
  console.log('\n⬇️ === TESTES DE DOWNGRADE DE PLANO ===');
  
  // Atribuir plano Básico (downgrade)
  const downgradePlan = await testEndpoint('PUT', `/api/admin/users/${userId}/assign-plan`, {
    planId: basicPlan.data.id
  }, adminHeaders);
  
  if (downgradePlan.success) {
    console.log('✅ Downgrade de plano realizado');
    console.log(`   Novo plano: ${downgradePlan.data.plan.name}`);
    console.log(`   Novo limite: ${downgradePlan.data.plan.userLimit} bebês`);
  } else {
    console.log('❌ Falha no downgrade de plano');
  }

  // ===== TESTES DE REMOÇÃO DE PLANO =====
  console.log('\n🗑️ === TESTES DE REMOÇÃO DE PLANO ===');
  
  // Remover plano do usuário
  const removePlan = await testEndpoint('DELETE', `/api/admin/users/${userId}/plan`, null, adminHeaders);
  
  if (removePlan.success) {
    console.log('✅ Plano removido do usuário');
  } else {
    console.log('❌ Falha ao remover plano');
  }

  // Verificar perfil após remoção
  const finalProfile = await testEndpoint('GET', '/api/users/me', null, userHeaders);
  if (finalProfile.success) {
    console.log('✅ Perfil final do usuário');
    console.log(`   Plano: ${finalProfile.data.plan?.name || 'Nenhum plano'}`);
  } else {
    console.log('❌ Falha ao buscar perfil final');
  }

  console.log('\n🎉 Testes de planos concluídos!');
}

// Executar testes
testPlans().catch(console.error); 