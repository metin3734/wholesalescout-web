-- Migration: Add Keepa columns, job_type, and all missing extended brand columns
-- Run this in Supabase SQL Editor

-- ── brands tablosuna eksik sütunları ekle ────────────────────────────────────
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS facebook_url          text,
  ADD COLUMN IF NOT EXISTS phone                 text,
  ADD COLUMN IF NOT EXISTS company_bio           text,
  ADD COLUMN IF NOT EXISTS physical_address      text,
  ADD COLUMN IF NOT EXISTS brand_type            text,
  ADD COLUMN IF NOT EXISTS ecommerce_platform    text,
  ADD COLUMN IF NOT EXISTS trustpilot_rating     numeric(3,1),
  ADD COLUMN IF NOT EXISTS trustpilot_reviews    integer,
  ADD COLUMN IF NOT EXISTS distribution_channels text,
  ADD COLUMN IF NOT EXISTS has_wholesale_page    boolean default false,
  ADD COLUMN IF NOT EXISTS verification_score    integer default 0,
  ADD COLUMN IF NOT EXISTS faire_url             text,
  ADD COLUMN IF NOT EXISTS wholesale_page_url    text,
  ADD COLUMN IF NOT EXISTS distributor           text,
  ADD COLUMN IF NOT EXISTS distribution_type     text default 'unknown',
  ADD COLUMN IF NOT EXISTS known_distributors    text,
  ADD COLUMN IF NOT EXISTS fraud_risk            text default 'unknown',
  ADD COLUMN IF NOT EXISTS fraud_flags           text,
  ADD COLUMN IF NOT EXISTS qualification_status  text default 'qualified',
  ADD COLUMN IF NOT EXISTS qualification_score   integer default 0,
  ADD COLUMN IF NOT EXISTS qualification_signals text,
  ADD COLUMN IF NOT EXISTS outreach_score        integer default 0,
  ADD COLUMN IF NOT EXISTS outreach_approach     text,
  ADD COLUMN IF NOT EXISTS outreach_recommendation text,
  ADD COLUMN IF NOT EXISTS outreach_email_template text,
  ADD COLUMN IF NOT EXISTS contact_form_url      text,
  ADD COLUMN IF NOT EXISTS email_verification_status text,
  ADD COLUMN IF NOT EXISTS email_source          text,

  -- Keepa / Amazon sütunları (bu migration'ın asıl amacı)
  ADD COLUMN IF NOT EXISTS keepa_score           numeric(5,1),
  ADD COLUMN IF NOT EXISTS keepa_asin            text,
  ADD COLUMN IF NOT EXISTS keepa_amazon_url      text,
  ADD COLUMN IF NOT EXISTS keepa_offer_count     integer;

-- ── enrichment_jobs tablosuna job_type ekle ─────────────────────────────────
ALTER TABLE public.enrichment_jobs
  ADD COLUMN IF NOT EXISTS job_type text default 'brand'
    CHECK (job_type IN ('brand', 'keepa'));

-- ── keepa_products tablosu (yoksa oluştur) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.keepa_products (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references public.enrichment_jobs(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete cascade,
  asin            text,
  brand           text,
  title           text,
  amazon_url      text,
  bsr_current     integer,
  bsr_30          numeric(8,1),
  bsr_90          numeric(8,1),
  bsr_180         numeric(8,1),
  price           numeric(10,2),
  rating          numeric(3,1),
  review_count    integer,
  amazon_bb_pct   numeric(5,1),
  offer_count     integer,
  kategori        text,
  wholesale_skor  numeric(5,1),
  created_at      timestamptz default now()
);

ALTER TABLE public.keepa_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own keepa_products" ON public.keepa_products;
CREATE POLICY "Users can manage own keepa_products"
  ON public.keepa_products FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_keepa_products_job ON public.keepa_products(job_id);
CREATE INDEX IF NOT EXISTS idx_keepa_products_user ON public.keepa_products(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_keepa_asin ON public.brands(keepa_asin) WHERE keepa_asin IS NOT NULL;
