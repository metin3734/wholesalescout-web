import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase-server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const WORKER_URL = process.env.WORKER_URL ?? 'http://127.0.0.1:8000';
  try {
    const resp = await fetch(`${WORKER_URL}/send-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
      signal: AbortSignal.timeout(55000),
    });
    if (!resp.ok) return NextResponse.json({ error: await resp.text() }, { status: resp.status });
    return NextResponse.json(await resp.json());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  const admin = await createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  const [{ count: sent }, { count: pending }] = await Promise.all([
    admin.from('email_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'sent').gte('sent_at', `${today}T00:00:00Z`),
    admin.from('email_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  return NextResponse.json({ today_sent: sent ?? 0, pending: pending ?? 0, daily_limit: 50 });
}
