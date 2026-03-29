'use client';

import { useState, useEffect, useCallback } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  is_default: boolean;
  created_at: string;
}

interface QueueStats {
  today_sent: number;
  pending: number;
  daily_limit: number;
}

const DEFAULT_TEMPLATE_HTML = `<p>Hello {{decision_maker_name | there}},</p>

<p>My name is [YOUR NAME], and I represent [YOUR COMPANY] — an Amazon FBA seller specializing in [YOUR NICHE].</p>

<p>I came across <strong>{{brand_name}}</strong> and I'm genuinely impressed by your products. I'd love to explore a wholesale partnership that could help expand your reach on Amazon.</p>

<p>Here's what I can offer:</p>
<ul>
  <li>Consistent bulk orders</li>
  <li>Professional product listings</li>
  <li>Dedicated brand representation on Amazon</li>
</ul>

<p>Would you be open to a quick call this week to discuss terms?</p>

<p>Best regards,<br/>
[YOUR NAME]<br/>
[YOUR COMPANY]<br/>
[PHONE]</p>`;

export default function OutreachPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<QueueStats>({ today_sent: 0, pending: 0, daily_limit: 50 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  // Template form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('Wholesale Partnership Inquiry — {{brand_name}}');
  const [formBody, setFormBody] = useState(DEFAULT_TEMPLATE_HTML);
  const [formDefault, setFormDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [tRes, sRes] = await Promise.all([
      fetch('/api/email-templates'),
      fetch('/api/email-queue/send'),
    ]);
    if (tRes.ok) setTemplates(await tRes.json());
    if (sRes.ok) setStats(await sRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveTemplate = async () => {
    if (!formName || !formSubject) return;
    setSaving(true);
    const method = editId ? 'PATCH' : 'POST';
    const url = editId ? `/api/email-templates/${editId}` : '/api/email-templates';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, subject: formSubject, body_html: formBody, is_default: formDefault }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg(editId ? 'Şablon güncellendi.' : 'Şablon oluşturuldu.');
      setShowForm(false); setEditId(null);
      setFormName(''); setFormSubject('Wholesale Partnership Inquiry — {{brand_name}}');
      setFormBody(DEFAULT_TEMPLATE_HTML); setFormDefault(false);
      load();
    } else {
      setMsg('Hata: şablon kaydedilemedi.');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Şablonu sil?')) return;
    await fetch(`/api/email-templates/${id}`, { method: 'DELETE' });
    load();
  };

  const startEdit = (t: EmailTemplate) => {
    setEditId(t.id); setFormName(t.name); setFormSubject(t.subject);
    setFormBody(t.body_html || ''); setFormDefault(t.is_default);
    setShowForm(true);
  };

  const sendQueue = async () => {
    setSending(true); setMsg('');
    const res = await fetch('/api/email-queue/send', { method: 'POST' });
    const d = await res.json();
    setSending(false);
    if (res.ok) {
      setMsg(`✓ ${d.sent} email gönderildi${d.failed ? `, ${d.failed} başarısız` : ''}.`);
      load();
    } else {
      setMsg(`Hata: ${d.error}`);
    }
  };

  const card = (children: React.ReactNode, extra?: string) => (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 12, padding: '1.2rem 1.4rem', marginBottom: '1.2rem',
    }} className={extra}>
      {children}
    </div>
  );

  if (loading) return (
    <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>Yükleniyor…</div>
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>
        Outreach
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.6rem' }}>
        Bulunan email adreslerine günlük {stats.daily_limit} adet toplu outreach emaili gönder.
      </p>

      {msg && (
        <div style={{
          background: msg.startsWith('✓') ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${msg.startsWith('✓') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem',
          color: msg.startsWith('✓') ? '#4ade80' : '#f87171', fontSize: '0.85rem',
        }}>
          {msg}
        </div>
      )}

      {/* Günlük İstatistik */}
      {card(
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bugün Gönderilen</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa' }}>{stats.today_sent}<span style={{ fontSize: '1rem', color: '#64748b' }}>/{stats.daily_limit}</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kuyrukta Bekleyen</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a78bfa' }}>{stats.pending}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={sendQueue}
              disabled={sending || stats.pending === 0}
              style={{
                padding: '0.65rem 1.4rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: stats.pending > 0 ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(100,116,139,0.3)',
                color: '#fff', fontWeight: 600, fontSize: '0.87rem',
                opacity: sending ? 0.7 : 1,
              }}
            >
              {sending ? 'Gönderiliyor…' : `▶ Kuyruğu Gönder (${stats.pending})`}
            </button>
          </div>
        </div>
      )}

      {/* Email Şablonları */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' }}>Email Şablonları</h2>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setFormName(''); setFormSubject('Wholesale Partnership Inquiry — {{brand_name}}'); setFormBody(DEFAULT_TEMPLATE_HTML); setFormDefault(false); }}
          style={{
            padding: '0.4rem 0.9rem', borderRadius: 7, border: '1px solid rgba(99,102,241,0.4)',
            background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
          }}
        >
          + Yeni Şablon
        </button>
      </div>

      {/* Şablon formu */}
      {showForm && card(
        <div>
          <h3 style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editId ? 'Şablonu Düzenle' : 'Yeni Şablon'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Şablon Adı *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)}
                placeholder="Örn: Standart Outreach"
                style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Konu *</label>
              <input value={formSubject} onChange={e => setFormSubject(e.target.value)}
                placeholder="Wholesale Partnership Inquiry — {{brand_name}}"
                style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Email İçeriği (HTML) — <span style={{ color: '#60a5fa' }}>{'{{brand_name}}'}</span>, <span style={{ color: '#60a5fa' }}>{'{{decision_maker_name}}'}</span> değişkenleri desteklenir
              </label>
              <textarea value={formBody} onChange={e => setFormBody(e.target.value)} rows={12}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="is_default" checked={formDefault} onChange={e => setFormDefault(e.target.checked)} />
              <label htmlFor="is_default" style={{ fontSize: '0.82rem', color: '#94a3b8', cursor: 'pointer' }}>Varsayılan şablon olarak ayarla</label>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={saveTemplate} disabled={saving}
                style={{ padding: '0.5rem 1.2rem', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Şablon listesi */}
      {templates.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1.5rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 10 }}>
          Henüz şablon yok. "Yeni Şablon" butonuyla oluştur.
        </div>
      ) : templates.map(t => card(
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</span>
              {t.is_default && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: '0.67rem', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 600 }}>VARSAYILAN</span>}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Konu: {t.subject}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => startEdit(t)}
              style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem' }}>
              Düzenle
            </button>
            <button onClick={() => deleteTemplate(t.id)}
              style={{ padding: '0.3rem 0.7rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem' }}>
              Sil
            </button>
          </div>
        </div>
      ))}

      {/* Yardım kutusu */}
      {card(
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
            <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '0.4rem' }}>Nasıl çalışır?</strong>
            1. Lead Discovery'de marka araştır ve email adresleri bul.<br/>
            2. My Leads sayfasında markaları seçip "Kuyruğa Ekle" butonuna tıkla.<br/>
            3. Buradaki "Kuyruğu Gönder" butonu veya otomatik sabah cron'u günde 50 email gönderir.<br/>
            <br/>
            <strong style={{ color: '#a78bfa' }}>Email Ayarları:</strong> Gmail App Password veya Resend.com API key için Railway environment variables'a
            {' '}<code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.1rem 0.3rem', borderRadius: 3 }}>RESEND_API_KEY</code>{' + '}
            <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0.1rem 0.3rem', borderRadius: 3 }}>SENDER_EMAIL</code> ekle.
          </div>
        </div>
      )}
    </div>
  );
}
