-- 공지사항을 로그인한 부원만 볼 수 있게 제한
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

drop policy "notices public read" on public.notices;
create policy "notices member read" on public.notices for select to authenticated using (true);
revoke select on public.notices from anon;

notify pgrst, 'reload schema';
