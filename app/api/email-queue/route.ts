import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET — kuyruk durumu
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  const { data, error, count } = await supabase
    .from('email_queue')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data, total: count });
}

// POST — kuyruğa email ekle (markalar listesinden)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { brand_ids, template_id } = body;

  if (!brand_ids?.length) {
    return NextResponse.json({ error: 'brand_ids zorunlu' }, { status: 400 });
  }

  // Marka bilgilerini çek
  const { data: brands, error: bErr } = await supabase
    .from('brands')
    .select('id,brand_name,wholesale_email,decision_maker_name,outreach_email_template')
    .in('id', brand_ids)
    .eq('user_id', user.id)
    .not('wholesale_email', 'is', null);

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
  if (!brands?.length) return NextResponse.json({ error: 'Email adresi bulunan marka yok' }, { status: 400 });

  // Şablon al (varsa)
  let templateSubject = '';
  let templateBody = '';
  if (template_id) {
    const { data: tpl } = await supabase
      .from('email_templates')
      .select('subject,body_html,body_text')
      .eq('id', template_id).eq('user_id', user.id).single();
    if (tpl) { templateSubject = tpl.subject; templateBody = tpl.body_html || tpl.body_text || ''; }
  }

  // Kuyruğa ekle
  const items = brands.map((b: any) => ({
    user_id:     user.id,
    brand_id:    b.id,
    brand_name:  b.brand_name,
    to_email:    b.wholesale_email,
    to_name:     b.decision_maker_name || '',
    template_id: template_id || null,
    subject:     templateSubject || `Wholesale Partnership — ${b.brand_name}`,
    body_html:   templateBody || b.outreach_email_template || '',
    status:      'pending',
  }));

  const { data: inserted, error: iErr } = await supabase
    .from('email_queue')
    .insert(items)
    .select('id');

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });
  return NextResponse.json({ added: inserted?.length ?? 0 }, { status: 201 });
}
