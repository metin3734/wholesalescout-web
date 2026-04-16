import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import SidebarNav from './_components/sidebar-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, brands_used, brands_limit, plan')
    .eq('id', user.id)
    .single();

  const plan = (profile as Record<string, unknown>)?.plan as string ?? profile?.subscription_status ?? 'free';
  const used = profile?.brands_used ?? 0;
  const limit = profile?.brands_limit ?? 10;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const planLabel =
    plan === 'free'    ? 'Free'
    : plan === 'elite' ? 'Elite'
    : plan === 'agency'? 'Agency'
    : plan.charAt(0).toUpperCase() + plan.slice(1);

  const planColors = ({
    elite:   { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', glow: 'rgba(245,158,11,0.4)' },
    agency:  { bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff', glow: 'rgba(139,92,246,0.4)' },
    pro:     { bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', glow: 'rgba(59,130,246,0.4)' },
    starter: { bg: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', glow: 'rgba(16,185,129,0.3)' },
    free:    { bg: '#f1f5f9',                                  color: '#64748b', glow: 'none' },
  } as Record<string, { bg: string; color: string; glow: string }>)[plan] ?? { bg: '#f1f5f9', color: '#64748b', glow: 'none' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: '232px', flexShrink: 0, background: '#ffffff',
        display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden',
        borderRight: '1px solid #e5e7eb', position: 'relative',
      }}>
        {/* Top gradient line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #2563eb, #7c3aed, transparent)',
        }} />

        {/* Logo */}
        <div style={{ padding: '1.2rem 1.1rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#1f2937', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                WholesaleScout
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.55rem', fontWeight: 500, marginTop: '0.15rem', fontFamily: 'monospace' }}>
                wholesale-scout.com
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Bottom */}
        <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          {/* Plan + usage */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.55rem', background: planColors.bg, color: planColors.color,
              borderRadius: '6px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.04em',
              boxShadow: planColors.glow !== 'none' ? `0 0 8px ${planColors.glow}` : 'none',
            }}>★ {planLabel}</div>
            <span style={{ fontSize: '0.63rem', color: '#9ca3af' }}>
              {used.toLocaleString()}/{limit === 999999 ? '∞' : limit.toLocaleString()}
            </span>
          </div>
          {limit !== 999999 && (
            <div style={{ height: '3px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: pct > 85 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#2563eb,#7c3aed)',
                borderRadius: '999px', transition: 'width 0.4s ease',
              }} />
            </div>
          )}
          {/* User row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
            }}>
              {(user.email?.[0] ?? 'U').toUpperCase()}
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.7rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
            <form action="/auth/signout" method="post" style={{ flexShrink: 0 }}>
              <button title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem', display: 'flex', alignItems: 'center', borderRadius: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid #e5e7eb',
          padding: '0 1.5rem', height: '54px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, zIndex: 30,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '3px', height: '20px', borderRadius: '999px', background: 'linear-gradient(180deg,#2563eb,#7c3aed)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937', letterSpacing: '-0.01em' }}>WholesaleScout</div>
              <div style={{ color: '#9ca3af', fontSize: '0.67rem' }}>OSINT + AI pipeline · Real-time enrichment</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {limit !== 999999 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.7rem', background: '#f1f5f9', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div style={{ width: '48px', height: '3px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct > 85 ? '#ef4444' : '#2563eb', borderRadius: '999px' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 500 }}>{used}/{limit}</span>
              </div>
            )}
            <div style={{
              padding: '0.25rem 0.65rem', background: planColors.bg, color: planColors.color,
              borderRadius: '7px', fontSize: '0.68rem', fontWeight: 800,
              boxShadow: planColors.glow !== 'none' ? `0 0 8px ${planColors.glow}` : 'none',
            }}>★ {planLabel}</div>
            {plan === 'free' && (
              <Link href="/dashboard/credits" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.3rem 0.7rem', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color: '#fff', borderRadius: '7px', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 700,
              }}>Upgrade →</Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
