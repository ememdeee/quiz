-- Types, extensions and tables (handover 6.1 and 6.2).
-- Extensions live in the "extensions" schema, so the citext type is extensions.citext.

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.plan_t as enum ('free', 'custom');
create type public.role_t as enum ('user', 'admin');
create type public.account_status_t as enum ('active', 'suspended');
create type public.response_status_t as enum ('in_progress', 'finished');

-- New tables in "public" must not be open to the browser roles by default.
-- Access is granted table by table in the "rls" migration.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- One row per person. id = auth.users.id. Email lives in auth.users (never copied).
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '' check (char_length(name) <= 100),
  role          public.role_t not null default 'user',
  plan          public.plan_t not null default 'free',
  status        public.account_status_t not null default 'active',
  suspended_at  timestamptz,
  max_quizzes   int check (max_quizzes   > 0),   -- null = plan default
  max_pages     int check (max_pages     > 0),
  max_responses int check (max_responses > 0),
  brand_unlocked      boolean not null default false,  -- may change the 6 quiz colors
  can_hide_powered_by boolean not null default false,
  custom_domain text,                                  -- stored only, no routing in v1
  admin_notes   text,                                  -- admin-only
  created_at    timestamptz not null default now()
);

create table public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 100),
  slug          extensions.citext not null,
  draft         jsonb not null check (jsonb_typeof(draft) = 'object'),
  draft_version int   not null default 1,               -- +1 on every save (optimistic concurrency)
  published         jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_version int,                                 -- = draft_version at publish time
  published_at  timestamptz,
  accepting_responses boolean not null default true,     -- Open / Closed (separate from published)
  theme         jsonb,                                   -- 6 colors, null = defaults (needs profiles.brand_unlocked)
  hide_powered_by boolean not null default false,        -- needs profiles.can_hide_powered_by
  finished_count int not null default 0,                 -- kept by trigger on responses
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()       -- "Edited 2 days ago"
);
create unique index quizzes_slug_key on public.quizzes (slug);   -- citext => case-insensitive, GLOBAL
create index quizzes_owner_idx on public.quizzes (owner_id, updated_at desc);

create table public.responses (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  quiz_version  int  not null,                            -- published_version when started
  token_hash    text not null,                            -- sha256 of the secret token kept in the person's browser
  status        public.response_status_t not null default 'in_progress',
  answers       jsonb not null default '{}',
  pages_seen    text[] not null default '{}',
  last_page_id  text,
  started_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  finished_at   timestamptz
);
create index responses_quiz_started_idx on public.responses (quiz_id, started_at desc);
create index responses_quiz_status_idx  on public.responses (quiz_id, status, finished_at desc);

create table public.quiz_daily_stats (                    -- "People who opened it"
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  day     date not null,
  opened  int  not null default 0,
  primary key (quiz_id, day)
);

create table public.media (                                -- the "My pictures" library
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  path       text not null unique,                         -- storage path "<owner_id>/<id>.<ext>"
  file_name  text not null,
  mime       text not null check (mime in ('image/jpeg','image/png','image/webp')),
  size_bytes int  not null check (size_bytes <= 5242880),
  width int, height int,
  created_at timestamptz not null default now()
);
create index media_owner_idx on public.media (owner_id, created_at desc);

create table public.slug_holds (                           -- protects old links, see handover 6.9
  slug       extensions.citext primary key,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null
);

create table public.email_changes (                        -- our own email-change flow (cancel/resend)
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  new_email   extensions.citext not null,
  token_hash  text not null,
  expires_at  timestamptz not null,                        -- now() + 24 hours (set by server code)
  created_at  timestamptz not null default now(),
  confirmed_at timestamptz, cancelled_at timestamptz
);

create table public.login_attempts (                       -- "Too many tries" lock
  id bigserial primary key,
  email extensions.citext not null, ip_hash text not null,
  success boolean not null, created_at timestamptz not null default now()
);
create index login_attempts_email_idx on public.login_attempts (email, created_at desc);

create table public.rate_limits (                          -- generic counters (contact form, slug check, public quiz calls)
  key text not null, window_start timestamptz not null, hits int not null default 1,
  primary key (key, window_start)
);

create table public.contact_messages (                     -- copy of every contact form message (email may fail)
  id uuid primary key default gen_random_uuid(),
  name text not null, email extensions.citext not null, topic text not null, message text not null,
  ip_hash text, email_sent boolean not null default false, created_at timestamptz not null default now()
);

create table public.admin_log (                            -- every suspend / restore / delete / plan change
  id bigserial primary key,
  admin_id uuid not null, action text not null, target_user_id uuid, details jsonb,
  created_at timestamptz not null default now()
);
-- admin_log.admin_id / target_user_id are not foreign keys so the log survives deleting a person.
