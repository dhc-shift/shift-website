-- 프로필 사진: avatars 버킷 + profiles.avatar_url
-- 008 실행 후 Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

alter table public.profiles add column avatar_url text;
grant update (avatar_url) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, '{image/png,image/jpeg,image/webp}')
on conflict (id) do nothing;

-- 누구나 볼 수 있고, 업로드/수정/삭제는 본인 폴더(자기 uid 경로)만 가능
create policy "avatar public read" on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');
create policy "own avatar upload" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own avatar update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own avatar delete" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
