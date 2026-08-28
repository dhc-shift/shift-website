-- 새 Supabase 프로젝트에서 setup.sql 실행 및 최초 회원가입을 마친 뒤 사용하세요.
-- 아래 이메일을 실제 최초 관리자 이메일로 바꾸고 SQL Editor에서 한 번만 실행합니다.

update public.profiles
set role = 'admin'
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com');

-- 관리자가 지정되었는지 확인합니다. 결과에 개인정보가 포함될 수 있으므로 공유하지 마세요.
select email, role from public.profiles where role = 'admin';
