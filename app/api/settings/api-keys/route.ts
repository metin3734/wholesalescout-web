import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Desteklenen API key tipleri
const SUPPORTED_KEYS = {
  hunter:   { label: 'Hunter.io',         url: 'https://hunter.io/api-documentation',  monthlyFree: 500  },
  apollo:   { label: 'Apollo.io',          url: 'https://docs.apollo.io',               monthlyFree: 50   },
  brave:    { label: 'Brave Search API',   url: 'https://api.search.brave.com',         monthlyFree: 2000 },
  clearout: { label: 'Clearout.io',        url: 'https://clearout.io',                  monthlyFree: 0    },
} as const;

// GET — kullanıcının kayıtlı API key'lerini döner (key değerleri maskelenmiş)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('id, key_type, label, is_active, created_at, updated_at, api_key')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ keys: [] });

    // Key değerini maskele — sadece son 4 karakter göster
    const masked = (data ?? []).map(k => ({
      ...k,
      api_key_masked: k.api_key ? `${'•'.repeat(Math.max(0, k.api_key.length - 4))}${k.api_key.slice(-4)}` : '',
      has_key: !!k.api_key,
      api_key: undefined, // güvenlik: ham key gönderme
    }));

    return NextResponse.json({ keys: masked, supported: SUPPORTED_KEYS });
  } catch {
    return NextResponse.json({ keys: [] });
  }
}

// POST — API key kaydet veya güncelle
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { key_type, api_key, label } = await req.json();

    if (!key_type || !Object.keys(SUPPORTED_KEYS).includes(key_type)) {
      return NextResponse.json({ error: 'Geçersiz key tipi' }, { status: 400 });
    }

    // Boş key = silme
    if (!api_key || api_key.trim() === '') {
      await supabase.from('user_api_keys').delete()
        .eq('user_id', user.id).eq('key_type', key_type);
      return NextResponse.json({ success: true, action: 'deleted' });
    }

    // Upsert
    const { error } = await supabase.from('user_api_keys')
      .upsert({
        user_id: user.id,
        key_type,
        api_key: api_key.trim(),
        label: label || SUPPORTED_KEYS[key_type as keyof typeof SUPPORTED_KEYS]?.label,
        is_active: true,
      }, { onConflict: 'user_id,key_type' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, action: 'saved' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
