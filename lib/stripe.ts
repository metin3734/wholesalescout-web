import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// Plan → Stripe Price ID mapping
export const PLAN_PRICE_MAP: Record<string, { priceId: string; credits: number; limit: number; plan: string }> = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    credits: 100,
    limit: 100,
    plan: 'starter',
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    credits: 500,
    limit: 500,
    plan: 'pro',
  },
  agency: {
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    credits: 2000,
    limit: 2000,
    plan: 'elite',
  },
};
