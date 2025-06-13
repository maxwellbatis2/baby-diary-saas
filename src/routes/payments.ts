import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { createCheckoutSession, cancelSubscription, getSubscription } from '@/config/stripe';
import stripe from '@/config/stripe';

const router = Router();

// Validações para checkout
const checkoutValidation = [
  body('planId')
    .notEmpty()
    .withMessage('ID do plano é obrigatório'),
  body('successUrl')
    .isURL()
    .withMessage('URL de sucesso deve ser uma URL válida'),
  body('cancelUrl')
    .isURL()
    .withMessage('URL de cancelamento deve ser uma URL válida'),
];

// Criar sessão de checkout
router.post('/create-checkout-session', checkoutValidation, async (req: Request, res: Response) => {
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

    const { planId, successUrl, cancelUrl } = req.body;

    // Buscar o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado ou inativo',
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Criar sessão de checkout
    const session = await createCheckoutSession(
      plan.stripePriceId,
      user.email,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
        planId: plan.id,
      }
    );

    return res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
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

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

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

// Cancelar assinatura
router.post('/cancel-subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Cancelar no Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Atualizar no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: req.user.userId },
      data: {
        cancelAtPeriodEnd: true,
      },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      data: updatedSubscription,
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Reativar assinatura
router.post('/reactivate-subscription', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId },
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Reativar no Stripe
    await cancelSubscription(subscription.stripeSubscriptionId, false);

    // Atualizar no banco
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: req.user.userId },
      data: {
        cancelAtPeriodEnd: false,
      },
      include: {
        plan: true,
      },
    });

    return res.json({
      success: true,
      message: 'Assinatura reativada com sucesso',
      data: updatedSubscription,
    });
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Histórico de pagamentos
router.get('/payment-history', async (req: Request, res: Response) => {
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

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma assinatura encontrada',
      });
    }

    // Buscar histórico de pagamentos no Stripe
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Stripe não configurado',
      });
    }

    const payments = await stripe.invoices.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 10,
    });

    return res.json({
      success: true,
      data: {
        subscription,
        payments: payments.data,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

export default router; 