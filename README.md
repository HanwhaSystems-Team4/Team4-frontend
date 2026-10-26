# Team4 Frontend

과제 10. 제조 설비 이상정보 기반 원인·대응정보 생성 Agent의 웹 프론트엔드.

React 19 + TypeScript + Vite, npm workspaces 모노레포.

## 구성

| 경로 | 내용 | 개발 서버 |
| --- | --- | --- |
| `apps/tech` | 정비자 앱. 알람 → 진단(원인 후보 순위·비슷한 과거 기록) → 잠금 → 매뉴얼 점검 → 조치·재가동 → 보고서 | http://localhost:5181 |
| `apps/lead` | 파트장 앱. 보고서 승인, 호출 응답, 매뉴얼 절별 권한 등급, 감사 기록 | http://localhost:5182 |
| `apps/dashboard` | 설비 이상 현황 대시보드 (Mock 데이터) | http://localhost:5173 |
| `packages/ui` | 두 앱 공통 컴포넌트, API 클라이언트, 화면 스타일 `styles/` | — |
| `api/openapi.json` | 백엔드 API 명세 사본. 프론트 타입의 기준 | — |
| `tools/api-types` | `api/openapi.json` → `packages/ui/src/api/schema.d.ts` 타입 생성 | — |

세 앱은 같은 디자인 언어(흰 바탕, 회색 중립색, 주황 강조, 검정 주 버튼, Pretendard)를 쓴다.

## 처음 한 번

Node 20 이상.

```bash
npm install
```

## 명령

```bash
npm run dev:tech        # 정비자 앱
npm run dev:lead        # 파트장 앱
npm run dev:dashboard   # 대시보드

npm test                # 정비자·파트장 앱 화면 테스트 (백엔드 없이 fixture로 동작)
npm run typecheck       # 전체 타입 검사
npm run build           # 세 앱 빌드
npm run lint            # oxlint (대시보드)
npm run api:types       # api/openapi.json이 바뀌면 타입 다시 생성
```

## 백엔드에 붙여서 테스트하기

정비자·파트장 앱은 실제 API가 있어야 화면이 채워진다. 개발 서버는 `/api` 요청을 백엔드로 넘기고, 앱마다 `X-App` 헤더(`tech` / `lead`)를 붙인다.

1. 백엔드 스택을 띄운다 ([c1a15-maint-guide](https://github.com/Join-su/c1a15-maint-guide)의 `docker compose up -d --build --wait web`). nginx가 `127.0.0.1:8081`(정비자) · `:8082`(파트장)에 열린다.
2. 이 레포에서 `npm run dev:tech`, `npm run dev:lead`를 각각 실행한다. 기본 연결 대상이 위 두 포트라 따로 설정할 것이 없다.
3. 테스트 알람을 만든다 (백엔드 레포 폴더에서):
   ```bash
   docker compose exec api python -m c1a15.alarms DEMO-01
   ```
   `--list`로 시나리오 목록(DEMO-01 ~ DEMO-10)을 볼 수 있다.
4. 로그인: 정비자 `tech.kim`, 파트장 `lead.park`. 비밀번호는 백엔드 `.env`의 `C1A15_TECH_PASSWORD` · `C1A15_LEAD_PASSWORD`.

API 서버(uvicorn, 8000)에 바로 붙이려면 연결 대상을 바꾼다.

```bash
# macOS / Linux / Git Bash
API_TARGET=http://127.0.0.1:8000 npm run dev:tech
# Windows PowerShell
$env:API_TARGET="http://127.0.0.1:8000"; npm run dev:tech
```

## A/B 테스트(디자인 후보 비교)

루트의 `AB테스트_실행.bat`을 더블클릭하면 백엔드(옆 폴더 `c1a15-maint-guide`) → 정비자 · 파트장 화면(A/B 모드) → 브라우저가 차례로 켜진다.
화면 위 막대에서 A 현재 버전 · B 현장 터치형 · C 업무 도구형 · D 플로팅 벤토형을 바꿔 본다. 탭마다 따로 기억하고 주소 `?v=b`로도 고를 수 있다.

- 막대 오른쪽 **E 조장님 원본**: 백엔드 레포(c1a15-maint-guide)를 그대로 빌드해 nginx가 띄운 원래 화면을 새 탭으로 연다(정비자 `127.0.0.1:8081`, 파트장 `:8082`, 따로 로그인)
- `AB테스트_알람만들기.bat`: 테스트 알람 만들기(DEMO-01 ~ 10)
- `AB테스트_종료.bat`: 화면 끄기(백엔드는 물어보고 멈춤)
- 백엔드 없이 화면만 비교: `http://localhost:5181/preview.html`, `http://localhost:5182/preview.html`
- 후보와 바꾼 이유 · 레퍼런스: [0004](docs/decisions/0004-AB-테스트용-디자인-후보-3개.md)

## 디자인 수정

- 화면 배치(위치·크기·간격·격자)는 `packages/ui/src/styles/guide-a.css` · `direction-guide.css` · `past-adjust.css`가 정한다.
- 색·테두리·글꼴은 그 뒤에 불러오는 `packages/ui/src/styles/theme.css`에서 바꾼다. 배치는 이 파일에서 건드리지 않는다.
- 대시보드 토큰은 `apps/dashboard/src/styles/base.css`. 두 쪽 색 값을 같게 유지한다.

## 문서

에이전트로 작업할 때의 규칙은 `CLAUDE.md`에 있다.

- `docs/specs/` 기능 명세 (무엇을 만드는지)
- `docs/decisions/` 결정 기록 (후보 비교와 고른 이유)
- `CHANGELOG.md` 업데이트 기록
