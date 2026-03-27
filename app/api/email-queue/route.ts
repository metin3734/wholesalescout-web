import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/email-queue — list queue entries for current user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // optional filter

    let query = supabase
      .from('email_queue')
      .select(
        'id, brand_id, template_id, to_email, to_name, subject, status, ' +
        'scheduled_for, sent_at, error_message, resend_message_id, ' +
        'verification_status, created_at, ' +
        'brands(brand_name)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/email-queue error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/email-queue — add brands to queue
// Body: { brand_ids: string[], template_id: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { brand_ids, template_id } = body;

    if (!brand_ids || !Array.isArray(brand_ids) || brand_ids.length === 0) {
      return NextResponse.json({ error: 'brand_ids array is required' }, { status: 400 });
    }
    if (!template_id) {
      return NextResponse.json({ error: 'template_id is required' }, { status: 400 });
    }

    // Fetch template
    const { data: template, error: tplErr } = await supabase
      .from('email_templates')
      .select('subject, body')
      .eq('id', template_id)
      .eq('user_id', user.id)
      .single();

    if (tplErr || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Fetch email account for sender info
    const { data: account } = await supabase
      .from('email_accounts')
      .select('from_name')
      .eq('user_id', user.id)
      .single();

    // Fetch brands
    const { data: brands, error: brandsErr } = await supabase
      .from('brands')
      .select('id, brand_name, wholesale_email, decision_maker_name, official_domain')
      .in('id', brand_ids)
      .eq('user_id', user.id)
      .not('wholesale_email', 'is', null);

    if (brandsErr) {
      return NextResponse.json({ error: brandsErr.message }, { status: 500 });
    }

    if (!brands || brands.length === 0) {
      return NextResponse.json({ error: 'No brands with email found' }, { status: 400 });
    }

    // Check already-sent emails (same brand, status='sent')
    const { data: alreadySent } = await supabase
      .from('email_queue')
      .select('brand_id')
      .eq('user_id', user.id)
      .in('brand_id', brand_ids)
      .eq('status', 'sent');

    const sentBrandIds = new Set((alreadySent ?? []).map((r: { brand_id: string }) => r.brand_id));

    const senderName = account?.from_name ?? 'The Team';

    const rows = brands
      .filter((b: { id: string }) => !sentBrandIds.has(b.id))
      .map((b: { id: string; brand_name: string; wholesale_email: string; decision_maker_name?: string; official_domain?: string }) => {
        const firstName = b.decision_maker_name?.split(' ')[0] ?? 'there';
        const subject = renderTemplate(template.subject, {
          brand_name: b.brand_name ?? '',
          first_name: firstName,
          contact_name: b.decision_maker_name ?? '',
          domain: b.official_domain ?? '',
          sender_name: senderName,
        });
        const emailBody = renderTemplate(template.body, {
          brand_name: b.brand_name ?? '',
          first_name: firstName,
          contact_name: b.decision_maker_name ?? '',
          domain: b.official_domain ?? '',
          sender_name: senderName,
        });

        return {
          user_id: user.id,
          brand_id: b.id,
          template_id,
          to_email: b.wholesale_email,
          to_name: b.decision_maker_name ?? b.brand_name,
          subject,
          body: emailBody,
          status: 'queued',
        };
      });

    if (rows.length === 0) {
      return NextResponse.json({ added: 0, skipped: brands.length, message: 'All brands already sent' });
    }

    const { error: insertErr } = await supabase.from('email_queue').insert(rows);
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json({
      added: rows.length,
      skipped: brands.length - rows.length,
    });
  } catch (err) {
    console.error('POST /api/email-queue error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template
    .replace(/\{\{brand_name\}\}/g, vars.brand_name)
    .replace(/\{\{first_name\}\}/g, vars.first_name)
    .replace(/\{\{contact_name\}\}/g, vars.contact_name)
    .replace(/\{\{domain\}\}/g, vars.domain)
    .replace(/\{\{sender_name\}\}/g, vars.sender_name);
}
