-- 배너별 텍스트 가독성 배경 선택
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.banners
add column if not exists text_overlay boolean not null default false;

notify pgrst, 'reload schema';
