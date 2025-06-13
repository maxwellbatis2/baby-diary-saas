import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import prisma from '@/config/database';
import { JWTPayload } from '@/types';

// Extender a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      admin?: JWTPayload;
    }
  }
}

// Middleware para autenticar usuário
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);

    if (decoded.role !== 'user') {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Token de usuário necessário.',
      });
      return;
    }

    // Verificar se o usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo.',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado.',
    });
  }
};

// Middleware para autenticar admin
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);

    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Token de administrador necessário.',
      });
      return;
    }

    // Verificar se o admin ainda existe e está ativo
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isActive: true, role: true },
    });

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        error: 'Administrador não encontrado ou inativo.',
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado.',
    });
  }
};

// Middleware para verificar se o usuário tem plano ativo
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user?.subscription || user.subscription.status !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Assinatura ativa necessária para acessar este recurso.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
};

// Middleware para verificar limite de bebês do plano
export const checkBabyLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        plan: true,
        babies: {
          where: { isActive: true },
        },
      },
    });

    if (!user?.plan) {
      res.status(403).json({
        success: false,
        error: 'Plano necessário para adicionar bebês.',
      });
      return;
    }

    if (user.babies.length >= user.plan.userLimit) {
      res.status(403).json({
        success: false,
        error: `Limite de ${user.plan.userLimit} bebê(s) atingido para o plano ${user.plan.name}.`,
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
};

// Middleware para verificar se o bebê pertence ao usuário
export const verifyBabyOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado.',
      });
      return;
    }

    const babyId = req.params.babyId || req.body.babyId;
    if (!babyId) {
      res.status(400).json({
        success: false,
        error: 'ID do bebê não fornecido.',
      });
      return;
    }

    const baby = await prisma.baby.findFirst({
      where: {
        id: babyId,
        userId: req.user.userId,
        isActive: true,
      },
    });

    if (!baby) {
      res.status(404).json({
        success: false,
        error: 'Bebê não encontrado ou não pertence ao usuário.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
}; 