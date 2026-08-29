# SHIFT Website

SHIFT 동아리 공식 웹사이트. React + Vite + Supabase로 구성되며, Google Sheets의 회원·마일리지 데이터를 Apps Script로 Supabase에 동기화합니다.

## 시작하기

```bash
git clone https://github.com/dhc-shift/shift-website.git
cd shift-website
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

`.env`에 Supabase 프로젝트의 공개 값 두 개를 입력합니다. 값은 운영진에게 받으세요.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

`.env`는 Git에 올라가지 않습니다. `service_role` 키와 데이터베이스 비밀번호는 절대 `.env`, 소스 코드, 메신저에 공유하지 마세요.

## 프로젝트 구조

```
src/
├── main.jsx            앱 조립 + 라우팅 + 데이터 로딩 (App)
├── supabase.js         Supabase 클라이언트
├── data.js             정적 콘텐츠 (활동 카드, 아카이브, 메뉴 등)
├── styles.css          전체 스타일
├── components/
│   ├── Header.jsx      상단 내비게이션
│   ├── Footer.jsx      푸터
│   └── ui.jsx          공용 소품 (Badge, Button, PageHero 등)
└── pages/              페이지별 컴포넌트 (파일 1개 = 페이지 1개)
    ├── Home.jsx  About.jsx  Activities.jsx  Archive.jsx
    ├── Board.jsx  More.jsx  Contact.jsx
    ├── MyPage.jsx  LoginPage.jsx (+비밀번호 재설정)
    └── Admin.jsx       관리자 페이지 (콘텐츠 관리)
supabase/               DB 마이그레이션 SQL (001→006 순서 실행)
google-apps-script/     Google Sheets → Supabase 동기화 (원본은 시트의 Apps Script)
vercel.json             SPA 라우팅용 rewrite 설정
```

## 라우팅

react-router 기반. 페이지 추가 시:
1. `src/pages/`에 컴포넌트 생성
2. `src/main.jsx`의 `<Routes>`에 `<Route>` 추가
3. 메뉴에 넣으려면 `src/data.js`의 `navItems`에 추가

## 인증·보안 구조 (중요)

- **회원가입**: Google Sheets '인원 관리' 시트에 등록된 이메일만 가입 가능 (DB 트리거 `enforce_member_signup`, `006_signup_member_gate.sql`)
- **관리자**: `profiles.role = 'admin'`. 관리자 페이지 → 회원 권한 탭에서 부여/해제
- **비밀번호 재설정**: 로그인 화면 "비밀번호를 잊으셨나요?" → 이메일 링크 → `/reset`
- **익명 건의**: 부원에게는 익명이지만 운영진 화면에는 이름이 표시됨 (제출 화면에 명시되어 있음)

## Google Sheets 동기화

- 시트 수정 → 5분 주기 트리거가 Supabase에 반영 → 웹은 새로고침 시 표시
- 트리거 설치: 시트 → 확장 프로그램 → Apps Script → `installShiftSyncTrigger` 1회 실행
- 안전장치: '인원 관리' 시트가 비어 있으면 동기화가 중단됩니다 (전체 삭제 방지)
- `google-apps-script/ShiftSupabaseSync.gs`는 백업본입니다. **수정하면 시트의 Apps Script에도 직접 붙여넣어야 반영됩니다**
- Apps Script 스크립트 속성에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 필요

## 새 Supabase 프로젝트를 만들 때

SQL Editor에서 순서대로 실행: `setup.sql` → `002` → `003` → `004` → `005` → `006`.
그 후 첫 관리자로 회원가입하고 `promote-first-admin.example.sql`의 이메일을 바꿔 실행합니다.

## 협업 규칙

1. **작업 전 반드시 `git pull`**
2. 기능 단위로 커밋, 메시지는 한 줄 요약
3. 같은 파일을 동시에 크게 수정하지 않도록 작업 범위를 먼저 공유
4. `npm run build`가 통과하는 상태로만 push
5. 비밀키·회원 명단·마일리지 원본 데이터는 저장소에 올리지 않기

## 배포

Vercel 연결 (예정). 환경 변수 2개(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)를 Vercel 프로젝트 설정에 등록하고, 도메인 연결 후 Supabase → Authentication → URL Configuration에 배포 도메인을 추가해야 비밀번호 재설정 링크가 정상 작동합니다.
