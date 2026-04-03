'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  created_at: string;
}

interface CreditsData {
  balance: number;
  brands_used: number;
  brands_limit: number;
  transactions: Transaction[];
}

const TYPE_CFG: Record<string, { color: string; bg: string; sign: string; label: string }> = {
  purchase: { color: '#15803d', bg: '#f0fdf4', sign: '+', label: 'Purchase' },
  usage:    { color: '#b45309', bg: '#fffbeb', sign: '−', label: 'Used' },
  refund:   { color: '#0369a1', bg: '#f0f9ff', sign: '+', label: 'Refund' },
  bonus:    { color: '#7c3aed', bg: '#f5f3ff', sign: '+', label: 'Bonus' },
};

const PLAN_PRICES = [
  { name: 'Starter', price: 49,   credits: 800,   per: '$0.061/marka', badge: null,          dark: false },
  { name: 'Growth',  price: 199,  credits: 4000,  per: '$0.050/marka', badge: null,          dark: false },
  { name: 'Pro',     price: 499,  credits: 12000, per: '$0.042/marka', badge: 'EN POPÜLER',  dark: true  },
  { name: 'Agency',  price: 1399, credits: 40000, per: '$0.035/marka', badge: 'EN İYİ DEĞER', dark: false },
];

export default function CreditsPage() {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      if (!res.ok) return;
      setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckout = async (planName: string) => {
    setCheckoutLoading(planName);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error || 'Failed to create checkout session');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '0.85rem' }}>
        Loading…
      </div>
    );
  }

  const balance   = data?.balance ?? 0;
  const used      = data?.brands_used ?? 0;
  const limit     = data?.brands_limit ?? 10;
  const usedPct   = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const txs       = data?.transactions ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Balance + usage row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>

        {/* Credit balance */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '12px', padding: '1.4rem 1.5rem', color: '#fff' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.6rem' }}>
            Credit Balance
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
            {balance.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>kredi kaldı</div>
          <button
            style={{ marginTop: '1rem', padding: '0.45rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
            onClick={() => handleCheckout('Growth')}
            disabled={checkoutLoading !== null}
          >
            {checkoutLoading === 'Growth' ? 'Yönlendiriliyor…' : '+ Kredi Satın Al'}
          </button>
        </div>

        {/* Monthly usage */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.4rem 1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.6rem' }}>
            Kullanım
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{used.toLocaleString()}</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>marka arandı</span>
          </div>
          <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.4rem' }}>
            <div style={{
              height: '100%',
              width: `${usedPct}%`,
              background: usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e',
              borderRadius: '999px',
              transition: 'width 0.4s',
            }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Toplam {balance.toLocaleString()} kredinizin {usedPct}% kullanıldı</div>
        </div>
      </div>

      {/* Credit packages */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>
            Kredi Satın Al
          </h2>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Tek seferlik ödeme · Abonelik yok</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
          {PLAN_PRICES.map((p) => (
            <div
              key={p.name}
              style={{
                background: p.dark ? '#0f172a' : '#fff',
                borderRadius: '10px',
                border: p.dark ? '2px solid #3b82f6' : p.badge ? '2px solid #e2e8f0' : '1px solid #e2e8f0',
                padding: '1.1rem 1.2rem',
                position: 'relative',
              }}
            >
              {p.badge && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: p.dark ? '#3b82f6' : '#f59e0b', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
                  {p.badge}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: p.dark ? '#f8fafc' : '#0f172a', marginBottom: '0.5rem' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.1rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: p.dark ? '#93c5fd' : '#64748b' }}>$</span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, color: p.dark ? '#fff' : '#0f172a', lineHeight: 1 }}>{p.price.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: p.dark ? '#93c5fd' : '#2563eb', fontWeight: 600, marginBottom: '0.2rem' }}>
                {p.credits.toLocaleString()} marka kredisi
              </div>
              <div style={{ fontSize: '0.65rem', color: p.dark ? '#475569' : '#94a3b8', marginBottom: '0.9rem' }}>
                {p.per} · tek seferlik
              </div>
              <button
                style={{ width: '100%', padding: '0.45rem', background: p.dark ? '#2563eb' : '#f8fafc', color: p.dark ? '#fff' : '#0f172a', border: p.dark ? 'none' : '1px solid #e2e8f0', borderRadius: '7px', fontWeight: 600, fontSize: '0.72rem', cursor: checkoutLoading ? 'not-allowed' : 'pointer', opacity: checkoutLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}
                onClick={() => handleCheckout(p.name)}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === p.name ? 'Yönlendiriliyor…' : 'Satın Al'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.65rem' }}>
          İşlem Geçmişi
        </h2>

        {txs.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
            Henüz işlem yok
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Date', 'Description', 'Type', 'Amount'].map((h) => (
                    <th key={h} style={{ padding: '0.55rem 1rem', textAlign: h === 'Amount' ? 'right' : 'left', fontWeight: 600, color: '#94a3b8', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => {
                  const cfg = TYPE_CFG[tx.type] ?? TYPE_CFG.usage;
                  return (
                    <tr key={tx.id} style={{ borderBottom: i < txs.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '0.6rem 1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.6rem 1rem', color: '#0f172a' }}>{tx.description}</td>
                      <td style={{ padding: '0.6rem 1rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.15rem 0.45rem', borderRadius: '5px', background: cfg.bg, color: cfg.color, fontSize: '0.63rem', fontWeight: 600 }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: 700, color: cfg.color }}>
                        {cfg.sign}{Math.abs(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
      }
