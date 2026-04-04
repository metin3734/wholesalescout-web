'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ── Beta kapasitesi kontrolü ───────────────────────────────────────────────
    try {
      const betaRes = await fetch('/api/auth/beta-check');
      const beta = await betaRes.json();
      if (!beta.available) {
        setError('Beta erişimi doldu. Şu an yeni kayıt kabul etmiyoruz.');
        setLoading(false);
        return;
      }
    } catch {
      // Kontrol başarısız olursa devam etme
      setError('Sunucu hatası. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
        <div style={{
          background: 'var(--card)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: '2rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>E-postanızı kontrol edin</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
            <strong>{email}</strong> adresine bir onay linki gönderdik.
            Hesabınızı etkinleştirmek için linke tıklayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px' }}>
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Hesap Oluştur</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Kapalı beta — sınırlı erişim.
        </p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem',
            fontSize: '0.875rem', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              E-posta
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                fontSize: '0.9rem', outline: 'none',
                background: 'var(--background)', color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Şifre
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              minLength={8} placeholder="8+ characters"
              style={{
                width: '100%', padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                fontSize: '0.9rem', outline: 'none',
                background: 'var(--background)', color: 'var(--foreground)',
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.65rem',
              background: loading ? '#93c5fd' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: '0.5rem',
              fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Hesap oluşturuluyor…' : 'Hesap Oluştur'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
