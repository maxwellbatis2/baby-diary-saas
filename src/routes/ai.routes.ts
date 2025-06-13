import { Router } from 'express';
import aiController from '../controllers/ai.controller';
import { isAuthenticated } from '../middlewares/auth';

const router = Router();

// Todas as rotas de IA requerem autenticação
router.use(isAuthenticated);

// Análise de padrões de sono
router.get('/babies/:babyId/sleep-analysis', aiController.analyzeSleepPattern);

// Dicas de alimentação personalizadas
router.get('/babies/:babyId/feeding-tips', aiController.getFeedingTips);

// Previsão de marcos de desenvolvimento
router.get('/babies/:babyId/milestone-predictions', aiController.predictMilestones);

// Interpretação de choro
router.post('/babies/:babyId/cry-interpretation', aiController.interpretCry);

// Conselhos personalizados
router.post('/babies/:babyId/personalized-advice', aiController.getPersonalizedAdvice);

// Estatísticas de uso da IA
router.get('/ai-usage-stats', aiController.getAIUsageStats);

export default router; 