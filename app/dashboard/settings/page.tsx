'use client';

import { useState, useEffect, useCallback } from 'react';

interface Profile {
  full_name?: string;
  email?: string;
  brands_used?: number;
  brands_limit?: number;
  credits_balance?: number;
  balance?: number;
}

// ── API Keys Panel Bileşeni ──────────────────────────────────────────────────

const API_KEY_CONFIGS = [
  {
    key_type: 'hunter',
    label: 'Hunter.io',
    description: 'Domain arama — 500 ücretsiz arama/ay. Scraping başarısız olduğunda devreye girer.',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    link: 'https://hunter.io/api-documentation/v2',
    linkText: 'API key al',
    badge: '500/ay ücretsiz',
    badgeColor: '#059669',
  },
  {
    key_type: 'apollo',
    label: 'Apollo.io',
    description: 'Karar verici kişi araması — 50 ücretsiz/ay. İsim + unvan + email bulur.',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    link: 'https://developer.apollo.io',
    linkText: 'API key al',
    badge: '50/ay ücretsiz',
    badgeColor: '#2563eb',
  },
  {
    key_type: 'brave',
    label: 'Brave Search API',
    description: 'Web arama — varsayılan key sistem key\'i. Kendi key\'inizi girerek kotayı artırın.',
    placeholder: 'BSA...',
    link: 'https://api.search.brave.com',
    linkText: 'API key al',
    badge: '2000/ay ücretsiz',
    badgeColor: '#7c3aed',
  },
  {
    key_type: 'clearout',
    label: 'Clearout.io',
    description: 'Email doğrulama — ücretli. T0-T3.8 başarısız olduğunda son çare olarak kullanılır.',
    placeholder: 'co_...',
    link: 'https://app.clearout.io/settings',
    linkText: 'API key al',
    badge: 'Ücretli',
    badgeColor: '#dc2626',
  },
];

function ApiKeysPanel() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const loadKeys = useCallback(async () => {
    try {
      const r = await fetch('/api/settings/api-keys');
      if (r.ok) {
        const data = await r.json();
        const maskedMap: Record<string, string> = {};
        for (const k of (data.keys || [])) {
          maskedMap[k.key_type] = k.has_key ? k.api_key_masked : '';
        }
        setKeys(maskedMap);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  const handleSave = async (key_type: string, value: string) => {
    try {
      const r = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_type, api_key: value }),
      });
      if (r.ok) {
        setSaved(p => ({ ...p, [key_type]: true }));
        setTimeout(() => setSaved(p => ({ ...p, [key_type]: false })), 2500);
        await loadKeys();
      }
    } catch { /* ignore */ }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1.4rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>🔑 API Key'lerim</h2>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0' }}>Kendi API key'lerinizi kullanarak aylık ücretsiz kotanızı yazılıma ekleyin</p>
        </div>
      </div>
      <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yükleniyor…</div>
        ) : API_KEY_CONFIGS.map(cfg => (
          <div key={cfg.key_type} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', paddingBottom: '1.25rem', borderBottom: '1px solid #f8fafc' }}>
            {/* Sol: label + açıklama */}
            <div style={{ minWidth: '200px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{cfg.label}</span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', color: cfg.badgeColor, background: cfg.badgeColor + '15', border: `1px solid ${cfg.badgeColor}30` }}>
                  {cfg.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{cfg.description}</p>
              <a href={cfg.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.65rem', color: '#2563eb', textDecoration: 'none', marginTop: '0.3rem', display: 'inline-block' }}>
                → {cfg.linkText} ↗
              </a>
            </div>
            {/* Sağ: input + kaydet */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={visible[cfg.key_type] ? 'text' : 'password'}
                    placeholder={keys[cfg.key_type] ? '••••••••••••••••' : cfg.placeholder}
                    defaultValue=""
                    onChange={e => setKeys(p => ({ ...p, [cfg.key_type + '_input']: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'monospace', boxSizing: 'border-box', background: '#fafafa', outline: 'none' }}
                  />
                  <button onClick={() => setVisible(p => ({ ...p, [cfg.key_type]: !p[cfg.key_type] }))}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {visible[cfg.key_type] ? '🙈' : '👁'}
                  </button>
                </div>
                <button
                  onClick={() => handleSave(cfg.key_type, keys[cfg.key_type + '_input'] || '')}
                  style={{ padding: '0.5rem 1rem', background: saved[cfg.key_type] ? '#059669' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', minWidth: '80px' }}>
                  {saved[cfg.key_type] ? '✓ Kaydedildi' : 'Kaydet'}
                </button>
              </div>
              {/* Mevcut key durumu */}
              {keys[cfg.key_type] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.55rem', color: '#059669' }}>●</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>Aktif key: {keys[cfg.key_type]}</span>
                  <button onClick={() => handleSave(cfg.key_type, '')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6rem', color: '#ef4444', marginLeft: '0.25rem' }}>✕ Kaldır</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
                alert('Hesap silme — support@wholesale-scout.com ile iletişime geçin');
              }
            }}
          >
            Delete my account
          </button>
        </Field>
      </Section>

      {/* ── API KEYS PANELİ ── */}
      <ApiKeysPanel />

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
