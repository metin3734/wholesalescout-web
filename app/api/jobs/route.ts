import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Shared uploads dir — Python worker reads from here
const UPLOADS_DIR = join(
  process.env.PIPELINE_DIR ??
  'C:/Users/tunah/OneDrive/Desktop/brand-outreach-tool',
  'uploads'
);

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

    // Save file to shared uploads directory
    const ext = file.name.split('.').pop() ?? 'csv';
    const filePath = join(UPLOADS_DIR, `${job.id}.${ext}`);

    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
      await writeFile(filePath, Buffer.from(bytes));
      console.log(`File saved: ${filePath}`);
    } catch (fsErr) {
      console.error('File save error:', fsErr);
      // Update job to failed
      await supabase.from('enrichment_jobs').update({ status: 'failed', error_message: 'File save failed' }).eq('id', job.id);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    // Dispatch to Python worker (fire and forget)
    fetch(`${WORKER_URL}/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id, file_path: filePath, user_id: user.id }),
    }).catch(err => {
      console.error('Worker dispatch error:', err.message);
      // Update job status if worker unreachable
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
