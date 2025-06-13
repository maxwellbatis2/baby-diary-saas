const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugToken() {
  console.log('🔍 === DEBUG DO TOKEN ===\n');

  // Login admin
  console.log('🔐 Fazendo login admin...');
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
    email: 'admin@babydiary.com',
    password: 'admin123'
  });

  console.log('✅ Login realizado com sucesso');
  console.log('📋 Estrutura da resposta:', JSON.stringify(loginResponse.data, null, 2));

  const token = loginResponse.data.token || loginResponse.data.data?.token;
  if (!token) {
    console.log('❌ Token não encontrado na resposta');
    return;
  }

  console.log(`📝 Token: ${token.substring(0, 50)}...`);
  console.log(`📏 Tamanho do token: ${token.length} caracteres`);

  // Testar token em uma rota que sabemos que funciona
  console.log('\n🧪 Testando token em rota que funciona...');
  try {
    const dashboardResponse = await axios.get(`${BASE_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Dashboard funcionou com o token');
  } catch (error) {
    console.log('❌ Dashboard falhou:', error.response?.data?.error || error.message);
  }

  // Testar token nas rotas de notificação
  console.log('\n🧪 Testando token nas rotas de notificação...');
  try {
    const notificationResponse = await axios.get(`${BASE_URL}/api/admin/notifications/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Notificações funcionaram com o token');
  } catch (error) {
    console.log('❌ Notificações falharam:', error.response?.data?.error || error.message);
    console.log('📊 Status:', error.response?.status);
  }

  // Verificar se há diferença na estrutura das rotas
  console.log('\n🔍 Verificando estrutura das rotas...');
  
  // Testar rota admin genérica
  try {
    const adminResponse = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Rota admin genérica funcionou');
  } catch (error) {
    console.log('❌ Rota admin genérica falhou:', error.response?.data?.error || error.message);
  }
}

debugToken().catch(console.error); 