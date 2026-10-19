# CLAUDE.md

이 레포에서 작업하는 에이전트(Claude Code 등)가 항상 먼저 읽는 안내. 사람도 같은 규칙을 따른다.

## 이 레포

Team4 웹 프론트엔드. 과제 10 "제조 설비 이상정보 기반 원인·대응정보 생성 Agent"의 화면을 만든다.
React 19 + TypeScript 7 + Vite 8, npm workspaces 모노레포.

| 경로 | 내용 |
| --- | --- |
| `apps/tech` | 정비자 앱 (개발 서버 5181) |
| `apps/lead` | 파트장 앱 (개발 서버 5182) |
| `apps/dashboard` | 설비 이상 현황 대시보드, Mock 데이터 (5173) |
| `packages/ui` | 공통 컴포넌트, API 클라이언트, 화면 스타일 |
| `api/openapi.json` | 백엔드 API 명세 사본 |
| `docs/specs/` | 무엇을 만드는지: 화면별 기능 명세 |
| `docs/decisions/` | 왜 그렇게 했는지: 결정 기록 |
| `CHANGELOG.md` | 무엇이 바뀌었는지: 업데이트 기록 |

## 일하는 순서: 문서 먼저

우리는 코드를 직접 짜기보다 에이전트에게 맡겨 만든다. 그래서 "무엇을 만들지"를 문서로 정확히 적는 것이 코드보다 중요하다.

1. **명세부터 고친다.** 화면이나 기능을 추가·변경하기 전에 `docs/specs/`의 해당 문서를 먼저 고친다. 명세에 없는 기능은 만들지 않는다. 요청이 명세와 다르면 명세를 바꿀지 먼저 묻는다.
2. **선택지가 있으면 결정 기록을 남긴다.** 라이브러리, 구조, 화면 흐름, API 연동 방식처럼 나중에 "왜 이렇게 했지?"가 나올 결정은 `docs/decisions/_template.md`를 복사해 후보 비교와 고른 이유를 적는다. 결정을 바꿀 때는 기존 파일을 지우지 않고 새 기록을 만든 뒤 기존 기록의 상태를 `대체됨(→ NNNN)`으로 바꾼다.
3. **구현한다.** 명세와 결정 기록에 맞춰 코드를 바꾼다.
4. **확인한다.** 아래 확인 명령을 모두 통과해야 끝난 것이다. 확인하지 않은 작업을 끝났다고 보고하지 않는다.
5. **기록한다.** `CHANGELOG.md`의 `Unreleased`에 한 줄을 추가하고, 명세의 "할 일·미정"을 갱신한다.

문서는 이 레포의 프론트엔드 설계와 구현만 다룬다.

## 명령

```bash
npm install             # 처음 한 번 (Node 20 이상)
npm run dev:tech        # 정비자 앱
npm run dev:lead        # 파트장 앱
npm run dev:dashboard   # 대시보드
```

확인 명령 (작업을 마치기 전에 모두 통과):

```bash
npm test                # 화면 테스트, 백엔드 없이 fixture로 동작
npm run typecheck
npm run build
npm run lint            # oxlint (대시보드)
```

백엔드에 붙여 보는 방법은 `README.md`의 "백엔드에 붙여서 테스트하기"를 따른다. 개발 서버는 `/api`를 `API_TARGET`(기본: 정비자 `127.0.0.1:8081`, 파트장 `127.0.0.1:8082`)으로 넘긴다.

## 코드 규칙

- **API**
  - 타입은 `api/openapi.json`에서 생성한다(`npm run api:types`). `packages/ui/src/api/schema.d.ts`는 손으로 고치지 않는다.
  - 화면은 API가 준 값만 보여 준다. 화면 안에서 원인 순위나 판정 같은 값을 만들어 내지 않는다.
- **앱 구분**
  - 백엔드는 `X-App` 헤더(`tech` / `lead`)와 세션 쿠키(`tech_session` / `lead_session`)로 두 앱을 구분한다.
  - 앱끼리 서로 import하지 않는다. 공통 코드는 `packages/ui`에 둔다.
- **디자인**
  - 화면 배치(위치·크기·간격·격자·화면 틀)는 `packages/ui/src/styles/guide-a.css`, `direction-guide.css`, `past-adjust.css`가 정한다. 따로 요청이 없으면 배치는 바꾸지 않는다.
  - 색·테두리·모서리·글꼴은 `packages/ui/src/styles/theme.css`에서만 바꾼다. 근거는 [0003](docs/decisions/0003-디자인-변경-범위를-색·테두리·글꼴로-한정.md).
  - 대시보드 색 토큰(`apps/dashboard/src/styles/base.css`)과 값을 맞춘다.
- **테스트**
  - 화면 동작을 바꾸면 같은 폴더의 `*.test.tsx`도 함께 고친다.
  - 테스트를 건너뛰거나 지워서 통과시키지 않는다.

## Git

- 커밋, 푸시, 머지, rebase, `reset --hard`는 사용자에게 먼저 확인받는다.
- 작업은 기능 브랜치에서 하고, `main`에는 PR로 합친다. PR 설명에 관련 명세, 결정 기록, CHANGELOG 항목을 링크한다.
- 다른 팀원의 레포(Team4-backend, Team4-ml 등)는 승인 없이 고치지 않는다. 그 레포의 로컬 코드가 최신이라고 가정하지 않는다.
- 개인 메모 파일은 커밋하지 않는다.
