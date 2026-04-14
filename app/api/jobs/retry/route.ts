import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const WORKER_URL = process.env.WORKER_URL ?? 'http://127.0.0.1:8000';

// POST /api/jobs/retry — Taranamayan markaları tekrar tara
// Body: { brand_names: string[] }   (email bulunamayan marka isimleri)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const brandNames: string[] = body.brand_names || [];

    if (!brandNames.length) {
      return NextResponse.json({ error: 'Marka listesi boş' }, { status: 400 });
    }

    // Kredi kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single();

    const balance = profile?.credits_balance ?? 0;
    if (balance < brandNames.length) {
      return NextResponse.json({
        error: `Yetersiz kredi. ${brandNames.length} marka için ${brandNames.length} kredi gerekiyor, bakiyeniz: ${balance}.`,
        code: 'INSUFFICIENT_CREDITS',
        balance,
      }, { status: 402 });
    }

    // Eski brand kayıtlarını sil (tekrar taranacak olanları)
    for (const name of brandNames) {
      await supabase
        .from('brands')
        .delete()
        .eq('user_id', user.id)
        .eq('brand_name', name);
    }

    // Yeni job oluştur
    const { data: job, error: insertError } = await supabase
      .from('enrichment_jobs')
      .insert({
        user_id: user.id,
        file_name: `Tekrar tarama (${brandNames.length} marka)`,
        status: 'pending',
        total_brands: brandNames.length,
        processed_brands: 0,
      })
      .select()
      .single();

    if (insertError || !job) {
      console.error('Retry job insert error:', insertError?.message);
      return NextResponse.json({ error: 'Job oluşturulamadı' }, { status: 500 });
    }

    // CSV formatında brand listesi oluştur
    const csvContent = 'brand_name\n' + brandNames.map(n => `"${n}"`).join('\n');
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });

    // Worker'a gönder
    const workerForm = new FormData();
    workerForm.append('file', csvBlob, 'retry_brands.csv');
    workerForm.append('job_id', job.id);
    workerForm.append('user_id', user.id);

    fetch(`${WORKER_URL}/upload-and-enrich`, {
      method: 'POST',
      body: workerForm,
    }).catch(err => {
      console.error('Retry worker dispatch error:', err.message);
      supabase.from('enrichment_jobs')
        .update({ status: 'failed', error_message: `Worker unreachable: ${err.message}` })
        .eq('id', job.id)
        .then(() => {});
    });

    return NextResponse.json({
      job_id: job.id,
      brand_count: brandNames.length,
      message: `${brandNames.length} marka tekrar taranıyor`
    }, { status: 201 });

  } catch (err) {
    console.error('POST /api/jobs/retry error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
