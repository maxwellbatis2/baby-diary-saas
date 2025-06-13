import { GamificationService } from '../src/services/gamification';

describe('GamificationService', () => {
  describe('calculateLevel', () => {
    it('should calculate level 1 for 0 points', () => {
      expect(GamificationService.calculateLevel(0)).toBe(1);
    });

    it('should calculate level 2 for 100 points', () => {
      expect(GamificationService.calculateLevel(100)).toBe(2);
    });

    it('should calculate level 5 for 400 points', () => {
      expect(GamificationService.calculateLevel(400)).toBe(5);
    });

    it('should calculate level 10 for 900 points', () => {
      expect(GamificationService.calculateLevel(900)).toBe(10);
    });
  });

  describe('checkBadgeEligibility', () => {
    it('should award first_login badge for new user', () => {
      const newBadges = GamificationService.checkBadgeEligibility([], 0, 1);
      expect(newBadges).toContain('first_login');
    });

    it('should award level_5 badge when reaching level 5', () => {
      const newBadges = GamificationService.checkBadgeEligibility(['first_login'], 400, 5);
      expect(newBadges).toContain('level_5');
    });

    it('should award points_500 badge when reaching 500 points', () => {
      const newBadges = GamificationService.checkBadgeEligibility(['first_login'], 500, 6);
      expect(newBadges).toContain('points_500');
    });

    it('should award streak_7 badge for 7 day streak', () => {
      const newBadges = GamificationService.checkBadgeEligibility(['first_login'], 100, 2, 7);
      expect(newBadges).toContain('streak_7');
    });

    it('should not award duplicate badges', () => {
      const newBadges = GamificationService.checkBadgeEligibility(['first_login', 'level_5'], 400, 5);
      expect(newBadges).not.toContain('first_login');
      expect(newBadges).not.toContain('level_5');
    });

    it('should award multiple badges at once', () => {
      const newBadges = GamificationService.checkBadgeEligibility(['first_login'], 1000, 10, 30);
      expect(newBadges).toContain('level_10');
      expect(newBadges).toContain('points_1000');
      expect(newBadges).toContain('streak_30');
    });
  });

  describe('calculateActivityPoints', () => {
    it('should return correct points for login', () => {
      expect(GamificationService.calculateActivityPoints('login')).toBe(5);
    });

    it('should return correct points for register', () => {
      expect(GamificationService.calculateActivityPoints('register')).toBe(50);
    });

    it('should return correct points for baby_added', () => {
      expect(GamificationService.calculateActivityPoints('baby_added')).toBe(25);
    });

    it('should return correct points for memory_created', () => {
      expect(GamificationService.calculateActivityPoints('memory_created')).toBe(10);
    });

    it('should return correct points for milestone_achieved', () => {
      expect(GamificationService.calculateActivityPoints('milestone_achieved')).toBe(30);
    });

    it('should return correct points for photo_uploaded', () => {
      expect(GamificationService.calculateActivityPoints('photo_uploaded')).toBe(15);
    });

    it('should return correct points for streak_day', () => {
      expect(GamificationService.calculateActivityPoints('streak_day')).toBe(2);
    });

    it('should return 0 for unknown activity', () => {
      expect(GamificationService.calculateActivityPoints('unknown_activity')).toBe(0);
    });
  });

  describe('checkStreak', () => {
    it('should return 1 for same day login', () => {
      const today = new Date();
      expect(GamificationService.checkStreak(today, today)).toBe(1);
    });

    it('should return 1 for next day login', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const today = new Date();
      expect(GamificationService.checkStreak(yesterday, today)).toBe(1);
    });

    it('should return 0 for login after 2 days', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const today = new Date();
      expect(GamificationService.checkStreak(twoDaysAgo, today)).toBe(0);
    });
  });

  describe('applyRule', () => {
    const mockPlan = {
      id: 'plan123',
      name: 'Básico',
      price: 0,
      features: [],
      userLimit: 1,
      stripePriceId: 'stripe_123',
      users: [],
      subscriptions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      photoQuality: 'low' as 'low',
      familySharing: 1,
      exportFeatures: false,
      prioritySupport: false,
      isActive: true,
    };

    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      avatarUrl: '',
      isActive: true,
      emailVerified: false,
      planId: '',
      plan: mockPlan,
      subscription: null as any,
      gamification: null as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockGamification = {
      id: 'test-id',
      userId: 'user123',
      user: mockUser,
      points: 100,
      level: 2,
      badges: [
        { id: 'first_login', name: 'Primeiro Login', icon: 'login-icon', earnedAt: new Date() }
      ],
      streaks: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRule = {
      id: 'rule123',
      name: 'Login Diário',
      description: 'Login diário',
      points: 5,
      condition: 'daily_login',
      badgeIcon: 'login-icon',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should apply rule and return updated gamification', () => {
      const result = GamificationService.applyRule(mockGamification, mockRule);
      
      expect(result.points).toBe(105); // 100 + 5
      expect(result.level).toBe(2); // floor(105/100) + 1 = 2
      expect(result.badges).toContain('first_login');
      expect(result.newBadges).toEqual([]); // No new badges for this level
    });

    it('should apply rule and award new badges', () => {
      const highLevelGamification = {
        ...mockGamification,
        points: 500,
        level: 6,
        badges: [
          { id: 'first_login', name: 'Primeiro Login', icon: 'login-icon', earnedAt: new Date() }
        ],
      };

      const result = GamificationService.applyRule(highLevelGamification, mockRule);
      
      expect(result.points).toBe(505);
      expect(result.level).toBe(6);
      expect(result.badges).toContain('first_login');
      expect(result.badges).toContain('points_500');
      expect(result.newBadges).toContain('points_500');
    });
  });
}); 