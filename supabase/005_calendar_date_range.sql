-- 일정에 시작일~종료일 기간 기능 추가
-- 기존 SQL 적용 후 이 파일만 Supabase SQL Editor에서 한 번 실행하세요.

alter table public.calendar_events
add column end_date date;

update public.calendar_events
set end_date = event_date
where end_date is null;

alter table public.calendar_events
alter column end_date set not null;

alter table public.calendar_events
add constraint calendar_events_valid_date_range
check (end_date >= event_date);
