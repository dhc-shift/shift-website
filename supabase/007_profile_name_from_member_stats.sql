-- 프로필 생성 시 이름을 부원 명단(member_stats)에서 자동 조회
-- 가입 폼에 입력한 이름 > 시트의 실명 > 이메일 앞부분 순으로 사용합니다.
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      (select m.name from public.member_stats m where lower(m.email) = lower(new.email) limit 1),
      split_part(new.email, '@', 1)
    ),
    'member'::public.user_role
  );
  return new;
end;
$$;
