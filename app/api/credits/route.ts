import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/credits — credit balance + transaction history
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profileRes, txRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('credits_balance, brands_used, brands_limit, full_name')
        .eq('id', user.id)
        .single(),
      supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    return NextResponse.json({
      balance: profileRes.data?.credits_balance ?? 0,
      brands_used: profileRes.data?.brands_used ?? 0,
      brands_limit: profileRes.data?.brands_limit ?? 10,
      full_name: profileRes.data?.full_name ?? '',
      email: user.email ?? '',
      transactions: txRes.data ?? [],
    });
  } catch (err) {
    console.error('GET /api/credits error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
