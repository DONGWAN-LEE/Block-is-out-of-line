# Block is Out of Line - Game Backend Server

NestJS + TypeScript 기반 캐주얼 모바일 게임 백엔드 서버.

역방향 벽돌깨기 게임. 공이 중력으로 떨어져 벽돌을 깨고 튕겨 올라가며, 상단에서 공의 방향만 조절하여 발사한다. 아래에서 벽돌이 계속 생성되어 올라온다.

## Tech Stack

| 구성요소 | 기술 |
|---------|------|
| Framework | NestJS 11 + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| ORM | TypeORM |
| Auth | JWT (Access + Refresh Token) |
| Test | Jest + @nestjs/testing + supertest |
| Client | Unity (C#) via REST API |

## Project Structure

```
src/
├── auth/           # 인증 (게스트/소셜 로그인, JWT, 계정 연동)
├── player/         # 플레이어 프로필
├── reward/         # 보상 (출석, 최초 로그인 보너스)
├── coupon/         # 쿠폰 (공용/개인)
├── payment/        # 결제 영수증 검증 (Google/Apple/Toss Game)
├── currency/       # 재화 시스템 (원장 기반)
├── common/         # 공통 (응답 래퍼, 필터, 인터셉터, 가드)
└── database/       # 마이그레이션
```

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/guest` | 게스트 로그인 (Device UUID) | - |
| POST | `/social` | 소셜 로그인 (Google/Facebook/Naver) | - |
| POST | `/refresh` | 토큰 갱신 | - |
| POST | `/logout` | 로그아웃 | JWT |
| POST | `/link` | 게스트→소셜 계정 연동 | JWT |

### Player (`/api/v1/player`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/me` | 내 프로필 조회 | JWT |
| PATCH | `/me` | 프로필 수정 | JWT |

### Reward (`/api/v1/reward`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/attendance` | 출석 현황 조회 | JWT |
| POST | `/attendance/claim` | 오늘 출석 체크 | JWT |
| GET | `/first-login` | 최초 보너스 수령 여부 | JWT |
| POST | `/first-login/claim` | 최초 보너스 수령 | JWT |

### Coupon (`/api/v1/coupon`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/redeem` | 쿠폰 사용 | JWT |

### Payment (`/api/v1/payment`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/verify` | 영수증 검증 + 상품 지급 | JWT |
| GET | `/products` | 상품 목록 | JWT |
| GET | `/history` | 구매 내역 | JWT |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Setup

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 DB, Redis, JWT, OAuth 설정 수정

# DB 생성
createdb block_out_line

# 마이그레이션 실행
npm run typeorm migration:run -- -d src/data-source.ts

# 개발 서버 실행
npm run start:dev
```

### Environment Variables

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

# OAuth (Google, Facebook, Naver)
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
NAVER_CLIENT_ID=

# IAP (Google Play, Apple, Toss Game)
GOOGLE_PLAY_PACKAGE_NAME=com.dongwanlee.blockoutline
APPLE_SHARED_SECRET=
TOSS_GAME_API_KEY=
```

### Scripts

```bash
npm run start:dev     # 개발 서버 (watch mode)
npm run build         # 프로덕션 빌드
npm run start:prod    # 프로덕션 실행
npm run test          # 단위 테스트
npm run test:e2e      # E2E 테스트
npm run lint          # ESLint
```

## Response Format

모든 API 응답은 동일한 형식을 사용합니다:

```json
// 성공
{
  "success": true,
  "data": { ... },
  "error": null
}

// 실패
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

- **Controller → Service → Repository → Entity** 레이어 패턴
- 모든 재화 변경은 **DB 트랜잭션 + 원장(ledger) 기록**
- 서버 권한 원칙: 모든 게임 로직은 서버에서 실행
- 가챠 결과는 **CSPRNG**로 서버에서 결정
- IAP 영수증은 **서버에서 검증** (멱등성 보장)

## License

Private - DONGWAN-LEE
