# PO OS

개인 PO 업무 운영을 위한 Next.js + Supabase 기반 MVP입니다. 기존 `po-os.html`의 localStorage 앱을 Supabase Auth와 Postgres 저장 구조로 전환했습니다.

## 주요 기능

- Supabase Magic Link 로그인
- 로그인 사용자별 데이터 격리
- Dashboard: 진행 필요 업무, 마감 임박, 대기/블로커, 월간 완료, KPI 차트
- Tasks: 칸반 보드, 업무 추가/수정/삭제, 상태 변경, 검색, 프로젝트/우선순위 필터
- Supabase migration: profiles, projects, tasks, decisions, meetings, RLS 정책
- Reports / GPT Assistant builder 함수 분리
- Vercel 배포 가능한 Next.js App Router 구조

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## Supabase 설정

1. Supabase 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/migrations/0001_init_po_os.sql` 내용을 실행합니다.
3. Authentication > Providers에서 Email 로그인을 활성화합니다.
4. Authentication > URL Configuration에 로컬/배포 URL을 등록합니다.

## 환경변수

`.env.local`을 만들고 아래 값을 채웁니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Vercel에도 동일한 환경변수를 등록합니다.

## Vercel 배포

```bash
npm install
npm run lint
npm run build
```

빌드가 통과하면 Vercel에서 이 폴더를 프로젝트 루트로 지정하고 배포합니다.

## 기존 JSON 백업

기존 `po-os.html` 백업 구조는 다음 형태였습니다.

```json
{
  "version": 1,
  "owner": "사용자",
  "tasks": [],
  "projects": [],
  "decisions": [],
  "meetings": []
}
```

Settings의 DB import/export는 2차 확장 범위로 남겨두었습니다. 검증 스키마는 `lib/validators.ts`에 준비되어 있습니다.

## 다음 확장 순서

1. Roadmap CRUD
2. Decision Log CRUD
3. Meetings CRUD
4. Reports 화면 연결
5. GPT Assistant 프롬프트 생성 화면 연결
6. Backup / Import / Export
