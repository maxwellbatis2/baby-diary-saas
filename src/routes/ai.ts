import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';

const router = Router();

// Validações
const chatValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Mensagem deve ter entre 1 e 1000 caracteres'),
  body('babyAge')
    .optional()
    .isInt({ min: 0, max: 72 })
    .withMessage('Idade do bebê deve ser entre 0 e 72 meses'),
];

const sleepAnalysisValidation = [
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('days')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Dias deve ser entre 1 e 30'),
];

// Chat com IA
router.post('/chat', chatValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { message, babyAge } = req.body;

    // Buscar informações do usuário e bebês
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        babies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Construir contexto para a IA
    const context = {
      user: {
        name: user.name,
        babies: user.babies,
      },
      babyAge: babyAge || (user.babies[0] ? 
        Math.floor((new Date().getTime() - new Date(user.babies[0].birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 
        null
      ),
    };

    // Simular resposta da IA (em produção, usar Groq)
    const response = `Olá ${user.name}! Com base na idade do seu bebê (${context.babyAge} meses), aqui está minha resposta: ${message}`;

    return res.json({
      success: true,
      data: {
        response,
        context: {
          babyAge: context.babyAge,
          babyCount: user.babies.length,
        },
      },
    });
  } catch (error) {
    console.error('Erro no chat com IA:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Análise de sono
router.post('/analyze-sleep', sleepAnalysisValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { babyId, days = 7 } = req.body;

    // Verificar se o bebê pertence ao usuário
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Simular análise de sono (em produção, usar dados reais)
    const analysis = `Análise do sono do ${baby.name} nos últimos ${days} dias: O padrão de sono está adequado para a idade. Recomendações: manter horários regulares e criar uma rotina relaxante antes de dormir.`;

    return res.json({
      success: true,
      data: {
        analysis,
        statistics: {
          totalRecords: 7,
          averageSleep: 480, // 8 horas em minutos
          averageSleepFormatted: '8h 0min',
          period: `${days} dias`,
        },
        records: [],
      },
    });
  } catch (error) {
    console.error('Erro na análise de sono:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Sugestões de atividades
router.post('/suggest-activities', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { babyId, category } = req.body;

    // Buscar informações do bebê
    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      return res.status(404).json({
        success: false,
        error: 'Bebê não encontrado',
      });
    }

    // Calcular idade do bebê em meses
    const ageInMonths = Math.floor(
      (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
      (1000 * 60 * 60 * 24 * 30.44)
    );

    // Simular sugestões de atividades (em produção, usar Groq)
    const suggestions = [
      {
        title: 'Atividade de Desenvolvimento Motor',
        description: 'Ajude o bebê a praticar movimentos básicos',
        age: ageInMonths,
        category: category || 'general',
        duration: 15,
        materials: ['Brinquedos coloridos', 'Almofadas'],
      },
      {
        title: 'Estimulação Sensorial',
        description: 'Atividades para desenvolver os sentidos',
        age: ageInMonths,
        category: 'sensory',
        duration: 10,
        materials: ['Texturas diferentes', 'Sons suaves'],
      },
    ];

    return res.json({
      success: true,
      data: {
        suggestions,
        babyAge: ageInMonths,
        category: category || 'general',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 