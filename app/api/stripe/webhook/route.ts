import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function adminSupabase() {
    return createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
}

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
    try {
          event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

  if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const credits = parseInt(session.metadata?.credits ?? '0', 10);
        const plan = session.metadata?.plan ?? '';

      if (userId && credits > 0) {
              const sb = adminSupabase();

          const { data: profile } = await sb
                .from('profiles')
                .select('credits_balance')
                .eq('id', userId)
                .single();

          const newBalance = (profile?.credits_balance ?? 0) + credits;

          await sb.from('profiles').update({ credits_balance: newBalance }).eq('id', userId);

          await sb.from('credit_transactions').insert({
                    user_id: userId,
                    type: 'purchase',
                    amount: credits,
                    description: `${plan} plan - ${credits} kredi satin alindi`,
          });
      }
  }

  return NextResponse.json({ received: true });
}
