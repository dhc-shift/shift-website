-- 활동 신청 방법 안내문 (구글폼 링크 없이 개인 연락 등으로 모집할 때)
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.activities add column if not exists apply_note text not null default '';

notify pgrst, 'reload schema';
