-- Google Apps Script 동기화 계정 권한 보정
-- 003 실행 후 service_role permission denied 오류가 난 경우 이 파일만 실행하세요.

grant usage on schema public to service_role;
grant all privileges on public.member_stats to service_role;
grant all privileges on public.mileage_items to service_role;
grant all privileges on public.mileage_history to service_role;
grant all privileges on public.public_member_summary to service_role;
grant usage, select on all sequences in schema public to service_role;
