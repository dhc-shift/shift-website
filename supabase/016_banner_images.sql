-- 배너 이미지 첨부 (posters 버킷 재사용)
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.banners add column if not exists image_path text not null default '';

notify pgrst, 'reload schema';
