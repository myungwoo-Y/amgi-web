좋아요! 아래는 **Next.js 15 + Auth.js(구글 로그인만) + Neon(Postgres) + Prisma + React Query + Zustand + Tailwind + shadcn/ui + Framer Motion**으로 만드는 **플래시카드 웹앱(MVP)** 기획서 업데이트안입니다.
(다크모드는 초기 미적용, 설계만 포함)

# 1) 목표 / 콘셉트

- **내가 매일 쓰는 초경량 플래시카드 웹앱**
- 첫 화면엔 **구글 로그인 버튼만** 노출 → 로그인 후 최소 흐름(덱 목록 → 카드 학습) 제공
- 포트폴리오 포인트: **Next 15 App Router + Auth.js + Prisma + Neon + 클라이언트 상태(React Query/Zustand) 아키텍처**를 깔끔히 보여주기

---

# 2) 기능 범위 (MVP)

## A. 인증

- **구글 로그인만** 지원 (Auth.js / NextAuth with Prisma Adapter)
- 로그인 성공 시 `/app` 대시보드로 이동

## B. 학습 기본 흐름

- 덱(Deck) 목록 보기 / 생성 / 삭제
- 카드(Card) 생성(앞면/뒷면 텍스트) / 수정 / 삭제
- 학습 세션: **“오늘 할당된 카드” 순서대로** 보여주고, “기억남/애매함/기억안남(3버튼)”로 기록
- 간단한 스케줄링: `ease` 기반의 매우 단순한 다음 복습일 계산(추후 FSRS로 확장 가능)

## C. 마이페이지(후순위)

- 일일 학습량/연속 학습일 수(스reak) 간단 표기

---

# 3) 화면/경로 (Next.js 15 App Router)

- `/` (Landing): 로고, 한 줄 소개, **“Sign in with Google”** 버튼만
- `/app` (Dashboard): 내 덱 리스트, “새 덱 추가” 버튼
- `/app/decks/[deckId]`: 덱 상세(카드 목록, 카드 추가/편집)
- `/app/study/[deckId]`: 학습 화면(카드 앞/뒤 전환, 3가지 평가 버튼)
- `/app/profile` (옵션): 계정/간단 통계

---

# 4) UI/상태/애니메이션 가이드

- **shadcn/ui** 컴포넌트 사용(Button, Card, Input, Dialog 등)
- **React Query**: 서버 데이터(덱/카드/세션/리뷰) 페칭 & 캐싱
- **Zustand**: 로컬 학습 진행 상태(현재 카드 인덱스, 앞/뒤면 토글 등)와 UI 스낵바/모달
- **Framer Motion**: 카드 앞/뒤 flip, 다음 카드 넘어갈 때 살짝 슬라이드/Fade

---

# 5) 아키텍처 개요

- **DB**: Neon(Postgres)
- **ORM**: Prisma (migrate, seed 포함)
- **Auth**: Auth.js + PrismaAdapter
- **API 레이어**: App Router의 `route.ts` (REST 스타일)

  - `POST /api/decks` (생성), `GET /api/decks` (목록)
  - `POST /api/cards`, `GET /api/cards?deckId=...`, `PATCH/DELETE /api/cards/[id]`
  - `POST /api/study/start` (세션 시작), `POST /api/study/grade` (평가 기록)

- **권한**: 서버 핸들러에서 `getServerSession()`으로 사용자 확인 + `userId` 스코핑

---

# 6) 환경 변수(.env)

```
DATABASE_URL="postgresql://USER:PASS@HOST:PORT/DB?sslmode=require"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="(openssl rand -base64 32)"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

# 7) Prisma 스키마 (Auth.js + 앱 도메인)

아래는 **Auth.js 공식 Prisma 모델**(users/accounts/sessions/verificationTokens) + **플래시카드 도메인**(Deck, Card, StudySession, ReviewLog)의 minimal 설계입니다.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// ---- Auth.js (NextAuth) 기본 테이블 ----
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // App domain relations
  decks         Deck[]
  studySessions StudySession[]
  reviewLogs    ReviewLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  // For PKCE / OIDC:
  oauth_token_secret String?
  oauth_token        String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

/// ---- 플래시카드 도메인 ----
model Deck {
  id        String   @id @default(cuid())
  userId    String
  title     String
  // optional: description, isPublic, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards  Card[]
}

model Card {
  id        String   @id @default(cuid())
  deckId    String
  front     String   // 앞면 텍스트
  back      String   // 뒷면 텍스트
  hint      String?  // 선택
  // 간단 스케줄링용 파라미터 (MVP)
  ease      Float    @default(2.5) // 2.3~2.7 초기값 권장
  interval  Int      @default(0)   // 일(day)
  dueDate   DateTime?             // 다음 복습일

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  reviewLogs ReviewLog[]
}

model StudySession {
  id        String   @id @default(cuid())
  userId    String
  deckId    String
  startedAt DateTime @default(now())
  endedAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  reviewLogs ReviewLog[]
}

enum Grade {
  AGAIN     // 기억안남
  HARD      // 애매함
  GOOD      // 기억남
}

model ReviewLog {
  id            String       @id @default(cuid())
  userId        String
  deckId        String
  cardId        String
  studySessionId String?
  reviewedAt    DateTime     @default(now())
  grade         Grade
  // 스케줄링 계산에 참고하기 위한 스냅샷
  prevEase      Float?
  prevInterval  Int?
  nextEase      Float?
  nextInterval  Int?
  nextDueDate   DateTime?

  user  User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  deck  Deck         @relation(fields: [deckId], references: [id], onDelete: Cascade)
  card  Card         @relation(fields: [cardId], references: [id], onDelete: Cascade)
  session StudySession? @relation(fields: [studySessionId], references: [id])
}
```

> 참고: Auth.js의 **PrismaAdapter**를 쓰면 위 Auth 모델을 그대로 사용하면 되고, `npx prisma migrate dev`로 마이그레이션합니다.

---

# 8) 서버 로직(간단 스케줄러)

- 평가(Grade)에 따른 **초간단 알고리즘**(MVP):

  - AGAIN: `ease = max(1.3, ease - 0.3)`, `interval = 1`, `dueDate = today + 1d`
  - HARD: `ease = max(1.3, ease - 0.15)`, `interval = max(1, round(interval * 1.2))`
  - GOOD: `ease = ease + 0.05`, `interval = max(1, round(interval * ease))`
  - `nextDueDate = today + interval`

- 이후 FSRS로 교체할 수 있도록 **서비스 레이어 분리** (`packages/scheduling/` 등) 권장

---

# 9) 클라이언트 구조(예시)

```
app/
  (public)/
    page.tsx                 // Landing: 구글 로그인 버튼만
  app/
    layout.tsx               // 세션 바인딩
    page.tsx                 // Dashboard (덱 목록)
    decks/[deckId]/page.tsx  // 덱 상세/카드 CRUD
    study/[deckId]/page.tsx  // 학습 화면
  api/
    decks/route.ts
    cards/route.ts
    study/start/route.ts
    study/grade/route.ts
lib/
  auth.ts                    // Auth.js config (GoogleProvider)
  prisma.ts                  // Prisma Client
  scheduling.ts              // 스케줄링 로직
  validators.ts              // zod 등
store/
  useStudyStore.ts           // Zustand (로컬 학습 상태)
```

---

# 10) 인증(Auth.js) 구성 포인트

- **구글만 사용**: `GoogleProvider({ clientId, clientSecret })`
- **adapter**: `PrismaAdapter(prisma)`
- **session strategy**: 기본 JWT 또는 DB 세션 택1 (MVP는 JWT 간단)
- **callback**: `signIn`에서 도메인 제한/화이트리스트 등은 초기엔 없음
- Landing에서 `<SignInButton provider="google" />`만 노출

---

# 11) shadcn/ui 컴포넌트 예시 (Landing)

- `Button` + 구글 아이콘 + `onClick={() => signIn('google')}`
- Hero 섹션은 생략하고 미니멀하게: 로고, 한 줄 설명, 버튼 하나

---

# 12) 개발 순서 제안(빠른 완성용)

1. **Auth.js + PrismaAdapter + Neon 연결** → 구글 로그인만 성공
2. `/app` 보호 라우팅 + 덱 목록 API/화면
3. 카드 CRUD + 간단 학습 화면
4. 리뷰 로직(grade → next schedule) 반영
5. React Query 캐싱/무한스크롤(옵션) & Zustand로 학습 로컬상태 정리
6. Framer Motion으로 카드 Flip/전환 애니메이션
7. 테스트 데이터 seed

---

# 13) Seed 스크립트(요약)

- `prisma/seed.ts`에서:

  - 테스트 유저 1명(이메일 dummy)
  - 덱 2개 + 카드 10~20장 생성
  - 일부 카드는 `dueDate` 오늘/과거로 설정 → 로그인 후 바로 학습 가능

---

# 14) 배포/운영

- **DB**: Neon 무료 티어
- **웹**: Vercel Hobby
- **보안**: .env에 비밀키 저장, Vercel 환경변수 셋팅
- **로그**: Vercel 로그 + 간단 서버 로깅 (pino 등 선택)
- **백업(선택)**: Vercel Cron(무료 1~2개 한도)으로 매일 `GET /api/export` 호출해 S3/Drive로 덤프(후순위)

---

필요하면 **초기 페이지의 간단 와이어프레임(SVG)** 도 바로 만들어 드릴게요.
다음 단계로, 제가 **Auth.js 설정 파일 템플릿**과 **핵심 API 라우트 초안**까지 붙여드릴까요? (구글 버튼만 나오는 랜딩 포함)
