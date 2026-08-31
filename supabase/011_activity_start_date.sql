-- 활동 시작일 추가 (D-Day 계산 기준)
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.activities add column start_date date;

notify pgrst, 'reload schema';
