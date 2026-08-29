-- 본인 프로필(이름) 수정 허용 + 권한(role) 셀프 변경 차단
-- Supabase SQL Editor에서 이 파일만 한 번 실행하세요.

grant update (name) on public.profiles to authenticated;

create policy "users update own profile" on public.profiles
for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

-- 본인 행 수정이 열리면서 role 컬럼까지 바꿀 수 있게 되는 것을 차단
create or replace function public.enforce_role_change_by_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception '회원 권한은 관리자만 변경할 수 있습니다.';
  end if;
  return new;
end;
$$;

create trigger enforce_role_change_by_admin before update on public.profiles
for each row execute procedure public.enforce_role_change_by_admin();
