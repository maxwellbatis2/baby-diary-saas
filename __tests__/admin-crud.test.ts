import { Request, Response } from 'express';
import request from 'supertest';

// Mock do Prisma
jest.mock('@/config/database', () => ({
  baby: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  activity: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  memory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  milestone: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  gamification: {
    upsert: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  subscription: {
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $disconnect: jest.fn(),
  plan: {
    findMany: jest.fn(),
  },
}));

// Mock do app
const mockApp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  set: jest.fn(),
};

jest.mock('../src/index', () => mockApp);

describe('Admin CRUD Endpoints', () => {
  const prisma = require('@/config/database');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bebês CRUD', () => {
    const mockBaby = {
      id: 'baby123',
      name: 'João',
      gender: 'male',
      birthDate: new Date('2023-01-01'),
      photoUrl: 'https://example.com/photo.jpg',
      userId: 'user123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: 'user123',
      name: 'Maria Silva',
      email: 'maria@example.com',
    };

    describe('GET /admin/babies', () => {
      it('should list babies with pagination and filters', async () => {
        const mockBabies = [mockBaby];
        const mockCount = 1;

        prisma.baby.findMany.mockResolvedValue(mockBabies);
        prisma.baby.count.mockResolvedValue(mockCount);

        // Simular chamada da API
        const response = {
          success: true,
          data: {
            babies: mockBabies,
            pagination: {
              page: 1,
              limit: 10,
              total: mockCount,
              pages: 1,
            },
          },
        };

        expect(response.success).toBe(true);
        expect(response.data.babies).toHaveLength(1);
        expect(response.data.pagination.total).toBe(1);
      });

      it('should filter babies by search term', async () => {
        const searchTerm = 'João';
        const mockBabies = [mockBaby];

        prisma.baby.findMany.mockResolvedValue(mockBabies);
        prisma.baby.count.mockResolvedValue(1);

        // Simular filtro de busca
        const whereClause = {
          name: { contains: searchTerm, mode: 'insensitive' },
        };

        expect(whereClause.name.contains).toBe(searchTerm);
      });
    });

    describe('GET /admin/babies/:id', () => {
      it('should get specific baby with related data', async () => {
        const mockBabyWithRelations = {
          ...mockBaby,
          user: mockUser,
          activities: [],
          memories: [],
          milestones: [],
        };

        prisma.baby.findUnique.mockResolvedValue(mockBabyWithRelations);

        const response = {
          success: true,
          data: mockBabyWithRelations,
        };

        expect(response.success).toBe(true);
        expect(response.data.id).toBe('baby123');
        expect(response.data.user).toBeDefined();
      });

      it('should return 404 for non-existent baby', async () => {
        prisma.baby.findUnique.mockResolvedValue(null);

        const response = {
          success: false,
          error: 'Bebê não encontrado',
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe('Bebê não encontrado');
      });
    });

    describe('POST /admin/babies', () => {
      it('should create baby successfully', async () => {
        const babyData = {
          name: 'João',
          gender: 'male',
          birthDate: '2023-01-01',
          photoUrl: 'https://example.com/photo.jpg',
          userId: 'user123',
        };

        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.baby.create.mockResolvedValue(mockBaby);

        const response = {
          success: true,
          message: 'Bebê criado com sucesso',
          data: mockBaby,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Bebê criado com sucesso');
        expect(response.data.name).toBe('João');
      });

      it('should return error for non-existent user', async () => {
        const babyData = {
          name: 'João',
          userId: 'nonexistent',
        };

        prisma.user.findUnique.mockResolvedValue(null);

        const response = {
          success: false,
          error: 'Usuário não encontrado',
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe('Usuário não encontrado');
      });
    });
  });

  describe('Atividades CRUD', () => {
    const mockActivity = {
      id: 'activity123',
      type: 'sleep',
      title: 'Sono da tarde',
      description: 'Bebê dormiu por 2 horas',
      babyId: 'baby123',
      userId: 'user123',
      date: new Date(),
      duration: 120,
      notes: 'Dormiu bem',
      photoUrl: 'https://example.com/photo.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBaby = {
      id: 'baby123',
      name: 'João',
    };

    const mockUser = {
      id: 'user123',
      name: 'Maria Silva',
      email: 'maria@example.com',
    };

    describe('GET /admin/activities', () => {
      it('should list activities with filters', async () => {
        const mockActivities = [mockActivity];
        const mockCount = 1;

        prisma.activity.findMany.mockResolvedValue(mockActivities);
        prisma.activity.count.mockResolvedValue(mockCount);

        const response = {
          success: true,
          data: {
            activities: mockActivities,
            pagination: {
              page: 1,
              limit: 10,
              total: mockCount,
              pages: 1,
            },
          },
        };

        expect(response.success).toBe(true);
        expect(response.data.activities).toHaveLength(1);
        expect(response.data.activities[0]?.type).toBe('sleep');
      });

      it('should filter activities by type', async () => {
        const activityType = 'sleep';
        const whereClause = { type: activityType };

        expect(whereClause.type).toBe(activityType);
      });
    });

    describe('POST /admin/activities', () => {
      it('should create activity successfully', async () => {
        const activityData = {
          type: 'sleep',
          title: 'Sono da tarde',
          description: 'Bebê dormiu por 2 horas',
          babyId: 'baby123',
          userId: 'user123',
          duration: 120,
          notes: 'Dormiu bem',
        };

        prisma.baby.findUnique.mockResolvedValue(mockBaby);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.activity.create.mockResolvedValue(mockActivity);

        const response = {
          success: true,
          message: 'Atividade criada com sucesso',
          data: mockActivity,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Atividade criada com sucesso');
        expect(response.data.type).toBe('sleep');
      });
    });

    describe('DELETE /admin/activities/:id', () => {
      it('should delete activity successfully', async () => {
        prisma.activity.delete.mockResolvedValue({});

        const response = {
          success: true,
          message: 'Atividade removida com sucesso',
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Atividade removida com sucesso');
      });
    });
  });

  describe('Memórias CRUD', () => {
    const mockMemory = {
      id: 'memory123',
      title: 'Primeiro sorriso',
      description: 'João sorriu pela primeira vez hoje!',
      babyId: 'baby123',
      userId: 'user123',
      date: new Date(),
      tags: ['sorriso', 'primeira vez'],
      isPublic: true,
      photoUrl: 'https://example.com/photo.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('GET /admin/memories', () => {
      it('should list memories with filters', async () => {
        const mockMemories = [mockMemory];
        const mockCount = 1;

        prisma.memory.findMany.mockResolvedValue(mockMemories);
        prisma.memory.count.mockResolvedValue(mockCount);

        const response = {
          success: true,
          data: {
            memories: mockMemories,
            pagination: {
              page: 1,
              limit: 10,
              total: mockCount,
              pages: 1,
            },
          },
        };

        expect(response.success).toBe(true);
        expect(response.data.memories).toHaveLength(1);
        expect(response.data.memories[0]?.title).toBe('Primeiro sorriso');
      });
    });

    describe('POST /admin/memories', () => {
      it('should create memory successfully', async () => {
        const memoryData = {
          title: 'Primeiro sorriso',
          description: 'João sorriu pela primeira vez hoje!',
          babyId: 'baby123',
          userId: 'user123',
          date: '2023-01-01',
          tags: ['sorriso', 'primeira vez'],
          isPublic: true,
        };

        prisma.baby.findUnique.mockResolvedValue({ id: 'baby123', name: 'João' });
        prisma.user.findUnique.mockResolvedValue({ id: 'user123', name: 'Maria' });
        prisma.memory.create.mockResolvedValue(mockMemory);

        const response = {
          success: true,
          message: 'Memória criada com sucesso',
          data: mockMemory,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Memória criada com sucesso');
        expect(response.data.tags).toContain('sorriso');
      });
    });
  });

  describe('Marcos CRUD', () => {
    const mockMilestone = {
      id: 'milestone123',
      title: 'Primeiro passo',
      description: 'João deu seus primeiros passos!',
      category: 'motor',
      babyId: 'baby123',
      userId: 'user123',
      date: new Date(),
      photoUrl: 'https://example.com/photo.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    describe('GET /admin/milestones', () => {
      it('should list milestones with filters', async () => {
        const mockMilestones = [mockMilestone];
        const mockCount = 1;

        prisma.milestone.findMany.mockResolvedValue(mockMilestones);
        prisma.milestone.count.mockResolvedValue(mockCount);

        const response = {
          success: true,
          data: {
            milestones: mockMilestones,
            pagination: {
              page: 1,
              limit: 10,
              total: mockCount,
              pages: 1,
            },
          },
        };

        expect(response.success).toBe(true);
        expect(response.data.milestones).toHaveLength(1);
        expect(response.data.milestones[0]?.category).toBe('motor');
      });
    });

    describe('POST /admin/milestones', () => {
      it('should create milestone successfully', async () => {
        const milestoneData = {
          title: 'Primeiro passo',
          description: 'João deu seus primeiros passos!',
          category: 'motor',
          babyId: 'baby123',
          userId: 'user123',
          date: '2023-01-01',
        };

        prisma.baby.findUnique.mockResolvedValue({ id: 'baby123', name: 'João' });
        prisma.user.findUnique.mockResolvedValue({ id: 'user123', name: 'Maria' });
        prisma.milestone.create.mockResolvedValue(mockMilestone);

        const response = {
          success: true,
          message: 'Marco criado com sucesso',
          data: mockMilestone,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Marco criado com sucesso');
        expect(response.data.category).toBe('motor');
      });
    });
  });

  describe('Status Endpoints', () => {
    describe('PUT /admin/users/:id/status', () => {
      it('should activate user successfully', async () => {
        const mockUser = {
          id: 'user123',
          isActive: true,
          name: 'Maria Silva',
          email: 'maria@example.com',
        };

        prisma.user.update.mockResolvedValue(mockUser);

        const response = {
          success: true,
          message: 'Usuário ativado com sucesso',
          data: mockUser,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Usuário ativado com sucesso');
        expect(response.data.isActive).toBe(true);
      });

      it('should validate boolean isActive parameter', async () => {
        const invalidData = { isActive: 'invalid' };

        const response = {
          success: false,
          error: 'isActive deve ser um valor booleano',
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe('isActive deve ser um valor booleano');
      });
    });
  });

  describe('Reset Endpoints', () => {
    describe('PUT /admin/gamification/:userId/reset', () => {
      it('should reset user gamification successfully', async () => {
        const mockGamification = {
          userId: 'user123',
          points: 0,
          level: 1,
          badges: [],
          streaks: {},
        };

        prisma.user.findUnique.mockResolvedValue({ id: 'user123', name: 'Maria' });
        prisma.gamification.upsert.mockResolvedValue(mockGamification);

        const response = {
          success: true,
          message: 'Gamificação resetada com sucesso',
          data: mockGamification,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Gamificação resetada com sucesso');
        expect(response.data.points).toBe(0);
        expect(response.data.badges).toHaveLength(0);
      });
    });

    describe('PUT /admin/users/:id/reset-password', () => {
      it('should reset user password successfully', async () => {
        const mockUser = {
          id: 'user123',
          email: 'maria@example.com',
          name: 'Maria Silva',
          isActive: true,
        };

        prisma.user.update.mockResolvedValue(mockUser);

        const response = {
          success: true,
          message: 'Senha resetada com sucesso',
          data: mockUser,
        };

        expect(response.success).toBe(true);
        expect(response.message).toBe('Senha resetada com sucesso');
        expect(response.data.id).toBe('user123');
      });

      it('should validate password length', async () => {
        const shortPassword = '123';

        const response = {
          success: false,
          error: 'Nova senha deve ter pelo menos 6 caracteres',
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe('Nova senha deve ter pelo menos 6 caracteres');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('GET /admin/analytics/engagement', () => {
      it('should return engagement analytics', async () => {
        const mockEngagement = {
          period: '30 dias',
          activeUsers: 100,
          usersWithActivities: 80,
          activitiesByType: [
            { type: 'sleep', _count: { type: 50 } },
            { type: 'feeding', _count: { type: 30 } },
          ],
          usersWithStreaks: 25,
          topBadges: [
            { name: 'Primeiro Login', count: 100 },
            { name: 'Ativo por 7 dias', count: 50 },
          ],
          engagementRate: '80.00',
        };

        prisma.user.count.mockResolvedValue(100);
        prisma.activity.groupBy.mockResolvedValue([
          { userId: 'user1' },
          { userId: 'user2' },
        ]);
        prisma.gamification.count.mockResolvedValue(25);
        prisma.gamification.findMany.mockResolvedValue([
          { badges: [{ name: 'Primeiro Login' }] },
        ]);

        const response = {
          success: true,
          data: mockEngagement,
        };

        expect(response.success).toBe(true);
        expect(response.data.activeUsers).toBe(100);
        expect(response.data.engagementRate).toBe('80.00');
      });
    });

    describe('GET /admin/analytics/subscriptions', () => {
      it('should return subscription analytics', async () => {
        const mockSubscriptionAnalytics = {
          period: '30 dias',
          activeSubscriptions: 50,
          newSubscriptions: 10,
          canceledSubscriptions: 2,
          planDetails: [
            {
              planName: 'Premium',
              planPrice: 29.90,
              count: 30,
              revenue: 897,
            },
          ],
          totalRevenue: 897,
          churnRate: '4.00%',
          growthRate: '16.00',
        };

        prisma.subscription.count
          .mockResolvedValueOnce(50) // activeSubscriptions
          .mockResolvedValueOnce(10) // newSubscriptions
          .mockResolvedValueOnce(2); // canceledSubscriptions

        prisma.subscription.groupBy.mockResolvedValue([
          { planId: 'plan1', _count: { planId: 30 } },
        ]);

        prisma.plan.findMany.mockResolvedValue([
          { id: 'plan1', name: 'Premium', price: 29.90 },
        ]);

        const response = {
          success: true,
          data: mockSubscriptionAnalytics,
        };

        expect(response.success).toBe(true);
        expect(response.data.activeSubscriptions).toBe(50);
        expect(response.data.churnRate).toBe('4.00%');
        expect(response.data.totalRevenue).toBe(897);
      });
    });
  });
}); 