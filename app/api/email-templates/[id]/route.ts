import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// PATCH /api/email-templates/[id] — update template
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, subject, body: templateBody, is_default } = body;

    // If setting as default, unset others first
    if (is_default === true) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const updatePayload: Record<string, unknown> = {};
    if (name !== undefined) updatePayload.name = name;
    if (subject !== undefined) updatePayload.subject = subject;
    if (templateBody !== undefined) updatePayload.body = templateBody;
    if (is_default !== undefined) updatePayload.is_default = is_default;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, name, subject, body, is_default, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    console.error('PATCH /api/email-templates/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/email-templates/[id] — delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/email-templates/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
