'use client';

import { useState, useEffect } from 'react';

interface Profile {
  full_name?: string;
  email?: string;
  brands_used?: number;
  brands_limit?: number;
  credits_balance?: number;
  balance?: number;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.4rem', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{title}</h2>
      </div>
      <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      <div style={{ minWidth: '180px', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{label}</div>
        {hint && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem', lineHeight: 1.45 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.48rem 0.75rem',
  border: '1px solid #e2e8f0',
  borderRadius: '7px',
  fontSize: '0.8rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyComplete, setNotifyComplete] = useState(true);

  useEffect(() => {
    // Load profile via Supabase client (no extra API needed — reuse credits endpoint)
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setProfile(d); if (d.full_name) setName(d.full_name); }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    try {
      const r = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      });
      if (!r.ok) { alert('Kayıt başarısız'); return; }
    } catch { /* ignore */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '680px' }}>

      {/* Profile */}
      <Section title="Profil">
        <Field label="Görünen Ad" hint="Dashboard ve dışa aktarımlarınızda gösterilir.">
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
          />
        </Field>
        <Field label="E-posta Adresi" hint="Giriş e-postanız — değiştirmek için destek ile iletişime geçin.">
          <input
            style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
            value={profile.email ?? ''}
            readOnly
          />
        </Field>
      </Section>

      {/* Plan */}
      <Section title="Mevcut Plan">
        <Field label="Plan" hint="İstediğiniz zaman yükseltin veya düşürün.">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'inline-flex', padding: '0.3rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', fontWeight: 700, fontSize: '0.75rem' }}>
              Free
            </span>
            <button
              style={{ padding: '0.3rem 0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
              onClick={() => alert('Stripe ödeme — yakında')}
            >
              Upgrade
            </button>
          </div>
        </Field>
        <Field label="Bu Ayki Kullanım" hint="Her ayın 1'inde sıfırlanır.">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, ((profile.brands_used ?? 0) / (profile.brands_limit ?? 10)) * 100)}%`,
                background: '#2563eb',
                borderRadius: '999px',
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {profile.brands_used ?? 0} / {profile.brands_limit === 999999 ? '∞' : (profile.brands_limit ?? 10)}
            </span>
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Bildirimler">
        <Field label="E-posta Bildirimleri" hint="Bir iş tamamlandığında e-posta alın.">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <div
              onClick={() => setNotifyEmail(!notifyEmail)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '999px',
                background: notifyEmail ? '#2563eb' : '#e2e8f0',
                position: 'relative',
                transition: 'background 0.2s',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: notifyEmail ? '18px' : '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>Send email on job completion</span>
          </label>
        </Field>
        <Field label="Tarayıcı Bildirimleri" hint="Sekme açıkken bildirim alın.">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <div
              onClick={() => setNotifyComplete(!notifyComplete)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '999px',
                background: notifyComplete ? '#2563eb' : '#e2e8f0',
                position: 'relative',
                transition: 'background 0.2s',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: notifyComplete ? '18px' : '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>Show browser notification</span>
          </label>
        </Field>
      </Section>

      {/* API keys */}
      <Section title="API Yapılandırması">
        <Field label="Worker URL" hint="FastAPI worker uç noktası. Yalnızca kendi sunucunuzda barındırıyorsanız değiştirin.">
          <input
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}
            defaultValue={process.env.NEXT_PUBLIC_WORKER_URL ?? 'http://127.0.0.1:8000'}
            readOnly
          />
        </Field>
        <Field label="Dışa Aktarma Formatı" hint="Zenginleştirilmiş sonuçları indirirken varsayılan format.">
          <select style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="xlsx">Excel (.xlsx) — önerilen</option>
            <option value="csv">CSV (.csv)</option>
          </select>
        </Field>
      </Section>

      {/* Danger zone */}
      <Section title="Tehlikeli Bölge">
        <Field label="Hesabı Sil" hint="Hesabınızı ve tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.">
          <button
            style={{ padding: '0.45rem 1rem', background: '#fff', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '7px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
            onClick={() => {
              if (confirm('Emin misiniz? Bu işlem hesabınızı ve tüm zenginleştirilmiş verilerinizi kalıcı olarak silecektir.')) {
                alert('Hesap silme — support@wholesalescout.com ile iletişime geçin');
              }
            }}
          >
            Delete my account
          </button>
        </Field>
      </Section>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.55rem 1.5rem',
            background: saved ? '#22c55e' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saved ? '✓ Kaydedildi' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

    </div>
  );
}
