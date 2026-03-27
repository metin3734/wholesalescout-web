import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PATCH /api/settings — update user profile
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { full_name } = await req.json();

    const { error } = await supabase
      .from('profiles')
      .update({ full_name })
      .eq('id', user.id);

    if (error) {
      console.error('settings update error:', error.message);
      return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/settings error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
