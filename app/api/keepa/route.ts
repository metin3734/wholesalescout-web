import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const UPLOADS_DIR = join(
  process.env.PIPELINE_DIR ?? 'C:/Users/tunah/OneDrive/Desktop/brand-outreach-tool',
  'uploads'
);
const WORKER_URL = process.env.WORKER_URL ?? 'http://127.0.0.1:8000';

// GET /api/keepa — kullanıcının tüm keepa ürünleri
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url   = new URL(req.url);
    const jobId = url.searchParams.get('job_id');
    const kat   = url.searchParams.get('kategori');

    let query = supabase
      .from('keepa_products')
      .select('*')
      .eq('user_id', user.id)
      .order('wholesale_score', { ascending: false })
      .limit(2000);

    if (jobId) query = query.eq('job_id', jobId);
    if (kat)   query = query.eq('kategori', kat);

    const { data, error } = await query;
    if (error) { console.error('keepa fetch error:', error.message); return NextResponse.json([]); }
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error('GET /api/keepa error:', e);
    return NextResponse.json([]);
  }
}

// POST /api/keepa — Keepa CSV yükle & analiz başlat
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Dosya seçilmedi' }, { status: 400 });

    if (!file.name.match(/\.(csv|xlsx|xls|tsv|txt)$/i)) {
      return NextResponse.json({ error: 'Keepa CSV, TSV veya Excel dosyası gerekli' }, { status: 400 });
    }

    // Job oluştur
    const { data: job, error: insertError } = await supabase
      .from('enrichment_jobs')
      .insert({
        user_id:          user.id,
        file_name:        file.name,
        status:           'pending',
        total_brands:     0,
        processed_brands: 0,
        job_type:         'keepa',
      })
      .select()
      .single();

    if (insertError || !job) {
      console.error('Keepa job insert error:', insertError?.message);
      return NextResponse.json({ error: 'Job oluşturulamadı' }, { status: 500 });
    }

    // Dosyayı kaydet
    const ext = file.name.split('.').pop() ?? 'csv';
    const filePath = join(UPLOADS_DIR, `keepa_${job.id}.${ext}`);
    const bytes = await file.arrayBuffer();
    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
      await writeFile(filePath, Buffer.from(bytes));
    } catch (fsErr) {
      console.error('File save error:', fsErr);
      await supabase.from('enrichment_jobs').update({ status: 'failed' }).eq('id', job.id);
      return NextResponse.json({ error: 'Dosya kaydedilemedi' }, { status: 500 });
    }

    // Python worker'a gönder (async)
    fetch(`${WORKER_URL}/keepa-analyze-async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: job.id, file_path: filePath, user_id: user.id }),
    }).catch(err => {
      console.error('Worker keepa dispatch error:', err.message);
      supabase.from('enrichment_jobs')
        .update({ status: 'failed' })
        .eq('id', job.id)
        .then(() => {});
    });

    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error('POST /api/keepa error:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
