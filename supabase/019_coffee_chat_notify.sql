-- 커피챗 인원이 다 차면 관리자 계정 전원에게 메일 보내기
-- 018 적용 후 Supabase SQL Editor에서 이 파일만 한 번 실행하세요.
--
-- Resend API 키 저장 (SQL Editor에서 한 번, 이 저장소에는 절대 올리지 마세요):
--   select vault.create_secret('re_발급받은키', 'resend_api_key');
--
-- 키가 없거나 발송에 실패해도 신청은 정상 처리되고, 관리자 오늘 할 일에는 그대로 표시됩니다.

create extension if not exists pg_net;

create function public.notify_coffee_chat_full()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  api_key text;
  recipients text[];
  who text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  if api_key is null then
    return new;
  end if;
  select array_agg(email) into recipients from public.profiles where role = 'admin' and email is not null;
  if recipients is null then
    return new;
  end if;
  who := case when new.host_name <> '' then new.host_name || ' ' || new.host_kind else '아직 없음 (맞는 상대를 찾아주세요)' end;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'SHIFT 커피챗 <noreply@shiftysdh.com>',
      'to', to_jsonb(recipients),
      'subject', '[SHIFT 커피챗] ''' || new.title || ''' ' || new.seats || '명이 모였어요',
      'text', '신청 인원이 모두 찼습니다. 상대방에게 연락해 연결을 시작해주세요.' || chr(10) || chr(10)
        || '상대: ' || who || chr(10)
        || '신청자: ' || new.applicant_count || '명' || chr(10) || chr(10)
        || '관리 화면: https://shiftysdh.com/admin'
    )
  );
  return new;
exception when others then
  raise warning '커피챗 알림 메일 실패: %', sqlerrm;
  return new;
end;
$$;

create trigger coffee_chat_full_notify after update of status on public.coffee_chats
for each row when (old.status = '모집 중' and new.status = '모집 완료')
execute function public.notify_coffee_chat_full();
