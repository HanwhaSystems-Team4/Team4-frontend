# Changelog

이 레포의 업데이트 기록. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따른다.
분류: 추가 / 변경 / 수정 / 제거 / 문서

## [Unreleased]

### 변경
- 정비자·파트장 앱의 화면 배치를 원래대로 되돌림(고정 크기 화면 틀, 위치·크기·간격). 디자인 변경은 색·테두리·글꼴만 `theme.css`에 남김 → [0003](docs/decisions/0003-디자인-변경-범위를-색·테두리·글꼴로-한정.md)

### 문서
- `CLAUDE.md` 추가: 문서 먼저 쓰고 구현하는 작업 순서, 확인 명령, 코드·디자인·Git 규칙
- 기능 명세 `docs/specs/` 추가: 정비자 앱, 파트장 앱, 대시보드의 화면별 기능과 쓰는 API, 할 일·미정

## [0.2.0] - 2026-10-16

### 추가
- 정비자 앱 `apps/tech`: 알람 → 진단(원인 후보 순위, 비슷한 과거 기록, 다음 점검과 고른 이유) → 잠금·사전 확인 → 매뉴얼 점검 지시·결과 입력 → 조치·재가동 → 파트장 호출·숙련자 인계 → 보고서
- 파트장 앱 `apps/lead`: 승인 대기·보고서 검토, 처리할 호출, 권한 등급, 감사 기록
- 공통 패키지 `packages/ui`, API 명세 사본 `api/openapi.json`, 타입 생성 도구 `tools/api-types`
- 개발 서버 프록시: `/api`를 백엔드로 넘기고 앱별 `X-App` 헤더를 붙임. `API_TARGET`으로 대상 변경
- 루트 명령: `dev:tech` · `dev:lead` · `dev:dashboard` · `test` · `typecheck` · `build` · `lint` · `api:types`

### 변경
- npm workspaces 모노레포로 구성. 기존 로그인·대시보드는 `apps/dashboard`로 이동 → [0001](docs/decisions/0001-프론트엔드-모노레포-구성.md)
- 정비자·파트장 앱 디자인을 대시보드 디자인 언어로 통일: Pretendard, 주황 강조, 검정 주 버튼, zinc 중립색 → [0002](docs/decisions/0002-정비-화면-디자인-통일.md)
- TypeScript 7로 통일

### 문서
- 문서 체계: `docs/README.md`, 결정 기록 템플릿, 이 CHANGELOG
- README에 실행·테스트 방법, 백엔드 연결 방법 정리

## [0.1.0] - 2026-10-14

### 추가
- React 19 + TypeScript + Vite 프로젝트 구성, react-router-dom 라우팅, oxlint
- 로그인 화면 (Mock 인증)
- 대시보드: KPI 카드, 고장 유형 탭, 일별 이상 발생 차트, 설비 상태 목록, 최근 이상 이벤트 표
- Mock API 클라이언트 (`VITE_USE_MOCK=false`이면 fetch), AI4I 2020 기준 Mock 데이터
