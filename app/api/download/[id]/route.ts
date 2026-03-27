import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const format = req.nextUrl.searchParams.get('format') ?? 'csv';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify job ownership and get file paths
    const { data: job, error } = await supabase
      .from('enrichment_jobs')
      .select('id, user_id, status, result_csv, result_xlsx, file_name')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.status !== 'completed') {
      return NextResponse.json({ error: 'Job not completed yet' }, { status: 400 });
    }

    const filePath = format === 'xlsx' ? job.result_xlsx : job.result_csv;
    if (!filePath) {
      return NextResponse.json({ error: `No ${format.toUpperCase()} result available` }, { status: 404 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Result file not found on server' }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const baseName = job.file_name.replace(/\.(csv|xlsx|xls)$/i, '');
    const downloadName = `${baseName}_enriched.${format}`;

    const contentType = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv; charset=utf-8';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': String(fileBuffer.length),
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
