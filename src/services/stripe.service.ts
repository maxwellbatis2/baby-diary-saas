import Stripe from 'stripe';
import prisma from '@/config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export class StripeService {
  // Criar produto no Stripe
  async createProduct(name: string, description?: string) {
    try {
      const product = await stripe.products.create({
        name,
        description,
      });
      return product;
    } catch (error) {
      console.error('Erro ao criar produto no Stripe:', error);
      throw error;
    }
  }

  // Criar preço no Stripe
  async createPrice(productId: string, amount: number, currency: string = 'brl', interval: 'month' | 'year' = 'month') {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        recurring: {
          interval,
        },
      });
      return price;
    } catch (error) {
      console.error('Erro ao criar preço no Stripe:', error);
      throw error;
    }
  }

  // Criar cliente no Stripe
  async createCustomer(email: string, name?: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error('Erro ao criar cliente no Stripe:', error);
      throw error;
    }
  }

  // Criar sessão de checkout
  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });
      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw error;
    }
  }

  // Criar sessão de checkout para plano específico
  async createPlanCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar plano
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error('Plano não encontrado');
      }

      // Criar ou buscar cliente no Stripe
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user.email, user.name || undefined);
        customerId = customer.id;
        
        // Atualizar usuário com o ID do cliente
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Criar sessão de checkout
      const session = await this.createCheckoutSession(
        customerId,
        plan.stripePriceId,
        successUrl,
        cancelUrl
      );

      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout do plano:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    try {
      if (cancelAtPeriodEnd) {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        return subscription;
      } else {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        return subscription;
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Atualizar assinatura
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  }

  // Buscar assinatura
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  // Processar webhook
  async processWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        
        default:
          console.log(`Evento não tratado: ${event.type}`);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  // Handlers de webhook
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
      if (!session.customer || !session.subscription) {
        return;
      }

      // Buscar usuário pelo customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: session.customer as string },
      });

      if (!user) {
        console.error('Usuário não encontrado para o customer ID:', session.customer);
        return;
      }

      // Buscar plano pelo price ID
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const plan = await prisma.plan.findFirst({
        where: { stripePriceId: subscription.items.data[0].price.id },
      });

      if (!plan) {
        console.error('Plano não encontrado para o price ID:', subscription.items.data[0].price.id);
        return;
      }

      // Criar ou atualizar assinatura no banco
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          planId: plan.id,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          userId: user.id,
          planId: plan.id,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      // Atualizar usuário com o plano
      await prisma.user.update({
        where: { id: user.id },
        data: { planId: plan.id },
      });

      console.log(`Assinatura criada para usuário ${user.email} - Plano: ${plan.name}`);
    } catch (error) {
      console.error('Erro ao processar checkout session completed:', error);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      // Buscar usuário pelo customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      });

      if (!user) {
        console.error('Usuário não encontrado para o customer ID:', subscription.customer);
        return;
      }

      // Buscar plano pelo price ID
      const plan = await prisma.plan.findFirst({
        where: { stripePriceId: subscription.items.data[0].price.id },
      });

      if (!plan) {
        console.error('Plano não encontrado para o price ID:', subscription.items.data[0].price.id);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          userId: user.id,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`Assinatura criada para usuário ${user.email} - Status: ${subscription.status}`);
    } catch (error) {
      console.error('Erro ao processar subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', subscription.id);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      console.log(`Assinatura atualizada: ${subscription.id} - Status: ${subscription.status}`);
    } catch (error) {
      console.error('Erro ao processar subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', subscription.id);
        return;
      }

      // Atualizar assinatura como cancelada
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'canceled',
          cancelAtPeriodEnd: false,
        },
      });

      // Remover plano do usuário
      await prisma.user.update({
        where: { id: dbSubscription.userId },
        data: { planId: null },
      });

      console.log(`Assinatura cancelada: ${subscription.id}`);
    } catch (error) {
      console.error('Erro ao processar subscription deleted:', error);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        return;
      }

      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', invoice.subscription);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'active',
        },
      });

      console.log(`Pagamento realizado com sucesso para assinatura: ${invoice.subscription}`);
    } catch (error) {
      console.error('Erro ao processar invoice payment succeeded:', error);
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
      if (!invoice.subscription) {
        return;
      }

      // Buscar assinatura no banco
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: invoice.subscription as string },
      });

      if (!dbSubscription) {
        console.error('Assinatura não encontrada no banco:', invoice.subscription);
        return;
      }

      // Atualizar assinatura
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: 'past_due',
        },
      });

      console.log(`Pagamento falhou para assinatura: ${invoice.subscription}`);
    } catch (error) {
      console.error('Erro ao processar invoice payment failed:', error);
    }
  }
}

export default new StripeService(); 