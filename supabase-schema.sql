-- WholesaleScout Supabase Schema
-- Run this in Supabase SQL Editor after creating a new project

-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  subscription_status text default 'free'
    check (subscription_status in ('free', 'starter', 'pro', 'agency', 'cancelled')),
  brands_used   integer not null default 0,
  brands_limit  integer not null default 10,
  credits_balance integer not null default 0,
  stripe_customer_id text,
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── enrichment_jobs ───────────────────────────────────────────────────────────
create table if not exists public.enrichment_jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  file_name       text not null,
  status          text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  total_brands    integer not null default 0,
  processed_brands integer not null default 0,
  result_csv      text,   -- file path or storage URL
  result_xlsx     text,   -- file path or storage URL
  error_message   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.enrichment_jobs enable row level security;

drop policy if exists "Users can manage own jobs" on public.enrichment_jobs;
create policy "Users can manage own jobs"
  on public.enrichment_jobs for all using (auth.uid() = user_id);

drop index if exists idx_enrichment_jobs_user;

create index idx_enrichment_jobs_user on public.enrichment_jobs(user_id, created_at desc);


-- ── brands ────────────────────────────────────────────────────────────────────
create table if not exists public.brands (
  id                    uuid primary key default gen_random_uuid(),
  job_id                uuid not null references public.enrichment_jobs(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,
  brand_name            text not null,
  official_domain       text,
  wholesale_email       text,
  email_source          text,
  instagram_url         text,
  tiktok_url            text,
  linkedin_url          text,
  decision_maker_name   text,
  decision_maker_title  text,
  company_employee_count integer,
  location              text,
  confidence_score      integer default 0 check (confidence_score between 0 and 100),
  security_score        integer default 0 check (security_score between 0 and 100),
  ssl_valid             boolean default false,
  domain_age_days       integer default 0,
  lead_status           text default 'New' check (lead_status in ('New', 'Contacted', 'Risk')),
  gap_fill_info         jsonb,
  status                text default 'pending'
    check (status in ('pending', 'done', 'failed')),
  created_at            timestamptz default now()
);

alter table public.brands enable row level security;

drop policy if exists "Users can manage own brands" on public.brands;
create policy "Users can manage own brands"
  on public.brands for all using (auth.uid() = user_id);

drop index if exists idx_brands_job;
create index idx_brands_job on public.brands(job_id);


-- ── credit_transactions ───────────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     integer not null,   -- positive = credit, negative = debit
  reason     text,
  created_at timestamptz default now()
);

alter table public.credit_transactions enable row level security;

drop policy if exists "Users can read own transactions" on public.credit_transactions;
create policy "Users can read own transactions"
  on public.credit_transactions for select using (auth.uid() = user_id);
