'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_brands: number;
  processed_brands: number;
  created_at: string;
  result_csv?: string;
  result_xlsx?: string;
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
  created_at: string;
  brand_type?: 'brand' | 'distributor' | 'retailer' | 'unknown';
  ecommerce_platform?: string;
  trustpilot_rating?: number;
  trustpilot_reviews?: number;
  distribution_channels?: string;
  has_wholesale_page?: boolean;
  wholesale_page_url?: string;
  physical_address?: string;
  verification_score?: number;
  ssl_valid?: boolean;
  faire_url?: string;
  instagram_followers?: number;
  tiktok_followers?: number;
}

const LEAD_STATUS_CFG: Record<string, { bg: string; color: string; dot: string }> = {
  New:        { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  Contacted:  { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Successful: { bg: '#fefce8', color: '#92400e', dot: '#f59e0b' },
  Risk:       { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
};

function ConfidenceBadge({ score }: { score: number }) {
  const cfg = score >= 70
    ? { bg: '#fef3c7', color: '#92400e', text: '★ ELITE' }
    : score >= 40
    ? { bg: '#dbeafe', color: '#1d4ed8', text: '◆ GOOD' }
    : { bg: '#fee2e2', color: '#b91c1c', text: '○ LOW' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'0.1rem 0.4rem', borderRadius:'999px', fontSize:'0.58rem', fontWeight:700, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      {cfg.text}
    </span>
  );
}

const Ic = {
  Globe: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
  LinkedIn: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>),
  Instagram: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>),
  TikTok: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z"/></svg>),
  Mail: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  Copy: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  Search: () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>),
  Trash: () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>),
  MapPin: () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
};

const LEAD_STATUSES = ['New', 'Contacted', 'Successful', 'Risk'] as const;

export default function MyLeadsPage() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedJob, setSelectedJob]   = useState('all');

  // Initialize job filter from URL param (?job=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const job = params.get('job');
    if (job) setSelectedJob(job);
  }, []);
  const [copiedEmail, setCopiedEmail]   = useState<string | null>(null);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds]   = useState<Set<string>>(new Set());
  const [inspectedBrand, setInspectedBrand] = useState<Brand | null>(null);
  const [queueing, setQueueing]         = useState(false);
  const [queueMsg, setQueueMsg]         = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [jr, br] = await Promise.all([fetch('/api/jobs'), fetch('/api/brands')]);
      if (jr.ok) setJobs(await jr.json());
      if (br.ok) setBrands(await br.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function copyEmail(email: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    navigator.clipboard.writeText(email).then(() => {
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 1800);
    });
  }

  const filtered = brands.filter((b) => {
    const ms = !search
      || b.brand_name.toLowerCase().includes(search.toLowerCase())
      || (b.wholesale_email ?? '').toLowerCase().includes(search.toLowerCase())
      || (b.official_domain ?? '').toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === 'All' || (b.lead_status ?? 'New') === filterStatus;
    const mj = selectedJob === 'all' || b.job_id === selectedJob;
    return ms && mf && mj;
  });

  const statusCounts = { All: brands.length, New: 0, Contacted: 0, Successful: 0, Risk: 0 } as Record<string, number>;
  for (const b of brands) { const s = b.lead_status ?? 'New'; if (s in statusCounts) statusCounts[s]++; }

  const jobMap = Object.fromEntries(jobs.map(j => [j.id, j]));

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' });
  }

  /* ── Checkbox helpers ── */
  const allFilteredSelected = filtered.length > 0 && filtered.every(b => selectedIds.has(b.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(b => n.delete(b.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(b => n.add(b.id)); return n; });
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function deleteSelected() {
    if (!window.confirm(`${selectedIds.size} marka silinsin mi?`)) return;
    const ids = Array.from(selectedIds);
    setDeletingIds(new Set(ids));
    await Promise.all(ids.map(id => fetch(`/api/brands/${id}`, { method: 'DELETE' })));
    setDeletingIds(new Set());
    setSelectedIds(new Set());
    setBrands(prev => prev.filter(b => !ids.includes(b.id)));
  }

  async function deleteSingle(id: string) {
    setDeletingIds(prev => new Set(prev).add(id));
    await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setBrands(prev => prev.filter(b => b.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (inspectedBrand?.id === id) setInspectedBrand(null);
  }

  async function addToQueue() {
    const ids = Array.from(selectedIds);
    const withEmail = ids.filter(id => brands.find(b => b.id === id)?.wholesale_email);
    if (withEmail.length === 0) {
      setQueueMsg('Seçili markaların hiçbirinde email adresi yok.');
      setTimeout(() => setQueueMsg(null), 3500);
      return;
    }
    setQueueing(true);
    try {
      const resp = await fetch('/api/email-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_ids: withEmail }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setQueueMsg(`✓ ${data.added ?? withEmail.length} email kuyruğa eklendi`);
      } else {
        setQueueMsg('Kuyruğa eklenemedi. Tekrar deneyin.');
      }
    } catch {
      setQueueMsg('Bağlantı hatası.');
    } finally {
      setQueueing(false);
      setTimeout(() => setQueueMsg(null), 3500);
    }
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'#94a3b8', fontSize:'0.85rem' }}>
        Yükleniyor…
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e2e8f0', padding:'4rem 2rem', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📋</div>
        <div style={{ fontWeight:600, color:'#0f172a', marginBottom:'0.3rem' }}>Henüz lead yok</div>
        <div style={{ color:'#94a3b8', fontSize:'0.82rem', marginBottom:'1.25rem' }}>İlk CSV dosyanı yükleyip arama başlat.</div>
        <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1.2rem', background:'#2563eb', color:'#fff', borderRadius:'8px', fontSize:'0.82rem', fontWeight:600, textDecoration:'none' }}>
          Lead Discovery'ye Git →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>

      {/* ── Main Table Card ── */}
      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>

        {/* Toolbar */}
        <div style={{ padding:'0.7rem 1rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
          {/* Count + bulk actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
            <span style={{ fontWeight:700, fontSize:'0.83rem', color:'#0f172a' }}>{filtered.length} lead</span>
            {someSelected && (
              <>
                <button
                  onClick={addToQueue}
                  disabled={queueing}
                  style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.55rem', background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, cursor:'pointer', opacity: queueing ? 0.6 : 1 }}
                >
                  📧 {queueing ? 'Ekleniyor…' : `${selectedIds.size} Kuyruğa Ekle`}
                </button>
                <button
                  onClick={deleteSelected}
                  style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', padding:'0.2rem 0.55rem', background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, cursor:'pointer' }}
                >
                  <Ic.Trash /> {selectedIds.size} Sil
                </button>
              </>
            )}
          </div>

          {/* Search */}
          <div style={{ flex:1, minWidth:'140px', position:'relative' }}>
            <span style={{ position:'absolute', left:'0.5rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}><Ic.Search /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Marka, email, domain ara…"
              style={{ width:'100%', paddingLeft:'1.7rem', paddingRight:'0.6rem', paddingTop:'0.33rem', paddingBottom:'0.33rem', border:'1px solid #e2e8f0', borderRadius:'6px', fontSize:'0.73rem', outline:'none', background:'#f8fafc', color:'#0f172a', boxSizing:'border-box' }}
            />
          </div>

          {/* Job filter */}
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            style={{ padding:'0.3rem 0.6rem', border:'1px solid #e2e8f0', borderRadius:'6px', fontSize:'0.73rem', color:'#475569', background:'#fff', outline:'none', cursor:'pointer', flexShrink:0, maxWidth:'180px' }}
          >
            <option value="all">Tüm Aramalar</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.file_name.length > 24 ? j.file_name.slice(0, 24) + '…' : j.file_name} ({fmtDate(j.created_at)})
              </option>
            ))}
          </select>

          {/* Status pills */}
          <div style={{ display:'flex', gap:'0.22rem' }}>
            {(['All', ...LEAD_STATUSES] as string[]).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding:'0.2rem 0.5rem', borderRadius:'5px', border: filterStatus===s ? '1.5px solid #3b82f6' : '1px solid #e2e8f0', background: filterStatus===s ? '#eff6ff' : '#fff', color: filterStatus===s ? '#1d4ed8' : '#64748b', fontSize:'0.63rem', fontWeight: filterStatus===s ? 700 : 400, cursor:'pointer', whiteSpace:'nowrap' }}>
                {s} <span style={{ opacity:0.6 }}>{statusCounts[s] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* New search */}
          <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.28rem 0.65rem', background:'#2563eb', color:'#fff', borderRadius:'6px', fontSize:'0.68rem', fontWeight:600, textDecoration:'none', flexShrink:0 }}>
            + Yeni Arama
          </Link>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ padding:'3rem 2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🔍</div>
            <div style={{ fontWeight:600, color:'#0f172a', marginBottom:'0.2rem' }}>
              {brands.length === 0 ? 'Henüz lead yok' : 'Filtre eşleşmesi yok'}
            </div>
            <div style={{ color:'#94a3b8', fontSize:'0.78rem' }}>
              {brands.length === 0 ? 'Bir CSV yükleyip worker\'ı başlatın.' : 'Farklı filtre deneyin.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.74rem' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {/* Select all */}
                  <th style={{ padding:'0.5rem 0.6rem', width:'32px' }}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      style={{ cursor:'pointer', width:'13px', height:'13px', accentColor:'#2563eb' }}
                    />
                  </th>
                  {[
                    { k:'company',  label:'Marka',           w:'190px' },
                    { k:'contact',  label:'İletişim Kişisi',  w:'140px' },
                    { k:'email',    label:'Toptan Email',     w:'200px' },
                    { k:'location', label:'Konum',            w:'100px' },
                    { k:'score',    label:'Skor',             w:'75px'  },
                    { k:'status',   label:'Durum',            w:'100px' },
                    { k:'socials',  label:'Sosyal',           w:'95px'  },
                    { k:'job',      label:'Arama',            w:'110px' },
                    { k:'actions',  label:'',                 w:'50px'  },
                  ].map(col => (
                    <th key={col.k} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontWeight:600, color:'#94a3b8', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap', minWidth:col.w }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const st = b.lead_status ?? 'New';
                  const stCfg = LEAD_STATUS_CFG[st] ?? LEAD_STATUS_CFG.New;
                  const job = b.job_id ? jobMap[b.job_id] : null;
                  const isSelected = selectedIds.has(b.id);
                  const isDeleting = deletingIds.has(b.id);
                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: i < filtered.length-1 ? '1px solid #f8fafc' : 'none', transition:'background 0.1s', background: inspectedBrand?.id===b.id ? '#eff6ff' : isSelected ? '#f0f7ff' : 'transparent', opacity: isDeleting ? 0.4 : 1, borderLeft: inspectedBrand?.id===b.id ? '3px solid #3b82f6' : '3px solid transparent' }}
                      onMouseEnter={e => { if (inspectedBrand?.id!==b.id && !isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = inspectedBrand?.id===b.id ? '#eff6ff' : isSelected ? '#f0f7ff' : 'transparent'; }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding:'0.5rem 0.6rem' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(b.id)}
                          style={{ cursor:'pointer', width:'13px', height:'13px', accentColor:'#2563eb' }}
                        />
                      </td>

                      {/* Company */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#64748b', fontSize:'0.65rem', flexShrink:0 }}>
                            {b.brand_name?.[0]?.toUpperCase()}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'140px' }}>{b.brand_name}</div>
                            {b.official_domain && (
                              <a href={`https://${b.official_domain}`} target="_blank" rel="noreferrer" style={{ fontSize:'0.6rem', color:'#3b82f6', textDecoration:'none' }}>{b.official_domain}</a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding:'0.5rem 0.75rem', maxWidth:'140px' }}>
                        {b.decision_maker_name ? (
                          <div>
                            <div style={{ fontWeight:500, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.decision_maker_name}</div>
                            {b.decision_maker_title && <div style={{ fontSize:'0.6rem', color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.decision_maker_title}</div>}
                          </div>
                        ) : <span style={{ color:'#e2e8f0' }}>—</span>}
                      </td>

                      {/* Email */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        {b.wholesale_email ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                            <a href={`mailto:${b.wholesale_email}`} style={{ color:'#2563eb', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'140px', display:'block', fontSize:'0.72rem' }}>
                              {b.wholesale_email}
                            </a>
                            <button onClick={e => copyEmail(b.wholesale_email!, e)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===b.wholesale_email ? '#22c55e' : '#cbd5e1', flexShrink:0 }}><Ic.Copy /></button>
                            <button onClick={e => { e.stopPropagation(); window.open(`mailto:${b.wholesale_email}`); }} title="Mail Gönder" style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color:'#3b82f6', flexShrink:0 }}><Ic.Mail /></button>
                          </div>
                        ) : <span style={{ color:'#e2e8f0' }}>—</span>}
                      </td>

                      {/* Location */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        {b.location ? (
                          <div style={{ display:'flex', alignItems:'center', gap:'0.25rem', color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'90px', fontSize:'0.72rem' }}>
                            <Ic.MapPin />{b.location}
                          </div>
                        ) : <span style={{ color:'#e2e8f0' }}>—</span>}
                      </td>

                      {/* Score */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <ConfidenceBadge score={b.confidence_score} />
                      </td>

                      {/* Status */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'0.28rem', padding:'0.15rem 0.45rem', background:stCfg.bg, color:stCfg.color, borderRadius:'5px', fontSize:'0.65rem', fontWeight:600, whiteSpace:'nowrap' }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:stCfg.dot, display:'inline-block', flexShrink:0 }} />
                          {st}
                        </span>
                      </td>

                      {/* Socials */}
                      <td style={{ padding:'0.5rem 0.75rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                          {b.official_domain
                            ? <a href={`https://${b.official_domain}`} target="_blank" rel="noreferrer" style={{ color:'#3b82f6' }}><Ic.Globe /></a>
                            : <span style={{ color:'#e2e8f0' }}><Ic.Globe /></span>}
                          {b.linkedin_url
                            ? <a href={b.linkedin_url} target="_blank" rel="noreferrer" style={{ color:'#3b82f6' }}><Ic.LinkedIn /></a>
                            : <span style={{ color:'#e2e8f0' }}><Ic.LinkedIn /></span>}
                          {b.instagram_url
                            ? <a href={b.instagram_url} target="_blank" rel="noreferrer" style={{ color:'#3b82f6' }}><Ic.Instagram /></a>
                            : <span style={{ color:'#e2e8f0' }}><Ic.Instagram /></span>}
                          {b.tiktok_url
                            ? <a href={b.tiktok_url} target="_blank" rel="noreferrer" style={{ color:'#3b82f6' }}><Ic.TikTok /></a>
                            : <span style={{ color:'#e2e8f0' }}><Ic.TikTok /></span>}
                        </div>
                      </td>

                      {/* Job source */}
                      <td style={{ padding:'0.5rem 0.75rem' }}>
                        {job ? (
                          <div>
                            <div style={{ fontSize:'0.62rem', color:'#475569', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100px', fontWeight:500 }}>
                              {job.file_name.length > 16 ? job.file_name.slice(0, 16) + '…' : job.file_name}
                            </div>
                            <div style={{ fontSize:'0.58rem', color:'#94a3b8' }}>{fmtDate(job.created_at)}</div>
                          </div>
                        ) : <span style={{ color:'#e2e8f0' }}>—</span>}
                      </td>

                      {/* Actions */}
                      <td style={{ padding:'0.5rem 0.5rem' }}>
                        <div style={{ display:'flex', gap:'0.2rem', alignItems:'center' }}>
                          <button
                            onClick={e => { e.stopPropagation(); setInspectedBrand(inspectedBrand?.id===b.id ? null : b); }}
                            title="Detay"
                            style={{ background: inspectedBrand?.id===b.id ? '#eff6ff' : 'none', border: inspectedBrand?.id===b.id ? '1px solid #bfdbfe' : 'none', cursor:'pointer', padding:'0.2rem 0.3rem', color: inspectedBrand?.id===b.id ? '#2563eb' : '#94a3b8', display:'flex', alignItems:'center', borderRadius:'4px', transition:'all 0.12s', fontSize:'0.65rem' }}
                            onMouseEnter={e=>{ if(inspectedBrand?.id!==b.id) e.currentTarget.style.color='#3b82f6'; }}
                            onMouseLeave={e=>{ e.currentTarget.style.color = inspectedBrand?.id===b.id ? '#2563eb' : '#94a3b8'; }}
                          >🔍</button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteSingle(b.id); }}
                            disabled={isDeleting}
                            style={{ background:'none', border:'none', cursor:'pointer', padding:'0.2rem', color:'#e2e8f0', display:'flex', alignItems:'center', borderRadius:'4px', transition:'color 0.12s', opacity: isDeleting ? 0.4 : 1 }}
                            onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')}
                            onMouseLeave={e=>(e.currentTarget.style.color='#e2e8f0')}
                          >
                            <Ic.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Queue Toast ── */}
      {queueMsg && (
        <div style={{ position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)', background: queueMsg.startsWith('✓') ? '#0f172a' : '#fef2f2', color: queueMsg.startsWith('✓') ? '#fff' : '#b91c1c', padding:'0.55rem 1.2rem', borderRadius:'8px', fontSize:'0.8rem', fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.15)', zIndex:3000, whiteSpace:'nowrap', animation:'fadeIn 0.2s ease' }}>
          {queueMsg}
        </div>
      )}

    {/* ── BRAND INSPECTOR ── */}
    {inspectedBrand && (
      <>
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.3)', zIndex:2000, backdropFilter:'blur(2px)' }} onClick={() => setInspectedBrand(null)} />
        <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'340px', background:'#fff', zIndex:2001, boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', overflowY:'auto', display:'flex', flexDirection:'column' }}>

          {/* Header */}
          <div style={{ padding:'1.1rem 1.2rem 0.8rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'0.65rem' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#64748b', fontSize:'0.85rem', flexShrink:0 }}>
              {inspectedBrand.brand_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#0f172a' }}>{inspectedBrand.brand_name}</div>
              {inspectedBrand.official_domain && <a href={`https://${inspectedBrand.official_domain}`} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', color:'#3b82f6', textDecoration:'none' }}>{inspectedBrand.official_domain}</a>}
            </div>
            <button onClick={() => setInspectedBrand(null)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.2rem', color:'#94a3b8', fontSize:'1.1rem', lineHeight:1 }}>✕</button>
          </div>

          <div style={{ flex:1, padding:'1rem 1.2rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Durum */}
            <div>
              <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Durum</div>
              {(() => {
                const s = inspectedBrand.lead_status ?? 'New';
                const cfg = LEAD_STATUS_CFG[s] ?? LEAD_STATUS_CFG.New;
                return (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.65rem', borderRadius:'6px', background:cfg.bg, color:cfg.color, fontSize:'0.73rem', fontWeight:600 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot, flexShrink:0 }} />
                    {s}
                  </span>
                );
              })()}
            </div>

            {/* İletişim */}
            {(inspectedBrand.wholesale_email || inspectedBrand.decision_maker_name) && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>İletişim</div>
                <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                  {inspectedBrand.wholesale_email && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Email</span>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', flex:1, minWidth:0 }}>
                        <a href={`mailto:${inspectedBrand.wholesale_email}`} style={{ fontSize:'0.72rem', color:'#2563eb', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inspectedBrand.wholesale_email}</a>
                        <button onClick={() => copyEmail(inspectedBrand.wholesale_email!)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color: copiedEmail===inspectedBrand.wholesale_email ? '#22c55e' : '#94a3b8', flexShrink:0 }}><Ic.Copy /></button>
                        <button onClick={() => window.open(`mailto:${inspectedBrand.wholesale_email}`)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0.1rem', color:'#3b82f6', flexShrink:0 }}><Ic.Mail /></button>
                      </div>
                    </div>
                  )}
                  {inspectedBrand.decision_maker_name && (
                    <div style={{ display:'flex', gap:'0.4rem' }}>
                      <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Kişi</span>
                      <div>
                        <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#0f172a' }}>{inspectedBrand.decision_maker_name}</div>
                        {inspectedBrand.decision_maker_title && <div style={{ fontSize:'0.64rem', color:'#64748b' }}>{inspectedBrand.decision_maker_title}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Marka Bilgisi */}
            {(inspectedBrand.brand_type || inspectedBrand.ecommerce_platform || inspectedBrand.has_wholesale_page || inspectedBrand.faire_url || inspectedBrand.ssl_valid != null || inspectedBrand.trustpilot_rating) && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>Marka Bilgisi</div>
                <div style={{ background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', padding:'0.65rem 0.8rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                  {inspectedBrand.brand_type && inspectedBrand.brand_type !== 'unknown' && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Tip</span>
                      <span style={{ padding:'0.1rem 0.4rem', borderRadius:'4px', fontSize:'0.6rem', fontWeight:700, background: inspectedBrand.brand_type==='brand'?'#f0fdf4':inspectedBrand.brand_type==='distributor'?'#fef3c7':'#f1f5f9', color: inspectedBrand.brand_type==='brand'?'#166534':inspectedBrand.brand_type==='distributor'?'#92400e':'#475569' }}>
                        {inspectedBrand.brand_type==='brand'?'✓ Marka':inspectedBrand.brand_type==='distributor'?'⚠ Distribütör':'◆ Perakendeci'}
                      </span>
                    </div>
                  )}
                  {inspectedBrand.ecommerce_platform && inspectedBrand.ecommerce_platform !== 'custom' && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Platform</span>
                      <span style={{ fontSize:'0.68rem', fontWeight:600, color:'#334155', textTransform:'capitalize' }}>{inspectedBrand.ecommerce_platform}</span>
                    </div>
                  )}
                  {inspectedBrand.has_wholesale_page && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Toptan</span>
                      {inspectedBrand.wholesale_page_url
                        ? <a href={inspectedBrand.wholesale_page_url} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', fontWeight:600, color:'#166534', textDecoration:'none' }}>✓ Toptan sayfası →</a>
                        : <span style={{ fontSize:'0.68rem', fontWeight:600, color:'#166534' }}>✓ Toptan sayfası var</span>
                      }
                    </div>
                  )}
                  {inspectedBrand.faire_url && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Faire</span>
                      <a href={inspectedBrand.faire_url} target="_blank" rel="noreferrer" style={{ fontSize:'0.68rem', fontWeight:600, color:'#1d4ed8', textDecoration:'none' }}>✓ Faire'de mevcut →</a>
                    </div>
                  )}
                  {inspectedBrand.ssl_valid != null && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>SSL</span>
                      <span style={{ fontSize:'0.68rem', fontWeight:600, color: inspectedBrand.ssl_valid ? '#166534' : '#b91c1c' }}>
                        {inspectedBrand.ssl_valid ? '✓ Güvenli HTTPS' : '✗ SSL Yok'}
                      </span>
                    </div>
                  )}
                  {inspectedBrand.trustpilot_rating && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.62rem', color:'#94a3b8', width:'70px' }}>Trustpilot</span>
                      <span style={{ fontSize:'0.68rem', fontWeight:700, color:'#334155' }}>
                        {'★'.repeat(Math.round(inspectedBrand.trustpilot_rating))} {inspectedBrand.trustpilot_rating.toFixed(1)}
                        {inspectedBrand.trustpilot_reviews ? ` (${inspectedBrand.trustpilot_reviews.toLocaleString()})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dağıtım */}
            {(inspectedBrand.distributor || inspectedBrand.distribution_channels) && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.4rem' }}>Dağıtım Kanalları</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
                  {inspectedBrand.distributor && (
                    <span style={{ padding:'0.2rem 0.5rem', borderRadius:'5px', fontSize:'0.65rem', fontWeight:600, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>🏪 {inspectedBrand.distributor}</span>
                  )}
                  {inspectedBrand.distribution_channels && inspectedBrand.distribution_channels.split(',').filter(Boolean).map(ch => (
                    <span key={ch} style={{ padding:'0.2rem 0.5rem', borderRadius:'5px', fontSize:'0.65rem', fontWeight:600, background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' }}>✓ {ch.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sosyal */}
            {(inspectedBrand.linkedin_url || inspectedBrand.instagram_url || inspectedBrand.tiktok_url) && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Sosyal Medya</div>
                <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                  {[
                    { label:'LinkedIn',  url:inspectedBrand.linkedin_url,  followers: undefined },
                    { label:'Instagram', url:inspectedBrand.instagram_url, followers: inspectedBrand.instagram_followers },
                    { label:'TikTok',    url:inspectedBrand.tiktok_url,    followers: inspectedBrand.tiktok_followers },
                  ].filter(x=>x.url).map(x => (
                    <div key={x.label} style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'60px', flexShrink:0 }}>{x.label}</span>
                      <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:'0.3rem' }}>
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

            {/* Şirket */}
            {(inspectedBrand.location || inspectedBrand.company_employee_count || inspectedBrand.physical_address) && (
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Şirket Bilgisi</div>
                <div style={{ background:'#f8fafc', borderRadius:'7px', padding:'0.65rem 0.8rem', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                  {inspectedBrand.location && <div style={{ display:'flex', gap:'0.4rem' }}><span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px' }}>Konum</span><span style={{ fontSize:'0.72rem', color:'#334155' }}>{inspectedBrand.location}</span></div>}
                  {inspectedBrand.company_employee_count && <div style={{ display:'flex', gap:'0.4rem' }}><span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px' }}>Çalışan</span><span style={{ fontSize:'0.72rem', color:'#334155' }}>{inspectedBrand.company_employee_count.toLocaleString()}</span></div>}
                  {inspectedBrand.physical_address && <div style={{ display:'flex', gap:'0.4rem', alignItems:'flex-start' }}><span style={{ fontSize:'0.68rem', color:'#94a3b8', width:'55px', flexShrink:0 }}>Adres</span><span style={{ fontSize:'0.67rem', color:'#334155', lineHeight:1.4 }}>{inspectedBrand.physical_address}</span></div>}
                </div>
              </div>
            )}

            {/* Confidence */}
            <div>
              <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#94a3b8', marginBottom:'0.35rem' }}>Güven Skoru</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                <div style={{ flex:1, height:'4px', background:'#e2e8f0', borderRadius:'999px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${inspectedBrand.confidence_score}%`, background: inspectedBrand.confidence_score>=70?'#22c55e':inspectedBrand.confidence_score>=40?'#3b82f6':'#ef4444', borderRadius:'999px' }} />
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color:'#0f172a', minWidth:'28px', textAlign:'right' }}>{inspectedBrand.confidence_score}%</span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ padding:'0.8rem 1.2rem', borderTop:'1px solid #f1f5f9', display:'flex', gap:'0.45rem' }}>
            <button onClick={() => { deleteSingle(inspectedBrand.id); }} style={{ flex:1, padding:'0.45rem', background:'#fff', color:'#ef4444', border:'1px solid #fecaca', borderRadius:'7px', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>Sil</button>
            <button onClick={() => setInspectedBrand(null)} style={{ flex:1, padding:'0.45rem', background:'#0f172a', color:'#fff', border:'none', borderRadius:'7px', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>Kapat</button>
          </div>
        </div>
      </>
    )}
  </div>
  );
}
