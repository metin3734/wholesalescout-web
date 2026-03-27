import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('brands')
      .select('id,brand_name,official_domain,wholesale_email,email_source,instagram_url,tiktok_url,linkedin_url,decision_maker_name,decision_maker_title,company_employee_count,location,confidence_score,security_score,ssl_valid,domain_age_days,lead_status,status,created_at')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json([]);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
