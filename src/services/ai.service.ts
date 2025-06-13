import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface AIRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }
  }

  private async makeRequest(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(this.baseUrl, request, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 30000, // 30 segundos
      });

      return response.data;
    } catch (error) {
      console.error('Erro na requisição para Groq:', error);
      throw new Error('Falha na comunicação com a IA');
    }
  }

  private async logInteraction(
    userId: string,
    type: string,
    input: any,
    output: any,
    model: string,
    tokensUsed?: number,
    cost?: number
  ) {
    try {
      await prisma.aIInteraction.create({
        data: {
          userId,
          type,
          input,
          output,
          model,
          tokensUsed,
          cost,
        },
      });
    } catch (error) {
      console.error('Erro ao logar interação com IA:', error);
    }
  }

  async analyzeSleepPattern(userId: string, sleepData: any) {
    const prompt = `
    Analise os padrões de sono do bebê e forneça insights personalizados.
    
    Dados do sono:
    - Idade do bebê: ${sleepData.babyAge} meses
    - Registros de sono: ${JSON.stringify(sleepData.sleepRecords)}
    - Duração média: ${sleepData.averageDuration} horas
    - Qualidade geral: ${sleepData.overallQuality}
    
    Forneça:
    1. Análise dos padrões atuais
    2. Sugestões para melhorar a qualidade do sono
    3. Expectativas para a idade do bebê
    4. Dicas práticas para os pais
    5. Sinais de alerta (se houver)
    
    Responda em português brasileiro de forma clara e acolhedora.
    `;

    const request: AIRequest = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em desenvolvimento infantil e sono de bebês. Forneça conselhos práticos e acolhedores baseados em evidências científicas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    try {
      const response = await this.makeRequest(request);
      const analysis = response.choices[0].message.content;

      await this.logInteraction(
        userId,
        'sleep_analysis',
        sleepData,
        { analysis },
        request.model,
        response.usage.total_tokens
      );

      return {
        analysis,
        tokensUsed: response.usage.total_tokens,
        recommendations: this.extractRecommendations(analysis)
      };
    } catch (error) {
      console.error('Erro na análise de sono:', error);
      throw new Error('Não foi possível analisar os padrões de sono');
    }
  }

  async getFeedingTips(userId: string, feedingData: any) {
    const prompt = `
    Forneça dicas personalizadas de alimentação para o bebê.
    
    Dados de alimentação:
    - Idade do bebê: ${feedingData.babyAge} meses
    - Tipo de alimentação atual: ${feedingData.feedingType}
    - Histórico de alimentação: ${JSON.stringify(feedingData.feedingHistory)}
    - Preferências observadas: ${feedingData.preferences}
    - Problemas enfrentados: ${feedingData.issues || 'Nenhum'}
    
    Forneça:
    1. Dicas específicas para a idade
    2. Sugestões de introdução alimentar (se aplicável)
    3. Sinais de que o bebê está pronto para novos alimentos
    4. Dicas para lidar com recusas
    5. Informações nutricionais importantes
    
    Responda em português brasileiro de forma prática e acolhedora.
    `;

    const request: AIRequest = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um nutricionista pediátrico especializado em alimentação infantil. Forneça conselhos práticos e seguros baseados em evidências científicas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    try {
      const response = await this.makeRequest(request);
      const tips = response.choices[0].message.content;

      await this.logInteraction(
        userId,
        'feeding_tips',
        feedingData,
        { tips },
        request.model,
        response.usage.total_tokens
      );

      return {
        tips,
        tokensUsed: response.usage.total_tokens,
        nextSteps: this.extractNextSteps(tips)
      };
    } catch (error) {
      console.error('Erro ao obter dicas de alimentação:', error);
      throw new Error('Não foi possível obter dicas de alimentação');
    }
  }

  async predictMilestones(userId: string, babyData: any) {
    const prompt = `
    Preveja os próximos marcos de desenvolvimento para o bebê.
    
    Dados do bebê:
    - Idade: ${babyData.age} meses
    - Marcos já alcançados: ${JSON.stringify(babyData.achievedMilestones)}
    - Desenvolvimento atual: ${JSON.stringify(babyData.currentDevelopment)}
    - Histórico familiar: ${babyData.familyHistory || 'Não informado'}
    
    Forneça:
    1. Próximos marcos esperados (próximos 1-3 meses)
    2. Sinais a observar
    3. Atividades para estimular o desenvolvimento
    4. Quando procurar um pediatra
    5. Variações normais no desenvolvimento
    
    Responda em português brasileiro de forma clara e tranquilizadora.
    `;

    const request: AIRequest = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um pediatra especializado em desenvolvimento infantil. Forneça previsões baseadas em evidências científicas, sempre lembrando que cada bebê se desenvolve no seu próprio ritmo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1000
    };

    try {
      const response = await this.makeRequest(request);
      const predictions = response.choices[0].message.content;

      await this.logInteraction(
        userId,
        'milestone_prediction',
        babyData,
        { predictions },
        request.model,
        response.usage.total_tokens
      );

      return {
        predictions,
        tokensUsed: response.usage.total_tokens,
        timeline: this.extractTimeline(predictions)
      };
    } catch (error) {
      console.error('Erro na previsão de marcos:', error);
      throw new Error('Não foi possível prever os próximos marcos');
    }
  }

  async interpretCry(userId: string, cryData: any) {
    const prompt = `
    Ajude a interpretar o choro do bebê baseado nos dados fornecidos.
    
    Dados do choro:
    - Idade do bebê: ${cryData.babyAge} meses
    - Duração do choro: ${cryData.duration} minutos
    - Horário: ${cryData.timeOfDay}
    - Contexto: ${cryData.context}
    - Última alimentação: ${cryData.lastFeeding}
    - Última troca de fralda: ${cryData.lastDiaperChange}
    - Último sono: ${cryData.lastSleep}
    - Sinais observados: ${cryData.observedSigns}
    
    Forneça:
    1. Possíveis causas do choro
    2. Sinais a observar
    3. Técnicas de acalmar
    4. Quando procurar ajuda médica
    5. Prevenção para o futuro
    
    Responda em português brasileiro de forma acolhedora e prática.
    `;

    const request: AIRequest = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em comportamento infantil e pediatria. Forneça interpretações baseadas em evidências científicas, sempre priorizando a segurança e bem-estar do bebê.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    try {
      const response = await this.makeRequest(request);
      const interpretation = response.choices[0].message.content;

      await this.logInteraction(
        userId,
        'cry_interpretation',
        cryData,
        { interpretation },
        request.model,
        response.usage.total_tokens
      );

      return {
        interpretation,
        tokensUsed: response.usage.total_tokens,
        urgency: this.assessUrgency(interpretation)
      };
    } catch (error) {
      console.error('Erro na interpretação do choro:', error);
      throw new Error('Não foi possível interpretar o choro');
    }
  }

  async getPersonalizedAdvice(userId: string, question: string, context: any) {
    const prompt = `
    Forneça conselhos personalizados baseados na pergunta e contexto fornecidos.
    
    Pergunta: ${question}
    
    Contexto:
    - Idade do bebê: ${context.babyAge} meses
    - Histórico recente: ${JSON.stringify(context.recentHistory)}
    - Preocupações específicas: ${context.concerns}
    - Situação atual: ${context.currentSituation}
    
    Forneça:
    1. Resposta direta à pergunta
    2. Contexto e explicações
    3. Dicas práticas
    4. Sinais de alerta (se aplicável)
    5. Próximos passos recomendados
    
    Responda em português brasileiro de forma clara, acolhedora e baseada em evidências científicas.
    `;

    const request: AIRequest = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um pediatra experiente e acolhedor. Forneça conselhos práticos e seguros, sempre priorizando o bem-estar da família e do bebê.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200
    };

    try {
      const response = await this.makeRequest(request);
      const advice = response.choices[0].message.content;

      await this.logInteraction(
        userId,
        'personalized_advice',
        { question, context },
        { advice },
        request.model,
        response.usage.total_tokens
      );

      return {
        advice,
        tokensUsed: response.usage.total_tokens
      };
    } catch (error) {
      console.error('Erro ao obter conselho personalizado:', error);
      throw new Error('Não foi possível fornecer conselho personalizado');
    }
  }

  // Métodos auxiliares para extrair informações estruturadas
  private extractRecommendations(analysis: string): string[] {
    const recommendations = analysis.match(/•\s*(.+)/g) || 
                          analysis.match(/\d+\.\s*(.+)/g) ||
                          analysis.match(/- (.+)/g);
    return recommendations ? recommendations.map(r => r.replace(/^[•\d\.\-\s]+/, '').trim()) : [];
  }

  private extractNextSteps(tips: string): string[] {
    const steps = tips.match(/próximos passos[:\s]*(.+)/i) ||
                 tips.match(/sugestões[:\s]*(.+)/i);
    return steps ? [steps[1].trim()] : [];
  }

  private extractTimeline(predictions: string): any {
    const timeline = {};
    const months = predictions.match(/(\d+)\s*meses?/g);
    if (months) {
      months.forEach(month => {
        const age = month.match(/(\d+)/)[1];
        timeline[age] = 'Marcos esperados';
      });
    }
    return timeline;
  }

  private assessUrgency(interpretation: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['emergência', 'urgente', 'imediatamente', 'hospital', 'médico'];
    const mediumKeywords = ['observar', 'atenção', 'cuidado'];
    
    const text = interpretation.toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  // Método para obter estatísticas de uso da IA
  async getAIUsageStats(userId: string) {
    try {
      const interactions = await prisma.aIInteraction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const stats = {
        totalInteractions: interactions.length,
        totalTokens: interactions.reduce((sum, i) => sum + (i.tokensUsed || 0), 0),
        byType: {} as Record<string, number>,
        recentUsage: interactions.slice(0, 10)
      };

      interactions.forEach(interaction => {
        stats.byType[interaction.type] = (stats.byType[interaction.type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de IA:', error);
      throw new Error('Não foi possível obter estatísticas de uso');
    }
  }
}

export default new AIService(); 