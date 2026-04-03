import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS: Record<string, { price: number; credits: number }> = {
    Starter: { price:   4900, credits:   800 },
    Growth:  { price:  19900, credits:  4000 },
    Pro:     { price:  49900, credits: 12000 },
    Agency:  { price: 139900, credits: 40000 },
};

export async function POST(req: Request) {
    try {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { plan } = await req.json();
          const cfg = PLANS[plan];
          if (!cfg) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
              mode: 'payment',
              customer_email: user.email!,
              metadata: { user_id: user.id, plan, credits: String(cfg.credits) },
              line_items: [{
                        price_data: {
                                    currency: 'usd',
                                    product_data: { name: `WholesaleScout ${plan} — ${cfg.credits.toLocaleString()} Brand Credits` },
                                    unit_amount: cfg.price,
                        },
                        quantity: 1,
              }],
              success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wholesalescout-web.vercel.app'}/dashboard/credits?paid=1`,
              cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wholesalescout-web.vercel.app'}/dashboard/credits`,
      });

      return NextResponse.json({ url: session.url });
    } catch (err) {
          console.error('Stripe checkout error:', err);
          return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }
}
