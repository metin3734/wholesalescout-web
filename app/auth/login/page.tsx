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
  const [showPass, setShowPass] = useState(false);

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.9rem',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.9rem',
    color: '#1f2937', outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden', background:'#f8fafc', fontFamily:'"Inter",system-ui,sans-serif' }}>

      {/* ── Left panel: Brand/slogan ────────────────────────────── */}
      <div style={{
        flex: '0 0 45%', maxWidth: 480,
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #1e40af 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: '3rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative light effects */}
        <div style={{ position:'absolute', top:'-100px', left:'-80px', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'4rem' }}>
          <div style={{ width:40, height:40, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(255,255,255,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <span style={{ color:'#ffffff', fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>WholesaleScout</span>
        </div>

        {/* Slogan */}
        <h2 style={{ fontSize:'2.4rem', fontWeight:800, color:'#fff', lineHeight:1.15, letterSpacing:'-0.03em', marginBottom:'1rem', fontFamily:'"Manrope",system-ui,sans-serif' }}>
          Find Your<br />Edge.
        </h2>
        <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.85)', lineHeight:1.65, marginBottom:'2.5rem', maxWidth:'300px' }}>
          Empowering Wholesale Businesses.<br />
          Real-time OSINT · AI-powered · 500+ brands/day
        </p>

        {/* Stats */}
        <div style={{ display:'flex', gap:'2rem' }}>
          {[['3.4K+','Doğrulanmış İletişim'],['98%','Veri Doğruluğu'],['2dk','Marka Başına']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#ffffff', fontFamily:'"Manrope",system-ui,sans-serif' }}>{v}</div>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.75)', marginTop:'0.1rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: Login form ───────────────────────────────── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'#ffffff' }}>
        <div style={{ width:'100%', maxWidth:'400px' }}>

          <h1 style={{ fontSize:'1.75rem', fontWeight:800, color:'#1f2937', letterSpacing:'-0.03em', marginBottom:'0.4rem', fontFamily:'"Manrope",system-ui,sans-serif' }}>
            Welcome Back!
          </h1>
          <p style={{ color:'#6b7280', fontSize:'0.88rem', marginBottom:'2rem' }}>
            Sign in to your account.
          </p>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'0.75rem 1rem', borderRadius:'10px', fontSize:'0.85rem', marginBottom:'1.25rem' }}>
              {error}
            </div>
          )}

          {/* Google button */}
          <button onClick={handleGoogle} style={{
            width:'100%', padding:'0.72rem', marginBottom:'1.5rem',
            background:'#ffffff', border:'1px solid #e5e7eb',
            borderRadius:'10px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', color:'#374151',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem',
            transition:'all 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor='#d1d5db';}}
          onMouseLeave={e=>{e.currentTarget.style.background='#ffffff'; e.currentTarget.style.borderColor='#e5e7eb';}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
            <span style={{ fontSize:'0.75rem', color:'#9ca3af' }}>or sign in with email</span>
            <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
          </div>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#6b7280', marginBottom:'0.4rem', letterSpacing:'0.02em' }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', display:'flex' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="yourname@email.com" style={{ ...inputStyle, paddingLeft:'2.4rem' }} />
              </div>
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#6b7280', letterSpacing:'0.02em' }}>Password</label>
                <Link href="/auth/forgot-password" style={{ fontSize:'0.75rem', color:'#2563eb', textDecoration:'none' }}>Forgot Password?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', display:'flex' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingLeft:'2.4rem', paddingRight:'2.4rem' }} />
                <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:'0.8rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'0.75rem', marginTop:'0.25rem',
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
              color:'#fff', border:'none', borderRadius:'10px',
              fontWeight:700, fontSize:'0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
              boxShadow: loading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
              transition:'all 0.15s',
            }}>
              {loading ? 'Signing in…' : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:'#9ca3af' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color:'#2563eb', fontWeight:700, textDecoration:'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
