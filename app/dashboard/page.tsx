'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Types ─────────────────────────────────────────────── */
interface Job {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_brands: number;
  processed_brands: number;
  created_at: string;
  result_csv?: string;
  result_xlsx?: string;
  job_type?: 'brand' | 'keepa';
}

interface Brand {
  id: string;
  job_id?: string;
  brand_name: string;
  official_domain?: string;
  wholesale_email?: string;
  email_source?: string;
  instagram_url?: string;
  tiktok_url?: string;
  linkedin_url?: string;
  decision_maker_name?: string;
  decision_maker_title?: string;
  confidence_score: number;
  location?: string;
  company_employee_count?: number;
  distributor?: string;
  lead_status?: 'New' | 'Contacted' | 'Successful' | 'Risk';
  status: string;
  created_at: string;
  // Verification fields
  brand_type?: 'brand' | 'distributor' | 'retailer' | 'unknown';
  ecommerce_platform?: string;
  trustpilot_rating?: number;
  trustpilot_reviews?: number;
  distribution_channels?: string;
  has_wholesale_page?: boolean;
  physical_address?: string;
  verification_score?: number;
  ssl_valid?: boolean;
  faire_url?: string;
  wholesale_page_url?: string;
  instagram_followers?: number;
  tiktok_followers?: number;
  // New fields
  phone?: string;
  company_bio?: string;
  facebook_url?: string;
  distribution_type?: 'direct' | 'marketplace' | 'mixed' | 'unknown';
  known_distributors?: string;
  fraud_risk?: 'safe' | 'low' | 'medium' | 'high' | 'unknown';
  fraud_flags?: string;
  qualification_status?: 'qualified' | 'marginal' | 'inactive';
  qualification_score?: number;
  qualification_signals?: string;
  elimination_reason?: string;
  decision_maker_email?: string;
  decision_maker_linkedin?: string;
  alternative_emails?: string;  // JSON: [{email, role, priority}]
  outreach_score?: number;
  outreach_approach?: string;
  outreach_recommendation?: string;
  outreach_email_template?: string;
  keepa_score?: number;
  keepa_asin?: string;
  keepa_amazon_url?: string;
  keepa_offer_count?: number;
  contact_form_url?: string;
}

interface KeepaProduct {
  id: string;
  job_id: string;
  asin: string;
  title: string;
  brand: string;
  amazon_url: string | null;
  buybox_price: number | null;
  bsr_current: number | null;
  bsr_90d_avg: number | null;
  amazon_bb_pct: number | null;
  bb_winner_count: number | null;
  offer_count: number | null;
  bought_past_month: number | null;
  rating: number | null;
  review_count: number | null;
  oos_90d: number | null;
  wholesale_score: number | null;
  kategori: 'WHOLESALE_UYGUN' | 'TEKRAR_KONTROL' | 'ELENDI' | null;
  eleme_nedeni: string | null;
  strateji_etiketleri: string | null;
  created_at: string;
}

/* ─── Lead status config ─────────────────────────────────── */
const LEAD_STATUS_CFG: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  New:        { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
  Contacted:  { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
  Successful: { bg: '#fefce8', color: '#92400e', dot: '#f59e0b', border: '#fde68a' },
  Risk:       { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444', border: '#fecaca' },
};
const LEAD_STATUSES = ['New', 'Contacted', 'Successful', 'Risk'] as const;

/* ─── Icons ──────────────────────────────────────────────── */
const Ic = {
  Globe: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
  LinkedIn: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>),
  Instagram: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>),
  TikTok: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z"/></svg>),
  Upload: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  Search: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>),
  Trash: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>),
  Copy: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  Download: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  ChevronDown: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>),
  MapPin: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  Mail: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  ExternalLink: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>),
};

/* ─── Helpers ────────────────────────────────────────────── */
function deriveTLD(domain?: string): string {
  if (!domain) return '';
  const parts = domain.split('.');
  const tld = parts[parts.length - 1]?.toLowerCase() || '';
  const sld = parts[parts.length - 2]?.toLowerCase() || '';
  if (sld === 'co' && tld === 'uk') return 'GB';
  if (sld === 'com' && tld === 'au') return 'AU';
  if (sld === 'co' && tld === 'nz') return 'NZ';
  const map: Record<string, string> = {
    uk:'GB', de:'DE', fr:'FR', ca:'CA', au:'AU',
    nl:'NL', es:'ES', it:'IT', jp:'JP', cn:'CN',
    br:'BR', in:'IN', tr:'TR', se:'SE', pl:'PL',
    dk:'DK', no:'NO', fi:'FI', be:'BE', ch:'CH',
    at:'AT', nz:'NZ', za:'ZA', mx:'MX', sg:'SG',
    ae:'AE', com:'US', io:'TECH', co:'', org:'', net:'',
  };
  return map[tld] || '';
}

function getWholesaleChannel(email?: string): string {
  if (!email) return '';
  const prefix = email.split('@')[0]?.toLowerCase() || '';
  if (prefix === 'wholesale' || prefix === 'wholesales') return '🏭 Direkt Toptan';
  if (prefix === 'trade') return '🤝 Bayi Programı';
  if (prefix === 'b2b') return '📦 B2B';
  if (prefix === 'stockists') return '📦 Stokçu';
  if (prefix === 'sales') return '💼 Satış Ekibi';
  if (prefix === 'info' || prefix === 'hello') return '📧 Genel İletişim';
  if (prefix === 'contact') return '📧 İletişim';
  if (prefix.includes('wholesale') || prefix.includes('trade')) return '🏭 Toptan';
  return '📧 ' + prefix;
}

function WholesaleTypeBadge({ source }: { source?: string }) {
  const cfg = source === 'scraped'
    ? { label:'✓ Scrape Edildi', bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' }
    : source === 'smtp_verified'
    ? { label:'✓ SMTP Doğru', bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' }
    : source === 'hunter'
    ? { label:'◆ Hunter.io', bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' }
    : source === 'gemini'
    ? { label:'◆ AI Analiz', bg:'#faf5ff', color:'#7e22ce', border:'#e9d5ff' }
    : { label:'~ Tahmin', bg:'#fefce8', color:'#92400e', border:'#fde68a' };
  return (
    <span style={{ padding:'0.12rem 0.45rem', borderRadius:'4px', fontSize:'0.61rem', fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  );
}

/* ─── BrandTypeBadge ─────────────────────────────────────── */
function BrandTypeBadge({ type }: { type?: string }) {
  if (!type || type === 'unknown') return null;
  const cfg =
    type === 'brand'       ? { label:'✓ Marka',        bg:'#f0fdf4', color:'#166534', border:'#bbf7d0' } :
    type === 'distributor' ? { label:'⚠ Distribütör',  bg:'#fef3c7', color:'#92400e', border:'#fde68a' } :
                             { label:'◆ Perakendeci',  bg:'#f1f5f9', color:'#475569', border:'#e2e8f0' };
  return (
    <span style={{ padding:'0.1rem 0.4rem', borderRadius:'4px', fontSize:'0.6rem', fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  );
}

/* ─── VerificationBadge ──────────────────────────────────── */
function VerificationBadge({ score }: { score?: number }) {
  if (!score) return null;
  const cfg = score >= 70
    ? { label:`✓ ${score}`, bg:'#f0fdf4', color:'#166534', title:'Yüksek doğrulama güveni' }
    : score >= 40
    ? { label:`◆ ${score}`, bg:'#eff6ff', color:'#1d4ed8', title:'Orta doğrulama güveni' }
    : { label:`○ ${score}`, bg:'#f8fafc', color:'#94a3b8', title:'Düşük doğrulama güveni' };
  return (
    <span title={cfg.title} style={{ padding:'0.1rem 0.35rem', borderRadius:'4px', fontSize:'0.58rem', fontWeight:700, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  );
}

/* ─── ConfidenceBadge ────────────────────────────────────── */
function ConfidenceBadge({ score }: { score: number }) {
  const cfg = score >= 70 ? { bg:'#fef3c7', color:'#92400e', text:'★ ELITE' } : score >= 40 ? { bg:'#dbeafe', color:'#1d4ed8', text:'◆ GOOD' } : { bg:'#fee2e2', color:'#b91c1c', text:'○ LOW' };
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'0.1rem 0.4rem', borderRadius:'999px', fontSize:'0.58rem', fontWeight:700, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>{cfg.text}</span>;
}

/* ─── StatusDropdown ─────────────────────────────────────── */
function StatusDropdown({ brandId, current, onUpdate }: { brandId: string; current?: string; onUpdate: (id: string, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const val = current ?? 'New';
  const cfg = LEAD_STATUS_CFG[val] ?? LEAD_STATUS_CFG.New;

  async function select(s: string) {
    setOpen(false);
    if (s === val) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ lead_status: s }) });
      if (res.ok) onUpdate(brandId, s);
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  return (
    <div style={{ position:'relative', display:'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        disabled={saving}
        style={{ display:'inline-flex', alignItems:'center', gap:'0.28rem', padding:'0.18rem 0.5rem 0.18rem 0.4rem', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, borderRadius:'5px', fontSize:'0.67rem', fontWeight:600, cursor:'pointer', opacity: saving ? 0.6 : 1, whiteSpace:'nowrap' }}
      >
        <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.dot, display:'inline-block', flexShrink:0 }} />
        {val}
        <Ic.ChevronDown />
      </button>
      {open && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:99 }} onClick={() => setOpen(false)} />
          <div style={{ position:'absolute', top:'110%', left:0, zIndex:100, background:'#fff', border:'1px solid #e2e8f0', borderRadius:'7px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)', minWidth:'130px', overflow:'hidden' }}>
            {LEAD_STATUSES.map((s) => {
              const c = LEAD_STATUS_CFG[s];
              return (
                <button key={s} onClick={() => select(s)} style={{ display:'flex', alignItems:'center', gap:'0.45rem', width:'100%', padding:'0.45rem 0.7rem', background: s === val ? '#f8fafc' : '#fff', border:'none', cursor:'pointer', fontSize:'0.73rem', fontWeight: s === val ? 700 : 400, color:'#0f172a', textAlign:'left' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
                  {s}
                  {s === val && <span style={{ marginLeft:'auto', color:'#94a3b8', fontSize:'0.62rem' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [error, setError]           = useState('');
  const [pastedBrands, setPastedBrands] = useState('');
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('all');
  const [brandPage, setBrandPage] = useState(0);
  const BRAND_PAGE_SIZE = 50;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [inspectedBrand, setInspectedBrand] = useState<Brand | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [workerOffline, setWorkerOffline] = useState(false);
  const [activeTab, setActiveTab]   = useState<'brands' | 'keepa'>('brands');
  const [keepaProducts, setKeepaProducts] = useState<KeepaProduct[]>([]);
  const [keepaFilter, setKeepaFilter] = useState<'all' | 'WHOLESALE_UYGUN' | 'TEKRAR_KONTROL' | 'ELENDI'>('all');
  const [selectedKeepaJobId, setSelectedKeepaJobId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);
  const [expandedEmailRow, setExpandedEmailRow] = useState<string|null>(null); // brand id
  const fileRef = useRef<HTMLInputElement>(null);

  // Başarısız marka sayısı
  const failedBrandsList = brands.filter(b =>
    !b.wholesale_email && b.qualification_status !== 'inactive'
  ).map(b => b.brand_name);

  // Başarısız markaları tekrar tara
  const retryFailedBrands = async () => {
    if (!failedBrandsList.length) return;
    setShowRetryConfirm(false);
    setRetrying(true);
    try {
      const r = await fetch('/api/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_names: failedBrandsList }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Hata oluştu'); return; }
      loadJobs();
      loadBrands();
    } catch { setError('Bağlantı hatası'); }
    finally { setRetrying(false); }
  };

  // ── Takılmış job tespiti: 2 saatten eski processing/pending job → stuck kabul et ──
  // Worker çökmüş veya timeout olmuş olabilir — UI'ı kilitlememeli
  const processingJob = jobs.find((j) => {
    if (j.status !== 'processing' && j.status !== 'pending') return false;
    const created = new Date(j.created_at).getTime();
    const now = Date.now();
    const TEN_MIN = 10 * 60 * 1000;
    if (now - created > TEN_MIN) return false; // 10dk'dan eski → stuck, gösterme
    return true;
  }) ?? null;
  const pasteLineCount = pastedBrands.split('\n').filter((l) => l.trim()).length;

  /* ── Data loading ── */
  const loadBrands = useCallback(async () => {
    try {
      const r = await fetch('/api/brands');
      if (r.ok) {
        const data = await r.json();
        setBrands(data);
        // Pagination koruma: mevcut sayfa toplam sayfayı aşıyorsa son sayfaya git
        const maxPage = Math.max(0, Math.ceil(data.length / BRAND_PAGE_SIZE) - 1);
        setBrandPage(prev => prev > maxPage ? maxPage : prev);
      }
    } catch { /* network error — mevcut veriyi koru */ }
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      const r = await fetch('/api/jobs');
      if (r.ok) {
        const data: Job[] = await r.json();
        setJobs(data);
        setJobsLoaded(true);
        // Detect worker offline: if most recent job failed with worker error
        const latest = data[0];
        if (latest && latest.status === 'failed' && (latest as Job & { error_message?: string }).error_message?.includes('Worker unreachable')) {
          setWorkerOffline(true);
        } else {
          setWorkerOffline(false);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const loadKeepa = useCallback(async (jobId?: string | null) => {
    try {
      const url = jobId ? `/api/keepa?job_id=${jobId}` : '/api/keepa';
      const r = await fetch(url);
      if (r.ok) setKeepaProducts(await r.json());
    } catch { /* ignore */ }
  }, []);

  // ── Polling: jobs her zaman 10sn, brands processingJob varsa 8sn ──
  // NOT: Sayfa değişip geri dönüldüğünde (credits→dashboard) component yeniden mount olur.
  // Bu durumda state sıfırlanır ama polling hemen başlar → 1-2sn'de veri gelir.
  // Worker arka planda çalışmaya devam eder, frontend sadece UI state'i kaybeder.
  useEffect(() => {
    // İlk yüklemede hemen çağır — sayfa geçişinde state kaybolmasını minimize et
    loadJobs();
    loadBrands();
    const jobTimer = setInterval(loadJobs, 10000);
    return () => clearInterval(jobTimer);
  }, [loadJobs, loadBrands]);
  useEffect(() => { loadKeepa(selectedKeepaJobId); }, [loadKeepa, selectedKeepaJobId]);
  useEffect(() => {
    if (!processingJob) return;
    // processingJob varsa brands ve keepa'yı da pollle
    loadBrands(); // hemen bir kez çağır
    const brandTimer = setInterval(loadBrands, 8000);
    const keepaTimer = setInterval(() => loadKeepa(selectedKeepaJobId), 8000);
    return () => { clearInterval(brandTimer); clearInterval(keepaTimer); };
  }, [processingJob, loadBrands, loadKeepa, selectedKeepaJobId]);

  /* ── Keepa dosyası tespiti (CSV/XLSX header'larına bakarak) ── */
  async function detectIsKeepa(file: File): Promise<boolean> {
    // Keepa dosyası adında "Keepa" veya "ASIN" geçiyorsa → Keepa
    if (/keepa/i.test(file.name)) return true;
    // CSV ise ilk satırı oku
    if (file.name.match(/\.csv$/i)) {
      const text = await file.text();
      const firstLine = text.split('\n')[0]?.toLowerCase() ?? '';
      return firstLine.includes('asin') || firstLine.includes('bsr') || firstLine.includes('buybox');
    }
    return false;
  }

  /* ── Submit file: dosya tipini otomatik algıla, doğru endpoint'e yönlendir ── */
  async function submitFile(file: File) {
    if (!file.name.match(/\.(csv|xlsx|xls|tsv|txt)$/i)) { setError('CSV veya Excel dosyası gerekli.'); return; }
    setError('');
    setUploading(true);
    try {
      const form = new FormData(); form.append('file', file);
      const r = await fetch('/api/jobs', { method:'POST', body:form });
      const d = await r.json();
      if (!r.ok) setError(d.error ?? 'Upload failed');
      else { await loadJobs(); }
    } catch { setError('Network error.'); } finally { setUploading(false); }
  }

  async function submitPasted() {
    const lines = pastedBrands.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) { setError('Enter at least one brand name.'); return; }
    setError(''); setUploading(true);
    const csv = 'brand_name\n' + lines.join('\n');
    const file = new File([new Blob([csv], { type:'text/csv' })], `brands-${Date.now()}.csv`, { type:'text/csv' });
    const form = new FormData(); form.append('file', file);
    try {
      const r = await fetch('/api/jobs', { method:'POST', body:form });
      const d = await r.json();
      if (!r.ok) setError(d.error ?? 'Failed');
      else { setPastedBrands(''); await loadJobs(); }
    } catch { setError('Network error.'); } finally { setUploading(false); }
  }

  async function deleteBrand(id: string) {
    if (!confirm('Remove this lead?')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/brands/${id}`, { method:'DELETE' });
      if (r.ok) { setBrands(prev => prev.filter(b => b.id !== id)); if (inspectedBrand?.id === id) setInspectedBrand(null); }
    } catch { /* ignore */ } finally { setDeletingId(null); }
  }

  function handleStatusUpdate(id: string, s: string) {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, lead_status: s as Brand['lead_status'] } : b));
    if (inspectedBrand?.id === id) setInspectedBrand(prev => prev ? { ...prev, lead_status: s as Brand['lead_status'] } : prev);
  }

  function copyEmail(email: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(email).then(() => { setCopiedEmail(email); setTimeout(() => setCopiedEmail(null), 1800); });
  }

  function copyAllEmails() {
    const emails = filtered.filter(b => b.wholesale_email).map(b => b.wholesale_email).join('\n');
    if (!emails) return;
    navigator.clipboard.writeText(emails).then(() => alert(`${filtered.filter(b => b.wholesale_email).length} emails copied!`));
  }

  // Kişisel email filtresi — firstname.lastname@ pattern
  function _isPersonalEmail(email: string): boolean {
    const prefix = email.split('@')[0];
    return /^[a-z]+\.[a-z]+$/i.test(prefix) || /^[a-z]\.[a-z]+$/i.test(prefix);
  }

  // Temiz alternatif emailler — kişisel + primary duplicate filtreli
  function _getCleanAltEmails(b: Brand): string[] {
    let alts: {email:string,role:string}[] = [];
    try { alts = JSON.parse(b.alternative_emails||'[]'); } catch {}
    return alts
      .map(a => a.email)
      .filter(e => e !== b.wholesale_email && !_isPersonalEmail(e))
      .slice(0, 4);
  }

  function exportCSV() {
    // Her marka için tüm emailler organik olarak ayrı satırlarda
    const rows = [['Brand','Domain','Email','Email Type','Email Source','Contact','Title','LinkedIn_DM','Instagram','TikTok','LinkedIn','Score','Status']];
    for (const b of filtered) {
      const altEmails = _getCleanAltEmails(b);
      const dmEmail   = b.decision_maker_email && b.decision_maker_email !== b.wholesale_email ? b.decision_maker_email : '';

      // Ana email
      if (b.wholesale_email) {
        rows.push([b.brand_name, b.official_domain??'', b.wholesale_email, 'PRIMARY', b.email_source??'', b.decision_maker_name??'', b.decision_maker_title??'', b.decision_maker_linkedin??'', b.instagram_url??'', b.tiktok_url??'', b.linkedin_url??'', String(b.confidence_score), b.lead_status??'New']);
      } else {
        rows.push([b.brand_name, b.official_domain??'', '', '', '', b.decision_maker_name??'', b.decision_maker_title??'', b.decision_maker_linkedin??'', b.instagram_url??'', b.tiktok_url??'', b.linkedin_url??'', String(b.confidence_score), b.lead_status??'New']);
      }
      // Alternatif emailler — aynı marka için ek satırlar
      for (const alt of altEmails) {
        rows.push([b.brand_name, b.official_domain??'', alt, 'ALTERNATIVE', 'scraped', '', '', '', '', '', '', '', '']);
      }
      // Karar verici emaili
      if (dmEmail) {
        rows.push([b.brand_name, b.official_domain??'', dmEmail, 'DECISION_MAKER', 'pattern', b.decision_maker_name??'', b.decision_maker_title??'', b.decision_maker_linkedin??'', '', '', '', '', '']);
      }
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })); a.download = `leads-${Date.now()}.csv`; a.click();
  }

  /* ── Stats (for metric cards) ── */
  const stats = {
    total:          brands.length,
    emailFound:     brands.filter(b => !!b.wholesale_email).length,
    noEmail:        brands.filter(b => !b.wholesale_email).length,
    highConf:       brands.filter(b => (b.confidence_score ?? 0) >= 70).length,
    lowConf:        brands.filter(b => (b.confidence_score ?? 0) < 40).length,
    domainOk:       brands.filter(b => b.ssl_valid && b.fraud_risk !== 'high').length,
    domainFail:     brands.filter(b => !b.ssl_valid || b.fraud_risk === 'high').length,
    fraudHigh:      brands.filter(b => b.fraud_risk === 'high' || b.fraud_risk === 'medium').length,
    directWholesale:brands.filter(b => b.distribution_type === 'direct' || b.distribution_type === 'mixed').length,
    marketplace:    brands.filter(b => b.distribution_type === 'marketplace' || b.distribution_type === 'mixed').length,
    hasLocation:    brands.filter(b => !!b.location).length,
    inactive:       brands.filter(b => b.qualification_status === 'inactive').length,
    highOutreach:   brands.filter(b => (b.outreach_score ?? 0) >= 70).length,
  };

  /* ── Filter ── */
  const filtered = brands.filter(b => {
    const ms = !search || b.brand_name.toLowerCase().includes(search.toLowerCase()) || (b.official_domain??'').toLowerCase().includes(search.toLowerCase()) || (b.wholesale_email??'').toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === 'All' || (b.lead_status ?? 'New') === filterStatus;
    let mc = true;
    if (filterCategory === 'email_found')   mc = !!b.wholesale_email;
    if (filterCategory === 'no_email')      mc = !b.wholesale_email;
    if (filterCategory === 'high_conf')     mc = (b.confidence_score ?? 0) >= 70;
    if (filterCategory === 'low_conf')      mc = (b.confidence_score ?? 0) < 40;
    if (filterCategory === 'domain_ok')     mc = !!b.ssl_valid && b.fraud_risk !== 'high';
    if (filterCategory === 'domain_fail')   mc = !b.ssl_valid || b.fraud_risk === 'high';
    if (filterCategory === 'fraud_high')    mc = b.fraud_risk === 'high' || b.fraud_risk === 'medium';
    if (filterCategory === 'inactive')      mc = b.qualification_status === 'inactive';
    if (filterCategory === 'high_outreach') mc = (b.outreach_score ?? 0) >= 70;
    if (filterCategory === 'direct')        mc = b.distribution_type === 'direct' || b.distribution_type === 'mixed';
    if (filterCategory === 'marketplace')   mc = b.distribution_type === 'marketplace' || b.distribution_type === 'mixed';
    return ms && mf && mc;
  });
  const totalPages = Math.ceil(filtered.length / BRAND_PAGE_SIZE);
  const paginated  = filtered.slice(brandPage * BRAND_PAGE_SIZE, (brandPage + 1) * BRAND_PAGE_SIZE);

  const filteredKeepa = keepaProducts.filter(p => keepaFilter === 'all' || p.kategori === keepaFilter);

  /* ── Counts for status filter ── */
  const statusCounts = { All: brands.length, New: 0, Contacted: 0, Successful: 0, Risk: 0 } as Record<string, number>;
  for (const b of brands) { const s = b.lead_status ?? 'New'; if (s in statusCounts) statusCounts[s]++; }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

      {/* ── UPLOAD SLIDE-IN PANEL ── */}
      {showUploadPanel && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.35)', zIndex:1900, backdropFilter:'blur(2px)' }} onClick={() => setShowUploadPanel(false)} />
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'380px', background:'#fff', zIndex:1901, boxShadow:'-4px 0 32px rgba(0,0,0,0.14)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
            {/* Header */}
            <div style={{ padding:'1.3rem 1.4rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontWeight:800, fontSize:'1rem', color:'#0f172a' }}>New Research</div>
                <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'0.1rem' }}>Upload brands or Keepa data</div>
              </div>
              <button onClick={() => setShowUploadPanel(false)} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', color:'#64748b', fontSize:'0.9rem', padding:'0.3rem 0.55rem', borderRadius:'7px', lineHeight:1 }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ flex:1, padding:'1.25rem 1.4rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Brand name textarea — her zaman görünür */}
              <div>
                <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'#475569', marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>Marka İsimleri</label>
                <textarea
                  value={pastedBrands}
                  onChange={(e) => setPastedBrands(e.target.value)}
                  placeholder={'Nike\nAdidas\nPuma\n(her satıra bir marka)'}
                  rows={5}
                  style={{ width:'100%', resize:'none', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'0.6rem 0.75rem', fontSize:'0.8rem', fontFamily:'inherit', outline:'none', color:'#1e293b', background:'#f8fafc', boxSizing:'border-box', lineHeight:1.5 }}
                  onFocus={e => (e.target.style.borderColor='#3b82f6')}
                  onBlur={e => (e.target.style.borderColor='#e2e8f0')}
                />
                {pasteLineCount > 0 && <div style={{ fontSize:'0.65rem', color:'#64748b', marginTop:'0.25rem' }}>{pasteLineCount} marka girildi</div>}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                <span style={{ fontSize:'0.65rem', color:'#94a3b8' }}>veya liste yükle</span>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
              </div>

              {/* Drop zone — hem marka listesi hem Keepa dosyası kabul eder */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) { submitFile(f); setShowUploadPanel(false); } }}
                onClick={() => fileRef.current?.click()}
                style={{ border:`2px dashed ${dragOver ? '#3b82f6' : '#e2e8f0'}`, borderRadius:'10px', padding:'1.5rem 1rem', textAlign:'center', cursor:'pointer', background: dragOver ? '#eff6ff' : '#f8fafc', transition:'all 0.15s' }}
              >
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.tsv,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) { submitFile(f); setShowUploadPanel(false); } e.target.value=''; }} style={{ display:'none' }} />
                <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>📂</div>
                <div style={{ fontSize:'0.78rem', color:'#64748b' }}>Sürükle & bırak veya <span style={{ color:'#2563eb', fontWeight:600 }}>dosya seç</span></div>
                <div style={{ fontSize:'0.62rem', color:'#94a3b8', marginTop:'0.2rem' }}>Marka listesi (CSV/Excel) veya Keepa Export — otomatik algılanır</div>
              </div>

              {error && <div style={{ padding:'0.65rem 0.8rem', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', fontSize:'0.72rem', color:'#dc2626' }}>⚠ {error}</div>}

              {processingJob && (
                <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'9px', padding:'0.75rem 0.9rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.4rem' }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'#3b82f6', animation:'pulse 1.4s ease-in-out infinite', display:'inline-block', flexShrink:0 }} />
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#1d4ed8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{processingJob.file_name}</span>
                  </div>
                  <div style={{ height:'4px', background:'#bfdbfe', borderRadius:'999px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${processingJob.total_brands ? Math.round((processingJob.processed_brands/processingJob.total_brands)*100) : 0}%`, background:'#2563eb', borderRadius:'999px', transition:'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize:'0.63rem', color:'#3b82f6', marginTop:'0.25rem', textAlign:'right' }}>{processingJob.processed_brands} / {processingJob.total_brands || '?'} işlendi</div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding:'1rem 1.4rem', borderTop:'1px solid #f1f5f9' }}>
              <button
                onClick={() => { if (pastedBrands.trim()) { submitPasted(); setShowUploadPanel(false); } else fileRef.current?.click(); }}
                disabled={uploading}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.72rem', background: uploading?'#94a3b8':'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', border:'none', borderRadius:'9px', fontSize:'0.85rem', fontWeight:700, cursor: uploading?'not-allowed':'pointer', boxShadow: uploading?'none':'0 2px 10px rgba(37,99,235,0.35)' }}
              >
                {uploading
                  ? <><span style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> İşleniyor…</>
                  : pastedBrands.trim() ? <><Ic.Search /> Marka Araştır ({pasteLineCount})</> : <><Ic.Search /> Araştır / Dosya Yükle</>
                }
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── BREADCRUMB + PAGE HEADER ── */}
      <div style={{ marginBottom:'2rem' }}>
        <nav style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.6rem', fontWeight:700, color:'#76777d', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.65rem' }}>
          <span>WholesaleScout</span>
          <span style={{ fontSize:'0.8rem', opacity:0.5 }}>›</span>
          <span style={{ color:'#497cff' }}>Marka Keşfi</span>
        </nav>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <h2 style={{ fontSize:'2.1rem', fontWeight:900, color:'#131b2e', letterSpacing:'-0.03em', lineHeight:1, fontFamily:'Manrope, sans-serif', margin:0 }}>Marka Keşfi</h2>
            <span style={{ fontSize:'0.6rem', color:'#94a3b8', fontWeight:500 }}>OSINT + AI pipeline · Real-time enrichment · wholesale-scout.com</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', padding:'0.38rem 0.9rem', background:'rgba(0,150,104,0.05)', border:'1px solid rgba(0,150,104,0.12)', borderRadius:'10px' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background: processingJob ? '#3b82f6' : '#009668', animation: processingJob ? 'pulse 1.4s ease-in-out infinite' : 'none', flexShrink:0 }} />
              <span style={{ fontSize:'0.7rem', fontWeight:600, color: processingJob ? '#1d4ed8' : '#009668' }}>
                {processingJob ? `İşleniyor ${processingJob.processed_brands}/${processingJob.total_brands || '?'}` : 'AI Agent: Aktif'}
              </span>
            </div>
            <button onClick={() => setShowUploadPanel(true)} style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1.2rem', background:'#00174b', color:'#fff', border:'none', borderRadius:'12px', fontSize:'0.8rem', fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,23,75,0.2)' }}>
              + Yeni Araştırma
            </button>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>

      {true && <>

      {/* ── KPI CARDS (Precision Ledger style) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        {([
          { label:'Toplam Marka', accent:'#00174b', value: stats.total.toLocaleString(), badge: brands.length > 0 ? `+${Math.max(0, brands.length - Math.floor(brands.length * 0.86))} bu oturum` : null, extra: null },
          { label:'Bulunan E-posta',    accent:'#497cff', value: stats.emailFound.toLocaleString(), badge: stats.total > 0 ? `${Math.round(stats.emailFound / stats.total * 100)}% Oran` : null, extra: null },
          { label:'Doğrulanan Domain', accent:'#57657a', value: stats.domainOk.toLocaleString(), badge: null, extra:'verified' },
          { label:'Ort. Uygunluk Skoru', accent:'#009668', value: brands.length > 0 ? (brands.reduce((s, b) => s + (b.confidence_score ?? 0), 0) / brands.length).toFixed(1) : '—', badge: null, extra:'/100' },
        ] as { label:string; accent:string; value:string; badge:string|null; extra:string|null }[]).map(card => (
          <div key={card.label} style={{ background:'#fff', padding:'1.5rem', borderRadius:'12px', borderBottom:`4px solid ${card.accent}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:'128px' }}>
            <p style={{ fontSize:'0.62rem', fontWeight:700, color:'#76777d', textTransform:'uppercase', letterSpacing:'0.09em', margin:0 }}>{card.label}</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:'0.45rem', marginTop:'0.75rem' }}>
              <span style={{ fontSize:'1.9rem', fontWeight:900, color:'#131b2e', lineHeight:1, fontFamily:'Manrope, sans-serif' }}>{card.value}</span>
              {card.badge && <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#009668' }}>{card.badge}</span>}
              {card.extra === '/100' && <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#76777d' }}>/100</span>}
              {card.extra === 'verified' && <span style={{ fontSize:'0.8rem', color:'#009668' }}>✓</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS & ACTIONS ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', gap:'0.75rem', flexWrap:'wrap' }}>
        {/* Status tab pills */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.2rem', padding:'4px', background:'#f2f3ff', borderRadius:'12px' }}>
          {(['All', ...LEAD_STATUSES] as string[]).map(s => {
            const isActive = filterStatus === s;
            const labelMap: Record<string, string> = { All: 'Tümü', New: 'Yeni', Contacted: 'İletişim Kuruldu', Successful: 'Başarılı', Risk: 'Risk' };
            const label = labelMap[s] ?? s;
            return (
              <button key={s} onClick={() => { setFilterStatus(s); setBrandPage(0); }}
                style={{ padding:'0.38rem 1rem', borderRadius:'8px', border:'none', background: isActive ? '#fff' : 'transparent', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.07)' : 'none', fontSize:'0.72rem', fontWeight:700, color: isActive ? '#497cff' : '#57657a', cursor:'pointer', transition:'all 0.12s', whiteSpace:'nowrap' }}>
                {label}
              </button>
            );
          })}
        </div>
        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'0.6rem', top:'50%', transform:'translateY(-50%)', color:'#76777d', pointerEvents:'none', display:'flex' }}><Ic.Search /></span>
            <input value={search} onChange={e => { setSearch(e.target.value); setBrandPage(0); }} placeholder="Marka ara…"
              style={{ paddingLeft:'2rem', paddingRight:'0.75rem', paddingTop:'0.45rem', paddingBottom:'0.45rem', border:'1px solid rgba(198,198,205,0.4)', borderRadius:'10px', fontSize:'0.73rem', outline:'none', background:'#fff', color:'#131b2e', width:'200px', boxSizing:'border-box' }}
              onFocus={e => (e.target.style.borderColor='#497cff')} onBlur={e => (e.target.style.borderColor='rgba(198,198,205,0.4)')} />
          </div>
          <button onClick={copyAllEmails} style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.45rem 0.9rem', background:'#fff', border:'1px solid rgba(198,198,205,0.35)', borderRadius:'10px', fontSize:'0.72rem', fontWeight:700, color:'#131b2e', cursor:'pointer' }}>
            <Ic.Copy /> E-postaları Kopyala
          </button>
          <button onClick={exportCSV} style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.45rem 0.9rem', background:'#fff', border:'1px solid rgba(198,198,205,0.35)', borderRadius:'10px', fontSize:'0.72rem', fontWeight:700, color:'#131b2e', cursor:'pointer' }}>
            <Ic.Download /> CSV İndir
          </button>
          {brands.some(b => !b.wholesale_email && b.qualification_status !== 'inactive') && !processingJob && (
            <button onClick={() => setShowRetryConfirm(true)} disabled={retrying}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.45rem 0.9rem', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'10px', fontSize:'0.72rem', fontWeight:700, color:'#92400e', cursor:'pointer', opacity: retrying ? 0.6 : 1 }}>
              🔄 {retrying ? 'Taranıyor...' : 'Başarısızları Tekrar Tara'}
            </button>
          )}
        </div>
      </div>

      {/* ── WORKER OFFLINE UYARISI ── */}
      {workerOffline && (
        <div style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)', borderRadius:'12px', padding:'0.9rem 1.5rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <span style={{ fontSize:'1.2rem' }}>⚠️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#fff' }}>AI Agent Çevrimdışı</span>
            <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.75)', marginLeft:'0.5rem' }}>İşlem sunucusuna ulaşılamıyor. Yeni araştırma başlatılamaz. Lütfen birkaç dakika bekleyin.</span>
          </div>
        </div>
      )}

      {/* ── STUCK JOB UYARISI — processing ama banner yok (30dk+ eski) ── */}
      {!processingJob && jobsLoaded && jobs.some(j => j.status === 'processing' || j.status === 'pending') && (
        <div style={{ background:'linear-gradient(135deg,#d97706,#f59e0b)', borderRadius:'12px', padding:'0.9rem 1.5rem', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <span style={{ fontSize:'1.2rem' }}>⏱️</span>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#fff' }}>İşlem zaman aşımına uğradı</span>
            <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.85)', marginLeft:'0.5rem' }}>Tarama tamamlanamadı — kalan markalar işlenemedi.</span>
          </div>
          <button onClick={() => setShowRetryConfirm(true)} disabled={retrying}
            style={{ padding:'0.5rem 1rem', background:'#fff', color:'#d97706', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'0.75rem', cursor:'pointer', whiteSpace:'nowrap', opacity: retrying ? 0.6 : 1 }}>
            {retrying ? 'Taranıyor...' : '🔄 Tekrar Tara'}
          </button>
        </div>
      )}

      {/* ── CANLI İŞLEM BANNER'I ── */}
      {processingJob && (() => {
        const total = processingJob.total_brands || 1;
        const done  = processingJob.processed_brands || 0;
        const pct   = Math.round((done / total) * 100);
        return (
          <div style={{ background:'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius:'12px', padding:'1rem 1.5rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'1.25rem' }}>
            <span style={{ width:18, height:18, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite', display:'inline-block', flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#fff' }}>
                  AI Agent Çalışıyor — Markalar araştırılıyor…
                </span>
                <span style={{ fontSize:'0.75rem', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>
                  {done} / {total} tamamlandı
                </span>
              </div>
              <div style={{ width:'100%', height:'6px', background:'rgba(255,255,255,0.2)', borderRadius:'999px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'#fff', borderRadius:'999px', transition:'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', marginTop:'0.3rem' }}>
                Tablo otomatik güncelleniyor • Sayfayı kapatabilirsiniz, işlem arka planda devam eder
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── DATA TABLE (Precision Ledger style) ── */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(198,198,205,0.15)', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', overflow:'hidden' }}>
        {brands.length === 0 && !processingJob && !jobsLoaded ? (
          <div style={{ padding:'5rem 2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.8rem' }}>
              <span style={{ display:'inline-block', width:24, height:24, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#3b82f6', animation:'spin 0.8s linear infinite' }} />
            </div>
            <div style={{ fontWeight:700, color:'#64748b', fontSize:'0.85rem' }}>Veriler yükleniyor…</div>
          </div>
        ) : brands.length === 0 && !processingJob ? (
          <div style={{ padding:'5rem 2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.8rem' }}>🔍</div>
            <div style={{ fontWeight:800, color:'#131b2e', fontSize:'1.05rem', marginBottom:'0.4rem', fontFamily:'Manrope, sans-serif' }}>Henüz lead yok</div>
            <div style={{ color:'#76777d', fontSize:'0.8rem', marginBottom:'1.5rem' }}>Marka yüklemek için "Yeni Araştırma" butonuna tıkla</div>
            <button onClick={() => setShowUploadPanel(true)} style={{ padding:'0.6rem 1.5rem', background:'#00174b', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
              + Yeni Araştırma
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>😶</div>
            <div style={{ color:'#57657a', fontSize:'0.8rem', fontWeight:500 }}>Bu filtreye uygun marka yok.</div>
            <button onClick={() => { setFilterCategory('all'); setFilterStatus('All'); setSearch(''); setBrandPage(0); }}
              style={{ marginTop:'0.75rem', padding:'0.4rem 1rem', background:'#eaedff', color:'#497cff', border:'none', borderRadius:'8px', fontSize:'0.72rem', fontWeight:700, cursor:'pointer' }}>
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                <thead>
                  <tr style={{ background:'rgba(242,243,255,0.6)' }}>
                    {['MARKA ADI', 'DOMAIN & SOSYAL', 'İLETİŞİM E-POSTASI', 'TELEFON', 'AMAZON / ASIN', 'UYGUNLUK SKORU', 'DURUM', ''].map(h => (
                      <th key={h} style={{ padding:'1rem 1.5rem', fontSize:'0.59rem', fontWeight:700, color:'#76777d', textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap', borderBottom:'1px solid rgba(198,198,205,0.2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b, i) => {
                    const score = b.confidence_score ?? 0;
                    const scoreColor = score >= 70 ? '#009668' : score >= 40 ? '#497cff' : '#ba1a1a';
                    const initials = (b.brand_name?.slice(0, 2) ?? '??').toUpperCase();
                    const qualBadge = score >= 70
                      ? { label:'Elite', bg:'rgba(0,150,104,0.1)', color:'#009668' }
                      : score >= 40
                      ? { label:'Good', bg:'rgba(73,124,255,0.1)', color:'#497cff' }
                      : null;
                    return (
                      <tr key={b.id}
                        style={{ borderBottom: i < paginated.length - 1 ? '1px solid #eaedff' : 'none', cursor:'pointer', transition:'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f2f3ff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setInspectedBrand(inspectedBrand?.id === b.id ? null : b)}
                      >
                        {/* Brand Name */}
                        <td style={{ padding:'1.25rem 1.5rem' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                            <div style={{ width:40, height:40, borderRadius:'8px', background:'#dae2fd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#00174b', fontSize:'0.72rem', flexShrink:0, letterSpacing:'-0.01em' }}>
                              {initials}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#131b2e', display:'flex', alignItems:'center', gap:'0.4rem', margin:0, flexWrap:'wrap' }}>
                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'150px', display:'inline-block' }}>{b.brand_name}</span>
                                {qualBadge && <span style={{ fontSize:'0.56rem', background:qualBadge.bg, color:qualBadge.color, padding:'0.1rem 0.4rem', borderRadius:'3px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em', flexShrink:0 }}>{qualBadge.label}</span>}
                              </p>
                              <p style={{ fontSize:'0.67rem', color:'#76777d', margin:0, marginTop:'0.1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px' }}>
                                {b.location || (b.qualification_status === 'inactive' && b.elimination_reason
                                  ? b.elimination_reason.substring(0, 50) + (b.elimination_reason.length > 50 ? '…' : '')
                                  : b.qualification_status ? ({ qualified: 'Uygun', marginal: 'Sınırda', inactive: 'Elendi' }[b.qualification_status] ?? b.qualification_status) : (b.distributor ? `Via ${b.distributor}` : '—'))}
                              </p>
                              {b.contact_form_url && (
                                <a href={b.contact_form_url} target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  title="Contact sayfasına git"
                                  style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', marginTop:'0.3rem', fontSize:'0.59rem', fontWeight:700, color:'#497cff', background:'rgba(73,124,255,0.08)', border:'1px solid rgba(73,124,255,0.25)', padding:'0.15rem 0.45rem', borderRadius:'4px', textDecoration:'none', whiteSpace:'nowrap', lineHeight:1.4 }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(73,124,255,0.18)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(73,124,255,0.08)'; }}>
                                  ✉ İletişim Formu
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Domain & Socials */}
                        <td style={{ padding:'1.25rem 1.5rem' }}>
                          {b.official_domain ? (
                            <div>
                              <a href={`https://${b.official_domain}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#497cff', textDecoration:'none', marginBottom:'0.4rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px' }}>
                                {b.official_domain}
                              </a>
                              <div style={{ display:'flex', gap:'0.35rem', alignItems:'center' }}>
                                <a href={`https://${b.official_domain}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color:'#76777d', display:'flex', lineHeight:1 }}><Ic.Globe /></a>
                                {b.linkedin_url && <a href={b.linkedin_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color:'#76777d', display:'flex', lineHeight:1 }}><Ic.LinkedIn /></a>}
                                {b.instagram_url && <a href={b.instagram_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color:'#76777d', display:'flex', lineHeight:1 }}><Ic.Instagram /></a>}
                                {b.tiktok_url && <a href={b.tiktok_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color:'#76777d', display:'flex', lineHeight:1 }}><Ic.TikTok /></a>}
                              </div>
                            </div>
                          ) : <span style={{ color:'#c6c6cd', fontSize:'0.75rem' }}>—</span>}
                        </td>
                        {/* Contact Email — primary +N badge, tıklayınca dropdown */}
                        <td style={{ padding:'1.25rem 1.5rem', position:'relative' }} onClick={e=>e.stopPropagation()}>
                          {b.wholesale_email ? (() => {
                            const altEmails = _getCleanAltEmails(b);
                            const dmEmail   = b.decision_maker_email && b.decision_maker_email !== b.wholesale_email ? b.decision_maker_email : null;
                            const extraCount = altEmails.length + (dmEmail ? 1 : 0);
                            const isExpanded = expandedEmailRow === b.id;

                            return (
                              <div style={{ position:'relative' }}>
                                {/* Ana satır: primary email + +N badge */}
                                <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                                  <span style={{ fontSize:'0.73rem', fontWeight:600, color:'#131b2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'148px' }}>{b.wholesale_email}</span>
                                  <button onClick={e => copyEmail(b.wholesale_email!, e)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===b.wholesale_email ? '#009668' : '#c6c6cd', borderRadius:'3px', flexShrink:0, display:'flex' }} onMouseEnter={e=>(e.currentTarget.style.color='#131b2e')} onMouseLeave={e=>(e.currentTarget.style.color=copiedEmail===b.wholesale_email?'#009668':'#c6c6cd')}>
                                    <Ic.Copy />
                                  </button>
                                  {/* +N badge */}
                                  {extraCount > 0 && (
                                    <button
                                      onClick={e => { e.stopPropagation(); setExpandedEmailRow(isExpanded ? null : b.id); }}
                                      style={{ fontSize:'0.58rem', fontWeight:700, color:'#2563eb', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'4px', padding:'0.1rem 0.35rem', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                                      +{extraCount}
                                    </button>
                                  )}
                                </div>

                                {/* Expanded dropdown */}
                                {isExpanded && (
                                  <div style={{ position:'absolute', top:'100%', left:0, zIndex:50, background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', padding:'0.6rem', minWidth:'230px', marginTop:'0.3rem' }}>
                                    <div style={{ fontSize:'0.58rem', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', marginBottom:'0.4rem' }}>Tüm E-postalar</div>
                                    {/* Alternatif emailler */}
                                    {altEmails.map(email => (
                                      <div key={email} style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.25rem 0', borderBottom:'1px solid #f8fafc' }}>
                                        <span style={{ fontSize:'0.62rem', color:'#64748b', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{email}</span>
                                        <button onClick={e => copyEmail(email, e)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===email ? '#009668' : '#c6c6cd', flexShrink:0, display:'flex' }}><Ic.Copy /></button>
                                      </div>
                                    ))}
                                    {/* Karar verici emaili */}
                                    {dmEmail && (
                                      <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.25rem 0', borderTop:'1px solid #f1f5f9', marginTop:'0.2rem' }}>
                                        <span style={{ fontSize:'0.55rem', fontWeight:700, color:'#6366f1', minWidth:'24px' }}>KV</span>
                                        <span style={{ fontSize:'0.62rem', color:'#6366f1', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dmEmail}</span>
                                        <button onClick={e => copyEmail(dmEmail, e)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===dmEmail ? '#009668' : '#c6c6cd', flexShrink:0, display:'flex' }}><Ic.Copy /></button>
                                        {b.decision_maker_linkedin && <a href={b.decision_maker_linkedin} target="_blank" rel="noreferrer" style={{ color:'#0a66c2', display:'flex' }}><Ic.LinkedIn /></a>}
                                      </div>
                                    )}
                                    {/* LinkedIn (email yoksa) */}
                                    {!dmEmail && b.decision_maker_name && b.decision_maker_linkedin && (
                                      <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', paddingTop:'0.3rem', borderTop:'1px solid #f1f5f9', marginTop:'0.2rem' }}>
                                        <a href={b.decision_maker_linkedin} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', fontSize:'0.6rem', fontWeight:600, color:'#0a66c2', background:'#eff6ff', padding:'0.15rem 0.45rem', borderRadius:'4px', textDecoration:'none', border:'1px solid #bfdbfe' }}>
                                          <Ic.LinkedIn /> {b.decision_maker_name?.split(' ')[0]}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })() : (processingJob && b.job_id === processingJob.id && b.qualification_status !== 'inactive') ? (
                            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                              <span style={{ width:8, height:8, borderRadius:'50%', border:'2px solid #497cff', borderTopColor:'transparent', animation:'spin 0.75s linear infinite', display:'inline-block', flexShrink:0 }} />
                              <span style={{ fontSize:'0.72rem', color:'#497cff', fontWeight:600 }}>Araştırılıyor…</span>
                            </div>
                          ) : (
                            <div style={{ maxWidth:'200px' }}>
                              {b.elimination_reason ? (
                                <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                                  <span style={{ fontSize:'0.65rem', fontWeight:700, color: b.qualification_status === 'inactive' ? '#dc2626' : '#d97706', display:'flex', alignItems:'center', gap:'0.25rem' }}>
                                    {b.qualification_status === 'inactive' ? '⛔' : '⚠️'}
                                    {b.qualification_status === 'inactive' ? 'Uygun Değil' : 'Belirsiz'}
                                  </span>
                                  <span style={{ fontSize:'0.58rem', color:'#64748b', lineHeight:'1.3' }}>{b.elimination_reason}</span>
                                </div>
                              ) : (
                                <span style={{ color:'#c6c6cd', fontSize:'0.7rem' }}>E-posta bulunamadı</span>
                              )}
                            </div>
                          )}
                        </td>
                        {/* Phone */}
                        <td style={{ padding:'1.25rem 1.5rem' }}>
                          {b.phone ? (
                            <a href={`tel:${b.phone}`} style={{ fontSize:'0.73rem', fontWeight:500, color:'#131b2e', textDecoration:'none', whiteSpace:'nowrap' }}>
                              📞 {b.phone}
                            </a>
                          ) : (
                            <span style={{ color:'#c6c6cd', fontSize:'0.75rem' }}>—</span>
                          )}
                        </td>
                        {/* Amazon / ASIN */}
                        <td style={{ padding:'1.25rem 1.5rem' }} onClick={e => e.stopPropagation()}>
                          {b.keepa_asin ? (
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                              <a href={b.keepa_amazon_url ?? `https://www.amazon.com/dp/${b.keepa_asin}`} target="_blank" rel="noreferrer"
                                style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.22rem 0.6rem', background:'#ff9900', color:'#fff', borderRadius:'6px', textDecoration:'none', fontSize:'0.68rem', fontWeight:800, fontFamily:'monospace', whiteSpace:'nowrap', width:'fit-content' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 11.5c0 5.52-4.48 10-10 10S1.5 17.02 1.5 11.5 5.98 1.5 11.5 1.5 21.5 5.98 21.5 11.5zm-10-7c-3.86 0-7 3.14-7 7 0 2.5 1.32 4.69 3.3 5.93.08.05.17.02.2-.07l.33-1.14c.03-.11-.01-.22-.1-.28C6.6 15.1 5.5 13.41 5.5 11.5c0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.91-1.1 3.6-2.73 4.44-.09.06-.13.17-.1.28l.33 1.14c.03.09.12.12.2.07C17.18 16.19 18.5 14 18.5 11.5c0-3.86-3.14-7-7-7z"/></svg>
                                {b.keepa_asin}
                              </a>
                              {b.keepa_score != null && (() => {
                                const ks = b.keepa_score;
                                const amzFit = ks >= 65 ? 'Uygun' : ks >= 40 ? 'Riskli' : 'Uygun Degil';
                                const amzColor = ks >= 65 ? '#059669' : ks >= 40 ? '#d97706' : '#dc2626';
                                const amzBg = ks >= 65 ? '#f0fdf4' : ks >= 40 ? '#fffbeb' : '#fef2f2';
                                const amzBorder = ks >= 65 ? '#bbf7d0' : ks >= 40 ? '#fde68a' : '#fecaca';
                                const amzIcon = ks >= 65 ? '✅' : ks >= 40 ? '⚠️' : '❌';
                                const reason = ks >= 65 ? 'Talep yuksek, rekabet uygun' : ks >= 40 ? 'Rekabet veya marj riski var' : 'Dusuk talep veya yuksek risk';
                                return (
                                  <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                                      <span style={{ padding:'0.1rem 0.4rem', borderRadius:'4px', fontSize:'0.58rem', fontWeight:700, color: amzColor, background: amzBg, border:`1px solid ${amzBorder}`, whiteSpace:'nowrap' }}>{amzIcon} {amzFit}</span>
                                      <span style={{ fontSize:'0.6rem', fontWeight:800, color: amzColor }}>{Math.round(ks)}</span>
                                    </div>
                                    <span style={{ fontSize:'0.54rem', color:'#94a3b8', lineHeight:'1.2' }}>{reason}</span>
                                    {b.keepa_offer_count != null && (
                                      <span style={{ fontSize:'0.54rem', color:'#64748b' }}>{b.keepa_offer_count} satici aktif</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <span style={{ color:'#c6c6cd', fontSize:'0.75rem' }}>—</span>
                          )}
                        </td>
                        {/* Viability Score */}
                        <td style={{ padding:'1.25rem 1.5rem' }}>
                          <div style={{ width:'140px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem' }}>
                              <span style={{ fontSize:'0.6rem', color:'#94a3b8', fontWeight:600, textTransform:'uppercase' }}>Brand</span>
                              <span style={{ fontSize:'0.75rem', fontWeight:900, color:scoreColor }}>{score}/100</span>
                            </div>
                            <div style={{ width:'100%', height:'4px', background:'#eaedff', borderRadius:'999px', marginBottom:'0.6rem' }}>
                              <div style={{ height:'100%', width:`${score}%`, background:scoreColor, transition:'width 0.4s' }} />
                            </div>
                            {b.keepa_score != null && (() => {
                              const ks = b.keepa_score;
                              const amzLabel = ks >= 65 ? 'Amazon Uygun' : ks >= 40 ? 'Amazon Riskli' : 'Amazon Uygun Degil';
                              const amzColor = ks >= 65 ? '#059669' : ks >= 40 ? '#d97706' : '#dc2626';
                              const amzBg = ks >= 65 ? '#f0fdf4' : ks >= 40 ? '#fffbeb' : '#fef2f2';
                              const amzBorder = ks >= 65 ? '#bbf7d0' : ks >= 40 ? '#fde68a' : '#fecaca';
                              return (
                                <>
                                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem', marginTop:'0.35rem' }}>
                                    <span style={{ fontSize:'0.55rem', color:'#94a3b8', fontWeight:600, textTransform:'uppercase' }}>Amazon</span>
                                    <span style={{ fontSize:'0.58rem', fontWeight:700, padding:'0.08rem 0.35rem', borderRadius:'4px', color: amzColor, background: amzBg, border:`1px solid ${amzBorder}`, whiteSpace:'nowrap' }}>
                                      {amzLabel} {Math.round(ks)}%
                                    </span>
                                  </div>
                                  <div style={{ width:'100%', height:'4px', background:'#eaedff', borderRadius:'999px' }}>
                                    <div style={{ height:'100%', width:`${ks}%`, background: amzColor, transition:'width 0.4s', borderRadius:'999px' }} />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        {/* Status */}
                        <td style={{ padding:'1.25rem 1.5rem' }} onClick={e => e.stopPropagation()}>
                          <StatusDropdown brandId={b.id} current={b.lead_status} onUpdate={handleStatusUpdate} />
                        </td>
                        {/* Action */}
                        <td style={{ padding:'1.25rem 1.5rem', textAlign:'right' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => deleteBrand(b.id)} disabled={deletingId === b.id}
                            style={{ background:'none', border:'none', cursor:'pointer', padding:'0.25rem', color:'#c6c6cd', borderRadius:'4px', display:'inline-flex', alignItems:'center', transition:'color 0.12s', opacity: deletingId === b.id ? 0.4 : 1 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ba1a1a')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#c6c6cd')}>
                            <Ic.Trash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ padding:'1rem 1.5rem', background:'rgba(242,243,255,0.3)', borderTop:'1px solid rgba(198,198,205,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:'0.72rem', fontWeight:700, color:'#76777d', margin:0 }}>
                Showing <span style={{ color:'#131b2e' }}>{filtered.length > 0 ? brandPage * BRAND_PAGE_SIZE + 1 : 0}–{Math.min((brandPage + 1) * BRAND_PAGE_SIZE, filtered.length)}</span> of <span style={{ color:'#131b2e' }}>{filtered.length}</span> leads
              </p>
              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <button onClick={() => setBrandPage(p => Math.max(0, p - 1))} disabled={brandPage === 0}
                    style={{ padding:'0.35rem 0.65rem', borderRadius:'8px', border:'1px solid rgba(198,198,205,0.3)', background: brandPage === 0 ? '#f8fafc' : '#fff', color: brandPage === 0 ? '#c6c6cd' : '#131b2e', fontSize:'0.72rem', cursor: brandPage === 0 ? 'default' : 'pointer' }}>‹</button>
                  <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#57657a', minWidth:'80px', textAlign:'center' }}>{brandPage + 1} / {totalPages}</span>
                  <button onClick={() => setBrandPage(p => Math.min(totalPages - 1, p + 1))} disabled={brandPage === totalPages - 1}
                    style={{ padding:'0.35rem 0.65rem', borderRadius:'8px', border:'1px solid rgba(198,198,205,0.3)', background: brandPage === totalPages - 1 ? '#f8fafc' : '#fff', color: brandPage === totalPages - 1 ? '#c6c6cd' : '#131b2e', fontSize:'0.72rem', cursor: brandPage === totalPages - 1 ? 'default' : 'pointer' }}>›</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>



      </> /* end brands section */}

      {/* ── KEEPA TABLE ── */}
      {activeTab === 'keepa' && (
        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          {/* Keepa Toolbar */}
          <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap', background:'#fafbfc' }}>
            <span style={{ fontWeight:800, fontSize:'0.88rem', color:'#0f172a' }}>{filteredKeepa.length}</span>
            <span style={{ fontSize:'0.72rem', color:'#64748b', fontWeight:500 }}>ürün</span>
            {processingJob && <span style={{ fontSize:'0.63rem', color:'#3b82f6', fontWeight:600, display:'flex', alignItems:'center', gap:'0.2rem' }}><span style={{ width:5, height:5, borderRadius:'50%', background:'#3b82f6', animation:'pulse 1.4s ease-in-out infinite', display:'inline-block' }} />işleniyor…</span>}
            {/* Keepa job seçici */}
            {jobs.filter(j => j.job_type === 'keepa').length > 1 && (
              <select
                value={selectedKeepaJobId ?? ''}
                onChange={e => setSelectedKeepaJobId(e.target.value || null)}
                style={{ padding:'0.22rem 0.5rem', border:'1px solid #e2e8f0', borderRadius:'6px', fontSize:'0.63rem', color:'#475569', background:'#fff', cursor:'pointer' }}
              >
                <option value=''>Tüm yüklemeler</option>
                {jobs.filter(j => j.job_type === 'keepa').map(j => (
                  <option key={j.id} value={j.id}>{j.file_name} ({new Date(j.created_at).toLocaleDateString('tr-TR')})</option>
                ))}
              </select>
            )}
            <div style={{ display:'flex', gap:'0.2rem', flexWrap:'wrap' }}>
              {(['all','WHOLESALE_UYGUN','TEKRAR_KONTROL','ELENDI'] as const).map(k => {
                const count = k === 'all' ? keepaProducts.length : keepaProducts.filter(p => p.kategori === k).length;
                const label = k === 'all' ? 'Tümü' : k === 'WHOLESALE_UYGUN' ? '✅ Uygun' : k === 'TEKRAR_KONTROL' ? '⚠️ Kontrol' : '❌ Elendi';
                return (
                  <button key={k} onClick={() => setKeepaFilter(k)}
                    style={{ padding:'0.25rem 0.6rem', borderRadius:'999px', border: keepaFilter===k ? '1.5px solid #3b82f6' : '1px solid #e2e8f0', background: keepaFilter===k ? '#eff6ff' : '#fff', color: keepaFilter===k ? '#1d4ed8' : '#64748b', fontSize:'0.63rem', fontWeight: keepaFilter===k ? 700 : 400, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.12s' }}>
                    {label} <span style={{ opacity:0.55 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Keepa Table */}
          {keepaProducts.length === 0 ? (
            <div style={{ padding:'4rem 2rem', textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.65rem' }}>📊</div>
              <div style={{ fontWeight:700, color:'#0f172a', marginBottom:'0.3rem', fontSize:'1rem' }}>Keepa verisi yok</div>
              <div style={{ color:'#94a3b8', fontSize:'0.78rem' }}>Sol panele Keepa CSV/Excel yükle.</div>
            </div>
          ) : filteredKeepa.length === 0 ? (
            <div style={{ padding:'2.5rem', textAlign:'center' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:'0.4rem' }}>😶</div>
              <div style={{ color:'#64748b', fontSize:'0.78rem', fontWeight:500 }}>Bu filtreyle eşleşen ürün bulunamadı.</div>
              <button onClick={() => setKeepaFilter('all')} style={{ marginTop:'0.75rem', padding:'0.35rem 0.85rem', background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', borderRadius:'8px', fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>Filtreyi Temizle</button>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.73rem' }}>
                <thead>
                  <tr style={{ background:'#f8fafc', position:'sticky', top:0, zIndex:2 }}>
                    {[
                      { label:'ASIN',       w:'105px' },
                      { label:'Marka / Ürün', w:'200px' },
                      { label:'Fiyat',      w:'70px'  },
                      { label:'BSR',        w:'80px'  },
                      { label:'Amazon BB%', w:'80px'  },
                      { label:'Satıcı',     w:'60px'  },
                      { label:'Satın/ay',   w:'70px'  },
                      { label:'Skor',       w:'90px'  },
                      { label:'Uygunluk',   w:'130px' },
                      { label:'Strateji / Sebep', w:'180px' },
                      { label:'İşlemler',   w:'110px' },
                    ].map(col => (
                      <th key={col.label} style={{ padding:'0.55rem 0.75rem', textAlign:'left', fontWeight:700, color:'#94a3b8', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'2px solid #f1f5f9', whiteSpace:'nowrap', minWidth:col.w }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredKeepa.map((p, i) => (
                    <tr key={p.id}
                      style={{ borderBottom: i < filteredKeepa.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      {/* ASIN */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <a href={p.amazon_url ?? `https://www.amazon.com/dp/${p.asin}`} target="_blank" rel="noreferrer"
                          style={{ display:'inline-flex', alignItems:'center', padding:'0.08rem 0.35rem', background:'#ff9900', color:'#fff', borderRadius:'4px', fontSize:'0.6rem', fontWeight:800, textDecoration:'none', fontFamily:'monospace', whiteSpace:'nowrap' }}>
                          {p.asin}
                        </a>
                      </td>
                      {/* Marka / Ürün */}
                      <td style={{ padding:'0.5rem 0.75rem', maxWidth:'200px' }}>
                        <div style={{ fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.brand}</div>
                        <div style={{ fontSize:'0.6rem', color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={p.title}>{p.title}</div>
                      </td>
                      {/* Fiyat */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ fontWeight:700, fontSize:'0.75rem', color: p.buybox_price != null && p.buybox_price >= 30 ? '#059669' : '#334155' }}>
                          {p.buybox_price != null ? `$${p.buybox_price.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      {/* BSR */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:600, color: p.bsr_current != null && p.bsr_current < 50000 ? '#059669' : p.bsr_current != null && p.bsr_current < 150000 ? '#2563eb' : '#64748b' }}>
                          {p.bsr_current != null ? p.bsr_current.toLocaleString() : '—'}
                        </span>
                      </td>
                      {/* Amazon BB% */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, color: p.amazon_bb_pct === 0 ? '#059669' : p.amazon_bb_pct != null && p.amazon_bb_pct < 30 ? '#2563eb' : p.amazon_bb_pct != null && p.amazon_bb_pct < 70 ? '#d97706' : '#dc2626' }}>
                          {p.amazon_bb_pct != null ? `%${p.amazon_bb_pct.toFixed(0)}` : '—'}
                        </span>
                      </td>
                      {/* Satıcı */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ fontWeight:700, fontSize:'0.73rem', color: p.offer_count != null && p.offer_count <= 10 ? '#059669' : '#64748b' }}>
                          {p.offer_count ?? '—'}
                        </span>
                      </td>
                      {/* Satın/ay */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ fontWeight:600, fontSize:'0.73rem', color: p.bought_past_month != null && p.bought_past_month > 200 ? '#059669' : '#64748b' }}>
                          {p.bought_past_month != null ? p.bought_past_month.toLocaleString() : '—'}
                        </span>
                      </td>
                      {/* Skor */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        {p.wholesale_score != null ? (
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem', minWidth:'65px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:'0.7rem', fontWeight:700, color: p.wholesale_score >= 65 ? '#059669' : p.wholesale_score >= 40 ? '#d97706' : '#dc2626' }}>{Math.round(p.wholesale_score)}</span>
                              <span style={{ fontSize:'0.52rem', color:'#94a3b8' }}>/100</span>
                            </div>
                            <div style={{ height:'3px', background:'#f1f5f9', borderRadius:'999px', overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${p.wholesale_score}%`, background: p.wholesale_score >= 65 ? 'linear-gradient(90deg,#10b981,#059669)' : p.wholesale_score >= 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#f87171,#dc2626)', borderRadius:'999px' }} />
                            </div>
                          </div>
                        ) : <span style={{ color:'#94a3b8', fontSize:'0.65rem' }}>—</span>}
                      </td>
                      {/* Kategori */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        {(() => {
                          const isUygun = p.kategori === 'WHOLESALE_UYGUN';
                          const isKontrol = p.kategori === 'TEKRAR_KONTROL';
                          const label = isUygun ? '✅ Toptan Uygun' : isKontrol ? '⚠️ Incelenmeli' : '❌ Uygun Degil';
                          const color = isUygun ? '#166534' : isKontrol ? '#92400e' : '#b91c1c';
                          const bg = isUygun ? '#f0fdf4' : isKontrol ? '#fffbeb' : '#fef2f2';
                          const border = isUygun ? '#bbf7d0' : isKontrol ? '#fde68a' : '#fecaca';
                          const reason = isUygun
                            ? (p.amazon_bb_pct === 0 ? 'Amazon satmiyor' : p.amazon_bb_pct != null && p.amazon_bb_pct < 30 ? 'Amazon payi dusuk' : 'Iyi satis metrikleri')
                            : isKontrol
                            ? (p.amazon_bb_pct != null && p.amazon_bb_pct > 50 ? 'Amazon payi yuksek' : p.offer_count != null && p.offer_count > 15 ? 'Cok satici var' : 'Marj riski olabilir')
                            : (p.eleme_nedeni || (p.amazon_bb_pct != null && p.amazon_bb_pct > 85 ? 'Amazon domine ediyor' : p.bsr_current != null && p.bsr_current > 150000 ? 'Dusuk talep' : 'Dusuk skor'));
                          return (
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                              <span style={{ padding:'0.12rem 0.4rem', borderRadius:'5px', fontSize:'0.6rem', fontWeight:700, background: bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap', width:'fit-content' }}>{label}</span>
                              <span style={{ fontSize:'0.52rem', color:'#64748b', lineHeight:'1.25' }}>{reason}</span>
                            </div>
                          );
                        })()}
                      </td>
                      {/* Strateji */}
                      <td style={{ padding:'0.5rem 0.75rem', maxWidth:'160px' }}>
                        {p.strateji_etiketleri ? (() => {
                          let tags: string[] = [];
                          try { tags = JSON.parse(p.strateji_etiketleri); } catch { tags = p.strateji_etiketleri.split(',').filter(Boolean); }
                          return (
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.18rem' }}>
                                {(Array.isArray(tags) ? tags : []).slice(0, 4).map(s => (
                                  <span key={String(s)} style={{ padding:'0.08rem 0.32rem', borderRadius:'3px', fontSize:'0.55rem', fontWeight:600, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', whiteSpace:'nowrap' }}>{String(s).trim()}</span>
                                ))}
                              </div>
                              {p.eleme_nedeni && <span style={{ fontSize:'0.52rem', color:'#ef4444', lineHeight:'1.2' }}>{p.eleme_nedeni}</span>}
                            </div>
                          );
                        })() : p.eleme_nedeni ? (
                          <span style={{ fontSize:'0.6rem', color:'#dc2626', fontStyle:'italic' }}>{p.eleme_nedeni}</span>
                        ) : <span style={{ color:'#94a3b8' }}>—</span>}
                      </td>
                      {/* İşlemler */}
                      <td style={{ padding:'0.5rem 0.5rem' }}>
                        <div style={{ display:'flex', gap:'0.2rem', alignItems:'center' }}>
                          {/* Amazon ürün sayfası */}
                          <a href={p.amazon_url ?? `https://www.amazon.com/dp/${p.asin}`} target="_blank" rel="noreferrer"
                            title="Amazon'da aç"
                            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:5, background:'#ff9900', textDecoration:'none', fontSize:'0.62rem', fontWeight:800, color:'#fff', flexShrink:0 }}>
                            A
                          </a>
                          {/* Amazon satıcı listesi */}
                          <a href={`https://www.amazon.com/gp/offer-listing/${p.asin}`} target="_blank" rel="noreferrer"
                            title="Tüm satıcılar"
                            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:5, background:'#fff', border:'1px solid #e2e8f0', textDecoration:'none', fontSize:'0.65rem', fontWeight:800, color:'#ff9900', flexShrink:0 }}>
                            ↗
                          </a>
                          {/* Keepa */}
                          <a href={`https://keepa.com/#!product/1-${p.asin}`} target="_blank" rel="noreferrer"
                            title="Keepa'da aç"
                            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:5, background:'#fff', border:'1px solid #e2e8f0', textDecoration:'none', fontSize:'0.6rem', flexShrink:0 }}>
                            🔍
                          </a>
                          {/* ASIN kopyala */}
                          <button onClick={() => navigator.clipboard.writeText(p.asin)}
                            title="ASIN kopyala"
                            style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:5, background:'#fff', border:'1px solid #e2e8f0', cursor:'pointer', fontSize:'0.6rem', flexShrink:0 }}>
                            📋
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      </div>

      {/* ── DETAIL DRAWER ── */}
      {inspectedBrand && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.3)', zIndex:2000, backdropFilter:'blur(2px)' }} onClick={() => setInspectedBrand(null)} />
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'340px', background:'#fff', zIndex:2001, boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'1.1rem 1.2rem 0.8rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'0.65rem' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#64748b', fontSize:'0.85rem', flexShrink:0 }}>
                {inspectedBrand.brand_name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#0f172a' }}>{inspectedBrand.brand_name}</div>
                {inspectedBrand.official_domain && <a href={`https://${inspectedBrand.official_domain}`} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', color:'#3b82f6', textDecoration:'none' }}>{inspectedBrand.official_domain}</a>}
              </div>
              <button onClick={() => setInspectedBrand(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.2rem', color:'#94a3b8', fontSize:'1rem', lineHeight:1 }}>✕</button>
            </div>

            <div style={{ flex:1, padding:'1rem 1.2rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Status */}
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Status</div>
                <StatusDropdown brandId={inspectedBrand.id} current={inspectedBrand.lead_status} onUpdate={handleStatusUpdate} />
              </div>

              {/* Contact */}
              {(inspectedBrand.wholesale_email || inspectedBrand.contact_form_url || inspectedBrand.decision_maker_name) && (
                <div>
                  <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Contact</div>
                  <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                    {inspectedBrand.wholesale_email ? (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Email</span>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', flex:1, minWidth:0 }}>
                          <a href={`mailto:${inspectedBrand.wholesale_email}`} style={{ fontSize:'0.72rem', color:'#2563eb', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inspectedBrand.wholesale_email}</a>
                          <button onClick={e=>copyEmail(inspectedBrand.wholesale_email!,e)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===inspectedBrand.wholesale_email?'#22c55e':'#94a3b8', flexShrink:0 }}><Ic.Copy /></button>
                        </div>
                      </div>
                    ) : inspectedBrand.contact_form_url ? (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Form</span>
                        <a href={inspectedBrand.contact_form_url} target="_blank" rel="noreferrer"
                          style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.18rem 0.6rem', background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:'5px', fontSize:'0.7rem', fontWeight:700, textDecoration:'none' }}>
                          <Ic.ExternalLink /><span>İletişim Formu</span>
                        </a>
                      </div>
                    ) : null}
                    {inspectedBrand.decision_maker_name && (
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Contact</span>
                        <div>
                          <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#0f172a' }}>{inspectedBrand.decision_maker_name}</div>
                          {inspectedBrand.decision_maker_title && <div style={{ fontSize:'0.64rem', color:'#64748b' }}>{inspectedBrand.decision_maker_title}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Socials */}
              {(inspectedBrand.linkedin_url || inspectedBrand.instagram_url || inspectedBrand.tiktok_url) && (
                <div>
                  <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Social Links</div>
                  <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                    {[
                      { label:'LinkedIn',  url:inspectedBrand.linkedin_url,  followers: undefined },
                      { label:'Instagram', url:inspectedBrand.instagram_url, followers: inspectedBrand.instagram_followers },
                      { label:'TikTok',    url:inspectedBrand.tiktok_url,    followers: inspectedBrand.tiktok_followers },
                    ].filter(x=>x.url).map(x => (
                      <div key={x.label} style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>{x.label}</span>
                        <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:'0.35rem' }}>
                          <a href={x.url} target="_blank" rel="noreferrer" style={{ fontSize:'0.72rem', color:'#3b82f6', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{x.url}</a>
                          {x.followers != null && (
                            <span style={{ fontSize:'0.6rem', color:'#64748b', whiteSpace:'nowrap', flexShrink:0 }}>
                              {x.followers >= 1000 ? `${(x.followers/1000).toFixed(1)}K` : x.followers} takipçi
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Doğrulama Kartı ── */}
              {(inspectedBrand.brand_type || inspectedBrand.verification_score || inspectedBrand.ecommerce_platform || inspectedBrand.has_wholesale_page || inspectedBrand.faire_url || inspectedBrand.ssl_valid != null || inspectedBrand.trustpilot_rating) && (
                <div>
                  <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>Marka Doğrulama</div>
                  <div style={{ background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'0.65rem 0.8rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                    {/* Tip + Doğrulama skoru */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <BrandTypeBadge type={inspectedBrand.brand_type} />
                      {inspectedBrand.verification_score !== undefined && (
                        <span style={{ fontSize:'0.65rem', color:'#64748b' }}>
                          Doğrulama <strong style={{ color: inspectedBrand.verification_score >= 70 ? '#166534' : inspectedBrand.verification_score >= 40 ? '#1d4ed8' : '#94a3b8' }}>
                            {inspectedBrand.verification_score}/100
                          </strong>
                        </span>
                      )}
                    </div>
                    {/* Platform */}
                    {inspectedBrand.ecommerce_platform && inspectedBrand.ecommerce_platform !== 'custom' && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Platform</span>
                        <span style={{ fontSize:'0.68rem', fontWeight:600, color:'#334155', textTransform:'capitalize' }}>{inspectedBrand.ecommerce_platform}</span>
                      </div>
                    )}
                    {/* Wholesale sayfası */}
                    {inspectedBrand.has_wholesale_page && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Toptan</span>
                        {inspectedBrand.wholesale_page_url
                          ? <a href={inspectedBrand.wholesale_page_url} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', color:'#166534', fontWeight:600, textDecoration:'none' }}>✓ Toptan sayfası →</a>
                          : <span style={{ fontSize:'0.68rem', color:'#166534', fontWeight:600 }}>✓ Toptan sayfası var</span>
                        }
                      </div>
                    )}
                    {/* Fiziksel adres */}
                    {inspectedBrand.physical_address && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'flex-start' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px', flexShrink:0 }}>Adres</span>
                        <span style={{ fontSize:'0.67rem', color:'#334155', lineHeight:1.4 }}>{inspectedBrand.physical_address}</span>
                      </div>
                    )}
                    {/* Trustpilot */}
                    {inspectedBrand.trustpilot_rating && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Trustpilot</span>
                        <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#334155' }}>
                          {'★'.repeat(Math.round(inspectedBrand.trustpilot_rating))} {inspectedBrand.trustpilot_rating.toFixed(1)}
                          {inspectedBrand.trustpilot_reviews ? ` (${inspectedBrand.trustpilot_reviews.toLocaleString()} yorum)` : ''}
                        </span>
                      </div>
                    )}
                    {/* SSL */}
                    {inspectedBrand.ssl_valid != null && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>SSL</span>
                        <span style={{ fontSize:'0.68rem', fontWeight:600, color: inspectedBrand.ssl_valid ? '#166534' : '#b91c1c' }}>
                          {inspectedBrand.ssl_valid ? '✓ Güvenli HTTPS' : '✗ SSL Yok'}
                        </span>
                      </div>
                    )}
                    {/* Faire */}
                    {inspectedBrand.faire_url && (
                      <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                        <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Faire</span>
                        <a href={inspectedBrand.faire_url} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', fontWeight:600, color:'#1d4ed8', textDecoration:'none' }}>✓ Faire'de mevcut →</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Ulaşım Planı (Outreach) ── */}
              {(() => {
                const os = inspectedBrand.outreach_score ?? 0;
                const rec = inspectedBrand.outreach_recommendation;
                const approachRaw = inspectedBrand.outreach_approach;
                const template = inspectedBrand.outreach_email_template;
                const qs = inspectedBrand.qualification_status;
                const signalsRaw = inspectedBrand.qualification_signals;
                let approaches: {method:string;label:string;value:string;icon:string}[] = [];
                let signals: string[] = [];
                try { approaches = approachRaw ? JSON.parse(approachRaw) : []; } catch { /* */ }
                try { signals = signalsRaw ? JSON.parse(signalsRaw) : []; } catch { /* */ }

                const osColor = os >= 70 ? '#059669' : os >= 40 ? '#2563eb' : '#dc2626';
                const osBg    = os >= 70 ? '#f0fdf4' : os >= 40 ? '#eff6ff' : '#fef2f2';

                return (
                  <div style={{ marginBottom:'0.8rem' }}>
                    <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>🎯 Ulaşım Planı</div>
                    <div style={{ background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'0.65rem 0.8rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>

                      {/* Kalifikasyon durumu */}
                      {qs && (
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <span style={{ padding:'0.15rem 0.5rem', borderRadius:'999px', fontSize:'0.6rem', fontWeight:700,
                            background: qs==='qualified' ? '#f0fdf4' : qs==='marginal' ? '#fffbeb' : '#fef2f2',
                            color:      qs==='qualified' ? '#166534' : qs==='marginal' ? '#92400e' : '#b91c1c',
                            border:     `1px solid ${qs==='qualified' ? '#bbf7d0' : qs==='marginal' ? '#fde68a' : '#fecaca'}`,
                          }}>
                            {qs==='qualified' ? '✓ Doğrulandı' : qs==='marginal' ? '~ Kısmi Doğrulama' : '✗ Ulaşılamaz'}
                          </span>
                          {signals.length > 0 && (
                            <span style={{ fontSize:'0.58rem', color:'#64748b' }} title={signals.join(' • ')}>{signals.length} sinyal</span>
                          )}
                        </div>
                      )}

                      {/* Outreach skoru — bar */}
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
                          <span style={{ fontSize:'0.62rem', color:'#64748b', fontWeight:600 }}>İletişim Hazırlık Skoru</span>
                          <span style={{ fontSize:'0.7rem', fontWeight:800, color: osColor }}>{os}/100</span>
                        </div>
                        <div style={{ height:'6px', background:'#e2e8f0', borderRadius:'999px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${os}%`, background:`linear-gradient(90deg,${osColor},${osColor}aa)`, borderRadius:'999px', transition:'width 0.4s' }} />
                        </div>
                        {rec && <div style={{ fontSize:'0.6rem', color:'#475569', marginTop:'0.2rem', fontStyle:'italic' }}>{rec}</div>}
                      </div>

                      {/* Yaklaşım yöntemleri */}
                      {approaches.length > 0 && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                          <div style={{ fontSize:'0.6rem', fontWeight:600, color:'#64748b', textTransform:'uppercase' }}>En İyi Yaklaşımlar</div>
                          {approaches.slice(0, 3).map((a, i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.3rem 0.5rem', background:'#fff', borderRadius:'6px', border:'1px solid #e2e8f0' }}>
                              <span style={{ fontSize:'0.8rem' }}>{a.icon}</span>
                              <span style={{ fontSize:'0.63rem', color:'#0f172a', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.label}</span>
                              {a.value && (
                                <a href={a.value.startsWith('http') ? a.value : `mailto:${a.value}`} target="_blank" rel="noreferrer"
                                  style={{ fontSize:'0.58rem', color:'#3b82f6', fontWeight:600, textDecoration:'none', flexShrink:0 }}>→</a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Email şablonu */}
                      {template && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(template); alert('Email şablonu kopyalandı!'); }}
                          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.35rem', padding:'0.4rem 0.7rem', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', border:'none', borderRadius:'7px', fontSize:'0.68rem', fontWeight:700, cursor:'pointer', marginTop:'0.1rem' }}
                        >
                          📋 Toptan Email Şablonu Kopyala
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Dağıtım Şeması ── */}
              {(() => {
                const dt = inspectedBrand.distribution_type;
                const kd = inspectedBrand.known_distributors;
                const hw = inspectedBrand.has_wholesale_page;
                const fu = inspectedBrand.faire_url;
                const wpu = inspectedBrand.wholesale_page_url;
                const hasAny = dt || kd || hw || fu || inspectedBrand.distributor || inspectedBrand.distribution_channels;
                if (!hasAny) return null;
                const dtCfg: Record<string, { label: string; bg: string; color: string }> = {
                  direct:      { label: '✓ Direkt Toptan',                bg: '#f0fdf4', color: '#166534' },
                  marketplace: { label: '🏪 Marketplace',                  bg: '#eff6ff', color: '#1d4ed8' },
                  mixed:       { label: '⚡ Karma (Direkt + Marketplace)', bg: '#fffbeb', color: '#92400e' },
                  unknown:     { label: '? Tespit Edilemedi',              bg: '#f8fafc', color: '#94a3b8' },
                };
                const cfg = dt ? (dtCfg[dt] ?? dtCfg.unknown) : null;
                return (
                  <div>
                    <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>📦 Dağıtım Şeması</div>
                    <div style={{ background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'0.65rem 0.8rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      {/* Kanal tipi */}
                      {cfg && dt !== 'unknown' && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>Kanal</span>
                          <span style={{ padding:'0.15rem 0.5rem', borderRadius:'5px', fontSize:'0.62rem', fontWeight:700, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                        </div>
                      )}
                      {/* Direkt toptan sayfası */}
                      {hw && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>Direkt</span>
                          {wpu
                            ? <a href={wpu} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', fontWeight:600, color:'#166534', textDecoration:'none' }}>✓ Kendi sitesinden toptan →</a>
                            : <span style={{ fontSize:'0.68rem', fontWeight:600, color:'#166534' }}>✓ Kendi sitesinden toptan</span>
                          }
                        </div>
                      )}
                      {/* Faire */}
                      {fu && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>Faire</span>
                          <a href={fu} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', fontWeight:600, color:'#1d4ed8', textDecoration:'none' }}>🏪 Faire'de listelendi →</a>
                        </div>
                      )}
                      {/* Known distributors */}
                      {kd && (
                        <div>
                          <div style={{ fontSize:'0.6rem', color:'#94a3b8', marginBottom:'0.2rem' }}>Diğer Platformlar</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.2rem' }}>
                            {kd.split(',').filter(Boolean).map(d => (
                              <span key={d} style={{ padding:'0.15rem 0.4rem', borderRadius:'4px', fontSize:'0.62rem', fontWeight:600, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>🏪 {d.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Legacy distributor */}
                      {inspectedBrand.distributor && !kd?.includes(inspectedBrand.distributor) && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>Satıcı</span>
                          <span style={{ fontSize:'0.68rem', color:'#334155' }}>🏪 {inspectedBrand.distributor}</span>
                        </div>
                      )}
                      {/* Distribution channels */}
                      {inspectedBrand.distribution_channels && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.2rem' }}>
                          {inspectedBrand.distribution_channels.split(',').filter(Boolean).map(ch => (
                            <span key={ch} style={{ padding:'0.15rem 0.4rem', borderRadius:'4px', fontSize:'0.62rem', fontWeight:600, background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' }}>✓ {ch.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Güvenlik & Dolandırıcılık Riski ── */}
              {(() => {
                const fr = inspectedBrand.fraud_risk;
                const ff = inspectedBrand.fraud_flags;
                const ssl = inspectedBrand.ssl_valid;
                const hasAny = fr || ff || ssl != null;
                if (!hasAny) return null;
                const riskCfg: Record<string, { label: string; bg: string; color: string; dot: string }> = {
                  safe:    { label: '✓ Güvenli',       bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
                  low:     { label: '● Düşük Risk',    bg: '#f0fdf4', color: '#15803d', dot: '#86efac' },
                  medium:  { label: '⚠ Orta Risk',    bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
                  high:    { label: '✗ Yüksek Risk',   bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
                  unknown: { label: '? Bilinmiyor',    bg: '#f8fafc', color: '#94a3b8', dot: '#cbd5e1' },
                };
                const rc = riskCfg[fr ?? 'unknown'] ?? riskCfg.unknown;
                const flagLabels: Record<string, string> = {
                  high_risk_tld:              'Riskli TLD (.xyz, .shop...)',
                  medium_risk_tld:            'Alışılmamış TLD',
                  name_domain_mismatch:       'Domain-Marka adı uyuşmuyor',
                  suspicious_domain_pattern:  'Şüpheli domain kalıbı',
                  email_domain_mismatch:      'Email domain farklı',
                  no_ssl:                     'SSL sertifikası yok',
                  very_new_domain:            'Çok yeni domain (< 6 ay)',
                  new_domain:                 'Yeni domain (< 1 yıl)',
                };
                return (
                  <div>
                    <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>🔒 Güvenlik Analizi</div>
                    <div style={{ background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'0.65rem 0.8rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                      {fr && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>Risk</span>
                          <span style={{ padding:'0.15rem 0.5rem', borderRadius:'5px', fontSize:'0.63rem', fontWeight:700, background:rc.bg, color:rc.color }}>{rc.label}</span>
                        </div>
                      )}
                      {ssl != null && (
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'50px', flexShrink:0 }}>SSL</span>
                          <span style={{ fontSize:'0.68rem', fontWeight:600, color: ssl ? '#166534' : '#b91c1c' }}>{ssl ? '✓ Güvenli HTTPS' : '✗ SSL Yok'}</span>
                        </div>
                      )}
                      {ff && (
                        <div>
                          <div style={{ fontSize:'0.6rem', color:'#94a3b8', marginBottom:'0.2rem' }}>Uyarılar</div>
                          <div style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
                            {ff.split(',').filter(Boolean).map(f => (
                              <span key={f} style={{ fontSize:'0.62rem', color:'#92400e', display:'flex', alignItems:'center', gap:'0.25rem' }}>
                                <span style={{ width:5, height:5, borderRadius:'50%', background:'#f59e0b', flexShrink:0, display:'inline-block' }} />
                                {flagLabels[f.trim()] ?? f.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Info */}
              {(inspectedBrand.location || inspectedBrand.company_employee_count) && (
                <div>
                  <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Şirket Bilgisi</div>
                  <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                    {inspectedBrand.location && <div style={{ display:'flex', gap:'0.4rem' }}><span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px' }}>Konum</span><span style={{ fontSize:'0.72rem', color:'#334155' }}>{inspectedBrand.location}</span></div>}
                    {inspectedBrand.company_employee_count && <div style={{ display:'flex', gap:'0.4rem' }}><span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px' }}>Çalışan</span><span style={{ fontSize:'0.72rem', color:'#334155' }}>{inspectedBrand.company_employee_count.toLocaleString()}</span></div>}
                  </div>
                </div>
              )}

              {/* Score bar */}
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Confidence</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                  <ConfidenceBadge score={inspectedBrand.confidence_score} />
                  <div style={{ flex:1, height:'4px', background:'#e2e8f0', borderRadius:'999px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${inspectedBrand.confidence_score}%`, background: inspectedBrand.confidence_score>=70?'#22c55e':inspectedBrand.confidence_score>=40?'#3b82f6':'#ef4444', borderRadius:'999px' }} />
                  </div>
                  <span style={{ fontSize:'0.7rem', fontWeight:700, color:'#0f172a', minWidth:'28px', textAlign:'right' }}>{inspectedBrand.confidence_score}%</span>
                </div>
              </div>
            </div>

            <div style={{ padding:'0.8rem 1.2rem', borderTop:'1px solid #f1f5f9', display:'flex', gap:'0.45rem' }}>
              <button onClick={() => { deleteBrand(inspectedBrand.id); }} style={{ flex:1, padding:'0.45rem', background:'#fff', color:'#ef4444', border:'1px solid #fecaca', borderRadius:'7px', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>Sil</button>
              <button onClick={() => setInspectedBrand(null)} style={{ flex:1, padding:'0.45rem', background:'#0f172a', color:'#fff', border:'none', borderRadius:'7px', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>Kapat</button>
            </div>
          </div>
        </>
      )}

      {/* ── TEKRAR TARA ONAY MODAL ── */}
      {showRetryConfirm && (
        <>
          <div onClick={() => setShowRetryConfirm(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999 }} />
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:'16px', padding:'2rem', width:'420px', maxWidth:'90vw', zIndex:1000, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>🔄</div>
            <h3 style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a', margin:'0 0 0.5rem' }}>Başarısız Markaları Tekrar Tara</h3>
            <p style={{ fontSize:'0.82rem', color:'#64748b', lineHeight:1.6, marginBottom:'1.25rem' }}>
              <strong style={{ color:'#0f172a' }}>{failedBrandsList.length} marka</strong> için email bulunamadı. Bu markalar silinip tekrar taranacak. Her marka 1 kredi harcar.
            </p>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <button onClick={() => setShowRetryConfirm(false)} style={{ flex:1, padding:'0.6rem', background:'#f8fafc', color:'#64748b', border:'1px solid #e2e8f0', borderRadius:'10px', fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>Vazgeç</button>
              <button onClick={retryFailedBrands} disabled={retrying} style={{ flex:1, padding:'0.6rem', background:'#d97706', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', opacity: retrying ? 0.6 : 1 }}>
                {retrying ? 'Gönderiliyor...' : `${failedBrandsList.length} Markayı Tara`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
