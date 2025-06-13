import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AIController {
  
  // Análise de padrões de sono
  async analyzeSleepPattern(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { babyId } = req.params;
      const { days = 30 } = req.query;

      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        return res.status(404).json({ error: 'Bebê não encontrado' });
      }

      // Buscar registros de sono dos últimos dias
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const sleepRecords = await prisma.sleepRecord.findMany({
        where: {
          babyId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (sleepRecords.length === 0) {
        return res.status(400).json({ 
          error: 'Não há registros de sono suficientes para análise' 
        });
      }

      // Calcular métricas básicas
      const totalDuration = sleepRecords.reduce((sum, record) => {
        return sum + (record.duration || 0);
      }, 0);

      const averageDuration = totalDuration / sleepRecords.length;
      const qualityCounts = sleepRecords.reduce((acc, record) => {
        const quality = record.quality || 'unknown';
        acc[quality] = (acc[quality] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const overallQuality = Object.keys(qualityCounts).reduce((best, quality) => {
        return qualityCounts[quality] > (qualityCounts[best] || 0) ? quality : best;
      }, 'unknown');

      // Calcular idade do bebê em meses
      const babyAge = Math.floor(
        (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
        (1000 * 60 * 60 * 24 * 30.44)
      );

      const sleepData = {
        babyAge,
        sleepRecords: sleepRecords.map(record => ({
          date: record.createdAt,
          duration: record.duration,
          quality: record.quality,
          startTime: record.startTime,
          endTime: record.endTime
        })),
        averageDuration: Math.round(averageDuration),
        overallQuality,
        qualityDistribution: qualityCounts
      };

      const analysis = await aiService.analyzeSleepPattern(userId, sleepData);

      res.json({
        success: true,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        metrics: {
          totalRecords: sleepRecords.length,
          averageDuration: Math.round(averageDuration),
          qualityDistribution: qualityCounts
        },
        tokensUsed: analysis.tokensUsed
      });
    } catch (error) {
      console.error('Erro na análise de sono:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Dicas de alimentação personalizadas
  async getFeedingTips(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { babyId } = req.params;

      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        return res.status(404).json({ error: 'Bebê não encontrado' });
      }

      // Buscar histórico de alimentação
      const feedingRecords = await prisma.feedingRecord.findMany({
        where: { babyId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Calcular idade do bebê em meses
      const babyAge = Math.floor(
        (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
        (1000 * 60 * 60 * 24 * 30.44)
      );

      // Determinar tipo de alimentação atual
      const recentFeedings = feedingRecords.slice(0, 10);
      const feedingTypes = recentFeedings.map(f => f.type);
      const currentFeedingType = feedingTypes.length > 0 ? 
        feedingTypes.reduce((prev, curr) => 
          feedingTypes.filter(type => type === prev).length >= 
          feedingTypes.filter(type => type === curr).length ? prev : curr
        ) : 'breast';

      const feedingData = {
        babyAge,
        feedingType: currentFeedingType,
        feedingHistory: feedingRecords.map(record => ({
          type: record.type,
          amount: record.amount,
          duration: record.duration,
          date: record.createdAt,
          foodType: record.foodType,
          reaction: record.reaction
        })),
        preferences: this.extractFeedingPreferences(feedingRecords),
        issues: this.identifyFeedingIssues(feedingRecords)
      };

      const tips = await aiService.getFeedingTips(userId, feedingData);

      res.json({
        success: true,
        tips: tips.tips,
        nextSteps: tips.nextSteps,
        context: {
          babyAge,
          currentFeedingType,
          totalRecords: feedingRecords.length
        },
        tokensUsed: tips.tokensUsed
      });
    } catch (error) {
      console.error('Erro ao obter dicas de alimentação:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Previsão de marcos de desenvolvimento
  async predictMilestones(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { babyId } = req.params;

      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        return res.status(404).json({ error: 'Bebê não encontrado' });
      }

      // Buscar marcos já alcançados
      const achievedMilestones = await prisma.milestone.findMany({
        where: { babyId },
        orderBy: { date: 'asc' }
      });

      // Calcular idade do bebê em meses
      const babyAge = Math.floor(
        (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
        (1000 * 60 * 60 * 24 * 30.44)
      );

      // Buscar atividades recentes para contexto
      const recentActivities = await prisma.activity.findMany({
        where: { babyId },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      const babyData = {
        age: babyAge,
        achievedMilestones: achievedMilestones.map(milestone => ({
          title: milestone.title,
          category: milestone.category,
          date: milestone.date,
          isPredicted: milestone.isPredicted
        })),
        currentDevelopment: {
          recentActivities: recentActivities.length,
          activityTypes: [...new Set(recentActivities.map(a => a.type))],
          lastMilestone: achievedMilestones.length > 0 ? 
            achievedMilestones[achievedMilestones.length - 1] : null
        },
        familyHistory: null // Seria preenchido com dados do usuário se disponível
      };

      const predictions = await aiService.predictMilestones(userId, babyData);

      res.json({
        success: true,
        predictions: predictions.predictions,
        timeline: predictions.timeline,
        context: {
          babyAge,
          achievedMilestones: achievedMilestones.length,
          recentActivity: recentActivities.length
        },
        tokensUsed: predictions.tokensUsed
      });
    } catch (error) {
      console.error('Erro na previsão de marcos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Interpretação de choro
  async interpretCry(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { babyId } = req.params;
      const { 
        duration, 
        timeOfDay, 
        context, 
        observedSigns 
      } = req.body;

      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        return res.status(404).json({ error: 'Bebê não encontrado' });
      }

      // Buscar dados recentes do bebê
      const lastFeeding = await prisma.feedingRecord.findFirst({
        where: { babyId },
        orderBy: { createdAt: 'desc' }
      });

      const lastDiaperChange = await prisma.diaperRecord.findFirst({
        where: { babyId },
        orderBy: { createdAt: 'desc' }
      });

      const lastSleep = await prisma.sleepRecord.findFirst({
        where: { babyId },
        orderBy: { createdAt: 'desc' }
      });

      // Calcular idade do bebê em meses
      const babyAge = Math.floor(
        (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
        (1000 * 60 * 60 * 24 * 30.44)
      );

      const cryData = {
        babyAge,
        duration: duration || 0,
        timeOfDay: timeOfDay || new Date().toLocaleTimeString(),
        context: context || 'Choro observado',
        lastFeeding: lastFeeding ? {
          time: lastFeeding.createdAt,
          type: lastFeeding.type,
          amount: lastFeeding.amount
        } : null,
        lastDiaperChange: lastDiaperChange ? {
          time: lastDiaperChange.createdAt,
          type: lastDiaperChange.type
        } : null,
        lastSleep: lastSleep ? {
          time: lastSleep.createdAt,
          duration: lastSleep.duration,
          quality: lastSleep.quality
        } : null,
        observedSigns: observedSigns || []
      };

      const interpretation = await aiService.interpretCry(userId, cryData);

      res.json({
        success: true,
        interpretation: interpretation.interpretation,
        urgency: interpretation.urgency,
        context: {
          babyAge,
          cryDuration: duration,
          timeOfDay
        },
        tokensUsed: interpretation.tokensUsed
      });
    } catch (error) {
      console.error('Erro na interpretação do choro:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Conselhos personalizados
  async getPersonalizedAdvice(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { question } = req.body;
      const { babyId } = req.params;

      if (!question) {
        return res.status(400).json({ error: 'Pergunta é obrigatória' });
      }

      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        return res.status(404).json({ error: 'Bebê não encontrado' });
      }

      // Buscar dados recentes para contexto
      const recentActivities = await prisma.activity.findMany({
        where: { babyId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const recentMemories = await prisma.memory.findMany({
        where: { babyId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const recentMilestones = await prisma.milestone.findMany({
        where: { babyId },
        orderBy: { date: 'desc' },
        take: 5
      });

      // Calcular idade do bebê em meses
      const babyAge = Math.floor(
        (new Date().getTime() - new Date(baby.birthDate).getTime()) / 
        (1000 * 60 * 60 * 24 * 30.44)
      );

      const context = {
        babyAge,
        recentHistory: {
          activities: recentActivities.length,
          memories: recentMemories.length,
          milestones: recentMilestones.length,
          lastActivity: recentActivities[0]?.type || null,
          lastMilestone: recentMilestones[0]?.title || null
        },
        concerns: question.toLowerCase().includes('problema') || 
                 question.toLowerCase().includes('preocupação') ||
                 question.toLowerCase().includes('dificuldade'),
        currentSituation: {
          babyName: baby.name,
          babyGender: baby.gender,
          totalActivities: recentActivities.length
        }
      };

      const advice = await aiService.getPersonalizedAdvice(userId, question, context);

      res.json({
        success: true,
        advice: advice.advice,
        context: {
          babyAge,
          questionType: context.concerns ? 'preocupação' : 'consulta',
          recentActivity: recentActivities.length
        },
        tokensUsed: advice.tokensUsed
      });
    } catch (error) {
      console.error('Erro ao obter conselho personalizado:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Estatísticas de uso da IA
  async getAIUsageStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const stats = await aiService.getAIUsageStats(userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de IA:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Métodos auxiliares
  private extractFeedingPreferences(feedingRecords: any[]): string[] {
    const preferences = [];
    
    // Analisar tipos de alimento preferidos
    const foodTypes = feedingRecords
      .filter(record => record.foodType)
      .map(record => record.foodType);
    
    const foodTypeCounts = foodTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const preferredFoods = Object.entries(foodTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    if (preferredFoods.length > 0) {
      preferences.push(`Prefere: ${preferredFoods.join(', ')}`);
    }

    // Analisar reações
    const positiveReactions = feedingRecords
      .filter(record => record.reaction && 
        ['good', 'excellent', 'positive'].includes(record.reaction.toLowerCase()))
      .length;

    if (positiveReactions > feedingRecords.length * 0.7) {
      preferences.push('Geralmente reage bem à alimentação');
    }

    return preferences;
  }

  private identifyFeedingIssues(feedingRecords: any[]): string[] {
    const issues = [];
    
    // Verificar recusas
    const refusals = feedingRecords
      .filter(record => record.reaction && 
        ['refused', 'rejected', 'negative'].includes(record.reaction.toLowerCase()))
      .length;

    if (refusals > feedingRecords.length * 0.3) {
      issues.push('Frequentes recusas de alimentação');
    }

    // Verificar problemas de quantidade
    const lowAmounts = feedingRecords
      .filter(record => record.amount && record.amount < 50)
      .length;

    if (lowAmounts > feedingRecords.length * 0.5) {
      issues.push('Baixa ingestão de alimentos');
    }

    return issues;
  }
}

export default new AIController(); 