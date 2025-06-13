import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/bcrypt';
import { generateUserToken, generateAdminToken } from '@/utils/jwt';
import { AuthRequest, RegisterRequest, AuthResponse, ApiResponse, User } from '@/types';

// Validações para registro
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres'),
];

// Validações para login
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

// Registrar novo usuário
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
      return;
    }

    const { name, email, password }: RegisterRequest = req.body;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email já cadastrado',
      });
      return;
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Senha não atende aos requisitos de segurança',
        details: passwordValidation.errors,
      });
      return;
    }

    // Buscar o plano gratuito (Básico)
    const basicPlan = await prisma.plan.findUnique({
      where: { stripePriceId: 'price_basic_free' },
    });

    if (!basicPlan) {
      res.status(500).json({
        success: false,
        error: 'Plano gratuito não encontrado',
      });
      return;
    }

    // Fazer hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário com plano gratuito atribuído
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
        emailVerified: false,
        planId: basicPlan.id, // Atribuir plano gratuito automaticamente
        gamification: {
          create: {
            points: 0,
            level: 1,
            badges: [],
            streaks: {},
          },
        },
      },
      include: {
        plan: true,
        gamification: true,
      },
    });

    // Gerar token
    const token = generateUserToken(user.id, user.email);

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword as unknown as Omit<User, 'password'>,
      token,
    };

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso - Plano Básico gratuito ativado!',
      data: response,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
      return;
    }

    const { email, password }: AuthRequest = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
        subscription: true,
        gamification: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Conta desativada',
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Gerar token
    const token = generateUserToken(user.id, user.email);

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword as unknown as Omit<User, 'password'>,
      token,
    };

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: response,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Login de administrador
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
      return;
    }

    const { email, password }: AuthRequest = req.body;

    // Buscar administrador
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Verificar se o admin está ativo
    if (!admin.isActive) {
      res.status(401).json({
        success: false,
        error: 'Conta desativada',
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Gerar token
    const token = generateAdminToken(admin.id, admin.email);

    // Remover senha do objeto de resposta
    const { password: _, ...adminWithoutPassword } = admin;

    // Criar resposta específica para admin
    const response = {
      user: {
        ...adminWithoutPassword,
        emailVerified: true, // Admin sempre tem email verificado
      } as Omit<User, 'password'>,
      token,
    };

    res.status(200).json({
      success: true,
      message: 'Login de administrador realizado com sucesso',
      data: response,
    });
  } catch (error) {
    console.error('Erro no login de admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Obter perfil do usuário logado
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        subscription: true,
        gamification: true,
        babies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    const { name, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    const updateData: any = {};

    // Atualizar nome se fornecido
    if (name) {
      updateData.name = name;
    }

    // Atualizar senha se fornecida
    if (currentPassword && newPassword) {
      // Verificar senha atual
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Senha atual incorreta',
        });
        return;
      }

      // Validar nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Nova senha não atende aos requisitos de segurança',
          details: passwordValidation.errors,
        });
        return;
      }

      // Fazer hash da nova senha
      updateData.password = await hashPassword(newPassword);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
}; 