import { Router } from 'express';
import { authenticateUser, authenticateAdmin } from '../middlewares/auth';
import notificationService from '../services/notification.service';
import prisma from '../config/database';
import { z } from 'zod';

const router = Router();

// Schemas de validação
const registerTokenSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  platform: z.enum(['ios', 'android', 'web'], {
    errorMap: () => ({ message: 'Plataforma deve ser ios, android ou web' })
  }),
  deviceInfo: z.record(z.any()).optional()
});

const sendNotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  body: z.string().min(1, 'Corpo é obrigatório').max(500, 'Corpo muito longo'),
  data: z.record(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  clickAction: z.string().optional()
});

const scheduleNotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  body: z.string().min(1, 'Corpo é obrigatório'),
  scheduledAt: z.string().datetime('Data deve ser válida'),
  data: z.record(z.string()).optional()
});

const bulkNotificationSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Pelo menos um usuário deve ser selecionado'),
  title: z.string().min(1, 'Título é obrigatório'),
  body: z.string().min(1, 'Corpo é obrigatório'),
  data: z.record(z.string()).optional()
});

// ===== ENDPOINTS PARA USUÁRIOS =====

/**
 * POST /api/notifications/register-token
 * Registrar token de dispositivo para notificações push
 */
router.post('/register-token', authenticateUser, async (req, res) => {
  try {
    const { token, platform, deviceInfo } = registerTokenSchema.parse(req.body);
    const userId = req.user!.userId;

    const success = await notificationService.registerDeviceToken(
      userId,
      token,
      platform,
      deviceInfo
    );

    if (success) {
      res.json({
        success: true,
        message: 'Token registrado com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Falha ao registrar token'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      console.error('Erro ao registrar token:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * DELETE /api/notifications/unregister-token
 * Remover token de dispositivo
 */
router.delete('/unregister-token', authenticateUser, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token é obrigatório'
      });
    }

    const success = await notificationService.unregisterDeviceToken(token);

    if (success) {
      return res.json({
        success: true,
        message: 'Token removido com sucesso'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Falha ao remover token'
      });
    }
  } catch (error) {
    console.error('Erro ao remover token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/notifications/history
 * Buscar histórico de notificações do usuário
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        status: true,
        sentAt: true,
        readAt: true,
        createdAt: true
      }
    });

    const total = await prisma.notification.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marcar notificação como lida
 */
router.put('/:id/read', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID da notificação é obrigatório'
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: id as string,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    await prisma.notification.update({
      where: { id: id as string },
      data: { readAt: new Date() }
    });

    return res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ===== ENDPOINTS PARA ADMIN =====

/**
 * POST /api/admin/notifications/send
 * Enviar notificação para um usuário específico
 */
router.post('/send', authenticateAdmin, async (req, res) => {
  try {
    const { userId, ...notificationData } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    const { title, body, data, imageUrl, clickAction } = sendNotificationSchema.parse(notificationData);

    const result = await notificationService.sendPushNotification(
      userId,
      title,
      body,
      data
    );

    return res.json({
      success: true,
      message: 'Notificação enviada',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      console.error('Erro ao enviar notificação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * POST /api/admin/notifications/bulk
 * Enviar notificação para múltiplos usuários
 */
router.post('/admin/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { userIds, title, body, data } = bulkNotificationSchema.parse(req.body);

    const result = await notificationService.sendBulkNotification(
      userIds,
      title,
      body,
      data
    );

    return res.json({
      success: true,
      message: 'Notificações enviadas',
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      console.error('Erro ao enviar notificações em massa:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * POST /api/admin/notifications/schedule
 * Agendar notificação para envio futuro
 */
router.post('/admin/schedule', authenticateAdmin, async (req, res) => {
  try {
    const { userId, ...notificationData } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    const { title, body, scheduledAt, data } = scheduleNotificationSchema.parse(notificationData);

    const notificationId = await notificationService.scheduleNotification(
      userId,
      title,
      body,
      new Date(scheduledAt),
      data
    );

    return res.json({
      success: true,
      message: 'Notificação agendada',
      data: { notificationId }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors
      });
    } else {
      console.error('Erro ao agendar notificação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
});

/**
 * GET /api/admin/notifications/templates
 * Listar templates de notificação
 */
router.get('/admin/templates', authenticateAdmin, async (req, res) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/admin/notifications/templates
 * Criar novo template de notificação
 */
router.post('/admin/templates', authenticateAdmin, async (req, res) => {
  try {
    const { name, type, subject, body, variables } = req.body;

    if (!name || !type || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        type,
        subject,
        body,
        variables: variables || []
      }
    });

    return res.json({
      success: true,
      message: 'Template criado com sucesso',
      data: template
    });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/admin/notifications/templates/:id
 * Atualizar template de notificação
 */
router.put('/admin/templates/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, subject, body, variables, isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do template é obrigatório'
      });
    }

    const template = await prisma.notificationTemplate.update({
      where: { id: id as string },
      data: {
        name,
        type,
        subject,
        body,
        variables: variables || [],
        isActive
      }
    });

    return res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: template
    });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/admin/notifications/stats
 * Estatísticas de notificações
 */
router.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalNotifications,
      sentNotifications,
      failedNotifications,
      activeTokens,
      templatesCount
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'sent' } }),
      prisma.notification.count({ where: { status: 'failed' } }),
      prisma.deviceToken.count({ where: { isActive: true } }),
      prisma.notificationTemplate.count()
    ]);

    return res.json({
      success: true,
      data: {
        totalNotifications,
        sentNotifications,
        failedNotifications,
        successRate: totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0,
        activeTokens,
        templatesCount
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router; 