# Block is Out of Line — 프로젝트 규칙

## 프로젝트 개요

역방향 벽돌깨기 캐주얼 모바일 게임의 백엔드 서버.
- 공이 중력으로 떨어져 벽돌을 깨고 튕겨 올라감
- 상단에서 공의 방향만 조절하여 발사
- 아래에서 벽돌이 계속 생성되어 올라옴
- 가챠: 공 이펙트/스킨

## 기술 스택

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Redis (캐시)
- **ORM**: TypeORM
- **Auth**: JWT (Access + Refresh Token)
- **Test**: Jest + @nestjs/testing + supertest
- **Client**: Unity (C#) — REST API 통신

## 개발 규칙

### 아키텍처
- Feature-based 모듈 구조: `src/{feature}/` (auth, game, player, gacha, shop, ranking 등)
- 레이어 패턴: Controller → Service → Repository → Entity
- 레이어 건너뛰기 금지 (Controller에서 직접 Repository 호출 X)

### API
- 엔드포인트: `/api/v1/{resource}` (복수 명사)
- 응답 형식: `{ "success": boolean, "data": T | null, "error": ErrorDto | null }`
- 에러 코드: `{DOMAIN}_{SEQ}` (AUTH_001, GACHA_002 등)

### 보안
- 서버 권한 원칙: 모든 게임 로직은 서버에서 실행, 클라이언트는 표시만
- 모든 재화 변경은 DB 트랜잭션 + 원장 기록
- 가챠 결과는 서버에서 CSPRNG로 결정

### 테스트
- 단위 테스트: `*.spec.ts` (서비스 로직)
- E2E 테스트: `*.e2e-spec.ts` (API 엔드포인트)
- 서비스 커버리지 70% 이상 목표

## game-harness 사용

이 프로젝트는 `/game-harness` 스킬을 사용하여 개발합니다.
- 설정: `.claude/game-config.yaml`
- 사용법: `/game-harness "작업 설명"`
- 모니터링: `/game-harness monitor --backend`
