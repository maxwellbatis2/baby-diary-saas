import { Router } from 'express';
import prisma from '@/config/database';

const router = Router();

// Obter conteúdo da landing page
router.get('/landing-page', async (req, res) => {
  try {
    let content = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });

    if (!content) {
      // Conteúdo padrão se não existir
      content = {
        id: 1,
        heroTitle: 'Seu diário digital para acompanhar o bebê',
        heroSubtitle: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar',
        heroImage: null,
        features: [],
        testimonials: [],
        faq: [],
        stats: [],
        ctaText: null,
        ctaButtonText: null,
        seoTitle: 'Baby Diary - Seu diário digital para acompanhar o bebê',
        seoDescription: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar. Nunca perca um momento especial do desenvolvimento do seu pequeno.',
        seoKeywords: 'baby diary, diário do bebê, acompanhamento infantil, desenvolvimento do bebê, memórias do bebê',
        updatedAt: new Date(),
      };
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdo da landing page:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Listar planos disponíveis
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        yearlyPrice: true,
        features: true,
        userLimit: true,
        memoryLimit: true,
        photoQuality: true,
        familySharing: true,
        exportFeatures: true,
        prioritySupport: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter estatísticas públicas
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBabies, totalMemories] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.baby.count({ where: { isActive: true } }),
      prisma.memory.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBabies,
        totalMemories,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 