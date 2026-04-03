import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

const BETA_MAX = 6; // 1 admin + 5 beta users

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    const current = count ?? 0;
    const available = current < BETA_MAX;

    return NextResponse.json({
      available,
      count: current,
      max: BETA_MAX,
      remaining: Math.max(0, BETA_MAX - current),
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
