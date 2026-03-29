'use client';

import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';h
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
  purchase: { color: '#15803d', bg: '#f0fdf4', sign: '+', label: 'Satın Alma' },
  usage:    { color: '#b45309', bg: '#fffbeb', sign: '−', label: 'Kullanıldı' },
  refund:   { color: '#0369a1', bg: '#f0f9ff', sign: '+', label: 'İade' },
  bonus:    { color: '#7c3aed', bg: '#f5f3ff', sign: '+', label: 'Bonus' },
};

const PLAN_PRICES = [
  { name: 'Starter', price: 19, credits: 100, per: '$0.25/brand', color: '#2563eb' },
  { name: 'Pro',     price: 49, credits: 500, per: '$0.20/brand', color: '#7c3aed', popular: true },
  { name: 'Elite',   price: 99, credits: 2000, per: '$0.15/brand', color: '#0f172a' },
];

export default function CreditsPage() {
  const [data, setData] = useState<CreditsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      if (!res.ok) return;
      setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '0.85rem' }}>
        Yükleniyor…
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
            Kredi Bakiyesi
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
            {balance.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>kalan kredi</div>
          <button
            style={{ marginTop: '1rem', padding: '0.45rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
            onClick={() => alert('Stripe ödeme — yakında')}
          >
            + Kredi Satın Al
          </button>
        </div>

        {/* Monthly usage */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.4rem 1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.6rem' }}>
            Aylık Kullanım
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{used}</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ {limit === 999999 ? '∞' : limit}</span>
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
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{usedPct}% aylık plan kullanıldı</div>
        </div>
      </div>

      {/* Upgrade plans */}
      <div>
        <h2 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.65rem' }}>
          Planı Yükselt
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
          {PLAN_PRICES.map((p) => (
            <div
              key={p.name}
              style={{
                background: p.popular ? '#0f172a' : '#fff',
                borderRadius: '10px',
                border: p.popular ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                padding: '1.1rem 1.2rem',
                position: 'relative',
              }}
            >
              {p.popular && (
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                  EN POPÜLER
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: p.popular ? '#f8fafc' : '#0f172a', marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: p.popular ? '#fff' : '#0f172a' }}>${p.price}</span>
                <span style={{ fontSize: '0.7rem', color: p.popular ? '#64748b' : '#94a3b8' }}>/ay</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: p.popular ? '#93c5fd' : '#64748b', marginBottom: '0.15rem' }}>{p.credits} brands/aynth</div>
              <div style={{ fontSize: '0.68rem', color: p.popular ? '#475569' : '#94a3b8', marginBottom: '0.85rem' }}>{p.per} ek maliyet</div>
              <button
                style={{ width: '100%', padding: '0.45rem', background: p.popular ? '#2563eb' : '#f8fafc', color: p.popular ? '#fff' : '#0f172a', border: p.popular ? 'none' : '1px solid #e2e8f0', borderRadius: '7px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={() => alert('Stripe ödeme — yakında')}
              >
                {p.name}
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
                  {['Tarih', 'Açıklama', 'Tür', 'Tutar'].map((h) => (
                    <th key={h} style={{ padding: '0.55rem 1rem', textAlign: h === 'Tutar' ? 'right' : 'left', fontWeight: 600, color: '#94a3b8', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
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
