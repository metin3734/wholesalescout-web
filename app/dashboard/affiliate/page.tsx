'use client';

import { useState } from 'react';

const TIERS = [
  { range: '0–4',  pct: 20, color: '#94a3b8' },
  { range: '5–19', pct: 25, color: '#2563eb' },
  { range: '20+',  pct: 30, color: '#7c3aed' },
];

const MOCK_STATS = {
  referrals: 0,
  conversions: 0,
  earnings: 0,
  pendingPayout: 0,
};

export default function AffiliatePage() {
  const [copied, setKopyalandı] = useState(false);
  const refLink = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=YOUR_CODE`
    : 'https://wholesalescout.com/signup?ref=YOUR_CODE';

  function copyLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setKopyalandı(true);
      setTimeout(() => setKopyalandı(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px', padding: '2rem 2.5rem', color: '#fff' }}>
        <div style={{ maxWidth: '520px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.9rem' }}>
            💰 ORTAKLIK PROGRAMI
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.25, marginBottom: '0.6rem' }}>
            Aylık tekrarlayan %30'a kadar komisyon kazan
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
            Refer wholesale sourcing teams, Amazon sellers, and brand agencies to WholesaleScout.
            You earn komisyon every month they stay subscribed.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              style={{ padding: '0.5rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => alert('Başvuru formu — yakında')}
            >
              Şimdi Başvur
            </button>
            <button
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' }}
              onClick={() => alert('Program detayları PDF — yakında')}
            >
              Koşulları Gör
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Yönlendirme Tıklamaları', value: MOCK_STATS.referrals,    icon: '🔗' },
          { label: 'Dönüşümler',     value: MOCK_STATS.conversions,   icon: '✅' },
          { label: 'Toplam Kazanç',  value: `$${MOCK_STATS.earnings}`,icon: '💵' },
          { label: 'Bekleyen Ödeme',  value: `$${MOCK_STATS.pendingPayout}`, icon: '⏳' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</span>
              <span>{s.icon}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#0f172a' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.65rem' }}>
          Referans Linkiniz
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1, padding: '0.55rem 0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.78rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {refLink}
          </div>
          <button
            onClick={copyLink}
            style={{ padding: '0.55rem 1rem', background: copied ? '#22c55e' : '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', minWidth: '80px' }}
          >
            {copied ? '✓ Kopyalandı' : 'Kopyala'}
          </button>
        </div>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Bu linki paylaşın. Birisi kaydolup abone olduğunda komisyon kazanırsınız.
        </div>
      </div>

      {/* Commission tiers */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.75rem' }}>
          Komisyon Kademeleri
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          {TIERS.map((t) => (
            <div
              key={t.range}
              style={{ borderRadius: '9px', border: `1px solid ${t.color}30`, background: `${t.color}08`, padding: '0.9rem 1rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: t.color }}>{t.pct}%</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginTop: '0.2rem' }}>komisyon</div>
              <div style={{ fontSize: '0.63rem', color: '#94a3b8', marginTop: '0.3rem' }}>{t.range} aktif yönlendirme</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Commission is paid monthly via Stripe for all active subscriptions referred by you.
          Minimum payout threshold is $50. Payouts processed on the 1st of each month.
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.75rem' }}>
          Nasıl Çalışır
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { step: '01', title: 'Linkinizi paylaşın', desc: 'Kopyala your unique referral link and share it with your audience, team, or network.' },
            { step: '02', title: 'Kayıt olurlar', desc: 'Birisi linkinize tıklayıp ücretli hesap oluşturursa, size bağlanır.' },
            { step: '03', title: 'Her ay kazanın', desc: 'You receive recurring komisyon for every month they remain subscribed — no limit.' },
          ].map((item) => (
            <div key={item.step} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b', fontSize: '0.65rem', flexShrink: 0 }}>
                {item.step}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', marginBottom: '0.15rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
