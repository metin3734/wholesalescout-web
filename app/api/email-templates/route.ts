import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/email-templates — list all templates for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, body, is_default, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/email-templates error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/email-templates — create new template
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, subject, body: templateBody } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: 'name, subject, body are required' }, { status: 400 });
    }

    // Check if this is the first template — if so, set as default
    const { count } = await supabase
      .from('email_templates')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const isDefault = count === 0;

    const { data, error } = await supabase
      .from('email_templates')
      .insert({ user_id: user.id, name, subject, body: templateBody, is_default: isDefault })
      .select('id, name, subject, body, is_default, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('POST /api/email-templates error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
