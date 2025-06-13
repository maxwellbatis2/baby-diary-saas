const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
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
    if (error.response?.data?.details) {
      console.log(`   Detalhes:`, error.response.data.details);
    }
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
      details: error.response?.data?.details,
      status: error.response?.status 
    };
  }
}

async function testBabyCreation() {
  console.log('🧪 === TESTE ESPECÍFICO DE CRIAÇÃO DE BEBÊS ===\n');

  // ===== REGISTRO DE USUÁRIO =====
  console.log('👤 Registrando novo usuário...');
  const userRegister = await testEndpoint('POST', '/api/auth/register', {
    name: 'Teste Bebê',
    email: `testebebe${Date.now()}@example.com`,
    password: 'Teste123!'
  });
  
  if (userRegister.success) {
    userToken = userRegister.data.data.token;
    userId = userRegister.data.data.user.id;
    console.log('✅ Usuário registrado com sucesso');
    console.log(`   ID: ${userId}`);
    console.log(`   Plano: ${userRegister.data.data.user.plan?.name || 'Nenhum plano'}`);
    console.log(`   Limite: ${userRegister.data.data.user.plan?.userLimit || 0} bebê(s)`);
  } else {
    console.log('❌ Falha no registro:', userRegister.error);
    return;
  }

  const userHeaders = { Authorization: `Bearer ${userToken}` };

  // ===== VERIFICAR PERFIL =====
  console.log('\n👤 Verificando perfil do usuário...');
  const userProfile = await testEndpoint('GET', '/api/user/me', null, userHeaders);
  if (userProfile.success) {
    const userData = userProfile.data.data;
    console.log('✅ Perfil carregado');
    console.log(`   Nome: ${userData.name}`);
    console.log(`   Plano: ${userData.plan?.name || 'Nenhum plano'}`);
    console.log(`   Limite: ${userData.plan?.userLimit || 0} bebês`);
    console.log(`   PlanId: ${userData.planId || 'Nenhum'}`);
  } else {
    console.log('❌ Falha ao carregar perfil');
    return;
  }

  // ===== TESTAR CRIAÇÃO DE BEBÊ =====
  console.log('\n👶 === TESTE DE CRIAÇÃO DE BEBÊ ===');
  
  // Teste 1: Dados válidos
  console.log('\n   Teste 1: Dados válidos...');
  const createBaby1 = await testEndpoint('POST', '/api/user/babies', {
    name: 'Bebê Teste',
    birthDate: '2024-01-01',
    gender: 'male'
  }, userHeaders);
  
  if (createBaby1.success) {
    console.log('   ✅ Bebê criado com sucesso');
    console.log(`   ID: ${createBaby1.data.data.id}`);
  } else {
    console.log('   ❌ Falha ao criar bebê:', createBaby1.error);
    if (createBaby1.details) {
      console.log('   Detalhes da validação:', createBaby1.details);
    }
  }

  // Teste 2: Dados inválidos (sem nome)
  console.log('\n   Teste 2: Dados inválidos (sem nome)...');
  const createBaby2 = await testEndpoint('POST', '/api/user/babies', {
    birthDate: '2024-01-01',
    gender: 'male'
  }, userHeaders);
  
  if (createBaby2.success) {
    console.log('   ❌ Bebê criado (não deveria)');
  } else {
    console.log('   ✅ Falha esperada:', createBaby2.error);
    if (createBaby2.details) {
      console.log('   Detalhes da validação:', createBaby2.details);
    }
  }

  // Teste 3: Dados inválidos (data inválida)
  console.log('\n   Teste 3: Dados inválidos (data inválida)...');
  const createBaby3 = await testEndpoint('POST', '/api/user/babies', {
    name: 'Bebê Teste 2',
    birthDate: 'data-invalida',
    gender: 'male'
  }, userHeaders);
  
  if (createBaby3.success) {
    console.log('   ❌ Bebê criado (não deveria)');
  } else {
    console.log('   ✅ Falha esperada:', createBaby3.error);
    if (createBaby3.details) {
      console.log('   Detalhes da validação:', createBaby3.details);
    }
  }

  console.log('\n🎉 === TESTE DE CRIAÇÃO DE BEBÊS CONCLUÍDO ===');
}

// Executar testes
testBabyCreation().catch(console.error); 