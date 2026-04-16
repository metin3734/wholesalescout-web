import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// POST /api/exec-migration — Migration SQL çalıştır (admin only)
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ADMIN_EMAILS = ['metintomar2@gmail.com', 'info@beavdirect.com'];
    if (!ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    // Önce user_api_keys tablosunun var olup olmadığını kontrol et
    const adminClient = createAdminClient(supabaseUrl, serviceKey);
    const { error: checkError } = await adminClient
      .from('user_api_keys')
      .select('id')
      .limit(1);

    if (!checkError) {
      // Tablo zaten var — diğer kolonları da kontrol et (brands/keepa)
      return NextResponse.json({ success: true, message: 'Tables already exist' });
    }

    // Tablo yok — Supabase REST pgmeta endpoint ile oluştur
    const results: Array<{ step: string; ok?: boolean; error?: string }> = [];

    const statements = [
      {
        step: 'create_user_api_keys',
        sql: `CREATE TABLE IF NOT EXISTS public.user_api_keys (
          id uuid primary key default gen_random_uuid(),
          user_id uuid references auth.users(id) on delete cascade not null,
          key_type text not null,
          api_key text not null,
          label text,
          is_active boolean default true,
          created_at timestamptz default now(),
          updated_at timestamptz default now(),
          UNIQUE(user_id, key_type)
        )`,
      },
      { step: 'enable_rls', sql: 'ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY' },
      {
        step: 'create_policy',
        sql: `DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_api_keys' AND policyname='user_api_keys_own')
          THEN CREATE POLICY user_api_keys_own ON public.user_api_keys FOR ALL USING (auth.uid() = user_id);
          END IF; END $$`,
      },
      { step: 'brands_dm_linkedin', sql: 'ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_maker_linkedin text' },
      { step: 'brands_decision_makers', sql: 'ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_makers text' },
      { step: 'brands_alt_emails', sql: 'ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS alternative_emails text' },
      { step: 'brands_dm_email', sql: 'ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_maker_email text' },
      { step: 'brands_elim_reason', sql: 'ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS elimination_reason text' },
      { step: 'keepa_strateji', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS strateji_etiketleri text' },
      { step: 'keepa_eleme', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS eleme_nedeni text' },
      { step: 'keepa_bought', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS bought_past_month integer' },
      { step: 'keepa_bb', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS bb_winner_count integer' },
      { step: 'keepa_oos', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS oos_90d numeric(5,1)' },
      { step: 'keepa_buybox', sql: 'ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS buybox_price numeric(10,2)' },
    ];

    // pgmeta /query endpoint ile çalıştır
    for (const { step, sql } of statements) {
      const resp = await fetch(`${supabaseUrl}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (resp.ok) {
        results.push({ step, ok: true });
      } else {
        const errText = await resp.text();
        // "already exists" hataları görmezden gel
        if (errText.includes('already exists') || errText.includes('duplicate')) {
          results.push({ step, ok: true });
        } else {
          results.push({ step, error: errText.substring(0, 100) });
        }
      }
    }

    const failed = results.filter(r => r.error);
    return NextResponse.json({
      success: failed.length === 0,
      results,
      failed: failed.length,
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
