import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ownership check
  const { data: job } = await supabase
    .from('enrichment_jobs')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete associated data, then the job
  await supabase.from('brands').delete().eq('job_id', id);
  await supabase.from('keepa_products').delete().eq('job_id', id).eq('user_id', user.id);
  await supabase.from('enrichment_jobs').delete().eq('id', id).eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
