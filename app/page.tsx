import Link from 'next/link';

/* ─── Data ─────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: 'language',       title: 'Domain Discovery',        desc: 'Match brand names to official corporate domains with 90%+ accuracy. 4-tier fallback: DNS → Brave → DDG → SerpAPI.' },
  { icon: 'alternate_email',title: 'Wholesale Email Finder',  desc: 'Skip generic info@ addresses. Get real wholesale@, trade@, and B2B sales emails scraped from official brand sites.' },
  { icon: 'badge',          title: 'LinkedIn Decision Maker', desc: 'Automatically surface Heads of Wholesale, Buyers, and Sales Directors with title and LinkedIn profile link.' },
  { icon: 'shield',         title: 'Brand Qualification',     desc: 'Pre-filter brands as Qualified / Marginal / Inactive. Flag distributors, resellers, and fraud-risk accounts automatically.' },
  { icon: 'cloud_upload',   title: 'Keepa CSV Support',       desc: 'Auto-detect Keepa exports alongside regular brand lists. 28 product metrics analyzed per ASIN.' },
  { icon: 'download',       title: 'Color-Coded Export',      desc: 'Download a fully enriched Excel file (green = verified, yellow = partial) ready for immediate outreach.' },
];

const PLANS = [
  { name: 'Free',    price: '$0',  period: '/mo', cta: 'Get Started',   href: '/auth/signup',            featured: false, features: ['10 brand scans / mo', 'Domain discovery', 'Basic email finder', 'CSV export'] },
  { name: 'Starter', price: '$19', period: '/mo', cta: 'Select Starter',href: '/auth/signup?plan=starter',featured: false, features: ['100 brand scans / mo', 'Keepa CSV support', 'LinkedIn finder', 'Brand qualification'] },
  { name: 'Pro',     price: '$49', period: '/mo', cta: 'Go Pro',         href: '/auth/signup?plan=pro',   featured: true,  features: ['500 brand scans / mo', 'Wholesale score (0–100)', 'Fraud detection', 'Outreach templates', 'Priority pipeline'] },
  { name: 'Agency',  price: '$99', period: '/mo', cta: 'Contact Sales',  href: '/auth/signup?plan=agency',featured: false, features: ['Unlimited scans', 'Team sub-accounts (5)', 'Custom API access', 'White-label export', 'Dedicated support'] },
];

const FAQS = [
  { q: 'How accurate is the contact data?',           a: 'Domain discovery achieves 90%+ success. Emails are scraped directly from brand websites — no pattern-guessing, no fake addresses.' },
  { q: 'What is the Keepa Wholesale Score?',          a: '28 Keepa metrics per ASIN analyzed — Buy Box %, BSR trend, seller count, monthly sales — produce a 0–100 score. ≥65 = WHOLESALE_UYGUN, 40–64 = TEKRAR_KONTROL, <40 = ELENDI.' },
  { q: 'How is it different from Hunter.io?',         a: 'Hunter.io finds generic emails. WholesaleScout is wholesale-specific: verified wholesale contacts, fraud flags, Keepa profitability, LinkedIn decision makers.' },
  { q: 'Does it work for brands outside the US?',     a: 'Yes. Supports international TLDs (.co.uk, .com.au, .de, .ca, etc.). Keepa analysis focuses on Amazon US marketplace.' },
  { q: 'Can I cancel my subscription anytime?',       a: 'Yes. Cancel from Credits & Plans at any time — no questions asked. Your data remains until end of the billing period.' },
];

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#fff', color: '#0f172a' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>search</span>
            </div>
            <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 800, fontSize: 17, color: '#0f172a', letterSpacing: '-0.02em' }}>WholesaleScout</span>
          </Link>

          <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            {[['Features','#features'],['Keepa','#keepa'],['Pricing','#pricing'],['FAQ','#faq']].map(([l,h]) => (
              <a key={l} href={h} style={{ color: '#64748b', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/auth/login" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Login</Link>
            <Link href="/auth/signup" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 60 }}>

        {/* HERO */}
        <section style={{ background: '#fff', padding: '80px 24px 72px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                Amazon FBA Wholesale Research
              </span>
              <h1 style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 20 }}>
                Find wholesale contacts{' '}
                <span style={{ color: '#2563eb' }}>10x faster</span>{' '}
                with AI.
              </h1>
              <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
                Upload your brand list or Keepa CSV. WholesaleScout finds verified domains,
                decision-maker emails, and LinkedIn profiles in minutes — not hours.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/auth/signup" style={{ background: '#2563eb', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Start for free
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </Link>
                <Link href="/dashboard" style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '14px 24px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>dashboard</span>
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Right: mockup */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              {/* Window chrome */}
              <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                <span style={{ marginLeft: 10, color: '#64748b', fontSize: 11, fontWeight: 500 }}>WholesaleScout — Lead Discovery</span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ n: '247', l: 'Brands Analyzed' }, { n: '89%', l: 'Email Found' }, { n: '184', l: 'LinkedIn' }].map(s => (
                    <div key={s.l} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{s.n}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Brands */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {[
                    { name: 'Columbia Sportswear', score: 92, color: '#10b981' },
                    { name: 'Hydro Flask',         score: 78, color: '#3b82f6' },
                    { name: 'Stanley',              score: 65, color: '#3b82f6' },
                  ].map(r => (
                    <div key={r.name} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                        {r.name[0]}
                      </div>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{r.name}</span>
                      <span style={{ background: r.color, color: '#fff', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{r.score}</span>
                    </div>
                  ))}
                </div>
                {/* Bottom stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '3px solid #10b981', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Wholesale Emails</div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 800, color: '#2563eb' }}>218</div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '3px solid #2563eb', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Decision Makers</div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 800, color: '#2563eb' }}>147</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section style={{ background: '#0f172a', padding: '40px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[['90%+','Domain Discovery Rate'],['10x','Faster Than Manual'],['11','Enrichment Stages'],['28','Keepa Metrics']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{v}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEM */}
        <section style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, color: '#0f172a' }}>
              Manual research is killing your ROI.
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, marginBottom: 40 }}>
              The average Amazon wholesale seller wastes <strong style={{ color: '#0f172a' }}>40+ hours per month</strong> googling
              brand websites and guessing contact emails. That&apos;s revenue left on the table every single month.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>error</span>
                  <strong style={{ color: '#0f172a', fontSize: 15 }}>The Manual Way</strong>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                  Google brand → Find website → Hunt for Contact page → Guess email pattern.
                  Repeat 200 times. 40+ hours wasted. 20% accuracy.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <strong style={{ color: '#0f172a', fontSize: 15 }}>The WholesaleScout Way</strong>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                  Upload CSV → Get verified wholesale emails, LinkedIn decision makers,
                  and Keepa scores automatically. 10 minutes. 90%+ accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 56 }}>
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Features</span>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#0f172a' }}>
                Advanced tools for serious Amazon sellers.
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500 }}>
                An 11-stage enrichment pipeline that goes from brand name to actionable contact data.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: 22 }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEEPA */}
        <section id="keepa" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Mockup */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              {/* Card 1 */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Columbia Sportswear</span>
                  <span style={{ background: '#10b981', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>WHOLESALE_UYGUN</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '87%', background: '#10b981', borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                  <span>Score: 87/100</span><span>Amazon BB%: 0%</span>
                </div>
              </div>
              {/* Card 2 */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16, opacity: 0.6, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Generic Brand Co.</span>
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>ELENDI</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '22%', background: '#ef4444', borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                  <span>Score: 22/100</span><span>Amazon BB%: 78%</span>
                </div>
              </div>
              {/* Category counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'WHOLESALE_UYGUN', bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', count: '147' },
                  { label: 'TEKRAR_KONTROL',  bg: '#fefce8', border: '#fde68a', text: '#d97706', count: '63' },
                  { label: 'ELENDI',          bg: '#fff5f5', border: '#fecaca', text: '#dc2626', count: '91' },
                ].map(b => (
                  <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 24, fontWeight: 800, color: b.text }}>{b.count}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: b.text, marginTop: 2, lineHeight: 1.3 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Keepa Integration</span>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16, color: '#0f172a' }}>
                Intelligent brand viability scoring.
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
                We analyze 28 Keepa metrics per ASIN — Buy Box %, BSR trend, seller count, monthly
                sales — to give you a <strong style={{ color: '#0f172a' }}>Wholesale Score (0–100)</strong> before you send a single email.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                {[
                  { t: 'Hard Filter Elimination', d: 'HazMat, adult products, high return rates, and Amazon-dominated listings auto-eliminated.' },
                  { t: 'Buy Box Analysis',         d: 'Flag listings where Amazon wins the Buy Box 30%+ of the time.' },
                  { t: 'Strategy Tagging',          d: 'Each product tagged: bestseller, rising, low_competition, margin_focus, stable_buybox.' },
                ].map(item => (
                  <li key={item.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 20, marginTop: 2, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: 14, marginBottom: 2 }}>{item.t}</strong>
                      <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{item.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Try Keepa Analysis
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: '#0f172a', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: 10 }}>Your workflow, supercharged.</h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>Three steps to your next major brand account.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
              {[
                { n: '01', t: 'Upload Your Brand List',  d: 'Drag and drop a CSV or paste brand names. Auto-detects Keepa exports and regular brand lists.' },
                { n: '02', t: 'AI Pipeline Runs',         d: '11-stage pipeline: domains, verified emails, LinkedIn contacts, brand scores — all automated.' },
                { n: '03', t: 'Download & Outreach',      d: 'Export enriched leads and start sending professional wholesale pitches immediately.' },
              ].map(s => (
                <div key={s.n}>
                  <div style={{ width: 64, height: 64, background: '#2563eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 24px rgba(37,99,235,0.4)' }}>
                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff' }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.t}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#0f172a' }}>Simple, scalable pricing.</h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>Choose the plan that fits your business. No hidden fees.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, alignItems: 'start' }}>
              {PLANS.map(p => (
                <div key={p.name} style={{
                  background: p.featured ? '#2563eb' : '#fff',
                  border: p.featured ? 'none' : '1px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: p.featured ? '0 20px 40px rgba(37,99,235,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transform: p.featured ? 'scale(1.04)' : 'none',
                  position: 'relative',
                }}>
                  {p.featured && (
                    <div style={{ background: '#10b981', color: '#fff', textAlign: 'center', padding: '7px 0', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.featured ? '#93c5fd' : '#94a3b8', marginBottom: 10 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 38, fontWeight: 800, color: p.featured ? '#fff' : '#0f172a' }}>{p.price}</span>
                      <span style={{ fontSize: 13, color: p.featured ? '#93c5fd' : '#94a3b8' }}>{p.period}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {p.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: p.featured ? '#bfdbfe' : '#4b5563' }}>
                          <span className="material-symbols-outlined" style={{ color: p.featured ? '#6ee7b7' : '#10b981', fontSize: 15, flexShrink: 0, marginTop: 1, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href={p.href} style={{
                      display: 'block', textAlign: 'center',
                      background: p.featured ? '#fff' : '#2563eb',
                      color: p.featured ? '#2563eb' : '#fff',
                      padding: '11px 0', borderRadius: 10,
                      fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    }}>
                      {p.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO BLOCK */}
        <section style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '64px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
              What is Amazon FBA Wholesale and How Does WholesaleScout Help?
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75, marginBottom: 14 }}>
              <strong style={{ color: '#0f172a' }}>Amazon FBA wholesale</strong> is a business model where sellers
              purchase products in bulk directly from brand owners, then sell on Amazon using Fulfillment by Amazon.
              Unlike private label, wholesale sellers source established brands with proven demand.
            </p>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.75 }}>
              WholesaleScout&apos;s 11-stage AI pipeline automates the hardest part: finding verified wholesale contacts,
              LinkedIn decision makers, and Keepa product profitability scores. A complete contact database in minutes, not weeks.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40, color: '#0f172a' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQS.map((f, i) => (
                <details key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 22px', cursor: 'pointer' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15, color: '#0f172a', listStyle: 'none', userSelect: 'none' }}>
                    <span>{f.q}</span>
                    <span className="material-symbols-outlined" style={{ color: '#94a3b8', fontSize: 20, flexShrink: 0, marginLeft: 16 }}>expand_more</span>
                  </summary>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginTop: 12 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#2563eb', padding: '80px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
              Start finding wholesale contacts today.
            </h2>
            <p style={{ fontSize: 17, color: '#93c5fd', marginBottom: 36, lineHeight: 1.6 }}>
              Join Amazon FBA sellers scaling their wholesale businesses with automated brand research.
              Free to start — no credit card required.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/auth/signup" style={{ background: '#fff', color: '#2563eb', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                Get Started Free
              </Link>
              <Link href="/auth/login" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 15 }}>search</span>
              </div>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>WholesaleScout</span>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 220 }}>
              Precision research tools for Amazon FBA wholesale sellers.
            </p>
          </div>
          {[
            { heading: 'Product',   links: [['Features','#features'],['Keepa Analysis','#keepa'],['Pricing','#pricing'],['Dashboard','/dashboard']] },
            { heading: 'Use Cases', links: [['Amazon FBA Wholesale','#'],['Brand Outreach','#'],['Lead Generation','#'],['B2B Research','#']] },
            { heading: 'Account',   links: [['Sign Up','/auth/signup'],['Sign In','/auth/login'],['Dashboard','/dashboard'],['Credits','/dashboard/credits']] },
          ].map(col => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 16 }}>{col.heading}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#334155' }}>© {new Date().getFullYear()} WholesaleScout. Built for Amazon FBA wholesale sellers.</p>
          <span style={{ fontSize: 12, color: '#334155' }}>All systems operational</span>
        </div>
      </footer>
    </div>
  );
}
