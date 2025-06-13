import { Request, Response, NextFunction } from 'express';
import { authenticateUser, authenticateAdmin, requireActiveSubscription, checkBabyLimit } from '../src/middlewares/auth';
import { generateToken } from '../src/utils/jwt';

// Mock do Prisma
jest.mock('@/config/database', () => ({
  user: {
    findUnique: jest.fn(),
  },
  admin: {
    findUnique: jest.fn(),
  },
}));

// Mock do JWT utils
jest.mock('@/utils/jwt', () => ({
  verifyToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
  generateToken: jest.fn(),
}));

describe('Auth Middlewares', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authenticateUser', () => {
    const { verifyToken, extractTokenFromHeader } = require('@/utils/jwt');
    const prisma = require('@/config/database');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate valid user token', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890,
      };

      extractTokenFromHeader.mockReturnValue(mockToken);
      verifyToken.mockReturnValue(mockDecoded);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        email: 'user@example.com',
        isActive: true,
      });

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      await authenticateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(extractTokenFromHeader).toHaveBeenCalledWith(`Bearer ${mockToken}`);
      expect(verifyToken).toHaveBeenCalledWith(mockToken);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { id: true, email: true, isActive: true },
      });
      expect(mockRequest.user).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject admin token for user authentication', async () => {
      const mockToken = 'admin-token';
      const mockDecoded = {
        userId: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567890,
      };

      extractTokenFromHeader.mockReturnValue(mockToken);
      verifyToken.mockReturnValue(mockDecoded);

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      await authenticateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Acesso negado. Token de usuário necessário.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject inactive user', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890,
      };

      extractTokenFromHeader.mockReturnValue(mockToken);
      verifyToken.mockReturnValue(mockDecoded);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        email: 'user@example.com',
        isActive: false,
      });

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      await authenticateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não encontrado ou inativo.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      extractTokenFromHeader.mockReturnValue('invalid-token');
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      await authenticateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token inválido ou expirado.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authenticateAdmin', () => {
    const { verifyToken, extractTokenFromHeader } = require('@/utils/jwt');
    const prisma = require('@/config/database');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate valid admin token', async () => {
      const mockToken = 'valid-admin-token';
      const mockDecoded = {
        userId: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567890,
      };

      extractTokenFromHeader.mockReturnValue(mockToken);
      verifyToken.mockReturnValue(mockDecoded);
      prisma.admin.findUnique.mockResolvedValue({
        id: 'admin123',
        email: 'admin@example.com',
        isActive: true,
        role: 'admin',
      });

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      await authenticateAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(extractTokenFromHeader).toHaveBeenCalledWith(`Bearer ${mockToken}`);
      expect(verifyToken).toHaveBeenCalledWith(mockToken);
      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin123' },
        select: { id: true, email: true, isActive: true, role: true },
      });
      expect(mockRequest.admin).toEqual(mockDecoded);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user token for admin authentication', async () => {
      const mockToken = 'user-token';
      const mockDecoded = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890,
      };

      extractTokenFromHeader.mockReturnValue(mockToken);
      verifyToken.mockReturnValue(mockDecoded);

      mockRequest.headers = { authorization: `Bearer ${mockToken}` };

      await authenticateAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Acesso negado. Token de administrador necessário.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireActiveSubscription', () => {
    const prisma = require('@/config/database');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow access for user with active subscription', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user' as const,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.user = mockUser;
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        subscription: {
          status: 'active',
          plan: { name: 'Premium' },
        },
      });

      await requireActiveSubscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject user without subscription', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user' as const,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.user = mockUser;
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        subscription: null,
      });

      await requireActiveSubscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Assinatura ativa necessária para acessar este recurso.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated user', async () => {
      mockRequest.user = undefined as any;

      await requireActiveSubscription(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não autenticado.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkBabyLimit', () => {
    const prisma = require('@/config/database');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should allow access when user is under baby limit', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user' as const,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.user = mockUser;
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        plan: {
          name: 'Premium',
          userLimit: 3,
        },
        babies: [
          { id: 'baby1', isActive: true },
          { id: 'baby2', isActive: true },
        ],
      });

      await checkBabyLimit(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        include: {
          plan: true,
          babies: {
            where: { isActive: true },
          },
        },
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject when user reaches baby limit', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user' as const,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.user = mockUser;
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        plan: {
          name: 'Básico',
          userLimit: 1,
        },
        babies: [
          { id: 'baby1', isActive: true },
        ],
      });

      await checkBabyLimit(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Limite de 1 bebê(s) atingido para o plano Básico.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject user without plan', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'user@example.com',
        role: 'user' as const,
        iat: 1234567890,
        exp: 1234567890,
      };

      mockRequest.user = mockUser;
      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        plan: null,
        babies: [],
      });

      await checkBabyLimit(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Plano necessário para adicionar bebês.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 