const axios = require('axios');

async function testGamification() {
  try {
    // Primeiro fazer login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/admin/login', {
      email: 'admin@babydiary.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('Token obtido:', token.substring(0, 20) + '...');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Testar listar regras de gamificação
    console.log('\n=== TESTE - LISTAR REGRAS DE GAMIFICAÇÃO ===');
    const listResponse = await axios.get('http://localhost:3000/api/admin/gamification-rules', { headers });
    console.log('Status:', listResponse.status);
    console.log('Regras encontradas:', listResponse.data.data.length);
    
    if (listResponse.data.data.length > 0) {
      console.log('Primeira regra:', listResponse.data.data[0]);
    }
    
    // Testar criar nova regra
    console.log('\n=== TESTE - CRIAR NOVA REGRA ===');
    const createResponse = await axios.post('http://localhost:3000/api/admin/gamification-rules', {
      name: 'Teste de Regra',
      description: 'Regra criada para teste',
      points: 25,
      condition: 'test_condition',
      category: 'daily'
    }, { headers });
    
    console.log('Status:', createResponse.status);
    console.log('Regra criada:', createResponse.data.data);
    
    const newRuleId = createResponse.data.data.id;
    
    // Testar atualizar regra
    console.log('\n=== TESTE - ATUALIZAR REGRA ===');
    const updateResponse = await axios.put(`http://localhost:3000/api/admin/gamification-rules/${newRuleId}`, {
      name: 'Teste de Regra Atualizada',
      description: 'Regra atualizada para teste',
      points: 50,
      condition: 'test_condition_updated'
    }, { headers });
    
    console.log('Status:', updateResponse.status);
    console.log('Regra atualizada:', updateResponse.data.data);
    
    // Testar ativar/desativar regra
    console.log('\n=== TESTE - DESATIVAR REGRA ===');
    const statusResponse = await axios.put(`http://localhost:3000/api/admin/gamification-rules/${newRuleId}/status`, {
      isActive: false
    }, { headers });
    
    console.log('Status:', statusResponse.status);
    console.log('Regra desativada:', statusResponse.data.data);
    
    // Testar deletar regra
    console.log('\n=== TESTE - DELETAR REGRA ===');
    const deleteResponse = await axios.delete(`http://localhost:3000/api/admin/gamification-rules/${newRuleId}`, { headers });
    
    console.log('Status:', deleteResponse.status);
    console.log('Mensagem:', deleteResponse.data.message);
    
    console.log('\n✅ Todos os testes de gamificação passaram!');
    
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

testGamification(); 