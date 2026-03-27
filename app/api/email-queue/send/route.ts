import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// POST /api/email-queue/send — Vercel Cron (hourly)
// Requires: Authorization: Bearer CRON_SECRET
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role client to access all users' queues
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createSupabaseClient(supabaseUrl, serviceKey);

  let totalSent = 0;
  let totalFailed = 0;

  try {
    // Get all active email accounts
    const { data: accounts, error: accErr } = await supabase
      .from('email_accounts')
      .select('user_id, resend_api_key, from_name, from_email, daily_limit')
      .eq('is_active', true);

    if (accErr || !accounts) {
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const account of accounts) {
      // Count how many emails sent today for this user
      const { count: sentToday } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', account.user_id)
        .eq('status', 'sent')
        .gte('sent_at', today.toISOString());

      const remaining = account.daily_limit - (sentToday ?? 0);
      if (remaining <= 0) continue;

      // Get queued items for this user (FIFO)
      const { data: queued, error: qErr } = await supabase
        .from('email_queue')
        .select('id, to_email, to_name, subject, body')
        .eq('user_id', account.user_id)
        .eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .order('created_at', { ascending: true })
        .limit(remaining);

      if (qErr || !queued || queued.length === 0) continue;

      const resend = new Resend(account.resend_api_key);

      for (const item of queued) {
        // Mark as sending
        await supabase
          .from('email_queue')
          .update({ status: 'sending' })
          .eq('id', item.id);

        try {
          const { data: sendData, error: sendErr } = await resend.emails.send({
            from: `${account.from_name} <${account.from_email}>`,
            to: item.to_email,
            subject: item.subject,
            html: item.body.replace(/\n/g, '<br>'),
          });

          if (sendErr || !sendData) {
            await supabase
              .from('email_queue')
              .update({
                status: 'failed',
                error_message: sendErr?.message ?? 'Unknown send error',
              })
              .eq('id', item.id);
            totalFailed++;
          } else {
            await supabase
              .from('email_queue')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                resend_message_id: sendData.id,
              })
              .eq('id', item.id);
            totalSent++;
          }
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Send exception';
          await supabase
            .from('email_queue')
            .update({ status: 'failed', error_message: errMsg })
            .eq('id', item.id);
          totalFailed++;
        }

        // Small delay between sends to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return NextResponse.json({ sent: totalSent, failed: totalFailed });
  } catch (err) {
    console.error('POST /api/email-queue/send error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Also allow GET for manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
