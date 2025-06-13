const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let adminToken = '';

async function testSettings() {
  console.log('🧪 === TESTANDO ENDPOINTS DE CONFIGURAÇÕES ===\n');

  // Login Admin
  console.log('🔐 Login Admin...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
      email: 'admin@babydiary.com',
      password: 'admin123'
    });
    
    adminToken = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');
  } catch (error) {
    console.log('❌ Falha no login admin:', error.response?.data?.error || error.message);
    return;
  }

  const headers = { Authorization: `Bearer ${adminToken}` };

  // Testar GET /api/admin/settings
  console.log('\n📋 Testando GET /api/admin/settings...');
  try {
    const settingsResponse = await axios.get(`${BASE_URL}/api/admin/settings`, { headers });
    console.log('✅ Configurações carregadas com sucesso');
    console.log('   App:', settingsResponse.data.data.app.name);
    console.log('   Versão:', settingsResponse.data.data.app.version);
    console.log('   Ambiente:', settingsResponse.data.data.app.environment);
    console.log('   Usuários:', settingsResponse.data.data.statistics.totalUsers);
    console.log('   Planos:', settingsResponse.data.data.statistics.totalPlans);
    console.log('   Admins:', settingsResponse.data.data.statistics.totalAdmins);
  } catch (error) {
    console.log('❌ Erro ao carregar configurações:', error.response?.data?.error || error.message);
  }

  // Testar POST /api/admin/settings/test-integrations
  console.log('\n🔧 Testando POST /api/admin/settings/test-integrations...');
  try {
    const testResponse = await axios.post(`${BASE_URL}/api/admin/settings/test-integrations`, {}, { headers });
    console.log('✅ Testes de integração concluídos');
    console.log('   Stripe:', testResponse.data.data.stripe.status);
    console.log('   Cloudinary:', testResponse.data.data.cloudinary.status);
    console.log('   Groq:', testResponse.data.data.groq.status);
    console.log('   Database:', testResponse.data.data.database.status);
  } catch (error) {
    console.log('❌ Erro ao testar integrações:', error.response?.data?.error || error.message);
  }

  // Testar POST /api/admin/settings/backup
  console.log('\n💾 Testando POST /api/admin/settings/backup...');
  try {
    const backupResponse = await axios.post(`${BASE_URL}/api/admin/settings/backup`, {}, { headers });
    console.log('✅ Backup realizado com sucesso');
    console.log('   Status:', backupResponse.data.data.status);
    console.log('   Tamanho:', backupResponse.data.data.size);
    console.log('   Tabelas:', backupResponse.data.data.tables.length);
  } catch (error) {
    console.log('❌ Erro ao realizar backup:', error.response?.data?.error || error.message);
  }

  // Testar POST /api/admin/settings/clear-cache
  console.log('\n🧹 Testando POST /api/admin/settings/clear-cache...');
  try {
    const cacheResponse = await axios.post(`${BASE_URL}/api/admin/settings/clear-cache`, {}, { headers });
    console.log('✅ Cache limpo com sucesso');
    console.log('   Status:', cacheResponse.data.data.status);
    console.log('   Itens limpos:', cacheResponse.data.data.itemsCleared);
  } catch (error) {
    console.log('❌ Erro ao limpar cache:', error.response?.data?.error || error.message);
  }

  console.log('\n🎉 Testes de configurações concluídos!');
}

testSettings().catch(console.error); 