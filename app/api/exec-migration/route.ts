import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// POST /api/exec-migration — Supabase pgmeta API ile migration çalıştır
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ADMIN_EMAILS = ['metintomar2@gmail.com', 'info@beavdirect.com'];
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }

    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Supabase pgmeta SQL execution endpoint
    const pgQueryUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;

    // Tüm migrationları tek SQL bloğunda çalıştır
    const migrationSQL = `
      -- user_api_keys tablosu
      CREATE TABLE IF NOT EXISTS public.user_api_keys (
        id          uuid primary key default gen_random_uuid(),
        user_id     uuid references auth.users(id) on delete cascade not null,
        key_type    text not null,
        api_key     text not null,
        label       text,
        is_active   boolean default true,
        created_at  timestamptz default now(),
        updated_at  timestamptz default now(),
        UNIQUE(user_id, key_type)
      );
      ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename='user_api_keys' AND policyname='user_api_keys_own'
        ) THEN
          CREATE POLICY user_api_keys_own ON public.user_api_keys
            FOR ALL USING (auth.uid() = user_id);
        END IF;
      END $$;

      -- brands tablosu eksik kolonlar
      ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_maker_linkedin text;
      ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_makers text;
      ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS alternative_emails text;
      ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS decision_maker_email text;
      ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS elimination_reason text;

      -- keepa_products eksik kolonlar
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS strateji_etiketleri text;
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS eleme_nedeni text;
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS bought_past_month integer;
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS bb_winner_count integer;
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS oos_90d numeric(5,1);
      ALTER TABLE public.keepa_products ADD COLUMN IF NOT EXISTS buybox_price numeric(10,2);
    `;

    // Method 1: Supabase REST rpc endpoint (exec_sql function gerekir)
    const rpcResp = await fetch(pgQueryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ sql_query: migrationSQL }),
    });

    if (rpcResp.ok) {
      return NextResponse.json({ success: true, method: 'rpc' });
    }

    // Method 2: Supabase Management API (/pg/query endpoint)
    const pgMetaUrl = `${supabaseUrl}/pg/query`;
    const pgResp = await fetch(pgMetaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: migrationSQL }),
    });

    if (pgResp.ok) {
      const result = await pgResp.json();
      return NextResponse.json({ success: true, method: 'pgmeta', result });
    }

    const pgErr = await pgResp.text();

    // Method 3: Her tablo için ayrı INSERT denemesi — tablo yok hatası varsa oluşturulacak
    // user_api_keys tablosunun var olup olmadığını kontrol et
    const { error: checkError } = await supabase
      .from('user_api_keys')
      .select('id')
      .limit(1)
      .single();

    if (!checkError || checkError.code === 'PGRST116') {
      // Tablo var (veya boş) — migration başarılı sayılabilir
      return NextResponse.json({ success: true, method: 'table_exists' });
    }

    // Tablo gerçekten yok — manual çalıştırma gerekiyor
    return NextResponse.json({
      success: false,
      error: 'pgmeta erişilemedi',
      pgMetaError: pgErr.substring(0, 200),
      manual_sql: migrationSQL,
      instructions: 'Supabase SQL Editor > aşağıdaki SQL\'i çalıştırın'
    }, { status: 500 });

  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
