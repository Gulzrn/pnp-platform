-- ================================================
-- PNP PLATFORM - INITIAL SCHEMA MIGRATION
-- 001_initial_schema.sql
-- ================================================

-- ================================================
-- 1. PROFILES TABLE
-- ================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  province text,
  district text,
  preferred_language text not null default 'ur',
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Auto create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================
-- 2. COMPLAINTS TABLE
-- ================================================
create table public.complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  description_raw text,
  description_formal text,
  status text not null default 'open',
  district text,
  province text,
  lat float8,
  lng float8,
  department text,
  urgency text not null default 'medium',
  upvote_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ================================================
-- 3. JOBS TABLE
-- ================================================
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text,
  job_type text not null,
  description text,
  location text,
  district text,
  province text,
  salary_range text,
  deadline date,
  apply_link text,
  is_verified boolean not null default false,
  ai_scam_score float4 not null default 0,
  ai_scam_flags jsonb,
  posted_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ================================================
-- 4. CVS TABLE
-- ================================================
create table public.cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  file_url text,
  ai_score integer,
  ai_feedback text,
  ai_suggestions jsonb,
  updated_at timestamptz not null default now()
);

-- ================================================
-- 5. IDEAS TABLE
-- ================================================
create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text,
  province text,
  vote_count integer not null default 0,
  ai_quality_score float4,
  ai_clarity float4,
  ai_feasibility float4,
  ai_originality float4,
  ai_impact float4,
  ai_feedback text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ================================================
-- 6. IDEA VOTES TABLE
-- ================================================
create table public.idea_votes (
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

-- Auto update vote count when someone votes
create or replace function public.handle_idea_vote()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.ideas
    set vote_count = vote_count + 1
    where id = NEW.idea_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_idea_vote_created
  after insert on public.idea_votes
  for each row execute procedure public.handle_idea_vote();

-- ================================================
-- 7. CHAT SESSIONS TABLE
-- ================================================
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  messages jsonb not null default '[]',
  portal_context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ================================================
-- 8. CROP REPORTS TABLE
-- ================================================
create table public.crop_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  crop_type text not null,
  photo_url text not null,
  ai_disease text,
  ai_cause text,
  ai_treatment text,
  ai_prevention text,
  district text,
  province text,
  created_at timestamptz not null default now()
);

-- ================================================
-- 9. BLOOD DONORS TABLE
-- ================================================
create table public.blood_donors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  blood_group text not null,
  city text not null,
  district text,
  is_available boolean not null default true,
  last_donated date,
  contact_phone text,
  created_at timestamptz not null default now()
);

-- ================================================
-- 10. MANDI PRICES TABLE
-- ================================================
create table public.mandi_prices (
  id uuid default gen_random_uuid() primary key,
  crop text not null,
  price numeric not null,
  mandi_location text not null,
  district text,
  province text,
  recorded_at timestamptz not null default now()
);

-- ================================================
-- 11. LEGAL QUERIES TABLE
-- ================================================
create table public.legal_queries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  question text not null,
  topic text,
  created_at timestamptz not null default now()
);

-- ================================================
-- INDEXES (for fast queries)
-- ================================================
create index on public.complaints(user_id);
create index on public.complaints(district);
create index on public.complaints(status);
create index on public.jobs(job_type);
create index on public.jobs(is_verified);
create index on public.jobs(district);
create index on public.ideas(status);
create index on public.ideas(vote_count desc);
create index on public.chat_sessions(user_id);
create index on public.crop_reports(district);
create index on public.mandi_prices(crop);
create index on public.mandi_prices(district);
create index on public.blood_donors(blood_group);
create index on public.blood_donors(city);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.jobs enable row level security;
alter table public.cvs enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.crop_reports enable row level security;
alter table public.blood_donors enable row level security;
alter table public.mandi_prices enable row level security;
alter table public.legal_queries enable row level security;

-- PROFILES
create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- COMPLAINTS
create policy "public can view non hidden complaints"
  on public.complaints for select
  using (status != 'hidden');

create policy "users can insert own complaints"
  on public.complaints for insert
  with check (auth.uid() = user_id);

create policy "users can update own complaints"
  on public.complaints for update
  using (auth.uid() = user_id);

-- JOBS
create policy "public can view verified jobs"
  on public.jobs for select
  using (is_verified = true);

create policy "authenticated users can post jobs"
  on public.jobs for insert
  with check (auth.uid() = posted_by);

-- CVS
create policy "users can manage own cv"
  on public.cvs for all
  using (auth.uid() = user_id);

-- IDEAS
create policy "public can view approved ideas"
  on public.ideas for select
  using (status = 'approved');

create policy "users can insert own ideas"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "users can update own ideas"
  on public.ideas for update
  using (auth.uid() = user_id);

-- IDEA VOTES
create policy "anyone can view votes"
  on public.idea_votes for select
  using (true);

create policy "authenticated users can vote"
  on public.idea_votes for insert
  with check (auth.uid() = user_id);

-- CHAT SESSIONS
create policy "users can manage own chat sessions"
  on public.chat_sessions for all
  using (auth.uid() = user_id);

-- CROP REPORTS
create policy "users can manage own crop reports"
  on public.crop_reports for all
  using (auth.uid() = user_id);

-- BLOOD DONORS
create policy "authenticated users can view donors"
  on public.blood_donors for select
  using (auth.uid() is not null);

create policy "users can manage own donor record"
  on public.blood_donors for all
  using (auth.uid() = user_id);

-- MANDI PRICES
create policy "anyone can view mandi prices"
  on public.mandi_prices for select
  using (true);

-- LEGAL QUERIES
create policy "users can manage own queries"
  on public.legal_queries for all
  using (auth.uid() = user_id or auth.uid() is null);