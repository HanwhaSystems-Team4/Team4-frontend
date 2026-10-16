# front

과제 10. 제조 설비 이상정보 기반 원인·대응정보 생성 Agent의 웹 프론트엔드.

React 19 + TypeScript + Vite, 라우팅은 react-router-dom.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입 체크 + 프로덕션 빌드
npm run lint     # oxlint
```

개발용 임시 계정: `hanwha0902` / `hanwha0902` (Mock 인증, 백엔드 인증 API 연동 시 제거)

## 화면

| 경로 | 내용 |
| --- | --- |
| `/login` | 로그인 |
| `/dashboard` | 대시보드 (KPI, 고장 유형 탭, 일별 이상 발생 차트, 설비 상태, 최근 이상 이벤트) |

로그인하지 않은 상태로 다른 경로에 들어가면 `/login`으로 이동한다.

## 구조

```
src/
  api/
    types.ts        API 응답 타입 (백엔드와 맞출 기준)
    client.ts       API 호출. 기본은 Mock, VITE_USE_MOCK=false 면 fetch
    mock.ts         Mock 데이터 (설비·센서 값은 UCI AI4I 2020 기준)
  auth/             로그인 상태(AuthContext), 접근 보호(RequireAuth)
  components/
    layout/         사이드바 레이아웃
    dashboard/      KPI, 탭, 차트, 설비 목록, 이벤트 표
  constants/        고장 유형·상태 라벨과 색
  pages/            LoginPage, DashboardPage
  styles/           base(디자인 토큰), login, dashboard
```

## 백엔드 연동

`.env.local`에 다음을 두면 Mock 대신 실제 API를 호출한다.

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api
```

프론트가 기대하는 API (가정, 미확정):

- `POST /auth/login` → `LoginResponse`
- `GET /dashboard?days=14` → `DashboardResponse`

필드 구성은 `src/api/types.ts`를 참고한다.
