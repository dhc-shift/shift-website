# SHIFT Website

SHIFT 동아리 공식 웹사이트입니다. React, Vite, Supabase로 구성되어 있으며 Google Sheets의 회원·마일리지 데이터를 Apps Script로 동기화합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.example`을 복사해 `.env`를 만들고 Supabase 공개 연결 정보를 입력해야 합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

## 주요 폴더

- `src/`: React UI와 스타일
- `public/`: 웹사이트 이미지
- `supabase/`: 순서대로 실행하는 DB 마이그레이션 SQL
- `google-apps-script/`: Google Sheets → Supabase 동기화 코드

## Supabase 마이그레이션

새 Supabase 프로젝트에는 다음 파일을 번호 순서대로 한 번씩 실행합니다.

1. `supabase/setup.sql`
2. `supabase/002_board_features.sql`
3. `supabase/003_google_sheets_mileage.sql`
4. `supabase/004_google_sync_permissions.sql`
5. `supabase/005_calendar_date_range.sql`

이미 적용된 운영 프로젝트에서는 SQL을 다시 실행하지 않습니다.

## 보안

- `.env`, Supabase Secret/service role 키, DB 비밀번호를 커밋하지 않습니다.
- Supabase service role 키는 Google Apps Script의 스크립트 속성에만 저장합니다.
- 실제 회원 명단과 마일리지 데이터는 저장소에 포함하지 않습니다.
