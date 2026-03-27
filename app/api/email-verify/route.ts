import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// POST /api/email-verify — verify an email via Hunter.io
// Body: { email: string, brand_id?: string }
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { email, brand_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const apiKey = process.env.HUNTER_API_KEY;
    if (!apiKey || apiKey === 'your_hunter_api_key') {
      return NextResponse.json({ error: 'HUNTER_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: json.errors?.[0]?.details ?? 'Hunter.io error' }, { status: 500 });
    }

    const result = json.data;
    const verificationStatus = mapHunterStatus(result.status);

    // If brand_id provided, update brands table
    if (brand_id) {
      await supabase
        .from('brands')
        .update({ email_verification_status: verificationStatus })
        .eq('id', brand_id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      email: result.email,
      status: result.status,
      verification_status: verificationStatus,
      score: result.score,
      disposable: result.disposable,
      webmail: result.webmail,
      mx_records: result.mx_records,
    });
  } catch (err) {
    console.error('POST /api/email-verify error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function mapHunterStatus(status: string): string {
  switch (status) {
    case 'valid': return 'valid';
    case 'invalid': return 'invalid';
    case 'accept_all': return 'risky';
    case 'unknown': return 'risky';
    case 'disposable': return 'invalid';
    default: return 'unknown';
  }
}
