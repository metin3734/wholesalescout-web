import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/brands — all brands for current user, across all jobs
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('brands')
      .select(
        'id,job_id,brand_name,official_domain,wholesale_email,email_source,' +
        'instagram_url,tiktok_url,linkedin_url,facebook_url,' +
        'decision_maker_name,decision_maker_title,' +
        'company_employee_count,confidence_score,' +
        'distributor,status,lead_status,created_at,' +
        'brand_type,ecommerce_platform,trustpilot_rating,trustpilot_reviews,' +
        'distribution_channels,has_wholesale_page,physical_address,verification_score,' +
        'ssl_valid,domain_age_days,security_score,' +
        'faire_url,wholesale_page_url,' +
        'phone,company_bio,location,' +
        'distribution_type,known_distributors,' +
        'fraud_risk,fraud_flags,' +
        'qualification_status,qualification_score,qualification_signals,' +
        'outreach_score,outreach_approach,outreach_recommendation,outreach_email_template,' +
        'keepa_score,keepa_asin,keepa_amazon_url,keepa_offer_count,contact_form_url,' +
        'email_verification_status'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('GET /api/brands error:', error.message);
      return NextResponse.json([]);
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/brands error:', err);
    return NextResponse.json([]);
  }
}
