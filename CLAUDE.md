# WholesaleScout — CLAUDE.md (Proje Anayasası)
> Tek Doğru Kaynak. Tüm kararlar burada yaşar.
> Güncelleme tarihi: 2026-03-08

---

## 0. PROJE KİMLİĞİ

| Alan | Değer |
|------|-------|
| **Ad** | WholesaleScout |
| **Amaç** | CSV/Excel marka listesini ve Keepa verilerini analiz eden B2B SaaS (Amazon wholesale) |
| **Hedef Kullanıcı** | Amazon satıcıları, marka iş birliği ajansları, B2B satış temsilcileri |
| **Başarı Kriteri** | Yüklenen marka → web sitesi + iş emaili + iletişim formu (email yoksa) + sosyal + LinkedIn |
| **Backend Klasörü** | `c:\Users\tunah\OneDrive\Desktop\brand-outreach-tool\` |
| **Frontend Klasörü** | `c:\Users\tunah\OneDrive\Desktop\wholesalescout-web\` |

---

## 1. ANAYASA (DEĞİŞMEZ KURALLAR)

1. **Single Source of Truth:** Tüm kararlar bu dosyada yaşar.
2. **Approval Loop:** Plan → Tavsiye → Onay → Uygula → Test.
3. **No Patch Stacking:** Yeni filtre ile eski filtreyi yamama. Kök sebebi bul.
4. **Fake Data Yasak:** `wholesale@domain.com` gibi uydurma email üretme. Yoksa null bırak.
5. **Secrets:** API key'ler `.env` dosyasında. Hard-code yasak.
6. **Test:** Her değişiklik sonrası `npx tsc --noEmit` ve manuel pipeline testi.
7. **Tailwind CSS:** Yeni bileşenler inline `style={}` değil Tailwind class ile yazılır.
8. **Bileşen Ayrımı:** Yeni UI parçaları `app/dashboard/_components/` altına ayrı dosya olarak yazılır.

---

## 2. MİMARİ

```
[Kullanıcı]
    ↓ CSV/Excel yükle veya marka adı yapıştır
[Next.js Frontend — Vercel port 3002]
    ↓ Supabase'e job kaydeder
    ↓ Worker'a HTTP POST (fire-forget)
[FastAPI Worker — Railway port 8000]
    ↓ Supabase polling ile izler, job alır
    ↓ 11 aşamalı pipeline çalıştırır
    ↓ Sonuçları anlık Supabase brands tablosuna yazar
[Supabase PostgreSQL]
    ↓ Frontend 10 saniyede bir polling yapar, dashboard'da gösterir
```

| Katman | Teknoloji | Deployment | Port |
|--------|-----------|------------|------|
| Frontend | Next.js 15 + React 19 + Tailwind CSS v4 | Vercel | 3002 |
| Worker | FastAPI (Python) | Railway.app | 8000 |
| DB/Auth | Supabase (PostgreSQL + RLS) | Supabase cloud | — |
| Dosya Upload | Supabase Storage → lokal PIPELINE_DIR | — | — |

---

## 3. FRONTEND DOSYA YAPISI

```
wholesalescout-web/
├── app/
│   ├── page.tsx                    # Landing page (hero, features, pricing)
│   ├── layout.tsx                  # Root layout (metadata)
│   ├── auth/
│   │   ├── callback/route.ts       # OAuth callback
│   │   ├── login/page.tsx          # Email/pass + Google OAuth
│   │   └── signup/page.tsx         # Kayıt + email onay
│   ├── api/
│   │   ├── brands/route.ts         # GET tüm markalar (max 200)
│   │   ├── brands/[id]/route.ts    # PATCH status | DELETE
│   │   ├── jobs/route.ts           # GET/POST jobs + CSV dispatch
│   │   ├── jobs/[id]/route.ts      # DELETE job + cascade
│   │   ├── jobs/[id]/brands/route.ts # GET job'a ait markalar
│   │   ├── keepa/route.ts          # GET/POST Keepa products
│   │   ├── credits/route.ts        # GET balance + transactions
│   │   └── download/[id]/route.ts  # CSV/Excel indirme
│   └── dashboard/
│       ├── page.tsx                # ⚠️ ANA SAYFA — 30.000 satır, modülarize edilmeli
│       ├── layout.tsx              # Sidebar + auth check
│       ├── leads/page.tsx          # Flat tablo (tüm lead'ler)
│       ├── history/page.tsx        # Tarih gruplu geçmiş
│       ├── credits/page.tsx        # Kredi + plan yükseltme
│       ├── settings/page.tsx       # ⚠️ Profil UI — Save API YOK
│       ├── affiliate/page.tsx      # ⚠️ Referral — Mock data (API yok)
│       └── _components/
│           ├── map-view.tsx        # Leaflet OSM harita
│           └── sidebar-nav.tsx     # Navigasyon menüsü
├── lib/
│   ├── supabase.ts                 # Browser client (createBrowserClient)
│   └── supabase-server.ts          # Server/API client + admin client
├── middleware.ts                   # Auth middleware
├── next.config.ts                  # Security headers
└── package.json
```

---

## 4. FRONTEND SAYFALAR (Detay)

### `/dashboard` — Ana Sayfa
**Dosya:** `app/dashboard/page.tsx` (⚠️ ~30.000 satır — bölünmeli)

**Sol Panel (260px):**
- Paste textarea (5 satır, marka adları gir)
- Upload dropzone (CSV/Excel sürükle-bırak)
- "Enrich" butonu
- Processing banner (progress bar + brand sayacı)

**Harita (Leaflet):**
- OSM tiles, location-based marker'lar
- Brand filtreyle ilişkili — marker tıklayınca inspector açılır
- `guessCoords()` — 50+ şehir hardcoded koordinat map

**Metric Cards (5 kolon):**
- Toplam Arama | Email Bulundu | Email Yok | Domain Doğrulama | Ulaşılamaz

**Brand Tablosu:**
- Sayfalama: 50/sayfa
- Kolonlar: Brand name, Domain, Email (tıkla=kopyala), Contact, Title, Konum, Confidence, Status, Sosyal, Actions
- Per-row: G (Google), A (Amazon), email/FORM butonu, status dropdown, delete

**Inspector Panel:**
- Sağda açılır, tüm detayları gösterir
- Durum | İletişim | Marka Bilgisi | Dağıtım | Sosyal | Şirket | Güven Skoru

**⚠️ EKSİK: Keepa Tab Toggle**
- Belgelerde var, kod'da YOK — eklenmeli (bkz. Bölüm 10)

**State'ler:**
```typescript
jobs: Job[]              // 10s polling
brands: Brand[]          // max 200, initial load
uploading: boolean
dragOver: boolean
error: string | null
pastedBrands: string
search: string
filterStatus: string
filterCategory: string
brandPage: number        // sayfalama
inspectedBrand: Brand | null
copiedEmail: string | null
showMap: boolean
workerOffline: boolean
```

### `/dashboard/leads` — My Leads
- Tüm lead'ler flat tablo
- Multi-select checkbox + bulk delete
- Per-brand status güncelleme

### `/dashboard/history` — Geçmiş
- Job'lar tarih gruplu timeline
- Bulk job silme

### `/dashboard/credits` — Krediler
- Kredi bakiyesi + plan limiti
- Plan yükseltme (Stripe checkout)
- Transaction history

### `/dashboard/settings` — Ayarlar
- ⚠️ **Sadece UI** — `POST /api/settings` endpoint'i YOK

### `/dashboard/affiliate` — Affiliate
- ⚠️ **Mock data** — Backend API yok

---

## 5. API ROUTE'LAR (Detay)

| Route | Method | İşlem |
|-------|--------|-------|
| `/api/brands` | GET | Kullanıcının tüm markalarını döner (max 200) |
| `/api/brands/[id]` | PATCH | `lead_status` güncelle |
| `/api/brands/[id]` | DELETE | Marka sil (RLS: user_id) |
| `/api/jobs` | GET | Kullanıcının tüm job'larını (max 50) |
| `/api/jobs` | POST | CSV yükle → Supabase job → Worker dispatch |
| `/api/jobs/[id]` | DELETE | Job + cascade brands sil |
| `/api/jobs/[id]/brands` | GET | Job'a ait markalar |
| `/api/keepa` | GET | Keepa products (job_id + kategori filtresi) |
| `/api/keepa` | POST | Keepa CSV yükle → async worker |
| `/api/credits` | GET | Bakiye + transactions |
| `/api/download/[id]` | GET | CSV/Excel export |

**Worker Dispatch Adresi:**
```
WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL
           ?? 'http://127.0.0.1:8000'    # local
           # https://...railway.app       # prod
```

**Upload Klasörü:**
```
PIPELINE_DIR = process.env.PIPELINE_DIR
             ?? 'C:/Users/tunah/OneDrive/Desktop/brand-outreach-tool'
UPLOADS_DIR  = join(PIPELINE_DIR, 'uploads')
# Dosya: uploads/{job_id}.{ext}
```

---

## 6. VERİTABANI TABLOLARI

### `profiles`
```sql
id UUID PRIMARY KEY                  -- auth.users'a foreign key
brands_used INTEGER DEFAULT 0
brands_limit INTEGER DEFAULT 50
credits_balance INTEGER DEFAULT 0
plan TEXT DEFAULT 'free'             -- 'free','starter','pro','elite'
stripe_customer_id TEXT
stripe_subscription_id TEXT
```

### `enrichment_jobs`
```sql
id TEXT PRIMARY KEY
user_id UUID
job_type TEXT                        -- 'brand' | 'keepa'
status TEXT                          -- 'pending','running','completed','failed'
file_url TEXT
processed_brands INTEGER
total_brands INTEGER
error_message TEXT
result_csv TEXT
result_xlsx TEXT
created_at TIMESTAMPTZ
```

### `brands`
```sql
id UUID PRIMARY KEY
job_id TEXT
user_id UUID
-- Temel:
brand_name TEXT
official_domain TEXT
wholesale_email TEXT
email_source TEXT                    -- 'scraped','smtp_verified','hunter'
contact_form_url TEXT                -- Email yoksa form URL
-- Sosyal:
instagram_url TEXT
tiktok_url TEXT
linkedin_url TEXT
facebook_url TEXT
-- LinkedIn:
decision_maker_name TEXT
decision_maker_title TEXT
company_employee_count TEXT
-- Skorlar:
confidence_score INTEGER             -- 0-100
verification_score INTEGER           -- 0-100
security_score INTEGER               -- 0-100
outreach_score INTEGER               -- 0-100
qualification_score INTEGER          -- 0-100
-- Kalifikasyon:
qualification_status TEXT            -- 'qualified','marginal','inactive'
qualification_signals TEXT
-- Outreach:
outreach_approach TEXT
outreach_recommendation TEXT
outreach_email_template TEXT
-- Doğrulama:
brand_type TEXT                      -- 'brand','distributor','retailer'
ecommerce_platform TEXT              -- 'Shopify','WooCommerce','Magento','BigCommerce'
trustpilot_rating NUMERIC
trustpilot_reviews INTEGER
has_wholesale_page BOOLEAN
wholesale_page_url TEXT
contact_form_url TEXT
distribution_channels TEXT
physical_address TEXT
ssl_valid BOOLEAN
domain_age_days INTEGER
-- Dağıtım:
distributor TEXT
distribution_type TEXT               -- 'direct','marketplace','mixed'
known_distributors TEXT
fraud_risk TEXT
fraud_flags TEXT
faire_url TEXT
-- Keepa:
keepa_score NUMERIC
keepa_asin TEXT
keepa_amazon_url TEXT
keepa_offer_count INTEGER
-- Diğer:
location TEXT
phone TEXT
company_bio TEXT
status TEXT
lead_status TEXT
created_at TIMESTAMPTZ
```

### `keepa_products`
```sql
id UUID PRIMARY KEY
job_id TEXT
user_id UUID
asin TEXT
title TEXT
brand TEXT
amazon_url TEXT
buybox_price NUMERIC
bsr_current INTEGER
bsr_90d_avg NUMERIC
amazon_bb_pct NUMERIC
bb_winner_count INTEGER
offer_count INTEGER
bought_past_month INTEGER
rating NUMERIC
review_count INTEGER
oos_90d NUMERIC
wholesale_score NUMERIC
kategori TEXT                        -- 'WHOLESALE_UYGUN','TEKRAR_KONTROL','ELENDI'
eleme_nedeni TEXT
strateji_etiketleri TEXT
created_at TIMESTAMPTZ
```

### SQL Migration (Henüz Yapılmadıysa)
```sql
-- Supabase Dashboard > SQL Editor
ALTER TABLE brands ADD COLUMN IF NOT EXISTS contact_form_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS keepa_score NUMERIC;
```

---

## 7. BACKEND DOSYALAR (FastAPI Worker)

```
brand-outreach-tool/
├── worker.py              # 661 satır — Ana FastAPI orchestrator
├── search_engine.py       # 562 satır — Domain bulma (4 tier)
├── site_scraper.py        # 1017 satır — Web scraping (BS4 + Playwright)
├── contact_finder.py      # 282 satır — Email bulma (SMTP + Hunter)
├── social_resolver.py     # 225 satır — Instagram/TikTok (slug + Brave)
├── linkedin_search.py     # 350 satır — LinkedIn karar verici bulma
├── brand_qualifier.py     # 461 satır — Stage 0 pre-filter + outreach score
├── brand_verifier.py      # 461 satır — Platform + Trustpilot + kanallar
├── distributor_finder.py  # 328 satır — Dağıtım tipi + fraud risk
├── security_auditor.py    # 123 satır — SSL + domain yaşı + WHOIS
├── data_cleaner.py        # 167 satır — Deduplicate + confidence score
├── keepa_analyzer.py      # 485 satır — Keepa 28 kolon analiz (0-100 skor)
├── file_parser.py         # 189 satır — CSV/Excel parse
├── report_generator.py    # 179 satır — CSV/XLSX rapor üretimi
└── main.py                # 239 satır — Standalone CLI orchestrator
```

---

## 8. PIPELINE (11 AŞAMA — FastAPI Worker)

```
POST /enrich → iş başlar (fire-forget, async)
```

| # | Aşama | Dosya | Fonksiyon | Supabase |
|---|-------|-------|-----------|---------|
| 0 | Brand Qualifier ön-filtre | brand_qualifier.py | `qualify_batch()` | PATCH enrichment_jobs |
| 1 | CSV/Excel Parse | file_parser.py | `parse_file()` | — |
| 2 | Domain Bulma | search_engine.py | `_find_domain()` | — |
| 3 | Site Scraping | site_scraper.py | `scrape_brand()` | — |
| 4 | Contact Finder | contact_finder.py | `_enrich_contact()` | INSERT brands |
| 5 | Social Resolver | social_resolver.py | `resolve_social()` | PATCH brands |
| 6 | LinkedIn Search | linkedin_search.py | `search_linkedin()` | — (dahil INSERT'te) |
| 7 | Data Cleaner | data_cleaner.py | `clean_data()` | PATCH brands (confidence) |
| 8 | Brand Verifier | brand_verifier.py | `verify_brand()` | PATCH brands (platform, trustpilot) |
| 8b | Distributor Finder | distributor_finder.py | `analyze_distributor()` | PATCH brands (fraud_risk) |
| 9 | Security Auditor | security_auditor.py | `audit_security()` | PATCH brands (ssl, domain_age) |
| 10 | Report Generator | report_generator.py | `generate_report()` | PATCH enrichment_jobs (completed) |

**Pipeline Özellikleri:**
- **Paralel:** Stage 2-4+6 → `ThreadPoolExecutor(max_workers=4)` per brand
- **Real-time:** Her brand INSERT tamamlanınca frontend polling yakalar
- **LinkedIn Dedup:** 3+ markada aynı isim → NULL (generic sonuçları temizle)
- **Qualification Tier:** QUALIFIED=full / MARGINAL=lite (LinkedIn+Hunter atlanır) / INACTIVE=skip

---

## 9. BACKEND FONKSİYON REHBERİ

### search_engine.py — Domain Bulma

```python
_find_domain(brand_name) → str | None
# Tier 1: DNS guess + HTTP verify (ücretsiz)
# Tier 2: Brave Search API (2000/ay ücretsiz)
# Tier 2b: Serper.dev (SERPER_API_KEY varsa)
# Tier 3: DuckDuckGo HTML scraping (ücretsiz, rate-limited)
# Tier 4: SerpAPI (SERP_API_KEY varsa)

_brand_to_slug(brand_name) → set[str]
# 6 varyant: full, stripped(inc/co/ltd), hyphen, first-word, +s, acronym

_is_valid_domain(domain, brand_name) → bool
# Segment-level match (Apple → littleappletreats.com REDDEDİLİR)

_domain_quality_score(domain, brand_name) → int
# .com=+15, .net/.org=+8, .ca/.us=+5, exact match=+20 bonus

_best_domain_from_urls(urls, brand_name) → str | None
# Adaylar arasından en yüksek skorlu domain

CANDIDATE_TLDS = ['.com', '.net', '.org', '.us', '.ca', '.co',
                  '.store', '.shop', '.io', '.co.uk', '.com.au']
```

### contact_finder.py — Email Bulma

```python
_enrich_contact(brand_name, domain, scraped_data) → dict
# Tier 1: site_scraper'dan zaten çekilmiş
# Tier 2: SMTP RCPT TO — ⚠️ Railway'de port 25 bloke, şimdilik atlanıyor
# Tier 3: Hunter.io domain search (HUNTER_API_KEY varsa)
# Tier 4: Pattern email — KALDIRILDI, artık null bırakılıyor

_find_contact_form_url(domain) → str | None
# /contact, /contact-us, /pages/contact, /wholesale, /b2b
# <form> + ≥2 input varsa URL döner
```

### site_scraper.py — Web Scraping

```python
scrape_brand(domain) → dict
# Çekilen veriler:
# - email (öncelik: wholesale > trade > b2b > sales > info)
# - phone
# - instagram_url, tiktok_url, linkedin_url, facebook_url
# - company_bio (meta description / og:description)
# - physical_address
# - has_wholesale_page (boolean)
# - wholesale_page_url
# - contact_form_url

# Tarama sırası:
# Tier 1: requests + BeautifulSoup (hızlı)
# Tier 2: Playwright headless (JS-heavy siteler, 5s timeout)
```

### brand_qualifier.py — Ön Eleme

```python
qualify_brand(brand_name) → dict
# Sonuç: qualification_status, qualification_score, qualification_signals
# QUALIFIED (≥50): Full pipeline
# MARGINAL (20-49): Lite pipeline (LinkedIn+Hunter atlanır)
# INACTIVE (<20): Skip (Supabase'e status='Risk' yazılır)

generate_outreach_email(brand, seller_name, seller_company) → str
# Dinamik email şablonu:
# - Karar verici adı varsa kişiselleştirilmiş selamlama
# - Faire/wholesale page/direct tespitine göre yaklaşım

_calc_outreach_score(brand) → 0-100
# +40 direkt email | +30 Faire | +25 wholesale page
# +15 decision maker | +8 LinkedIn | +15 direct dist | +5 Instagram
```

### keepa_analyzer.py — Keepa Analiz

```python
run_pipeline(file_path) → (products: list[dict], summary: dict)
# 6 aşama: load → hard_filter → score → tag_strategies → classify → to_records

# Kategoriler:
# WHOLESALE_UYGUN: skor ≥65
# TEKRAR_KONTROL: skor 40-64
# ELENDI: skor <40 veya hard filter

# 8 Strateji Etiketi:
# bestseller, rising, price_dip, low_competition
# brand_safe, gift_seasonal, stable_buybox, margin_focus
```

---

## 10. EKSİK VE TAMAMLANMASI GEREKEN ALANLAR

### 🔴 KRİTİK — Hemen Yapılacak

| # | Görev | Dosya | Durum |
|---|-------|-------|-------|
| 1 | SQL Migration: contact_form_url + keepa_score | Supabase SQL Editor | ⏳ |
| 2 | Keepa Tab Toggle (dashboard'a eklenmeli) | app/dashboard/page.tsx | ❌ |
| 3 | Keepa Tablosu (ASIN/Marka/Fiyat/BSR/BB%/Skor) | app/dashboard/page.tsx | ❌ |

**Keepa Tab Toggle — Ne Olmalı:**
```
[Marka Aramaları | Keepa Analizi]    ← Tab toggle
Tab 1: Metric cards + brands tablosu (mevcut)
Tab 2: Keepa tablosu — kolonlar:
  ASIN | Marka | Fiyat | BSR | BB% | Satıcı | Satın/ay | Skor | Kategori | Strateji | Butonlar (A/A↗/🔍/📋)
```

**Keepa Tab Butonları:**
- `A` → Amazon URL aç
- `A↗` → Amazon Sellers Page
- `🔍` → Keepa product sayfası
- `📋` → ASIN kopyala

### 🟡 YÜKSEK — Bu Hafta

| # | Görev | Dosya | Durum |
|---|-------|-------|-------|
| 4 | page.tsx bileşen bölme (30KB → parçalar) | app/dashboard/_components/ | ⏳ |
| 5 | Settings API endpoint | app/api/settings/route.ts | ❌ |
| 6 | Contact form URL testi | Pipeline + frontend | ⏳ Test edilmeli |
| 7 | SMTP doğrulama (Railway port 25 bloke) | contact_finder.py | ⚠️ Atlanıyor |

**page.tsx Bölme Planı:**
```
app/dashboard/_components/
├── BrandsTable.tsx      # Marka tablosu (sayfalama + filtreler + row actions)
├── KeepaTable.tsx       # Keepa ürün tablosu (ASIN, skor, kategori)
├── MetricCards.tsx      # 5'li metrik kartlar
├── LeftPanel.tsx        # Paste + upload + progress banner
├── InspectorPanel.tsx   # Sağ detay paneli
└── StatusDropdown.tsx   # Per-row lead status dropdown
```

### 🟢 ORTA — Gelecek Sprint

| # | Görev | Not |
|---|-------|-----|
| 8 | Affiliate backend | Referral kodları + komisyon takibi |
| 9 | Worker offline banner | Health check + kullanıcı bildirimi |
| 10 | Tailwind geçişi | Inline `style={}` → Tailwind class (yeni bileşenlerde zorunlu) |
| 11 | Stripe entegrasyonu tamamlama | credits/page.tsx checkout flow |

### ⚪ DÜŞÜK — Zamanla

| # | Görev |
|---|-------|
| 12 | Map height fix (420px sabit) |
| 13 | WebSocket ile real-time güncelleme (polling → WS) |
| 14 | Rate limiting (API route'larda) |

---

## 11. ENVIRONMENT VARIABLES

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xinhfgvhmyrtlnayockk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_WORKER_URL=http://127.0.0.1:8000   # local | https://...railway.app (prod)
PIPELINE_DIR=C:/Users/tunah/OneDrive/Desktop/brand-outreach-tool
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Worker (.env)
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
BRAVE_SEARCH_API_KEY=...          # domain arama + sosyal medya (AKTİF)
SERPER_API_KEY=...                # Opsiyonel (Google sonuçları, Tier 2b)
SERP_API_KEY=...                  # Opsiyonel (SerpAPI, Tier 4)
HUNTER_API_KEY=...                # Opsiyonel (email doğrulama)
```

---

## 12. GELİŞTİRME AKIŞI

```bash
# Frontend başlatma
cd c:\Users\tunah\OneDrive\Desktop\wholesalescout-web
npm run dev   # http://localhost:3002

# Worker başlatma
cd c:\Users\tunah\OneDrive\Desktop\brand-outreach-tool
uvicorn worker:app --reload --port 8000

# TypeScript kontrol
cd wholesalescout-web
npx tsc --noEmit

# Build kontrol
npx next build
```

---

## 13. KRİTİK DOSYA YOLLARİ

| Bileşen | Dosya |
|---------|-------|
| Ana dashboard | `app/dashboard/page.tsx` |
| Sidebar nav | `app/dashboard/_components/sidebar-nav.tsx` |
| Leaflet harita | `app/dashboard/_components/map-view.tsx` |
| Job API | `app/api/jobs/route.ts` |
| Brand API | `app/api/brands/route.ts` |
| Keepa API | `app/api/keepa/route.ts` |
| Download API | `app/api/download/[id]/route.ts` |
| Supabase server | `lib/supabase-server.ts` |
| Worker ana | `../brand-outreach-tool/worker.py` |
| Domain bulma | `../brand-outreach-tool/search_engine.py` |
| Scraping | `../brand-outreach-tool/site_scraper.py` |
| Email bulma | `../brand-outreach-tool/contact_finder.py` |
| Keepa analiz | `../brand-outreach-tool/keepa_analyzer.py` |
| Brand qualifier | `../brand-outreach-tool/brand_qualifier.py` |

---

## 14. BİLİNEN ÇÖZÜLMÜŞ SORUNLAR

| Sorun | Çözüm | Tarih |
|-------|-------|-------|
| Fake email üretiliyordu | contact_finder.py pattern email kaldırıldı | — |
| Apple → littleappletreats.com (yanlış domain) | search_engine.py segment eşleşme | 2026-03-07 |
| MOTOPOWER domain bulunamıyordu | +s slug varyantı eklendi | 2026-03-07 |
| EA için ea.com bulunamıyordu | Akronim desteği eklendi | 2026-03-07 |
| schultz.com.au yerine schultz.com | Kalite skor sistemi | 2026-03-07 |
| Keepa CA marketplace NaN hataları | keepa_analyzer.py NaN fix | 2026-03-07 |
| Email yokken form linki gösterilmiyordu | FORM butonu eklendi | 2026-03-07 |
| Polling çok sık (3s/5s) | 8s/10s olarak optimize edildi | — |
| Sayfalama yoktu | 50/sayfa eklendi | — |

---

## 15. BİLİNEN AÇIK SORUNLAR

| Sorun | Durum | Çözüm |
|-------|-------|-------|
| SMTP doğrulama (port 25) | ⚠️ Railway bloke | Alternatif: Hunter.io veya dışarıda SMTP sunucu |
| page.tsx 30.000 satır | ⚠️ Çok büyük | Bileşenlere bölünmeli |
| Keepa tab dashboard'da yok | ❌ Eksik | Görev #2-3 |
| Settings kayıt API'si yok | ❌ Eksik | Görev #5 |
| Affiliate backend yok | ❌ Eksik | Görev #8 |
| Tailwind kullanılmıyor | ⚠️ Inline style | Yeni kodda Tailwind zorunlu |

---

## 16. KULLANICI BİLGİSİ

- **metintomar2@gmail.com** → sınırsız üyelik (brands_limit=999999, plan='elite')

---

## 17. CHANGELOG

| Tarih | Değişiklik |
|-------|------------|
| 2026-03-07 | İlk CLAUDE.md oluşturuldu |
| 2026-03-07 | search_engine.py domain bulma güçlendirildi |
| 2026-03-07 | contact_form_url özelliği eklendi |
| 2026-03-07 | keepa_analyzer.py NaN/CA marketplace fix |
| 2026-03-08 | CLAUDE.md kapsamlı güncelleme (tüm dosyalar + fonksiyonlar) |
