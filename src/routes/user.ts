import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { checkBabyLimit, verifyBabyOwnership } from '@/middlewares/auth';

const router = Router();

// Validações para bebês
const babyValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gênero deve ser "male" ou "female"'),
  body('birthDate')
    .isISO8601()
    .withMessage('Data de nascimento deve ser uma data válida'),
];

// Validações para atividades
const activityValidation = [
  body('type')
    .isIn(['sleep', 'feeding', 'diaper', 'weight', 'milestone', 'memory'])
    .withMessage('Tipo deve ser um dos valores válidos'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Título deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('babyId')
    .notEmpty()
    .withMessage('ID do bebê é obrigatório'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Data deve ser uma data válida'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duração deve ser um número inteiro positivo'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notas deve ter no máximo 1000 caracteres'),
];

// ===== GERENCIAMENTO DE BEBÊS =====

// Listar bebês do usuário
router.get('/babies', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const babies = await prisma.baby.findMany({
      where: {
        userId: req.user.userId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: babies,
    });
  } catch (error) {
    console.error('Erro ao listar bebês:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar novo bebê
router.post('/babies', babyValidation, checkBabyLimit, async (req: Request, res: Response) => {
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

    const { name, gender, birthDate, photoUrl } = req.body;

    const baby = await prisma.baby.create({
      data: {
        name,
        gender,
        birthDate: new Date(birthDate),
        photoUrl,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Bebê adicionado com sucesso',
      data: baby,
    });
  } catch (error) {
    console.error('Erro ao criar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Buscar bebê por ID (do usuário autenticado)
router.get('/babies/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }
    
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do bebê não fornecido.' });
    }
    
    const baby = await prisma.baby.findFirst({
      where: { id, userId: req.user.userId },
      include: {
        activities: true,
        memories: true,
        milestones: true,
        growthRecords: true,
        sleepRecords: true,
        feedingRecords: true,
        diaperRecords: true,
        weightRecords: true,
        vaccinationRecords: true,
      },
    });
    
    if (!baby) {
      return res.status(404).json({ success: false, error: 'Bebê não encontrado.' });
    }
    
    return res.json({ success: true, data: baby });
  } catch (error) {
    console.error('Erro ao buscar bebê:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Atualizar bebê por ID (do usuário autenticado)
router.put('/babies/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado.' });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do bebê não fornecido.' });
    }
    
    // Só permite atualizar bebês do próprio usuário
    const baby = await prisma.baby.findFirst({ where: { id, userId: req.user.userId } });
    if (!baby) {
      return res.status(404).json({ success: false, error: 'Bebê não encontrado.' });
    }
    
    const updated = await prisma.baby.update({ where: { id }, data: updateData });
    return res.json({ success: true, message: 'Bebê atualizado com sucesso', data: updated });
  } catch (error) {
    console.error('Erro ao atualizar bebê:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Deletar bebê (soft delete)
router.delete('/babies/:id', verifyBabyOwnership, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    await prisma.baby.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Bebê removido com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar bebê:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== ATIVIDADES =====

// Listar atividades de um bebê
router.get('/babies/:babyId/activities', verifyBabyOwnership, async (req: Request, res: Response) => {
  try {
    const { babyId } = req.params;
    const { page = '1', limit = '20', type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let where: any = { babyId };

    if (type) {
      where.type = type;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    });

    const total = await prisma.activity.count({ where });

    return res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar atividades:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar nova atividade
router.post('/activities', activityValidation, async (req: Request, res: Response) => {
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

    const {
      type,
      title,
      description,
      babyId,
      date,
      duration,
      notes,
      photoUrl,
    } = req.body;

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        duration,
        notes,
        photoUrl,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: activity,
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar atividade
router.put('/activities/:id', activityValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const activity = await prisma.activity.update({
      where: {
        id,
        userId: req.user.userId,
      },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: activity,
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar atividade
router.delete('/activities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da atividade é obrigatório',
      });
    }

    await prisma.activity.delete({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    return res.json({
      success: true,
      message: 'Atividade deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== MEMÓRIAS =====

// Listar memórias de um bebê
router.get('/babies/:babyId/memories', verifyBabyOwnership, async (req: Request, res: Response) => {
  try {
    const { babyId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    if (!babyId) {
      return res.status(400).json({
        success: false,
        error: 'ID do bebê é obrigatório',
      });
    }

    const memories = await prisma.memory.findMany({
      where: { babyId },
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    });

    const total = await prisma.memory.count({ where: { babyId } });

    return res.json({
      success: true,
      data: {
        memories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao listar memórias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar nova memória
router.post('/memories', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, photoUrl } = req.body;

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        photoUrl,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Memória criada com sucesso',
      data: memory,
    });
  } catch (error) {
    console.error('Erro ao criar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== MARCO DE DESENVOLVIMENTO =====

// Criar novo marco
router.post('/milestones', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, category, photoUrl } = req.body;

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        category,
        photoUrl,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Marco criado com sucesso',
      data: milestone,
    });
  } catch (error) {
    console.error('Erro ao criar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== GAMIFICAÇÃO =====

// Obter dados de gamificação do usuário
router.get('/gamification', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const gamification = await prisma.gamification.findUnique({
      where: { userId: req.user.userId },
    });

    if (!gamification) {
      // Criar registro de gamificação se não existir
      const newGamification = await prisma.gamification.create({
        data: {
          userId: req.user.userId,
          points: 0,
          badges: [],
        },
      });

      return res.json({
        success: true,
        data: newGamification,
      });
    }

    return res.json({
      success: true,
      data: gamification,
    });
  } catch (error) {
    console.error('Erro ao buscar dados de gamificação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== PERFIL DO USUÁRIO =====

// Obter perfil do usuário
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        plan: true,
        subscription: true,
        gamification: true,
        babies: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Atualizar perfil do usuário
router.put('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { name, phoneNumber, timezone, language, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name,
        phoneNumber,
        timezone,
        language,
        preferences,
      },
      include: {
        plan: true,
        subscription: true,
        gamification: true,
      },
    });

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== PLANOS E ASSINATURAS =====

// Listar planos disponíveis
router.get('/plans', async (req: Request, res: Response) => {
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
        aiFeatures: true,
        offlineMode: true,
      },
    });

    return res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Obter assinatura do usuário
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== MEMÓRIAS =====

// Listar memórias do usuário
router.get('/memories', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { page = 1, limit = 20, babyId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      userId: req.user.userId,
    };

    if (babyId) {
      where.babyId = babyId;
    }

    const memories = await prisma.memory.findMany({
      where,
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.memory.count({ where });

    return res.json({
      success: true,
      data: memories,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar memórias:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar memória
router.post('/memories', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, photoUrl } = req.body;

    if (!title || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Título e ID do bebê são obrigatórios',
      });
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        photoUrl,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Memória criada com sucesso',
      data: memory,
    });
  } catch (error) {
    console.error('Erro ao criar memória:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// ===== MARCOS =====

// Listar marcos do usuário
router.get('/milestones', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { page = 1, limit = 20, babyId, category } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      userId: req.user.userId,
    };

    if (babyId) {
      where.babyId = babyId;
    }

    if (category) {
      where.category = category;
    }

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.milestone.count({ where });

    return res.json({
      success: true,
      data: milestones,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar marcos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Criar marco
router.post('/milestones', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { title, description, babyId, date, category, photoUrl } = req.body;

    if (!title || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Título e ID do bebê são obrigatórios',
      });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        babyId,
        date: date ? new Date(date) : new Date(),
        category: category || 'general',
        photoUrl,
        userId: req.user.userId,
      },
      include: {
        baby: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Marco criado com sucesso',
      data: milestone,
    });
  } catch (error) {
    console.error('Erro ao criar marco:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 