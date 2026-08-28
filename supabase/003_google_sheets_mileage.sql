-- Google Sheets 회원/마일리지 자동 동기화
-- 기존 001, 002 적용 후 Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

create table public.member_stats (
  student_id text primary key,
  name text not null,
  cohort text not null default '',
  email text not null unique,
  affiliation text not null default '',
  total_mileage integer not null default 0,
  current_tier text not null default '',
  current_rank integer,
  sync_token text,
  updated_at timestamptz not null default now()
);

create table public.mileage_items (
  activity_name text primary key,
  item_number text,
  category text not null default '',
  description text not null default '',
  base_score integer not null default 0,
  requires_manual_score boolean not null default false,
  notes text not null default '',
  sync_token text,
  updated_at timestamptz not null default now()
);

create table public.mileage_history (
  record_id text primary key,
  activity_date date not null,
  student_id text not null references public.member_stats(student_id) on delete cascade,
  member_name text not null,
  activity_name text not null,
  final_score integer not null,
  reason text not null default '',
  notes text not null default '',
  entered_by text not null default '',
  sync_token text,
  created_at timestamptz not null default now()
);

create table public.public_member_summary (
  id smallint primary key default 1 check (id = 1),
  member_count integer not null default 0,
  total_mileage integer not null default 0,
  average_mileage numeric(10,2) not null default 0,
  activity_count integer not null default 0,
  top_three jsonb not null default '[]'::jsonb,
  tier_counts jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.member_stats enable row level security;
alter table public.mileage_items enable row level security;
alter table public.mileage_history enable row level security;
alter table public.public_member_summary enable row level security;

create policy "members read own stats" on public.member_stats for select to authenticated
using (lower(email) = lower(auth.jwt()->>'email') or public.is_admin());
create policy "mileage items public read" on public.mileage_items for select to anon, authenticated using (true);
create policy "members read own history" on public.mileage_history for select to authenticated
using (
  public.is_admin() or exists (
    select 1 from public.member_stats m
    where m.student_id = mileage_history.student_id
      and lower(m.email) = lower(auth.jwt()->>'email')
  )
);
create policy "summary public read" on public.public_member_summary for select to anon, authenticated using (true);

grant select on public.mileage_items, public.public_member_summary to anon, authenticated;
grant select on public.member_stats, public.mileage_history to authenticated;
grant usage on schema public to service_role;
grant all privileges on public.member_stats, public.mileage_items, public.mileage_history, public.public_member_summary to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into public.public_member_summary (id) values (1) on conflict (id) do nothing;
