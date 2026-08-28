# SHIFT Website

SHIFT 동아리 공식 웹사이트입니다. React, Vite, Supabase로 구성되어 있으며 Google Sheets의 회원·마일리지 데이터를 Apps Script로 Supabase에 동기화합니다.

## 다른 컴퓨터에서 시작하기

```bash
git clone https://github.com/dhc-shift/shift-website.git
cd shift-website
npm install
Copy-Item .env.example .env
npm run dev
```

macOS/Linux에서는 `Copy-Item .env.example .env` 대신 `cp .env.example .env`를 사용합니다.

`.env`에 연결할 Supabase 프로젝트의 공개 정보를 입력해야 합니다. 기존 SHIFT 운영 데이터를 함께 사용한다면 프로젝트 관리자로부터 아래 두 공개 값과 Supabase 접근 권한을 받으세요.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

`.env`는 Git에 올라가지 않습니다. `service_role` 키와 데이터베이스 비밀번호는 절대로 `.env`, 소스 코드, 메신저에 공유하지 마세요.

## 프로젝트 구성

- `src/`: React UI와 Supabase 연결 코드
- `public/`: 로고와 사이트 이미지
- `supabase/`: 데이터베이스 초기 설정 및 순차 마이그레이션 SQL
- `google-apps-script/`: Google Sheets → Supabase 동기화 코드

## 기존 SHIFT 프로젝트를 이어서 작업할 때

1. 저장소를 clone하고 `npm install`을 실행합니다.
2. `.env.example`을 `.env`로 복사합니다.
3. Supabase Dashboard의 Project URL과 Publishable key를 `.env`에 입력합니다.
4. `npm run dev`로 확인합니다.
5. 기존 운영 DB에는 아래 SQL을 다시 실행하지 않습니다.

Google Sheets 동기화 코드를 수정하려면 해당 시트의 Apps Script 프로젝트 편집 권한도 별도로 받아야 합니다. GitHub에 있는 `.gs` 파일은 원본/백업이며 자동으로 Google Apps Script에 배포되지는 않습니다.

## 새 Supabase 프로젝트를 만들 때

SQL Editor에서 다음 순서대로 한 번씩 실행합니다.

1. `supabase/setup.sql`
2. `supabase/002_board_features.sql`
3. `supabase/003_google_sheets_mileage.sql`
4. `supabase/004_google_sync_permissions.sql`
5. `supabase/005_calendar_date_range.sql`

그 후 첫 관리자 계정으로 회원가입하고, `supabase/promote-first-admin.example.sql`의 이메일을 실제 관리자 이메일로 바꿔 한 번 실행합니다.

Google Apps Script에서는 프로젝트 설정 → 스크립트 속성에 다음 값을 저장합니다.

- `SUPABASE_URL`: 새 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase의 비공개 service role 키

`google-apps-script/ShiftSupabaseSync.gs`를 시트의 Apps Script에 붙여 넣고 `syncAllToSupabase`, `installShiftSyncTrigger`를 순서대로 한 번 실행합니다.

## 협업 방식

작업 전 `git pull`, 작업 후 `git add`, `git commit`, `git push`를 사용합니다. 같은 파일을 동시에 크게 수정하지 않도록 작업 범위를 먼저 공유하는 것이 좋습니다.

```bash
git pull
git add .
git commit -m "변경 내용 요약"
git push
```

## 저장소에 포함하지 않는 것

- `.env`와 모든 비밀키
- Supabase 데이터베이스 비밀번호
- 실제 회원 명단과 마일리지 원본 데이터
- 개인 PC의 절대 경로 및 에디터 전용 설정
