'use client';

import { useEffect, useState, useCallback } from 'react';

/* ────────────────────────────────────────────────────────── types ── */
interface EmailAccount {
  id: string;
  from_name: string;
  from_email: string;
  daily_limit: number;
  is_active: boolean;
  resend_api_key: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
}

interface QueueEntry {
  id: string;
  brand_id: string;
  to_email: string;
  to_name: string;
  subject: string;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'bounced';
  scheduled_for: string;
  sent_at?: string;
  error_message?: string;
  verification_status?: string;
  created_at: string;
  brands?: { brand_name: string };
}

interface Brand {
  id: string;
  brand_name: string;
  wholesale_email: string;
  decision_maker_name?: string;
  official_domain?: string;
  email_verification_status?: string;
}

/* ────────────────────────────────────────────────────────── page ── */
export default function OutreachPage() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [accountForm, setAccountForm] = useState({ resend_api_key: '', from_name: '', from_email: '', daily_limit: 50 });
  const [editingAccount, setEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '' });
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());
  const [queueTemplateId, setQueueTemplateId] = useState('');
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [verifyingEmails, setVerifyingEmails] = useState(false);

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [queueStats, setQueueStats] = useState({ queued: 0, sent_today: 0 });

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  /* ── helpers ── */
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAccount = useCallback(async () => {
    const res = await fetch('/api/email-accounts');
    if (res.ok) {
      const data = await res.json();
      setAccount(data);
      if (data) {
        setAccountForm({
          resend_api_key: data.resend_api_key,
          from_name: data.from_name,
          from_email: data.from_email,
          daily_limit: data.daily_limit,
        });
      }
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    const res = await fetch('/api/email-templates');
    if (res.ok) {
      const data: EmailTemplate[] = await res.json();
      setTemplates(data);
      const def = data.find(t => t.is_default) ?? data[0] ?? null;
      if (def) {
        setSelectedTemplate(def);
        setTemplateForm({ name: def.name, subject: def.subject, body: def.body });
        setQueueTemplateId(def.id);
      }
    }
  }, []);

  const loadBrands = useCallback(async () => {
    const res = await fetch('/api/brands');
    if (res.ok) {
      const data: Brand[] = await res.json();
      setBrands(data.filter(b => b.wholesale_email));
    }
  }, []);

  const loadQueue = useCallback(async () => {
    const res = await fetch('/api/email-queue');
    if (res.ok) {
      const data: QueueEntry[] = await res.json();
      setQueue(data);
      const today = new Date().toDateString();
      const sentToday = data.filter(q => q.status === 'sent' && q.sent_at && new Date(q.sent_at).toDateString() === today).length;
      const queued = data.filter(q => q.status === 'queued').length;
      setQueueStats({ queued, sent_today: sentToday });
    }
  }, []);

  useEffect(() => {
    loadAccount();
    loadTemplates();
    loadBrands();
    loadQueue();
  }, [loadAccount, loadTemplates, loadBrands, loadQueue]);

  /* ── account save ── */
  async function saveAccount() {
    setSavingAccount(true);
    try {
      const res = await fetch('/api/email-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });
      if (res.ok) {
        await loadAccount();
        setEditingAccount(false);
        showToast('Email account saved');
      } else {
        const err = await res.json();
        showToast(err.error ?? 'Save failed', 'err');
      }
    } finally {
      setSavingAccount(false);
    }
  }

  async function deleteAccount() {
    if (!confirm('Remove email account?')) return;
    await fetch('/api/email-accounts', { method: 'DELETE' });
    setAccount(null);
    setAccountForm({ resend_api_key: '', from_name: '', from_email: '', daily_limit: 50 });
    showToast('Account removed');
  }

  /* ── template save ── */
  async function saveTemplate() {
    setSavingTemplate(true);
    try {
      let res: Response;
      if (selectedTemplate) {
        res = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        });
      } else {
        res = await fetch('/api/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateForm),
        });
      }
      if (res.ok) {
        await loadTemplates();
        showToast('Template saved');
      } else {
        const err = await res.json();
        showToast(err.error ?? 'Save failed', 'err');
      }
    } finally {
      setSavingTemplate(false);
    }
  }

  async function setAsDefault(id: string) {
    await fetch(`/api/email-templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    });
    await loadTemplates();
    showToast('Default template set');
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/email-templates/${id}`, { method: 'DELETE' });
    await loadTemplates();
    showToast('Template deleted');
  }

  /* ── verify emails ── */
  async function verifyEmails() {
    if (selectedBrandIds.size === 0) { showToast('Select brands first', 'err'); return; }
    setVerifyingEmails(true);
    try {
      const selected = brands.filter(b => selectedBrandIds.has(b.id));
      for (const brand of selected) {
        await fetch('/api/email-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: brand.wholesale_email, brand_id: brand.id }),
        });
      }
      await loadBrands();
      showToast(`Verified ${selected.length} emails`);
    } finally {
      setVerifyingEmails(false);
    }
  }

  /* ── add to queue ── */
  async function addToQueue() {
    if (selectedBrandIds.size === 0) { showToast('Select brands first', 'err'); return; }
    if (!queueTemplateId) { showToast('Select a template first', 'err'); return; }
    if (!account) { showToast('Connect email account first', 'err'); return; }
    setAddingToQueue(true);
    try {
      const res = await fetch('/api/email-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_ids: Array.from(selectedBrandIds), template_id: queueTemplateId }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadQueue();
        setSelectedBrandIds(new Set());
        showToast(`Added ${data.added} to queue${data.skipped > 0 ? ` (${data.skipped} already sent)` : ''}`);
      } else {
        showToast(data.error ?? 'Error adding to queue', 'err');
      }
    } finally {
      setAddingToQueue(false);
    }
  }

  /* ── insert variable into body ── */
  function insertVar(v: string) {
    setTemplateForm(prev => ({ ...prev, body: prev.body + v }));
  }

  /* ── status badge ── */
  function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { bg: string; color: string; label: string }> = {
      queued:   { bg: '#f1f5f9', color: '#64748b', label: 'Queued' },
      sending:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Sending' },
      sent:     { bg: '#dcfce7', color: '#16a34a', label: 'Sent' },
      failed:   { bg: '#fee2e2', color: '#dc2626', label: 'Failed' },
      bounced:  { bg: '#fef3c7', color: '#d97706', label: 'Bounced' },
    };
    const c = cfg[status] ?? cfg.queued;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 99,
        background: c.bg, color: c.color,
        fontSize: '0.72rem', fontWeight: 600,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
        {c.label}
      </span>
    );
  }

  function VerifyBadge({ status }: { status?: string }) {
    if (!status) return <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>—</span>;
    const cfg: Record<string, { color: string }> = {
      valid: { color: '#16a34a' },
      risky: { color: '#d97706' },
      invalid: { color: '#dc2626' },
      unknown: { color: '#94a3b8' },
    };
    const c = cfg[status] ?? cfg.unknown;
    return <span style={{ color: c.color, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>;
  }

  /* ─────────────────────────────────────── render ── */
  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'ok' ? '#009668' : '#dc2626',
          color: '#fff', padding: '10px 18px', borderRadius: 8,
          fontSize: '0.85rem', fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#76777d', marginBottom: 6 }}>
          WholesaleScout › Outreach
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#131b2e', margin: 0, fontFamily: 'Manrope, Inter, sans-serif' }}>
            Email Outreach
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              <b style={{ color: '#131b2e' }}>{queueStats.queued}</b> queued
              &nbsp;·&nbsp;
              <b style={{ color: '#009668' }}>{queueStats.sent_today}</b> sent today
            </span>
          </div>
        </div>
      </div>

      {/* ── 1. Email Account Card ── */}
      <div style={{ background: '#fff', border: '1px solid #eaedff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#131b2e' }}>
            Email Account
          </h2>
          {account && !editingAccount && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingAccount(true)} style={btnStyle('#f2f3ff', '#00174b')}>Edit</button>
              <button onClick={deleteAccount} style={btnStyle('#fee2e2', '#dc2626')}>Remove</button>
            </div>
          )}
        </div>

        {account && !editingAccount ? (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <InfoRow label="From" value={`${account.from_name} <${account.from_email}>`} />
            <InfoRow label="Daily Limit" value={`${account.daily_limit} emails/day`} />
            <InfoRow label="Status" value={account.is_active ? '✓ Active' : 'Inactive'} valueColor={account.is_active ? '#009668' : '#dc2626'} />
          </div>
        ) : (
          <div>
            {!account && (
              <p style={{ margin: '0 0 1rem', fontSize: '0.83rem', color: '#64748b' }}>
                Connect your Resend account to start sending emails. The &quot;From&quot; email must be a verified domain in Resend.
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Resend API Key</label>
                <input
                  type="password"
                  placeholder="re_xxxxxxxxxxxx"
                  value={accountForm.resend_api_key}
                  onChange={e => setAccountForm(p => ({ ...p, resend_api_key: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>From Email</label>
                <input
                  type="email"
                  placeholder="hello@yourdomain.com"
                  value={accountForm.from_email}
                  onChange={e => setAccountForm(p => ({ ...p, from_email: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>From Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={accountForm.from_name}
                  onChange={e => setAccountForm(p => ({ ...p, from_name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Daily Limit</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={accountForm.daily_limit}
                  onChange={e => setAccountForm(p => ({ ...p, daily_limit: Number(e.target.value) }))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
              <button onClick={saveAccount} disabled={savingAccount} style={btnStyle('#00174b', '#fff', true)}>
                {savingAccount ? 'Saving…' : account ? 'Update Account' : 'Connect Account'}
              </button>
              {editingAccount && (
                <button onClick={() => setEditingAccount(false)} style={btnStyle('#f2f3ff', '#64748b')}>Cancel</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Template Editor Card ── */}
      <div style={{ background: '#fff', border: '1px solid #eaedff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#131b2e' }}>
          Email Templates
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1rem' }}>
          {/* Template list */}
          <div>
            {templates.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>No templates yet</p>
            )}
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => { setSelectedTemplate(t); setTemplateForm({ name: t.name, subject: t.subject, body: t.body }); }}
                style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                  background: selectedTemplate?.id === t.id ? '#eaedff' : '#f8fafc',
                  border: selectedTemplate?.id === t.id ? '1px solid #c7d2fe' : '1px solid transparent',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#131b2e' }}>{t.name}</div>
                {t.is_default && <span style={{ fontSize: '0.65rem', color: '#497cff', fontWeight: 600 }}>DEFAULT</span>}
              </div>
            ))}
            <button
              onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: '', subject: '', body: '' }); }}
              style={{ ...btnStyle('#f2f3ff', '#00174b'), width: '100%', marginTop: 6, justifyContent: 'center' }}
            >
              + New Template
            </button>
          </div>

          {/* Editor */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={labelStyle}>Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wholesale Intro"
                  value={templateForm.name}
                  onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Subject Line</label>
                <input
                  type="text"
                  placeholder="Wholesale partnership with {{brand_name}}"
                  value={templateForm.subject}
                  onChange={e => setTemplateForm(p => ({ ...p, subject: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>Email Body</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {['{{brand_name}}', '{{first_name}}', '{{contact_name}}', '{{domain}}', '{{sender_name}}'].map(v => (
                <button
                  key={v}
                  onClick={() => insertVar(v)}
                  style={{
                    padding: '3px 8px', borderRadius: 6, border: '1px solid #c7d2fe',
                    background: '#eaedff', color: '#497cff', fontSize: '0.7rem',
                    cursor: 'pointer', fontFamily: 'monospace',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <textarea
              rows={9}
              placeholder={`Hi {{first_name}},\n\nI came across {{brand_name}} and would love to discuss a wholesale partnership...\n\nBest,\n{{sender_name}}`}
              value={templateForm.body}
              onChange={e => setTemplateForm(p => ({ ...p, body: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button onClick={saveTemplate} disabled={savingTemplate} style={btnStyle('#00174b', '#fff', true)}>
                {savingTemplate ? 'Saving…' : selectedTemplate ? 'Save Changes' : 'Create Template'}
              </button>
              {selectedTemplate && !selectedTemplate.is_default && (
                <button onClick={() => setAsDefault(selectedTemplate.id)} style={btnStyle('#f2f3ff', '#497cff')}>
                  Set as Default
                </button>
              )}
              {selectedTemplate && (
                <button onClick={() => deleteTemplate(selectedTemplate.id)} style={btnStyle('#fee2e2', '#dc2626')}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Add to Queue Card ── */}
      <div style={{ background: '#fff', border: '1px solid #eaedff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#131b2e' }}>
            Queue Emails
            <span style={{ marginLeft: 8, fontSize: '0.75rem', fontWeight: 400, color: '#76777d' }}>
              {brands.length} brands with email
            </span>
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Template selector */}
            <select
              value={queueTemplateId}
              onChange={e => setQueueTemplateId(e.target.value)}
              style={{ ...inputStyle, width: 180 }}
            >
              <option value="">Select template…</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (default)' : ''}</option>
              ))}
            </select>
            <button
              onClick={verifyEmails}
              disabled={verifyingEmails || selectedBrandIds.size === 0}
              style={btnStyle('#f2f3ff', '#497cff')}
            >
              {verifyingEmails ? 'Verifying…' : `Verify (${selectedBrandIds.size})`}
            </button>
            <button
              onClick={addToQueue}
              disabled={addingToQueue || selectedBrandIds.size === 0 || !queueTemplateId}
              style={btnStyle('#00174b', '#fff', true)}
            >
              {addingToQueue ? 'Adding…' : `Add to Queue (${selectedBrandIds.size})`}
            </button>
          </div>
        </div>

        {brands.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No brands with email found. Run brand discovery first.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={thStyle}>
                    <input
                      type="checkbox"
                      checked={selectedBrandIds.size === brands.length}
                      onChange={e => setSelectedBrandIds(e.target.checked ? new Set(brands.map(b => b.id)) : new Set())}
                    />
                  </th>
                  {['Brand Name', 'Email', 'Verification', 'Decision Maker'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selectedBrandIds.has(b.id)}
                        onChange={e => {
                          const next = new Set(selectedBrandIds);
                          e.target.checked ? next.add(b.id) : next.delete(b.id);
                          setSelectedBrandIds(next);
                        }}
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#131b2e' }}>{b.brand_name}</td>
                    <td style={tdStyle}><span style={{ color: '#497cff' }}>{b.wholesale_email}</span></td>
                    <td style={tdStyle}><VerifyBadge status={b.email_verification_status} /></td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{b.decision_maker_name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Queue Table ── */}
      <div style={{ background: '#fff', border: '1px solid #eaedff', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#131b2e' }}>
          Send Queue
        </h2>
        {queue.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', textAlign: 'center', padding: '1.5rem 0' }}>
            No emails in queue yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  {['Brand Name', 'To Email', 'Verification', 'Status', 'Queued At', 'Sent At'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map(q => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    title={q.error_message ?? ''}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#131b2e' }}>
                      {q.brands?.brand_name ?? '—'}
                    </td>
                    <td style={{ ...tdStyle, color: '#497cff' }}>{q.to_email}</td>
                    <td style={tdStyle}><VerifyBadge status={q.verification_status} /></td>
                    <td style={tdStyle}><StatusBadge status={q.status} /></td>
                    <td style={{ ...tdStyle, color: '#76777d' }}>{fmtDate(q.created_at)}</td>
                    <td style={{ ...tdStyle, color: '#76777d' }}>{q.sent_at ? fmtDate(q.sent_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── style helpers ── */
function btnStyle(bg: string, color: string, primary = false): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: primary ? '7px 16px' : '6px 12px',
    borderRadius: 8, border: 'none', cursor: 'pointer',
    background: bg, color,
    fontSize: '0.8rem', fontWeight: 600,
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
  };
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600,
  color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: '0.83rem', color: '#131b2e',
  background: '#fff', boxSizing: 'border-box', outline: 'none',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '8px 12px',
  background: '#f8fafc', borderBottom: '1px solid #eaedff',
  fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', verticalAlign: 'middle',
};

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: valueColor ?? '#131b2e' }}>{value}</div>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
