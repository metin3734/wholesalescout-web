import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Allow large file uploads (Keepa exports can be 10MB+)
export const maxDuration = 60;

const WORKER_URL = process.env.WORKER_URL ?? 'http://127.0.0.1:8000';

// GET /api/jobs — list jobs for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Jobs fetch error:', error.message);
      return NextResponse.json([]);
    }
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('GET /api/jobs error:', err);
    return NextResponse.json([]);
  }
}

// POST /api/jobs — upload file, create job, dispatch to Python worker
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      return NextResponse.json({ error: 'Only CSV and Excel files are supported' }, { status: 400 });
    }

    // Count rows for brand estimate (CSV only — XLSX is binary, worker sets real count)
    const bytes = await file.arrayBuffer();
    let totalBrands = 0;
    if (file.name.match(/\.csv$/i)) {
      const text = Buffer.from(bytes).toString('utf-8');
      const lines = text.split('\n').filter(l => l.trim()).length;
      totalBrands = Math.max(0, lines - 1);
    }

    // Create job in Supabase
    const { data: job, error: insertError } = await supabase
      .from('enrichment_jobs')
      .insert({
        user_id: user.id,
        file_name: file.name,
        status: 'pending',
        total_brands: totalBrands,
        processed_brands: 0,
      })
      .select()
      .single();

    if (insertError || !job) {
      console.error('Job insert error:', insertError?.message);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Forward file directly to Railway worker (no local filesystem)
    const workerForm = new FormData();
    workerForm.append('file', new Blob([bytes], { type: file.type }), file.name);
    workerForm.append('job_id', job.id);
    workerForm.append('user_id', user.id);

    fetch(`${WORKER_URL}/upload-and-enrich`, {
      method: 'POST',
      body: workerForm,
    }).catch(err => {
      console.error('Worker dispatch error:', err.message);
      supabase.from('enrichment_jobs')
        .update({ status: 'failed', error_message: `Worker unreachable: ${err.message}` })
        .eq('id', job.id)
        .then(() => {});
    });

    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    console.error('POST /api/jobs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
