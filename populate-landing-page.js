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

async function populateLandingPage() {
  console.log('🎨 === POPULANDO LANDING PAGE ===\n');

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

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // ===== CONTEÚDO DA LANDING PAGE BASEADO NO ARQUIVO =====
  const landingPageContent = {
    heroTitle: "Baby Diary - Seu diário digital inteligente para acompanhar o bebê",
    heroSubtitle: "Registre atividades, memórias e marcos importantes do seu bebê com o poder da inteligência artificial. Nunca perca um momento especial do desenvolvimento do seu pequeno ❤️",
    heroImage: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop",
    ctaText: "Comece a registrar as memórias do seu bebê hoje mesmo!",
    ctaButtonText: "Começar Gratuitamente ⭐",
    
    // Funcionalidades principais
    features: [
      {
        title: "Diário do Sono",
        description: "Acompanhe os padrões de sono do seu bebê e receba insights personalizados para melhorar a qualidade do sono.",
        icon: "moon"
      },
      {
        title: "Alimentação",
        description: "Registre mamadas, papinhas e introdução alimentar. Receba dicas baseadas na idade do seu bebê.",
        icon: "baby"
      },
      {
        title: "Curva de Crescimento",
        description: "Acompanhe o desenvolvimento físico do seu bebê com gráficos comparativos baseados nos padrões da OMS.",
        icon: "trending-up"
      },
      {
        title: "Vacinação",
        description: "Calendário de vacinas personalizado com lembretes automáticos para nunca perder uma dose importante.",
        icon: "heart"
      },
      {
        title: "Assistente IA",
        description: "Chat inteligente para tirar dúvidas sobre desenvolvimento, sono e alimentação do seu bebê.",
        icon: "brain"
      },
      {
        title: "Colaboração Familiar",
        description: "Compartilhe com avós, babás e cuidadores. Cada um com permissões específicas.",
        icon: "users"
      }
    ],

    // Depoimentos
    testimonials: [
      {
        name: "Maria Silva",
        text: "O Baby Diary revolucionou a forma como acompanho o desenvolvimento da minha filha. A IA me ajuda a entender melhor os padrões de sono e alimentação.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "João Santos",
        text: "Como pai de primeira viagem, o app me deu mais confiança. Os lembretes de vacina e os insights sobre desenvolvimento são incríveis!",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "Ana Costa",
        text: "A funcionalidade de compartilhamento com a família é perfeita! Agora todos podem acompanhar o crescimento do meu bebê.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "Carlos Oliveira",
        text: "O assistente IA responde todas as minhas dúvidas sobre desenvolvimento infantil. É como ter um pediatra 24h por dia!",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      }
    ],

    // FAQ
    faq: [
      {
        question: "O que é o Baby Diary e como a IA pode me ajudar?",
        answer: "Baby Diary é um aplicativo inteligente de acompanhamento do desenvolvimento e rotina do bebê que usa IA para fornecer insights personalizados. Nossa inteligência artificial analisa os padrões do seu bebê e oferece sugestões de horários, previsões de sono e dicas baseadas em dados científicos."
      },
      {
        question: "Posso utilizar gratuitamente? Quais são as limitações?",
        answer: "Sim! O plano Básico é totalmente gratuito e permite registrar 1 bebê, com até 10 memórias por mês e funções básicas. Para acessar o assistente IA completo, colaboração familiar avançada e análises preditivas, oferecemos os planos Premium e Família."
      },
      {
        question: "Como funciona o assistente de IA? É seguro?",
        answer: "Nosso assistente IA usa tecnologia avançada para analisar padrões e fornecer insights personalizados sobre sono, alimentação e desenvolvimento. Todos os dados são criptografados e processados com total segurança, seguindo rigorosamente a LGPD. A IA não substitui conselhos médicos profissionais."
      },
      {
        question: "Como funciona o compartilhamento com familiares?",
        answer: "Nos planos pagos, você pode compartilhar o diário do bebê com avós, tios ou babás, permitindo que eles também visualizem as atividades e memórias registradas. Cada pessoa pode ter permissões específicas (visualizar, editar, ou administrar). Há também chat em tempo real para coordenação entre cuidadores."
      },
      {
        question: "Meus dados estão seguros no aplicativo?",
        answer: "Sim! A segurança dos seus dados e os do seu bebê é nossa prioridade máxima. Utilizamos criptografia end-to-end, autenticação biométrica e seguimos todas as normas de proteção de dados (LGPD/GDPR). Além disso, nos planos Premium e Família, oferecemos backup automático em múltiplas nuvens para garantir que suas memórias nunca sejam perdidas."
      },
      {
        question: "O app funciona offline? E se eu perder a conexão?",
        answer: "Sim! O Baby Diary funciona completamente offline. Você pode registrar atividades, adicionar fotos e criar memórias mesmo sem internet. Quando a conexão retornar, tudo será sincronizado automaticamente e de forma segura com a nuvem."
      }
    ],

    // Estatísticas
    stats: [
      {
        label: "Famílias Ativas",
        value: "50,000+",
        description: "Confiam no Baby Diary"
      },
      {
        label: "Memórias Registradas",
        value: "2M+",
        description: "Momentos especiais salvos"
      },
      {
        label: "Avaliação",
        value: "4.9/5",
        description: "Pelos usuários"
      }
    ],

    // SEO
    seoTitle: "Baby Diary - Seu Diário Digital Inteligente para Acompanhar o Bebê",
    seoDescription: "Registre atividades, memórias e marcos importantes do seu bebê com o poder da inteligência artificial. Nunca perca um momento especial do desenvolvimento do seu pequeno.",
    seoKeywords: "baby diary, diário do bebê, acompanhamento infantil, desenvolvimento do bebê, memórias do bebê, IA bebê, sono bebê, alimentação bebê, vacinas bebê, família bebê"
  };

  // ===== ATUALIZAR LANDING PAGE =====
  console.log('\n📝 Atualizando conteúdo da landing page...');
  const updateResponse = await testEndpoint('PUT', '/api/admin/landing-page', landingPageContent, adminHeaders);
  
  if (updateResponse.success) {
    console.log('✅ Landing page atualizada com sucesso!');
    console.log('\n📋 Conteúdo adicionado:');
    console.log(`   - Título: ${landingPageContent.heroTitle}`);
    console.log(`   - Funcionalidades: ${landingPageContent.features.length}`);
    console.log(`   - Depoimentos: ${landingPageContent.testimonials.length}`);
    console.log(`   - FAQ: ${landingPageContent.faq.length}`);
    console.log(`   - Estatísticas: ${landingPageContent.stats.length}`);
  } else {
    console.log('❌ Falha ao atualizar landing page:', updateResponse.error);
  }

  // ===== VERIFICAR CONTEÚDO =====
  console.log('\n🔍 Verificando conteúdo atualizado...');
  const getResponse = await testEndpoint('GET', '/api/admin/landing-page', null, adminHeaders);
  
  if (getResponse.success) {
    console.log('✅ Conteúdo carregado com sucesso!');
    const content = getResponse.data.data;
    console.log(`   - Título: ${content.heroTitle}`);
    console.log(`   - Funcionalidades: ${content.features.length}`);
    console.log(`   - Depoimentos: ${content.testimonials.length}`);
    console.log(`   - FAQ: ${content.faq.length}`);
    console.log(`   - Estatísticas: ${content.stats.length}`);
  } else {
    console.log('❌ Falha ao carregar conteúdo:', getResponse.error);
  }

  console.log('\n🎉 Landing page populada com sucesso!');
  console.log('🌐 Agora você pode acessar /admin/landing-page para editar o conteúdo');
  console.log('📱 O conteúdo estará disponível para o frontend público em /api/public/landing-page');
}

// Executar script
populateLandingPage().catch(console.error); 