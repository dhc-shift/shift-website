-- 활동 홍보 포스터 이미지
-- 010 실행 후 Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.activities add column if not exists poster_path text not null default '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 5242880, '{image/png,image/jpeg,image/webp}')
on conflict (id) do nothing;

create policy "poster public read" on storage.objects for select to anon, authenticated
using (bucket_id = 'posters');
create policy "admins upload posters" on storage.objects for insert to authenticated
with check (bucket_id = 'posters' and public.is_admin());
create policy "admins update posters" on storage.objects for update to authenticated
using (bucket_id = 'posters' and public.is_admin());
create policy "admins delete posters" on storage.objects for delete to authenticated
using (bucket_id = 'posters' and public.is_admin());

notify pgrst, 'reload schema';
