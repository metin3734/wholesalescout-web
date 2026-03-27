import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/email-accounts — returns current user's email account (key masked)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('email_accounts')
      .select('id, from_name, from_email, daily_limit, is_active, created_at, resend_api_key')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) return NextResponse.json(null);

    // Mask API key: re_***...xxx (show last 4 chars)
    const key = data.resend_api_key as string;
    const masked = key.length > 8
      ? `${key.slice(0, 3)}${'*'.repeat(key.length - 7)}${key.slice(-4)}`
      : '***';

    return NextResponse.json({ ...data, resend_api_key: masked });
  } catch (err) {
    console.error('GET /api/email-accounts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/email-accounts — upsert email account
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { resend_api_key, from_name, from_email, daily_limit } = body;

    if (!resend_api_key || !from_name || !from_email) {
      return NextResponse.json({ error: 'resend_api_key, from_name, from_email are required' }, { status: 400 });
    }

    // If the submitted key looks masked, don't overwrite the real key
    const isMasked = resend_api_key.includes('*');

    // Check if account already exists
    const { data: existing } = await supabase
      .from('email_accounts')
      .select('id, resend_api_key')
      .eq('user_id', user.id)
      .single();

    const finalKey = isMasked && existing ? existing.resend_api_key : resend_api_key;

    const payload = {
      user_id: user.id,
      resend_api_key: finalKey,
      from_name,
      from_email,
      daily_limit: daily_limit ?? 50,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('email_accounts')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id, from_name, from_email, daily_limit, is_active, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('POST /api/email-accounts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/email-accounts — remove email account
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/email-accounts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
