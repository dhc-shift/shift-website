-- 회원가입을 부원 명단(member_stats)에 있는 이메일로 제한
-- 기존 001~005 적용 후 Supabase SQL Editor에서 이 파일만 한 번 실행하세요.
--
-- 동작:
--  - 가입하려는 이메일이 member_stats(구글시트 동기화 명단)에 없으면 가입 거부
--  - 단, member_stats가 완전히 비어 있으면(최초 세팅 단계) 가입 허용
--  - 시트에서 부원이 빠져도 기존 계정은 유지됨 (가입 시점에만 검사)

create or replace function public.enforce_member_signup()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (select 1 from public.member_stats) and not exists (
    select 1 from public.member_stats
    where lower(email) = lower(new.email)
  ) then
    raise exception 'SHIFT 부원 명단에 등록된 이메일만 가입할 수 있습니다. 운영진에게 문의해주세요.';
  end if;
  return new;
end;
$$;

create trigger enforce_member_signup_before_insert
before insert on auth.users
for each row execute procedure public.enforce_member_signup();
