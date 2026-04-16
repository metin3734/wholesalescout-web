import Link from 'next/link';

/* ─── Data ─────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: 'language',       title: 'Domain Keşfi',              desc: 'Marka adlarını resmi kurumsal domainlerle %90+ doğrulukla eşleştirir. 4 kademeli yedekleme: DNS → Brave → DDG → SerpAPI.' },
  { icon: 'alternate_email',title: 'Toptan E-posta Bulucu',     desc: 'Genel info@ adreslerini atla. Resmi marka sitelerinden kazınan gerçek wholesale@, trade@ ve B2B satış e-postalarını al.' },
  { icon: 'badge',          title: 'LinkedIn Karar Vericiler',  desc: 'Toptan Satış Müdürleri, Alıcılar ve Satış Direktörlerini unvan ve LinkedIn profil linki ile otomatik olarak bulur.' },
  { icon: 'shield',         title: 'Marka Değerlendirme',       desc: 'Markaları Uygun / Kontrol Gerekli / Elendi olarak önceden filtreler. Distribütörleri, bayileri ve sahte hesapları otomatik işaretler.' },
  { icon: 'cloud_upload',   title: 'Keepa CSV Desteği',         desc: 'Keepa dışa aktarmalarını ve normal marka listelerini otomatik algılar. ASIN başına 28 ürün metriği analiz edilir.' },
  { icon: 'download',       title: 'Renkli Kodlu Dışa Aktarma', desc: 'Tam zenginleştirilmiş Excel dosyasını indir (yeşil = doğrulanmış, sarı = kısmi) — hemen outreach için hazır.' },
];

const PLANS = [
  { name: 'Starter', price: '$49',   credits: '800 Kredi',   cta: 'Başla',          href: '/dashboard/credits', featured: false,
    features: ['800 marka taraması', 'Domain keşfi', 'E-posta bulucu', 'CSV dışa aktarma'] },
  { name: 'Growth',  price: '$199',  credits: '4.000 Kredi', cta: 'Growth Seç',     href: '/dashboard/credits', featured: false,
    features: ['4.000 marka taraması', 'Keepa CSV desteği', 'LinkedIn bulucu', 'Marka değerlendirme'] },
  { name: 'Pro',     price: '$499',  credits: '12.000 Kredi',cta: 'Pro\'ya Geç',    href: '/dashboard/credits', featured: true,
    features: ['12.000 marka taraması', 'Toptan skor (0–100)', 'Sahte tespit', 'Outreach şablonları', 'Öncelikli pipeline'] },
  { name: 'Agency',  price: '$1.399',credits: '40.000 Kredi',cta: 'Agency Seç',    href: '/dashboard/credits', featured: false,
    features: ['40.000 marka taraması', 'Tam API erişimi', 'Beyaz etiket dışa aktarma', 'Özel destek'] },
];

const FAQS = [
  { q: 'İletişim verilerinin doğruluk oranı nedir?',       a: 'Domain keşfi %90+ başarı sağlar. E-postalar doğrudan marka web sitelerinden kazınır — tahmin yok, sahte adres yok.' },
  { q: 'Keepa Toptan Skoru nedir?',                        a: 'ASIN başına 28 Keepa metriği analiz edilir — Buy Box %, BSR trendi, satıcı sayısı, aylık satışlar — 0-100 arasında bir skor üretilir. ≥65 = WHOLESALE_UYGUN, 40–64 = TEKRAR_KONTROL, <40 = ELENDI.' },
  { q: 'Hunter.io\'dan farkı nedir?',                      a: 'Hunter.io genel e-postalar bulur. WholesaleScout toptan satışa özeldir: doğrulanmış toptan kişiler, sahte bayrak, Keepa karlılığı, LinkedIn karar vericiler.' },
  { q: 'ABD dışındaki markalar için çalışıyor mu?',        a: 'Evet. Uluslararası alan adlarını destekler (.co.uk, .com.au, .de, .ca vb.). Keepa analizi Amazon ABD pazarına odaklanır.' },
  { q: 'Krediler ne zaman düşer?',                         a: 'Krediler yalnızca başarıyla işlenen aktif markalar için düşer. İnaktif veya elenen markalar kredi tüketmez.' },
];

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#ffffff', color: '#1f2937' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>search</span>
            </div>
            <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 800, fontSize: 17, color: '#1f2937', letterSpacing: '-0.02em' }}>WholesaleScout</span>
          </Link>

          <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500 }}>
            {[['Özellikler','#features'],['Keepa','#keepa'],['Fiyatlar','#pricing'],['SSS','#faq']].map(([l,h]) => (
              <a key={l} href={h} style={{ color: '#6b7280', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/auth/login" style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none' }}>Giriş Yap</Link>
            <Link href="/auth/signup" style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Erişim Talep Et
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 60 }}>

        {/* HERO */}
        <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 60%, #f8fafc 100%)', padding: '90px 24px 80px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                Amazon FBA Toptan Satış Araştırması
              </span>
              <h1 style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#1f2937', marginBottom: 20 }}>
                Amazon FBA İşletmenizi{' '}
                <span style={{ color: '#2563eb' }}>Gerçek Zamanlı Zeka (OSINT)</span>{' '}
                ile Büyütün.
              </h1>
              <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
                Dünya çapındaki toptancıları saniyeler içinde keşfedin, binlerce doğrulanmış
                iletişim verisini tek tıkla otomatik e-posta kampanyalarına dönüştürün.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/auth/signup" style={{ background: '#2563eb', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Ücretsiz Müşteri Keşfine Başla
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </Link>
                <Link href="#features" style={{ background: '#f1f5f9', color: '#6b7280', border: '1px solid #e5e7eb', padding: '14px 24px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                  Nasıl Çalışır?
                </Link>
              </div>
            </div>

            {/* Right: mockup */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.04)' }}>
              {/* Window chrome */}
              <div style={{ background: '#f1f5f9', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                <span style={{ marginLeft: 10, color: '#6b7280', fontSize: 11, fontWeight: 500 }}>WholesaleScout — Lead Keşfi</span>
              </div>
              <div style={{ padding: 20 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ n: '247', l: 'Analiz Edilen Marka' }, { n: '89%', l: 'E-posta Bulundu' }, { n: '184', l: 'LinkedIn' }].map(s => (
                    <div key={s.l} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{s.n}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.l}</div>
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
                    <div key={r.name} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
                        {r.name[0]}
                      </div>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#374151' }}>{r.name}</span>
                      <span style={{ background: r.color, color: '#fff', borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{r.score}</span>
                    </div>
                  ))}
                </div>
                {/* Bottom stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderLeft: '3px solid #10b981', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>Toptan E-postalar</div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 800, color: '#2563eb' }}>218</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderLeft: '3px solid #2563eb', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>Karar Vericiler</div>
                    <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 800, color: '#2563eb' }}>147</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section style={{ background: '#f1f5f9', padding: '40px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
            {[['%90+','Domain Keşif Oranı'],['10x','Manuel\'den Daha Hızlı'],['11','Zenginleştirme Aşaması'],['28','Keepa Metriği']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 32, fontWeight: 800, color: '#1f2937', marginBottom: 4 }}>{v}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEM */}
        <section style={{ background: '#ffffff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16, color: '#1f2937' }}>
              Manuel araştırma gelirinizi eritiyor.
            </h2>
            <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, marginBottom: 40 }}>
              Ortalama bir Amazon toptan satış yapıcısı, marka web sitelerini google&#39;layıp iletişim e-postalarını tahmin etmek için ayda{' '}
              <strong style={{ color: '#1f2937' }}>40+ saat</strong> harcıyor. Bu, her ay masada bırakılan gelir demektir.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
              <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>error</span>
                  <strong style={{ color: '#1f2937', fontSize: 15 }}>Manuel Yöntem</strong>
                </div>
                <p style={{ fontSize: 13, color: '#4a6880', lineHeight: 1.7 }}>
                  Markayı Google&#39;la → Web sitesini bul → İletişim sayfasını ara → E-posta kalıbını tahmin et.
                  200 kez tekrarla. 40+ saat heba. %20 doğruluk.
                </p>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <strong style={{ color: '#1f2937', fontSize: 15 }}>WholesaleScout Yöntemi</strong>
                </div>
                <p style={{ fontSize: 13, color: '#4a6880', lineHeight: 1.7 }}>
                  CSV yükle → Doğrulanmış toptan e-postalar, LinkedIn karar vericiler
                  ve Keepa skorları otomatik gelsin. 10 dakika. %90+ doğruluk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 56 }}>
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Özellikler</span>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#1f2937' }}>
                Ciddi Amazon satıcıları için gelişmiş araçlar.
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 500 }}>
                Marka adından aksiyona hazır iletişim verisine ulaşan 11 aşamalı zenginleştirme pipeline&apos;ı.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: 22 }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEEPA */}
        <section id="keepa" style={{ background: '#ffffff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Mockup */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>Columbia Sportswear</span>
                  <span style={{ background: '#10b981', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>WHOLESALE_UYGUN</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '87%', background: '#10b981', borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                  <span>Skor: 87/100</span><span>Amazon BB%: 0%</span>
                </div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16, opacity: 0.6, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>Genel Marka A.Ş.</span>
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>ELENDI</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '22%', background: '#ef4444', borderRadius: 999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                  <span>Skor: 22/100</span><span>Amazon BB%: 78%</span>
                </div>
              </div>
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
              <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>Keepa Entegrasyonu</span>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16, color: '#1f2937' }}>
                Akıllı marka uygunluk skorlaması.
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
                ASIN başına 28 Keepa metriğini analiz ederiz — Buy Box %, BSR trendi, satıcı sayısı, aylık
                satışlar — tek bir e-posta göndermeden önce <strong style={{ color: '#1f2937' }}>Toptan Skor (0–100)</strong> sunarız.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                {[
                  { t: 'Sert Filtre Eliminasyonu', d: 'HazMat, yetişkin ürünleri, yüksek iade oranları ve Amazon\'un domine ettiği listeler otomatik elenir.' },
                  { t: 'Buy Box Analizi',           d: 'Amazon\'un zamanın %30\'undan fazlasında Buy Box kazandığı listeler işaretlenir.' },
                  { t: 'Strateji Etiketleme',       d: 'Her ürün etiketlenir: bestseller, yükselen, düşük_rekabet, margin_odaklı, stabil_buybox.' },
                ].map(item => (
                  <li key={item.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 20, marginTop: 2, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <strong style={{ display: 'block', color: '#1f2937', fontSize: 14, marginBottom: 2 }}>{item.t}</strong>
                      <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', padding: '13px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Keepa Analizini Dene
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: '#f1f5f9', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#1f2937', marginBottom: 10 }}>İş akışınızı güçlendirin.</h2>
              <p style={{ fontSize: 16, color: '#6b7280' }}>Bir sonraki büyük marka hesabına giden üç adım.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
              {[
                { n: '01', t: 'Marka Listenizi Yükleyin',  d: 'CSV sürükleyip bırakın veya marka adlarını yapıştırın. Keepa dışa aktarmaları ve normal marka listelerini otomatik algılar.' },
                { n: '02', t: 'AI Pipeline Çalışır',        d: '11 aşamalı pipeline: domainler, doğrulanmış e-postalar, LinkedIn kişileri, marka skorları — tamamen otomatik.' },
                { n: '03', t: 'İndir ve Outreach Başlat',   d: 'Zenginleştirilmiş leadleri dışa aktarın ve hemen profesyonel toptan teklifler göndermeye başlayın.' },
              ].map(s => (
                <div key={s.n}>
                  <div style={{ width: 64, height: 64, background: '#2563eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 24px rgba(37,99,235,0.4)' }}>
                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff' }}>{s.n}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>{s.t}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ background: '#ffffff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#1f2937' }}>Tek seferlik kredi paketi.</h2>
              <p style={{ fontSize: 16, color: '#6b7280' }}>Aylık abonelik yok. Kullandığın kadar öde. Gizli ücret yok.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, alignItems: 'start' }}>
              {PLANS.map(p => (
                <div key={p.name} style={{
                  background: p.featured ? '#2563eb' : '#ffffff',
                  border: p.featured ? 'none' : '1px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: p.featured ? '0 20px 40px rgba(37,99,235,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transform: p.featured ? 'scale(1.04)' : 'none',
                  position: 'relative',
                }}>
                  {p.featured && (
                    <div style={{ background: '#10b981', color: '#fff', textAlign: 'center', padding: '7px 0', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      En Popüler
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.featured ? '#93c5fd' : '#94a3b8', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: p.featured ? '#bfdbfe' : '#64748b', marginBottom: 10 }}>{p.credits}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 38, fontWeight: 800, color: p.featured ? '#fff' : '#1f2937' }}>{p.price}</span>
                      <span style={{ fontSize: 13, color: p.featured ? '#93c5fd' : '#94a3b8' }}>tek seferlik</span>
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
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 22, fontWeight: 800, color: '#1f2937', marginBottom: 14 }}>
              Amazon FBA Toptan Satış Nedir ve WholesaleScout Nasıl Yardımcı Olur?
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75, marginBottom: 14 }}>
              <strong style={{ color: '#1f2937' }}>Amazon FBA toptan satışı</strong>, satıcıların ürünleri doğrudan marka sahiplerinden toplu olarak satın alıp Amazon Fulfillment by Amazon aracılığıyla sattığı bir iş modelidir.
              Özel etiketin aksine, toptan satıcılar kanıtlanmış talebe sahip yerleşik markaları kaynak gösterir.
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75 }}>
              WholesaleScout&#39;un 11 aşamalı AI pipeline&#39;ı en zor kısmı otomatikleştirir: doğrulanmış toptan kişileri,
              LinkedIn karar vericileri ve Keepa ürün karlılık skorlarını bulur. Dakikalar içinde eksiksiz iletişim veritabanı.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={{ background: '#ffffff', padding: '80px 24px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40, color: '#1f2937' }}>
              Sıkça Sorulan Sorular
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQS.map((f, i) => (
                <details key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 22px', cursor: 'pointer' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15, color: '#1f2937', listStyle: 'none', userSelect: 'none' }}>
                    <span>{f.q}</span>
                    <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: 20, flexShrink: 0, marginLeft: 16 }}>expand_more</span>
                  </summary>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginTop: 12 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#2563eb', padding: '80px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Manrope',system-ui,sans-serif", fontSize: 42, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>
              Toptan kişileri bulmaya bugün başla.
            </h2>
            <p style={{ fontSize: 17, color: '#93c5fd', marginBottom: 36, lineHeight: 1.6 }}>
              Otomatik marka araştırmasıyla toptan işlerini büyüten Amazon FBA satıcılarına katıl.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/auth/login" style={{ background: '#1f2937', color: '#2563eb', padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                Dashboard&apos;a Git
              </Link>
              <Link href="#pricing" style={{ border: '2px solid rgba(255,255,255,0.3)', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
                Fiyatları Gör
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ background: '#1f2937', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 15 }}>search</span>
              </div>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>WholesaleScout</span>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 8 }}>wholesale-scout.com</p>
            <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7, maxWidth: 220 }}>
              Amazon FBA toptan satış yapıcıları için hassas araştırma araçları.
            </p>
          </div>
          {[
            { heading: 'Ürün',       links: [['Özellikler','#features'],['Keepa Analizi','#keepa'],['Fiyatlar','#pricing'],['Dashboard','/dashboard']] },
            { heading: 'Kullanım',   links: [['Amazon FBA Toptan','#'],['Marka Outreach','#'],['Lead Üretimi','#'],['B2B Araştırma','#']] },
            { heading: 'Hesap',      links: [['Kayıt Ol','/auth/signup'],['Giriş Yap','/auth/login'],['Dashboard','/dashboard'],['Krediler','/dashboard/credits']] },
          ].map(col => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d1d5db', marginBottom: 16 }}>{col.heading}</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} style={{ fontSize: 13, color: '#d1d5db', textDecoration: 'none' }}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>© {new Date().getFullYear()} WholesaleScout — wholesale-scout.com | Amazon FBA toptan satış yapıcıları için üretildi.</p>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Tüm sistemler çalışıyor</span>
        </div>
      </footer>
    </div>
  );
}
