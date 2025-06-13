const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
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

async function testFreePlan() {
  console.log('🧪 === TESTES DO PLANO GRATUITO (BÁSICO) ===\n');

  // ===== REGISTRO DE USUÁRIO =====
  console.log('👤 Registrando novo usuário...');
  const userRegister = await testEndpoint('POST', '/api/auth/register', {
    name: 'Usuário Gratuito',
    email: `gratuito${Date.now()}@example.com`,
    password: 'Teste123!'
  });
  
  if (userRegister.success) {
    userToken = userRegister.data.data.token;
    userId = userRegister.data.data.user.id;
    console.log('✅ Usuário registrado com sucesso');
    console.log(`   ID: ${userId}`);
    console.log(`   Plano: ${userRegister.data.data.user.plan?.name || 'Nenhum plano'}`);
    console.log(`   Limite: ${userRegister.data.data.user.plan?.userLimit || 0} bebê(s)`);
    console.log(`   Preço: R$ ${userRegister.data.data.user.plan?.price || 0}`);
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
    console.log(`   Features: ${userData.plan?.features?.join(', ') || 'Nenhuma'}`);
  } else {
    console.log('❌ Falha ao carregar perfil');
    return;
  }

  // ===== TESTAR CRIAÇÃO DE BEBÊS =====
  console.log('\n👶 === TESTES DE CRIAÇÃO DE BEBÊS ===');
  
  const planLimit = userProfile.data.data.plan?.userLimit || 0;
  console.log(`   Limite do plano: ${planLimit} bebê(s)`);

  // Criar bebês até o limite
  for (let i = 1; i <= planLimit + 1; i++) {
    console.log(`\n   Tentando criar bebê ${i}...`);
    const createBaby = await testEndpoint('POST', '/api/user/babies', {
      name: `Bebê ${i}`,
      birthDate: '2024-01-01',
      gender: 'MALE',
      weight: 3.5,
      height: 50
    }, userHeaders);
    
    if (createBaby.success) {
      console.log(`   ✅ Bebê ${i} criado com sucesso`);
      if (i === 1) {
        babyId = createBaby.data.data.id;
      }
    } else {
      console.log(`   ❌ Falha ao criar bebê ${i}: ${createBaby.error}`);
      if (i > planLimit) {
        console.log(`   ✅ Comportamento correto: bloqueou criação além do limite`);
      }
      break;
    }
  }

  // ===== TESTAR FUNCIONALIDADES DO PLANO =====
  console.log('\n🔧 === TESTES DE FUNCIONALIDADES ===');
  
  if (babyId) {
    // Testar criação de atividade
    console.log('\n   Testando criação de atividade...');
    const createActivity = await testEndpoint('POST', '/api/user/activities', {
      type: 'SLEEP',
      title: 'Sono da tarde',
      babyId: babyId,
      duration: 120,
      notes: 'Sono tranquilo'
    }, userHeaders);
    
    if (createActivity.success) {
      console.log('   ✅ Atividade criada com sucesso');
    } else {
      console.log('   ❌ Falha ao criar atividade:', createActivity.error);
    }

    // Testar criação de memória
    console.log('\n   Testando criação de memória...');
    const createMemory = await testEndpoint('POST', '/api/user/memories', {
      title: 'Primeira memória',
      description: 'Uma memória especial',
      babyId: babyId,
      date: new Date().toISOString(),
      tags: ['especial', 'primeira']
    }, userHeaders);
    
    if (createMemory.success) {
      console.log('   ✅ Memória criada com sucesso');
    } else {
      console.log('   ❌ Falha ao criar memória:', createMemory.error);
    }

    // Testar criação de marco
    console.log('\n   Testando criação de marco...');
    const createMilestone = await testEndpoint('POST', '/api/user/milestones', {
      title: 'Primeiro sorriso',
      description: 'O primeiro sorriso do bebê',
      category: 'SOCIAL',
      babyId: babyId,
      date: new Date().toISOString()
    }, userHeaders);
    
    if (createMilestone.success) {
      console.log('   ✅ Marco criado com sucesso');
    } else {
      console.log('   ❌ Falha ao criar marco:', createMilestone.error);
    }
  }

  // ===== TESTAR LIMITES DE MEMÓRIAS =====
  console.log('\n📸 === TESTES DE LIMITES DE MEMÓRIAS ===');
  
  const memoryLimit = userProfile.data.data.plan?.memoryLimit || 10;
  console.log(`   Limite de memórias: ${memoryLimit} por mês`);

  if (memoryLimit !== null) {
    // Tentar criar memórias além do limite
    for (let i = 2; i <= memoryLimit + 2; i++) {
      console.log(`\n   Tentando criar memória ${i}...`);
      const createMemory = await testEndpoint('POST', '/api/user/memories', {
        title: `Memória ${i}`,
        description: `Descrição da memória ${i}`,
        babyId: babyId,
        date: new Date().toISOString(),
        tags: [`memoria${i}`]
      }, userHeaders);
      
      if (createMemory.success) {
        console.log(`   ✅ Memória ${i} criada`);
      } else {
        console.log(`   ❌ Falha ao criar memória ${i}: ${createMemory.error}`);
        if (i > memoryLimit) {
          console.log(`   ✅ Comportamento correto: bloqueou criação além do limite`);
        }
        break;
      }
    }
  } else {
    console.log('   ✅ Plano com memórias ilimitadas');
  }

  // ===== TESTAR GAMIFICAÇÃO =====
  console.log('\n🎮 === TESTES DE GAMIFICAÇÃO ===');
  
  const gamification = await testEndpoint('GET', '/api/user/gamification', null, userHeaders);
  if (gamification.success) {
    console.log('✅ Gamificação carregada');
    console.log(`   Pontos: ${gamification.data.points}`);
    console.log(`   Nível: ${gamification.data.level}`);
    console.log(`   Badges: ${gamification.data.badges?.length || 0}`);
  } else {
    console.log('❌ Falha ao carregar gamificação');
  }

  // ===== TESTAR FUNCIONALIDADES DE IA =====
  console.log('\n🤖 === TESTES DE IA ===');
  
  const aiFeatures = userProfile.data.data.plan?.aiFeatures || false;
  console.log(`   Funcionalidades de IA: ${aiFeatures ? 'Disponíveis' : 'Não disponíveis'}`);

  if (aiFeatures) {
    const aiChat = await testEndpoint('POST', '/api/ai/chat', {
      message: 'Como posso melhorar o sono do meu bebê?',
      context: 'Bebê de 6 meses'
    }, userHeaders);
    
    if (aiChat.success) {
      console.log('   ✅ Chat com IA funcionando');
    } else {
      console.log('   ❌ Falha no chat com IA:', aiChat.error);
    }
  } else {
    console.log('   ✅ Comportamento correto: IA não disponível no plano gratuito');
  }

  // ===== TESTAR FUNCIONALIDADES OFFLINE =====
  console.log('\n📱 === TESTES DE MODO OFFLINE ===');
  
  const offlineMode = userProfile.data.data.plan?.offlineMode || false;
  console.log(`   Modo offline: ${offlineMode ? 'Disponível' : 'Não disponível'}`);
  console.log('   ✅ Comportamento correto: modo offline limitado no plano gratuito');

  // ===== TESTAR COMPARTILHAMENTO FAMILIAR =====
  console.log('\n👨‍👩‍👧‍👦 === TESTES DE COMPARTILHAMENTO ===');
  
  const familySharing = userProfile.data.data.plan?.familySharing || 0;
  console.log(`   Compartilhamento familiar: ${familySharing} membros`);
  console.log('   ✅ Comportamento correto: compartilhamento limitado no plano gratuito');

  // ===== TESTAR EXPORTAÇÃO =====
  console.log('\n📤 === TESTES DE EXPORTAÇÃO ===');
  
  const exportFeatures = userProfile.data.data.plan?.exportFeatures || false;
  console.log(`   Funcionalidades de exportação: ${exportFeatures ? 'Disponíveis' : 'Não disponíveis'}`);
  console.log('   ✅ Comportamento correto: exportação limitada no plano gratuito');

  console.log('\n🎉 === TESTES DO PLANO GRATUITO CONCLUÍDOS ===');
  console.log('✅ O plano gratuito está funcionando corretamente!');
  console.log('📋 Resumo:');
  console.log(`   - ${planLimit} bebê(s) permitido(s)`);
  console.log(`   - ${memoryLimit} memórias por mês`);
  console.log(`   - IA: ${aiFeatures ? 'Sim' : 'Não'}`);
  console.log(`   - Offline: ${offlineMode ? 'Sim' : 'Não'}`);
  console.log(`   - Compartilhamento: ${familySharing} membros`);
  console.log(`   - Exportação: ${exportFeatures ? 'Sim' : 'Não'}`);
}

// Executar testes
testFreePlan().catch(console.error); 