'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(next);
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px' }}>
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Tekrar hoş geldiniz</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          WholesaleScout hesabınıza giriş yapın
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

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '0.6rem', marginBottom: '1.25rem',
          border: '1px solid var(--border)', borderRadius: '0.5rem',
          background: 'white', cursor: 'pointer', fontWeight: 600,
          fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile devam et
        </button>

        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          veya
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Şifre</label>
              <Link href="/auth/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Unuttum?
              </Link>
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
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
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
          Hesabınız yok mu?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
