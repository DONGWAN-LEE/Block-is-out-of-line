# Block is Out of Line

NestJS + TypeScript 기반 캐주얼 모바일 게임 백엔드 서버 + Next.js 관리자 패널.

역방향 벽돌깨기 게임. 공이 중력으로 떨어져 벽돌을 깨고 튕겨 올라가며, 상단에서 공의 방향을 조절하여 발사한다. 아래에서 벽돌이 계속 생성되어 올라온다. 가챠 시스템으로 공 이펙트/스킨을 획득할 수 있다.

## Tech Stack

### Backend (`packages/server`)

| 구성요소 | 기술 |
|---------|------|
| Framework | NestJS 11 + TypeScript |
| Database | PostgreSQL 15+ |
| Cache | Redis 7+ |
| ORM | TypeORM |
| Auth | JWT (Access + Refresh Token) |
| API Docs | Swagger/OpenAPI (`/docs`) |
| Test | Jest + @nestjs/testing + supertest |

### Admin Panel (`packages/admin`)

| 구성요소 | 기술 |
|---------|------|
| Framework | Next.js 15 (App Router) |
| UI | TailwindCSS + shadcn/ui |
| Auth | NextAuth v5 (Google OAuth) |
| State | TanStack Query + TanStack Table |
| Charts | Recharts |

### Client

| 구성요소 | 기술 |
|---------|------|
| Engine | Unity (C#) |
| Protocol | REST API |

## Monorepo Structure

```
block-of-out-line/
├── packages/
│   ├── server/                 # NestJS 게임 백엔드 (38 endpoints)
│   │   ├── src/
│   │   │   ├── auth/           # 인증 (게스트/소셜 로그인, JWT)
│   │   │   ├── player/         # 플레이어 프로필
│   │   │   ├── reward/         # 보상 (출석, 최초 로그인 보너스)
│   │   │   ├── coupon/         # 쿠폰 (공용/개인)
│   │   │   ├── payment/        # IAP 영수증 검증 (Google/Apple/Toss)
│   │   │   ├── currency/       # 재화 시스템 (원장 기반)
│   │   │   ├── admin/          # 관리자 API (Google Auth)
│   │   │   ├── common/         # 공통 (응답 래퍼, 필터, 가드)
│   │   │   └── database/       # 마이그레이션
│   │   └── package.json
│   └── admin/                  # Next.js 관리자 패널 (8 pages)
│       ├── app/
│       │   ├── (admin)/        # 대시보드, 플레이어, 보상, 쿠폰, 상품, 결제
│       │   ├── auth/           # Google 로그인
│       │   └── api/auth/       # NextAuth 핸들러
│       ├── components/
│       │   ├── ui/             # shadcn/ui 컴포넌트
│       │   └── layout/         # 사이드바, 헤더
│       └── package.json
├── package.json                # npm workspaces root
└── .claude/                    # game-harness 설정
    ├── game-config.yaml
    └── CLAUDE.md
```

## Game API Endpoints (20)

### Auth (`/api/v1/auth`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/guest` | 게스트 로그인 (Device UUID) | - |
| POST | `/social` | 소셜 로그인 (Google/Facebook/Naver) | - |
| POST | `/refresh` | 토큰 갱신 | - |
| POST | `/logout` | 로그아웃 | JWT |
| POST | `/link` | 게스트 → 소셜 계정 연동 | JWT |

### Player (`/api/v1/player`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/me` | 내 프로필 + 재화 조회 | JWT |
| PATCH | `/me` | 프로필 수정 (닉네임) | JWT |

### Reward (`/api/v1/reward`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/attendance` | 출석 현황 (누적일, 다음 보상) | JWT |
| POST | `/attendance/claim` | 오늘 출석 체크 | JWT |
| GET | `/first-login` | 최초 보너스 수령 여부 | JWT |
| POST | `/first-login/claim` | 최초 보너스 수령 | JWT |

### Coupon (`/api/v1/coupon`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/redeem` | 쿠폰 사용 (공용/개인) | JWT |

### Payment (`/api/v1/payment`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/verify` | IAP 영수증 검증 + 상품 지급 | JWT |
| GET | `/products` | 상품 목록 | JWT |
| GET | `/history` | 구매 내역 | JWT |

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/` | Health check | - |

## Admin API Endpoints (20)

### Admin Auth (`/api/v1/admin/auth`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/google` | 관리자 Google 로그인 | - |
| GET | `/me` | 현재 관리자 정보 | Admin JWT |

### Admin Management (`/api/v1/admin`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | KPI (DAU, 매출, 신규가입, 출석률) |
| GET | `/players` | 플레이어 목록 (검색/페이지네이션) |
| GET | `/players/:id` | 플레이어 상세 + 재화 + 활동 |
| POST | `/players/:id/ban` | 플레이어 밴 |
| POST | `/players/:id/unban` | 밴 해제 |
| POST | `/players/:id/currency` | 재화 조정 (사유 필수) |
| GET/POST/PATCH/DELETE | `/rewards` | 보상 설정 CRUD |
| GET/POST/PATCH/DELETE | `/coupons` | 쿠폰 CRUD |
| GET | `/coupons/:id/redemptions` | 쿠폰 사용 내역 |
| GET/POST/PATCH | `/products` | 상품 CRUD |
| GET | `/payments` | 결제 내역 (필터/검색) |
| GET | `/payments/:id` | 결제 상세 |

## Admin Panel Pages (8)

| Page | Route | Features |
|------|-------|----------|
| 로그인 | `/auth/signin` | Google OAuth |
| 대시보드 | `/` | KPI 카드 4개 + 추이 차트 2개 |
| 플레이어 | `/players` | 검색 테이블, 밴/언밴 |
| 플레이어 상세 | `/players/[id]` | 프로필/재화/활동 탭 |
| 보상 설정 | `/rewards` | CRUD 테이블 + 다이얼로그 |
| 쿠폰 | `/coupons` | CRUD + 사용 통계 |
| 상품 | `/products` | 상품 카탈로그 CRUD |
| 결제 내역 | `/payments` | 필터 + 상세 다이얼로그 |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Setup

```bash
# 의존성 설치 (root에서 전체 워크스페이스)
npm install

# 환경 변수 설정
cp packages/server/.env.example packages/server/.env
cp packages/admin/.env.local.example packages/admin/.env.local

# DB 생성
createdb block_out_line

# 마이그레이션 실행
npm run -w packages/server typeorm migration:run -- -d src/data-source.ts
```

### Development

```bash
# 백엔드 (port 4000)
npm run dev:server

# 관리자 패널 (port 3000)
npm run dev:admin

# 전체 빌드
npm run build
```

### API Documentation

서버 기동 후 Swagger UI:
```
http://localhost:4000/docs
```

36개 전체 엔드포인트의 Request/Response 스키마, 인증 방식, 에러 코드가 문서화되어 있다.

## Environment Variables

### Backend (`packages/server/.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=block_out_line

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ADMIN_JWT_SECRET=your-admin-jwt-secret
ADMIN_JWT_EXPIRY=8h

# OAuth
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
NAVER_CLIENT_ID=

# IAP
GOOGLE_PLAY_PACKAGE_NAME=com.dongwanlee.blockoutline
APPLE_SHARED_SECRET=
TOSS_GAME_API_KEY=
```

### Admin Panel (`packages/admin/.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Response Format

모든 API 응답은 동일한 형식을 사용한다:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials"
  }
}
```

## Architecture

- **Monorepo**: npm workspaces (`packages/server` + `packages/admin`)
- **Backend**: Controller → Service → Repository → Entity 레이어 패턴
- **Auth**: 게임 클라이언트(JWT) + 관리자(별도 Admin JWT) 이중 인증
- **Currency**: 모든 재화 변경은 DB 트랜잭션 + 원장(ledger) 기록
- **Security**: 서버 권한 원칙 (모든 게임 로직 서버 실행), CSPRNG 기반 가챠
- **IAP**: Google Play + Apple App Store + Toss Game 영수증 서버 검증 (멱등성 보장)
- **Admin**: Google OAuth 기반 복수 관리자 지원, DB 등록제

## Scripts

```bash
npm run dev:server        # 백엔드 개발 서버 (watch mode, port 4000)
npm run dev:admin         # 관리자 패널 개발 서버 (port 3000)
npm run build             # 전체 빌드
npm run build:server      # 백엔드만 빌드
npm run build:admin       # 관리자 패널만 빌드
npm run test:server       # 백엔드 테스트
```

## License

Private - DONGWAN-LEE
