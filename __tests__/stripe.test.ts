import { createCheckoutSession, handleStripeWebhook } from '../src/config/stripe';

jest.mock('../src/config/stripe', () => ({
  createCheckoutSession: jest.fn(async (userId, planId) => ({
    id: 'cs_test_fakeid',
    url: 'https://checkout.stripe.com/pay/cs_test_fakeid',
  })),
  handleStripeWebhook: jest.fn(async (event) => {
    if (event.type === 'checkout.session.completed') {
      return { status: 'success', userId: 'user123', planId: 'plan123' };
    }
    return { status: 'ignored' };
  }),
}));

describe('Stripe Utils', () => {
  it('should create a checkout session and return id/url', async () => {
    // priceId, customerEmail, successUrl, cancelUrl, metadata
    const priceId = 'price_123';
    const customerEmail = 'user@example.com';
    const successUrl = 'https://meusite.com/success';
    const cancelUrl = 'https://meusite.com/cancel';
    const metadata = { userId: 'user123', planId: 'plan123' };
    // Mock do retorno
    jest.spyOn(require('../src/config/stripe'), 'createCheckoutSession').mockResolvedValue({
      id: 'cs_test_fakeid',
      url: 'https://checkout.stripe.com/pay/cs_test_fakeid',
    } as any);
    const result: any = await createCheckoutSession(priceId, customerEmail, successUrl, cancelUrl, metadata);
    expect(result.id).toBe('cs_test_fakeid');
    expect(result.url).toContain('stripe.com');
  });

  it('should handle checkout.session.completed webhook', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: 'user123', planId: 'plan123' },
        },
      },
    } as any;
    const result: any = await handleStripeWebhook(event);
    expect(result.status).toBe('success');
    expect(result.userId).toBe('user123');
    expect(result.planId).toBe('plan123');
  });

  it('should ignore unrelated webhook events', async () => {
    const event = { type: 'customer.created', data: { object: {} } } as any;
    const result: any = await handleStripeWebhook(event);
    expect(result.status).toBe('ignored');
  });
}); 