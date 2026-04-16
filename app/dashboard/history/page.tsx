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
  error_message?: string;
  job_type?: 'brand' | 'keepa';
}

const STATUS_COLOR: Record<string, string> = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  completed:  '#22c55e',
  failed:     '#ef4444',
};

const IcTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

function groupByDate(jobs: Job[]): Record<string, Job[]> {
  const groups: Record<string, Job[]> = {};
  for (const job of jobs) {
    const d = new Date(job.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = 'Bugün';
    else if (d.toDateString() === yesterday.toDateString()) key = 'Dün';
    else key = d.toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(job);
  }
  return groups;
}

export default function SearchHistoryPage() {
  const [jobs, setJobs]             = useState<Job[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      setJobs(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleSelectAll() {
    if (selectedIds.size === jobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map(j => j.id)));
    }
  }

  async function deleteSelected() {
    if (!window.confirm(`${selectedIds.size} arama ve tüm leadleri silinsin mi?`)) return;
    const ids = Array.from(selectedIds);
    setDeletingIds(new Set(ids));
    await Promise.all(ids.map(id => fetch(`/api/jobs/${id}`, { method: 'DELETE' })));
    setDeletingIds(new Set());
    setSelectedIds(new Set());
    setJobs(prev => prev.filter(j => !ids.includes(j.id)));
  }

  async function deleteSingle(id: string) {
    if (!window.confirm('Bu arama ve tüm leadleri silinsin mi?')) return;
    setDeletingIds(prev => new Set(prev).add(id));
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setJobs(prev => prev.filter(j => j.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'#4a6080', fontSize:'0.85rem' }}>
        Yükleniyor…
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ background:'#0f1b2d', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)', padding:'4rem 2rem', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🕐</div>
        <div style={{ fontWeight:600, color:'#e8f0fe', marginBottom:'0.3rem' }}>Henüz arama geçmişi yok</div>
        <div style={{ color:'#4a6080', fontSize:'0.82rem', marginBottom:'1.25rem' }}>
          Tamamlanan aramalar burada görünür.
        </div>
        <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1.2rem', background:'#2563eb', color:'#fff', borderRadius:'8px', fontSize:'0.82rem', fontWeight:600, textDecoration:'none' }}>
          Lead Discovery Başlat →
        </Link>
      </div>
    );
  }

  const groups = groupByDate(jobs);
  const totalBrands = jobs.filter(j => j.status === 'completed').reduce((s, j) => s + (j.processed_brands || 0), 0);
  const totalSearches = jobs.filter(j => j.status === 'completed').length;
  const allSelected = jobs.length > 0 && selectedIds.size === jobs.length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.75rem' }}>
        {[
          { label:'Toplam Arama', value:jobs.length,     icon:'🔍' },
          { label:'Tamamlanan',   value:totalSearches,   icon:'✅' },
          { label:'Zenginleştirilen Marka', value:totalBrands, icon:'📊' },
        ].map((s) => (
          <div key={s.label} style={{ background:'#0f1b2d', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.07)', padding:'1rem 1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
              <span style={{ fontSize:'0.7rem', color:'#4a6080', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{s.label}</span>
              <span style={{ fontSize:'1rem' }}>{s.icon}</span>
            </div>
            <div style={{ fontWeight:700, fontSize:'1.5rem', color:'#e8f0fe' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 1rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'8px' }}>
          <span style={{ fontSize:'0.78rem', color:'#f87171', fontWeight:600 }}>{selectedIds.size} arama seçili</span>
          <button
            onClick={deleteSelected}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.3rem 0.75rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:'6px', fontSize:'0.73rem', fontWeight:600, cursor:'pointer' }}
          >
            <IcTrash /> Seçilenleri Sil
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{ fontSize:'0.73rem', color:'#5a7090', background:'none', border:'none', cursor:'pointer' }}
          >
            İptal
          </button>
        </div>
      )}

      {/* Select all row */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.3rem 0' }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          style={{ cursor:'pointer', width:'13px', height:'13px', accentColor:'#2563eb' }}
        />
        <span style={{ fontSize:'0.73rem', color:'#5a7090' }}>
          {allSelected ? 'Tümünü kaldır' : 'Tümünü seç'}
        </span>
      </div>

      {/* Timeline */}
      {Object.entries(groups).map(([date, dayJobs]) => (
        <div key={date}>
          {/* Date header */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.6rem' }}>
            <div style={{ fontWeight:700, fontSize:'0.78rem', color:'#5a7090', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
              {date}
            </div>
            <div style={{ flex:1, height:'1px', background:'#f1f5f9' }} />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {dayJobs.map((job) => {
              const sc = STATUS_COLOR[job.status] ?? '#94a3b8';
              const pct = job.total_brands ? Math.round((job.processed_brands / job.total_brands) * 100) : 0;
              const time = new Date(job.created_at).toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' });
              const isSelected = selectedIds.has(job.id);
              const isDeleting = deletingIds.has(job.id);

              return (
                <div key={job.id} style={{ background: isSelected ? '#f0f7ff' : '#fff', borderRadius:'10px', border: isSelected ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.06)', padding:'0.85rem 1.25rem', display:'flex', alignItems:'center', gap:'0.75rem', opacity: isDeleting ? 0.4 : 1, transition:'all 0.15s' }}>

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(job.id)}
                    style={{ cursor:'pointer', width:'13px', height:'13px', accentColor:'#2563eb', flexShrink:0 }}
                  />

                  {/* Time */}
                  <div style={{ minWidth:'44px', fontSize:'0.7rem', color:'#4a6080', flexShrink:0 }}>{time}</div>

                  {/* Status dot */}
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:sc, flexShrink:0 }} />

                  {/* Job type icon */}
                  <span title={job.job_type === 'keepa' ? 'Keepa Analizi' : 'Marka Araması'} style={{ fontSize:'0.85rem', flexShrink:0 }}>
                    {job.job_type === 'keepa' ? '📊' : '🏷️'}
                  </span>

                  {/* File info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.83rem', color:'#e8f0fe', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {job.file_name}
                    </div>
                    {job.status === 'completed' && (
                      <div style={{ fontSize:'0.68rem', color:'#4a6080', marginTop:'0.1rem' }}>
                        {job.processed_brands} marka zenginleştirildi
                      </div>
                    )}
                    {job.status === 'failed' && (
                      <div style={{ fontSize:'0.68rem', color:'#ef4444', marginTop:'0.1rem' }}>
                        {job.error_message || 'İşlem başarısız'}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {job.status === 'processing' && (
                    <div style={{ minWidth:'80px', flexShrink:0 }}>
                      <div style={{ height:'4px', background:'#e2e8f0', borderRadius:'999px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:sc, borderRadius:'999px', transition:'width 0.4s' }} />
                      </div>
                      <div style={{ fontSize:'0.62rem', color:'#4a6080', marginTop:'0.2rem', textAlign:'right' }}>{pct}%</div>
                    </div>
                  )}

                  {/* Status badge */}
                  <span style={{ display:'inline-block', padding:'0.18rem 0.55rem', borderRadius:'999px', background:`${sc}18`, color:sc, fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
                    {job.status}
                  </span>

                  {/* Downloads */}
                  {job.status === 'completed' && (
                    <div style={{ display:'flex', gap:'0.3rem', flexShrink:0 }}>
                      {job.result_csv && (
                        <a href={`/api/download/${job.id}?format=csv`} style={{ padding:'0.22rem 0.5rem', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px', color:'#475569', fontSize:'0.65rem', fontWeight:500, textDecoration:'none' }}>CSV</a>
                      )}
                      {job.result_xlsx && (
                        <a href={`/api/download/${job.id}?format=xlsx`} style={{ padding:'0.22rem 0.5rem', border:'1px solid #2563eb', borderRadius:'6px', background:'#2563eb', color:'#fff', fontSize:'0.65rem', fontWeight:500, textDecoration:'none' }}>Excel</a>
                      )}
                    </div>
                  )}

                  {/* View */}
                  <Link
                    href={job.job_type === 'keepa' ? '/dashboard' : `/dashboard/leads?job=${job.id}`}
                    style={{ color:'#3b82f6', fontSize:'0.7rem', textDecoration:'none', flexShrink:0, fontWeight:500 }}
                  >
                    Görüntüle →
                  </Link>

                  {/* Aksiyon butonları: Re-run / Report / Delete */}
                  <div style={{ display:'flex', gap:'0.25rem', flexShrink:0 }}>
                    {/* 🔄 Re-run — failed/timeout aramaları sıfırdan tekrar kuyruğa atar */}
                    {(job.status === 'failed' || job.status === 'completed') && (
                      <button
                        onClick={() => window.location.href='/dashboard'}
                        title="Tekrar Tara (Re-run)"
                        style={{ background:'none', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', padding:'0.25rem 0.4rem', color:'#5a7090', display:'inline-flex', alignItems:'center', gap:'0.2rem', borderRadius:'6px', fontSize:'0.6rem', fontWeight:600, transition:'all 0.12s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#2563eb'; e.currentTarget.style.borderColor='#bfdbfe'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='#e2e8f0'; }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                        Tekrar
                      </button>
                    )}
                    {/* ⚠️ Bildir — marka mutlaka var ama bot bulamadı */}
                    <button
                      onClick={() => alert(`"${job.file_name}" araması bildirildi. Ekibimiz en kısa sürede inceleyecektir.`)}
                      title="Sorun Bildir (Report Issue)"
                      style={{ background:'none', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', padding:'0.25rem 0.4rem', color:'#5a7090', display:'inline-flex', alignItems:'center', gap:'0.2rem', borderRadius:'6px', fontSize:'0.6rem', fontWeight:600, transition:'all 0.12s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#fffbeb'; e.currentTarget.style.color='#d97706'; e.currentTarget.style.borderColor='#fde68a'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='#64748b'; e.currentTarget.style.borderColor='#e2e8f0'; }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      Bildir
                    </button>
                    {/* 🗑️ Sil — mevcut fonksiyon korundu */}
                    <button
                      onClick={() => deleteSingle(job.id)}
                      disabled={isDeleting}
                      title="Sil (Delete)"
                      style={{ background:'none', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', padding:'0.25rem 0.4rem', color:'#4a6080', display:'inline-flex', alignItems:'center', borderRadius:'6px', transition:'all 0.12s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='#fecaca'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='none'; e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.borderColor='#e2e8f0'; }}
                    >
                      <IcTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
